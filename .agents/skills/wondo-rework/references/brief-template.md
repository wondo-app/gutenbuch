# Asset brief template

The `wondo-rework` skill produces this file at `stories/<slug>/brief.md` as Phase 9 of its flow (after the 8 gates pass). The user reviews and edits before invoking the pixellab pipeline. Numeric prefixes (`01`, `02`, …) become file prefixes inside `01-cover/`, `02-cast/`, etc.

```markdown
# <Story Title> — Asset Brief

Story slug: `<slug>`
Source: `stories/<slug>.ink`
Generated: <YYYY-MM-DD>

## Ideation thumbnails (Phase 1)

| # | Asset | Endpoint | Size | Notes |
|---|---|---|---|---|
| 00 | Ideation thumbnails | /create-image-pixen | 192x192 | ~10 fast text-only concepts from a short cover prompt. User picks 2 to seed Phase 2. |

### Ideation prompt (≤2 sentences)
> <a tight, evocative summary of the cover scene — leave room for the model to reinterpret>

## Style anchor (Phase 2)

| # | Asset | Endpoint | Size | Notes |
|---|---|---|---|---|
| 01 | Cover illustration | /generate-image-v2 | 192x344 | Generated from selected ideation thumbnails as `reference_image`. Becomes the `init_image` / `style_image` for everything that follows. |

### Cover prompt
> <one-paragraph hero scene description, ending with the style suffix>

### Cover variations to try
- option-a (seed 100): <one-line directional hint, e.g. "wide composition, environment-forward">
- option-b (seed 101): <e.g. "tight composition, character-forward">
- option-c (seed 102): <e.g. "atmospheric, painterly">

## Style bible

### Prompt suffix (append to every description)
> <e.g. "neon steampunk pixel art, magenta and cyan glow, indigo background, brass detail, hard pixels, dithered shading">

### style_options (every /generate-image-v2 call)
`{ color_palette: true, outline: true, detail: true, shading: true }`

### Color palette (informational)
- Primary: <hex>
- Accent 1: <hex>
- Accent 2: <hex>
- Background: <hex>

## Cast (Phase 3)

| # | Character | Endpoint | Size | Appears in scenes | Prompt |
|---|---|---|---|---|---|
| 02 | <Name> | /create-image-pixflux (init=cover) | 192x192 | <list of scene #s> | <one-paragraph description: silhouette, key features, pose, lighting cue, ending with style suffix> |
| 03 | … | … | … | … | … |

## Objects (Phase 4)

| # | Object | Endpoint | Size | Appears in scenes | Prompt |
|---|---|---|---|---|---|
| 07 | <Name> | /create-image-pixflux (init=cover) | 192x192 | <list of scene #s> | <description, ending with style suffix> |
| 08 | … | … | … | … | … |

## Scenes (Phase 5)

| # | Scene | Endpoint | Size | reference_images | Prompt |
|---|---|---|---|---|---|
| 11 | <Knot or moment name> | /generate-image-v2 (style=cover) | 192x192 | (none) | <scene description ending with style suffix> |
| 12 | <…> | /generate-image-v2 (style=cover) | 192x192 | #02, #03 | <scene description naming each ref by number, e.g. "The bald chemist Sills (image 1) holds up a tube while the cheerful Taylor (image 2) leans in…"> |

**Rule:** never list more than 4 reference_images per scene. If more characters/objects matter, keep the most identity-critical and let the rest be described in text only.

## Generation order

### Phase 1 — Ideation (no dependencies)
- 00 Pixen thumbnails ×10 (192×192) → user approves 2

### Phase 2 — Cover (reference_image = approved ideation thumbnail)
- 01 Cover ×2 options @ 192×344 → user approves 1

### Phase 3 — Cast portraits (init_image = APPROVED cover)
- 02-NN Pixflux portraits @ 192×192, no_background = true

### Phase 4 — Objects (init_image = APPROVED cover)
- 07-MM Pixflux objects @ 192×192, no_background = true

### Phase 5 — Scenes (style_image = APPROVED cover; reference_images per scene table)
- 11+ /generate-image-v2 scenes @ 192×192

### Phase 6 — 3× scale (deterministic, local)
- pl-scale produces 576×576 / 576×1032 deliverables under `05-3x/`

## Ink knot mapping

| Knot | Asset(s) | Notes |
|---|---|---|
| `<knot_name>` | 12 | Used as the scene banner in the reader |
| `<knot_name>` | 14 | … |

## Seed log (filled in during generation)

| Asset # | Seed | File | Notes |
|---|---|---|---|
| 01 | 100 | 01-cover/option-a.png | "wide composition" |
| 01 | 101 | 01-cover/option-b.png | "tight, character-forward" → APPROVED |
| 02 | 200 | 02-cast/02-<slug>.png | first try, regenerated at 201 |
```

## Drafting heuristics for Phase 0

When walking the story to draft this brief:

- **Style anchor prompt** — the most evocative scene from chapter 1 or the story's opening tableau. Should *contain* but not be limited to characters; biased toward environment/atmosphere so the cover is rich enough to carry the visual identity.
- **Cast** — every character whose name is mentioned in dialogue or referenced in a knot's `# THEME` / `# SCENE` tag. Prioritize the 5–8 most-recurring; do not include every walk-on. Their appearance, posture, and signature props come from the prose; describe physical silhouette over personality.
- **Objects** — items the prose references repeatedly or that drive plot beats. Skip generic environment props. Aim for 3–6.
- **Scenes** — one per knot tagged `# SCENE: <n>` or one per knot whose body sets a clearly-illustratable beat (location change, big gesture, choice point). Don't generate a scene for every knot — pick the moments worth illustrating.
- **`reference_images`** — for each scene, list the 1–4 cast/object asset numbers most important to identity. Cap at 4 even if more appear in the prose; let the prompt describe the rest.
- **Sizes** — use the canonical sizes (Ideation 192×192, Cover 192×344, Cast/Objects/Scenes 192×192). The scripts validate exact match and pre-scale references to the scene canvas. Override only for genuine one-off experiments.
- **Signage** — when a scene includes a building or shop with a sign, describe the architecture and ornament, never the words on the sign. Pixel-art models bake garbled letterforms into the canvas.

The user is the final editor — Phase 0 produces a *draft*, not a finished spec.
