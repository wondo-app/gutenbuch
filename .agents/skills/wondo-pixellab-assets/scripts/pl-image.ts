#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
import { existsSync, mkdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import {
  b64ToFile,
  extractFirstImage,
  imgToB64,
  parseFlags,
  pollJob,
  postJob,
  readPngSize,
  requireFlag,
  requireToken,
  scalePngToFile,
} from "./pl-poll.ts";

async function ensureRefAtSize(
  refPath: string,
  canvasW: number,
  canvasH: number,
): Promise<string> {
  const dims = readPngSize(refPath);
  if (dims.width === canvasW && dims.height === canvasH) return refPath;
  const cacheDir = join(dirname(refPath), ".cache");
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
  const stem = basename(refPath).replace(/\.png$/i, "");
  const cached = join(cacheDir, `${stem}.scaled-${canvasW}x${canvasH}.png`);
  if (!existsSync(cached)) {
    await scalePngToFile(refPath, cached, canvasW, canvasH);
    console.error(
      `[pl-image] pre-scaled ref ${dims.width}x${dims.height} -> ${canvasW}x${canvasH}: ${cached}`,
    );
  } else {
    console.error(`[pl-image] reused cached scaled ref: ${cached}`);
  }
  return cached;
}

function usage(): never {
  console.error(`Usage:
  pl-image.ts --prompt "<text>" --out <path.png>
              [--width 512] [--height 512]
              [--style <path.png>]
              [--refs <path1.png,path2.png,...>]   (max 4)
              [--seed <n>]
              [--no-bg]

Wraps POST /generate-image-v2. Used for the COVER (Phase 1) and SCENES (Phase 4).
- Phase 1: omit --style and --refs.
- Phase 4: pass --style <APPROVED cover> and --refs <character/object portraits>.
Reads PIXELLAB_TOKEN from env.`);
  process.exit(2);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) usage();

  const flags = parseFlags(argv, ["no-bg"]);
  const prompt = requireFlag(flags, "prompt");
  const out = requireFlag(flags, "out");
  const width = parseInt(flags.string.width ?? "512", 10);
  const height = parseInt(flags.string.height ?? "512", 10);
  const stylePath = flags.string.style;
  const refsArg = flags.string.refs;
  const seedStr = flags.string.seed;
  const noBg = flags.bool["no-bg"];

  const token = requireToken();

  const body: Record<string, unknown> = {
    description: prompt,
    image_size: { width, height },
    style_options: {
      color_palette: true,
      outline: true,
      detail: true,
      shading: true,
    },
  };
  body.no_background = noBg;
  if (seedStr) body.seed = parseInt(seedStr, 10);

  if (stylePath) {
    body.style_image = {
      image: { base64: imgToB64(stylePath) },
      size: readPngSize(stylePath),
    };
  }

  if (refsArg) {
    const paths = refsArg
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (paths.length > 4) {
      console.error(
        `--refs has ${paths.length} paths but the API caps at 4. Drop the least-important.`,
      );
      process.exit(2);
    }
    const usePaths: string[] = [];
    for (const p of paths) {
      usePaths.push(await ensureRefAtSize(p, width, height));
    }
    body.reference_images = usePaths.map((p) => ({
      image: { base64: imgToB64(p) },
      size: readPngSize(p),
    }));
  }

  console.error(
    `[pl-image] POST /generate-image-v2  size=${width}x${height} ` +
      `style=${stylePath ? "yes" : "no"} refs=${refsArg ? refsArg.split(",").length : 0} ` +
      `no_bg=${noBg ? "yes" : "no"} seed=${seedStr ?? "auto"}`,
  );

  const { jobId } = await postJob("/generate-image-v2", body, token);
  console.error(`[pl-image] job_id=${jobId}; polling…`);
  const result = await pollJob(jobId, token);
  const b64 = extractFirstImage(result);
  b64ToFile(b64, out);
  const actual = readPngSize(out);
  if (actual.width !== width || actual.height !== height) {
    throw new Error(
      `Size mismatch: requested ${width}x${height}, got ${actual.width}x${actual.height}. ` +
        `The API silently rescaled. Delete ${out} and either edit the brief to use a supported size ` +
        `or pass an explicit --width/--height that the API will honor.`,
    );
  }
  console.error(`[pl-image] wrote ${out}`);
  console.log(out);
}

main().catch((err) => {
  console.error(`[pl-image] ${err.message ?? err}`);
  process.exit(1);
});
