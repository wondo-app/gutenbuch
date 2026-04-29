# The Man Who Saved New York (Rework) — Asset Brief

Story slug: `saved-new-york-rework`
Source: `stories/saved-new-york-rework/saved-new-york-rework.ink`
Generated: 2026-04-29

## Ideation thumbnails (Phase 1)

| # | Asset | Endpoint | Size | Notes |
|---|---|---|---|---|
| 00 | Ideation thumbnails | /create-image-pixen | 192x192 | ~10 fast text-only concepts from the cover prompt below. User picks 2 to seed Phase 2. |

### Ideation prompt (≤2 sentences)
> A 1943 sardonic pulp writer's study at dusk, a sweating heavyset man collapsed in the only armchair, and beyond the open window the suggestion of wartime New York under blackout — pipe smoke, manuscript pages, a city that does not yet know what is going to happen on a beach.

## Style anchor (Phase 2)

| # | Asset | Endpoint | Size | Notes |
|---|---|---|---|---|
| 01 | Cover illustration | /generate-image-v2 | 192x344 | Generated from selected ideation thumbnails as `reference_image`. Becomes the `init_image` / `style_image` for everything that follows. |

### Cover prompt
> A wartime-1943 New York study at dusk: pulp writer Ray at a cluttered desk with a typewriter and a half-pulled manuscript page, Porky Jenks heavy-set and sweating slumped in the only armchair clutching a blue handkerchief, the open window behind them framing a city in dim blackout — silhouetted water towers, a single tram below, a wan sky. The frame should already promise something will rise from the dark sea. End with the style suffix.

### Cover variations to try
- option-a (seed 100): wide composition, environment-forward — study and window equally weighted, city dominant
- option-b (seed 101): tight composition, character-forward — Ray and Porky framed close, window only as glow
- option-c (seed 102): atmospheric, painterly — mood-led, low-light pulp register, less figural definition

## Style bible

### Prompt suffix (append to every description)
> wartime-pulp pixel art, sodium-amber and ink-black, dusty cream paper highlights, deep sea-purple shadows, hard pixels, dithered shading, 1940s noir register

### style_options (every /generate-image-v2 call)
`{ color_palette: true, outline: true, detail: true, shading: true }`

### Color palette (informational)
- Primary: <!-- AUTHOR: hex — sodium amber lamplight -->
- Accent 1: <!-- AUTHOR: hex — pulp-cover red for ending banners / blood-in-water moments -->
- Accent 2: <!-- AUTHOR: hex — algae green for the Giant -->
- Background: <!-- AUTHOR: hex — deep sea purple / blackout indigo -->

## Cast (Phase 3)

| # | Character | Endpoint | Size | Appears in scenes | Prompt |
|---|---|---|---|---|---|
| 02 | Ray | /create-image-pixflux (init=cover) | 192x192 | 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 | Middle-aged 1943 pulp-fiction writer; lean, slightly rumpled; pipe in hand; the bearing of a man who has just decided the war effort is downstream of his armchair. End with style suffix. |
| 03 | Porky Jenks | /create-image-pixflux (init=cover) | 192x192 | 11, 12, 13, 14, 15, 16, 17 | Heavy-set, sweating, haunted; thin sandy hair plastered to forehead; wilted collar; the body language of a man whose ego will not stay put inside it. End with style suffix. |
| 04 | Lisbeth | /create-image-pixflux (init=cover) | 192x192 | 12, 13, 14, 15, 17, 18, 19, 20 | Ray's daughter, late twenties, mop of unruly wavy brown hair, would-be sob-sister journalist; alert, watchful; the only one in the room who can see what's about to happen to Porky. End with style suffix. |
| 05 | Baldy Green | /create-image-pixflux (init=cover) | 192x192 | 12, 13, 14, 15, 17 | Middle-aged bald cartoonist for a big New York daily; family-man build; vaudeville-impresario energy when excited; pipe in hand on the beach. End with style suffix. |

<!-- The Old Woman (Ch.2 demo), the Green Giant (Ch.3), and the Nazi U-boat Commander (Ch.3) are *possessed by Porky* in their scenes. Treat them as scene-level subjects in the scene prompts (#13, #16, #17) rather than cast portraits — Porky's body on the chair / sand is the persistent visual, the host is the spectacle. -->

## Objects (Phase 4)

| # | Object | Endpoint | Size | Appears in scenes | Prompt |
|---|---|---|---|---|---|
| 07 | Armchair (the possession-vessel) | /create-image-pixflux (init=cover) | 192x192 | 11, 13 | Ray's only armchair, worn upholstery, tall back; rendered alone, slightly off-axis, as a vessel waiting to be filled. End with style suffix. |
| 08 | Pipe + tobacco pouch | /create-image-pixflux (init=cover) | 192x192 | 14, 15, 16 | A pulp-detective briar pipe and leather pouch, lit ember; the prop Ray and Baldy share on the beach to perform poise while a man's soul is at sea. End with style suffix. |
| 09 | Type-IXC U-boat silhouette | /create-image-pixflux (init=cover) | 192x192 | 16, 17 | Long low silhouette of a 1943 German U-boat at night, conning tower in profile, periscope wake; rendered as a single dark shape against deep purple water; no insignia. End with style suffix. |
| 10 | Daily News headline + giant sketch | /create-image-pixflux (init=cover) | 192x192 | 19 | A torn pulp-newspaper page: bold black headline "SANDY HOOK 'GIANT' SIGHTED — NAVY DENIES" and a coarse staff-artist sketch of an algae-green man-shape rising waist-deep from the sea. End with style suffix. |

## Scenes (Phase 5)

| # | Scene | Endpoint | Size | reference_images | Prompt |
|---|---|---|---|---|---|
| 11 | `start` — the visit | /generate-image-v2 (style=cover) | 192x192 | #02, #03, #07 | Ray's study at dusk; Ray (image 1) at his typewriter half-turned in his desk chair; Porky Jenks (image 2) wedged sweating into the armchair (image 3) clutching a blue handkerchief; one open window behind them with the dim glow of wartime New York beyond. |
| 12 | `demonstration_arrival` — Lisbeth and Baldy walk in | /generate-image-v2 (style=cover) | 192x192 | #02, #03, #04, #05 | The four of them in Ray's study mid-afternoon; Porky (image 2) slumped in the armchair; Ray (image 1) standing; Lisbeth (image 3) and Baldy (image 4) framed in the doorway just arrived from the street; introductions hanging in the air. (4 refs — at cap.) |
| 13 | `old_woman_demo` — traffic at the corner | /generate-image-v2 (style=cover) | 192x192 | #02, #03, #04 | Cross-section composition: Ray (image 1) and Lisbeth (image 3) at the open study window upstairs; Porky (image 2) limp in the armchair behind them with his head fallen back; in the street below an elderly woman in shawl and umbrella walks imperiously into a 1943 intersection holding the umbrella over her head, directing traffic, a streetcar swerving, a yellow cab honking. |
| 14 | `after_demo` / `planning_evening` — the war is on | /generate-image-v2 (style=cover) | 192x192 | #02, #04, #05, #08 | Late afternoon turning to evening; Ray (image 1) and Baldy (image 3) leaning over a hand-drawn chart with pipes (image 4) lit; Lisbeth (image 2) seated apart, arms folded, the only person in the room visibly opposing the plan being drawn. (4 refs — at cap.) |
| 15 | `beach_intro` — Sandy Hook at night | /generate-image-v2 (style=cover) | 192x192 | #02, #03, #04, #05 | A lonely stretch of Sandy Hook beach under a wan moon; long rhythmic lines of white surf; Porky (image 2) stretched on the sand, head and shoulders propped on his elbows; Ray (image 1) and Baldy (image 4) seated nearby with lit pipes; Lisbeth (image 3) standing one step back, arms crossed against the wind. (4 refs — at cap.) |
| 16 | `direct_sub_path` — the quiet take | /generate-image-v2 (style=cover) | 192x192 | #03, #09 | Porky's body (image 1) inert on dark sand in the foreground, breath barely visible; out beyond the breakers a long low U-boat silhouette (image 2) under a thin moon, its bow already canting wrong against the rocks; no spectacle, just a small wrongness on the water. |
| 17 | `green_giant_path` — the giant rises | /generate-image-v2 (style=cover) | 192x192 | #02, #03, #04, #05 | The signature beat: a five-hundred-foot algae-green man-shape wading waist-deep parallel to the beach toward Sandy Hook, glistening scales, gills at the neck, one hand reaching up a hundred feet to seize a low-flying Nazi plane; on the dark sand in the foreground Porky (image 2) lies inert while Ray (image 1), Lisbeth (image 3) and Baldy (image 4) watch transfixed. (4 refs — at cap.) |
| 18 | `END_quiet_love` — Cummings's sardonic shrug | /generate-image-v2 (style=cover) | 192x192 | #02, #03, #04 | Ray's study, eleven p.m. the next night; Lisbeth (image 3) and Porky (image 2) holding hands with the dying-calf look, *engaged*; Ray (image 1) framed alone on the other side of the room with the war chart still pinned to the wall behind him, slowly being made irrelevant. |
| 19 | `END_war_won` — Pyrrhic | /generate-image-v2 (style=cover) | 192x192 | #02, #03, #04, #10 | Months later: a wall of pinned-up newspaper clippings — among them the Daily News page (image 4) — Porky (image 2) seated in the armchair smaller than he was, Lisbeth (image 3) standing behind him with one hand on his shoulder not looking at Ray (image 1), who is mid-sentence and being unheard. (4 refs — at cap.) |
| 20 | `END_porky_lost` — Lisbeth in the doorway | /generate-image-v2 (style=cover) | 192x192 | #01, #04 | Ray's study at dawn; Lisbeth (image 2) standing in the doorway in last night's coat, face composed in the particular way faces compose themselves between cryings; Ray (image 1) on his feet across the room; the armchair (image 3 if available, else described) empty between them. |

**Rule:** never list more than 4 reference_images per scene. Scenes 12, 14, 15, 17, 19 are at the cap; if the author wants to add a host-form (Old Woman, Giant, Sub Commander) into a 4-cap scene, drop the lowest-priority cast member or describe the host in the prompt only.

`END_exposed` reuses scene #19's newspaper-page object (#10) plus a description of Bellevue intake; no dedicated banner unless the author elects to expand.

## Generation order

### Phase 1 — Ideation (no dependencies)
- 00 Pixen thumbnails ×10 (192×192) → user approves 2

### Phase 2 — Cover (reference_image = approved ideation thumbnail)
- 01 Cover ×3 options @ 192×344 → user approves 1

### Phase 3 — Cast portraits (init_image = APPROVED cover)
- 02-05 pl-style portraits @ 192×192, no_background = false (per pl-style + --no-bg gotcha)

### Phase 4 — Objects (init_image = APPROVED cover)
- 07-10 Pixflux objects @ 192×192, no_background = true

### Phase 5 — Scenes (style_image = APPROVED cover; reference_images per scene table)
- 11-20 /generate-image-v2 scenes @ 192×192

### Phase 6 — 3× scale (deterministic, local)
- pl-scale produces 576×576 / 576×1032 deliverables under `05-3x/`

## Ink knot mapping

| Knot | Asset(s) | Notes |
|---|---|---|
| `start` | 11 | Opening tableau / first scene banner |
| `demonstration_arrival` | 12 | Cast assembly |
| `old_woman_demo` | 13 | The iconic traffic-directing demo |
| `after_demo` / `planning_evening` | 14 | War-room moment + Lisbeth holdout |
| `beach_intro` | 15 | Sandy Hook tableau |
| `direct_sub_path` | 16 | Quiet-take branch banner |
| `green_giant_path` | 17 | Spectacle branch banner |
| `END_quiet_love` | 18 | Canonical close |
| `END_war_won` | 19 | Pyrrhic close |
| `END_porky_lost` | 20 | Tragic close |
| `END_exposed` | 10 + 19 reuse | No dedicated banner; reuse newspaper object |

Other knots (`end_of_visit`, `support_war`/`dial_back`/`lisbeth_intervenes`, `green_aftermath`/`green_finish`/`green_press`/`green_scattered`, `direct_aftermath`/`direct_retreat`/`direct_press`/`direct_press_safe`/`direct_press_lost`/`direct_scattered`, `early_quiet_love`, `withdrawal_check`, `morning_after_intro`) reuse the ten illustrated banners above; no dedicated assets unless the author elects to expand.

## Seed log (filled in during generation)

| Asset # | Seed | File | Notes |
|---|---|---|---|
| | | | |
