#!/usr/bin/env bash
# new-cycle.sh — Scaffold a new design cycle from the canonical Canvas template
#
# Usage: ./new-cycle.sh <slug> <name> <phase> <appetite>
#
# Arguments:
#   slug       kebab-case identifier, e.g. checkout-flow
#   name       Human-readable name, e.g. "Checkout Flow Redesign"
#   phase      Starting phase: understand | define | create | validate | deliver
#   appetite   Time box: hours | days | 1-week | 2-weeks | 6-weeks
#
# Must be run from the project root.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"  # documentation/ skill folder
ASSETS_DIR="$SCRIPT_DIR/assets"
CANVAS_TEMPLATE="$ASSETS_DIR/CANVAS-TEMPLATE.md"
INDEX_TEMPLATE="$ASSETS_DIR/CYCLES-INDEX-TEMPLATE.md"

CYCLES_DIR="docs/cycles"
INDEX_FILE="$CYCLES_DIR/INDEX.md"

# ── Argument validation ───────────────────────────────────────────────────────

if [[ $# -lt 4 ]]; then
  echo "Usage: $0 <slug> <name> <phase> <appetite>"
  echo "  slug:     kebab-case (e.g. checkout-flow)"
  echo "  name:     quoted string (e.g. \"Checkout Flow Redesign\")"
  echo "  phase:    understand | define | create | validate | deliver"
  echo "  appetite: hours | days | 1-week | 2-weeks | 6-weeks"
  exit 1
fi

SLUG="$1"
NAME="$2"
PHASE="$3"
APPETITE="$4"
TODAY="$(date +%Y-%m-%d)"

# Validate slug format (kebab-case: lowercase letters, numbers, hyphens)
if ! [[ "$SLUG" =~ ^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$ ]]; then
  echo "Error: slug must be kebab-case (lowercase letters, numbers, hyphens only)"
  echo "  Got: $SLUG"
  exit 1
fi

# Validate phase
VALID_PHASES="understand define create validate deliver"
if ! echo "$VALID_PHASES" | grep -qw "$PHASE"; then
  echo "Error: phase must be one of: $VALID_PHASES"
  echo "  Got: $PHASE"
  exit 1
fi

# Check template exists
if [[ ! -f "$CANVAS_TEMPLATE" ]]; then
  echo "Error: Canvas template not found at $CANVAS_TEMPLATE"
  echo "  Run from project root, or check skill assets are intact."
  exit 1
fi

# ── Cycle directory ───────────────────────────────────────────────────────────

CYCLE_DIR="$CYCLES_DIR/$SLUG"
CANVAS_FILE="$CYCLE_DIR/CANVAS.md"

if [[ -d "$CYCLE_DIR" ]]; then
  echo "Error: Cycle directory already exists: $CYCLE_DIR"
  echo "  To resume an existing cycle, load its Canvas directly."
  exit 1
fi

mkdir -p "$CYCLE_DIR"

# ── Canvas scaffolding ────────────────────────────────────────────────────────

# Copy template and substitute placeholders
sed \
  -e "s/\[Feature Name\]/$NAME/g" \
  -e "s/^slug: feature-name$/slug: $SLUG/" \
  -e "s/^phase: understand$/phase: $PHASE/" \
  -e "s/^appetite: \"\"$/appetite: $APPETITE/" \
  -e "s/^created: YYYY-MM-DD$/created: $TODAY/" \
  -e "s/^updated: YYYY-MM-DD$/updated: $TODAY/" \
  "$CANVAS_TEMPLATE" > "$CANVAS_FILE"

echo "✓ Canvas created: $CANVAS_FILE"

# ── INDEX.md update ───────────────────────────────────────────────────────────

# Create INDEX.md from template if it doesn't exist
if [[ ! -f "$INDEX_FILE" ]]; then
  mkdir -p "$CYCLES_DIR"
  cp "$INDEX_TEMPLATE" "$INDEX_FILE"
  echo "✓ INDEX.md created: $INDEX_FILE"
fi

# Append row to the Active table
# The Active table ends at the first blank line after the header row
# We insert before ## Completed section
NEW_ROW="| $NAME | $SLUG | $PHASE | $APPETITE | $TODAY | $TODAY | |"

# Insert the new row before "## Completed"
if grep -q "^## Completed" "$INDEX_FILE"; then
  # Use a temp file for safe in-place edit
  TMPFILE="$(mktemp)"
  awk -v row="$NEW_ROW" '
    /^## Completed/ { print row; print ""; }
    { print }
  ' "$INDEX_FILE" > "$TMPFILE"
  mv "$TMPFILE" "$INDEX_FILE"
else
  echo "$NEW_ROW" >> "$INDEX_FILE"
fi

echo "✓ INDEX.md updated: Active → $NAME ($SLUG)"

# ── Done ──────────────────────────────────────────────────────────────────────

echo ""
echo "Cycle scaffolded: $NAME"
echo "  Canvas:   $CANVAS_FILE"
echo "  INDEX:    $INDEX_FILE"
echo "  Phase:    $PHASE"
echo "  Appetite: $APPETITE"
echo ""
echo "Next: Load the $PHASE skill and begin work."
