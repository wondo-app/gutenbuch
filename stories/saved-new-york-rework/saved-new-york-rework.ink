// =====================================================
// THE MAN WHO SAVED NEW YORK — A Wondo Gamebook
// Adapted (rework) from "The Man Who Saved New York" by Ray Cummings
// (Science Fiction Stories, July 1943; Project Gutenberg #76899)
// =====================================================

// Provenance (locked at Gate 0): PUBLIC-DOMAIN ADAPTATION
//   Source: The Man Who Saved New York by Ray Cummings, 1943
//   Edition: Project Gutenberg #76899 (US-PD; author confirms)
//   Mode: rework
//   Cultural context: preserved (1943 frame intact)
//   Attribution: "Adapted from The Man Who Saved New York by Ray Cummings (1943),
//                 via Project Gutenberg" — surfaced in story description

// Length budget (locked at Gate 1):
//   Source: ~7,200 words (public-domain pulp)
//   Total gameplay target: 20 minutes
//   Average path words (single playthrough): ~4,000
//   Total prose budget (gameplay words, multi-path ~2×): ~8,400
//   Chapters (4):
//     Chapter 1: The Visit              — 5 min   (file: 01-the-visit.ink)
//     Chapter 2: The Demonstration      — 5 min   (file: 02-demonstration.ink)
//     Chapter 3: The Beach              — 5 min   (file: 03-the-beach.ink)
//     Chapter 4: The Morning After      — 5 min   (file: 04-morning-after.ink; endings live here)
//   Sequential-release audit: PASS (chapter 2's early-out routes through a chapter-3 stub)

// POV (locked at Gate 2): first-person, past tense, unreliable, sardonic-pulpy
//   Inheritance: preserves Cummings's narrator-as-Ray frame; tense and voice match the source.

// Cast (locked at Gate 3):
//   Ray (protagonist, narrator) — wants to win the war from his armchair / mine the
//                                  affair for material; 100% of runs
//   Porky Jenks                 — wants to be rid of the gift / be normal /
//                                  not get committed; 95% of runs
//   Lisbeth (Ray's daughter)    — wants to protect Porky from her father's scheme,
//                                  falls in love along the way; 70% of runs
//   Baldy Green (cartoonist)    — wants to monetize Porky for vaudeville/movies; 55% of runs

// Endings (locked at Gate 4):
//   END_quiet_love  (canonical, preserved-as-dominant) — target 50%
//                   Lisbeth and Porky pair off; the gift evaporates; the war goes
//                   unwon; Ray shrugs.
//   END_war_won                                        — target 20%
//                   Porky's possession of U-boat commanders works; the Battle of
//                   the Atlantic turns; Ray invisible to history.
//   END_porky_lost                                     — target 15%
//                   Withdrawal fails inside an exploding sub; Porky's body never
//                   wakes; Lisbeth doesn't speak to Ray again.
//   END_exposed                                        — target 15%
//                   Secrecy breaks somewhere along the way; Bellevue intake;
//                   Ray's plan reduced to a footnote in someone else's scoop.

// =====================================================
// Gate 5 — Gameplay variables
// =====================================================
VAR went_to_beach   = false
VAR porky_returned  = true
VAR sub_possessed   = false
VAR secrecy_intact  = true

// =====================================================
// Gate 6 — Display variables (reader-visible meters; Wondo surfaces natively)
// =====================================================
VAR porky_anxiety    = 2
VAR lisbeth_alarm    = 1
VAR baldy_excitement = 1

// =====================================================
// Gate 7 — Items: NONE
// =====================================================

// =====================================================
// Gate 8 — Maps
// =====================================================
LIST act = (visit), demonstration, beach, morning_after
LIST porky_hosts = first_man, henpecked_couple, old_woman, sub_commander, green_giant

// =====================================================
// Story entry — must precede the chapter INCLUDEs
// =====================================================
-> start

// =====================================================
// Chapter includes
// =====================================================
INCLUDE 01-the-visit.ink
INCLUDE 02-demonstration.ink
INCLUDE 03-the-beach.ink
INCLUDE 04-morning-after.ink
