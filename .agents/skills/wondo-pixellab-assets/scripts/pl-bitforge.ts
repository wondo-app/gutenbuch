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
    body.style_image = { type: "base64", base64: imgToB64(flags.string.style), format: "png" };
    if (flags.string["style-strength"]) {
      body.style_strength = parseFloat(flags.string["style-strength"]);
    }
  }
  if (flags.string.init) {
    body.init_image = { type: "base64", base64: imgToB64(flags.string.init), format: "png" };
    if (flags.string["init-strength"]) {
      body.init_image_strength = parseInt(flags.string["init-strength"], 10);
    }
  }
  if (flags.string.color) {
    body.color_image = { type: "base64", base64: imgToB64(flags.string.color), format: "png" };
  }
  if (flags.string.inpaint) {
    body.inpainting_image = { type: "base64", base64: imgToB64(flags.string.inpaint), format: "png" };
  }
  if (flags.string.mask) {
    body.mask_image = { type: "base64", base64: imgToB64(flags.string.mask), format: "png" };
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
