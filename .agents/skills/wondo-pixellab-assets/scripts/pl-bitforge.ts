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

// Bitforge requires init_image / inpainting_image / mask_image to match the
// requested image_size exactly (rejected with 422 otherwise). Pre-scale to
// the canvas size with nearest-neighbor and cache alongside the source,
// matching pl-image.ts's reference convention.
async function ensureAtSize(
  srcPath: string,
  canvasW: number,
  canvasH: number,
  label: string,
): Promise<string> {
  const dims = readPngSize(srcPath);
  if (dims.width === canvasW && dims.height === canvasH) return srcPath;
  const cacheDir = join(dirname(srcPath), ".cache");
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
  const stem = basename(srcPath).replace(/\.png$/i, "");
  const cached = join(cacheDir, `${stem}.scaled-${canvasW}x${canvasH}.png`);
  if (!existsSync(cached)) {
    await scalePngToFile(srcPath, cached, canvasW, canvasH);
    console.error(
      `[pl-bitforge] pre-scaled ${label} ${dims.width}x${dims.height} -> ${canvasW}x${canvasH}: ${cached}`,
    );
  } else {
    console.error(`[pl-bitforge] reused cached scaled ${label}: ${cached}`);
  }
  return cached;
}

function usage(): never {
  console.error(`Usage:
  pl-bitforge.ts --prompt "<text>" --out <path.png>
                 [--width 192] [--height 192]
                 [--style <path.png>] [--style-strength 0-100]
                 [--init <path.png>] [--init-strength 1-999]
                 [--color <path.png>]
                 [--inpaint <path.png>] [--mask <path.png>]
                 [--seed <n>]
                 [--no-bg]
                 [--detail <hint>] [--outline <hint>] [--shading <hint>]
                 [--view <hint>] [--direction <hint>]
                 [--text-guidance <1.0-20.0>]
                 [--isometric] [--oblique]

Wraps POST /create-image-bitforge (synchronous; HTTP 200 with image data).
Bitforge has the richest reference surface of the sync models: style_image,
init_image, color_image, inpainting_image + mask_image. Use for inpaint
fixes ("regen the cape, leave everything else") or style-locked iteration.
Max 200x200 — smallest of the sync models.

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

  if (width > 200 || height > 200) {
    console.error(`pl-bitforge: max canvas is 200x200 (requested ${width}x${height}). Use pl-pixflux or pl-image for larger sizes.`);
    process.exit(2);
  }

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

  if (flags.string.style) {
    const usedStyle = await ensureAtSize(flags.string.style, width, height, "style");
    body.style_image = { type: "base64", base64: imgToB64(usedStyle), format: "png" };
    if (flags.string["style-strength"]) {
      body.style_strength = parseFloat(flags.string["style-strength"]);
    }
  }
  if (flags.string.init) {
    const usedInit = await ensureAtSize(flags.string.init, width, height, "init");
    body.init_image = { type: "base64", base64: imgToB64(usedInit), format: "png" };
    if (flags.string["init-strength"]) {
      body.init_image_strength = parseInt(flags.string["init-strength"], 10);
    }
  }
  if (flags.string.color) {
    const usedColor = await ensureAtSize(flags.string.color, width, height, "color");
    body.color_image = { type: "base64", base64: imgToB64(usedColor), format: "png" };
  }
  if (flags.string.inpaint) {
    const usedInpaint = await ensureAtSize(flags.string.inpaint, width, height, "inpaint");
    body.inpainting_image = { type: "base64", base64: imgToB64(usedInpaint), format: "png" };
  }
  if (flags.string.mask) {
    const usedMask = await ensureAtSize(flags.string.mask, width, height, "mask");
    body.mask_image = { type: "base64", base64: imgToB64(usedMask), format: "png" };
  }

  console.error(
    `[pl-bitforge] POST /create-image-bitforge  size=${width}x${height} ` +
      `style=${flags.string.style ? "yes" : "no"} init=${flags.string.init ? "yes" : "no"} ` +
      `inpaint=${flags.string.inpaint ? "yes" : "no"} ` +
      `no_bg=${noBg ? "yes" : "no"} seed=${seedStr ?? "auto"}`,
  );

  const result = await postSync("/create-image-bitforge", body, token);
  const b64 = extractFirstImage(result);
  b64ToFile(b64, out);
  const actual = readPngSize(out);
  if (actual.width !== width || actual.height !== height) {
    throw new Error(
      `Size mismatch: requested ${width}x${height}, got ${actual.width}x${actual.height}.`,
    );
  }
  console.error(`[pl-bitforge] wrote ${out}`);
  console.log(out);
}

main().catch((err) => {
  console.error(`[pl-bitforge] ${err.message ?? err}`);
  process.exit(1);
});
