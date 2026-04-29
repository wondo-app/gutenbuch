---
name: wondo-pixellab-assets
description: Generate story-consistent pixel art for a Wondo story via the PixelLab API (not the MCP). Drafts an asset brief from a story slug, then runs a seven-phase pipeline — ideation (pixen) → cover (pl-image) → cast (pl-style) → objects (pl-style) → scenes (pl-image) → 3× scale — with reference images carrying style and subject identity forward. Use when the user wants story illustrations, character portraits, scene banners, or any task involving "PixelLab," "asset brief," "pixel art for a story," "character consistency across scenes," or "illustration set."
---

# PixelLab Story Assets

Generates a complete illustration set for a story so characters and style stay consistent across every scene. Uses the direct PixelLab API — the MCP can't pass `reference_images` or `style_image` / `init_image`, so MCP-generated portraits and scenes drift visually. Each phase here feeds the previous phase's approved output forward.

The shape of every run:

```
slug → brief draft
       → Phase 1: pixen × ~10 thumbnail concepts (192×192)
                                          → user picks 2
       → Phase 2: pl-image × 2 cover options (192×344, ref=picked thumbnail)
                                          → user APPROVES one
       → Phase 3: pl-style cast portraits (192×192, style=APPROVED cover, NO --no-bg)
       → Phase 4: pl-style objects        (192×192, style=APPROVED cover, NO --no-bg)
       → Phase 5: pl-image scenes         (192×192, style=cover, refs=cast/objects)
       → Phase 6: 3× nearest-neighbor scale (every PNG, no API calls)
```

Stop and ask the user to approve between each generation phase (1–5) — never burn through them unattended. Phase 6 is a deterministic local post-process; it runs unattended after Phase 5 approval.

**Side-tools (not part of the pipeline):**
- `pl-bitforge.ts` — `/create-image-bitforge` for inpaint fixes ("regen the cape, leave everything else") via `--inpaint` + `--mask`. Max 200×200.
- `pl-pixelify.ts` — `/image-to-pixelart` for converting an author-supplied photo / sketch / AI render into pixel art before Phase 1 ideation.

## Common Gotchas

1. **Never exceed 4 `reference_images` per call.** Hard API limit on `/generate-image-v2`. If a scene's brief lists more than 4, prioritize the most identity-critical (named speakers > silent presences > objects), describe the rest in prose, and tell the user which ones you dropped.

2. **`PIXELLAB_TOKEN` must be set.** Get one at https://pixellab.ai/account and `export PIXELLAB_TOKEN=…`. The scripts hard-fail with a clear message if it's missing — don't guess and try anyway.

3. **Background handling — model-specific.** Phase 5 scenes, the cover, and ideation thumbnails always keep their background. For portraits/objects (Phase 3/4), `pl-style.ts` (the recommended path) **must NOT receive `--no-bg`** — `/generate-with-style-v2` corrupts the output when `no_background: true` is sent alongside a `style_image`. Cast/object portraits ship with backgrounds; if a portrait needs to composite cleanly into a scene later, mask it post-generation with `pl-bitforge.ts --inpaint` + a mask painted over the background. The `--no-bg` flag only behaves correctly on `pl-pixflux.ts` and `pl-pixen.ts`, neither of which is the recommended Phase 3/4 path.

4. **Two response patterns — sync and async.** `/create-image-pixen`, `/create-image-pixflux`, `/create-image-bitforge`, `/image-to-pixelart` are synchronous (HTTP 200 with image data) and don't need polling. `/generate-image-v2` and `/generate-with-style-v2` are async (`202 + job_id`) and `pl-poll.ts:pollJob` handles them. Don't bypass the polling helpers.

5. **Cap simultaneous jobs at 3–5.** The API rate-limits with 429 above that. Phase 1 (10 pixen calls) is the only place where parallelism matters; batch in groups of 3–5 to stay under the limit. Other phases are serial per asset.

6. **Reuse `seed` to tweak; change `seed` to re-roll.** Same seed + slightly edited prompt = a refined version of the last shot. Different seed = a fresh composition. For Phase 1, use 10 different seeds so the user sees real diversity; for Phase 2, use 2 different seeds for the cover options.

7. **Scenes pass the COVER as `style_image`, cast/objects as `reference_images`.** The cover is the style anchor (aesthetic). Character portraits go in `reference_images` for subject identity. Mixing these up produces scenes that look like the portrait rather than the cover. `pl-image.ts` accepts both: `--style <cover>` and `--refs <a.png,b.png,…>`.

8. **The skill is idempotent.** If `<##>-<slug>.png` already exists in the target directory, skip it unless the user explicitly asks for a regenerate. Resume after interruption by re-invoking with the same slug.

9. **Reference dimensions cap the scene's content area.** `/generate-image-v2` constrains generated content to the scale of its `reference_images`. **`pl-image.ts` automatically pre-scales every ref to the scene's canvas size with nearest-neighbor**, writing the scaled copy under `.cache/` next to the original. Don't bypass this by sending refs at their native size.

10. **No legible text in scenes.** Pixel-art models render real words as garbled letterforms. Describe signage by shape, color, and ornament — never by what it says. See `references/prompt-patterns.md` for the positive-descriptor pattern.

11. **Sizes are locked per phase, not per asset.** Ideation 192×192, Cover 192×344, Cast 192×192, Objects 192×192, Scenes 192×192. The scripts validate post-write and hard-fail on mismatch. Edit the brief template if the canonical needs to change project-wide; don't override per call.

12. **Sync model size caps differ.** pixen max dim 768, pixflux max 400×400, bitforge max 200×200, pixelify output max 320×320. The default 192×192 fits all of them. If a one-off asset needs more, use the appropriate model — not the wrong one with a too-large request.

## File structure

```
.agents/skills/wondo-pixellab-assets/
├── SKILL.md                  (this file)
├── references/
│   ├── endpoints.md          # request/response shapes for every endpoint this skill uses
│   ├── prompt-patterns.md    # style suffix, no_background, seed strategy
│   └── brief-template.md     # the markdown shape Phase 0 produces
└── scripts/
    ├── pl-poll.ts            # shared: pollJob, postSync, imgToB64, parseFlags
    ├── pl-pixen.ts           # CLI: /create-image-pixen   (Phase 1, sync)
    ├── pl-image.ts           # CLI: /generate-image-v2    (Phase 2 cover, Phase 5 scenes; async)
    ├── pl-pixflux.ts         # CLI: /create-image-pixflux (Phase 3 cast, Phase 4 objects; sync)
    ├── pl-bitforge.ts        # CLI: /create-image-bitforge (side-tool: inpaint; sync)
    ├── pl-pixelify.ts        # CLI: /image-to-pixelart    (side-tool: photo→pixel; sync)
    ├── pl-style.ts           # CLI: /generate-with-style-v2 (legacy; kept for backwards-compat)
    └── pl-scale.ts           # CLI: nearest-neighbor 3× upscale (Phase 6, local-only)
```

Outputs land in `stories/<slug>/assets/` (gitignored):

```
stories/<slug>/assets/
├── brief.md
├── 00-ideation/
│   ├── 00.png  01.png … 09.png       (10 pixen thumbnails)
│   └── PICKED.txt                     (user's two picks, one filename per line)
├── 01-cover/
│   ├── option-a.png  option-b.png
│   └── APPROVED.png                   (copy of the user's pick)
├── 02-cast/   02-<slug>.png  03-<slug>.png  …
├── 03-objects/   07-<slug>.png  …
├── 04-scenes/   11-<slug>.png  12-<slug>.png  …
└── 05-3x/                             (Phase 6 — mirrors the five subdirs above at 3× resolution)
    ├── 00-ideation/  …
    ├── 01-cover/     …
    ├── 02-cast/      …
    ├── 03-objects/   …
    └── 04-scenes/    …
```

## Inputs

- **Required:** a story slug and an existing `stories/<slug>/brief.md`. The brief is the output of the `wondo-interactive-fiction` skill's Phase 9 — that skill walks the assembled Ink file once and emits the brief, so this skill never has to re-derive cast / scenes / endings.

If the user invokes the skill without a slug, ask which story. If the brief is missing, tell them to run `wondo-interactive-fiction` first.

## Phase 0 — Read the brief

The brief is the contract — every prompt this skill sends comes from it. This skill is consumer-only here; it does not draft.

1. Look for `stories/<slug>/brief.md`. If it exists, read it and proceed to Phase 1.
2. If it doesn't exist, tell the user:

   > No brief found at `stories/<slug>/brief.md`. Run `wondo-interactive-fiction` first — its Phase 9 produces the brief from your assembled `.ink` file.

3. Stop. Don't fabricate a brief from the Ink file directly; that work belongs upstream.

Once a brief exists and the user has reviewed / edited it, they give you the green light to start Phase 1.

## Phase 1 — Ideation (pixen)

Read the brief's "Ideation prompt" (a tight 1–2-sentence cover summary). Generate **10 thumbnail concepts** with different seeds.

```bash
PIXELLAB_TOKEN=$PIXELLAB_TOKEN node --no-warnings=ExperimentalWarning \
  .agents/skills/wondo-pixellab-assets/scripts/pl-pixen.ts \
  --prompt "<ideation prompt + style suffix>" \
  --width 192 --height 192 \
  --seed 1000 \
  --out stories/<slug>/assets/00-ideation/00.png
```

Repeat with seeds 1001 through 1009. Run in batches of 3–5 to stay under the 429 cap; pixen is fast (sync, no polling) so total wall time is minimal.

When all 10 thumbnails exist, print the contact sheet:

```
Phase 1 — Ideation thumbnails:
  00 stories/<slug>/assets/00-ideation/00.png  (seed 1000)
  01 …                                              (seed 1001)
  …
  09 …                                              (seed 1009)

Open them in Preview/Finder and pick TWO. Reply with "pick 03 07" (or two numbers of your choice), or "regen all" for a new sheet, or "regen 04" to re-roll a single thumbnail with a fresh seed.
```

**Stop.** On user pick, write `00-ideation/PICKED.txt` with the two filenames (one per line). Move to Phase 2.

## Phase 2 — Cover (style anchor)

Use the user's two picked thumbnails (separately) as `reference_image` for two cover options at 192×344.

```bash
PIXELLAB_TOKEN=$PIXELLAB_TOKEN node --no-warnings=ExperimentalWarning \
  .agents/skills/wondo-pixellab-assets/scripts/pl-image.ts \
  --prompt "<cover prompt + style suffix>" \
  --refs stories/<slug>/assets/00-ideation/<picked-A>.png \
  --width 192 --height 344 \
  --seed 100 \
  --out stories/<slug>/assets/01-cover/option-a.png
```

Repeat with the second pick → `option-b.png` (seed 101). The cover prompt is the brief's full cover description; the picked thumbnail biases composition. Append each (asset, seed, file, pick-source) to the brief's "Seed log" table.

When both options exist, print:

```
Phase 2 — Cover options:
  1. stories/<slug>/assets/01-cover/option-a.png  (seed 100, from ideation 03)
  2. stories/<slug>/assets/01-cover/option-b.png  (seed 101, from ideation 07)

Tell me which to approve, or "regen 1" to re-roll one with a new seed, or "back to ideation" to pick different thumbnails.
```

**Stop.** Wait for the user's pick. On approval (e.g., "approve 2"), copy the chosen file:

```bash
cp stories/<slug>/assets/01-cover/option-b.png \
   stories/<slug>/assets/01-cover/APPROVED.png
```

Note the approval in the seed log. Move to Phase 3.

## Phase 3 — Cast portraits (`pl-style.ts` with cover as style)

For each row in the brief's "Cast" table, in order. Use `pl-style.ts` (`/generate-with-style-v2`) with the APPROVED cover as `--style` — that endpoint's style transfer holds the cover's palette/grid/lighting while still generating distinct subjects from the prompt. **Do not pass `--no-bg`** (see gotcha #3); portraits ship with backgrounds and can be masked later via `pl-bitforge.ts --inpaint` if a clean composite is needed.

```bash
PIXELLAB_TOKEN=$PIXELLAB_TOKEN node --no-warnings=ExperimentalWarning \
  .agents/skills/wondo-pixellab-assets/scripts/pl-style.ts \
  --prompt "<character prompt>" \
  --style stories/<slug>/assets/01-cover/APPROVED.png \
  --style-description "<style suffix from the brief>" \
  --width 192 --height 192 \
  --seed 200 \
  --out stories/<slug>/assets/02-cast/<##>-<char-slug>.png
```

The cover can be at its native 192×344 — `pl-style.ts` reads dimensions from the PNG IHDR; the style image does not need to match canvas size. Increment seeds across characters (200, 201, …) so each portrait has a stable identity to re-roll back to. Skip any `<##>-*.png` that already exists.

`pl-style.ts` is async; the API rate-limits when 4+ jobs are pending, so prefer 3 in parallel.

After all cast portraits exist, print a numbered list and ask:

```
Phase 3 — Cast:
  02 stories/<slug>/assets/02-cast/02-<slug>.png   <character name>
  03 stories/<slug>/assets/02-cast/03-<slug>.png   <character name>
  …

Tell me which to approve, or "regen 03" to re-roll a portrait, or "regen 03 with <hint>" to tweak the prompt.
```

**Stop.** On regenerate-with-hint, edit only the description, keep the same seed; on plain regenerate, increment the seed.

**Why not `pl-pixflux.ts --init`?** Empirically pixflux with the cover passed as `init_image` reproduces the cover almost verbatim regardless of `init-strength` — the prompt barely steers it. `pl-bitforge.ts --init` is even worse. `pl-style.ts` with `--style` is the only path that holds the aesthetic without copying the source. Use pixflux only when you want a hard composition lock (e.g., regenerating the same character at a slightly tweaked angle from a previous portrait).

## Phase 4 — Objects (`pl-style.ts` with cover as style)

Identical loop to Phase 3 but reading the brief's "Objects" table; outputs land in `stories/<slug>/assets/03-objects/<##>-<slug>.png`. Same flags: `--style <APPROVED cover>`, `--style-description "<suffix>"`, `--width 192 --height 192`, **no `--no-bg`**. Increment seeds 700, 701, … so cast and object seed ranges don't collide.

Stop and ask for approval the same way.

## Phase 5 — Scenes (pl-image, cover style + cast/object refs)

For each row in the brief's "Scenes" table:

1. Resolve `reference_images` from the table's asset numbers. For each asset number, find the file at `02-cast/<##>-*.png` or `03-objects/<##>-*.png`. If a referenced asset doesn't exist, surface the error to the user — do not guess.
2. Cap the list at 4. If the brief lists more, drop the lowest-priority and tell the user which.
3. Call:

```bash
PIXELLAB_TOKEN=$PIXELLAB_TOKEN node --no-warnings=ExperimentalWarning \
  .agents/skills/wondo-pixellab-assets/scripts/pl-image.ts \
  --prompt "<scene prompt naming each ref by number + style suffix>" \
  --style stories/<slug>/assets/01-cover/APPROVED.png \
  --refs stories/<slug>/assets/02-cast/02-sills.png,stories/<slug>/assets/02-cast/03-taylor.png \
  --width 192 --height 192 \
  --seed 1100 \
  --out stories/<slug>/assets/04-scenes/<##>-<slug>.png
```

`pl-image.ts` will pre-scale the cast/object refs to 192×192 (nearest-neighbor) before posting. Skip any `<##>-*.png` that already exists.

After a batch (default 3 scenes at a time to avoid 429), print the paths and ask for approve / regenerate. Continue through the table.

## Phase 6 — 3× Scale (nearest-neighbor)

Once Phase 5 is approved, run a single deterministic post-process that upscales **every** PNG in the five phase folders to 3× their native size and writes the results to `stories/<slug>/assets/05-3x/<phase>/<filename>.png`. This is the deliverable resolution.

The scaling is **nearest-neighbor only**: each input pixel becomes a 3×3 block of identical pixels. No anti-aliasing, no resampling, no smoothing — pixel art keeps its crisp grid. Sharp's `kernel: 'nearest'` is the implementation.

```bash
node --no-warnings=ExperimentalWarning \
  .agents/skills/wondo-pixellab-assets/scripts/pl-scale.ts \
  --slug <story-slug>
```

No API calls, no token, no per-asset gate. The script:

- Mirrors the phase subdirs under `05-3x/`.
- Skips files that already exist in `05-3x/` (idempotent — same skip rule as the rest of the skill). Pass `--force` to overwrite.
- Prints `wrote 05-3x/<phase>/<file>.png (W×H -> W'×H')` per file.
- Defaults to factor 3; override with `--factor N` (integer ≥ 2). Anything other than 3 is a user override — surface it in the message back to the user.

After it runs, print a one-line summary (`scaled=N skipped=M factor=3x output=stories/<slug>/assets/05-3x`) and tell the user where to find the deliverables. Final cover delivery is 576×1032; cast / objects / scenes deliver at 576×576.

## Recovery

- **429 at submit time:** drop concurrency and retry. The polling helper backs off automatically while polling.
- **Bad output ("doesn't look like the character"):** regenerate with the *same* seed and a sharper prompt before changing the seed. If three same-seed regens don't fix it, reroll with a fresh seed.
- **One element wrong (e.g., cape colour):** instead of full re-roll, use `pl-bitforge.ts` with `--inpaint` (the existing image) + `--mask` (a PNG painted white over the bad area) to regenerate just that region.
- **Partial run / interruption:** re-invoke the skill with the same slug. The skill skips any asset whose target file already exists. If the user wants a regenerate, delete the file first or pass an explicit "regen <##>" instruction.
- **Cover doesn't match expectations after Phase 2:** never proceed to Phase 3 with a cover the user is lukewarm on — Phase 3/4/5 all inherit its style, and re-running them later costs as much as redoing them now.

## Quick API cheat sheet

```bash
# Phase 1 — ideation thumbnail (sync, no polling)
node --no-warnings=ExperimentalWarning .agents/skills/wondo-pixellab-assets/scripts/pl-pixen.ts \
  --prompt "<…>" --width 192 --height 192 --seed 1000 \
  --out stories/<slug>/assets/00-ideation/00.png

# Phase 2 — cover (ref = picked thumbnail)
node --no-warnings=ExperimentalWarning .agents/skills/wondo-pixellab-assets/scripts/pl-image.ts \
  --prompt "<…>" --refs <picked-thumbnail.png> \
  --width 192 --height 344 --seed 100 \
  --out stories/<slug>/assets/01-cover/option-a.png

# Phase 3/4 — cast or object (style = APPROVED cover, NO --no-bg, async)
node --no-warnings=ExperimentalWarning .agents/skills/wondo-pixellab-assets/scripts/pl-style.ts \
  --prompt "<character/object prompt>" \
  --style <APPROVED cover> \
  --style-description "<style suffix from the brief>" \
  --width 192 --height 192 --seed 200 \
  --out stories/<slug>/assets/02-cast/02-<slug>.png

# Phase 5 — scene (style = cover, refs = cast/objects, max 4; refs auto-prescaled)
node --no-warnings=ExperimentalWarning .agents/skills/wondo-pixellab-assets/scripts/pl-image.ts \
  --prompt "<…>" --style <APPROVED cover> \
  --refs <p1.png>,<p2.png>,<p3.png> \
  --width 192 --height 192 --seed 1100 \
  --out stories/<slug>/assets/04-scenes/11-<slug>.png

# Phase 6 — 3x nearest-neighbor scale (no API calls, runs unattended)
node --no-warnings=ExperimentalWarning .agents/skills/wondo-pixellab-assets/scripts/pl-scale.ts \
  --slug <slug>
# Output: stories/<slug>/assets/05-3x/{00-ideation,01-cover,02-cast,03-objects,04-scenes}/*.png

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
| `references/endpoints.md` | Request/response shapes for every endpoint this skill uses. Points at https://api.pixellab.ai/v2/llms.txt as the canonical source of truth. |
| `references/prompt-patterns.md` | Style suffix discipline, prompt ordering, seed strategy, why no negative prompts. |
| `references/brief-template.md` | The markdown skeleton Phase 0 fills, plus drafting heuristics. |
| https://api.pixellab.ai/v2/llms.txt | **Canonical API spec.** Fetch this whenever an endpoint detail is unclear or the spec may have drifted. |
| `.context/attachments/pixellab-api-guide.md` | Original guide this skill is built on — endpoint map for the rest of the API (rotations, animation, sprites). |
| `.agents/skills/wondo-interactive-fiction/SKILL.md` | Knot / tag / variable structure for Phase 0 brief drafting; produces the `.ink` file this skill consumes. |
