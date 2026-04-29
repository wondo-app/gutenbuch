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
              [--width 176] [--height 176]
              [--style <path.png>]
              (repeat) --ref <path.png> --ref-use "<usage description>"
              [--seed <n>]
              [--no-bg]

Wraps POST /generate-image-v2. Used for the COVER (Phase 4) and SCENES (Phase 5).
Each --ref must be paired with a --ref-use; the parser pairs them by index, so
the order of --ref and --ref-use flags must match. Hard-capped at 4 refs (API limit).

Each --ref-use describes how that reference should be used, e.g.:
  --ref ray.png       --ref-use "use this person as Ray"
  --ref study.png     --ref-use "use this place as the setting"
  --ref pipe.png      --ref-use "use this object"
  --ref cover.png     --ref-use "use this color palette"

Reads PIXELLAB_TOKEN from env.`);
  process.exit(2);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) usage();

  const flags = parseFlags(argv, ["no-bg"], ["ref", "ref-use"]);
  const prompt = requireFlag(flags, "prompt");
  const out = requireFlag(flags, "out");
  const width = parseInt(flags.string.width ?? "176", 10);
  const height = parseInt(flags.string.height ?? "176", 10);
  const stylePath = flags.string.style;
  const refPaths = flags.repeated.ref;
  const refUses = flags.repeated["ref-use"];
  const seedStr = flags.string.seed;
  const noBg = flags.bool["no-bg"];

  if (refPaths.length !== refUses.length) {
    console.error(
      `--ref count (${refPaths.length}) does not match --ref-use count (${refUses.length}). ` +
        `Each --ref must be paired with a --ref-use describing how to use it.`,
    );
    process.exit(2);
  }
  if (refPaths.length > 4) {
    console.error(
      `Got ${refPaths.length} refs but the API caps at 4. Drop the least-important.`,
    );
    process.exit(2);
  }

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

  if (refPaths.length > 0) {
    const refImages: Array<Record<string, unknown>> = [];
    for (let i = 0; i < refPaths.length; i++) {
      const scaled = await ensureRefAtSize(refPaths[i], width, height);
      refImages.push({
        image: { base64: imgToB64(scaled) },
        size: readPngSize(scaled),
        usage_description: refUses[i],
      });
    }
    body.reference_images = refImages;
  }

  console.error(
    `[pl-image] POST /generate-image-v2  size=${width}x${height} ` +
      `style=${stylePath ? "yes" : "no"} refs=${refPaths.length} ` +
      `no_bg=${noBg ? "yes" : "no"} seed=${seedStr ?? "auto"}`,
  );
  for (let i = 0; i < refPaths.length; i++) {
    console.error(`  ref ${i + 1}: ${refPaths[i]}  — ${refUses[i]}`);
  }

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
