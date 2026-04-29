# The Man Who Saved New York — Asset Brief

Story slug: `saved-new-york`
Source: `stories/saved-new-york/saved-new-york.ink`
Generated: 2026-04-28

## Ideation thumbnails (Phase 1)

| # | Asset | Endpoint | Size | Notes |
|---|---|---|---|---|
| 00 | Ideation thumbnails | /create-image-pixen | 192x192 | ~10 fast text-only concepts from the cover prompt below. User picks 2 to seed Phase 2. |

### Ideation prompt (≤2 sentences)
> <!-- AUTHOR: a tight, evocative summary of the cover scene. Suggested direction: a sardonic schemer at a window, a frightened second man in his armchair, the city outside under news-ticker glow. Bias toward atmosphere and silhouette over likeness. -->

## Style anchor (Phase 2)

| # | Asset | Endpoint | Size | Notes |
|---|---|---|---|---|
| 01 | Cover illustration | /generate-image-v2 | 192x344 | Generated from selected ideation thumbnails as `reference_image`. Becomes the `init_image` / `style_image` for everything that follows. |

### Cover prompt
> <!-- AUTHOR: one-paragraph hero scene description, ending with the style suffix. The cover should signal: paranoid first-person sardonic, modernized New York at night, two men silhouetted at a high window, a city skyline that hints at a manipulable mass below. End with the style suffix. -->

### Cover variations to try
- option-a (seed 100): wide composition, environment-forward — skyline dominant, figures small at window
- option-b (seed 101): tight composition, character-forward — Ray and Jenks framed close, city as glow
- option-c (seed 102): atmospheric, painterly — mood-led, less figural definition

## Style bible

### Prompt suffix (append to every description)
> <!-- AUTHOR: e.g. "muted-noir pixel art, sodium-vapor amber and TV-static blue, charcoal background, hard pixels, dithered shading". The modernized 1943-pulp register suggests a deliberately retro-noir palette with one anachronistic modern accent (a phone glow, a chyron). -->

### style_options (every /generate-image-v2 call)
`{ color_palette: true, outline: true, detail: true, shading: true }`

### Color palette (informational)
- Primary: <!-- AUTHOR: hex -->
- Accent 1: <!-- AUTHOR: hex -->
- Accent 2: <!-- AUTHOR: hex -->
- Background: <!-- AUTHOR: hex -->

## Cast (Phase 3)

| # | Character | Endpoint | Size | Appears in scenes | Prompt |
|---|---|---|---|---|---|
| 02 | Ray | /create-image-pixflux (init=cover) | 192x192 | 11, 12, 13, 14, 16, 17, 19, 20 | <!-- AUTHOR: middle-aged sardonic SF novelist; rumpled-but-trying; pose suggests scheming, not action; a writer who poses for himself. End with style suffix. --> |
| 03 | Jenks | /create-image-pixflux (init=cover) | 192x192 | 11, 12, 13, 14, 15, 16, 17, 18 | <!-- AUTHOR: heavy-set, sweating, haunted; the body language of a man who knows something is wrong with him; tics of involuntary stillness; pulled-from-1943-pulp made modern. --> |
| 04 | Lisbeth | /create-image-pixflux (init=cover) | 192x192 | 12, 13, 15, 16, 19 | <!-- AUTHOR: aspiring journalist; alert, watchful, the only one who hasn't already lied to herself; modernized 1943 cast member, no period costume cues. --> |
| 05 | Green | /create-image-pixflux (init=cover) | 192x192 | 12, 13, 17 | <!-- AUTHOR: cartoonist-turned-clip-economy-hustler; knowing grin; the friend who would film a tragedy. --> |
| 06 | Halloran Vance | /create-image-pixflux (init=cover) | 192x192 | 17, 18, 20 | <!-- AUTHOR: oligarch financier; portrait register; the face that appears in news graphics rather than in person; allow the visual to feel a half-step removed from the rest of the cast (he's an icon, not a participant, until he isn't). --> |

## Objects (Phase 4)

<!-- AUTHOR: Cummings's source has minimal props. The modernization could surface 2–4. Suggested candidates:
     - 07: A phone or laptop showing chyrons (the reader-visible vance_in_news meter, made physical)
     - 08: An overturned armchair / couch (Jenks's body during a possession; recurring composition)
     - 09: A microphone / mic stand (the rally where the misfire happens)
     Edit / extend / cut as needed. -->

| # | Object | Endpoint | Size | Appears in scenes | Prompt |
|---|---|---|---|---|---|
| 07 | <!-- AUTHOR --> | /create-image-pixflux (init=cover) | 192x192 | <!-- --> | <!-- --> |

## Scenes (Phase 5)

| # | Scene | Endpoint | Size | reference_images | Prompt |
|---|---|---|---|---|---|
| 11 | `start` — study confession | /generate-image-v2 (style=cover) | 192x192 | #02, #03 | <!-- AUTHOR: Ray's study at dusk; Jenks in the armchair, sweating; Ray's writer-pose. The first-meeting tableau. --> |
| 12 | `demos_arrival` — Lisbeth and Green enter | /generate-image-v2 (style=cover) | 192x192 | #02, #03, #04, #05 | <!-- AUTHOR: four bodies in a small room; Jenks visibly worse; Lisbeth and Green arriving from outside. Cap reference_images at 4 — keep all four cast. --> |
| 13 | `demo_first` — passerby at the window | /generate-image-v2 (style=cover) | 192x192 | #02, #03, #04 | <!-- AUTHOR: Cummings's traffic-directing scene, modernized. The passerby in the street; Jenks slack in his chair; Ray and Lisbeth at the window. --> |
| 14 | `demo_second` — neighbor through wall | /generate-image-v2 (style=cover) | 192x192 | #02, #03 | <!-- AUTHOR: cross-section feel; Jenks in chair, neighbor in another apartment; one space rendered as two. --> |
| 15 | `scheme_research` — Lisbeth digging | /generate-image-v2 (style=cover) | 192x192 | #02, #03, #04 | <!-- AUTHOR: open-source intelligence vibe; Lisbeth at a laptop; Jenks watching; Ray pretending to run a war room. --> |
| 16 | `scheme_solo` — Ray and Jenks alone | /generate-image-v2 (style=cover) | 192x192 | #02, #03 | <!-- AUTHOR: smaller room than 15; the dictation scene; the moment Jenks becomes a tool in Ray's mind. --> |
| 17 | `climax_intro` — the night before | /generate-image-v2 (style=cover) | 192x192 | #02, #03, #04, #05 | <!-- AUTHOR: late-night domestic; everyone awake; the historic moment Ray believes he's narrating. --> |
| 18 | `vance_inhabited` — Jenks-as-Vance | /generate-image-v2 (style=cover) | 192x192 | #03, #06 | <!-- AUTHOR: dual-image — Vance moving through Vance's evening, Jenks's body twitching on a couch. The signature scene of the modernized story. --> |
| 19 | `mob_misfire` — institutionally monstrous | /generate-image-v2 (style=cover) | 192x192 | #03 | <!-- AUTHOR: the modern Green Giant equivalent. Jenks is briefly *the rally* — a crowd rendered as a single body, mass-as-creature. The scene that earns the story its title. -->
| 20 | `END_quiet_love` — canonical close | /generate-image-v2 (style=cover) | 192x192 | #02, #03, #04 | <!-- AUTHOR: Jenks and Lisbeth holding hands; Ray off to the side; the gift gone; the city still glowing through a window with Vance still on the news. Cummings's sardonic shrug, modernized. --> |

**Rule:** never list more than 4 reference_images per scene. Scene 12 hits the cap; if you add Vance to a scene that already has 4 cast, drop the lowest-priority one or move Vance to text.

## Generation order

### Phase 1 — Ideation (no dependencies)
- 00 Pixen thumbnails ×10 (192×192) → user approves 2

### Phase 2 — Cover (reference_image = approved ideation thumbnail)
- 01 Cover ×3 options @ 192×344 → user approves 1

### Phase 3 — Cast portraits (init_image = APPROVED cover)
- 02-06 Pixflux portraits @ 192×192, no_background = true

### Phase 4 — Objects (init_image = APPROVED cover)
- 07-NN Pixflux objects @ 192×192, no_background = true

### Phase 5 — Scenes (style_image = APPROVED cover; reference_images per scene table)
- 11-20 /generate-image-v2 scenes @ 192×192

### Phase 6 — 3× scale (deterministic, local)
- pl-scale produces 576×576 / 576×1032 deliverables under `05-3x/`

## Ink knot mapping

| Knot | Asset(s) | Notes |
|---|---|---|
| `start` | 11 | Opening tableau / first scene banner |
| `demos_arrival` | 12 | Cast assembly |
| `demo_first` | 13 | First demonstration; modernized traffic-directing scene |
| `demo_second` | 14 | Second demonstration; through-the-wall composition |
| `scheme_research` | 15 | Research montage |
| `scheme_solo` | 16 | Two-hander |
| `climax_intro` | 17 | Pre-climax assembly |
| `vance_inhabited` | 18 | The signature beat |
| `mob_misfire` | 19 | The Green Giant equivalent (institutional misfire) |
| `END_quiet_love` | 20 | Canonical close |

Other knots (`setup_listen`, `scheme_intro_alt`, `wrong_target_arc`, `pyrrhic_strategist`, `fallout_doubt`, `fallout_love`, the three other END_* knots) reuse banners from the ten illustrated knots above; no dedicated assets unless the author elects to expand.

## Seed log (filled in during generation)

| Asset # | Seed | File | Notes |
|---|---|---|---|
| | | | |
