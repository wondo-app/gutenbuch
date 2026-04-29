---
name: wondo-interactive-fiction
description: Walk a Wondo author through nine hard editorial gates and produce a publishable Ink gamebook file. Use whenever the user wants to write, draft, structure, or compile a Wondo gamebook, design interactive fiction for the Wondo platform, optimize for Wondo's Story Card and Insights analytics, convert their own fiction to Ink for Wondo, or adapt a public-domain work into Wondo Ink. Trigger on phrases like "Wondo story," "gamebook in Ink," "interactive fiction for Wondo," "convert my novel to Ink for Wondo," "adapt a public-domain work for Wondo," or any pairing of Ink authoring with Wondo's editorial expectations. Even if the user just says "help me write an interactive story" while working in a Wondo context, prefer this skill — it is constructive and Wondo-specific.
license: MIT
metadata:
  type: constructive
  mode: gated-authoring
  domain: wondo-interactive-fiction
  produces: .ink
---

# Wondo Gamebook: Gated Authoring Skill

Walk a Wondo author through nine sequential editorial gates, then produce a verified Ink gamebook file. Gates are **hard** — no Ink is produced until all nine are resolved. If the author asks to skip ahead, name the missing gate and run it.

This skill is constructive, not diagnostic. The author hasn't written anything yet; you're the editor at the start, preventing the structural mistakes that surface later as analytics warnings, fake choices, unreachable endings, and unmaintainable state.

Throughout the skill, placeholders use curly braces — never angle brackets.

## Core Principle

**Wondo's Story Card and Insights analytics are the rubric.** A well-structured Wondo gamebook earns clean numbers:

- 5 or so endings, each reachable on 5–60% of simulated runs
- No named knot reachable on fewer than 5% of runs
- Path variability between divergence ratios 0.45 and 0.84
- Choice density around 1 choice per 100–200 prose words
- Mean branching factor 2.0–3.5

**Wondo is a serial reading platform.** Stories are read across multiple sessions, often on phones, often a chapter at a time. Total runthrough time is bounded (10–30 minutes), and chapters carry the serial rhythm (4–7 minutes each). The length budget is locked early — Gate 1 — because every later cap depends on it.

If the gates are honored, the analytics are downstream of the design.

---

## The Nine Gates

Order is fixed. Each gate produces a small artifact (Ink comment block, knot stub) the next gate reads.

| # | Gate | Question | Artifact |
|---|---|---|---|
| 0 | **Provenance** | Original IF, self-conversion, or public-domain adaptation? | `// Provenance:` header |
| 1 | **Length budget** | Total runthrough minutes, chapter targets, source / gameplay / path word counts? | `// Length budget:` header |
| 2 | **POV** | Voice, tense, person? | `// POV:` header |
| 3 | **Characters** | Who's in this story, how often? | `// Cast:` table |
| 4 | **Endings** | Conclusions, named, with target distributions? | `=== END_x ===` stubs |
| 5 | **Gameplay variables** | What state gates which content? | `VAR` declarations + gate map |
| 6 | **Display variables** | What state is reader-visible and nudges path selection without gating reachability? | `VAR` declarations + visibility map |
| 7 | **Items** | Boolean inventory tokens, picked up where, used where? | `VAR has_x = false` + pickup/use knots |
| 8 | **Maps** | Sets of locations or states forming the structural skeleton? | `LIST` declarations + knot skeleton |

After Gate 8, assemble the Ink file and verify it compiles.

---

## Skill arguments

The skill accepts a positional source path and optional flags. Arguments are **seeds, not commitments** — each gate still surfaces what's been resolved and lets the author override before locking. A flag just skips the question.

```
/wondo-interactive-fiction [<source-path>] \
  [--mode=rework|adaptation] \
  [--slug=<slug>] \
  [--minutes=<10-30>] \
  [--chapters=<3-7>] \
  [--endings=<3-7>] \
  [--pov=<person>-<tense>-<stance>-<register>]
```

| Arg | Pre-fills | Default if omitted |
|---|---|---|
| `<source-path>` (positional) | Gate 0 source detection | Original IF (no source) |
| `--mode=rework\|adaptation` | Gate 0 faithfulness intent | ask at Gate 0 |
| `--slug=<slug>` | Gate 0 working title / slug | ask |
| `--minutes=<n>` | Gate 1 total runthrough | ask |
| `--chapters=<n>` | Gate 1 chapter count | derive from `minutes / 5` |
| `--endings=<n>` | Gate 4 ending count | 5 |
| `--pov=...` | Gate 2 (4-tuple, e.g. `second-present-limited-hardboiled`) | ask |

**Auto-detected from the source file** (no arg needed; values surface at Gate 0/1 for confirmation):

- Source word count (`wc -w` minus PG boilerplate)
- Title / author / year (regex the Project Gutenberg header for files starting with `*** START OF THE PROJECT GUTENBERG EBOOK ***`)
- US-PD claim (the eBook header explicitly states it; still requires the author's plain-language confirmation per Gate 0's refusal criteria)

**What is NOT an arg** (these stay in the gate dialogue because their decision IS the gate):

- Character names + motivations
- Ending names + values + percentages
- Variable designs (gameplay / display / items / maps)
- Cultural-context stance (modernized to *what*, specifically)
- Antagonist identity

If a flag's value violates a gate's threshold (e.g. `--minutes=45`), refuse to lock — the threshold exists for a reason; surface the gate's refusal criterion and ask for an override or a corrected value.

---

## Mode fork: rework vs. adaptation

Two distinct authoring stances, both valid IF treatments of an existing source:

| Mode | Source treatment | Prose ownership | Output shape |
|---|---|---|---|
| **rework** (faithful conversion) | Preserve voice, names, setting, canonical arc | Skill drafts prose by paraphrasing the source into IF rhythm; author edits | Complete `.ink` ready to play; prose lands at gate-output time |
| **adaptation** (transformative) | Free to modernize, rename, reframe, restructure | Skill produces structure only; author writes prose | `[PROSE: ...]` placeholders mark drafting hooks; structure compiles and walks but reads as stub |

**Default is `adaptation`** — it's the safer stance (doesn't presume to write the author's voice) and matches the skill's "produce structure, author writes prose" foundation. Reworks override that rule for source-derivable prose.

The mode propagates through every gate. Side-by-side defaults:

| Decision | Rework default | Adaptation default |
|---|---|---|
| Cultural context (Gate 0, public-domain) | Preserved | Modernized |
| Cast names (Gate 3) | Inherited from source | Open to modernize/relocate |
| POV (Gate 2) | Inherits from source | Open authorial choice |
| Canonical ending (Gate 4) | Preserved as dominant | Author's choice (one of: preserved-as-ending / preserved-as-dominant / absent) |
| 5-character cap (Gate 3) | Soft (source dictates cast; explain departures) | Strict |
| Knot bodies | Full prose paraphrased from source | `[PROSE: ...]` drafting hooks |

The mode does NOT change:
- The 9 gates themselves (every gate still runs)
- Verification rubric (Insights distribution targets, knot reach, choice density)
- Length budget bounds (10–30 min, 4–7 min/chapter)
- Variable ceilings (8 gameplay + 8 display + 5 items + 3 maps)
- Sequential-release audit (no skip-jumps, no backward diverts)

**Refuse to advance** without a mode decision. If `--mode` isn't supplied and the author can't articulate which they want at Gate 0, run a one-question diagnostic: *"If a reader compared the published gamebook to the source, would you want them to say 'this is a faithful interactive version' (rework) or 'this is a different work that converses with the source' (adaptation)?"*

---

## Gate 0 — Provenance

**Question:** Is this original interactive fiction, a conversion of the author's own existing fiction, or an adaptation of a public-domain work?

The answer changes how every later gate is framed. Original IF is design; self-conversion is translation; public-domain adaptation is interpretation plus copyright.

**The three branches:**

- **Original** — new IF, no source. Later gates run as designed.
- **Self-conversion** — the author's own existing fiction (published novel, drafted novella, serialized prose). The dominant problem is faithfulness.
- **Public-domain adaptation** — the author does not own the source. Dominant problems are copyright edges (translations, annotated editions, and other derivatives are often in copyright even when the underlying text isn't), cultural context, and attribution.

**Decisions to extract from the author:**

For all branches:
- **Branch.** Pick one of the three.
- **Working title.**

For self-conversion:
- **Source provenance.** Source title, status (published, drafted, or WIP). Word count is locked at Gate 1.
- **Faithfulness intent.** Same `rework` / `adaptation` fork as public-domain adaptations: rework = preserve the source's voice, names, setting, and canonical arc; adaptation = treat the original as material and remix freely. "Branched faithfulness" maps to rework; "source as material" maps to adaptation. If `--mode` was supplied, surface and confirm.
- **Canonical ending.** Preserved as one Wondo ending, preserved as the dominant Wondo ending, or absent. Defaults to *preserved-as-dominant* in rework mode. Gate 4 will hold the author to this.

For public-domain adaptation:
- **Source verification.** Title, author, original publication year. Author confirms in plain language that the source is public-domain in their jurisdiction. If they aren't sure, refuse — confirming is the author's responsibility. Auto-detect title/author/year from the Project Gutenberg header when present and surface for confirmation.
- **Edition risk.** Author confirms they're working from an out-of-copyright edition. Translations of public-domain works are a common copyright trap; a 2026 English-language *Crime and Punishment* is almost certainly an in-copyright translation.
- **Faithfulness intent.** `rework` (faithful conversion: preserve voice, names, setting, canonical arc) or `adaptation` (transformative: modernize/rename/restructure as desired). See "Mode fork" above. If `--mode` was supplied, surface and confirm; otherwise ask. Defaults flow into Gates 2/3/4 — see the side-by-side defaults table.
- **Cultural-context stance.** Preserved, modernized, or relocated. Defaults to *preserved* in rework mode and *modernized* in adaptation mode. Propagates into Gate 2 (register) and Gate 3 (names).
- **Attribution.** How the source is credited in the Wondo publication. Default: an "Adapted from..." line surfaced in the story description, not buried.

**Refuse to advance** if the branch is unclear; if self-conversion or public-domain adaptation lacks faithfulness intent (mode); if public-domain adaptation lacks public-domain confirmation, edition-risk acknowledgment, or cultural-context stance.

**Artifacts:**

```ink
// Provenance (locked at Gate 0): ORIGINAL
//   Mode: rework | adaptation
//   (For original IF: rework = stick to your conceived plot; adaptation = treat
//    your concept as a quarry. Defaults to adaptation.)
```

```ink
// Provenance (locked at Gate 0): SELF-CONVERSION
//   Source: {title}, {status}
//   Mode: rework | adaptation
//   Canonical ending: preserved-as-ending | preserved-as-dominant | absent
```

```ink
// Provenance (locked at Gate 0): PUBLIC-DOMAIN ADAPTATION
//   Source: {title} by {author}, {year}
//   Edition: {out-of-copyright edition}
//   Mode: rework | adaptation
//   Cultural context: preserved | modernized | relocated to {setting}
//   Attribution: {how surfaced to readers}
```

---

## Gate 1 — Length Budget

**Question:** What is the total runthrough time, how does it break into chapters, and what are the prose-word budgets that follow from those choices?

**Wondo is serial.** Readers consume stories in sessions, frequently on phones, and the platform's calibration is built around bounded session-length expectations. Length is platform-shaped, not author-discretionary.

- **Total runthrough (single playthrough):** 10–30 minutes. Below 10 minutes, the story doesn't justify session-attention. Above 30 minutes, retention collapses.
- **Per chapter:** 4–7 minutes. Shorter chapters fragment beats; longer ones break the serial rhythm.
- **Reading speed assumption:** 200 words/minute (the platform's calibration). A 5-minute chapter is ~1,000 prose words *along a single playthrough* — not 1,000 total words written, since branching authors more prose than any single playthrough reads.

The budget gates **before** characters, endings, and variables because every later cap depends on it. A 30-minute story can sustain 5 chapters and 5 endings; a 10-minute story can't.

**Decisions to extract:**

- **Source word count.** Required for self-conversion and public-domain adaptation. (Original IF: skip — there is no source.) Approximate is fine; order-of-magnitude matters more than precision.
- **Total gameplay target (minutes).** A single number, 10–30.
- **Average path words.** Total minutes × 200. The expected prose budget for a single playthrough.
- **Total prose budget (gameplay words).** Average path × ~2 (multi-path inflation; rule-of-thumb that branching authors roughly double the prose written versus prose any one reader sees on one path). Sanity-check against the author's writing capacity.
- **Chapter count.** Total minutes ÷ 5, rounded. A 20-minute story → 4 chapters; a 30-minute story → 5–6 chapters.
- **Chapter targets.** Working name and target minutes (4–7) for each chapter. Sums must equal total gameplay target.

**Adaptation-specific guidance:**

- **Self-conversion.** Source word count gives a faithfulness ceiling. A 50,000-word novella cannot become a 30-minute Wondo gamebook with all source content preserved — only ~6,000 prose words fit a 30-minute single path. Commit to subset-selection or compression, not preservation. Refuse if the author says "translate the whole novel."
- **Public-domain adaptation.** Source word count gives a budget ratio. A 7,000-word pulp story plausibly targets 20-minute single-path gameplay (multi-path inflation roughly doubles to ~8,000 written words). A 200,000-word novel cannot fit at any point on the spectrum — refuse without an explicit "subset" or "compression" stance.

**Refuse to advance** if total gameplay is outside 10–30 minutes; if chapter count and per-chapter minutes don't sum to the total; if a self-conversion or public-domain adaptation skips the source word count; if any chapter target is outside 4–7 minutes without an override.

**Artifact:**

```ink
// Length budget (locked at Gate 1):
//   Source: ~{source_words} words ({original | self-conversion | public-domain})
//   Total gameplay target: {N} minutes
//   Average path words (single playthrough): ~{N × 200}
//   Total prose budget (gameplay words, multi-path ~2×): ~{N × 400}
//   Chapters ({count}):
//     Chapter 1: {name} — {minutes} min   (file: 01-{slug}.ink)
//     Chapter 2: {name} — {minutes} min   (file: 02-{slug}.ink)
//     ...
//   Sequential-release audit: PASS | FAIL — see "Chapter splits & sequential release" below
```

Each chapter is its own file once "Chapter splits & sequential release" runs (after Gate 8). The Gate 1 artifact records the planned file mapping; the audit is filled in after the structural skeleton is laid down.

---

## Gate 2 — POV

**Question:** Voice, tense, person?

POV is locked first among prose decisions because every prose decision depends on it. Wondo's analytics don't care about POV directly, but pacing and reader immersion collapse if it drifts mid-story.

**Decisions to extract:**

- **Person:** First, second, or third. Second is the gamebook default; first and third both work but require deliberate craft.
- **Tense:** Present or past. Present is the gamebook default for immediacy.
- **Narrator stance:** Limited, omniscient, or unreliable. The most-skipped decision and the one most likely to cause inconsistency.
- **Register:** One adjective — literary, conversational, hard-boiled, lyrical, comedic.

**For self-conversion and public-domain adaptation, additionally:**
- **Inheritance vs. shift.** State whether the Wondo POV preserves the source's or deliberately shifts it. A third-person novel becoming second-person Ink is a real authorial choice — second person invites reader identification differently than the source did. **Rework mode defaults to inheritance** (auto-detect source POV and surface for confirmation); adaptation mode treats this as an open authorial choice.
- **For relocated public-domain adaptations:** the register must reflect the new setting. A relocated *Pride and Prejudice* in present-day Lansing can't be literary register without straining.

**Refuse to advance** if any of the four core decisions is unspecified. In rework mode, refuse to advance if the source POV cannot be inferred from the supplied text — the inheritance default needs something to inherit from.

**Artifact:**

```ink
// POV (locked at Gate 2): {person}, {tense}, {stance}, {register}
```

---

## Gate 3 — Characters

**Question:** Who's in this story, how often?

The most common Wondo authoring mistake is introducing eight named characters in chapter 1 and never mentioning six again. Insights' "buried scene" warning fires on knots; the underlying disease is usually a buried character.

**Decisions to extract:**

- **Protagonist.** Name (or "unnamed"). One sentence on who they are. One sentence on what they want at the start.
- **Named cast.** Up to 5. More is a red flag for typical Wondo length (Gate 1's 10–30-minute budget); push back.
- **Screen-time budget.** Target percentage of runs each character appears in. Protagonist is 100% by definition. Below 20%, downgrade to "atmospheric" (mentioned, not interactive) or cut.
- **Motivation.** One verb-phrase per character. Vague ("be mysterious") rejected; concrete ("recover the letter") accepted.

**For self-conversion and public-domain adaptation, additionally:**
- **Cast inheritance.** Mark which named characters come from the source and which are new. The 5-character ceiling still applies — a *War and Peace* adaptation can't bring all 580. **Rework mode** softens the cap (the source dictates cast; explain departures rather than enforce a hard cut). **Adaptation mode** holds the strict cap.
- **Name handling.** **Rework mode** defaults to inheriting source names verbatim (modernization is a deliberate departure that needs a reason). **Adaptation mode** treats names as open: preserved, modernized, or relocated. Elizabeth Bennet in present-day Lansing is probably Liz Bennet.
- **Inherited motivation alignment.** For each inherited character, confirm their Wondo motivation is consistent with the source. **Rework mode** rejects motivation departures unless the author articulates the editorial reason. **Adaptation mode** accepts deliberate departures with one-sentence override reasons.

**Refuse to advance** if any character lacks a motivation, more than 5 named cast without justification (adaptation mode) or without source attribution (rework mode), or screen-time budget that doesn't sum sensibly.

**Artifact:**

```ink
// Cast (locked at Gate 3):
//   Protagonist: {name or "unnamed"} — {wants}
//   {character} — {motivation}, screen-time {X}% of runs
```

---

## Gate 4 — Endings

**Question:** What are the conclusions, named, with target distributions?

Endings are designed before content because endings define what the story is *about*. A story with `dignified`, `quiet_exit`, `accidental_triumph`, `pyrrhic_victory`, `famous_disaster` is a story about how value gets defined. Authors should know which one they're writing before they write it.

**Wondo target distribution.** No ending below 1% or above 60%. Healthiest for 5 endings is 15–25% each, but a deliberately bottlenecked story can target up to 50% on the dominant ending without warning.

**Decisions to extract:**

- **Ending count.** 3–7. Fewer collapses path variability; more makes percentages too thin.
- **Ending names.** Internal only — readers never see them. Names are values-laden, not outcome-laden: `dignified` not `wins`, `quiet_exit` not `dies`. Forces articulation of what each ending *means*.
- **Target distribution.** Sums to 100. Deliberate skew gets recorded as override.
- **Ending stance.** One sentence per ending: what the protagonist is left with.

**For self-conversion and public-domain adaptation, additionally:**
- **Canonical ending placement.** From Gate 0, you know whether the source ending is preserved as one ending, the dominant ending, or absent. Hold the author to it. If "preserved as dominant," the canonical ending must be the highest-targeted ending and may need an override above 60%. **Rework mode** defaults to *preserved-as-dominant* with a target ≥ 35% (or higher if the source's ending is structurally inevitable — Cummings's gift-evaporates close, for example, can plausibly target 50%+).
- **Departures recorded.** Each ending that departs from the source gets one sentence on what it offers the source did not. "What if Elizabeth refused Darcy a second time" is legitimate; "I just wanted a happy ending" is not. **Rework mode** treats unauthored alternative endings as departures requiring justification; **adaptation mode** treats new endings as the default.

**Refuse to advance** if an ending is named in win/lose terms, count is outside 3–7 without override, or any percentage is below 5% or above 60% without override.

**Artifact:**

```ink
// Endings (locked at Gate 4):
//   END_dignified         — target 22% — protagonist accepts loss with self-respect intact
//   END_quiet_exit        — target 18% — withdraws without resolving
//   END_accidental_triumph — target 25% — wins by losing the original goal
//   END_pyrrhic_victory   — target 20% — wins, pays beyond what they expected
//   END_famous_disaster   — target 15% — failure becomes public spectacle

=== END_dignified ===
// stub
-> END

=== END_quiet_exit ===
-> END
```

---

## Gate 5 — Gameplay Variables

**Question:** What state gates which content?

Gameplay variables change *what is reachable*. Conditioning a choice on `gold > 5` is gameplay. Conditioning on `mood == "tired"` is probably display (Gate 6) unless tiredness actually closes off a knot.

Conflating gameplay and display variables is the most common cause of fake-choice warnings. Separate them at design time.

**Decisions to extract per variable:**

- **Name** (Ink-legal: snake_case, no leading numbers, no Ink keywords).
- **Type and initial value** (`int 0`, `bool false`).
- **Gate.** Which knot does this gate? "If `has_key` is false, the cellar is unreachable" — real gate. "If `mood` is sad, the prose mentions rain" — not a gate, that's display.
- **Mutator.** Which knot or choice changes it? If nothing changes it, it's a `CONST` or it doesn't belong here.

**Acid test.** A variable belongs in Gate 5 iff removing it would change *which knots are reachable* across 100 runs. If removing it only changes prose, move to Gate 6.

**Refuse to advance** if any variable lacks a mutator, lacks a gate, or count exceeds 8 without override. Wondo's serial-fiction context rewards small state vocabularies.

**Artifact:**

```ink
// Gameplay variables (locked at Gate 5):
//   gold        int 0      — gates merchant_purchase if gold < 5
//   has_letter  bool false — gates magistrate_confrontation
//   trust       int 0      — gates ally_helps if trust < 3

VAR gold = 0
VAR has_letter = false
VAR trust = 0
```

---

## Gate 6 — Display Variables

**Question:** What state is reader-visible and nudges path selection without gating reachability?

Display variables are reader-perceptible meters or tells the platform surfaces. Wondo's runtime renders declared `VAR` values to the reader natively — authors don't need to design a separate visibility convention. Their job is to give the reader something to *see and respond to* — a recurring on-screen indicator that subtly motivates one branch over another.

**They are not silent prose re-colorings.** A variable that flips a single buried clause from "the innkeeper, whom you've never spoken to" to "the innkeeper, who recognized you yesterday" fails the visibility test: the reader of *that* run sees only one version and can't compare. Reserve those re-colorings for choice-result text or knot-specific authoring; they aren't state.

**Decisions to extract per variable:**

- **Name, type, initial value.**
- **What the reader sees.** A specific recurring on-screen surface — NPC dialogue tone, environment tell, narrator register, ambient news ticker, status indicator. One sentence answering "when this changes, what does the reader notice?"
- **Nudge direction.** What choices does this state quietly point the reader toward? "High terror → reader feels protective → leans toward gentler choices." If the answer is "none," it's not a display variable — it's atmosphere.
- **Mutator.** Which knot or choice changes it.

**Acid test (two parts):**

1. **Reachability test (negative):** removing the variable does not change which knots are reachable. If removal changes reachability, move to Gate 5.
2. **Visibility test (positive):** the reader visibly notices the variable's state on a single playthrough. If the answer is "they read one branch and never see the other version," the variable adds nothing the reader can act on — cut or restate as a meter.

**Refuse to advance** if any variable is invisible to the reader (silent re-coloring), has no nudge direction (atmosphere, not motivation), has no mutator (it's `CONST`), or the count exceeds ~8.

**Artifact:**

```ink
// Display variables (locked at Gate 6):
//   jenks_terror   int 2 — visible: NPC body language tics in every Jenks scene;
//                          nudge: high → reader leans toward protective choices.
//                          Mutated by experiment outcomes and pushiness.
//   vance_in_news  int 1 — visible: chyron / push-notification interstitials between scenes;
//                          nudge: high → urgency, leans toward confrontation.
//                          Increases with story progression and escalations.

VAR jenks_terror = 2
VAR vance_in_news = 1
```

---

## Gate 7 — Items

**Question:** Boolean inventory tokens, picked up where, used where?

Items are constrained gameplay variables: boolean (`has_key = false → true`), with a strict requirement of pickup-knot and use-knot. They get their own gate because the most common item mistake is creating one that's picked up but never used (or vice versa) — invisible until it surfaces in Insights.

**Decisions to extract per item:**

- **Variable name.** Conventions: `has_x` for objects, `picked_up_x` for evidence, `learned_x` for facts.
- **Pickup knot.** Where the variable flips false to true. Must be a real knot in Gate 8's map.
- **Use knots.** At least one knot conditions on this item. Without a use, the item doesn't exist — cut it.
- **Counterfactual.** What happens if the reader reaches the use-knot without the item? Authored explicitly. Items that silently no-op when missing are the worst form of fake choice.

**Refuse to advance** if any item lacks a pickup, a use, or a counterfactual. Or if more than 5 items without override — large inventory states are out of scope for Wondo's serial format.

**Artifact:**

```ink
// Items (locked at Gate 7):
//   has_letter   pickup: study_desk     use: magistrate_confrontation   counterfactual: magistrate refuses to see you
//   has_key      pickup: housekeeper    use: cellar_door                counterfactual: routes to give_up
//   learned_name pickup: overheard_chat use: confront_villain           counterfactual: scene plays as bluff

VAR has_letter = false
VAR has_key = false
VAR learned_name = false
```

---

## Gate 8 — Maps

**Question:** Sets of locations or states forming the structural skeleton?

A "map" in Ink is a `LIST` — a typed enumeration the runtime tracks membership in. Maps express things like which towns visited (a set), current emotional state (an enum), or evidence accumulated (a growing set).

Maps are where the bottleneck-and-windows architecture lives. The "windows" in *Magnificent Possession* are exactly what `LIST visited_windows = ()` tracks: a small growing set, gating optional content without bloating gameplay-variable namespace.

**Decisions to extract per list:**

- **Name and members.** 2–8 members.
- **Semantics.** Set (membership grows, e.g., locations visited) or enum (one value at a time, e.g., current mood).
- **Mutators and readers.** Which knots add to it, which read it.

**Architectural prompt.** For each map, ask: bottleneck spine, optional windows, or evolving protagonist state? If none of those, it's probably not a map — likely a single bool (Gate 5) or display variable (Gate 6).

**Refuse to advance** if any list has no readers, no mutators, or fewer than 2 members (a 1-member list is a `bool`).

**Artifact:**

```ink
// Maps (locked at Gate 8):
//   visited_windows  set  — members: garden, library, cellar, attic, harbor
//                          mutators: each window's entry knot
//                          readers: ending selector, late-act prose
//   protagonist_mood enum — members: composed, anxious, defiant, resigned
//                          mutators: pivot scenes
//                          readers: dialogue knots, prose colorization

LIST visited_windows = ()
LIST protagonist_mood = (composed), anxious, defiant, resigned
```

---

## Assembling the Ink File

Only when all nine gate artifacts are in hand do you produce the file. The canonical Wondo layout is **split** — primary file holds metadata + variables + entry divert + chapter `INCLUDE`s; chapter files hold the knot definitions. (See "Chapter splits & sequential release" below for the why and the rules.) For very short stories (single chapter, <10 min total) a single-file layout is acceptable; for anything multi-chapter, split.

**Primary file** — `stories/{slug}/{slug}.ink`:

```ink
// =====================================================
// {STORY_TITLE}
// Authored for Wondo. Ink format.
// =====================================================

// Gate 0 — Provenance
// {provenance block}

// Gate 1 — Length budget
// {budget block}

// Gate 2 — POV
// {header}

// Gate 3 — Cast
// {cast table}

// Gate 4 — Endings
// {ending table}

// Gate 5 — Gameplay variables
VAR ...

// Gate 6 — Display variables
VAR ...

// Gate 7 — Items
VAR ...

// Gate 8 — Maps
LIST ...

// =====================================================
// Story entry — must precede the chapter INCLUDEs so that after the
// includes inline, the top-level divert appears before knot definitions.
// =====================================================
-> start

// =====================================================
// Chapter includes
// =====================================================
INCLUDE 01-setup.ink
INCLUDE 02-{name}.ink
// ...
INCLUDE 0N-{name}.ink
```

**Chapter files** — `stories/{slug}/0N-{name}.ink`, one per chapter, no subdirectory:

```ink
// =====================================================
// Chapter N — {name}
// =====================================================

=== {first_knot} ===
{prose / placeholder}
+ [{choice text}] -> {target_knot}

// ... rest of the chapter's knots ...
```

**Endings live in the final chapter's file.** They cannot be released as a standalone chapter on Wondo's store, so they always ship with the chapter that diverts into them. For a 5-chapter story, every `END_*` knot and the `ending_*` shim knots that route to them are in `05-{name}.ink`.

**Authoring rules for the body** (from Wondo's Insights rubric, enforced by craft):

- Every named knot must be reachable on ≥5% of runs. The compiler doesn't check this; the publish-time simulator will.
- Every choice must change a Gate 5 variable, change a Gate 6 variable, change a Gate 7 item, mutate a Gate 8 map, or lead to a different knot. None of these = fake choice. Refuse.
- Branching factor 2 or 3 most of the time. Single-option "choices" are never acceptable — use a divert.
- Choice density around 1 per 100–200 prose words. More feels like a flowchart; less collapses path variability.
- Total prose written and per-chapter prose stay roughly within Gate 1's budget. Going long on early chapters squeezes the back half; going short collapses the chapter rhythm.
- **Mutate state at the destination knot, not on the choice line, when downstream conditionals depend on the new value.** The form `+ [Choice] -> target` followed by indented `~ var = …` lines does sometimes leave the variable un-updated by the time the *next* knot's conditional reads it — the divert and the mutation race, and the simulator's uniform random walk can silently land in the "stale state" branch every time. The reliable pattern is to put the mutation as the first line of the destination knot:

  ```ink
  + [Tell Lisbeth what you almost did.] -> fallout_love

  === fallout_love ===
  ~ lisbeth_bond = lisbeth_bond + 1
  {prose follows}
  ```

  Choice-line mutations are still fine for variables read *much* later (e.g. accumulator state surfaced at an end-of-chapter selector). They go wrong specifically when the next knot's first action is a conditional that reads the variable.
- **Prefer explicit player choices over `{ - cond: -> target }` switches for branching that depends on per-playthrough state.** The switch syntax works reliably for "ending selectors" (variables that have stabilised by the time you read them — e.g. `morning_after_intro` reading `secrecy_intact` after every choice in the story has been made). It works less reliably for branching mid-story on a variable mutated a knot or two earlier — see the choice-line mutation note above. Two player choices that route to two narrative branches give the random walker a 50/50 split it can actually hit; a conditional reading stale state gives it a deterministic-looking bias toward whichever branch matches the unmutated value.

### Knot bodies — mode-dependent

**In `adaptation` mode**, knot bodies contain `[PROSE: <one-line scene-beat description>]` placeholders, real choice text, real variable mutations, and real diverts. The author writes the prose in a follow-up pass. The skeleton compiles, walks, and verifies; it just doesn't read as prose to a Wondo reader yet.

```ink
=== start ===
[PROSE: Ray's study. Jenks arrives sweating. Establish gift via Jenks's confession.]
+ [Push him to demonstrate now] -> demos_arrival
    ~ ray_self_importance = ray_self_importance + 1
+ [Hear him out first] -> setup_listen
    ~ jenks_terror = jenks_terror - 1
```

**In `rework` mode**, knot bodies contain full prose paraphrased from the source into IF rhythm — second/third/first-person matching the inherited POV; voice matching the source register; names matching the inherited cast. The author still owns the final edit, but the skill's output is playable as-is.

```ink
=== start ===
A warmish afternoon last spring. I was sitting in my study trying to figure out a plot when Porky Jenks came in to see me.
{the ~600-1000 words paraphrasing Cummings's opening, broken across this knot and its
 immediate descendants, with the original beats — Porky's confession, his demonstration,
 the gift's mechanics — preserved in compressed IF rhythm}
+ [Show me. Right now. I want to see it work.] -> demand_demo
    ~ pushed_porky = pushed_porky + 1
+ [Slow down. Tell me everything that's happened first.] -> get_full_story
```

The mode is recorded in the Gate 0 artifact. When assembling, check that artifact and pick the right knot-body convention. **Do not mix modes** within one file — partial rework reads as broken adaptation and vice versa.

---

## Chapter splits & sequential release

Wondo releases gamebooks chapter-by-chapter. The author publishes chapter 1 first, then chapter 2 a week (or however long) later, and so on. The compiled artifact is one Ink story — INCLUDEs are inlined at compile time — but the *file layout* and the *divert graph* must respect serial release.

### File layout

Chapter files live alongside the primary file at the story root, no subdirectory. Numeric prefix orders them:

```
stories/{slug}/
├── {slug}.ink         # primary: metadata, gate artifacts, VAR/LIST, -> start, INCLUDEs
├── 01-setup.ink       # Chapter 1 knots
├── 02-{name}.ink      # Chapter 2 knots
├── 03-{name}.ink      # Chapter 3 knots
├── ...                # one file per chapter target from Gate 1
└── 0N-{name}.ink      # last chapter — also holds every END_* and ending_* knot
```

The primary file is intentionally lean: nothing but configuration, the entry divert, and `INCLUDE` lines. New knots never go there. New chapters never get a separate `endings.ink` — endings always ship with the chapter that diverts into them, because Wondo cannot release "just the endings" as a standalone unit on the store.

### The `-> start` ordering rule

The entry divert (`-> start`) must appear **before** the `INCLUDE` lines in the primary file. After resolution the included content inlines at the INCLUDE site, so a `-> start` placed below the INCLUDEs lands at end-of-file (after every knot definition) and Ink will not execute it as top-level entry — your story will silently produce zero-step walks at verify time.

```ink
// ... metadata, VAR, LIST ...

-> start                  // ✅ before the includes

INCLUDE 01-setup.ink
INCLUDE 02-demos.ink
// ...
```

```ink
// ... metadata, VAR, LIST ...

INCLUDE 01-setup.ink
INCLUDE 02-demos.ink
// ...

-> start                  // ❌ stranded after every knot; story will not start
```

### Sequential-release audit

For every chapter `N`, every divert in chapter `N`'s knots must point either to chapter `N` itself or to chapter `N+1`. **No backward diverts** (chapter 3 → chapter 1) and **no skip-jumps** (chapter 1 → chapter 4). The inlined story still works once everything is released, but a chapter can't be released alone if its knots reference content that hasn't shipped yet.

Run the audit before assembling — it's a cheap regex pass over the resolved divert graph:

```bash
node -e "
const fs = require('fs');
const KNOTS_BY_CHAPTER = {
  1: ['start', 'setup_listen'],
  2: ['demos_arrival', /* ... */],
  // ... fill from the chapter files
};
const knotChapter = {};
for (const [ch, ks] of Object.entries(KNOTS_BY_CHAPTER))
  for (const k of ks) knotChapter[k] = +ch;

const src = ['01-setup.ink','02-demos.ink',/*...*/]
  .map(f => fs.readFileSync('stories/{slug}/' + f, 'utf8')).join('\n');

const knotRe = /^===\s*(\w+)\s*===/gm;
const matches = [...src.matchAll(knotRe)];
let issues = 0;
for (let i = 0; i < matches.length; i++) {
  const name = matches[i][1];
  const start = matches[i].index;
  const end = i+1 < matches.length ? matches[i+1].index : src.length;
  const body = src.slice(start, end);
  const diverts = [...new Set([...body.matchAll(/->\s*(\w+)/g)].map(m => m[1])
    .filter(t => t !== 'END' && t !== 'DONE'))];
  const ch = knotChapter[name];
  for (const d of diverts) {
    const dch = knotChapter[d];
    if (!dch) continue;
    if (dch < ch) { console.log('BACKWARD:', name, '(ch'+ch+') ->', d, '(ch'+dch+')'); issues++; }
    if (dch > ch + 1) { console.log('SKIP-JUMP:', name, '(ch'+ch+') ->', d, '(ch'+dch+')'); issues++; }
  }
}
console.log(issues === 0 ? 'AUDIT PASS' : 'AUDIT: ' + issues + ' issue(s).');
"
```

A failing audit doesn't mean the story is broken — it means a chapter cannot be released on its own without dragging the referenced future content with it. Restructure the divert graph so every cross-chapter edge points forward by exactly one chapter.

Record the result in the Gate 1 artifact's "Sequential-release audit:" line.

### When to skip the split

Single-chapter stories (10-minute total runthrough, no serial release) can stay as one file. The convention exists for the multi-chapter case; don't apply ceremony to a story that doesn't need it.

---

## Verifying the File Compiles and Plays

Producing the file is not the last step. A file with a typo'd knot name, divert into nowhere, logical infinite loop, or an ending no run reaches can pass every authorial gate and still be unplayable. Wondo's runtime will reject some of those; Wondo's Insights simulator will flag the rest.

**Run `.agents/skills/wondo-interactive-fiction/scripts/verify-ink.ts {path}` after writing the file.** Pass the **primary** file path (e.g. `stories/{slug}/{slug}.ink`); the script transitively resolves `INCLUDE` directives by reading every referenced file relative to its parent's directory and inlining the content for analysis. The first stderr line reports the file count: `[verify-ink] resolved 6 files (primary + 5 INCLUDE)`.

It executes four phases in order:

1. **Static structural checks** — regex over the resolved (post-INCLUDE) source, before compile. Catches dangling diverts, orphan knots, tilde directives mid-line, missing endings block. The endings-block search accepts `// Endings (locked at Gate N)` for any digit, so files written under earlier skill numbering still parse.
2. **Compile** — `inkjs.Compiler` programmatically (same compiler Wondo's runtime uses) on the resolved source. Catches syntax errors, undefined diverts, malformed conditionals.
3. **Smoke walk** — one fixed-seed random walk with a 5000-step cap. Catches files that compile but cycle forever, or files where `-> start` is misplaced (manifests as 1-step walks landing in `__terminal:unknown`).
4. **Distribution** — 400 random walks (default; configurable with `--runs`). Counts which `END_*` knot each walk terminated at, compared against the targets parsed from the endings comment block. Same probe Wondo's Insights simulator runs at publish, so a passing local run predicts a clean publish.

Run it directly with `node`:

```
node --no-warnings=ExperimentalWarning .agents/skills/wondo-interactive-fiction/scripts/verify-ink.ts stories/{slug}/{slug}.ink
```

The script auto-installs `inkjs` into `~/.cache/wondo-gamebook/` on first run (about 30 MB, persists across runs). Requires Node.js 22+ (24 recommended).

**Exit codes:**
- `0` — all gating phases passed. Distribution table printed.
- `1` — compile failed, runtime errored, or static phase found a structural error (dangling divert, etc.). Read the diagnostic, fix the Ink, retry. Don't present the file until exit 0.
- `2` — compiled and walked OK, but distribution rubric failed: a declared `END_*` was never reached, or its share is below 1% / above 60% on N≥100 runs.
- `64`, `66`, `69`, or `70` — invocation problem (bad flag, missing file, npm bootstrap failure, inkjs version mismatch).

**Common failures:**

| Diagnostic | Cause | Fix |
|---|---|---|
| `Dangling divert: -> X` | Typo'd knot name, or referenced a knot not yet written | Rename or add the missing stub |
| `COMPILE FAILED` | Syntax error inkjs caught | Read the inkjs message; fix the ink |
| `__max-steps` in smoke phase | Divert chain returns to itself without progress | Add a state mutation or choice in the cycle |
| Ending below 1% / above 60% | Path biases all-or-nothing | Add or remove choice routes to that ending |
| `declared ending never reached` | `END_x` named in Gate 4 block but no chain reaches it | Audit the divert chain feeding it |
| Named knot reached <5% | Buried scene; warn-only by default | Audit whether this knot belongs; if it does, raise its reach via choice routing. Pass `--strict-reach` to escalate to gating. |
| Tilde directive prints as prose | `~ has_key = true` written inline with text | Move the tilde to its own line |
| Smoke walk: 1-step `__terminal:unknown`, 0 prose words | `-> start` placed *after* `INCLUDE` lines in the primary file; entry divert lands post-knot-definitions | Move `-> start` *above* the `INCLUDE` block |
| `Dangling divert: -> start` on a split file | verify-ink received a chapter file instead of the primary file (chapter files don't define `start`) | Run verify against the primary `{slug}.ink` — INCLUDEs resolve transitively from there |

Useful flags:
- `--runs <n>` — number of distribution walks (default 400). At `<100`, distribution thresholds are suppressed (informational only).
- `--seed <n>` — master seed; re-running with the same seed reproduces the same walks.
- `--seed-run <n>` — replay a single walk number from the master seed (debug aid).
- `--strict-reach` — gate on named knots reached <5% of runs.
- `--no-distribution` — skip phase 4 (drop-in equivalent of the legacy bash behaviour).
- `--quiet` — single-line PASS/FAIL on stdout.
- `--json` — full report on stdout as JSON.

**If the script can't run** (no Node, no internet for the one-time install, restricted environment), don't skip silently. Tell the author: "The file is unverified — paste it into the Wondo authoring editor or a local Inky session and check the validator before publish." Producing an unverified file while claiming it's verified is the failure mode this section exists to prevent.

Full flag reference, exit codes, tunable thresholds, and extension points: `references/verify-ink.md`.

---

## Phase 9 — Asset brief

Runs in parallel with `verify-ink.ts` after all nine gates pass and the `.ink` is assembled. Produces `stories/{slug}/{slug}-brief.md`, the asset-design contract that the `wondo-pixellab-assets` skill consumes.

You are the only place in the toolchain that has all the structured information the brief needs: the cast comment block (Gate 3), the endings comment block (Gate 4), the assembled knot tree (post-assembly), and the prose body (the source of "what scenes are worth illustrating"). Drafting it here means the pixellab skill never has to re-derive this information.

**Inputs**
- The just-assembled `stories/{slug}/{slug}.ink` file.
- The template at `.agents/skills/wondo-interactive-fiction/references/brief-template.md`. Treat it as authoritative — every section header and field comes from there.

**Walk the ink file and then populate the template fields from `.agents/skills/wondo-interactive-fiction/references/brief-template.md`:**

1. **Header** — title, slug, source path (`stories/{slug}/{slug}.ink`), generation date.
2. **Cast** — parse the `// Cast (locked at Gate 3):` comment block. Each character becomes a row with name, motivation, screen-time. Produce the per-character pixellab prompt but keep it focused on a few character details.
3. **Endings** — parse the `// Endings (locked at Gate 4):` comment block. Endings don't get illustrations directly, but they appear in the brief as context.
4. **Scenes** — walk knot bodies. For each knot whose body contains a clearly-illustratable beat, chapter or a frequented location, emit a scene row. Default cap: ~10 scenes; but the author can prune. Each scene row carries the knot name and a stylistic but focused description. Describe the visual elements and mood for each scene.
5. **Objects** — Optional to stories. Find objects that are plot-critical (Gate 7 items partially overlap, but pixellab's "objects" are visual props, not Gate 7 inventory tokens, so don't auto-populate from items).
6. **Ideation prompt / cover prompt / style suffix / palette** — Generate what goes there. The author then tunes these before invoking pixellab.

**Failure handling.** If the brief template can't be read, surface a one-line warning ("brief template missing — pixellab skill won't run cleanly until you grab a copy") but don't block `verify-ink.ts`'s pass/fail signal. The brief is a downstream input, not a publish blocker.

**Done message.** After both `verify-ink.ts` exit 0 AND `{slug}-brief.md` is written, tell the author:

> Story compiled and walked clean. Brief drafted at `stories/{slug}/brief.md`. Run `wondo-pixellab-assets` if you want illustrations, or ship the `.ink` to Wondo as-is.

---

## When the Author Pushes Back

Some authors resist the gates — "I just want to start writing." Hold the line as an editor, not a bureaucrat.

**Acceptable:**
- "The gates exist because the alternative is rewriting after Insights tells you something is wrong. Five minutes per gate beats two days of restructuring."
- "Which gate feels like overkill? Let's look at it specifically."
- "If you have an override reason — say, one ending at 70% because it's deliberately the default path — say it explicitly and I'll record the override."

**Unacceptable:**
- Skipping a gate.
- Producing Ink before all nine artifacts exist.
- Treating gates as suggestions.

**The override mechanism.** When an author has a real reason to violate a threshold (more than 5 characters, an ending at 65%, an 8-member item list, a 35-minute runthrough), they state the reason and you record it as a comment:

```ink
// Override at Gate 4: END_default targeted at 70%, deliberately the
// inattentive-reader path. Author accepts dominant-ending warning.
```

Recorded overrides are honored. Unjustified overrides aren't — push back with the gate's specific question.

---

## Anti-Patterns

**The Ink Dump.** Author shows up with 200 lines of Ink. Don't pretend the file doesn't exist; run gates 0–8 against it as a diagnostic pass, surface failures, refactor.

**The Length Sprawl.** Author insists on a 60-minute single-path runthrough. Refuse at Gate 1. Wondo's serial format collapses past 30 minutes; if the author wants a novel-shaped story, they should write a novel.

**The Variable Soup.** Author wants 30 variables. Wondo's simulator runs 100 plays per publish; every variable doubles the path space. Hold ceilings: 8 gameplay + 8 display + 5 items + 3 maps as aggregate maximum.

**The Cinematic Ending.** Author wants one "real" ending and several "bad" ones. Reframe at Gate 4. Each ending is valid for the values it represents. If the author can't articulate the values of "bad" endings, those endings shouldn't exist.

**The Item Without Use.** Pickup exists, no use. Refuse at Gate 7.

**Display-as-Gameplay Confusion.** Variable declared as gameplay but never gates a knot. Apply the Gate 5 acid test; move to Gate 6.

**The Silent Display Variable.** A "display variable" the reader can't actually see on a single playthrough. Apply Gate 6's visibility test; cut or restate as a reader-perceptible meter.

**The Skip-Jump Divert.** A chapter-N knot diverts straight into chapter N+2 (or beyond). Compiles fine, breaks serial release: chapter N can't be released without dragging future chapters along. Restructure so cross-chapter edges advance by exactly one.

**The Stranded `-> start`.** The entry divert sits *after* the `INCLUDE` block in the primary file. Compiles, no static error, but smoke walks all terminate at step 1 with `__terminal:unknown`. Move `-> start` above the INCLUDEs.

**The Knot in the Primary File.** Author starts adding new knots directly to `{slug}.ink` instead of the chapter file. The primary is reserved for configuration; new content always lives in a chapter. Move it.

**The Stale-State Conditional.** A knot opens with `{ - var >= 2: -> branch_a / - else: -> branch_b }` reading a variable that's mutated on a choice line one or two knots upstream. The simulator's random walk lands in the same branch every time because the upstream mutations don't propagate before the conditional reads. Symptom: one branch's reach is 0.0% in the distribution table even though path math says it should be 30%+. Fix: move the upstream mutations to the destination-knot's first line, OR replace the conditional with an explicit player choice (which the random walker splits fairly).

**The Inline Divert + Indented Mutation.** A choice declared as `+ [Choice text] -> target_knot` with indented `~ var = …` lines below. Looks tidy. The divert and the mutation race; downstream conditionals reading `var` may read the un-mutated value, and the simulator silently buckets the run to the wrong branch. Move the mutation to the first line of the target knot. Choice-line mutations remain fine for variables consumed later (chapter-end selectors, accumulators), just not for variables read by the *next* knot's first conditional.

---

## Integration with Other Skills

| Skill or reference | When to hand off |
|---|---|
| **wondo-pixellab-assets** | Author has a finished `.ink` file and wants illustrations (cover, character portraits, scene banners). That skill drafts an asset brief by walking the same Ink file this skill produces. |
| **`references/interactive-fiction.md`** (local) | Author has a finished Ink draft with structural problems and wants diagnosis rather than authoring. The IF1–IF7 state taxonomy in that doc applies. Read it; don't invoke it as a separate skill. |

---

## Output Persistence

Every story gets its own directory at `{project-root}/stories/{slug}/`. The slug is the author's working title from Gate 0 (lowercase, hyphenated, no spaces — e.g. `pellucidar`, not `pg20121`). If the working title isn't slug-safe, ask the author for a short slug and use the working title as a header instead.

Inside `stories/{slug}/`:

```
stories/{slug}/
├── {slug}.ink          # primary file — metadata, gate artifacts, VAR/LIST,
│                       #   -> start, INCLUDE chapter files. verify-ink.ts compiles
│                       #   from here.
├── 01-{name}.ink       # Chapter 1 knots
├── 02-{name}.ink       # Chapter 2 knots
├── ...                 # one file per Gate 1 chapter target
├── 0N-{name}.ink       # final chapter — also holds every END_* / ending_* knot
├── {slug}.txt          # raw source text for public-domain adaptations (optional)
├── brief.md            # asset brief produced at Phase 9 (input to wondo-pixellab-assets)
└── assets/             # gitignored; pixellab generates illustrations here
```

If no project structure exists, ask first. The nine gate artifacts are embedded as comments in the primary `.ink` file — that's the persistent record.

---

## Example Walkthroughs (Abbreviated)

### A. Adaptation mode, original IF

**Invocation:** `/wondo-interactive-fiction --mode=adaptation`

**Author:** I want a Wondo gamebook about a debt collector who has to choose between mercy and survival.

**Gate 0:** Original IF, mode=adaptation (from arg). Working title?

**Author:** *Last Stop on the Route.*

**Gate 1:** Total runthrough minutes, chapter count and per-chapter targets?

**Author:** 20 minutes total, 4 chapters of 5 minutes each. (Average path words: 4,000. Total prose budget: ~8,000.)

**Gate 2:** Person, tense, narrator stance, register?

**Author:** Second, present, limited, hard-boiled.

**Gate 3:** Protagonist plus up to 5 named characters, each with a verb-phrase motivation and screen-time target.

**Author:** Protagonist unnamed, "wants to clear the route and go home." Mara, debtor pretending the house is empty (60%, "keep her child"). Rance, supervisor (40%, "make the collector hit quota"). Pelt, paid but owed an apology (25%, "get acknowledgment").

**Gate 4:** 3–7 endings, values-named, percentages summing to 100, one sentence stance each.

*(... and so through all nine gates, then the Ink file with `[PROSE: ...]` placeholders, then `.agents/skills/wondo-interactive-fiction/scripts/verify-ink.ts`. Author writes prose in a follow-up pass.)*

### B. Rework mode, public-domain source

**Invocation:** `/wondo-interactive-fiction stories/pg76899.txt --mode=rework --slug=saved-new-york --minutes=20 --chapters=5`

**Gate 0:** Auto-detected from PG header — "The Man Who Saved New York" by Ray Cummings, 1943; US-PD per the header. Mode=rework (from arg). Author: confirm PD claim in your jurisdiction, edition is the PG eBook (not a translation/annotation), cultural context = preserved (rework default), attribution = "Adapted from..." in story description.

**Gate 1:** Source word count auto-detected (~7,200). Total 20 min, 5 chapters of 4 min each (from arg). Chapter names: Setup / Demos / Scheme / Climax / Fallout — author confirms.

**Gate 2:** POV inheritance defaults from source: first-person, past tense, unreliable, sardonic-pulpy register. Author confirms (or shifts: e.g., past → present is a deliberate departure).

**Gate 3:** Cast inherited from source — Ray, Porky Jenks, Lisbeth, Baldy Green. Names preserved (rework default; modernization would be a flagged departure). Motivations match source.

**Gate 4:** 4 endings, canonical preserved-as-dominant at ~50% (Cummings's gift-evaporates close); remaining ~50% across 3 alternative endings the gates and the simulator together justify (e.g., the Green Giant fight goes worse, the demo escalates, the press hears about it).

*(... gates 5–8 lock state; assembly produces full prose paraphrased from Cummings's text in IF rhythm — playable as-is when verified.)*

---

## What You Do Not Do

- Produce Ink before all nine gates are resolved.
- Skip a gate at the author's request without an explicit override reason recorded as a comment.
- Present the Ink file as done before `verify-ink.ts` exits 0, or — when the script can't run — without explicitly telling the author the file is unverified.
- Write prose for the author **in adaptation mode**. Produce structure (knot stubs, divert skeletons, variable declarations); the author writes prose. **In rework mode**, this rule inverts: write the prose by paraphrasing the source into IF rhythm, since the voice and content are the source's, not the author's invention. Either way, never invent prose for an adaptation; never refuse to draft prose for a rework.
- Mix modes within one file. A partially-prose, partially-placeholder skeleton reads as broken in either direction. Pick the mode at Gate 0 and hold it.
- Apply the gates to non-Wondo Ink work. Thresholds are calibrated to Wondo's Insights rubric and serial-format budget.
- Pretend the gates don't have costs. They take time. Acknowledge that. Run them anyway.

---

## Key Insight

Wondo's Story Card and Insights aren't grading criteria invented after the fact — they describe what a healthy Wondo gamebook looks like from the outside. The nine gates describe what one looks like from the inside. Two views of the same artifact.

A gamebook passing the gates and `verify-ink.ts` publishes well, simulates well, reads well. One that skips either ships with skew warnings or compiler errors and demands a rewrite.
