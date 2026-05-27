---
name: design-system
description: "Cross-cutting design system management. Maintains token, component, and pattern inventory. Use when user mentions 'design system', 'tokens', 'components', 'patterns', 'design constraints', 'DS audit', or during Create and Deliver phases for system constraint checks and pattern extraction."
---

# Design System

The design system is the grammar; design phases compose sentences. AI bounded by an established system produces better output than unconstrained AI.

## Purpose

- **Constrains** `create` to generate within established patterns and tokens
- **Maintains** the canonical inventory of tokens, components, and patterns
- **Grows** through pattern extraction during Deliver and Cooldown
- **Compounds** — each cycle leaves the system richer, making the next cycle faster

## When to Load

- During **Create**: Constrains what `create` generates
- During **Deliver**: Quality checks against the system, pattern extraction
- During **Cooldown**: Receiving new patterns from Documentation skill
- On demand: When explicitly working on the design system itself

---

## Persistent State

All design system state lives in `docs/design-system/`:

| File | Purpose | Updated by |
|------|---------|-----------|
| `SYSTEM-STATE.md` | Canonical inventory — tokens, components, patterns with status | Design System skill |
| `tokens.md` | Active token values and definitions | Design System skill |
| `patterns.md` | Extracted reusable patterns with source cycle and usage guidance | Design System skill (from Create/Deliver/Documentation input) |
| `changelog.md` | DS evolution log — what changed, when, from which cycle | Design System skill |

> SYSTEM-STATE template: `assets/SYSTEM-STATE-TEMPLATE.md` — use this when initializing `docs/design-system/SYSTEM-STATE.md` for the first time.

---

## Reading DS State

Before generating any design or code, the `create` skill reads `SYSTEM-STATE.md` to understand what exists.

### Token Status

Tokens are organized by category (typography, colors, spacing, motion, shadows, etc.). Each has a status:

- **stable**: Production-ready, use freely
- **draft**: In development, use with caution
- **not defined**: No token exists yet — may need to create one

### Component Inventory

Components with their variants, status, and source cycle. The `create` skill checks here before building a new component.

### Pattern Catalog

Reusable patterns with usage guidance. The `create` skill checks here before inventing a new interaction or layout pattern.

---

## Rules for AI Generation

### Priority Order

When building anything during Create or Deliver:

1. **Compose from existing** — Use tokens, components, and patterns already in the system
2. **Extend existing** — Adapt an existing pattern for a new context
3. **Create new** — Only when the system genuinely doesn't cover the need

### Flagging New Creations

When generating outside the system, the phase skill must flag it:

> "This requires a new [token/component/pattern] not in the current design system.
> Existing alternatives considered: [what was checked and why it doesn't fit].
> Proposed addition: [description]."

This flag goes into the Canvas decisions log and becomes a candidate for DS extraction during Deliver or Cooldown.

### Token Discipline

- Use semantic tokens over primitive values. `color-interactive-primary` not `blue-500`.
- Never hardcode values that should be tokens (colors, spacing, typography, motion, shadows).
- When a token doesn't exist but should, flag it rather than hardcoding.

### Component Discipline

- Check the component inventory before building. If a similar component exists, adapt it.
- Follow established API patterns (consistent prop names: `variant`, `size`, `intent`).
- New components should follow the patterns of existing ones.

---

## Pattern Extraction

Patterns get extracted from completed work during Deliver and Cooldown.

### What Qualifies for DS Promotion

A pattern is worth promoting to the design system when:

- Used in **2+ cycles** (the "three uses" rule — needs evidence of reuse)
- Solves a **general problem** (not context-specific to one feature)
- Follows **existing system conventions** (tokens, naming, API patterns)

### Canon vs. Expanded Universe

- **Canon**: Core patterns used across the product. Lives in `docs/design-system/`.
- **Expanded universe**: One-off patterns for specific contexts. Documented in the feature's Canvas, not promoted to DS unless reused.

### Extraction Protocol

When extracting a new pattern:

1. **Identify**: What from this cycle is reusable?
2. **Evaluate**: Does it meet promotion criteria? Is it genuinely general?
3. **Document**: Add to `patterns.md` with:
   - Pattern name and category (token, component, interaction, layout)
   - Description and when to use
   - Source cycle (which feature it came from)
   - Usage guidance (do/don't)
4. **Update state**: Add to `SYSTEM-STATE.md` inventory
5. **Log**: Add entry to `changelog.md`

---

## DS Evolution Lifecycle

```
Cycle 1: DS is sparse
  → Create generates many new patterns, flags each
  → Deliver/Cooldown: Extract 2-3 patterns to DS
  → DS has foundation

Cycle 3: DS has basics
  → Create composes more, invents less
  → Create phase is faster (composition, not invention)
  → Fewer new patterns extracted

Cycle 5+: DS is substantial
  → Create works primarily by composition
  → New patterns are refinements, not inventions
  → Create and Deliver phases are significantly faster
```

This compounding effect is the primary return on design system investment.

---

## DS Audit

On demand, the Design System skill can audit the current system:

1. Read all files in `docs/design-system/`
2. Run `scripts/token-audit.sh [path]` to surface hardcoded values in source code that should be tokens
3. Compare against `references/` (what a complete DS should have)
4. Report:
   - **Gaps**: Categories with no tokens, needed components
   - **Inconsistencies**: Naming mismatches, orphaned tokens
   - **Staleness**: Patterns not used in recent cycles
   - **Hardcoded values**: From token-audit output
5. Recommend actions

---

## Token Architecture Direction

The research synthesis (`docs/research/2026-02-13-ai-native-design-system-synthesis.md`) recommends:

- **W3C DTCG format** for token definition (three-tier: primitive → semantic → component)
- **Semantic naming** with intent: `color-interactive-primary` not `blue-500`
- **AI metadata** via `$extensions` (usage, doNot, pairedTokens, components, a11y)
- **Style Dictionary** for token transformation

The system starts simple (`tokens.md` as plain markdown) and grows toward this architecture as the DS matures. Don't over-engineer tokens before the system has enough patterns to justify the infrastructure.

---

## Co-Pilot Behavior

### DO:
- Always check DS state before building
- Compose from existing before creating new
- Flag every new creation for potential DS extraction
- Keep DS documentation concise and actionable
- Track which patterns are actually used (usage counts in SYSTEM-STATE.md)

### DO NOT:
- Skip the DS check ("I'll just hardcode this")
- Promote one-off patterns to the system (wait for reuse evidence)
- Over-engineer the DS before it has content (start simple, grow with cycles)
- Let the DS become stale (update during every Deliver/Cooldown)

---

## Related

- [Create](../create/SKILL.md) — Primary consumer; reads DS state before building, flags new patterns
- [Deliver](../deliver/SKILL.md) — Quality checks against the system, pattern extraction
- [Documentation](../documentation/SKILL.md) — Triggers pattern extraction during Cooldown
- [Understand](../understand/SKILL.md) — May reference DS during constraint mapping
- `docs/design-system/` — Persistent DS state
- `references/foundations/*` — General design system knowledge (static)
- `references/implementation/TOKEN_INTEGRATION.md` — Token implementation patterns
- `docs/research/2026-02-13-ai-native-design-system-synthesis.md` — Target architecture research
