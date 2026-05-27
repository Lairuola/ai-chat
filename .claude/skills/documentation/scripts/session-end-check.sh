#!/usr/bin/env bash
# session-end-check.sh — Verify Canvas is properly updated before ending a session
#
# Usage: ./session-end-check.sh <slug>
#
# Checks:
#   1. Session Handoff table has a row with today's date
#   2. Lens Scan table has no empty Status cells
#   3. Frontmatter 'updated' date is today
#
# Exit codes:
#   0 — all checks pass
#   1 — one or more checks failed (items still need updating)
#   2 — usage error or Canvas not found
#
# Must be run from the project root.

set -euo pipefail

CYCLES_DIR="docs/cycles"

# ── Argument validation ───────────────────────────────────────────────────────

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <slug>"
  exit 2
fi

SLUG="$1"
TODAY="$(date +%Y-%m-%d)"
CANVAS_FILE="$CYCLES_DIR/$SLUG/CANVAS.md"

if [[ ! -f "$CANVAS_FILE" ]]; then
  echo "Error: Canvas not found at $CANVAS_FILE"
  echo "  Has this cycle been created? Run new-cycle.sh first."
  exit 2
fi

# ── Check 1: Session Handoff has today's date ─────────────────────────────────

HANDOFF_TODAY=$(awk '
  /^## Session Handoff/ { in_handoff=1; next }
  /^## / && !/^## Session Handoff/ { in_handoff=0 }
  in_handoff { print }
' "$CANVAS_FILE" | grep -c "^| $TODAY" || true)

# ── Check 2: Lens Scan has no empty Status cells ──────────────────────────────

# Lens Scan rows look like: | Clarity | | |
# A populated status cell has non-whitespace between the 2nd and 3rd pipes
EMPTY_LENS_COUNT=$(awk '
  /^## Lens Scan/ { in_scan=1; next }
  /^## / && !/^## Lens Scan/ { in_scan=0 }
  in_scan && /^\| / && !/^\| Lens/ && !/^\| ---/ && !/^\| -/ {
    # Extract status field (2nd column, between 1st and 2nd separator)
    split($0, cols, "|")
    # cols[1]=empty, cols[2]=lens name, cols[3]=status, cols[4]=note
    status = cols[3]
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", status)
    if (status == "") print $0
  }
' "$CANVAS_FILE" | wc -l | xargs)

# ── Check 3: Frontmatter 'updated' date is today ──────────────────────────────

UPDATED_DATE=$(awk '
  /^---/ { fm_count++; next }
  fm_count == 1 && /^updated:/ { print $2 }
' "$CANVAS_FILE" | head -1 | xargs)

# ── Report ────────────────────────────────────────────────────────────────────

echo "Session end check: $SLUG"
echo ""

FAILURES=0

# Check 1
if [[ "$HANDOFF_TODAY" -gt 0 ]]; then
  echo "✓ Session Handoff — today's row present"
else
  echo "✗ Session Handoff — no row with today's date ($TODAY)"
  FAILURES=$((FAILURES + 1))
fi

# Check 2
if [[ "$EMPTY_LENS_COUNT" -eq 0 ]]; then
  echo "✓ Lens Scan — all status cells filled"
else
  echo "✗ Lens Scan — $EMPTY_LENS_COUNT status cell(s) still empty"
  FAILURES=$((FAILURES + 1))
fi

# Check 3
if [[ "$UPDATED_DATE" == "$TODAY" ]]; then
  echo "✓ Frontmatter 'updated' — set to today ($TODAY)"
else
  echo "✗ Frontmatter 'updated' — shows $UPDATED_DATE (expected $TODAY)"
  FAILURES=$((FAILURES + 1))
fi

echo ""

if [[ "$FAILURES" -eq 0 ]]; then
  echo "All checks passed. Canvas is ready. Session can close."
  exit 0
else
  echo "$FAILURES check(s) failed. Update Canvas before wrapping up."
  exit 1
fi
