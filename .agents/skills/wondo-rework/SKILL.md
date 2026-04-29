---
name: wondo-rework
description: Compress a public-domain or self-owned source into a single-chapter Wondo gamebook in Ink. Rework mode is locked (faithful conversion, source POV preserved). Walks the author through six tight gates, then assembles and verifies a single `.ink` file with the same `verify-ink.ts` script the full skill uses. Use when the user says "rework this for Wondo," "convert this short story into a Wondo gamebook," "single-chapter Wondo Ink," or hands over a Project Gutenberg `.txt`. Prefer the full `wondo-interactive-fiction` skill for multi-chapter, original IF, or adaptations that modernize/relocate the source.
license: MIT
metadata:
  type: constructive
  mode: gated-authoring
  domain: wondo-interactive-fiction
  produces: .ink
---

# Wondo Rework: Compressed Authoring Skill

Take a short source text and produce a verified single-chapter Ink gamebook for Wondo. This is a stripped-down sibling of `wondo-interactive-fiction` — same validation rubric, bundled verifier, fewer decisions. The skill is self-contained: `scripts/verify-ink.ts` and `references/` (verifier reference + asset brief template) live alongside this file.

**Locked defaults** (do not ask, do not let the author override without an explicit reason):

- **Mode:** `rework` (faithful conversion — voice, names, setting, canonical arc preserved)
- **Chapters:** 1 (single-file layout, no INCLUDEs, no sequential-release audit)
- **POV:** inherited from the source (auto-detected; surfaced for confirmation only)
- **Total runthrough:** 10 minutes (single-session, single-chapter rhythm)
- **Endings:** 5

If any of these defaults is wrong for the author's project, redirect to `wondo-interactive-fiction`.

## Core principle

Wondo's Insights simulator runs N random walks at publish and grades the story by ending distribution and knot reach. The gates below produce the structural shape that lands the simulator's numbers in the green. The included `verify-ink.ts` runs the same probe locally, so a clean local pass predicts a clean publish.

Targets the verifier enforces:

- 5 endings, each reached on 5–60% of runs (3–7 endings allowed, 5 is default)
- Every named knot reached on ≥5% of runs
- Branching factor 2–3 per choice; choice density ~1 per 100–200 prose words
- ~10-minute single-path runthrough → ~2,000 prose words on a single playthrough → ~4,000 prose words written across all branches (multi-path inflation ~2×)

## Skill arguments

```
/wondo-rework [<source-path>] \
  [--slug=<slug>] \
  [--minutes=<8-15>] \
  [--endings=<3-7>]
```

| Arg | Pre-fills | Default |
|---|---|---|
| `<source-path>` (positional) | source provenance + auto-detected metadata | refuse — rework needs a source |
| `--slug=<slug>` | working title / output directory | ask |
| `--minutes=<n>` | total runthrough budget | `10` |
| `--endings=<n>` | ending count | `5` |

**Auto-detected from the source file** (surface for confirmation):

- Source word count via `wc -w` minus PG boilerplate
- Title / author / year from the Project Gutenberg header (`*** START OF THE PROJECT GUTENBERG EBOOK ***`)
- Source POV (person, tense, register) from the opening pages
- Cast (named characters appearing 2+ times)

If a flag violates a threshold (e.g. `--minutes=30`), refuse and redirect to `wondo-interactive-fiction` — multi-chapter is its job, not this skill's.

## The six gates

Order is fixed. Each gate produces a small comment-block artifact embedded in the final `.ink` file. **No Ink is produced until all six are resolved.**

| # | Gate | Question | Artifact |
|---|---|---|---|
| 0 | **Source** | What's the source, and is it legally usable? | `// Provenance:` header |
| 1 | **Length** | Total minutes and prose budget? | `// Length budget:` header |
| 2 | **POV** | Inheriting source voice — confirm or shift? | `// POV:` header |
| 3 | **Cast** | Who's named, screen-time, motivations? | `// Cast:` table |
| 4 | **Endings** | 3–7 conclusions, named, distributed? | `=== END_x ===` stubs |
| 5 | **State** | Gameplay vars, display vars, items, lists? | `VAR` / `LIST` declarations + acid-test notes |

After Gate 5, assemble the single-file Ink and run `verify-ink.ts`. Then draft the asset brief.

---

## Gate 0 — Source

**Decisions to extract:**

- **Branch.** Public-domain adaptation, or self-conversion of the author's own fiction. (Original IF is out of scope — redirect to `wondo-interactive-fiction`.)
- **Public-domain confirmation.** Author confirms in plain language that the source is PD in their jurisdiction. PG header alone is not sufficient — translations and annotated editions are common copyright traps. If unsure, refuse.
- **Edition.** Author confirms they're working from an out-of-copyright edition (not a 2020 translation of an 1880 novel).
- **Cultural-context stance.** Default `preserved` (rework). Anything else is a departure; record the reason.
- **Attribution.** Default: "Adapted from {title} by {author} ({year})" surfaced in Wondo's story description.
- **Working title / slug.**

**Refuse to advance** if PD confirmation, edition, or attribution is missing.

**Artifact:**

```ink
// Provenance (locked at Gate 0): REWORK
//   Source: {title} by {author}, {year}
//   Edition: {out-of-copyright edition}
//   Mode: rework (faithful conversion)
//   Cultural context: preserved
//   Attribution: Adapted from {title} by {author} ({year})
```

---

## Gate 1 — Length

**Decisions to extract:**

- **Source word count.** Auto-detected; confirm. Used as faithfulness ceiling: a 50,000-word novella cannot fit a 10-minute Wondo gamebook with full content preserved — commit to compression or subset selection.
- **Total runthrough.** 8–15 minutes (default 10). Outside this band, redirect to `wondo-interactive-fiction`.
- **Average path words.** `minutes × 200` (Wondo's calibrated reading speed).
- **Total prose budget written.** `minutes × 400` — single-path × ~2 multi-path inflation. Sanity-check against the source word count: if source is 7,000 words and budget is 4,000, the rework keeps roughly 60% of the source compressed into IF rhythm.

**Refuse to advance** if total minutes are outside 8–15, or the source is so long (>20,000 words) that compression alone can't fit it without losing the canonical arc.

**Artifact:**

```ink
// Length budget (locked at Gate 1):
//   Source: ~{source_words} words (public-domain)
//   Total gameplay: {N} minutes (single chapter)
//   Average path words (single playthrough): ~{N × 200}
//   Total prose budget written: ~{N × 400}
```

---

## Gate 2 — POV

**Default:** inherit source POV verbatim. Auto-detect person, tense, narrator stance, and register from the source's opening pages.

**Decisions to extract:**

- **Inheritance confirmation.** Surface the auto-detected 4-tuple (person, tense, stance, register) and ask the author to confirm. Departures are allowed but flagged: a third-person source becoming second-person Ink is a real authorial choice that changes reader identification, and rework's faithfulness intent should be checked.
- **Register adjustment.** If the source is wildly archaic (e.g. 1840s Dickens), the author may compress register one notch (literary → conversational) to fit IF rhythm without losing voice. Record as a deliberate departure.

**Refuse to advance** if the source POV cannot be inferred from the supplied text — inheritance needs something to inherit.

**Artifact:**

```ink
// POV (locked at Gate 2): {person}, {tense}, {stance}, {register}
//   Inherited from source.
```

---

## Gate 3 — Cast

**Decisions to extract:**

- **Protagonist.** Name (or "unnamed" if the source uses an unnamed first-person narrator). One sentence: what they want at the start.
- **Named cast.** Up to 5. Names inherited from source verbatim (rework default). Screen-time budget per character (% of runs they appear in). Motivation as one verb-phrase per character — vague ("be mysterious") rejected; concrete ("recover the letter") accepted.
- **Soft 5-character cap.** The source dictates cast in rework mode; if it has 7 named figures, push back on which 2 can become atmospheric ("mentioned, not interactive") rather than enforce a hard cut.
- **Inherited motivation alignment.** Each character's Wondo motivation must be consistent with their source motivation. Departures need an editorial reason.

**Refuse to advance** if any character lacks a motivation, or the cast exceeds 5 without source attribution.

**Artifact:**

```ink
// Cast (locked at Gate 3):
//   Protagonist: {name or "unnamed"} — {wants at start}
//   {character} — {motivation}, screen-time {X}% of runs
//   ...
```

---

## Gate 4 — Endings

**Defaults:** 5 endings; canonical (source) ending preserved as the *dominant* ending at ~35–50%; remaining 50–65% spread across 4 alternatives.

**Decisions to extract:**

- **Ending count.** 3–7 (default 5). Fewer collapses path variability; more makes percentages thin.
- **Canonical placement.** Preserved as one ending, preserved as the dominant ending (default), or absent. If "preserved as dominant," it gets the highest target — and may need an explicit override above 60% if the source's ending is structurally inevitable.
- **Ending names.** Internal only, never shown to readers. Values-laden, not outcome-laden: `dignified` not `wins`, `quiet_exit` not `dies`. Forces the author to articulate what each ending *means*.
- **Targets.** Sum to 100. None below 5% or above 60% without override. Deliberate skew gets recorded.
- **Departures.** Each non-canonical ending gets one sentence on what it offers the source did not. "What if Elizabeth refused Darcy a second time" is legitimate; "I just wanted a happy ending" is not.

**Refuse to advance** if an ending is named in win/lose terms, count is outside 3–7 without override, or any percentage is below 5% / above 60% without override.

**Artifact:**

```ink
// Endings (locked at Gate 4):
//   END_canonical        — target 45% — preserved-as-dominant: source's resolution
//   END_dignified        — target 18% — alt: protagonist accepts loss with self-respect intact
//   END_quiet_exit       — target 14% — alt: withdraws without resolving
//   END_pyrrhic_victory  — target 13% — alt: wins, pays beyond what they expected
//   END_famous_disaster  — target 10% — alt: failure becomes public spectacle

=== END_canonical ===
// stub
-> END

=== END_dignified ===
-> END
// ...
```

---

## Gate 5 — State

State is the most error-prone gate and is consolidated here: gameplay variables, display variables, items, and structural lists all share the same acid-test discipline. **Run each subgate's acid test for every variable.** Conflating types is the most common source of fake-choice and buried-scene warnings at publish.

**Aggregate ceiling:** 8 gameplay vars + 8 display vars + 5 items + 3 lists. For a 10-minute single-chapter rework, half of those is plenty; full ceilings are an upper bound, not a target.

### 5a. Gameplay variables

Change *what is reachable*. `gold > 5` gating a merchant knot is gameplay.

**Per variable:** name (snake_case, Ink-legal), type + initial value, the knot it gates, and the knot or choice that mutates it.

**Acid test:** removing the variable changes which knots are reachable across 100 runs. If removal only changes prose, move it to 5b.

### 5b. Display variables

Reader-perceptible meters or tells the Wondo runtime renders natively. Their job is to give the reader a recurring on-screen indicator that subtly nudges path selection without gating reachability.

**Not silent prose re-colorings.** A variable that flips "the innkeeper, whom you've never spoken to" to "the innkeeper, who recognized you yesterday" in one buried clause fails the visibility test — the reader of *that* run sees only one version and can't compare. Reserve those for choice-result text or knot-specific authoring; they aren't state.

**Per variable:** name, type, initial value; what the reader sees (NPC body language, status indicator, ambient news ticker, narrator register); nudge direction (high `terror` → reader leans protective); mutator.

**Acid test (two parts):** (1) removing the variable does not change reachability; (2) the reader visibly notices the variable's state on a single playthrough.

### 5c. Items

Constrained gameplay variables: `bool`, with strict pickup-knot and use-knot requirements. The most common item mistake is a pickup that's never used, or a use that silently no-ops when the item is missing.

**Per item:** variable name (`has_x`, `picked_up_x`, `learned_x`), pickup knot, at least one use knot, and the **counterfactual** — what happens if the reader reaches the use-knot without the item. Items that silently no-op when missing are the worst kind of fake choice; refuse them.

### 5d. Lists (structural maps)

Optional. Use `LIST` only when the structure is genuinely a set (locations visited, evidence accumulated) or enum (current emotional state). 2–8 members per list. A 1-member list is a `bool`; a list with no readers or no mutators isn't a list.

**Refuse to advance Gate 5** if any variable lacks an acid test, any item lacks a counterfactual, any list lacks readers/mutators, or the aggregate exceeds the ceilings without recorded override.

**Artifact:**

```ink
// Gameplay variables (locked at Gate 5a):
//   has_letter  bool false — gates magistrate_confrontation. Mutated by study_desk.
//   trust       int 0      — gates ally_helps if trust < 3. Mutated by dialogue beats.

// Display variables (locked at Gate 5b):
//   jenks_terror   int 2 — visible: NPC body-language tics in every Jenks scene;
//                          nudge: high → reader leans protective. Mutated by experiment outcomes.

// Items (locked at Gate 5c):
//   has_letter   pickup: study_desk    use: magistrate_confrontation   counterfactual: magistrate refuses to see you
//   has_key      pickup: housekeeper   use: cellar_door                counterfactual: routes to give_up

// Lists (locked at Gate 5d):
//   visited_rooms  set — members: study, garden, cellar
//                        mutators: each room's entry knot
//                        readers: ending selector

VAR has_letter = false
VAR trust = 0
VAR jenks_terror = 2
VAR has_key = false
LIST visited_rooms = ()
```

---

## Assembling the Ink file

Single-file layout — this skill is single-chapter by definition, so no INCLUDEs and no sequential-release audit.

**File path:** `stories/{slug}/{slug}.ink`.

**Layout:**

```ink
// =====================================================
// {STORY_TITLE}
// Authored for Wondo. Ink format. Rework of {source}.
// =====================================================

// {Gate 0 provenance block}
// {Gate 1 length budget block}
// {Gate 2 POV header}
// {Gate 3 cast table}
// {Gate 4 endings table}
// {Gate 5 state acid-test notes}

VAR ...
LIST ...

-> start

=== start ===
{prose paraphrased from source into IF rhythm}
+ [{choice}] -> {target}
    ~ {variable mutation}
+ [{choice}] -> {target}

// ... rest of the story's knots ...

=== END_canonical ===
{prose}
-> END

=== END_dignified ===
{prose}
-> END
// ... remaining endings ...
```

### Knot bodies — rework convention

Knot bodies contain **full prose paraphrased from the source into IF rhythm**: person/tense/register matching the inherited POV; voice matching the source; names matching the inherited cast. The author owns the final edit, but the skill's output is playable as-is — no `[PROSE: ...]` placeholders.

```ink
=== start ===
A warmish afternoon last spring. I was sitting in my study trying to figure out a plot when Porky Jenks came in to see me.
{the ~600–1000 words paraphrasing the source's opening, broken across this knot and its
 immediate descendants, with original beats — confession, demonstration, mechanics —
 preserved in compressed IF rhythm}
+ [Show me. Right now. I want to see it work.] -> demand_demo
    ~ pushed_porky = pushed_porky + 1
+ [Slow down. Tell me everything that's happened first.] -> get_full_story
```

### Authoring rules for the body

- Every named knot must be reachable on ≥5% of runs (verifier checks this).
- Every choice must change a variable, mutate state, or lead to a different knot. None of those = fake choice. Refuse.
- Branching factor 2 or 3 per choice point. Single-option "choices" → use `->` divert instead.
- Choice density ~1 per 100–200 prose words.
- Per-knot prose stays roughly within Gate 1's budget. Going long on the opening squeezes the back half.
- `-> start` must appear before any knot definition. Single-file layout means this is automatic — but never strand it after the knots.

---

## Verifying the file compiles and plays

Producing the file is not the last step. Run the bundled verifier — same rubric the full skill uses:

```
node --no-warnings=ExperimentalWarning \
  .agents/skills/wondo-rework/scripts/verify-ink.ts \
  stories/{slug}/{slug}.ink
```

Pass the primary `.ink` file. The script auto-installs `inkjs` to `~/.cache/wondo-gamebook/` on first run (~30 MB). Requires Node 22+ (24 recommended).

It runs four phases in order:

1. **Static checks** — regex over the source. Catches dangling diverts, orphan knots, tilde directives mid-line, missing endings block. The endings-block search accepts `// Endings (locked at Gate N)` for any digit, so this skill's `Gate 4` block parses cleanly.
2. **Compile** — `inkjs.Compiler` programmatically (same compiler Wondo's runtime uses). Catches syntax errors, undefined diverts, malformed conditionals.
3. **Smoke walk** — one fixed-seed random walk with a 5000-step cap. Catches infinite cycles and stranded entries.
4. **Distribution** — 400 random walks (default; `--runs` configurable). Counts which `END_*` each walk terminates at, compared against the targets parsed from the Gate 4 block. Same probe Wondo's Insights simulator runs at publish.

**Exit codes:**
- `0` — all gating phases passed.
- `1` — compile / static / smoke-walk failure. Read the diagnostic, fix, retry. Don't present the file until exit 0.
- `2` — compiled and walked OK, but distribution rubric failed: a declared `END_*` was never reached, or its share is outside 1–60% on N≥100 runs.
- `64`, `66`, `69`, `70` — invocation problem (bad flag, missing file, npm bootstrap failure, inkjs version mismatch).

**Common failures:** dangling diverts (typo'd knot names — rename or add the stub); compile errors (read the inkjs message); `__max-steps` cycles (add a state mutation or choice in the cycle); ending shares outside 1–60% (add or remove choice routes to that ending); `declared ending never reached` (audit the divert chain feeding it); tilde directives printing as prose (move `~ has_key = true` to its own line).

Useful flags: `--runs <n>`, `--seed <n>`, `--strict-reach`, `--no-distribution`, `--quiet`, `--json`. Full reference: `.agents/skills/wondo-rework/references/verify-ink.md`.

**If the script can't run** (no Node, no internet for the one-time install, restricted environment), tell the author: "The file is unverified — paste it into the Wondo authoring editor or a local Inky session and check the validator before publish." Producing an unverified file while claiming it's verified is the failure mode this section exists to prevent.

---

## Phase 6 — Asset brief

After `verify-ink.ts` exits 0, produce `stories/{slug}/brief.md` — the contract `wondo-pixellab-assets` consumes. Use the bundled template at `.agents/skills/wondo-rework/references/brief-template.md` (authoritative for section headers).

Walk the assembled `.ink` and populate: **header** (title, slug, source path, date); **cast** (parse the Gate 3 block, one row per character); **endings** (Gate 4 block as context, no illustrations); **scenes** (walk knot bodies; each knot with a clearly illustratable beat — location change, gesture, `# SCENE:` tag — becomes a row, cap ~10); **objects** (placeholder; pixellab "objects" are visual props, not Gate 5c items). Leave ideation prompt / cover prompt / style suffix / palette blank with comments — the author tunes before invoking pixellab.

**Done message** (after verify exits 0 AND `brief.md` is written):

> Story compiled and walked clean. Brief drafted at `stories/{slug}/brief.md`. Run `wondo-pixellab-assets` if you want illustrations, or ship the `.ink` to Wondo as-is.

---

## Output persistence

```
stories/{slug}/
├── {slug}.ink          # primary and only Ink file (single-chapter layout)
├── {slug}.txt          # raw source text (optional; useful for verification)
├── brief.md            # Phase 6 asset brief
└── assets/             # gitignored; pixellab generates illustrations here
```

The slug is the author's working title from Gate 0 (lowercase, hyphenated, no spaces — e.g. `pellucidar`, not `pg20121`). If the working title isn't slug-safe, ask for a short slug.

---

## Pushback, overrides, anti-patterns

Hold the line as an editor: skipping a gate, producing Ink before all six artifacts exist, or treating gates as suggestions is unacceptable. When an author has a real reason to violate a threshold, record it as a comment:

```ink
// Override at Gate 4: END_canonical targeted at 65%, deliberately the dominant
// path because the source's resolution is structurally inevitable.
```

Recorded overrides are honored; unjustified overrides aren't.

Common anti-patterns to refuse: **Ink dumps** (run gates 0–5 against them as a diagnostic pass and refactor); **length sprawl** (30+ minute single-chapter — redirect to `wondo-interactive-fiction`); **silent display variables** (the reader can't see them on a single playthrough — cut or restate as a meter); **items without use** (pickup exists, no use); **cinematic endings** (one "real" ending and several "bad" ones — reframe at Gate 4); **POV drift** (mid-story shift breaks immersion); **the translation trap** (a 2020 English translation of an 1880 Russian novel is in copyright, not PD).

## What you do not do

- Produce Ink before all six gates are resolved.
- Skip a gate without an explicit override reason recorded as a comment.
- Present the Ink file as done before `verify-ink.ts` exits 0, or — when the script can't run — without explicitly telling the author the file is unverified.
- Mix rework prose and `[PROSE: ...]` placeholders. This skill is rework-only; full prose lands at gate-output time.
- Apply this skill to multi-chapter projects, original IF, or transformative adaptations. Redirect to `wondo-interactive-fiction`.

A rework passing the gates and `verify-ink.ts` publishes well, simulates well, reads well. One that skips either ships with skew warnings or compiler errors and demands a rewrite.
