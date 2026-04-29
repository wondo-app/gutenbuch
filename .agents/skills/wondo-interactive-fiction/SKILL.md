---
name: wondo-gamebook
description: Walk a Wondo author through eight hard editorial gates and produce a publishable Ink gamebook file. Use whenever the user wants to write, draft, structure, or compile a Wondo gamebook, design interactive fiction for the Wondo platform, optimize for Wondo's Story Card and Insights analytics, convert their own fiction to Ink for Wondo, or adapt a public-domain work into Wondo Ink. Trigger on phrases like "Wondo story," "gamebook in Ink," "interactive fiction for Wondo," "convert my novel to Ink for Wondo," "adapt a public-domain work for Wondo," or any pairing of Ink authoring with Wondo's editorial expectations. Even if the user just says "help me write an interactive story" while working in a Wondo context, prefer this skill over interactive-fiction or game-facilitator — those are diagnostic and facilitative, this is constructive and Wondo-specific.
license: MIT
metadata:
  type: constructive
  mode: gated-authoring
  domain: wondo-interactive-fiction
  produces: .ink
---

# Wondo Gamebook: Gated Authoring Skill

Walk a Wondo author through eight sequential editorial gates, then produce a verified Ink gamebook file. Gates are **hard** — no Ink is produced until all eight are resolved. If the author asks to skip ahead, name the missing gate and run it.

This skill is constructive, not diagnostic. The author hasn't written anything yet; you're the editor at the start, preventing the structural mistakes that surface later as analytics warnings, fake choices, unreachable endings, and unmaintainable state.

Throughout the skill, placeholders use curly braces — never angle brackets.

## Core Principle

**Wondo's Story Card and Insights analytics are the rubric.** A well-structured Wondo gamebook earns clean numbers:

- 5 or so endings, each reachable on 5–60% of simulated runs
- No named knot reachable on fewer than 5% of runs
- Path variability between divergence ratios 0.45 and 0.84
- Choice density around 1 choice per 100–200 prose words
- Mean branching factor 2.0–3.5

If the gates are honored, the analytics are downstream of the design.

---

## The Eight Gates

Order is fixed. Each gate produces a small artifact (Ink comment block, knot stub) the next gate reads.

| # | Gate | Question | Artifact |
|---|---|---|---|
| 0 | **Provenance** | Original IF, self-conversion, or public-domain adaptation? | `// Provenance:` header |
| 1 | **POV** | Voice, tense, person? | `// POV:` header |
| 2 | **Characters** | Who's in this story, how often? | `// Cast:` table |
| 3 | **Endings** | Conclusions, named, with target distributions? | `=== END_x ===` stubs |
| 4 | **Gameplay variables** | What state gates which content? | `VAR` declarations + gate map |
| 5 | **Display variables** | What state varies texture without gating reachability? | `VAR` declarations + use map |
| 6 | **Items** | Boolean inventory tokens, picked up where, used where? | `VAR has_x = false` + pickup/use knots |
| 7 | **Maps** | Sets of locations or states forming the structural skeleton? | `LIST` declarations + knot skeleton |

After Gate 7, assemble the Ink file and verify it compiles.

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
- **Source provenance.** Source title, word count, status (published, drafted, or WIP).
- **Faithfulness intent.** "Branched faithfulness" honors the canonical arc with optional alternatives. "Source as material" treats the original as a quarry.
- **Canonical ending.** Preserved as one Wondo ending, preserved as the dominant Wondo ending, or absent. Gate 3 will hold the author to this.

For public-domain adaptation:
- **Source verification.** Title, author, original publication year. Author confirms in plain language that the source is public-domain in their jurisdiction. If they aren't sure, refuse — confirming is the author's responsibility.
- **Edition risk.** Author confirms they're working from an out-of-copyright edition. Translations of public-domain works are a common copyright trap; a 2026 English-language *Crime and Punishment* is almost certainly an in-copyright translation.
- **Cultural-context stance.** Preserved, modernized, or relocated. Propagates into Gate 1 (register) and Gate 2 (names).
- **Attribution.** How the source is credited in the Wondo publication. Default: an "Adapted from..." line surfaced in the story description, not buried.

**Refuse to advance** if the branch is unclear; if self-conversion lacks faithfulness intent; if public-domain adaptation lacks public-domain confirmation, edition-risk acknowledgment, or cultural-context stance.

**Artifacts:**

```ink
// Provenance (locked at Gate 0): ORIGINAL
```

```ink
// Provenance (locked at Gate 0): SELF-CONVERSION
//   Source: {title}, ~{word_count} words, {status}
//   Faithfulness: branched-faithfulness | source-as-material
//   Canonical ending: preserved-as-ending | preserved-as-dominant | absent
```

```ink
// Provenance (locked at Gate 0): PUBLIC-DOMAIN ADAPTATION
//   Source: {title} by {author}, {year}
//   Edition: {out-of-copyright edition}
//   Cultural context: preserved | modernized | relocated to {setting}
//   Attribution: {how surfaced to readers}
```

---

## Gate 1 — POV

**Question:** Voice, tense, person?

POV is locked first because every prose decision depends on it. Wondo's analytics don't care about POV directly, but pacing and reader immersion collapse if it drifts mid-story.

**Decisions to extract:**

- **Person:** First, second, or third. Second is the gamebook default; first and third both work but require deliberate craft.
- **Tense:** Present or past. Present is the gamebook default for immediacy.
- **Narrator stance:** Limited, omniscient, or unreliable. The most-skipped decision and the one most likely to cause inconsistency.
- **Register:** One adjective — literary, conversational, hard-boiled, lyrical, comedic.

**For self-conversion and public-domain adaptation, additionally:**
- **Inheritance vs. shift.** State whether the Wondo POV preserves the source's or deliberately shifts it. A third-person novel becoming second-person Ink is a real authorial choice — second person invites reader identification differently than the source did.
- **For relocated public-domain adaptations:** the register must reflect the new setting. A relocated *Pride and Prejudice* in present-day Lansing can't be literary register without straining.

**Refuse to advance** if any of the four core decisions is unspecified.

**Artifact:**

```ink
// POV (locked at Gate 1): {person}, {tense}, {stance}, {register}
```

---

## Gate 2 — Characters

**Question:** Who's in this story, how often?

The most common Wondo authoring mistake is introducing eight named characters in chapter 1 and never mentioning six again. Insights' "buried scene" warning fires on knots; the underlying disease is usually a buried character.

**Decisions to extract:**

- **Protagonist.** Name (or "unnamed"). One sentence on who they are. One sentence on what they want at the start.
- **Named cast.** Up to 5. More is a red flag for typical Wondo length (10K–50K source words); push back.
- **Screen-time budget.** Target percentage of runs each character appears in. Protagonist is 100% by definition. Below 20%, downgrade to "atmospheric" (mentioned, not interactive) or cut.
- **Motivation.** One verb-phrase per character. Vague ("be mysterious") rejected; concrete ("recover the letter") accepted.

**For self-conversion and public-domain adaptation, additionally:**
- **Cast inheritance.** Mark which named characters come from the source and which are new. The 5-character ceiling still applies — a *War and Peace* adaptation can't bring all 580.
- **Name handling** (public-domain only). State whether names are preserved, modernized, or relocated. Elizabeth Bennet in present-day Lansing is probably Liz Bennet.
- **Inherited motivation alignment.** For each inherited character, confirm their Wondo motivation is consistent with the source. Deliberate departures get override reasons; accidental ones get questioned.

**Refuse to advance** if any character lacks a motivation, more than 5 named cast without justification, or screen-time budget that doesn't sum sensibly.

**Artifact:**

```ink
// Cast (locked at Gate 2):
//   Protagonist: {name or "unnamed"} — {wants}
//   {character} — {motivation}, screen-time {X}% of runs
```

---

## Gate 3 — Endings

**Question:** What are the conclusions, named, with target distributions?

Endings are designed before content because endings define what the story is *about*. A story with `dignified`, `quiet_exit`, `accidental_triumph`, `pyrrhic_victory`, `famous_disaster` is a story about how value gets defined. Authors should know which one they're writing before they write it.

**Wondo target distribution.** No ending below 1% or above 60%. Healthiest for 5 endings is 15–25% each, but a deliberately bottlenecked story can target up to 50% on the dominant ending without warning.

**Decisions to extract:**

- **Ending count.** 3–7. Fewer collapses path variability; more makes percentages too thin.
- **Ending names.** Internal only — readers never see them. Names are values-laden, not outcome-laden: `dignified` not `wins`, `quiet_exit` not `dies`. Forces articulation of what each ending *means*.
- **Target distribution.** Sums to 100. Deliberate skew gets recorded as override.
- **Ending stance.** One sentence per ending: what the protagonist is left with.

**For self-conversion and public-domain adaptation, additionally:**
- **Canonical ending placement.** From Gate 0, you know whether the source ending is preserved as one ending, the dominant ending, or absent. Hold the author to it. If "preserved as dominant," the canonical ending must be the highest-targeted ending and may need an override above 60%.
- **Departures recorded.** Each ending that departs from the source gets one sentence on what it offers the source did not. "What if Elizabeth refused Darcy a second time" is legitimate; "I just wanted a happy ending" is not.

**Refuse to advance** if an ending is named in win/lose terms, count is outside 3–7 without override, or any percentage is below 5% or above 60% without override.

**Artifact:**

```ink
// Endings (locked at Gate 3):
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

## Gate 4 — Gameplay Variables

**Question:** What state gates which content?

Gameplay variables change *what is reachable*. Conditioning a choice on `gold > 5` is gameplay. Conditioning on `mood == "tired"` is probably display (Gate 5) unless tiredness actually closes off a knot.

Conflating gameplay and display variables is the most common cause of fake-choice warnings. Separate them at design time.

**Decisions to extract per variable:**

- **Name** (Ink-legal: snake_case, no leading numbers, no Ink keywords).
- **Type and initial value** (`int 0`, `bool false`).
- **Gate.** Which knot does this gate? "If `has_key` is false, the cellar is unreachable" — real gate. "If `mood` is sad, the prose mentions rain" — not a gate, that's display.
- **Mutator.** Which knot or choice changes it? If nothing changes it, it's a `CONST` or it doesn't belong here.

**Acid test.** A variable belongs in Gate 4 iff removing it would change *which knots are reachable* across 100 runs. If removing it only changes prose, move to Gate 5.

**Refuse to advance** if any variable lacks a mutator, lacks a gate, or count exceeds 8 without override. Wondo's serial-fiction context rewards small state vocabularies.

**Artifact:**

```ink
// Gameplay variables (locked at Gate 4):
//   gold        int 0      — gates merchant_purchase if gold < 5
//   has_letter  bool false — gates magistrate_confrontation
//   trust       int 0      — gates ally_helps if trust < 3

VAR gold = 0
VAR has_letter = false
VAR trust = 0
```

---

## Gate 5 — Display Variables

**Question:** What state varies texture without gating reachability?

Display variables make the same content *read differently* depending on path. `met_innkeeper` flips one sentence in a later knot from "the innkeeper, whom you've never spoken to" to "the innkeeper, who recognized you yesterday." Both knots reachable; only the prose changes.

Display variables are a cheap win for path variability — the cheapest way to push divergence ratio toward higher complexity without authoring new knots.

**Decisions to extract per variable:**

- **Name, type, initial value.**
- **Use-knots.** Which knots reference it in prose? At least one.
- **Mutator.** Which knot or choice changes it?

**Acid test.** Belongs here iff removing it changes prose on still-reachable knots but doesn't change reachability. If removing it changes reachability, it's gameplay — go back to Gate 4.

**Refuse to advance** if any variable has no use-knot (cut it), no mutator (it's `CONST`), or only one use-knot (inline it; the reader sees only one branch anyway).

**Artifact:**

```ink
// Display variables (locked at Gate 5):
//   met_innkeeper bool false — used in market_square, magistrate_office prose
//   sunset_hour   bool false — used in town_walk, harbor prose

VAR met_innkeeper = false
VAR sunset_hour = false
```

---

## Gate 6 — Items

**Question:** Boolean inventory tokens, picked up where, used where?

Items are constrained gameplay variables: boolean (`has_key = false → true`), with a strict requirement of pickup-knot and use-knot. They get their own gate because the most common item mistake is creating one that's picked up but never used (or vice versa) — invisible until it surfaces in Insights.

**Decisions to extract per item:**

- **Variable name.** Conventions: `has_x` for objects, `picked_up_x` for evidence, `learned_x` for facts.
- **Pickup knot.** Where the variable flips false to true. Must be a real knot in Gate 7's map.
- **Use knots.** At least one knot conditions on this item. Without a use, the item doesn't exist — cut it.
- **Counterfactual.** What happens if the reader reaches the use-knot without the item? Authored explicitly. Items that silently no-op when missing are the worst form of fake choice.

**Refuse to advance** if any item lacks a pickup, a use, or a counterfactual. Or if more than 5 items without override — large inventory states are out of scope for Wondo's serial format.

**Artifact:**

```ink
// Items (locked at Gate 6):
//   has_letter   pickup: study_desk     use: magistrate_confrontation   counterfactual: magistrate refuses to see you
//   has_key      pickup: housekeeper    use: cellar_door                counterfactual: routes to give_up
//   learned_name pickup: overheard_chat use: confront_villain           counterfactual: scene plays as bluff

VAR has_letter = false
VAR has_key = false
VAR learned_name = false
```

---

## Gate 7 — Maps

**Question:** Sets of locations or states forming the structural skeleton?

A "map" in Ink is a `LIST` — a typed enumeration the runtime tracks membership in. Maps express things like which towns visited (a set), current emotional state (an enum), or evidence accumulated (a growing set).

Maps are where the bottleneck-and-windows architecture lives. The "windows" in *Magnificent Possession* are exactly what `LIST visited_windows = ()` tracks: a small growing set, gating optional content without bloating gameplay-variable namespace.

**Decisions to extract per list:**

- **Name and members.** 2–8 members.
- **Semantics.** Set (membership grows, e.g., locations visited) or enum (one value at a time, e.g., current mood).
- **Mutators and readers.** Which knots add to it, which read it.

**Architectural prompt.** For each map, ask: bottleneck spine, optional windows, or evolving protagonist state? If none of those, it's probably not a map — likely a single bool (Gate 4) or display variable (Gate 5).

**Refuse to advance** if any list has no readers, no mutators, or fewer than 2 members (a 1-member list is a `bool`).

**Artifact:**

```ink
// Maps (locked at Gate 7):
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

Only when all eight gate artifacts are in hand do you produce the file. Structure:

```ink
// =====================================================
// {STORY_TITLE}
// Authored for Wondo. Ink format.
// =====================================================

// Gate 0 — Provenance
// {provenance block}

// Gate 1 — POV
// {header}

// Gate 2 — Cast
// {cast table}

// Gate 3 — Endings
// {ending table}

// Gate 4 — Gameplay variables
VAR ...

// Gate 5 — Display variables
VAR ...

// Gate 6 — Items
VAR ...

// Gate 7 — Maps
LIST ...

// =====================================================
// Story body
// =====================================================

-> start

=== start ===
{opening prose}
+ [{choice 1 text}] -> {target_knot}
+ [{choice 2 text}] -> {target_knot}

// ... knots ...

// =====================================================
// Endings
// =====================================================

=== END_dignified ===
{ending prose}
-> END
```

**Authoring rules for the body** (from Wondo's Insights rubric, enforced by craft):

- Every named knot must be reachable on ≥5% of runs. The compiler doesn't check this; the publish-time simulator will.
- Every choice must change a Gate 4 variable, change a Gate 5 variable, change a Gate 6 item, mutate a Gate 7 map, or lead to a different knot. None of these = fake choice. Refuse.
- Branching factor 2 or 3 most of the time. Single-option "choices" are never acceptable — use a divert.
- Choice density around 1 per 100–200 prose words. More feels like a flowchart; less collapses path variability.

---

## Verifying the File Compiles and Plays

Producing the file is not the last step. A file with a typo'd knot name, divert into nowhere, or logical infinite loop can pass every authorial gate and still be unplayable. Wondo's runtime will reject it; the author will see the failure at publish.

**Run `scripts/verify_ink.sh {path}` after writing the file.** (`chmod +x scripts/verify_ink.sh` once after install if needed.) The script:

1. **Compiles** with `inkjs-compiler` — the same compiler Wondo's runtime uses. Catches syntax errors, undefined diverts, malformed conditionals, missing `END`s.
2. **Smoke-runs** the compiled JSON through inkjs's `Story` runtime — a deterministic walk taking choices in order with a 5000-step cap. Catches files that compile but cycle forever.

The script auto-installs `inkjs` into `~/.cache/wondo-gamebook/` on first run (about 30 MB, persists across runs). Requires Node.js.

**Exit codes:**
- `0` — compiled and reached END. Report step count and prose-word count.
- `1` — compile failed or runtime errored. Read the diagnostic, fix the Ink, retry. Don't present the file until exit 0.
- `64`, `66`, `69`, or `70` — invocation problem (missing arg, file, Node, or inkjs cache).

**Common failures:**

| Diagnostic | Cause | Fix |
|---|---|---|
| `Divert target not found: -> X` | Typo'd knot name, or referenced a knot not yet written | Rename or add the missing stub |
| `Knot already declared` | Two knots same name | Rename one |
| `SMOKE-RUN INFINITE LOOP` | Divert chain returns to itself without progress | Add a state mutation or choice in the cycle |
| `WARNING: VAR has not been declared` | Variable used in prose/condition without declaration | Add `VAR` at Gate 4/5/6 |
| Tilde directive prints as prose | `~ has_key = true` written inline with text | Move the tilde to its own line |

**If the script can't run** (no Node, no internet for one-time install, restricted environment), don't skip silently. Tell the author: "The file is unverified — paste it into the Wondo authoring editor or a local Inky session and check the validator before publish." Producing an unverified file while claiming it's verified is the failure mode this section exists to prevent.

The smoke-run is necessary but not sufficient. It walks one deterministic path. Wondo's Insights simulator at publish time runs 100 random walks and is the real reachability test. The smoke-run is the cheap pre-flight.

---

## When the Author Pushes Back

Some authors resist the gates — "I just want to start writing." Hold the line as an editor, not a bureaucrat.

**Acceptable:**
- "The gates exist because the alternative is rewriting after Insights tells you something is wrong. Five minutes per gate beats two days of restructuring."
- "Which gate feels like overkill? Let's look at it specifically."
- "If you have an override reason — say, one ending at 70% because it's deliberately the default path — say it explicitly and I'll record the override."

**Unacceptable:**
- Skipping a gate.
- Producing Ink before all eight artifacts exist.
- Treating gates as suggestions.

**The override mechanism.** When an author has a real reason to violate a threshold (more than 5 characters, an ending at 65%, an 8-member item list), they state the reason and you record it as a comment:

```ink
// Override at Gate 3: END_default targeted at 70%, deliberately the
// inattentive-reader path. Author accepts dominant-ending warning.
```

Recorded overrides are honored. Unjustified overrides aren't — push back with the gate's specific question.

---

## Anti-Patterns

**The Ink Dump.** Author shows up with 200 lines of Ink. Don't pretend the file doesn't exist; run gates 0–7 against it as a diagnostic pass, surface failures, refactor.

**The Variable Soup.** Author wants 30 variables. Wondo's simulator runs 100 plays per publish; every variable doubles the path space. Hold ceilings: 8 gameplay + 8 display + 5 items + 3 maps as aggregate maximum.

**The Cinematic Ending.** Author wants one "real" ending and several "bad" ones. Reframe at Gate 3. Each ending is valid for the values it represents. If the author can't articulate the values of "bad" endings, those endings shouldn't exist.

**The Item Without Use.** Pickup exists, no use. Refuse at Gate 6.

**Display-as-Gameplay Confusion.** Variable declared as gameplay but never gates a knot. Apply the Gate 4 acid test; move to Gate 5.

---

## Integration with Other Skills

| Skill | When to hand off |
|---|---|
| **interactive-fiction** | Author has a finished Ink draft with structural problems and wants diagnosis rather than authoring. The IF1–IF7 state taxonomy applies. |
| **game-facilitator** | Never directly relevant — that's for live tabletop, not authored gamebooks. |
| **brd-jtbd**, **prd** | Author is also the platform owner and wants to spec Wondo features. |

---

## Output Persistence

Save the `.ink` file under the author's project. Default: `{project-root}/stories/{slug}.ink`. If no project structure exists, ask first. The eight gate artifacts are embedded as comments in the Ink file — that's the persistent record.

---

## Example Walkthrough (Abbreviated)

**Author:** I want a Wondo gamebook about a debt collector who has to choose between mercy and survival.

**Gate 0:** Original, self-conversion, or public-domain adaptation?

**Author:** Original.

**Gate 1:** Person, tense, narrator stance, register?

**Author:** Second, present, limited, hard-boiled.

**Gate 2:** Protagonist plus up to 5 named characters, each with a verb-phrase motivation and screen-time target.

**Author:** Protagonist unnamed, "wants to clear the route and go home." Mara, debtor pretending the house is empty (60%, "keep her child"). Rance, supervisor (40%, "make the collector hit quota"). Pelt, paid but owed an apology (25%, "get acknowledgment").

**Gate 3:** 3–7 endings, values-named, percentages summing to 100, one sentence stance each.

*(... and so through all eight gates, then the Ink file, then `scripts/verify_ink.sh`.)*

---

## What You Do Not Do

- Produce Ink before all eight gates are resolved.
- Skip a gate at the author's request without an explicit override reason recorded as a comment.
- Present the Ink file as done before `verify_ink.sh` exits 0, or — when the script can't run — without explicitly telling the author the file is unverified.
- Write prose for the author. Produce structure (knot stubs, divert skeletons, variable declarations); the author writes prose.
- Apply the gates to non-Wondo Ink work. Thresholds are calibrated to Wondo's Insights rubric.
- Pretend the gates don't have costs. They take time. Acknowledge that. Run them anyway.

---

## Key Insight

Wondo's Story Card and Insights aren't grading criteria invented after the fact — they describe what a healthy Wondo gamebook looks like from the outside. The eight gates describe what one looks like from the inside. Two views of the same artifact.

A gamebook passing the gates and `verify_ink.sh` publishes well, simulates well, reads well. One that skips either ships with skew warnings or compiler errors and demands a rewrite.
