# PixelLab API endpoints used by this skill

Base: `https://api.pixellab.ai/v2`
Auth: `Authorization: Bearer $PIXELLAB_TOKEN`

**Canonical source of truth:** https://api.pixellab.ai/v2/llms.txt — fetch this whenever an endpoint detail is unclear or you suspect the spec has drifted. The full OpenAPI spec lives at `https://api.pixellab.ai/v2/openapi.json` and is the authoritative schema. The doc below curates only the endpoints this skill uses.

Two response patterns:
- **Async (202):** Pro endpoints return `{ job_id }`. Poll `GET /background-jobs/{job_id}` until `status: "completed"`. Used by `/generate-image-v2`.
- **Sync (200):** Returns image data inline in the response body. Used by `/create-image-pixen`, `/create-image-pixflux`, `/create-image-bitforge`, `/image-to-pixelart`, `/remove-background`. Wrapped by `pl-poll.ts:postSync`.

## `POST /generate-image-v2`

Used by the cover (Phase 4) and scenes (Phase 5). Wrapped by `scripts/pl-image.ts`.

Request body:

```jsonc
{
  "description": "string — required, full prompt incl. style suffix",
  "image_size": { "width": 176, "height": 176 },
  "style_image": {                                     // optional; rarely used in current pipeline
    "image": { "base64": "<…>" },
    "size":  { "width": 512, "height": 512 },
    "usage_description": "use this color palette"      // optional, max 500 chars
  },
  "reference_images": [                                // optional; **MAX 4**
    {
      "image": { "base64": "<…>" },
      "size":  { "width": 176, "height": 176 },        // pre-scaled by pl-image.ts to canvas
      "usage_description": "use this person as Ray"    // optional, max 500 chars — see below
    }
  ],
  "style_options": {
    "color_palette": true, "outline": true, "detail": true, "shading": true
  },
  "no_background": false,                              // true for transparent output
  "seed": 42                                           // optional; reuse to "tweak", change for fresh roll
}
```

### Per-reference `usage_description` (load-bearing)

Each entry in `reference_images` accepts an optional `usage_description` string (max 500 chars). This is how the model knows what each ref is *for* — without it, the four refs are treated as a generic visual mishmash. Phrase as imperatives keyed to role:

| Role | Example `usage_description` |
|---|---|
| Cast member | `"use this person as Ray"` |
| Place / setting | `"use this place as the setting"` |
| Item / prop | `"use this object — pipe and tobacco pouch"` |
| Cover (rare) | `"use this color palette"` |

`pl-image.ts` builds these from `--ref <path>` + `--ref-use "<text>"` flag pairs (repeatable, hard-capped at 4).

### Reference scale → content-area cap

When `reference_images` is set, the API caps generated content to roughly the references' pixel scale and fills the rest of the canvas with transparent pixels. **`pl-image.ts` pre-scales every ref (nearest-neighbor) to the canvas size before posting**, eliminating the padding. The scaled copies live under `<refdir>/.cache/<name>.scaled-<W>x<H>.png` for reuse across re-rolls.

References larger than 1024×1024 are downscaled server-side; non-square references are padded to square with transparent pixels before processing.

### Size cap notes

The scripts validate that the response dimensions equal the request and fail loudly otherwise — do not silently swallow drift.

## `POST /create-image-pixen`

Synchronous text-to-pixel-art with native transparent-background support. Largest sync canvas (max dimension 768). Wrapped by `scripts/pl-pixen.ts`.

```jsonc
{
  "description": "string (required)",
  "image_size": { "width": 512, "height": 512 },     // 16-768
  "outline": "string (optional)",
  "detail": "string (optional, default=highly detailed)",
  "view": "string (optional)",
  "direction": "string (optional)",
  "no_background": true,                              // generate with transparent background
  "background_removal_task": "remove_simple_background",  // optional, default
  "seed": 42                                          // optional
}
```

Used by **Phases 1–3** (cast, places, items) at 512×512 with `no_background: true`. Pixen handles transparent output natively — no separate `/remove-background` call needed.

## `POST /remove-background`

Sync (HTTP 200). **Side-tool, not part of the main pipeline** — pixen's `no_background: true` already produces transparent output. Reach for this endpoint only when a pixen output ships with halo artifacts and the author wants a clean post-process. Wrapped by `scripts/pl-remove-bg.ts`.

```jsonc
{
  "image":     { "base64": "<…>" },
  "image_size": { "width": 512, "height": 512 },
  "background_removal_task": "remove_simple_background",  // or "remove_complex_background"
  "text": "Optional foreground hint",                     // optional
  "seed": 42                                              // optional
}
```

Returns `{ image: { base64: "<…>" } }` directly.

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
  "init_image": { "base64": "<…>" },                 // optional
  "init_image_strength": 300,                        // 1-999
  "color_image": { "base64": "<…>" },                // optional
  "seed": 42
}
```

Side-tool. Pixflux + `init_image` reproduces the init image nearly verbatim regardless of `init_image_strength`; the current pipeline does not use it.

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
  "init_image": { "base64": "<…>" },
  "init_image_strength": 300,
  "style_image": { "base64": "<…>" },
  "inpainting_image": { "base64": "<…>" },
  "mask_image": { "base64": "<…>" },
  "color_image": { "base64": "<…>" },
  "seed": 42
}
```

Side-tool, not part of the main pipeline. Reach for bitforge when an author wants to **regen one element of an existing image** without re-rolling the whole shot — paint a mask over the bad area, pass the original as `inpainting_image` and the mask as `mask_image`, write a prompt describing only what should change.

## `POST /image-to-pixelart`

Synchronous, converts a non-pixel-art image (photo, sketch, AI render) to pixel art. Max input 1280, max output 320. Wrapped by `scripts/pl-pixelify.ts`.

```jsonc
{
  "image":      { "base64": "<…>" },
  "image_size":  { "width": <input width>,  "height": <input height>  },  // 16-1280
  "output_size": { "width": 192, "height": 192 },                          // 16-320
  "text_guidance_scale": 8.0,                                              // optional
  "seed": 42                                                               // optional
}
```

Side-tool. Useful when an author hands over reference imagery (photo, concept sketch, AI render) and wants it pixelified before Phase 1 ideation begins.

## `POST /generate-with-style-v2`  (DEPRECATED in this skill)

Wrapped by `scripts/pl-style.ts`. Earlier pipeline versions used this for cast/objects with the cover as `style_image`. The current pipeline does not call it — cast/places/items go through pixen, the cover and scenes go through `/generate-image-v2` with per-ref `usage_description`. The wrapper is kept on disk so legacy briefs still execute.

## `GET /background-jobs/{job_id}`

Polled by `scripts/pl-poll.ts:pollJob()`. Possible status values:
- `queued` / `running` / `pending` — keep polling.
- `completed` — `data.images[0].base64` (or `data.image.base64` / `data.base64`) holds the PNG.
- `failed` — surface `error` and exit non-zero.

Backoff schedule used by this skill: 2s → 3s → 4s → 6s → 8s. On `429`, double the next delay and retry.

## Why these endpoints (and not the others)

- `/generate-image-v2` is the workhorse: 4 typed `reference_images` (each with `usage_description`) + optional `style_image` + global `description`. Phases 4 and 5 depend on this contract.
- `/create-image-pixen` is the Phase 1–3 default — fast sync, native `no_background`, supports up to 768 px.
- `/remove-background` is a side-tool: pixen already ships transparent, so reach for this only for halo cleanup.
- `/create-image-bitforge` is the inpaint side-tool for one-region surgical fixes.
- The character-with-N-directions, rotation, animation, and tileset endpoints are out of scope for this skill. Reach for them via curl when a brief specifically calls for sprite-sheet output, and consult `https://api.pixellab.ai/v2/llms.txt`.
