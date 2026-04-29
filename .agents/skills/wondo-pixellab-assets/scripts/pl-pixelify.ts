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
  pl-pixelify.ts --in <path.png> --out <path.png>
                 [--in-width <auto>] [--in-height <auto>]
                 [--out-width 192] [--out-height 192]
                 [--text-guidance <n>] [--seed <n>]

Wraps POST /image-to-pixelart (synchronous; HTTP 200 with image data).
Converts a non-pixel-art input image (photo, sketch, AI render) to pixel art.
Side-tool: not part of the main 7-phase pipeline. Useful when an author
hands over reference imagery they want pixelified before Phase 1 ideation.

Constraints: input ≤ 1280, output ≤ 320. Defaults read input dimensions
from the source PNG and emit 192x192 output.

Reads PIXELLAB_TOKEN from env.`);
  process.exit(2);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) usage();

  const flags = parseFlags(argv, []);
  const input = requireFlag(flags, "in");
  const out = requireFlag(flags, "out");

  const inDims = readPngSize(input);
  const inW = parseInt(flags.string["in-width"] ?? String(inDims.width), 10);
  const inH = parseInt(flags.string["in-height"] ?? String(inDims.height), 10);
  const outW = parseInt(flags.string["out-width"] ?? "192", 10);
  const outH = parseInt(flags.string["out-height"] ?? "192", 10);

  if (outW > 320 || outH > 320) {
    console.error(`pl-pixelify: max output is 320x320 (requested ${outW}x${outH}).`);
    process.exit(2);
  }

  const token = requireToken();

  const body: Record<string, unknown> = {
    image: { type: "base64", base64: imgToB64(input), format: "png" },
    image_size: { width: inW, height: inH },
    output_size: { width: outW, height: outH },
  };
  if (flags.string["text-guidance"]) {
    body.text_guidance_scale = parseFloat(flags.string["text-guidance"]);
  }
  if (flags.string.seed) body.seed = parseInt(flags.string.seed, 10);

  console.error(
    `[pl-pixelify] POST /image-to-pixelart  ${inW}x${inH} -> ${outW}x${outH}`,
  );

  const result = await postSync("/image-to-pixelart", body, token);
  const b64 = extractFirstImage(result);
  b64ToFile(b64, out);
  const actual = readPngSize(out);
  if (actual.width !== outW || actual.height !== outH) {
    throw new Error(
      `Size mismatch: requested ${outW}x${outH}, got ${actual.width}x${actual.height}.`,
    );
  }
  console.error(`[pl-pixelify] wrote ${out}`);
  console.log(out);
}

main().catch((err) => {
  console.error(`[pl-pixelify] ${err.message ?? err}`);
  process.exit(1);
});
