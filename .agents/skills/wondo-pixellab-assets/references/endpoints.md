# PixelLab API endpoints used by this skill

Base: `https://api.pixellab.ai/v2`
Auth: `Authorization: Bearer $PIXELLAB_TOKEN`
All Pro endpoints return `202 { job_id }`. Poll `GET /background-jobs/{job_id}` until `status: "completed"`.

Full reference: `.context/attachments/pixellab-api-guide.md` and https://api.pixellab.ai/v2/llms.txt.

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

## Why these two endpoints (and not the others)

- `/generate-image-v2` is the only endpoint that accepts both `reference_images` (subject identity) and `style_image` (aesthetic) — the consistency lever this whole pipeline depends on.
- `/generate-with-style-v2` is the dedicated style-locked sibling generator. For portraits/objects we don't need subject references (the cover *is* the only reference); we just need the aesthetic to lock.
- `/create-image-pixen`, `/create-image-pixflux`, `/create-image-bitforge`, the character-with-N-directions endpoints, and the rotation/edit/inpaint endpoints are out of scope for this skill. Reach for them when a brief calls for it (e.g., game sprites, masked inpainting, post-hoc edits) and call them via curl directly.
