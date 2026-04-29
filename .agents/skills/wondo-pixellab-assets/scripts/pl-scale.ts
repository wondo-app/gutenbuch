#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { parseFlags, readPngSize, requireFlag, requireSharp } from "./pl-poll.ts";

type SharpFn = (input: string) => {
  resize: (
    w: number,
    h: number,
    opts: { kernel: string; fit?: string },
  ) => { png: () => { toFile: (p: string) => Promise<unknown> } };
};

function usage(): never {
  console.error(`Usage:
  pl-scale.ts --slug <story-slug> [--factor 3] [--input-dir <path>] [--force]

Walks stories/<slug>/assets/{01-cover,02-cast,03-objects,04-scenes}/*.png
(plus 00-ideation if present) and writes nearest-neighbor upscaled copies to
stories/<slug>/assets/05-3x/<same-subdir>/<same-filename>.png.

Nearest-neighbor: each input pixel becomes a factor x factor block of the same
color. No anti-aliasing, no resampling, no artifacts. Pixel art stays crisp.

Flags:
  --slug        Story slug. The script reads from
                stories/<slug>/assets/ unless --input-dir overrides.
  --factor      Integer scale factor. Default 3.
  --input-dir   Override input directory (defaults to stories/<slug>/assets).
                Output always goes to <input-dir>/05-3x/.
  --force       Overwrite files in 05-3x/ that already exist.
`);
  process.exit(2);
}

const PHASE_DIRS = ["01-cover", "02-cast", "03-objects", "04-scenes"] as const;

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes("--help")) usage();

  const flags = parseFlags(argv, ["force"]);
  const slug = requireFlag(flags, "slug");
  const factor = flags.string["factor"] ? parseInt(flags.string["factor"], 10) : 3;
  if (!Number.isInteger(factor) || factor < 2) {
    console.error(`--factor must be an integer >= 2 (got ${flags.string["factor"]})`);
    process.exit(2);
  }
  const force = flags.bool["force"];
  const inputDir = resolve(flags.string["input-dir"] ?? `stories/${slug}/assets`);

  if (!existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`);
    process.exit(2);
  }

  const sharp = requireSharp() as SharpFn;

  const outRoot = join(inputDir, "05-3x");

  let scaled = 0;
  let skipped = 0;
  let failed = 0;

  for (const phase of PHASE_DIRS) {
    const phaseIn = join(inputDir, phase);
    if (!existsSync(phaseIn)) continue;
    const phaseOut = join(outRoot, phase);
    mkdirSync(phaseOut, { recursive: true });

    const entries = readdirSync(phaseIn)
      .filter((n) => n.toLowerCase().endsWith(".png"))
      .sort();

    for (const name of entries) {
      const src = join(phaseIn, name);
      const dst = join(phaseOut, name);
      const rel = relative(inputDir, src);
      if (!statSync(src).isFile()) continue;

      if (existsSync(dst) && !force) {
        console.error(`[skip] ${rel} (exists)`);
        skipped++;
        continue;
      }

      try {
        const { width, height } = readPngSize(src);
        const targetW = width * factor;
        const targetH = height * factor;
        await sharp(src)
          .resize(targetW, targetH, { kernel: "nearest" })
          .png()
          .toFile(dst);
        console.error(`[wrote] ${relative(inputDir, dst)} (${width}x${height} -> ${targetW}x${targetH})`);
        scaled++;
      } catch (err) {
        console.error(`[fail] ${rel}: ${(err as Error).message}`);
        failed++;
      }
    }
  }

  console.error(
    `\nDone. scaled=${scaled} skipped=${skipped} failed=${failed} factor=${factor}x output=${relative(process.cwd(), outRoot)}`,
  );
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
