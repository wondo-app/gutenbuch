#!/usr/bin/env bash
#
# verify_ink.sh — compile and smoke-run a Wondo gamebook .ink file.
#
# Usage:  verify_ink.sh path/to/story.ink
#
# Exits 0 if the file compiles AND a random walk from the start reaches END.
# Exits non-zero with a diagnostic message otherwise.
#
# Requires: node, npm. Installs inkjs into a per-skill cache on first run
# (~30 MB, stored under ~/.cache/wondo-gamebook/ so it persists across runs
# without polluting the author's project).

set -euo pipefail

INK_FILE="${1:-}"
if [[ -z "$INK_FILE" ]]; then
  echo "usage: verify_ink.sh <story.ink>" >&2
  exit 64
fi
if [[ ! -f "$INK_FILE" ]]; then
  echo "verify_ink.sh: file not found: $INK_FILE" >&2
  exit 66
fi

# Ensure node is available
if ! command -v node >/dev/null 2>&1; then
  echo "verify_ink.sh: node is not installed. Install Node.js (https://nodejs.org)." >&2
  exit 69
fi

# Set up a persistent cache directory for inkjs so we don't reinstall every run
CACHE_DIR="${WONDO_GAMEBOOK_CACHE:-$HOME/.cache/wondo-gamebook}"
mkdir -p "$CACHE_DIR"

if [[ ! -d "$CACHE_DIR/node_modules/inkjs" ]]; then
  echo "verify_ink.sh: installing inkjs into $CACHE_DIR (one-time, ~30 MB)..." >&2
  (
    cd "$CACHE_DIR"
    if [[ ! -f package.json ]]; then
      npm init -y >/dev/null 2>&1
    fi
    npm install --silent inkjs 2>&1 | tail -5 >&2
  )
fi

INKJS_COMPILER="$CACHE_DIR/node_modules/.bin/inkjs-compiler"
if [[ ! -x "$INKJS_COMPILER" ]]; then
  echo "verify_ink.sh: inkjs-compiler not found at $INKJS_COMPILER" >&2
  echo "  Try: rm -rf '$CACHE_DIR' && rerun this script" >&2
  exit 70
fi

# Step 1 — compile.
# inkjs-compiler writes <input>.json by default. Errors go to stderr.
JSON_FILE="${INK_FILE}.json"
rm -f "$JSON_FILE"

# Capture both stdout and stderr; inkjs-compiler emits warnings/errors to stderr.
COMPILE_LOG="$(mktemp)"
trap 'rm -f "$COMPILE_LOG"' EXIT

if ! "$INKJS_COMPILER" "$INK_FILE" >"$COMPILE_LOG" 2>&1; then
  echo "verify_ink.sh: COMPILE FAILED" >&2
  cat "$COMPILE_LOG" >&2
  exit 1
fi

if [[ ! -f "$JSON_FILE" ]]; then
  echo "verify_ink.sh: compiler exited 0 but no JSON output produced" >&2
  cat "$COMPILE_LOG" >&2
  exit 1
fi

# Surface compiler warnings (non-fatal but worth flagging)
if grep -qiE 'warning|error' "$COMPILE_LOG" 2>/dev/null; then
  echo "verify_ink.sh: compiler messages:" >&2
  cat "$COMPILE_LOG" >&2
fi

# Step 2 — smoke-run with inkjs runtime.
# Walk the story making random choices until we reach END or hit a guard.
# Strips the BOM that inkjs-compiler writes at the start of the JSON.
node --input-type=commonjs -e "
const { Story } = require('$CACHE_DIR/node_modules/inkjs');
const fs = require('fs');

let raw = fs.readFileSync('$JSON_FILE', 'utf8');
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);

let story;
try {
  story = new Story(raw);
} catch (e) {
  console.error('verify_ink.sh: runtime failed to load compiled JSON');
  console.error(e.message);
  process.exit(1);
}

const MAX_STEPS = 5000;
let steps = 0;
let prose = '';

try {
  while (story.canContinue || story.currentChoices.length > 0) {
    while (story.canContinue) {
      prose += story.Continue();
      if (++steps > MAX_STEPS) {
        console.error('verify_ink.sh: SMOKE-RUN INFINITE LOOP — exceeded ' + MAX_STEPS + ' continue steps. Possible cycle without progress.');
        process.exit(1);
      }
    }
    if (story.currentChoices.length === 0) break;
    // Random choice — use a fixed seed so failures are reproducible.
    const idx = steps % story.currentChoices.length;
    story.ChooseChoiceIndex(idx);
    if (++steps > MAX_STEPS) {
      console.error('verify_ink.sh: SMOKE-RUN INFINITE LOOP — exceeded ' + MAX_STEPS + ' choice steps.');
      process.exit(1);
    }
  }
} catch (e) {
  console.error('verify_ink.sh: SMOKE-RUN ERRORED at step ' + steps);
  console.error(e.message);
  process.exit(1);
}

if (story.hasError) {
  console.error('verify_ink.sh: story reports errors:');
  for (const err of story.currentErrors) console.error('  - ' + err);
  process.exit(1);
}

const wordCount = prose.trim().split(/\\s+/).filter(Boolean).length;
console.log('verify_ink.sh: OK — compiled and reached END.');
console.log('  Steps walked: ' + steps);
console.log('  Prose words seen on this random run: ' + wordCount);
"
