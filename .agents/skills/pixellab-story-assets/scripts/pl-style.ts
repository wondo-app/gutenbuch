#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
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
} from "./pl-poll.ts";

function usage(): never {
  console.error(`Usage:
  pl-style.ts --prompt "<text>" --style <path.png> --out <path.png>
              [--width 256] [--height 256]
              [--style-description "<style suffix>"]
              [--seed <n>]
              [--no-bg]

Wraps POST /generate-with-style-v2. Used for CHARACTER PORTRAITS (Phase 2)
and OBJECTS (Phase 3). The --style PNG is the APPROVED cover from Phase 1.
Pass --no-bg so the asset composites cleanly into scenes.
Reads PIXELLAB_TOKEN from env.`);
  process.exit(2);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) usage();

  const flags = parseFlags(argv, ["no-bg"]);
  const prompt = requireFlag(flags, "prompt");
  const stylePath = requireFlag(flags, "style");
  const out = requireFlag(flags, "out");
  const width = parseInt(flags.string.width ?? "256", 10);
  const height = parseInt(flags.string.height ?? "256", 10);
  const styleDescription = flags.string["style-description"];
  const seedStr = flags.string.seed;
  const noBg = flags.bool["no-bg"];

  const token = requireToken();
  const styleSize = readPngSize(stylePath);

  const body: Record<string, unknown> = {
    description: prompt,
    image_size: { width, height },
    style_images: [
      {
        image: { type: "base64", base64: imgToB64(stylePath), format: "png" },
        width: styleSize.width,
        height: styleSize.height,
      },
    ],
  };
  if (styleDescription) body.style_description = styleDescription;
  if (noBg) body.no_background = true;
  if (seedStr) body.seed = parseInt(seedStr, 10);

  console.error(
    `[pl-style] POST /generate-with-style-v2  size=${width}x${height} ` +
      `style=${stylePath} (${styleSize.width}x${styleSize.height}) ` +
      `no_bg=${noBg ? "yes" : "no"} seed=${seedStr ?? "auto"}`,
  );

  const { jobId } = await postJob("/generate-with-style-v2", body, token);
  console.error(`[pl-style] job_id=${jobId}; polling…`);
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
  console.error(`[pl-style] wrote ${out}`);
  console.log(out);
}

main().catch((err) => {
  console.error(`[pl-style] ${err.message ?? err}`);
  process.exit(1);
});
