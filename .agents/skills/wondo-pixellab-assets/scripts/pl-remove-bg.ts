#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
import {
  b64ToFile,
  extractFirstImage,
  imgToB64,
  parseFlags,
  postSync,
  readPngSize,
  requireFlag,
  requireToken,
} from "./pl-poll.ts";

function usage(): never {
  console.error(`Usage:
  pl-remove-bg.ts --in <path.png> --out <path.png>
                  [--task simple|complex]
                  [--text "<foreground hint>"]
                  [--seed <n>]

Wraps POST /remove-background. Sync (HTTP 200, no polling). Strips the
background from a PNG and writes a transparent-PNG result.

Used as the post-process step after pixen for cast / places / items so each
reference asset ships transparent for clean compositing into the cover and
scenes (Phase 4 / Phase 5).

Reads PIXELLAB_TOKEN from env.`);
  process.exit(2);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) usage();

  const flags = parseFlags(argv);
  const inPath = requireFlag(flags, "in");
  const outPath = requireFlag(flags, "out");
  const taskArg = flags.string.task ?? "simple";
  const text = flags.string.text;
  const seedStr = flags.string.seed;

  if (taskArg !== "simple" && taskArg !== "complex") {
    console.error(`--task must be 'simple' or 'complex' (got '${taskArg}')`);
    process.exit(2);
  }
  const backgroundRemovalTask =
    taskArg === "complex" ? "remove_complex_background" : "remove_simple_background";

  const token = requireToken();
  const size = readPngSize(inPath);

  const body: Record<string, unknown> = {
    image: { base64: imgToB64(inPath) },
    image_size: size,
    background_removal_task: backgroundRemovalTask,
  };
  if (text) body.text = text;
  if (seedStr) body.seed = parseInt(seedStr, 10);

  console.error(
    `[pl-remove-bg] POST /remove-background  in=${inPath} (${size.width}x${size.height}) ` +
      `task=${backgroundRemovalTask}`,
  );

  const result = await postSync("/remove-background", body, token);
  const b64 = extractFirstImage(result);
  b64ToFile(b64, outPath);
  const actual = readPngSize(outPath);
  if (actual.width !== size.width || actual.height !== size.height) {
    throw new Error(
      `Size mismatch: input ${size.width}x${size.height}, output ${actual.width}x${actual.height}.`,
    );
  }
  console.error(`[pl-remove-bg] wrote ${outPath}`);
  console.log(outPath);
}

main().catch((err) => {
  console.error(`[pl-remove-bg] ${err.message ?? err}`);
  process.exit(1);
});
