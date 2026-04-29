import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";

export const API_BASE = "https://api.pixellab.ai/v2";

// requireSharp loads sharp from a per-skill cache, installing it on first run.
// Mirrors verify-ink.ts's inkjs bootstrap so neither skill needs a project-level
// package.json. Cache dir is overridable via WONDO_PIXELLAB_CACHE; defaults to
// ~/.cache/wondo-pixellab/. Sharp ships platform-specific prebuilts via npm
// install, so the install is large (~80 MB) but one-time.
let _sharp: unknown = null;
export function requireSharp(): unknown {
  if (_sharp) return _sharp;
  const cacheDir =
    process.env.WONDO_PIXELLAB_CACHE ?? join(homedir(), ".cache", "wondo-pixellab");
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

  const sharpDir = join(cacheDir, "node_modules", "sharp");
  if (!existsSync(sharpDir)) {
    console.error(`[pl-poll] installing sharp into ${cacheDir} (one-time, ~80 MB)`);
    const pkgJson = join(cacheDir, "package.json");
    if (!existsSync(pkgJson)) {
      try {
        execSync("npm init -y", { cwd: cacheDir, stdio: "ignore" });
      } catch {
        throw new Error(`pl-poll: npm init failed in ${cacheDir}`);
      }
    }
    try {
      execSync("npm install --silent sharp", { cwd: cacheDir, stdio: "inherit" });
    } catch {
      throw new Error(`pl-poll: npm install sharp failed in ${cacheDir}`);
    }
  }

  const requireFromCache = createRequire(join(cacheDir, "package.json"));
  const mod = requireFromCache("sharp") as unknown;
  // sharp's CommonJS export is the function itself; ESM-interop wrappers may
  // expose it under .default. Accept either.
  _sharp = (mod as { default?: unknown }).default ?? mod;
  return _sharp;
}

export function requireToken(): string {
  const token = process.env.PIXELLAB_TOKEN;
  if (!token) {
    console.error(
      "PIXELLAB_TOKEN is not set. Get one at https://pixellab.ai/account and export it before running.",
    );
    process.exit(2);
  }
  return token;
}

export function bearerHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function imgToB64(path: string): string {
  return readFileSync(path).toString("base64");
}

export function b64ToFile(b64: string, path: string): void {
  writeFileSync(path, Buffer.from(b64, "base64"));
}

export function readPngSize(path: string): { width: number; height: number } {
  const buf = readFileSync(path);
  if (buf.length < 24 || buf.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`Not a PNG: ${path}`);
  }
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

export async function scalePngToFile(
  srcPath: string,
  dstPath: string,
  targetW: number,
  targetH: number,
): Promise<void> {
  const sharp = requireSharp() as (input: string) => {
    resize: (
      w: number,
      h: number,
      opts: { kernel: string; fit: string },
    ) => { png: () => { toFile: (p: string) => Promise<unknown> } };
  };
  await sharp(srcPath)
    .resize(targetW, targetH, { kernel: "nearest", fit: "fill" })
    .png()
    .toFile(dstPath);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface JobResult {
  status: "completed" | "failed" | string;
  data?: unknown;
  error?: unknown;
}

export async function pollJob(jobId: string, token: string): Promise<JobResult> {
  const delays = [2000, 3000, 4000, 6000, 8000];
  let attempt = 0;
  while (true) {
    const res = await fetch(`${API_BASE}/background-jobs/${jobId}`, {
      headers: bearerHeaders(token),
    });
    if (res.status === 429) {
      const wait = delays[Math.min(attempt, delays.length - 1)] * 2;
      console.error(`[poll] 429 rate-limited; backing off ${wait}ms`);
      await sleep(wait);
      attempt++;
      continue;
    }
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Poll failed (${res.status}): ${body}`);
    }
    const json = (await res.json()) as JobResult;
    if (json.status === "completed") return json;
    if (json.status === "failed") {
      throw new Error(`Job failed: ${JSON.stringify(json.error ?? json)}`);
    }
    const wait = delays[Math.min(attempt, delays.length - 1)];
    await sleep(wait);
    attempt++;
  }
}

export async function postJob(
  endpoint: string,
  body: unknown,
  token: string,
): Promise<{ jobId: string }> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: bearerHeaders(token),
    body: JSON.stringify(body),
  });
  if (res.status === 429) {
    throw new Error("429 rate-limited at submit; reduce concurrency to 3-5 jobs.");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${endpoint} failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as {
    job_id?: string;
    jobId?: string;
    background_job_id?: string;
  };
  const jobId = json.job_id ?? json.jobId ?? json.background_job_id;
  if (!jobId) throw new Error(`No job_id in response: ${JSON.stringify(json)}`);
  return { jobId };
}

// postSync: POSTs to a synchronous endpoint that returns 200 with image data
// inline (no job_id, no polling). Used by /create-image-pixflux,
// /create-image-pixen, /create-image-bitforge, /image-to-pixelart.
export async function postSync(
  endpoint: string,
  body: unknown,
  token: string,
): Promise<unknown> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: bearerHeaders(token),
    body: JSON.stringify(body),
  });
  if (res.status === 429) {
    throw new Error("429 rate-limited at submit; reduce concurrency to 3-5 jobs.");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${endpoint} failed (${res.status}): ${text}`);
  }
  return res.json();
}

export function extractFirstImage(jobResult: unknown): string {
  const r = jobResult as {
    last_response?: {
      images?: Array<{ base64?: string }>;
      image?: { base64?: string };
    };
    data?: {
      images?: Array<{ base64?: string; image?: { base64?: string } }>;
      image?: { base64?: string };
      base64?: string;
    };
  };
  const b64 =
    r.last_response?.images?.[0]?.base64 ??
    r.last_response?.image?.base64 ??
    r.data?.images?.[0]?.base64 ??
    r.data?.images?.[0]?.image?.base64 ??
    r.data?.image?.base64 ??
    r.data?.base64;
  if (!b64) {
    throw new Error(`No image in job result: ${JSON.stringify(r).slice(0, 400)}`);
  }
  return b64;
}

export interface ParsedFlags {
  string: Record<string, string>;
  bool: Record<string, boolean>;
}

export function parseFlags(argv: string[], boolFlags: string[] = []): ParsedFlags {
  const string: Record<string, string> = {};
  const bool: Record<string, boolean> = {};
  for (const f of boolFlags) bool[f] = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    if (boolFlags.includes(key)) {
      bool[key] = true;
      continue;
    }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      throw new Error(`--${key} requires a value`);
    }
    string[key] = next;
    i++;
  }
  return { string, bool };
}

export function requireFlag(flags: ParsedFlags, key: string): string {
  const v = flags.string[key];
  if (!v) {
    console.error(`Missing required flag --${key}`);
    process.exit(2);
  }
  return v;
}
