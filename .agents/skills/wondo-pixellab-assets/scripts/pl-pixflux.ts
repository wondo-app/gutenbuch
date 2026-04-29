#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
import { existsSync, mkdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import {
  b64ToFile,
  extractFirstImage,
  imgToB64,
  parseFlags,
  postSync,
  readPngSize,
  requireFlag,
  requireToken,
  scalePngToFile,
} from "./pl-poll.ts";

// Pixflux's API requires init_image dimensions to match the requested
// image_size exactly (rejected with 422 otherwise). Pre-scale the init to the
// canvas size with nearest-neighbor and cache the result alongside the source,
// matching the convention pl-image.ts uses for reference_images.
async function ensureInitAtSize(
  initPath: string,
  canvasW: number,
  canvasH: number,
): Promise<string> {
  const dims = readPngSize(initPath);
  if (dims.width === canvasW && dims.height === canvasH) return initPath;
  const cacheDir = join(dirname(initPath), ".cache");
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
  const stem = basename(initPath).replace(/\.png$/i, "");
  const cached = join(cacheDir, `${stem}.scaled-${canvasW}x${canvasH}.png`);
  if (!existsSync(cached)) {
    await scalePngToFile(initPath, cached, canvasW, canvasH);
    console.error(
      `[pl-pixflux] pre-scaled init ${dims.width}x${dims.height} -> ${canvasW}x${canvasH}: ${cached}`,
    );
  } else {
    console.error(`[pl-pixflux] reused cached scaled init: ${cached}`);
  }
  return cached;
}

function usage(): never {
  console.error(`Usage:
  pl-pixflux.ts --prompt "<text>" --out <path.png>
                [--width 192] [--height 192]
                [--init <path.png>] [--init-strength 300]
                [--color <path.png>]
                [--seed <n>]
                [--no-bg]
                [--detail <hint>] [--outline <hint>] [--shading <hint>]
                [--view <hint>] [--direction <hint>]
                [--text-guidance <1.0-20.0>]
                [--isometric] [--oblique]

Wraps POST /create-image-pixflux (synchronous; HTTP 200 with image data).
Pixflux supports init_image (img2img anchor) and color_image (palette anchor)
but NOT a separate style_image. Used by Phases 3 & 4 (cast / objects) with
the APPROVED cover passed as --init for visual consistency. Max 400x400.
Reads PIXELLAB_TOKEN from env.`);
  process.exit(2);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) usage();

  const flags = parseFlags(argv, ["no-bg", "isometric", "oblique"]);
  const prompt = requireFlag(flags, "prompt");
  const out = requireFlag(flags, "out");
  const width = parseInt(flags.string.width ?? "192", 10);
  const height = parseInt(flags.string.height ?? "192", 10);
  const seedStr = flags.string.seed;
  const noBg = flags.bool["no-bg"];
  const initPath = flags.string.init;
  const initStrength = parseInt(flags.string["init-strength"] ?? "300", 10);
  const colorPath = flags.string.color;

  const token = requireToken();

  const body: Record<string, unknown> = {
    description: prompt,
    image_size: { width, height },
    no_background: noBg,
  };
  if (seedStr) body.seed = parseInt(seedStr, 10);
  if (flags.string.detail) body.detail = flags.string.detail;
  if (flags.string.outline) body.outline = flags.string.outline;
  if (flags.string.shading) body.shading = flags.string.shading;
  if (flags.string.view) body.view = flags.string.view;
  if (flags.string.direction) body.direction = flags.string.direction;
  if (flags.string["text-guidance"]) {
    body.text_guidance_scale = parseFloat(flags.string["text-guidance"]);
  }
  if (flags.bool.isometric) body.isometric = true;
  if (flags.bool.oblique) body.oblique_projection = true;

  if (initPath) {
    const usedInitPath = await ensureInitAtSize(initPath, width, height);
    body.init_image = { type: "base64", base64: imgToB64(usedInitPath), format: "png" };
    body.init_image_strength = initStrength;
  }
  if (colorPath) {
    body.color_image = { type: "base64", base64: imgToB64(colorPath), format: "png" };
  }

  console.error(
    `[pl-pixflux] POST /create-image-pixflux  size=${width}x${height} ` +
      `init=${initPath ? "yes" : "no"} color=${colorPath ? "yes" : "no"} ` +
      `no_bg=${noBg ? "yes" : "no"} seed=${seedStr ?? "auto"}`,
  );

  const result = await postSync("/create-image-pixflux", body, token);
  const b64 = extractFirstImage(result);
  b64ToFile(b64, out);
  const actual = readPngSize(out);
  if (actual.width !== width || actual.height !== height) {
    throw new Error(
      `Size mismatch: requested ${width}x${height}, got ${actual.width}x${actual.height}.`,
    );
  }
  console.error(`[pl-pixflux] wrote ${out}`);
  console.log(out);
}

main().catch((err) => {
  console.error(`[pl-pixflux] ${err.message ?? err}`);
  process.exit(1);
});
