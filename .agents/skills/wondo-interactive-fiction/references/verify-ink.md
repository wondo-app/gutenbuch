# `verify-ink.ts` reference

Wondo gamebook verifier with multi-file support. Resolves `INCLUDE` directives transitively from a primary `.ink` file, compiles the inlined source with `inkjs.Compiler` (programmatic, in-process — no CLI binary), then runs N seeded random walks. Compares ending distribution against the `// Endings (locked at Gate N):` block (any digit; tolerates skill-version drift).

Source: `.agents/skills/wondo-interactive-fiction/scripts/verify-ink.ts`.
inkjs cache: `~/.cache/wondo-gamebook/node_modules/inkjs` (auto-installed on first run; ~30 MB).

## INCLUDE resolution

Pass the **primary** file (e.g. `stories/{slug}/{slug}.ink`). On startup, the script reads the file, finds every `^[ \t]*INCLUDE[ \t]+<path>$` line, recursively reads each referenced file (paths resolve relative to the parent), and inlines content in place. The INCLUDE line itself is replaced with `// [resolved INCLUDE: <path>]` so inkjs's Compiler sees a single fully-inlined source rather than re-loading.

Reports the file count on stderr: `[verify-ink] resolved 6 files (primary + 5 INCLUDE)`. Cycles short-circuit (already-visited files return empty).

Static checks, compile, smoke walk, and distribution all run on the resolved source. Pass a chapter file directly only if you intentionally want to verify it standalone — but its references to knots in sibling chapters will fail static checks.

## Run

```
node --no-warnings=ExperimentalWarning \
  .agents/skills/wondo-interactive-fiction/scripts/verify-ink.ts <ink-file> [flags]
```

Node 22+ required; Node 24 has direct `.ts` execution as a stable feature.

## Flags

| Flag | Default | Effect |
|---|---|---|
| (positional) `<ink-file>` | required | Path to `.ink` source |
| `--runs <n>` | `400` | Distribution-walk count. `<100` suppresses gating and prints informational only. |
| `--seed <n>` | `hash(file mtime ^ size)` | Master seed; derived per-run as `(master * 0x9E3779B1 + i) | 0`. Same file → same seed sequence across runs. |
| `--max-steps <n>` | `5000` | Step cap per walk (Continue + ChooseChoiceIndex). Walks exceeding it classify as `__max-steps`. |
| `--strict-reach` | off | Escalate `<5%` knot-reach warnings to gating failures (exit 2). |
| `--no-distribution` | off | Skip phase 4. Equivalent of the legacy bash 1-walk pre-flight. |
| `--no-static` | off | Skip phase 3 regex checks. Use only when re-running after a known-fixed static issue. |
| `--quiet` | off | Stdout collapses to `verify-ink: PASS` / `FAIL — <phase>`. Stderr suppressed too. |
| `--json` | off | Stdout becomes the full report as JSON. Use for CI parsing. |
| `--cache-dir <path>` | `$WONDO_GAMEBOOK_CACHE` then `~/.cache/wondo-gamebook` | inkjs install location. |
| `--seed-run <n>` | unset | Replay only walk `n` from the master seed (debug aid; implies `--runs 1`). |
| `--help`, `-h` | — | Print usage. |

## Exit codes

| Code | Meaning |
|---|---|
| 0 | All gating phases passed. |
| 1 | Compile failed, smoke walk errored / hit max-steps, or static phase found a structural error (dangling divert, etc.). |
| 2 | Distribution rubric failed: a declared `END_*` outside 1–60% on N≥100 runs, or never reached. With `--strict-reach`, also fires for any named knot reached <5%. |
| 64 | Bad invocation (unknown flag, missing positional). |
| 66 | Input file not found / unreadable. |
| 69 | npm bootstrap failed (npm not on PATH, cache dir not writable). |
| 70 | inkjs version mismatch (Compiler/Story not exported). |

## Pipeline (in order; short-circuits on first gating failure)

1. **Argv & file checks** — exit 64/66 on bad CLI.
2. **INCLUDE resolution** — `resolveIncludes()` reads the primary file and transitively inlines every `INCLUDE <path>` directive. Returns the merged source plus a list of resolved file paths (primary + each INCLUDE) for the stderr count.
3. **inkjs bootstrap** — install if `~/.cache/wondo-gamebook/node_modules/inkjs/dist/ink-full.js` missing. Loaded via `createRequire` from cache `package.json`, imported as `inkjs/full`.
4. **Static checks** (regex on resolved source) — runs *before* compile. Errors gate (exit 1). Warnings print but don't gate. Sees knots from every INCLUDEd file.
5. **Compile** via `new ink.Compiler(taggedSource).Compile()`. Source is rewritten in memory to inject `# __VERIFY_INK__:<knot>` tags into every knot and `# __VERIFY_INK__:<knot>.<stitch>` into every stitch — disk source untouched. Compiler operates on the inlined source so no fileHandler is required.
6. **Smoke walk** — one walk with seed `deriveSeed(masterSeed, 0xb007)`. Failure → exit 1. A 1-step walk landing in `__terminal:unknown` typically means the primary file's `-> start` is misordered relative to the INCLUDE block.
7. **Distribution** — N walks via `new ink.Story(json)` per walk, mulberry32 PRNG for choice picks, `story.currentTags` filtered for the probe prefix to track per-walk knot reach and terminal classification.
8. **Report** — human (default), `--quiet`, or `--json`.

## Knot tracking

`state.currentPathString` is unreliable: nulls at story end, and skips `END_*` knots when execution diverts inside a single `Continue()`. The script works around this by injecting probe tags at compile time and reading `story.currentTags` after each `Continue()`. Tag prefix is `__VERIFY_INK__:` (constant `PROBE_TAG_PREFIX` near the top of the file).

To debug what was tracked: `--json` emits `{ endings, knotReach }` arrays directly; for a single walk, `--seed-run <n> --runs 1 --json` is reproducible.

## Tunable thresholds

These are file-top constants in `verify-ink.ts`. Edit there if Wondo's rubric changes:

| Constant | Default | What it gates |
|---|---|---|
| `HARD_LOWER_PCT` | `1` | Declared ending below this % → fail |
| `HARD_UPPER_PCT` | `60` | Declared ending above this % → fail |
| `DRIFT_TOLERANCE_PCT` | `10` | `|seenPct - target| >` this → warn (non-gating) |
| `KNOT_REACH_FLOOR_PCT` | `5` | Knot below this → warn, or fail with `--strict-reach` |
| `LOW_N_THRESHOLD` | `100` | Below this run count, distribution gating is suppressed |

## Extending

Future improvements likely land in these spots:

- **More static checks** — extend `runStaticChecks()`. Each new rule pushes a `Diagnostic` with severity `error` (gates) or `warn` (informational). Pattern: regex on `source`, append diagnostics, return `hasError` if any error severity present.
- **More terminal classifications** — `classifyTerminal()` currently emits `END_*`, `__max-steps`, `__error`, `__terminal:<knot>`. Add new bucket names for new pathological end states; the reporter sorts them after declared endings automatically.
- **Targeted-strategy walks** (analogue of `validate2.js`'s cautious / sells-out / press-first paths) — likely a separate script `verify-paths.ts` next to this one rather than a flag here. Out of scope for the gating verifier.
- **Ink runtime callbacks** — `story.onMakeChoice`, `story.onChoosePathString`, `story.onDidContinue` are usable for richer trace data if a future check needs per-choice telemetry. Probe in `.context/verify-ink-fixtures/probe*.js` already exercises these.
- **Endings-block parser** — `parseGate3()` (legacy name; the regex matches any digit, e.g. `Gate 3` or `Gate 4`). Accepts `—`, `-`, `–` between ending name and `target N%`. Add new dash variants or whitespace tolerances there if author conventions drift.
- **INCLUDE resolver** — `resolveIncludes()` follows `^[ \t]*INCLUDE[ \t]+<path>$` directives, resolves paths relative to the file's directory, and inlines content with a `// [resolved INCLUDE: <path>]` marker. Visited-set short-circuits cycles. Extend here for recursive INCLUDE search paths or other resolution strategies.
- **Bootstrap path** — `ensureInkjs()` is the single point for changing the cache layout. Keep the dir name `wondo-gamebook` — renaming costs every existing user a fresh 30 MB install.

## Test fixtures

Synthetic fixtures live in `.context/verify-ink-fixtures/` (gitignored, not part of the skill). Six cases cover happy / static-error / distribution-fail / max-steps / legacy-no-Gate3 / canonical-Gate3-example. Re-run after any change:

```
for f in happy dangling-divert skewed infinite legacy example-gate3; do
  node --no-warnings=ExperimentalWarning \
    .agents/skills/wondo-interactive-fiction/scripts/verify-ink.ts \
    ".context/verify-ink-fixtures/$f.ink" --quiet
  echo "  exit=$?"
done
```

Expected exits: `0 1 2 1 0 0`.
