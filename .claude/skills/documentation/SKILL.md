---
name: documentation
description: "Active manager for Canvas lifecycle, session protocols, and Cooldown. Use when user says 'start session', 'wrap up', 'save state', 'cooldown', 'reflect', 'create canvas', 'check cycles', or at session start/end for continuity management."
---

# Documentation

Active manager for all persistent documentation. Owns the Canvas lifecycle, project-level knowledge, session start/end protocols, and the Cooldown phase.

## Purpose

- **Manages** the two-tier documentation system (project-level + feature-level)
- **Facilitates** cross-session continuity through Canvas state
- **Runs** Cooldown: reflection, pattern extraction, learning promotion
- **Maintains** the cycles INDEX and project-level knowledge base

---

## Two-Tier Documentation

### Feature-Level: The Canvas

Each cycle gets a single living document — the Canvas. It tracks state, decisions, and artifacts across sessions.

**Location**: `docs/cycles/{slug}/CANVAS.md`

#### Canvas Format

> Template: `assets/CANVAS-TEMPLATE.md` — copy this file directly; do not reconstruct from memory.

#### Canvas Lifecycle

1. **Create**: When a new full-mode cycle begins. Initialize with frontmatter and empty sections.
2. **Grow**: Phase sections fill in as work progresses. Decisions log and session handoff accumulate.
3. **Archive**: On completion, update status to `completed`, move entry in INDEX.

---

### Project-Level: Universal Knowledge

Knowledge that applies across all features and cycles. Grows through Cooldown promotion.

**Location**: `docs/project/`

| File | Contains | Updated when |
|------|----------|-------------|
| `OVERVIEW.md` | Product vision, strategy, competitive landscape, business constraints | Product direction shifts |
| `users.md` | User knowledge, mental models, goals, pain points accumulated across cycles | New user insights emerge |
| `principles.md` | Design principles established through practice | Cooldown, when a principle solidifies |
| `patterns.md` | Behavioral/UX patterns learned (not DS tokens) | Cooldown, when patterns generalize |
| `calibration.md` | Appetite calibration: expected vs. actual per cycle, trending accuracy | Every Cooldown |
| `decisions.md` | Key product-level decisions with rationale (cross-cutting, not per-feature) | When strategic decisions are made |

---

## Session Protocols

### Session Start

Execute when design work is requested:

1. **Check for active cycles**: Run `scripts/check-cycle-health.sh`
   - If no INDEX exists yet: this is the first cycle. Proceed to routing.
   - If active cycles exist: check if user's request matches one.
   - ⚠ STALE cycles should be surfaced to the user before proceeding.

2. **Load Canvas** (if active cycle matches):
   - Read Canvas frontmatter (status, phase, appetite)
   - Read Session Handoff table — LAST ROW (what happened, what's next)
   - Read Lens Scan (current navigation state)

3. **Present state**:
   > Resuming **[cycle name]**. Currently in **[phase]**.
   > Last session: [summary]. Next: [action].
   > Lenses: [scan summary]. Appetite: [status].
   > Proceed, or redirect?

4. **Load phase skill** based on Canvas phase:
   - Understand → `understand` skill
   - Define → `define` skill
   - Create → `create` skill
   - Validate → `validate` skill
   - Deliver → `deliver` skill
   - Cooldown → stay in `documentation` skill

### Session End

Execute when user signals done: "wrap up", "that's it", "save state", or end of session.

1. **Update Canvas**:
   - Update current phase section with work done
   - Add session handoff row (date, phase, summary, next action)
   - Update lens scan with current assessment
   - Add any new decisions to decisions log
   - Check off resolved open questions
   - Update frontmatter `updated` date and `phase` if changed

2. **Verify**: Run `scripts/session-end-check.sh <slug>` and show output.
   - If FAIL: address the listed items before confirming session close.
   - Do not skip this step. The check is the guarantee.

3. **Confirm** (only after check passes):
   > State saved for **[cycle name]**. Next session: [what to do].
   > Any corrections?

---

## Cooldown

The space between cycles. Triggered manually by the user.

Cooldown is owned by documentation.md because it is fundamentally about documentation: reflecting on the cycle, extracting patterns, and promoting feature learnings to project-level knowledge.

### When to Enter

- Work is shipped (Deliver completed)
- User explicitly requests: "let's do a cooldown" / "let's reflect"

### Reflection Prompts

Guide the user through these questions:

1. What surprised you during this cycle?
2. What would you do differently?
3. What assumptions did the work challenge or confirm?
4. What did prototyping reveal that thinking alone couldn't?
5. What did real user behavior reveal that you didn't expect?
6. Did the shipped work change user behavior? (Not "did it ship" — "did it matter?")

### Pattern Extraction

Review the cycle for reusable patterns:
- New interaction patterns → `docs/project/patterns.md` or `docs/design-system/patterns.md`
- New component patterns → `docs/design-system/patterns.md`
- New domain insights → `docs/project/users.md` or `docs/project/patterns.md`

### Appetite Calibration

Compare actual duration to appetite commitment:

```markdown
| Phase | Estimated | Actual | Delta | Note |
|-------|-----------|--------|-------|------|
```

Add to `docs/project/calibration.md`.

### Promotion Protocol

Facilitate: "What from this cycle applies broadly?"

| Learning type | Promote to |
|--------------|-----------|
| User insights | `docs/project/users.md` |
| Design principles | `docs/project/principles.md` |
| Behavioral patterns | `docs/project/patterns.md` |
| DS patterns/tokens | `docs/design-system/patterns.md` |
| Appetite data | `docs/project/calibration.md` |
| Cross-cutting decisions | `docs/project/decisions.md` |

### Cycle Archival

1. Update Canvas: `status: active → completed`, update `phase: cooldown`
2. Add reflection and calibration to Canvas (in a Cooldown section)
3. Update `docs/cycles/INDEX.md`: move from Active to Completed

### Co-Pilot Boundary

Reflection requires honesty. The co-pilot prompts the questions and captures the answers, but genuine assessment of what worked and what didn't is a human act of judgment.

---

## Cycles INDEX

**Location**: `docs/cycles/INDEX.md`

> Template: `assets/CYCLES-INDEX-TEMPLATE.md` — created automatically by `scripts/new-cycle.sh`.

---

## New Cycle Creation

When starting design work that qualifies for full mode:

1. Run `scripts/new-cycle.sh <slug> "<name>" <phase> <appetite>` — scaffolds Canvas and INDEX entry in one step
2. Run entry point decision tree (from CLAUDE.local.md) to confirm initial phase
3. Load appropriate skill

The script creates `docs/cycles/{slug}/CANVAS.md` from `assets/CANVAS-TEMPLATE.md` and appends the correct row to `docs/cycles/INDEX.md`, creating the INDEX from `assets/CYCLES-INDEX-TEMPLATE.md` if it doesn't exist yet.

---

## Co-Pilot Behavior

### DO:
- Maintain Canvas as a byproduct of working (not extra documentation effort)
- Present session state clearly on resume
- Prompt for reflection during Cooldown (ensure it happens)
- Facilitate promotion from feature to project level
- Track decisions and rationale as they happen

### DO NOT:
- Skip session end protocol (state must be saved)
- Treat Cooldown as optional ("we shipped, we're done")
- Provide dishonest reflection (flag failures, don't hide them)
- Over-document during active work (capture decisions, not process minutiae)

---

## Anti-Patterns

- Skipping session handoff updates — breaks cross-session continuity
- Letting Canvas sections grow unbounded — keep entries concise
- Promoting everything to project level — only what genuinely generalizes
- Treating project-level docs as static — they should evolve with each Cooldown

---

## Related

- [Understand](../understand/SKILL.md) — writes to Canvas Understand section
- [Define](../define/SKILL.md) — writes to Canvas Define section
- [Create](../create/SKILL.md) — writes to Canvas Create section
- [Validate](../validate/SKILL.md) — writes to Canvas Validate section
- [Deliver](../deliver/SKILL.md) — writes to Canvas Deliver section
- [Design System](../design-system/SKILL.md) — receives pattern extractions during Cooldown
- [Research](../research/SKILL.md) — writes to `docs/research/`, referenced from Canvas
