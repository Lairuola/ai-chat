#!/usr/bin/env bash
# check-cycle-health.sh — Report active cycle status and flag stale canvases
#
# Usage: ./check-cycle-health.sh [--stale-days N]
#
# Options:
#   --stale-days N   Days without a session handoff before flagging as stale (default: 14)
#
# Must be run from the project root.
# Reads: docs/cycles/INDEX.md and each active cycle's CANVAS.md

set -euo pipefail

CYCLES_DIR="docs/cycles"
INDEX_FILE="$CYCLES_DIR/INDEX.md"
STALE_DAYS=14

# ── Parse flags ───────────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
  case "$1" in
    --stale-days)
      STALE_DAYS="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--stale-days N]"
      exit 1
      ;;
  esac
done

# ── Check INDEX exists ────────────────────────────────────────────────────────

if [[ ! -f "$INDEX_FILE" ]]; then
  echo "No cycles index found at $INDEX_FILE"
  echo "No cycles have been started yet."
  exit 0
fi

# ── Parse Active table ────────────────────────────────────────────────────────

# Extract rows from the ## Active section (stop at ## Completed or end of file)
# Row format: | Cycle | Slug | Phase | Appetite | Started | Last Session | Tags |
ACTIVE_ROWS=$(awk '
  /^## Active/ { in_active=1; next }
  /^## (Completed|Dropped)/ { in_active=0 }
  in_active && /^\| / && !/^\| Cycle/ && !/^\| ---/ && !/^\| -/ { print }
' "$INDEX_FILE")

if [[ -z "$ACTIVE_ROWS" ]]; then
  echo "Active Cycles (0)"
  echo "  No active cycles."
  exit 0
fi

# ── Compute days difference ───────────────────────────────────────────────────

today_epoch=$(date +%s)

days_since() {
  local date_str="$1"
  # Validate date format
  if ! [[ "$date_str" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "?"
    return
  fi
  local then_epoch
  # macOS date syntax
  then_epoch=$(date -j -f "%Y-%m-%d" "$date_str" +%s 2>/dev/null) || {
    echo "?"
    return
  }
  echo $(( (today_epoch - then_epoch) / 86400 ))
}

# ── Report ────────────────────────────────────────────────────────────────────

CYCLE_COUNT=0
STALE_COUNT=0
OUTPUT_LINES=()

while IFS='|' read -r _ cycle slug phase appetite started last_session tags _; do
  # Trim whitespace from each field
  cycle=$(echo "$cycle" | xargs)
  slug=$(echo "$slug" | xargs)
  phase=$(echo "$phase" | xargs)
  last_session=$(echo "$last_session" | xargs)

  [[ -z "$slug" ]] && continue
  CYCLE_COUNT=$((CYCLE_COUNT + 1))

  # Check Canvas for last handoff date (overrides INDEX.md if more accurate)
  CANVAS_FILE="$CYCLES_DIR/$slug/CANVAS.md"
  if [[ -f "$CANVAS_FILE" ]]; then
    # Get last non-header, non-separator row from Session Handoff table
    HANDOFF_DATE=$(awk '
      /^## Session Handoff/ { in_handoff=1; next }
      /^## / && !/^## Session Handoff/ { in_handoff=0 }
      in_handoff && /^\| [0-9]/ { last=$0 }
      END { print last }
    ' "$CANVAS_FILE" | awk -F'|' '{print $2}' | xargs)

    if [[ -n "$HANDOFF_DATE" && "$HANDOFF_DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
      last_session="$HANDOFF_DATE"
    fi
  fi

  DAYS=$(days_since "$last_session")

  if [[ "$DAYS" == "?" ]]; then
    STATUS="?"
    LABEL="  ? $slug"
    AGE_STR="no handoff recorded"
  elif [[ "$DAYS" -gt "$STALE_DAYS" ]]; then
    STATUS="stale"
    STALE_COUNT=$((STALE_COUNT + 1))
    LABEL="  ⚠ $slug"
    AGE_STR="${DAYS}d ago — STALE"
  else
    STATUS="ok"
    LABEL="  ✓ $slug"
    AGE_STR="${DAYS}d ago"
  fi

  # Pad slug field to 22 chars for alignment
  PAD_SLUG=$(printf "%-22s" "$slug")
  PAD_PHASE=$(printf "%-12s" "$phase")

  OUTPUT_LINES+=("$LABEL    → $PAD_PHASE last: $last_session  ($AGE_STR)")
done < <(echo "$ACTIVE_ROWS")

# ── Print summary ─────────────────────────────────────────────────────────────

echo "Active Cycles ($CYCLE_COUNT)"
for line in "${OUTPUT_LINES[@]}"; do
  echo "$line"
done

if [[ "$STALE_COUNT" -gt 0 ]]; then
  echo ""
  echo "⚠ $STALE_COUNT cycle(s) stale (no session in $STALE_DAYS+ days)."
  echo "  Consider resuming or dropping these cycles."
fi
