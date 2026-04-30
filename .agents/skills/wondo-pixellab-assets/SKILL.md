---
name: wondo-pixellab-assets
description: Generate story-consistent pixel art for a Wondo story via the PixelLab API (not the MCP). Reads an asset brief from a story slug, then runs a six-phase pipeline — cast (pixen, transparent) → places (pixen, transparent) → items (pixen, transparent) → cover (generate-image-v2 with typed references) → scenes (generate-image-v2 with typed references) → 3× scale — with reference images carrying style and subject identity forward. Use when the user wants story illustrations, character portraits, scene banners, or any task involving "PixelLab," "asset brief," "pixel art for a story," "character consistency across scenes," or "illustration set."
---

# PixelLab Story Assets

Generates a complete illustration set for a story so characters and style stay consistent across every scene. Uses the direct PixelLab API — the MCP can't pass `reference_images` with `usage_description`, so MCP-generated portraits and scenes drift visually.

The shape of every run:

```
slug → brief draft
       → Phase 1: pixen × N cast portraits   (512×512, no_background=true, one per character)
                                               → user APPROVES or asks for regen
       → Phase 2: pixen × ≤4 places          (512×512, no_background=true, one per place)
                                               → user APPROVES or asks for regen
       → Phase 3: pixen × N items            (512×512, no_background=true, one per item)
                                               → user APPROVES or asks for regen
       → Phase 4: pl-image × 1 cover         (512×512, refs from cast/places/items, each
                                               carrying a usage_description)
                                               → user APPROVES or asks for regen
       → Phase 5: pl-image × N scenes        (512×512, ≤4 refs from cast/places/items
                                               and optionally the cover, each carrying a
                                               usage_description)
                                               → user APPROVES or asks for regen
       → Phase 6: 3× nearest-neighbor scale   (every PNG, no API calls)
```

Generate one asset per row — no upfront A/B/C. If the user wants alternatives, regen on demand (same seed for sharper-prompt iteration; new seed for a fresh roll). Stop and ask the user to approve between each generation phase (1–5) — never burn through them unattended. Phase 6 is a deterministic local post-process; it runs unattended after Phase 5 approval.

**Side-tools (not part of the pipeline):**
- `pl-remove-bg.ts` — `/remove-background` for halo cleanup when pixen's `no_background` leaves residue. Pixen ships transparent natively, so this is rarely needed.
- `pl-bitforge.ts` — `/create-image-bitforge` for inpaint fixes ("regen the cape, leave everything else") via `--inpaint` + `--mask`. Max 200×200.
- `pl-pixelify.ts` — `/image-to-pixelart` for converting an author-supplied photo / sketch / AI render into pixel art before Phase 1.
- `pl-pixflux.ts`, `pl-style.ts` — legacy wrappers, deprecated. Kept for old briefs that still call them.

## Common Gotchas

1. **Every reference passed to `/generate-image-v2` carries a `usage_description`.** Without it, scenes drift toward random parts of each ref. Phrase as imperatives keyed to role: `"use this person as Ray"`, `"use this place as the setting"`, `"use this object — pipe and tobacco pouch"`, `"use this color palette"`. The string field is max 500 chars per ref. `pl-image.ts` builds these from `--ref <path> --ref-use "<text>"` flag pairs (repeatable, hard-capped at 4).

2. **Never exceed 4 `reference_images` per call.** Hard API cap on `/generate-image-v2`. If a scene's brief lists more than 4, prioritize the most identity-critical (named speakers > silent presences > objects), describe the rest in prose, and tell the user which ones you dropped.

3. **`PIXELLAB_TOKEN` must be set.** Get one at https://pixellab.ai/account and `export PIXELLAB_TOKEN=…`. The scripts hard-fail with a clear message if it's missing — don't guess and try anyway.

4. **Cast / places / items ship transparent via pixen's `no_background: true`.** No separate `/remove-background` call is needed in the main pipeline — pixen handles transparent output natively. Reach for `pl-remove-bg.ts` only when a pixen output ships with halo artifacts that need post-process cleanup.

5. **Sizes are locked per phase.** Cast / places / items 512×512 (pixen sync, native max 768). Cover and scenes 512×512 (`/generate-image-v2`, max 792×688 — keep both dims ≤ 688 or use 512 as the safe canonical). The scripts validate post-write and hard-fail on mismatch. Edit the brief template if the canonical needs to change project-wide; don't override per call. Phase 6 deliverables are 1536×1536 across all phases (3× of the 512×512 source).

6. **Two response patterns — sync and async.** `/create-image-pixen`, `/create-image-pixflux`, `/create-image-bitforge`, `/image-to-pixelart`, `/remove-background` are synchronous (HTTP 200 with image data) and don't need polling. `/generate-image-v2` is async (`202 + job_id`) and `pl-poll.ts:pollJob` handles it. Don't bypass the polling helpers.

7. **Cap simultaneous jobs at 3–5.** The API rate-limits with 429 above that. Other phases are mostly serial per asset.

8. **Reuse `seed` to tweak; change `seed` to re-roll.** Same seed + slightly edited prompt = a refined version of the last shot. Different seed = a fresh composition. The skill generates one asset per row by default — if the user asks for a regen, try a sharper prompt at the same seed first; only switch seeds when the same-seed regens have plateaued. **Log every seed used** to the brief's seed log so any asset is reproducible later.

9. **The skill is idempotent.** If `<##>-<slug>.png` already exists in the target directory, skip it unless the user explicitly asks for a regenerate. Resume after interruption by re-invoking with the same slug.

10. **`pl-image.ts` auto-prescales references when canvas size differs.** With both refs and canvas at 512×512 (current default), no rescale fires; the refs are posted as-is. When sizes diverge (e.g., a 768×768 ref into a 512×512 canvas), nearest-neighbor scaling caches the result at `<refdir>/.cache/<name>.scaled-<W>x<H>.png` and reuses it across re-rolls. References larger than 1024×1024 are also downscaled server-side; non-square references are padded to square with transparent pixels.

11. **No legible text in scenes.** Pixel-art models render real words as garbled letterforms. Describe signage by shape, color, and ornament — never by what it says. See `references/prompt-patterns.md`.

12. **Sync model size caps differ.** pixen max dim 768, pixflux max 400×400, bitforge max 200×200, pixelify output max 320×320. The default 512×512 fits pixen. If a one-off asset needs more, use the appropriate model — not the wrong one with a too-large request.

## File structure

```
.agents/skills/wondo-pixellab-assets/
├── SKILL.md                  (this file)
├── references/
│   ├── endpoints.md          # request/response shapes for every endpoint this skill uses
│   ├── prompt-patterns.md    # style suffix, no_background, seed strategy
│   └── brief-template.md     # the markdown shape Phase 0 produces
└── scripts/
    ├── pl-poll.ts            # shared: pollJob, postSync, imgToB64, parseFlags (with repeatable-flag support)
    ├── pl-pixen.ts           # CLI: /create-image-pixen   (Phases 1-3 cast / places / items, sync)
    ├── pl-image.ts           # CLI: /generate-image-v2    (Phase 4 cover, Phase 5 scenes; async; --ref / --ref-use)
    ├── pl-remove-bg.ts       # CLI: /remove-background    (side-tool: halo cleanup, sync)
    ├── pl-bitforge.ts        # CLI: /create-image-bitforge (side-tool: inpaint; sync)
    ├── pl-pixelify.ts        # CLI: /image-to-pixelart    (side-tool: photo→pixel; sync)
    ├── pl-pixflux.ts         # CLI: /create-image-pixflux  (legacy; sync)
    ├── pl-style.ts           # CLI: /generate-with-style-v2 (legacy; async)
    └── pl-scale.ts           # CLI: nearest-neighbor 3× upscale (Phase 6, local-only)
```

Outputs land in `stories/<slug>/assets/` (gitignored):

```
stories/<slug>/assets/
├── brief.md
├── 01-cast/      02-<slug>.png  03-<slug>.png  …          (transparent 512×512)
├── 02-places/    07-<slug>.png  08-<slug>.png  …          (transparent 512×512)
├── 03-items/     11-<slug>.png  12-<slug>.png  …          (transparent 512×512)
├── 04-cover/     21-cover.png                                            (512×512)
├── 05-scenes/    31-<slug>.png  32-<slug>.png  …          (512×512)
└── 06-3x/        (Phase 6 — mirrors the five phase folders at 3× resolution; all 1536×1536)
```

## Inputs

- **Required:** a story slug and an existing `stories/<slug>/brief.md`. The brief is the output of the upstream Wondo skill (`wondo-rework` or `wondo-interactive-fiction`).

If the user invokes the skill without a slug, ask which story. If the brief is missing, tell them to run the upstream skill first.

## Phase 0 — Read the brief

The brief is the contract — every prompt this skill sends comes from it.

1. Look for `stories/<slug>/brief.md`. If it exists, read it and proceed to Phase 1.
2. If it doesn't exist, tell the user:

   > No brief found at `stories/<slug>/brief.md`. Run `wondo-rework` or `wondo-interactive-fiction` first — their final phase produces the brief.

3. Stop. Don't fabricate a brief from the Ink file directly; that work belongs upstream.

Once a brief exists and the user has reviewed / edited it, they give you the green light to start Phase 1.

## Phase 1 — Cast portraits (pixen, transparent)

For each row in the brief's "Cast" table, generate **one** portrait at 512×512 with `no_background: true`. Print the path and ask the user to approve or regen.

```bash
PIXELLAB_TOKEN=$PIXELLAB_TOKEN node --no-warnings=ExperimentalWarning \
  .agents/skills/wondo-pixellab-assets/scripts/pl-pixen.ts \
  --prompt "<character prompt + style suffix>" \
  --width 512 --height 512 \
  --no-bg \
  --seed 200 \
  --out stories/<slug>/assets/01-cast/02-<char-slug>.png
```

If the user requests a regen, prefer iterating on the prompt at the same seed first; switch seeds (e.g., 201, 202 …) only after same-seed regens have plateaued. Increment the base seed across characters (200 for char 1, 210 for char 2, 220 for char 3, …) so each portrait has its own stable seed lineage to iterate within. Always overwrite the canonical file in place — never write sibling option files. Skip any canonical file that already exists.

## Phase 2 — Places (pixen, transparent)

Identical loop to Phase 1, reading the brief's "Places" table. Cap **4 places**. Outputs land in `02-places/<##>-<place-slug>.png`. Use seed range 700+.

A "place" is a transparent reference asset (architecture, ornament, furniture cluster) — not a finished background. The cover and scenes composite places *into* their canvas via `reference_images` with `usage_description: "use this place as the setting"`.

## Phase 3 — Items (pixen, transparent)

Identical loop, reading the brief's "Items" table (renamed from "Objects" to match Wondo's Ink VAR/Gate-7 vocabulary). Outputs land in `03-items/<##>-<item-slug>.png`. Use seed range 1100+.

Stop and ask for approval the same way as Phases 1 and 2.

## Phase 4 — Cover (`/generate-image-v2`)

Generate **one** cover at 512×512 with up to 4 references from cast/places/items, each with a `usage_description`.

```bash
PIXELLAB_TOKEN=$PIXELLAB_TOKEN node --no-warnings=ExperimentalWarning \
  .agents/skills/wondo-pixellab-assets/scripts/pl-image.ts \
  --prompt "<≤3-sentence cover description>" \
  --ref stories/<slug>/assets/01-cast/02-ray.png         --ref-use "use this person as Ray" \
  --ref stories/<slug>/assets/01-cast/03-porky.png       --ref-use "use this person as Porky" \
  --ref stories/<slug>/assets/02-places/07-study.png     --ref-use "use this place as the setting" \
  --width 512 --height 512 \
  --seed 100 \
  --out stories/<slug>/assets/04-cover/21-cover.png
```

Print the path and ask the user to approve or regen. As with cast/places/items, prefer iterating on the prompt at the same seed first; switch seeds (e.g., 101, 102 …) only after same-seed regens have plateaued. Always overwrite `21-cover.png` in place. Note the seed of the approved cover in the brief's seed log so it can be reproduced or further iterated.

The references column in the brief table tells you which assets to pass and what each `usage_description` should say — every entry has its `(use this …)` clause attached.

## Phase 5 — Scenes (`/generate-image-v2`)

For each row in the brief's "Scenes" table:

1. Resolve `references` from the table's asset numbers. For each asset number, find the file at `01-cast/<##>-*.png`, `02-places/<##>-*.png`, or `03-items/<##>-*.png`. The cover (`#21`) lives at `04-cover/21-cover.png`. If a referenced asset doesn't exist, surface the error to the user — do not guess.
2. Cap the list at 4. If the brief lists more, drop the lowest-priority and tell the user which.
3. Call:

```bash
PIXELLAB_TOKEN=$PIXELLAB_TOKEN node --no-warnings=ExperimentalWarning \
  .agents/skills/wondo-pixellab-assets/scripts/pl-image.ts \
  --prompt "<1–3-sentence scene description>" \
  --ref stories/<slug>/assets/04-cover/21-cover.png      --ref-use "use this color palette" \
  --ref stories/<slug>/assets/01-cast/02-ray.png         --ref-use "use this person as Ray" \
  --ref stories/<slug>/assets/02-places/07-study.png     --ref-use "use this place as the setting" \
  --width 512 --height 512 \
  --seed 1100 \
  --out stories/<slug>/assets/05-scenes/<##>-<scene-slug>.png
```

When refs and canvas are both 512×512, `pl-image.ts` posts the refs as-is (no pre-scale). When sizes diverge it nearest-neighbor scales every ref to the canvas before posting. Skip any `<##>-*.png` that already exists.

**Prompt discipline for scenes:** keep prompts to physical description — *who is where, doing what, in what light*. Let the references do the identity work; don't restate biographical details that the cast portrait already encodes. Strip narrative tail-lines (the brief's atmospheric closing sentences) — pixel-art models render them as literal captions across the bottom of the frame. When 3+ refs are passed, name them inline by their `--ref` order (`image 1`, `image 2`, …) so the model binds the right portrait to the right role. See `references/prompt-patterns.md` for the full set of patterns and content-policy traps.

After a batch (default 3 scenes at a time to avoid 429), print the paths and ask for approve / regenerate. Continue through the table.

## Phase 6 — 3× Scale (nearest-neighbor)

Once Phase 5 is approved, run a single deterministic post-process that upscales **every** PNG in the five phase folders to 3× their native size and writes the results to `stories/<slug>/assets/06-3x/<phase>/<filename>.png`. This is the deliverable resolution.

The scaling is **nearest-neighbor only**: each input pixel becomes a 3×3 block of identical pixels. No anti-aliasing, no resampling, no smoothing — pixel art keeps its crisp grid. Sharp's `kernel: 'nearest'` is the implementation.

```bash
node --no-warnings=ExperimentalWarning \
  .agents/skills/wondo-pixellab-assets/scripts/pl-scale.ts \
  --slug <story-slug>
```

No API calls, no token, no per-asset gate. The script:

- Mirrors the phase subdirs under `06-3x/`.
- Skips files that already exist in `06-3x/` (idempotent — same skip rule as the rest of the skill). Pass `--force` to overwrite.
- Prints `wrote 06-3x/<phase>/<file>.png (W×H -> W'×H')` per file.
- Defaults to factor 3; override with `--factor N` (integer ≥ 2). Anything other than 3 is a user override — surface it in the message back to the user.

After it runs, print a one-line summary (`scaled=N skipped=M factor=3x output=stories/<slug>/assets/06-3x`) and tell the user where to find the deliverables. With the 512×512 source canvas across all phases, every deliverable lands at 1536×1536.

## Recovery

- **429 at submit time:** drop concurrency and retry. The polling helper backs off automatically while polling.
- **Bad output ("doesn't look like the character"):** regenerate with the *same* seed and a sharper prompt before changing the seed. If three same-seed regens don't fix it, reroll with a fresh seed.
- **Halo / dirty alpha on a pixen output:** run `pl-remove-bg.ts` on the offending file before promoting it to canonical. If `task: simple` doesn't strip cleanly, retry with `--task complex`.
- **One element wrong (e.g., cape colour):** instead of full re-roll, use `pl-bitforge.ts` with `--inpaint` (the existing image) + `--mask` (a PNG painted white over the bad area) to regenerate just that region.
- **Partial run / interruption:** re-invoke the skill with the same slug. The skill skips any asset whose target file already exists. If the user wants a regenerate, delete the file first or pass an explicit "regen <##>" instruction.
- **Cover doesn't match expectations after Phase 4:** never proceed to Phase 5 with a cover the user is lukewarm on — Phase 5 may inherit its palette via the cover-as-color-ref pattern, and re-running scenes later costs as much as redoing them now.

## Quick API cheat sheet

```bash
# Phase 1 / 2 / 3 — cast / places / items (sync, no polling)
node --no-warnings=ExperimentalWarning .agents/skills/wondo-pixellab-assets/scripts/pl-pixen.ts \
  --prompt "<…>" --width 512 --height 512 --no-bg --seed 200 \
  --out stories/<slug>/assets/01-cast/02-<slug>.png

# Phase 4 — cover (refs from cast/places/items, each with --ref-use)
node --no-warnings=ExperimentalWarning .agents/skills/wondo-pixellab-assets/scripts/pl-image.ts \
  --prompt "<…>" \
  --ref <ray.png>   --ref-use "use this person as Ray" \
  --ref <study.png> --ref-use "use this place as the setting" \
  --width 512 --height 512 --seed 100 \
  --out stories/<slug>/assets/04-cover/21-cover.png

# Phase 5 — scene (cover + cast/places/items refs; max 4)
node --no-warnings=ExperimentalWarning .agents/skills/wondo-pixellab-assets/scripts/pl-image.ts \
  --prompt "<…>" \
  --ref <21-cover.png>       --ref-use "use this color palette" \
  --ref <ray.png>            --ref-use "use this person as Ray" \
  --ref <study.png>          --ref-use "use this place as the setting" \
  --width 512 --height 512 --seed 1100 \
  --out stories/<slug>/assets/05-scenes/31-<slug>.png

# Phase 6 — 3× nearest-neighbor scale (no API calls, runs unattended)
node --no-warnings=ExperimentalWarning .agents/skills/wondo-pixellab-assets/scripts/pl-scale.ts \
  --slug <slug>
# Output: stories/<slug>/assets/06-3x/{01-cast,02-places,03-items,04-cover,05-scenes}/*.png

# Side-tool — halo cleanup on a pixen output (sync)
node --no-warnings=ExperimentalWarning .agents/skills/wondo-pixellab-assets/scripts/pl-remove-bg.ts \
  --in <opaque.png> --out <transparent.png> [--task simple|complex]

# Side-tool — inpaint one region of an existing image (sync, max 200×200)
node --no-warnings=ExperimentalWarning .agents/skills/wondo-pixellab-assets/scripts/pl-bitforge.ts \
  --prompt "<what should change>" --inpaint <original.png> --mask <mask.png> \
  --width 192 --height 192 --seed 9000 --out <patched.png>

# Side-tool — convert a non-pixel image to pixel art (sync)
node --no-warnings=ExperimentalWarning .agents/skills/wondo-pixellab-assets/scripts/pl-pixelify.ts \
  --in <photo.png> --out <pixel.png> --out-width 192 --out-height 192
```

All scripts read `PIXELLAB_TOKEN` from env, log progress to stderr, print the output path on stdout, and exit non-zero on failure.

## References

| File | What's in it |
|---|---|
| `references/endpoints.md` | Request/response shapes for every endpoint this skill uses, including the `usage_description` field on `reference_images` entries. |
| `references/prompt-patterns.md` | Style suffix discipline, prompt ordering, seed strategy, why no negative prompts. |
| `references/brief-template.md` | The markdown skeleton Phase 0 fills, plus drafting heuristics. |
| https://api.pixellab.ai/v2/llms.txt | **Canonical API spec.** Fetch this whenever an endpoint detail is unclear or the spec may have drifted. |
| https://api.pixellab.ai/v2/openapi.json | Authoritative OpenAPI schema; use when llms.txt summary lacks detail (e.g. nested object shapes). |
| `.context/attachments/pixellab-api-guide.md` | Original guide this skill is built on — endpoint map for the rest of the API (rotations, animation, sprites). |
| `.agents/skills/wondo-interactive-fiction/SKILL.md` | Knot / tag / variable structure for Phase 0 brief drafting; produces the `.ink` file this skill consumes. |
