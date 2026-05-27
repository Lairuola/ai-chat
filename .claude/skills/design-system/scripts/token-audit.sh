#!/usr/bin/env bash
# token-audit.sh — Find hardcoded values that should be design tokens
#
# Usage: ./token-audit.sh [path]
#
# Arguments:
#   path   Directory to scan (default: src/)
#
# Reports:
#   - Hardcoded hex colors not assigned to a CSS variable
#   - Raw px spacing/sizing values not using CSS custom properties
#
# Does NOT report:
#   - Values inside comments
#   - Values inside CSS custom property definitions (e.g. --color-primary: #...)
#   - Values in test files (*test*, *spec*, *.stories.*)
#
# Must be run from the project root.

set -euo pipefail

SCAN_DIR="${1:-src}"

if [[ ! -d "$SCAN_DIR" ]]; then
  echo "Directory not found: $SCAN_DIR"
  echo "Usage: $0 [path]"
  exit 1
fi

TMPFILE_COLORS="$(mktemp)"
TMPFILE_SPACING="$(mktemp)"
trap 'rm -f "$TMPFILE_COLORS" "$TMPFILE_SPACING"' EXIT

# ── Hardcoded colors ──────────────────────────────────────────────────────────
# Matches hex colors that appear as values (not in CSS var definitions or comments)

echo "Scanning: $SCAN_DIR"
echo ""

COLOR_COUNT=0

# Search in .tsx .ts .css .scss files, excluding tests and stories
grep -rn \
  --include="*.tsx" --include="*.ts" --include="*.css" --include="*.scss" \
  --exclude="*.test.*" --exclude="*.spec.*" --exclude="*.stories.*" \
  -E '(color|background|border|fill|stroke|shadow)[^:]*:[^;]*#[0-9a-fA-F]{3,8}' \
  "$SCAN_DIR" 2>/dev/null \
  | grep -v 'var(--' \
  | grep -v '^\s*//' \
  | grep -v 'CSS custom property\|--[a-z]' \
  > "$TMPFILE_COLORS" || true

# Also catch bare hex values used directly (e.g. as props or template literals)
grep -rn \
  --include="*.tsx" --include="*.ts" \
  --exclude="*.test.*" --exclude="*.spec.*" --exclude="*.stories.*" \
  -E '"#[0-9a-fA-F]{3,8}"|'"'"'#[0-9a-fA-F]{3,8}'"'" \
  "$SCAN_DIR" 2>/dev/null \
  | grep -v 'var(--' \
  >> "$TMPFILE_COLORS" || true

COLOR_COUNT=$(wc -l < "$TMPFILE_COLORS" | xargs)

# ── Hardcoded spacing ─────────────────────────────────────────────────────────
# Matches px values in margin, padding, gap, width, height that don't use var()

SPACING_COUNT=0

grep -rn \
  --include="*.tsx" --include="*.ts" --include="*.css" --include="*.scss" \
  --exclude="*.test.*" --exclude="*.spec.*" --exclude="*.stories.*" \
  -E '(margin|padding|gap|top|right|bottom|left|width|height)[^:]*:\s*[0-9]+px' \
  "$SCAN_DIR" 2>/dev/null \
  | grep -v 'var(--' \
  | grep -v '^\s*//' \
  | grep -v '0px\|1px\|2px' \
  > "$TMPFILE_SPACING" || true

SPACING_COUNT=$(wc -l < "$TMPFILE_SPACING" | xargs)

# ── Report ────────────────────────────────────────────────────────────────────

TOTAL=$((COLOR_COUNT + SPACING_COUNT))

if [[ "$TOTAL" -eq 0 ]]; then
  echo "✓ No hardcoded token candidates found in $SCAN_DIR"
  echo "  All colors and spacing appear to use CSS custom properties."
  exit 0
fi

echo "Token Audit — $SCAN_DIR"
echo "Found $TOTAL candidate(s) for tokenization"
echo ""

if [[ "$COLOR_COUNT" -gt 0 ]]; then
  echo "── Hardcoded Colors ($COLOR_COUNT) ──────────────────────────────"
  # Group by file for readability
  awk -F: '{
    file=$1; line=$2
    # Combine remaining fields as content
    content=""
    for(i=3;i<=NF;i++) content=content (i==3?"":" ") $i
    gsub(/^[[:space:]]+/, "", content)
    printf "  %s:%s\n    %s\n\n", file, line, substr(content,1,100)
  }' "$TMPFILE_COLORS" | head -60
fi

if [[ "$SPACING_COUNT" -gt 0 ]]; then
  echo "── Hardcoded Spacing ($SPACING_COUNT) ──────────────────────────────"
  awk -F: '{
    file=$1; line=$2
    content=""
    for(i=3;i<=NF;i++) content=content (i==3?"":" ") $i
    gsub(/^[[:space:]]+/, "", content)
    printf "  %s:%s\n    %s\n\n", file, line, substr(content,1,100)
  }' "$TMPFILE_SPACING" | head -60
fi

if [[ "$TOTAL" -gt 120 ]]; then
  echo "(Output truncated — run with a narrower path to see all)"
fi

echo ""
echo "These values are candidates for design tokens."
echo "Review against docs/design-system/tokens.md before extracting."
