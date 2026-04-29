// =====================================================
// THE MAN WHO SAVED NEW YORK
// Authored for Wondo. Ink format.
// Adapted from "The Man Who Saved New York" by Ray Cummings (1943),
// via Project Gutenberg #76899.
// =====================================================

// Provenance (locked at Gate 0): PUBLIC-DOMAIN ADAPTATION
//   Source: The Man Who Saved New York by Ray Cummings, 1943
//   Edition: Project Gutenberg #76899 (US-PD; author confirms)
//   Cultural context: modernized — threat is ethnoreligious nationalists and oligarchs
//   Attribution: surfaced in Wondo story description as
//                "Adapted from The Man Who Saved New York by Ray Cummings (1943),
//                 via Project Gutenberg"
//   Working title / slug: The Man Who Saved New York / saved-new-york

// Length budget (locked at Gate 1):
//   Source: ~7,200 words (public-domain pulp)
//   Total gameplay target: 20 minutes
//   Average path words (single playthrough): ~4,000
//   Total prose budget (gameplay words, multi-path ~2×): ~8,000
//   Chapters (5):
//     Chapter 1: Setup    — 4 min   (file: 01-setup.ink)
//     Chapter 2: Demos    — 4 min   (file: 02-demos.ink)
//     Chapter 3: Scheme   — 4 min   (file: 03-scheme.ink)
//     Chapter 4: Climax   — 4 min   (file: 04-climax.ink)
//     Chapter 5: Fallout  — 4 min   (file: 05-fallout.ink; endings live here)
//   Sequential-release audit: PASS
//     - No backward diverts (no chapter N → chapter <N).
//     - No skip-jumps (no chapter N → chapter >N+1).
//     - Each chapter exits only into the next chapter's entry knot or its own.

// POV (locked at Gate 2): first-person, present tense, unreliable narrator, sardonic register
//   Inheritance: preserves Cummings's Ray-as-narrator frame (reader plays the schemer);
//                tense shifted from past to present (unreliability lands as misjudgment-
//                in-the-moment rather than retrospective confession).

// Cast (locked at Gate 3):
//   Protagonist: Ray (inherited)         — SF novelist; wants to win the war from his
//                                           armchair AND mine Jenks for material; the two
//                                           are indistinguishable to him; 100% of runs
//   Jenks (inherited, "Porky" dropped)    — wants to be rid of the gift / be normal /
//                                            not get committed; 90% of runs
//   Lisbeth (inherited)                   — wants to protect Jenks from her father's
//                                            scheme; 70% of runs
//   Green (inherited, "Baldy" dropped)    — wants to monetize Jenks (modern equivalent:
//                                            viral / streaming / clip economy); 60% of runs
//   Halloran Vance (new)                  — oligarch financier bankrolling the
//                                            ethnoreligious-nationalist threat; 35% of runs

// Endings (locked at Gate 4):
//   END_quiet_love     (canonical, preserved-as-dominant) — target 35%
//   END_armchair_fool                                     — target 25%
//   END_pyrrhic                                           — target 20%
//   END_exposed                                           — target 20%

// =====================================================
// Gate 5 — Gameplay variables
// =====================================================
VAR lisbeth_bond = 0
VAR scheme_progress = 0
VAR secrecy_intact = true
VAR vance_confronted = false

// =====================================================
// Gate 6 — Display variables (reader-visible meters; Wondo surfaces natively)
// =====================================================
VAR jenks_terror = 2
VAR lisbeth_warmth = 2
VAR vance_in_news = 1
VAR ray_self_importance = 2

// =====================================================
// Gate 7 — Items: NONE
// (Cummings-faithful; Gate 5 vars carry all gating.)
// =====================================================

// =====================================================
// Gate 8 — Maps
// =====================================================
LIST act = (setup), demos, scheme, climax, fallout
LIST jenks_hosts = first_passerby, neighbor, misfire_host, wrong_target, right_target

// =====================================================
// Story entry — must precede the chapter INCLUDEs so that after the
// includes inline, the top-level divert appears before knot definitions.
// =====================================================
-> start

// =====================================================
// Chapter includes
// =====================================================
INCLUDE 01-setup.ink
INCLUDE 02-demos.ink
INCLUDE 03-scheme.ink
INCLUDE 04-climax.ink
INCLUDE 05-fallout.ink
