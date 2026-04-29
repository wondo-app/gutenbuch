#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
// verify-ink.ts — compile a Wondo .ink file and probe it with N random walks.
//
// Replaces the legacy verify_ink.sh. Compiles once with inkjs's in-process
// Compiler, then re-instantiates Story from compiled JSON for each of N
// walks (default 400) — the same probe Wondo's Insights simulator runs at
// publish time. Reports an ending-distribution table compared against the
// `// Endings (locked at Gate 3):` block in the source.
//
// Phases run in order; the runner short-circuits on the first gating
// failure so authors don't see static errors buried under 400 walk failures.

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, join, resolve as resolvePath } from "node:path";

// =====================================================================
// Types
// =====================================================================

type Severity = "error" | "warn" | "info";

interface Diagnostic {
  severity: Severity;
  message: string;
  line?: number;
}

interface StaticResult {
  knots: Set<string>;
  stitches: Set<string>;
  choiceCount: number;
  divertCount: number;
  diagnostics: Diagnostic[];
  hasError: boolean;
}

interface CompileResult {
  story: unknown;
  json: string;
  warnings: string[];
}

interface WalkResult {
  ok: boolean;
  steps: number;
  proseWords: number;
  terminal: string;
  reachedKnots: Set<string>;
  errorMessage?: string;
}

interface DistResult {
  endingCounts: Map<string, number>;
  knotReach: Map<string, number>;
  errorBuckets: Map<string, number>;
  runs: number;
}

interface EndingVerdict {
  name: string;
  count: number;
  pct: number;
  target: number | null;
  status: "ok" | "fail" | "warn-drift";
  message?: string;
}

interface KnotReachVerdict {
  name: string;
  pct: number;
  status: "ok" | "warn-low" | "fail-low";
}

// =====================================================================
// CLI
// =====================================================================

function usage(exitCode: number = 0): never {
  process.stderr.write(`Usage:
  verify-ink.ts <ink-file>
    [--runs <n>]            default 400
    [--seed <n>]            default = stable hash of (file mtime + size)
    [--max-steps <n>]       default 5000
    [--strict-reach]        gate on named knots reached <5%
    [--no-distribution]     skip the N-walk distribution phase
    [--no-static]           skip regex-based structural checks
    [--quiet]               only print one-line PASS/FAIL on stdout
    [--json]                emit full report as JSON on stdout
    [--cache-dir <path>]    override $WONDO_GAMEBOOK_CACHE / ~/.cache/wondo-gamebook
    [--seed-run <n>]        replay walk #n only (debug aid; implies --runs 1)
    [--help|-h]

Exits 0 on PASS; 1 on compile/runtime/static-error failure; 2 on
distribution-rubric failure; 64/66/69/70 on invocation problems.
`);
  process.exit(exitCode);
}

interface Flags {
  inkFile: string;
  runs: number;
  seed: number;
  maxSteps: number;
  strictReach: boolean;
  noDistribution: boolean;
  noStatic: boolean;
  quiet: boolean;
  json: boolean;
  cacheDir: string;
  seedRun: number | null;
}

function parseArgs(argv: string[]): Flags {
  if (argv.includes("--help") || argv.includes("-h")) usage(0);
  if (argv.length === 0) usage(64);

  let inkFile: string | null = null;
  let runs = 400;
  let seed: number | null = null;
  let maxSteps = 5000;
  let strictReach = false;
  let noDistribution = false;
  let noStatic = false;
  let quiet = false;
  let json = false;
  let cacheDir = process.env.WONDO_GAMEBOOK_CACHE ?? join(homedir(), ".cache", "wondo-gamebook");
  let seedRun: number | null = null;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) {
        process.stderr.write(`verify-ink: ${a} needs a value\n`);
        process.exit(64);
      }
      return v;
    };
    switch (a) {
      case "--runs": runs = parseInt(next(), 10); break;
      case "--seed": seed = parseInt(next(), 10); break;
      case "--max-steps": maxSteps = parseInt(next(), 10); break;
      case "--strict-reach": strictReach = true; break;
      case "--no-distribution": noDistribution = true; break;
      case "--no-static": noStatic = true; break;
      case "--quiet": quiet = true; break;
      case "--json": json = true; break;
      case "--cache-dir": cacheDir = next(); break;
      case "--seed-run": seedRun = parseInt(next(), 10); break;
      default:
        if (a.startsWith("--")) {
          process.stderr.write(`verify-ink: unknown flag ${a}\n`);
          process.exit(64);
        }
        if (inkFile === null) inkFile = a;
        else {
          process.stderr.write(`verify-ink: unexpected positional ${a}\n`);
          process.exit(64);
        }
    }
  }

  if (!inkFile) {
    process.stderr.write("verify-ink: missing <ink-file>\n");
    process.exit(64);
  }
  if (!existsSync(inkFile)) {
    process.stderr.write(`verify-ink: file not found: ${inkFile}\n`);
    process.exit(66);
  }

  if (seed === null) {
    const st = statSync(inkFile);
    seed = (Math.floor(st.mtimeMs) ^ st.size) >>> 0;
  }

  if (seedRun !== null) runs = 1;

  return {
    inkFile,
    runs,
    seed,
    maxSteps,
    strictReach,
    noDistribution,
    noStatic,
    quiet,
    json,
    cacheDir,
    seedRun,
  };
}

// =====================================================================
// PRNG (mulberry32) — seedable, no deps
// =====================================================================

function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deriveSeed(master: number, runIndex: number): number {
  return (Math.imul(master, 0x9e3779b1) + runIndex) | 0;
}

// =====================================================================
// inkjs bootstrap
// =====================================================================

interface InkJs {
  Compiler: new (source: string) => { Compile: () => InkStory };
  Story: new (json: string) => InkStory;
}

interface InkStory {
  canContinue: boolean;
  currentChoices: { text: string }[];
  currentTags: string[] | null;
  state: { currentPathString: string | null };
  hasError: boolean;
  currentErrors: string[];
  Continue(): string;
  ChooseChoiceIndex(idx: number): void;
  ToJson(): string;
}

// Tag prefix injected into every knot/stitch header so Continue()'s
// currentTags reveals which knot just ran. inkjs's currentPathString
// goes null at story end and skips knots when execution diverts inside
// a single Continue, so tags are the only reliable knot probe.
const PROBE_TAG_PREFIX = "__VERIFY_INK__:";

function ensureInkjs(cacheDir: string, quiet: boolean): InkJs {
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

  const inkjsDir = join(cacheDir, "node_modules", "inkjs");
  if (!existsSync(inkjsDir)) {
    if (!quiet) process.stderr.write(`[verify-ink] installing inkjs into ${cacheDir} (one-time, ~30 MB)\n`);
    const pkgJson = join(cacheDir, "package.json");
    if (!existsSync(pkgJson)) {
      try {
        execSync("npm init -y", { cwd: cacheDir, stdio: "ignore" });
      } catch {
        process.stderr.write(`verify-ink: npm init failed in ${cacheDir}\n`);
        process.exit(69);
      }
    }
    try {
      execSync("npm install --silent inkjs", { cwd: cacheDir, stdio: "inherit" });
    } catch {
      process.stderr.write(`verify-ink: npm install inkjs failed\n`);
      process.exit(69);
    }
  }

  const fullJs = join(inkjsDir, "dist", "ink-full.js");
  if (!existsSync(fullJs)) {
    process.stderr.write(`verify-ink: inkjs install incomplete (${fullJs} missing). Try: rm -rf '${cacheDir}'\n`);
    process.exit(70);
  }

  const requireFromCache = createRequire(join(cacheDir, "package.json"));
  const mod = requireFromCache("inkjs/full") as Partial<InkJs>;
  if (!mod.Compiler || !mod.Story) {
    process.stderr.write(`verify-ink: inkjs version mismatch — Compiler/Story not exported\n`);
    process.exit(70);
  }
  return mod as InkJs;
}

// =====================================================================
// INCLUDE resolution — read primary + every transitively-included .ink
// file relative to the primary file's directory. Returns a single source
// string with INCLUDE lines neutralized (replaced with comments) so inkjs's
// Compiler — which itself tries to load INCLUDEs — sees the content already
// inlined and skips a second load attempt.
// =====================================================================

function resolveIncludes(primaryPath: string): { source: string; files: string[] } {
  const visited = new Set<string>();
  const files: string[] = [];

  function read(absPath: string): string {
    const normalized = resolvePath(absPath);
    if (visited.has(normalized)) return "";
    visited.add(normalized);
    files.push(normalized);
    let body: string;
    try {
      body = readFileSync(normalized, "utf8");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      process.stderr.write(`verify-ink: cannot read INCLUDE target ${normalized}: ${msg}\n`);
      return "";
    }
    const baseDir = dirname(normalized);
    const includeRe = /^[ \t]*INCLUDE[ \t]+(.+?)[ \t]*$/gm;
    const out: string[] = [];
    let lastIdx = 0;
    let m: RegExpExecArray | null;
    while ((m = includeRe.exec(body)) !== null) {
      out.push(body.slice(lastIdx, m.index));
      const includedSource = read(resolvePath(baseDir, m[1].trim()));
      out.push(`// [resolved INCLUDE: ${m[1].trim()}]\n`);
      out.push(includedSource);
      out.push("\n");
      lastIdx = m.index + m[0].length;
    }
    out.push(body.slice(lastIdx));
    return out.join("");
  }

  const source = read(resolvePath(primaryPath));
  return { source, files };
}

// =====================================================================
// Static checks (regex on source) — run BEFORE compile
// =====================================================================

const RESERVED_DIVERTS = new Set(["END", "DONE"]);

function runStaticChecks(source: string): StaticResult {
  const knotMatches = [...source.matchAll(/^===\s*(\w+)\s*===/gm)];
  const stitchMatches = [...source.matchAll(/^=\s+(\w+)\s*$/gm)];
  const choiceMatches = [...source.matchAll(/^\s*[*+]\s/gm)];
  const divertMatches = [...source.matchAll(/->\s*([\w.]+)/g)];

  const knots = new Set(knotMatches.map((m) => m[1]));
  const stitches = new Set(stitchMatches.map((m) => m[1]));
  const allTargets = new Set([...knots, ...stitches]);
  const diagnostics: Diagnostic[] = [];

  // Dangling diverts → error
  const dangling = new Set<string>();
  for (const m of divertMatches) {
    const targetFull = m[1];
    if (!targetFull) continue;
    const head = targetFull.split(".")[0];
    if (RESERVED_DIVERTS.has(head)) continue;
    if (head === "->") continue;
    if (!allTargets.has(head)) dangling.add(head);
  }
  for (const t of dangling) {
    diagnostics.push({ severity: "error", message: `Dangling divert: -> ${t} (not declared as knot or stitch)` });
  }

  // Orphan knots → warn
  const referencedDivertHeads = new Set(divertMatches.map((m) => m[1].split(".")[0]));
  for (const k of knots) {
    if (k === "intro") continue;
    if (k === "start") continue;
    if (referencedDivertHeads.has(k)) continue;
    diagnostics.push({ severity: "warn", message: `Orphan knot: === ${k} === has no divert pointing to it` });
  }

  // Tilde with prose on the same line → warn
  // Use [ \t] (not \s) for inline-whitespace so the match cannot span a newline
  // into a legal `+ [Choice] -> target / \n    ~ var = expr` block.
  const tildeProse = [...source.matchAll(/^[^\n/]*\S+[ \t]+~[ \t]/gm)];
  for (const _m of tildeProse) {
    diagnostics.push({ severity: "warn", message: `Tilde directive appears mid-line; move to its own line so it isn't printed as prose` });
  }

  // Endings-block parseability check (warn-only on absence; error on malformed).
  // Tolerates any gate number — early skill versions placed endings at Gate 3,
  // later versions at Gate 4. The block content is what matters.
  const endingsHeader = /\/\/\s*Endings\s*\(locked\s*at\s*Gate\s*\d+\)/i;
  if (!endingsHeader.test(source)) {
    diagnostics.push({ severity: "warn", message: `No "// Endings (locked at Gate N):" comment block found — distribution will be informational only` });
  }

  const hasError = diagnostics.some((d) => d.severity === "error");
  return {
    knots,
    stitches,
    choiceCount: choiceMatches.length,
    divertCount: divertMatches.length,
    diagnostics,
    hasError,
  };
}

// =====================================================================
// Compile
// =====================================================================

function injectProbeTags(source: string): string {
  // After every `=== knot ===` header, insert `# __VERIFY_INK__:knot` on the
  // next line. After every `= stitch` line, insert `# __VERIFY_INK__:knot.stitch`
  // (we track the most recent knot to qualify the stitch).
  const lines = source.split("\n");
  const out: string[] = [];
  let currentKnot = "";
  for (const line of lines) {
    out.push(line);
    const knotM = line.match(/^===\s*(\w+)\s*===/);
    if (knotM) {
      currentKnot = knotM[1];
      out.push(`# ${PROBE_TAG_PREFIX}${currentKnot}`);
      continue;
    }
    const stitchM = line.match(/^=\s+(\w+)\s*$/);
    if (stitchM && currentKnot) {
      out.push(`# ${PROBE_TAG_PREFIX}${currentKnot}.${stitchM[1]}`);
    }
  }
  return out.join("\n");
}

function compile(source: string, ink: InkJs): CompileResult {
  const tagged = injectProbeTags(source);
  let story: InkStory;
  try {
    story = new ink.Compiler(tagged).Compile();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(`[verify-ink] COMPILE FAILED\n${msg}\n`);
    process.exit(1);
  }
  let json: string;
  try {
    json = story.ToJson();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(`[verify-ink] compiled but could not serialize: ${msg}\n`);
    process.exit(1);
  }
  return { story, json, warnings: [] };
}

// =====================================================================
// Walk
// =====================================================================

function classifyTerminal(lastKnot: string | null): string {
  if (!lastKnot) return "__terminal:unknown";
  if (lastKnot.startsWith("END_") || lastKnot === "END") return lastKnot;
  return `__terminal:${lastKnot}`;
}

function runWalk(json: string, ink: InkJs, seed: number, maxSteps: number): WalkResult {
  const rng = makeRng(seed);
  let story: InkStory;
  try {
    story = new ink.Story(json);
  } catch (e) {
    return {
      ok: false,
      steps: 0,
      proseWords: 0,
      terminal: "__error",
      reachedKnots: new Set(),
      errorMessage: e instanceof Error ? e.message : String(e),
    };
  }

  let prose = "";
  let steps = 0;
  let lastKnot: string | null = null;
  const reachedKnots = new Set<string>();

  const consumeTags = () => {
    const tags = story.currentTags ?? [];
    for (const t of tags) {
      if (!t.startsWith(PROBE_TAG_PREFIX)) continue;
      const fullName = t.slice(PROBE_TAG_PREFIX.length);
      const knot = fullName.split(".")[0];
      lastKnot = knot;
      reachedKnots.add(knot);
    }
  };

  try {
    while (story.canContinue || story.currentChoices.length > 0) {
      while (story.canContinue) {
        prose += story.Continue();
        consumeTags();
        if (++steps > maxSteps) {
          return {
            ok: false,
            steps,
            proseWords: countWords(prose),
            terminal: "__max-steps",
            reachedKnots,
            errorMessage: `exceeded ${maxSteps} continue steps`,
          };
        }
      }
      if (story.currentChoices.length === 0) break;
      const idx = Math.floor(rng() * story.currentChoices.length);
      story.ChooseChoiceIndex(idx);
      if (++steps > maxSteps) {
        return {
          ok: false,
          steps,
          proseWords: countWords(prose),
          terminal: "__max-steps",
          reachedKnots,
          errorMessage: `exceeded ${maxSteps} choice steps`,
        };
      }
    }
  } catch (e) {
    return {
      ok: false,
      steps,
      proseWords: countWords(prose),
      terminal: "__error",
      reachedKnots,
      errorMessage: e instanceof Error ? e.message : String(e),
    };
  }

  if (story.hasError) {
    return {
      ok: false,
      steps,
      proseWords: countWords(prose),
      terminal: "__error",
      reachedKnots,
      errorMessage: story.currentErrors.join("; "),
    };
  }

  return {
    ok: true,
    steps,
    proseWords: countWords(prose),
    terminal: classifyTerminal(lastKnot),
    reachedKnots,
  };
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// =====================================================================
// Distribution
// =====================================================================

function runDistribution(
  json: string,
  ink: InkJs,
  masterSeed: number,
  runs: number,
  maxSteps: number,
  knotsInSource: Set<string>,
  seedRunOverride: number | null,
  quiet: boolean,
): DistResult {
  const endingCounts = new Map<string, number>();
  const knotReachCounts = new Map<string, number>();
  const errorBuckets = new Map<string, number>();

  for (const k of knotsInSource) knotReachCounts.set(k, 0);

  const start = seedRunOverride ?? 0;
  const end = seedRunOverride !== null ? seedRunOverride + 1 : runs;
  const total = end - start;

  for (let i = start; i < end; i++) {
    const seed = deriveSeed(masterSeed, i);
    const r = runWalk(json, ink, seed, maxSteps);
    endingCounts.set(r.terminal, (endingCounts.get(r.terminal) ?? 0) + 1);
    if (!r.ok && r.errorMessage && r.terminal === "__error") {
      errorBuckets.set(r.errorMessage, (errorBuckets.get(r.errorMessage) ?? 0) + 1);
    }
    for (const k of r.reachedKnots) {
      if (knotReachCounts.has(k)) knotReachCounts.set(k, (knotReachCounts.get(k) ?? 0) + 1);
    }
    if (!quiet && total > 50 && i > 0 && i % 100 === 0) {
      process.stderr.write(`[verify-ink] distribution progress: ${i}/${total}\n`);
    }
  }

  return { endingCounts, knotReach: knotReachCounts, errorBuckets, runs: total };
}

// =====================================================================
// Gate 3 parsing
// =====================================================================

function parseGate3(source: string): Map<string, number> | null {
  // Tolerate any gate number — early skill versions placed endings at Gate 3,
  // later versions at Gate 4. The block content is what matters.
  const headerIdx = source.search(/\/\/\s*Endings\s*\(locked\s*at\s*Gate\s*\d+\)/i);
  if (headerIdx < 0) return null;

  const tail = source.slice(headerIdx).split("\n");
  const out = new Map<string, number>();
  // Skip the header line itself
  for (let i = 1; i < tail.length; i++) {
    const line = tail[i];
    if (!/^\s*\/\//.test(line)) break; // first non-comment line ends the block
    const m = line.match(/^\s*\/\/\s*(END_\w+)\s*[—\-–]+\s*target\s*(\d+(?:\.\d+)?)%/i);
    if (m) out.set(m[1], parseFloat(m[2]));
  }
  return out.size > 0 ? out : null;
}

// =====================================================================
// Verdicts
// =====================================================================

const HARD_LOWER_PCT = 1;
const HARD_UPPER_PCT = 60;
const DRIFT_TOLERANCE_PCT = 10;
const KNOT_REACH_FLOOR_PCT = 5;
const LOW_N_THRESHOLD = 100;

function endingVerdicts(
  dist: DistResult,
  gate3: Map<string, number> | null,
): { rows: EndingVerdict[]; fail: boolean } {
  const total = dist.runs;
  const rows: EndingVerdict[] = [];

  const declared = gate3 ?? new Map<string, number>();

  // 1. Declared endings — gate even if 0 count
  for (const [name, target] of declared) {
    const count = dist.endingCounts.get(name) ?? 0;
    const pct = total > 0 ? (100 * count) / total : 0;
    let status: EndingVerdict["status"] = "ok";
    let message: string | undefined;
    if (count === 0) {
      status = "fail";
      message = `declared ending never reached`;
    } else if (pct < HARD_LOWER_PCT) {
      status = "fail";
      message = `below ${HARD_LOWER_PCT}% floor`;
    } else if (pct > HARD_UPPER_PCT) {
      status = "fail";
      message = `above ${HARD_UPPER_PCT}% ceiling`;
    } else if (Math.abs(pct - target) > DRIFT_TOLERANCE_PCT) {
      status = "warn-drift";
      message = `${pct.toFixed(1)}% vs. target ${target}% (drift > ${DRIFT_TOLERANCE_PCT}pp)`;
    }
    rows.push({ name, count, pct, target, status, message });
  }

  // 2. Undeclared but observed terminal buckets — informational rows
  for (const [name, count] of dist.endingCounts) {
    if (declared.has(name)) continue;
    const pct = total > 0 ? (100 * count) / total : 0;
    rows.push({ name, count, pct, target: null, status: "ok" });
  }

  // Sort: failures first, then by count desc
  rows.sort((a, b) => {
    if (a.status === "fail" && b.status !== "fail") return -1;
    if (b.status === "fail" && a.status !== "fail") return 1;
    return b.count - a.count;
  });

  const fail = rows.some((r) => r.status === "fail");
  return { rows, fail };
}

function knotReachVerdicts(
  dist: DistResult,
  strictReach: boolean,
): { rows: KnotReachVerdict[]; fail: boolean } {
  const total = dist.runs;
  const rows: KnotReachVerdict[] = [];
  for (const [name, count] of dist.knotReach) {
    const pct = total > 0 ? (100 * count) / total : 0;
    let status: KnotReachVerdict["status"] = "ok";
    if (pct < KNOT_REACH_FLOOR_PCT) {
      status = strictReach ? "fail-low" : "warn-low";
    }
    rows.push({ name, pct, status });
  }
  rows.sort((a, b) => a.pct - b.pct);
  const fail = rows.some((r) => r.status === "fail-low");
  return { rows, fail };
}

// =====================================================================
// Reporter
// =====================================================================

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

function padLeft(s: string, n: number): string {
  return s.length >= n ? s : " ".repeat(n - s.length) + s;
}

interface Report {
  inkFile: string;
  runs: number;
  seed: string;
  staticCounts: { knots: number; stitches: number; choices: number; diverts: number };
  staticDiagnostics: Diagnostic[];
  smoke: { ok: boolean; terminal: string; steps: number; proseWords: number; error?: string };
  endings: EndingVerdict[];
  knotReach: KnotReachVerdict[];
  errorBuckets: { message: string; count: number }[];
  verdict: "pass" | "fail-static" | "fail-compile" | "fail-smoke" | "fail-distribution";
  warnings: number;
  exitCode: number;
}

function renderHuman(report: Report): string {
  const lines: string[] = [];
  lines.push(`verify-ink: ${report.inkFile}`);
  lines.push("");

  const sc = report.staticCounts;
  lines.push(`[ static ] knots=${sc.knots}  stitches=${sc.stitches}  choices=${sc.choices}  diverts=${sc.diverts}`);
  for (const d of report.staticDiagnostics) {
    const tag = d.severity === "error" ? "ERROR" : d.severity === "warn" ? "warn" : "info";
    lines.push(`           [${tag}] ${d.message}`);
  }
  if (report.staticDiagnostics.length === 0) lines.push("           OK");

  if (report.verdict === "fail-static") {
    lines.push("");
    lines.push(`Result: FAIL — static check`);
    return lines.join("\n");
  }

  lines.push(`[ compile ] OK`);

  if (!report.smoke.ok) {
    lines.push(`[ smoke ] FAIL — ${report.smoke.terminal}: ${report.smoke.error ?? "unknown"}`);
    lines.push("");
    lines.push(`Result: FAIL — smoke walk`);
    return lines.join("\n");
  }
  lines.push(`[ smoke ] OK — terminal ${report.smoke.terminal}, ${report.smoke.steps} steps, ${report.smoke.proseWords} prose words`);

  if (report.runs > 0) {
    lines.push("");
    lines.push(`[ distribution ] N=${report.runs} runs, seed=${report.seed}`);
    lines.push("");
    if (report.runs < LOW_N_THRESHOLD) {
      lines.push(`  (N < ${LOW_N_THRESHOLD}: distribution thresholds suppressed; informational only)`);
      lines.push("");
    }
    lines.push(`  ${pad("Ending", 28)}${padLeft("Count", 7)}  ${padLeft("Pct", 7)}  ${padLeft("Target", 7)}  Verdict`);
    for (const e of report.endings) {
      const target = e.target === null ? "—" : `${e.target}%`;
      const verdict =
        e.status === "fail" ? `FAIL — ${e.message}` :
        e.status === "warn-drift" ? `warn — ${e.message}` : "ok";
      lines.push(`  ${pad(e.name, 28)}${padLeft(String(e.count), 7)}  ${padLeft(e.pct.toFixed(1) + "%", 7)}  ${padLeft(target, 7)}  ${verdict}`);
    }

    if (report.knotReach.length > 0) {
      lines.push("");
      lines.push(`  Knot reach (named knots only)`);
      for (const k of report.knotReach) {
        if (k.status === "ok") continue;
        const tag = k.status === "fail-low" ? "FAIL" : "warn";
        lines.push(`  ${pad(k.name, 28)}${padLeft(k.pct.toFixed(1) + "%", 7)}   ${tag} — below ${KNOT_REACH_FLOOR_PCT}% reach floor`);
      }
      const allOk = report.knotReach.every((k) => k.status === "ok");
      if (allOk) lines.push(`  all named knots reached ≥${KNOT_REACH_FLOOR_PCT}% of runs`);
    }

    if (report.errorBuckets.length > 0) {
      lines.push("");
      lines.push(`  Errors during walks:`);
      for (const e of report.errorBuckets) {
        lines.push(`    [${e.count}×] ${e.message}`);
      }
    }
  }

  lines.push("");
  if (report.verdict === "pass") {
    const w = report.warnings;
    lines.push(`Result: PASS${w > 0 ? ` (with ${w} warning${w === 1 ? "" : "s"})` : ""}`);
  } else if (report.verdict === "fail-distribution") {
    lines.push(`Result: FAIL — distribution rubric`);
  } else {
    lines.push(`Result: FAIL — ${report.verdict}`);
  }
  return lines.join("\n");
}

// =====================================================================
// Main
// =====================================================================

function main() {
  const flags = parseArgs(process.argv.slice(2));
  const { source, files } = resolveIncludes(flags.inkFile);

  if (!flags.quiet) {
    process.stderr.write(`[verify-ink] ${flags.inkFile}\n`);
    if (files.length > 1) {
      process.stderr.write(`[verify-ink] resolved ${files.length} files (primary + ${files.length - 1} INCLUDE)\n`);
    }
  }

  // Phase 3: static checks
  let staticResult: StaticResult = {
    knots: new Set(),
    stitches: new Set(),
    choiceCount: 0,
    divertCount: 0,
    diagnostics: [],
    hasError: false,
  };
  if (!flags.noStatic) {
    staticResult = runStaticChecks(source);
    if (staticResult.hasError) {
      const report = buildStaticFailReport(flags, staticResult);
      emitReport(report, flags);
      process.exit(1);
    }
  }

  // Phase 2: bootstrap inkjs (deferred so static failures don't trigger npm install)
  const ink = ensureInkjs(flags.cacheDir, flags.quiet);

  // Phase 4: compile
  const { json } = compile(source, ink);

  // Phase 5: smoke walk
  const smoke = runWalk(json, ink, deriveSeed(flags.seed, 0xb007), flags.maxSteps);
  if (!smoke.ok) {
    const report = buildSmokeFailReport(flags, staticResult, smoke);
    emitReport(report, flags);
    process.exit(1);
  }

  // Phase 6: distribution
  let distFail = false;
  let endings: EndingVerdict[] = [];
  let knotRows: KnotReachVerdict[] = [];
  let errorBuckets: { message: string; count: number }[] = [];
  let actualRuns = 0;

  if (!flags.noDistribution && flags.runs > 0) {
    const dist = runDistribution(
      json,
      ink,
      flags.seed,
      flags.runs,
      flags.maxSteps,
      staticResult.knots,
      flags.seedRun,
      flags.quiet,
    );
    actualRuns = dist.runs;
    const gate3 = parseGate3(source);

    const e = endingVerdicts(dist, gate3);
    endings = e.rows;
    const k = knotReachVerdicts(dist, flags.strictReach);
    knotRows = k.rows;

    errorBuckets = [...dist.errorBuckets.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([message, count]) => ({ message, count }));

    if (actualRuns >= LOW_N_THRESHOLD) {
      if (e.fail || k.fail) distFail = true;
    }
  }

  const warnings =
    staticResult.diagnostics.filter((d) => d.severity === "warn").length +
    endings.filter((e) => e.status === "warn-drift").length +
    knotRows.filter((k) => k.status === "warn-low").length;

  const report: Report = {
    inkFile: flags.inkFile,
    runs: actualRuns,
    seed: `0x${(flags.seed >>> 0).toString(16)}`,
    staticCounts: {
      knots: staticResult.knots.size,
      stitches: staticResult.stitches.size,
      choices: staticResult.choiceCount,
      diverts: staticResult.divertCount,
    },
    staticDiagnostics: staticResult.diagnostics,
    smoke: {
      ok: smoke.ok,
      terminal: smoke.terminal,
      steps: smoke.steps,
      proseWords: smoke.proseWords,
      error: smoke.errorMessage,
    },
    endings,
    knotReach: knotRows,
    errorBuckets,
    verdict: distFail ? "fail-distribution" : "pass",
    warnings,
    exitCode: distFail ? 2 : 0,
  };

  emitReport(report, flags);
  process.exit(report.exitCode);
}

function buildStaticFailReport(flags: Flags, s: StaticResult): Report {
  return {
    inkFile: flags.inkFile,
    runs: 0,
    seed: `0x${(flags.seed >>> 0).toString(16)}`,
    staticCounts: {
      knots: s.knots.size,
      stitches: s.stitches.size,
      choices: s.choiceCount,
      diverts: s.divertCount,
    },
    staticDiagnostics: s.diagnostics,
    smoke: { ok: false, terminal: "__skipped", steps: 0, proseWords: 0 },
    endings: [],
    knotReach: [],
    errorBuckets: [],
    verdict: "fail-static",
    warnings: s.diagnostics.filter((d) => d.severity === "warn").length,
    exitCode: 1,
  };
}

function buildSmokeFailReport(flags: Flags, s: StaticResult, smoke: WalkResult): Report {
  return {
    inkFile: flags.inkFile,
    runs: 0,
    seed: `0x${(flags.seed >>> 0).toString(16)}`,
    staticCounts: {
      knots: s.knots.size,
      stitches: s.stitches.size,
      choices: s.choiceCount,
      diverts: s.divertCount,
    },
    staticDiagnostics: s.diagnostics,
    smoke: {
      ok: false,
      terminal: smoke.terminal,
      steps: smoke.steps,
      proseWords: smoke.proseWords,
      error: smoke.errorMessage,
    },
    endings: [],
    knotReach: [],
    errorBuckets: [],
    verdict: "fail-smoke",
    warnings: 0,
    exitCode: 1,
  };
}

function emitReport(report: Report, flags: Flags) {
  if (flags.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    return;
  }
  if (flags.quiet) {
    if (report.verdict === "pass") {
      process.stdout.write(`verify-ink: PASS\n`);
    } else {
      process.stdout.write(`verify-ink: FAIL — ${report.verdict}\n`);
    }
    return;
  }
  process.stdout.write(renderHuman(report) + "\n");
}

main();
