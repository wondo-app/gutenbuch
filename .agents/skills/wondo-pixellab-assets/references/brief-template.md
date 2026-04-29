# Asset brief template

The `wondo-rework` and `wondo-interactive-fiction` skills produce this file at `stories/<slug>/brief.md` after their gates pass. The user reviews and edits before invoking the pixellab pipeline. Numeric prefixes (`02`, `07`, …) become file prefixes inside `01-cast/`, `02-places/`, `03-items/`, etc.

```markdown
# <Story Title> — Asset Brief

Story slug: `<slug>`
Source: `stories/<slug>.ink`
Generated: <YYYY-MM-DD>

## Style bible

### Prompt suffix (append to every description)
> <e.g. "neon steampunk pixel art, magenta and cyan glow, indigo background, brass detail, hard pixels, dithered shading">

### Color palette (informational)
- Primary: <hex>
- Accent 1: <hex>
- Accent 2: <hex>
- Background: <hex>

## Cast (Phase 1)

| # | Character | Endpoint | Size | Appears in scenes | Prompt |
|---|---|---|---|---|---|
| 02 | <Name> | /create-image-pixen (no_background=true) | 512×512 | <list of scene #s> | <one-paragraph description: silhouette, key features, pose, lighting cue, ending with style suffix> |
| 03 | … | … | … | … | … |

## Places (Phase 2)

| # | Place | Endpoint | Size | Appears in scenes | Prompt |
|---|---|---|---|---|---|
| 07 | <Name, e.g. "Ray's 1943 study"> | /create-image-pixen (no_background=true) | 512×512 | <list of scene #s> | <description of the setting as an isolated transparent reference, ending with style suffix> |
| 08 | … | … | … | … | … |

**Cap: 4 places.** A "place" is a transparent reference asset (architecture, ornament, furniture cluster) that scenes composite *into* — not a finished background.

## Items (Phase 3)

Renamed from "Objects" to match the Wondo Ink VAR vocabulary (Gate 7).

| # | Item | Endpoint | Size | Appears in scenes | Prompt |
|---|---|---|---|---|---|
| 11 | <Name> | /create-image-pixen (no_background=true) | 512×512 | <list of scene #s> | <description, ending with style suffix> |
| 12 | … | … | … | … | … |

## Cover (Phase 4)

| # | Asset | Endpoint | Size | references (≤4, each with usage_description) | Prompt |
|---|---|---|---|---|---|
| 21 | Cover | /generate-image-v2 | 176×176 | #02 (use this person — Ray), #03 (use this person — Porky), #07 (use this place as the setting) | <≤3-sentence cover scene description; the references carry identity, prose carries action> |

The cover is composed *like a scene*: up to 4 references drawn from cast/places/items, each with a `usage_description` clause. 3 seed variants → user approves one.

## Scenes (Phase 5)

| # | Scene | Endpoint | Size | references (≤4, each with usage_description) | Prompt |
|---|---|---|---|---|---|
| 31 | <Knot or moment name> | /generate-image-v2 | 176×176 | #02 (use this person — Ray), #07 (use this place as the setting) | <1–3-sentence scene description> |
| 32 | <…> | … | … | #02, #04 (use this person — Lisbeth), #21 (use this color palette) | <…> |

**Authoring rules for the references column:**
- **Max 4** entries per scene (hard API cap).
- Every entry includes its `(use this …)` clause — `(use this person)`, `(use this place as the setting)`, `(use this object)`, `(use this color palette)`.
- The cover (`#21`) may itself appear as one of the 4 refs on a scene, with `(use this color palette)` to hold the aesthetic across scenes.

**Authoring rules for the prompt column:**
- ≤3 sentences. The references carry the visual weight; do not stack atmosphere paragraphs in prose.
- Name characters / places by their role, not by physical re-description ("Ray sets a typewriter aside" not "a middle-aged man with rumpled hair sits at a desk holding a pipe").
- No legible text in scenes — describe signage by shape, color, ornament, never by what it says.

## Generation order

### Phase 1 — Cast (no dependencies)
- 02-NN /create-image-pixen at 512×512 with `no_background=true`. 2 seed variants per character → user approves one. Pixen ships transparent natively; no separate /remove-background step.

### Phase 2 — Places (no dependencies)
- 07-MM /create-image-pixen at 512×512 with `no_background=true`. Cap 4. 2 seed variants each → user approves one.

### Phase 3 — Items (no dependencies)
- 11-PP /create-image-pixen at 512×512 with `no_background=true`. 2 seed variants each → user approves one.

### Phase 4 — Cover
- 21 /generate-image-v2 at 176×176 with up to 4 refs from cast/places/items, each with `usage_description`. 3 seed variants → user approves one.

### Phase 5 — Scenes
- 31+ /generate-image-v2 at 176×176 with up to 4 refs (including the approved cover where palette consistency matters), each with `usage_description`.

### Phase 6 — 3× scale (deterministic, local)
- pl-scale produces 528×528 deliverables for cover/scenes and 1536×1536 deliverables for cast/places/items under `06-3x/`.

## Ink knot mapping

| Knot | Asset(s) | Notes |
|---|---|---|
| `<knot_name>` | 31 | Used as the scene banner in the reader |
| `<knot_name>` | 32 | … |

## Seed log (filled in during generation)

| Asset # | Seed | File | Notes |
|---|---|---|---|
| 02 | 200 | 01-cast/02-<slug>.png | first try |
| 02 | 201 | 01-cast/02-<slug>.alt.png | second try → APPROVED |
| 21 | 100 | 04-cover/option-a.png | "wide composition" |
| 21 | 101 | 04-cover/option-b.png | "tight, character-forward" → APPROVED |
```

## Drafting heuristics for Phase 0

When walking the story to draft this brief:

- **Cast prompts are standalone.** Each character is described in isolation — not in relation to the cover (there is no cover yet at this stage). Prioritize the 5–8 most-recurring characters; do not include every walk-on. Describe physical silhouette over personality.
- **Places** (max 4) are transparent reference assets, not finished backgrounds. Pick the 2–4 settings the story returns to: Ray's study, Sandy Hook beach at night, the Manhattan intersection, the Bellevue intake hallway. Skip places the story visits once.
- **Items** (renamed from Objects) are props the prose references repeatedly or that drive plot beats. Aim for 3–6.
- **Cover and scenes both use `/generate-image-v2`** with up to 4 references. Authoring rule: every ref in the table includes its `(use this …)` clause, and the prose prompt is ≤3 sentences.
- **`reference_images` cap is 4.** If a scene wants more, drop the lowest-priority and describe them in text only.
- **Sizes are locked per phase**: cast / places / items 512×512 (pixen sync, supports up to 768); cover and scenes 176×176 (`/generate-image-v2`). The scripts validate post-write and hard-fail on mismatch.
- **Signage** — when a scene includes a building or shop with a sign, describe the architecture and ornament, never the words on the sign. Pixel-art models bake garbled letterforms into the canvas.

The user is the final editor — Phase 0 produces a *draft*, not a finished spec.
