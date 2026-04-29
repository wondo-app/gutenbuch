---
name: pixellab-story-assets
description: Generate story-consistent pixel art for a Wondo story via the PixelLab API (not the MCP). Drafts an asset brief from a story slug, then runs a five-phase generation pipeline — cover → cast → objects → scenes → 3x scale — with reference_images carrying character identity across scenes. Use when the user wants story illustrations, character portraits, scene banners, or any task involving "PixelLab," "asset brief," "pixel art for a story," "character consistency across scenes," or "illustration set."
---

# PixelLab Story Assets

Generates a complete illustration set for a story so characters and style stay consistent across every scene. Uses the direct PixelLab API — the MCP can't pass `reference_images` or `style_image`, so MCP-generated portraits and scenes drift visually. Each phase here feeds the previous phase's approved output forward as a style or subject reference.

The shape of every run:

```
slug → brief draft → 2-3 cover options → APPROVED cover
                                          → cast portraits   (style_image = cover)
                                          → object renders   (style_image = cover)
                                          → scenes           (style_image = cover, reference_images = cast/objects)
                                          → 3x scale          (nearest-neighbor, every PNG, no API calls)
```

Stop and ask the user to approve between each generation phase (1–4) — never burn through them unattended. Phase 5 is a deterministic local post-process; it runs unattended after Phase 4 approval.

## Common Gotchas

1. **Never exceed 4 `reference_images` per call.** Hard API limit. If a scene's brief lists more than 4, prioritize the most identity-critical (named speakers > silent presences > objects), describe the rest in prose, and tell the user which ones you dropped.

2. **`PIXELLAB_TOKEN` must be set.** Get one at https://pixellab.ai/account and `export PIXELLAB_TOKEN=…`. The scripts hard-fail with a clear message if it's missing — don't guess and try anyway.

3. **`no_background = true` for portraits and objects, never for scenes.** Phase 2/3 outputs composite into Phase 4 scenes; they need transparent backgrounds. Phase 4 scenes *are* the background. Wired into the scripts as `--no-bg`; only `pl-style.ts` invocations should pass it.

4. **Pro endpoints return `202 + job_id`. Always poll.** `pl-poll.ts` handles this; never bypass it with a synchronous fetch.

5. **Cap simultaneous jobs at 3–5.** The API rate-limits with 429 above that. The skill runs phases serially per asset; if you parallelize within a phase, batch in groups of 3.

6. **Reuse `seed` to tweak; change `seed` to re-roll.** Same seed + slightly edited prompt = a refined version of the last shot. Different seed = a fresh composition. For Phase 1, use 2–3 different seeds so the user sees real options.

7. **Scenes pass the COVER as `style_image`, not the character portrait.** The cover is the style anchor. Character portraits go in `reference_images` for subject identity. Mixing these up produces scenes that look like the portrait rather than the cover.

8. **The skill is idempotent.** If `<##>-<slug>.png` already exists in the target directory, skip it unless the user explicitly asks for a regenerate. Resume after interruption by re-invoking with the same slug.

9. **Reference dimensions cap the scene's content area.** `/generate-image-v2` constrains generated content to the scale of its `reference_images`. A 384×384 scene with 256×256 cast refs fills only ~240×240 of canvas; the rest is transparent padding (looks like a white frame). **`pl-image.ts` automatically pre-scales every ref to the scene's canvas size with nearest-neighbor**, writing the scaled copy under `.cache/` next to the original. Don't bypass this by sending refs at their native size.

10. **No legible text in scenes.** Pixel-art models render real words as garbled letterforms. Describe signage by shape, color, and ornament — never by what it says. See `references/prompt-patterns.md` for the positive-descriptor pattern.

11. **Sizes are locked per phase, not per asset.** Cover 448×600, Cast 256×256, Objects 128×128, Scenes 384×384. The scripts validate post-write and hard-fail on mismatch. Edit the brief template if the canonical needs to change project-wide; don't override per call.

## File structure

```
.claude/skills/pixellab-story-assets/
├── SKILL.md                  (this file)
├── references/
│   ├── endpoints.md          # /generate-image-v2, /generate-with-style-v2, /background-jobs
│   ├── prompt-patterns.md    # style suffix, no_background, seed strategy
│   └── brief-template.md     # the markdown shape Phase 0 produces
└── scripts/
    ├── pl-poll.ts            # shared: pollJob, imgToB64, postJob, parseFlags
    ├── pl-image.ts           # CLI: /generate-image-v2 (Phase 1, Phase 4)
    ├── pl-style.ts           # CLI: /generate-with-style-v2 (Phase 2, Phase 3)
    └── pl-scale.ts           # CLI: nearest-neighbor 3x upscale (Phase 5)
```

Outputs land in `.context/pixellab/<slug>/` (gitignored):

```
.context/pixellab/<slug>/
├── brief.md
├── 01-cover/
│   ├── option-a.png  option-b.png  option-c.png
│   └── APPROVED.png        (copy of the user's pick)
├── 02-cast/   02-<slug>.png  03-<slug>.png  …
├── 03-objects/   07-<slug>.png  …
├── 04-scenes/   11-<slug>.png  12-<slug>.png  …
└── 05-3x/                       (Phase 5 — mirrors the four subdirs above at 3× resolution)
    ├── 01-cover/   …
    ├── 02-cast/    …
    ├── 03-objects/ …
    └── 04-scenes/  …
```

## Inputs

- **Required:** a story slug. Resolved against `seed/seed.json` chapters in Phase 0.

Sizes are locked per phase (Cover 448×600, Cast 256×256, Objects 128×128, Scenes 384×384) and validated post-write. References smaller than the scene canvas are auto-prescaled by `pl-image.ts`. Genuine size changes should edit the brief template's defaults rather than override per call.

If the user invokes the skill without a slug, ask which story.

## Phase 0 — Draft the brief

If `.context/pixellab/<slug>/brief.md` already exists, **skip drafting**, read the existing file, and proceed to Phase 1. (User may have hand-edited it between runs — never overwrite without asking.)

Otherwise:

1. Read `seed/seed.json`. Find the story whose slug field matches.
2. Walk its chapters. For each chapter (plaintext Ink), parse `=== knot ===` headers and `# tag: value` lines. The wondo-development skill (`.claude/skills/wondo-development/SKILL.md`) documents this structure — load it if anything about the source format is unclear.
3. Extract:
   - **Characters**: 5–8 most-recurring named entities in dialogue and prose.
   - **Objects**: 3–6 items that recur or drive plot beats.
   - **Scenes**: knots tagged `# SCENE: <n>` plus knots whose body sets a clearly-illustratable beat.
4. Write `.context/pixellab/<slug>/brief.md` using the template at `references/brief-template.md`. Fill the heuristics section's guidance into real prompts.
5. Print the brief path and stop. Tell the user:

   > Drafted the asset brief at `.context/pixellab/<slug>/brief.md`. Review and edit (especially the cover prompt and per-asset prompts), then say "ready" to start Phase 1.

Wait for "ready" or a similar approval before any API calls. The brief is the contract — every prompt this skill sends comes from it.

## Phase 1 — Cover (style anchor)

Read the brief's "Cover prompt" and "Cover variations to try" rows. Generate 2–3 options with **different seeds** so the user sees genuine diversity.

```bash
PIXELLAB_TOKEN=$PIXELLAB_TOKEN node --no-warnings=ExperimentalWarning \
  .claude/skills/pixellab-story-assets/scripts/pl-image.ts \
  --prompt "<cover prompt + style suffix>" \
  --width 448 --height 600 \
  --seed 100 \
  --out .context/pixellab/<slug>/01-cover/option-a.png
```

Repeat with seeds 101, 102 (or whatever the brief specifies). No `--style`, no `--refs`, no `--no-bg` — this *is* the style anchor.

Append each (asset, seed, file, hint) to the brief's "Seed log" table as you go.

When all options exist, print:

```
Phase 1 — Cover options:
  1. .context/pixellab/<slug>/01-cover/option-a.png  (seed 100, "<directional hint>")
  2. .context/pixellab/<slug>/01-cover/option-b.png  (seed 101, "<directional hint>")
  3. .context/pixellab/<slug>/01-cover/option-c.png  (seed 102, "<directional hint>")

Open them in Preview/Finder. Tell me which to approve, or "regen N" to re-roll one with a new seed, or "regen all" to start over.
```

**Stop.** Wait for the user's pick. On approval (e.g., "approve 2"), copy the chosen file:

```bash
cp .context/pixellab/<slug>/01-cover/option-b.png \
   .context/pixellab/<slug>/01-cover/APPROVED.png
```

Note the approval in the seed log. Move to Phase 2.

## Phase 2 — Cast portraits

For each row in the brief's "Cast" table, in order:

```bash
PIXELLAB_TOKEN=$PIXELLAB_TOKEN node --no-warnings=ExperimentalWarning \
  .claude/skills/pixellab-story-assets/scripts/pl-style.ts \
  --prompt "<character prompt + style suffix>" \
  --style .context/pixellab/<slug>/01-cover/APPROVED.png \
  --style-description "<style suffix from brief>" \
  --width 192 --height 192 \
  --no-bg \
  --seed 200 \
  --out .context/pixellab/<slug>/02-cast/<##>-<char-slug>.png
```

Increment seeds across characters (200, 201, …) so each portrait has a stable identity to re-roll back to. Skip any `<##>-*.png` that already exists.

After all cast portraits exist, print a numbered list and ask:

```
Phase 2 — Cast:
  02 .context/pixellab/<slug>/02-cast/02-<slug>.png   <character name>
  03 .context/pixellab/<slug>/02-cast/03-<slug>.png   <character name>
  …

Tell me which to approve, or "regen 03" to re-roll a portrait, or "regen 03 with <hint>" to tweak the prompt.
```

**Stop.** On regenerate-with-hint, edit only the description, keep the same seed (so the composition stays close); on plain regenerate, increment the seed.

## Phase 3 — Objects

Identical loop to Phase 2 but reading the brief's "Objects" table; outputs land in `.context/pixellab/<slug>/03-objects/<##>-<slug>.png`. Default size 192x192.

Stop and ask for approval the same way.

## Phase 4 — Scenes

For each row in the brief's "Scenes" table:

1. Resolve `reference_images` from the table's asset numbers. For each asset number, find the file at `02-cast/<##>-*.png` or `03-objects/<##>-*.png`. If a referenced asset doesn't exist, surface the error to the user — do not guess.
2. Cap the list at 4. If the brief lists more, drop the lowest-priority and tell the user which.
3. Call:

```bash
PIXELLAB_TOKEN=$PIXELLAB_TOKEN node --no-warnings=ExperimentalWarning \
  .claude/skills/pixellab-story-assets/scripts/pl-image.ts \
  --prompt "<scene prompt naming each ref by number + style suffix>" \
  --style .context/pixellab/<slug>/01-cover/APPROVED.png \
  --refs .context/pixellab/<slug>/02-cast/02-sills.png,.context/pixellab/<slug>/02-cast/03-taylor.png \
  --width 384 --height 384 \
  --seed 1100 \
  --out .context/pixellab/<slug>/04-scenes/<##>-<slug>.png
```

`pl-image.ts` will pre-scale the cast/object refs to 384×384 (nearest-neighbor) before posting, writing the scaled copies under `.cache/` next to the originals so re-rolls reuse them.

Skip any `<##>-*.png` that already exists.

After a batch (default 3 scenes at a time to avoid 429), print the paths and ask for approve / regenerate. Continue through the table.

## Phase 5 — 3x Scale (nearest-neighbor)

Once Phase 4 is approved, run a single deterministic post-process that upscales **every** PNG in the four phase folders to 3× their native size and writes the results to `.context/pixellab/<slug>/05-3x/<phase>/<filename>.png`. This is the deliverable resolution.

The scaling is **nearest-neighbor only**: each input pixel becomes a 3×3 block of identical pixels. No anti-aliasing, no resampling, no smoothing — pixel art keeps its crisp grid. Sharp's `kernel: 'nearest'` is the implementation.

```bash
node --no-warnings=ExperimentalWarning \
  .agents/skills/pixellab-story-assets/scripts/pl-scale.ts \
  --slug <story-slug>
```

No API calls, no token, no per-asset gate. The script:

- Mirrors the four phase subdirs (`01-cover`, `02-cast`, `03-objects`, `04-scenes`) under `05-3x/`.
- Skips files that already exist in `05-3x/` (idempotent — same skip rule as the rest of the skill). Pass `--force` to overwrite.
- Prints `wrote 05-3x/<phase>/<file>.png (W×H -> W'×H')` per file.
- Defaults to factor 3; override with `--factor N` (integer ≥ 2). Anything other than 3 is a user override — surface it in the message back to the user.

After it runs, print a one-line summary (`scaled=N skipped=M factor=3x output=.context/pixellab/<slug>/05-3x`) and tell the user where to find the deliverables.

## Recovery

- **429 at submit time:** drop concurrency and retry. The script also backs off automatically while polling.
- **Bad output ("doesn't look like the character"):** regenerate with the *same* seed and a sharper prompt before changing the seed. If three same-seed regens don't fix it, reroll with a fresh seed.
- **Partial run / interruption:** re-invoke the skill with the same slug. The skill skips any asset whose target file already exists. If the user wants a regenerate, delete the file first or pass an explicit "regen <##>" instruction.
- **Cover doesn't match expectations after Phase 1:** never proceed to Phase 2 with a cover the user is lukewarm on — Phase 2/3/4 all inherit its style, and re-running them later costs as much as redoing them now.

## Quick API cheat sheet

```bash
# Phase 1 — cover (no style, no refs)
npx tsx .claude/skills/pixellab-story-assets/scripts/pl-image.ts \
  --prompt "<…>" --width 448 --height 600 --seed 100 \
  --out .context/pixellab/<slug>/01-cover/option-a.png

# Phase 2/3 — character or object (style = cover, no_bg)
npx tsx .claude/skills/pixellab-story-assets/scripts/pl-style.ts \
  --prompt "<…>" --style <APPROVED cover> --style-description "<style suffix>" \
  --width 256 --height 256 --no-bg --seed 200 \
  --out .context/pixellab/<slug>/02-cast/02-<slug>.png

# Phase 4 — scene (style = cover, refs = cast/objects, max 4; refs auto-prescaled to canvas)
npx tsx .claude/skills/pixellab-story-assets/scripts/pl-image.ts \
  --prompt "<…>" --style <APPROVED cover> \
  --refs <p1.png>,<p2.png>,<p3.png> \
  --width 384 --height 384 --seed 1100 \
  --out .context/pixellab/<slug>/04-scenes/11-<slug>.png

# Phase 5 — 3x nearest-neighbor scale (no API calls, runs unattended)
node --no-warnings=ExperimentalWarning \
  .agents/skills/pixellab-story-assets/scripts/pl-scale.ts \
  --slug <slug>
# Output: .context/pixellab/<slug>/05-3x/{01-cover,02-cast,03-objects,04-scenes}/*.png
```

All three scripts read `PIXELLAB_TOKEN` from env, log progress to stderr, print the output path on stdout, and exit non-zero on failure.

## References

| File | What's in it |
|---|---|
| `references/endpoints.md` | Request/response shape for `/generate-image-v2`, `/generate-with-style-v2`, `/background-jobs/{id}`; what fields each phase fills. |
| `references/prompt-patterns.md` | Style suffix discipline, prompt ordering, seed strategy, why no negative prompts. |
| `references/brief-template.md` | The markdown skeleton Phase 0 fills, plus drafting heuristics for picking what counts as a character/object/scene. |
| `.context/attachments/pixellab-api-guide.md` | Original guide this skill is built on — endpoint map for the rest of the API (rotations, inpainting, sprites). |
| `.claude/skills/wondo-development/SKILL.md` | Story / chapter / knot / tag structure for Phase 0 brief drafting. |
