# The Man Who Saved New York (Rework) — Asset Brief

Story slug: `saved-new-york-rework`
Source: `stories/saved-new-york-rework/saved-new-york-rework.ink`
Generated: 2026-04-29

## Endings (context — not illustrated directly)

Parsed from `// Endings (locked at Gate 4):`. Endings shape which scenes are worth illustrating; they don't get dedicated banners.

| Ending | Target | Stance |
|---|---|---|
| `END_quiet_love` (canonical, dominant) | 50% | Lisbeth and Porky pair off; the gift evaporates; the war goes unwon; Ray shrugs. |
| `END_war_won` | 20% | Porky's possession of U-boat commanders works; the Battle of the Atlantic turns; Ray invisible to history. |
| `END_porky_lost` | 15% | Withdrawal fails inside an exploding sub; Porky's body never wakes; Lisbeth doesn't speak to Ray again. |
| `END_exposed` | 15% | Secrecy breaks; Bellevue intake; Ray's plan reduced to a footnote in someone else's scoop. |

## Style bible

### Prompt suffix (append to every description)
> wartime-pulp pixel art, sodium-amber lamplight and ink-black shadows, dusty cream paper highlights, deep sea-purple background, algae-green accent on the Giant, pulp-cover red on banner moments, hard pixels, dithered shading, 1940s noir register

### Color palette (informational)
- Primary: `#E8A33D` — sodium-amber lamplight (Ray's study, beach pipes, study window glow)
- Accent 1: `#C2362F` — pulp-cover red (Daily News banner, blood-in-water moments)
- Accent 2: `#6B8F4E` — algae green (the Giant rising)
- Background: `#1B1A3E` — deep sea purple / wartime-blackout indigo

## Cast (Phase 1)

Parsed from `// Cast (locked at Gate 3):`. Prompts kept focused — silhouette and key features, not biography.

| # | Character | Endpoint | Size | Appears in scenes | Prompt |
|---|---|---|---|---|---|
| 02 | Ray (protagonist, narrator) — wants to win the war from his armchair / mine the affair for material; 100% of runs | /create-image-pixen (no_background=true) | 512×512 | 31, 32, 33, 34, 35, 37, 38, 39, 40 | Middle-aged 1943 pulp-fiction writer, lean, slightly rumpled in shirtsleeves and waistcoat, briar pipe in hand, the bearing of a man who has just decided the war effort is downstream of his armchair. End with style suffix. |
| 03 | Porky Jenks — wants to be rid of the gift / be normal / not get committed; 95% of runs | /create-image-pixen (no_background=true) | 512×512 | 31, 32, 33, 34, 35, 36, 37, 38, 39 | Heavyset and sweating, thin sandy hair plastered to a damp forehead, wilted collar hanging on a bulging throat, pale blue eyes that look haunted, a big blue handkerchief crushed in one fist. End with style suffix. |
| 04 | Lisbeth (Ray's daughter) — wants to protect Porky from her father's scheme, falls in love along the way; 70% of runs | /create-image-pixen (no_background=true) | 512×512 | 32, 33, 34, 35, 37, 38, 39, 40 | Late twenties, a mop of unruly wavy brown hair, would-be sob-sister journalist with a press-room alertness, the only person in any room who can see what is about to happen to Porky. End with style suffix. |
| 05 | Baldy Green (cartoonist) — wants to monetize Porky for vaudeville/movies; 55% of runs | /create-image-pixen (no_background=true) | 512×512 | 32, 34, 35, 37 | Middle-aged, completely bald, family-man build in a slightly rumpled jacket, vaudeville-impresario energy when excited, briar pipe perpetually in hand on the beach. End with style suffix. |

## Places (Phase 2)

Three settings the story returns to. Cap is 4; one slot held in reserve for an `ending_exposed` Bellevue hallway if the author elects to expand.

| # | Place | Endpoint | Size | Appears in scenes | Prompt |
|---|---|---|---|---|---|
| 07 | Ray's 1943 study | /create-image-pixen (no_background=true) | 512×512 | 31, 32, 34, 38, 39, 40 | Cluttered writer's study at dusk: a desk with a typewriter and a half-pulled manuscript page, scattered carbon copies, one worn high-backed armchair (the vessel), an open sash window framing a dim glow of wartime New York beyond, a war-tactical chart pinned to the side wall. Rendered as an isolated transparent reference. End with style suffix. |
| 08 | Manhattan intersection at dusk | /create-image-pixen (no_background=true) | 512×512 | 33 | A 1943 New York street corner seen from above (looking down from a second-story window), streetcar tracks crossing, a traffic light on its post, a hat-shop awning, signage rendered as ornament and color not letters, the slow-Tuesday-afternoon stillness of a city under blackout. Rendered as an isolated transparent reference. End with style suffix. |
| 09 | Sandy Hook beach at night | /create-image-pixen (no_background=true) | 512×512 | 35, 36, 37 | A lonely stretch of Atlantic beach under a wan moon, long rhythmic lines of white surf rolling in, deep-purple water out to the horizon, leaden cloud cover, a single high-tide line of dark wrack on the sand. Rendered as an isolated transparent reference. End with style suffix. |

## Items (Phase 3)

Plot-critical visual props the prose returns to. Gate 7 has no inventory tokens; these are pixellab "items" — recurring objects, not Ink booleans.

| # | Item | Endpoint | Size | Appears in scenes | Prompt |
|---|---|---|---|---|---|
| 11 | The armchair (Porky's possession-vessel) | /create-image-pixen (no_background=true) | 512×512 | 31, 33, 38, 39 | A worn high-backed armchair upholstered in faded brown velvet, slightly off-axis, springs visibly tired, the only seat in a room — rendered alone as a vessel waiting to be filled. End with style suffix. |
| 12 | Pipe and tobacco pouch | /create-image-pixen (no_background=true) | 512×512 | 34, 35, 36, 37 | A pulp-detective briar pipe with a glowing ember in the bowl and a worn leather tobacco pouch beside it, the prop Ray and Baldy share to perform poise while a man's soul is at sea. End with style suffix. |
| 13 | Type-IXC U-boat silhouette | /create-image-pixen (no_background=true) | 512×512 | 36 | A long, low silhouette of a 1943 German U-boat at night, conning tower in profile, periscope wake, rendered as a single dark shape against deep-purple water with no insignia visible. End with style suffix. |
| 14 | Daily News page (giant headline + sketch) | /create-image-pixen (no_background=true) | 512×512 | 39 (and `ending_exposed` reuse) | A torn pulp-newspaper page: bold black 8-column headline at the top (depicted as ornamental block-shapes, not legible text), beneath it a coarse staff-artist sketch of an algae-green man-shape rising waist-deep from the sea, the paper edges ragged. End with style suffix. |

## Cover (Phase 4)

| # | Asset | Endpoint | Size | references (≤4, each with usage_description) | Prompt |
|---|---|---|---|---|---|
| 21 | Cover | /generate-image-v2 | 512×512 | #02 (use this person — Ray), #03 (use this person — Porky), #07 (use this place as the setting), #11 (use this object — the armchair) | Ray at his cluttered desk half-turned from the typewriter; Porky wedged sweating into the only armchair clutching a blue handkerchief; the open window behind them framing wartime New York under blackout. The frame already promises something will rise from the dark sea. |

3 seed variants → user approves one. The approved cover may appear as a 4th ref on later scenes with `(use this color palette)` to anchor aesthetic across scenes.

## Scenes (Phase 5)

10 illustratable beats walked from the chapter knot bodies. References carry identity; prose carries action and mood.

| # | Scene | Endpoint | Size | references (≤4, each with usage_description) | Prompt |
|---|---|---|---|---|---|
| 31 | `start` — the visit | /generate-image-v2 | 512×512 | #02 (use this person — Ray), #03 (use this person — Porky), #07 (use this place as the setting), #11 (use this object — the armchair) | Late afternoon in Ray's study; Ray half-turns from the typewriter as Porky collapses sweating into the armchair, blue handkerchief mopping his face. The amber lamp is on, the window-glow behind them is dim wartime New York. A man has come to confess something he is too frightened to name. |
| 32 | `demonstration_arrival` — Lisbeth and Baldy walk in | /generate-image-v2 | 512×512 | #02 (use this person — Ray), #03 (use this person — Porky), #04 (use this person — Lisbeth), #05 (use this person — Baldy) | Mid-afternoon in the study; Porky slumped in the armchair, Ray standing mid-explanation, Lisbeth and Baldy framed in the doorway just arrived from the street. The room has the precise wrong people in it. (4 refs — at cap; place described in prose.) |
| 33 | `old_woman_demo` — traffic at the corner | /generate-image-v2 | 512×512 | #02 (use this person — Ray), #04 (use this person — Lisbeth), #08 (use this place as the setting) | Cross-section composition: Ray and Lisbeth at the open study window upstairs; below, an elderly woman in shawl walks imperiously into the intersection holding her closed umbrella over her head, a streetcar blocked, a yellow cab horn pressed flat. |
| 34 | `after_demo` / `planning_evening` — the war is on | /generate-image-v2 | 512×512 | #02 (use this person — Ray), #04 (use this person — Lisbeth), #05 (use this person — Baldy), #12 (use this object — pipes) | Late afternoon turning to evening; Ray and Baldy hunched over a hand-drawn campaign chart with pipes lit, sodium-amber lamp pooling on the chart; Lisbeth seated apart, arms folded, the only person in the room visibly opposing the plan being drawn. |
| 35 | `beach_intro` — Sandy Hook at night | /generate-image-v2 | 512×512 | #03 (use this person — Porky), #04 (use this person — Lisbeth), #09 (use this place as the setting) | Eleven p.m. on a lonely stretch of Sandy Hook under a wan moon; Porky stretched on the sand with his head and shoulders propped on his elbows, Lisbeth standing one step back with her arms crossed against the wind. Long rhythmic surf, deep-purple water, the suggestion that the war is two miles offshore and getting closer. |
| 36 | `direct_sub_path` — the quiet take | /generate-image-v2 | 512×512 | #03 (use this person — Porky), #09 (use this place as the setting), #13 (use this object — small U-boat silhouette), #21 (use this color palette) | Porky's body inert on the dark sand in the foreground, breath barely visible; out beyond the breakers a long low U-boat silhouette under a thin moon, its bow already canting wrong against unseen rocks. No spectacle. |
| 37 | `green_giant_path` — the giant rises | /generate-image-v2 | 512×512 | #02 (use this person — Ray), #04 (use this person — Lisbeth), #05 (use this person — Baldy), #09 (use this place as the setting) | A five-hundred-foot algae-green man-shape wades waist-deep parallel to the beach, glistening scales, gills at the neck, one hand reaching up a hundred feet to seize a low-flying Nazi plane out of the air. On the dark sand below, three figures watch transfixed as Porky's inert body lies between them. (4 refs — at cap; Porky's body described in prose; the Giant is *Porky*.) |
| 38 | `ending_quiet_love` — Cummings's sardonic shrug | /generate-image-v2 | 512×512 | #03 (use this person — Porky), #04 (use this person — Lisbeth), #07 (use this place as the study setting) | The study at eleven p.m. the next night; Lisbeth and Porky on one side of the room holding hands with the dying-calf look, *engaged*. |
| 39 | `ending_war_won` — Pyrrhic | /generate-image-v2 | 512×512 | #02 (use this person — Ray), #03 (use this person — Porky), #04 (use this person — Lisbeth), #14 (use this object — Daily News page) | Months later in the study; behind them, a wall of pinned-up newspaper clippings pulped into a collage with the algae-green giant page among them; Porky seated in the armchair smaller than he was, Lisbeth standing behind him with one hand on his shoulder, not looking at Ray, who is mid-sentence and being unheard. |
| 40 | `ending_porky_lost` — Lisbeth in the doorway | /generate-image-v2 | 512×512 | #02 (use this person — Ray), #04 (use this person — Lisbeth), #11 (use this object — the armchair), #07 (use this place as the setting) | Ray's study at the gray of morning; Lisbeth standing in the doorway in last night's coat, face composed in the particular way faces compose themselves between cryings; Ray on his feet across the room, mid-rising; the armchair empty between them, the only object in the frame that matters. |

`END_exposed` reuses scene 39's newspaper-wall context plus item #14 (Daily News page) — no dedicated banner unless the author elects to expand to an 11th scene.

**References cap is 4.** Scenes 31, 32, 35, 37, 39 sit at the cap; if the author wants to add a host-form (Old Woman, Sub Commander) into a 4-cap scene, drop the lowest-priority cast member or describe the host in prose only. The Giant in scene 37 is intentionally *not* a separate ref — he is Porky in possession, and the algae-green man-shape is described in prose so identity flows from the cast portrait of Porky.

## Generation order

### Phase 1 — Cast (no dependencies)
- 02–05 /create-image-pixen at 512×512 with `no_background=true`. 2 seed variants per character → user approves one.

### Phase 2 — Places (no dependencies)
- 07–09 /create-image-pixen at 512×512 with `no_background=true`. Cap 4; one slot held in reserve. 2 seed variants each → user approves one.

### Phase 3 — Items (no dependencies)
- 11–14 /create-image-pixen at 512×512 with `no_background=true`. 2 seed variants each → user approves one.

### Phase 4 — Cover
- 21 /generate-image-v2 at 512×512 with up to 4 refs from cast/places/items, each with `usage_description`. 3 seed variants → user approves one.

### Phase 5 — Scenes
- 31–40 /generate-image-v2 at 512×512 with up to 4 refs (including the approved cover where palette consistency matters), each with `usage_description`.

### Phase 6 — 3× scale (deterministic, local)
- pl-scale produces 528×528 deliverables for cover/scenes and 1536×1536 deliverables for cast/places/items under `06-3x/`.

## Ink knot mapping

| Knot | Asset(s) | Notes |
|---|---|---|
| `start` | 31 | Opening tableau / first scene banner |
| `demonstration_arrival` | 32 | Cast assembly |
| `old_woman_demo` | 33 | The iconic traffic-directing demo |
| `after_demo` / `planning_evening` | 34 | War-room moment + Lisbeth holdout |
| `beach_intro` | 35 | Sandy Hook tableau |
| `direct_sub_path` | 36 | Quiet-take branch banner |
| `green_giant_path` | 37 | Spectacle branch banner |
| `ending_quiet_love` | 38 | Canonical close |
| `ending_war_won` | 39 | Pyrrhic close |
| `ending_porky_lost` | 40 | Tragic close |
| `ending_exposed` | 39 reuse + item 14 | No dedicated banner; reuses newspaper-wall context |

Other knots (`end_of_visit`, `support_war`/`dial_back`/`lisbeth_intervenes`, `green_aftermath`/`green_finish`/`green_press`/`green_scattered`, `direct_aftermath`/`direct_retreat`/`direct_press`/`direct_press_safe`/`direct_press_lost`/`direct_scattered`, `early_quiet_love`, `withdrawal_check`, `morning_after_intro`) reuse the ten illustrated banners above; no dedicated assets unless the author elects to expand.

## Seed log (filled in during generation)

| Asset # | Seed | File | Notes |
|---|---|---|---|
| | | | |
