#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
import {
  b64ToFile,
  extractFirstImage,
  parseFlags,
  postSync,
  readPngSize,
  requireFlag,
  requireToken,
} from "./pl-poll.ts";

function usage(): never {
  console.error(`Usage:
  pl-pixen.ts --prompt "<text>" --out <path.png>
              [--width 192] [--height 192]
              [--seed <n>]
              [--no-bg]
              [--detail <hint>] [--outline <hint>] [--view <hint>] [--direction <hint>]

Wraps POST /create-image-pixen (synchronous; HTTP 200 with image data).
Pure text-to-pixel-art. Pixen has no init/style/color reference fields.
Largest sync model: max dimension 768. Used by Phase 1 (ideation) for
batch thumbnail generation. Reads PIXELLAB_TOKEN from env.`);
  process.exit(2);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) usage();

  const flags = parseFlags(argv, ["no-bg"]);
  const prompt = requireFlag(flags, "prompt");
  const out = requireFlag(flags, "out");
  const width = parseInt(flags.string.width ?? "192", 10);
  const height = parseInt(flags.string.height ?? "192", 10);
  const seedStr = flags.string.seed;
  const noBg = flags.bool["no-bg"];

  const token = requireToken();

  const body: Record<string, unknown> = {
    description: prompt,
    image_size: { width, height },
    no_background: noBg,
  };
  if (seedStr) body.seed = parseInt(seedStr, 10);
  if (flags.string.detail) body.detail = flags.string.detail;
  if (flags.string.outline) body.outline = flags.string.outline;
  if (flags.string.view) body.view = flags.string.view;
  if (flags.string.direction) body.direction = flags.string.direction;

  console.error(
    `[pl-pixen] POST /create-image-pixen  size=${width}x${height} ` +
      `no_bg=${noBg ? "yes" : "no"} seed=${seedStr ?? "auto"}`,
  );

  const result = await postSync("/create-image-pixen", body, token);
  const b64 = extractFirstImage(result);
  b64ToFile(b64, out);
  const actual = readPngSize(out);
  if (actual.width !== width || actual.height !== height) {
    throw new Error(
      `Size mismatch: requested ${width}x${height}, got ${actual.width}x${actual.height}.`,
    );
  }
  console.error(`[pl-pixen] wrote ${out}`);
  console.log(out);
}

main().catch((err) => {
  console.error(`[pl-pixen] ${err.message ?? err}`);
  process.exit(1);
});
