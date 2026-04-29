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
- **Genuinely re-rolling** ("none of these covers feel right, give me three more"): change `--seed` (e.g., increment by 1, or pick a new random integer). Each call gets a fresh roll.
- **Phase 1 cover options**: vary seed across the 2–3 options so the user sees real diversity, not three near-identical takes.

The scripts default to letting the API auto-pick a seed if `--seed` isn't passed. **Log every seed used** to the brief or a `seeds.txt` so regeneration is reproducible later.

## Prompt order: subject → action → environment → style suffix

The model weights the head of a long description more heavily. Put the most identity-critical content first, then mood/composition, then the boilerplate suffix.

✅ "The bald chemist Sills holds up a glowing magenta test tube while the cheerful Taylor leans in, mouth open in surprise. Lab bench between them with retorts and beakers. Side view, two figures, intimate scale. Neon steampunk pixel art, magenta tube glow lighting both faces, indigo background, brass instruments."

❌ "Pixel art, neon steampunk, magenta and cyan, indigo bg, brass detail, hard pixels, of two figures, where Sills (bald) holds a test tube and Taylor (cheerful) leans in…"

## When passing references, name them in the prompt

The model sees `reference_images` as visual hints, not labels. If your scene description says "the bald chemist holds up a tube," and your refs are `[Sills portrait, Taylor portrait]`, the model has to guess which ref is "the bald chemist." Be explicit: "The bald chemist Sills (image 1) holds up a tube while the cheerful Taylor (image 2) leans in." This often improves identity persistence.

## Negative prompts are not a thing here

PixelLab has no `negative_prompt` field. Phrasing like "no anime, no chibi, no smooth gradients" in the description sometimes helps and sometimes backfires (the model latches on to the rejected concept). Prefer positive descriptors of what you want.
