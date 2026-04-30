# Prompt patterns

A few invariants that hold across every call this skill makes. Most are enforced by the helper scripts; this doc explains *why* so you can override sensibly when a brief calls for it.

## Style suffix is appended to every description

The brief's "Prompt suffix" (Section 1) is the lowest-common-denominator aesthetic — palette, medium, lighting, vibe. Append it to every `description` field, including portraits and objects. Example suffix:

> neon steampunk pixel art, magenta and cyan glow, indigo background, brass detail, hard pixels, dithered shading

For Phase 2/3 (`pl-style.ts`), pass the suffix as `--style-description` *and* repeat it inside the `--prompt`. The model uses `style_description` to constrain stylistic drift; repeating it in the prompt biases the noun/composition layer toward the same vocabulary.

## `style_options` are always on for `/generate-image-v2`

`pl-image.ts` hardcodes `{ color_palette: true, outline: true, detail: true, shading: true }`. These tell the model to mimic the four most reliably-transferable properties of `style_image`. Disabling any of them only makes sense if you're deliberately trying to break style-lock for an experimental shot — which means you don't want this skill anyway.

## `no_background = true` for portraits and objects, never for scenes

Phase 2/3 outputs composite into Phase 4 scenes. They must be transparent so the model isn't fighting two backgrounds. Phase 4 outputs *are* the background — `no_background` would erase the whole point.

The script wires this via `--no-bg`:
- `pl-style.ts --no-bg` → portraits/objects (always)
- `pl-image.ts` (Phase 1 cover) → omit `--no-bg`
- `pl-image.ts` (Phase 4 scene) → omit `--no-bg`

## Reference scale, not prompt language, controls frames

If a scene comes back with a transparent / white frame around the content, the cause is almost certainly that one of its `reference_images` is smaller than the scene canvas. The API caps generated content to the references' scale (e.g. a 256×256 ref in a 384×384 canvas → ~240×240 of content + ~144 pixels of padding around it).

**`pl-image.ts` handles this automatically** by nearest-neighbor pre-scaling every ref to the canvas size before posting. The scaled cache lives at `<refdir>/.cache/<name>.scaled-<W>x<H>.png` so it's reused across re-rolls.

Prompt language ("full bleed", "edge-to-edge", "no border") does not fix the cap — the API enforces it before the prompt is consulted. Don't waste prompt tokens on it; trust the script's pre-scaling.

## No legible in-image text

Pixel-art models struggle to render real words; what looks like "BANK" or "OPEN" usually arrives as a smear of pixels that reads worse than no signage at all. Even when the model gets it right, the words date the asset and pin it to one language.

When a scene needs signage, describe its **shape and ornament**, never its **text content**:

✅ "ornate stone facade with brass plaques and decorative cartouches above the doors"
❌ "BANK sign carved over the entrance"

✅ "warm amber storefront window with painted floral motif on the glass"
❌ "shop window reading 'TAYLOR & SONS' in gold lettering"

If the brief mentions a building or shop by its function (a bank, a chemist, a saloon), the prompt should evoke that function through architecture and props — never through readable letters.

## Seed strategy: reuse to tweak, change to re-roll

PixelLab is deterministic given (prompt, seed, references, style). This means:

- **Iterating an asset** ("the cape should be teal, not green"): keep the same `--seed`, edit only the prompt. The composition stays close to what the user just approved; only the changed concept moves.
- **Genuinely re-rolling** ("this composition isn't working, try something different"): change `--seed` (e.g., increment by 1, or pick a new random integer). Each call gets a fresh roll.

The skill generates one asset per row by default — never burn API calls producing A/B/C alternatives upfront. If a regen is needed, prefer same-seed prompt iteration first; only switch seeds after same-seed regens have plateaued.

The scripts default to letting the API auto-pick a seed if `--seed` isn't passed. **Log every seed used** to the brief or a `seeds.txt` so any asset can be reproduced or further iterated.

## Prompt order: subject → action → environment → style suffix

The model weights the head of a long description more heavily. Put the most identity-critical content first, then mood/composition, then the boilerplate suffix.

✅ "The bald chemist Sills holds up a glowing magenta test tube while the cheerful Taylor leans in, mouth open in surprise. Lab bench between them with retorts and beakers. Side view, two figures, intimate scale. Neon steampunk pixel art, magenta tube glow lighting both faces, indigo background, brass instruments."

❌ "Pixel art, neon steampunk, magenta and cyan, indigo bg, brass detail, hard pixels, of two figures, where Sills (bald) holds a test tube and Taylor (cheerful) leans in…"

## When passing references, name them in the prompt

The model sees `reference_images` as visual hints, not labels. If your scene description says "the bald chemist holds up a tube," and your refs are `[Sills portrait, Taylor portrait]`, the model has to guess which ref is "the bald chemist." Be explicit: "The bald chemist Sills (image 1) holds up a tube while the cheerful Taylor (image 2) leans in." This often improves identity persistence.

## Negative prompts are not a thing here

PixelLab has no `negative_prompt` field. Phrasing like "no anime, no chibi, no smooth gradients" in the description sometimes helps and sometimes backfires (the model latches on to the rejected concept). Prefer positive descriptors of what you want.

## Style suffix can render as an artifact, not a vibe

The brief's "Prompt suffix" is meant as aesthetic shorthand, but pixen reads concrete-noun phrases as instructions to render those nouns. A suffix like `"pulp-cover red on banner moments"` makes pixen render a literal pulp-cover banner with garbled text on portraits where there is no banner. Symptom: pseudo-letters across the top of cast portraits.

Mitigation: when an asset doesn't include the artifact the suffix names, strip that phrase. Keep palette/medium/lighting; drop nouns that name an object the asset isn't.

✅ for cast: `"wartime-pulp pixel art, sodium-amber lamplight, ink-black shadows, hard pixels, dithered shading, 1940s noir register"`
❌ for cast: `"… pulp-cover red on banner moments …"` (no banner in a portrait)

## Cast / places need more than `--no-bg` to ship clean

`no_background: true` strips alpha based on what the model considers *background*. If the prompt names environment ("on the beach", "in any room", "at his desk"), the model paints those elements as *foreground composition* and they survive the alpha-strip — even though they're scenery you didn't want.

Cast/place portrait prompts get a hard isolation prefix:

> Isolated character portrait, head-and-shoulders to chest, plain transparent background, no scenery, no chair, no lamp, no text, no banner, no logo, no signage.

Then the figure description, with all environmental cues stripped:

✅ "lean middle-aged 1943 pulp-fiction writer in shirtsleeves and waistcoat, briar pipe in hand"
❌ "lean middle-aged writer in his cluttered study, leaning back in his armchair with the war chart behind him"

## Scene prompts: strip narrative imperatives — they render as captions

PixelLab models render literary phrasing as literal text in the image. Brief language like *"The first time the gift looks less like a wonder and more like a hijack."* gets composed as a caption across the bottom of the scene in pulp-cover lettering, garbled.

Symptoms: bottom-bar caption, top-bar headline, tag-lines on awnings.

Rule: a scene prompt is a stage direction, not a tagline. Keep it to physical description (who is where, doing what, in what light). Drop:

- Thesis statements ("The room has the precise wrong people in it.")
- Atmospheric tail-lines ("No spectacle — just a small, deliberate wrongness on the water.")
- Anything that reads like it could be the caption *under* the image rather than what the image *shows*.

Add an explicit anti-text guard to the suffix on every scene call:

> No text, no captions, no banners, no readable letters or words anywhere in the frame.

## Let the references do the identity work

References carry identity. The prompt's job is **action, position, posture, light** — not biography. Restating the character's age, hair color, or name in the prompt adds noise to the ref's signal and competes with the `usage_description`.

✅ "Ray sits at the desk on the left holding a briar pipe; Lisbeth stands one step back with arms folded."
❌ "Ray (lean middle-aged pulp-fiction writer in shirtsleeves with combed dark hair) sits at the desk on the left holding his briar pipe; Lisbeth (late twenties, mop of unruly wavy brown hair, sob-sister journalist) stands one step back."

The cast portrait already says "this is Ray." The prompt only needs to say what he's doing.

## Annotate references in prose by position number

When 3+ refs are passed, name them inline by their `--ref` order (`image 1`, `image 2`, …) so the model binds the right portrait to the right role. This reinforces `usage_description` and reduces identity swaps in dense scenes.

✅ "The heavyset man (image 1) reclines propped on his elbows on the dark sand; the young woman (image 2) stands one step back with her arms crossed."
❌ "The heavyset man reclines propped on his elbows on the dark sand; the young woman stands one step back with her arms crossed." (model has to guess which ref maps to which role)

## Avoid words that name printed text artifacts

Words like *newspaper, headline, front page, magazine cover, signage, poster* induce text rendering even when the prompt forbids it. If an item is a newspaper page, describe its visual content only:

✅ "a torn cream-paper page with ragged edges; at the center, a coarse algae-green muscular man-shape rising from rough sea-lines"
❌ "a torn pulp-newspaper page with a bold black 8-column headline at the top, beneath it a sketch of a green giant rising from the sea"

Even with "no readable letters" guards, the word "newspaper" alone is enough to get pseudo-headlines. The fix is structural: don't name the artifact, describe what's on the page.

## PixelLab content-policy traps

`/generate-image-v2` returns `status: failed` with `detail: "Generation failed because it is against policy."` on certain phrasings even when the underlying scene is innocuous. Known triggers from real briefs:

- `"stretched on the sand"` (body + beach context)
- `"looking smaller than he was"` (body diminishment language)
- Naming a character whose name reads as a slur or sensitive term combined with body imagery

Mitigation: rephrase to neutral physical language. `"reclining propped on his elbows"` ships; `"stretched on the sand"` blocks. `"sitting quietly in the armchair"` ships; `"looking smaller than he was"` blocks. The fix is mechanical and rarely requires reworking the actual scene.
