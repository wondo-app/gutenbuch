# PixelLab API endpoints used by this skill

Base: `https://api.pixellab.ai/v2`
Auth: `Authorization: Bearer $PIXELLAB_TOKEN`

**Canonical source of truth:** https://api.pixellab.ai/v2/llms.txt — fetch this whenever an endpoint detail is unclear or you suspect the spec has drifted. The doc below curates only the endpoints this skill uses.

Two response patterns:
- **Async (202):** Pro endpoints return `{ job_id }`. Poll `GET /background-jobs/{job_id}` until `status: "completed"`. Used by `/generate-image-v2` (Phase 2 cover, Phase 5 scenes) and `/generate-with-style-v2`.
- **Sync (200):** Returns image data inline in the response body. Used by `/create-image-pixen`, `/create-image-pixflux`, `/create-image-bitforge`, `/image-to-pixelart`. Wrapped by `pl-poll.ts:postSync`.

## `POST /generate-image-v2`

Used by the cover (Phase 1) and scenes (Phase 4). Wrapped by `scripts/pl-image.ts`.

Request body:

```jsonc
{
  "description": "string — required, full prompt incl. style suffix",
  "image_size": { "width": 512, "height": 512 },     // ≤ 792x688
  "style_image": {                                    // optional; pass APPROVED cover for scenes
    "type": "base64", "base64": "<…>", "format": "png"
  },
  "reference_images": [                               // optional; max 4
    { "image": { "type": "base64", "base64": "<…>", "format": "png" } }
  ],
  "style_options": {
    "color_palette": true, "outline": true, "detail": true, "shading": true
  },
  "no_background": false,                             // true only if scene has no environment
  "seed": 42                                          // optional; reuse to "tweak", change for fresh roll
}
```

| Field | Phase 1 (cover) | Phase 4 (scene) |
|---|---|---|
| `style_image` | omit | APPROVED cover |
| `reference_images` | omit | up to 4 of {character portraits, objects} |
| `no_background` | omit | omit (scenes always have backgrounds) |

### Reference scale → content-area cap

When `reference_images` is set, the API caps generated content to roughly the references' pixel scale and fills the rest of the canvas with transparent pixels. Empirical example: a 384×384 canvas with 256×256 cast refs → ~240×240 of content + transparent padding around it (looks like a white frame). **`pl-image.ts` pre-scales every ref (nearest-neighbor) to the canvas size before posting**, eliminating the padding. The scaled copies live under `<refdir>/.cache/<name>.scaled-<W>x<H>.png` for reuse across re-rolls.

### Size cap notes

The API silently rescales requests above its current cap. Empirically, 448×600 is the largest paperback-ratio cover the service will return without rescaling, and 384×384 is a stable scene size. The scripts validate that the response dimensions equal the request and fail loudly otherwise — do not silently swallow drift.

## `POST /generate-with-style-v2`

Used by character portraits (Phase 2) and objects (Phase 3). Wrapped by `scripts/pl-style.ts`.

Request body:

```jsonc
{
  "description": "string — what to generate",
  "image_size": { "width": 256, "height": 256 },     // ≤ 512x512
  "style_images": [                                   // 1-4; we always pass exactly the APPROVED cover
    {
      "image": { "type": "base64", "base64": "<…>", "format": "png" },
      "size": { "width": 512, "height": 512 }         // size of the style image itself
    }
  ],
  "style_description": "neon steampunk pixel art, magenta and cyan glow, …",
  "no_background": true,                              // always true for portraits/objects
  "seed": 42
}
```

The script reads the actual PNG dimensions of the style image from its IHDR chunk and fills `style_images[0].size` automatically — do not hardcode.

## `GET /background-jobs/{job_id}`

Polled by `scripts/pl-poll.ts:pollJob()`. Possible status values:
- `queued` / `running` / `pending` — keep polling.
- `completed` — `data.images[0].base64` (or `data.image.base64` / `data.base64`) holds the PNG.
- `failed` — surface `error` and exit non-zero.

Backoff schedule used by this skill: 2s → 3s → 4s → 6s → 8s. On `429`, double the next delay and retry.

## `POST /create-image-pixen`

Synchronous text-to-pixel-art. No reference fields. Largest sync canvas (max dimension 768). Wrapped by `scripts/pl-pixen.ts`.

```jsonc
{
  "description": "string (required)",
  "image_size": { "width": 192, "height": 192 },     // 16-768
  "outline": "string (optional)",
  "detail": "string (optional, default=highly detailed)",
  "view": "string (optional)",
  "direction": "string (optional)",
  "no_background": false,
  "seed": 42                                          // optional
}
```

Used by **Phase 1 (ideation)** to generate ~10 thumbnail concepts cheaply before committing to a full cover render.

## `POST /create-image-pixflux`

Synchronous, supports `init_image` (img2img anchor) and `color_image` (palette anchor) but no `style_image`. Max 400×400. Wrapped by `scripts/pl-pixflux.ts`.

```jsonc
{
  "description": "string (required)",
  "image_size": { "width": 192, "height": 192 },     // 16-400
  "text_guidance_scale": 8.0,                        // 1.0-20.0
  "outline": "string (optional)",
  "shading": "string (optional)",
  "detail": "string (optional)",
  "view": "string (optional)",
  "direction": "string (optional)",
  "isometric": false,
  "oblique_projection": false,
  "no_background": false,
  "init_image": { "type": "base64", "base64": "<…>", "format": "png" },  // optional
  "init_image_strength": 300,                        // 1-999
  "color_image": { "type": "base64", "base64": "<…>", "format": "png" }, // optional
  "seed": 42
}
```

Used by **Phase 3 (cast)** and **Phase 4 (objects)** with the APPROVED cover passed as `init_image` so the character/object inherits the cover's palette and lighting without needing a separate style-lock pass.

## `POST /create-image-bitforge`

Synchronous, has the richest reference surface of the sync models — `style_image` + `style_strength` + `init_image` + `color_image` + `inpainting_image` + `mask_image`. Max 200×200. Wrapped by `scripts/pl-bitforge.ts`.

```jsonc
{
  "description": "string (required)",
  "negative_description": "string (optional)",
  "image_size": { "width": 192, "height": 192 },     // 16-200
  "text_guidance_scale": 8.0,
  "style_strength": 0.0,                              // 0-100
  "outline": "string (optional)",
  "shading": "string (optional)",
  "detail": "string (optional)",
  "view": "string (optional)",
  "direction": "string (optional)",
  "isometric": false,
  "oblique_projection": false,
  "no_background": false,
  "init_image": { "type": "base64", "base64": "<…>", "format": "png" },
  "init_image_strength": 300,
  "style_image": { "type": "base64", "base64": "<…>", "format": "png" },
  "inpainting_image": { "type": "base64", "base64": "<…>", "format": "png" },
  "mask_image": { "type": "base64", "base64": "<…>", "format": "png" },
  "color_image": { "type": "base64", "base64": "<…>", "format": "png" },
  "seed": 42
}
```

Side-tool, not part of the main pipeline. Reach for bitforge when an author wants to **regen one element of an existing image** without re-rolling the whole shot — paint a mask over the bad area, pass the original as `inpainting_image` and the mask as `mask_image`, write a prompt describing only what should change.

## `POST /image-to-pixelart`

Synchronous, converts a non-pixel-art image (photo, sketch, AI render) to pixel art. Max input 1280, max output 320. Wrapped by `scripts/pl-pixelify.ts`.

```jsonc
{
  "image":      { "type": "base64", "base64": "<…>", "format": "png" },
  "image_size":  { "width": <input width>,  "height": <input height>  },  // 16-1280
  "output_size": { "width": 192, "height": 192 },                          // 16-320
  "text_guidance_scale": 8.0,                                              // optional
  "seed": 42                                                               // optional
}
```

Side-tool. Useful when an author hands over reference imagery (photo, concept sketch, AI render) and wants it pixelified before Phase 1 ideation begins.

## Why these endpoints (and not the others)

- `/generate-image-v2` is the only endpoint that accepts both `reference_images` (subject identity, max 4) and `style_image` (aesthetic) — the consistency lever Phases 2 and 5 depend on.
- `/generate-with-style-v2` is the dedicated style-locked generator and is the default for Phases 3 and 4 (cast portraits and objects). Earlier skill versions used `/create-image-pixflux` with the cover passed as `init_image`, but pixflux init reproduces the source nearly verbatim regardless of `init_image_strength`, and `/create-image-bitforge` with `--init` is even worse. `/generate-with-style-v2` with the cover as `style_image` is the only path that holds the cover's aesthetic without copying it. **Do not pass `no_background: true` to this endpoint** — it corrupts the output when paired with `style_image`; mask backgrounds post-generation via `/create-image-bitforge` with `--inpaint` + `--mask` if portraits need to composite into scenes.
- The four sync endpoints above unlock fast iteration without polling latency.
- The character-with-N-directions, rotation, animation, and tileset endpoints are out of scope for this skill. Reach for them via curl when a brief specifically calls for sprite-sheet output, and consult `https://api.pixellab.ai/v2/llms.txt` for the spec.
