---
name: create
description: "Building at any fidelity from words to production code. Explores multiple directions, prototypes within design system constraints, and converges with documented rationale. Use when user says 'build this', 'design this', 'prototype', 'wireframe', 'explore directions', 'try some options', or has a committed scope that needs tangible solutions."
---

# Create

*Primarily divergent. Explore by building.*

The gap between thinking about a solution and building one is where most design learning happens. You explore by building, not by thinking more. With AI, first-idea fixation intensifies — you must ask for alternatives; they won't appear on their own.

## Purpose

- **Creates** solutions at whatever fidelity the current question demands
- **Diverges** before converging — generates multiple directions, flags premature convergence
- **Constrains** generation to the design system when one exists
- **Records** directions explored and convergence rationale

## When to Load

- Entering Create (Clarity + Appetite set from Define, nothing built yet)
- Looping back from Validate (iterate with specific learnings)

---

## The Fidelity Ladder

Match fidelity to the question you're answering.

| Level | Tests... | Method | When to use |
|-------|----------|--------|-------------|
| **Words** | Thinking | Plain text content, problem restatement | "Does this concept make sense?" |
| **Sketches** | Structure | Breadboards, fat marker drawings, ASCII layouts | "Does this layout work?" |
| **Wireflows** | Navigation | Connected low-fi screens, user flow diagrams | "Does this flow work?" |
| **Prototypes** | Interaction | Interactive, clickable, possibly coded | "Does this interaction feel right?" |
| **Production** | Everything | Polished, accessible, performant, tested | "Is this ready to ship?" |

AI collapses the fidelity ladder — it can go from words to working prototype in minutes. **Resist this temptation.** Low fidelity forces clarity by preventing detail fixation. The constraint is the point.

---

## Core Activities

### 1. Start with Content, Not Layout

Write what you're building in plain text before designing. Words force clarity about WHAT before getting lost in HOW IT LOOKS.

> "This is a settings page where users can find and change their preferences.
> The top section shows the most-changed settings. Below that, settings are
> grouped by category. Each group can be expanded to show all options."

### 2. Design System Check

Before generating anything, read `docs/design-system/SYSTEM-STATE.md`:
- What tokens exist? Use them.
- What components exist? Compose from them.
- What patterns exist? Follow them.
- Only create new when the system genuinely doesn't cover the need.

See the `design-system` skill for full constraint rules.

### 3. Generate Multiple Directions (Minimum 3)

Not one idea refined — several ideas explored, then the best elements selected.

| Direction | Fidelity | Description | Strengths | Weaknesses |
|-----------|----------|-------------|-----------|------------|
| A | [level] | [description] | | |
| B | [level] | [description] | | |
| C | [level] | [description] | | |

Directions should be **genuinely different**, not variations of one idea. Different structures, different metaphors, different interaction models.

### 4. Prototype Mode

When a direction needs validation through working code:

- Create throwaway branch: `prototype/{slug}-direction-{letter}`
- **Explicit permission to skip**: accessibility, design tokens, tests, docs, error handling, performance
- Focus ONLY on validating the core concept
- Capture learnings when done (what worked, didn't, surprised)
- Return to main branch after validation

### 5. Converge

After exploring 3+ directions, evaluate:
- Which best serves the user goals from Understand?
- Which fits within the appetite from Define?
- Which avoids the rabbit holes from Define?

**Record WHY you converged** — the rejected directions and their rationale are as valuable as the chosen one.

---

## Output

Write to Canvas Create section:
- Content-first description
- Directions explored (table with fidelity, description, strengths, weaknesses)
- Direction chosen + rationale
- Directions rejected + why
- Prototype artifacts (branch names, screenshots, key learnings)

---

## Co-Pilot Behavior

**DO**:
- Generate multiple directions deliberately (not one, several)
- Flag premature convergence: "We've only explored one direction — want to see alternatives before committing?"
- Maintain fidelity discipline (start low, increase only when the question demands it)
- Reference design system constraints
- Record all directions with rationale

**DO NOT**:
- Generate high-fidelity output when low fidelity would answer the question
- Converge on direction A without building B and C
- Skip the "words first" step
- Treat prototypes as production code
- Add features beyond the pitch scope from Define

**CRITICAL BOUNDARY**: The last 40% — nuance, quality, polish, the sense of rightness — remains human territory. The co-pilot generates; you curate. Taste is not automatable.

---

## Exit Criteria

Ready to advance to Validate when:
- Something testable exists at appropriate fidelity
- 3+ directions explored
- Direction chosen with documented rationale
- **Exploration lens**: satisfied

> Create has produced something testable. Ready to enter Validate.
> Loading `validate` skill.

---

## Anti-Patterns

- **Jumping to production fidelity** when the question only demands wireflows
- **Converging on one direction** without exploring alternatives
- **Treating prototypes as production** — prototypes are throwaway validation
- **Ignoring the design system** — compose from existing before inventing

---

## Related

- [Define](../define/SKILL.md) — Provides the pitch that constrains Create
- [Validate](../validate/SKILL.md) — Handoff target after Create
- [Design System](../design-system/SKILL.md) — Read before building, constrains generation
- [Documentation](../documentation/SKILL.md) — Canvas management, session protocols
- [Research](../research/SKILL.md) — For knowledge gaps during building
- `references/foundations/*` — Tokens, typography, colors, layouts, components, viewport, motion
- `references/patterns/COMPONENTS.md` + `COMPONENT_BEHAVIOR.md` — Component visual specs and behavior rules
- `references/patterns/FORMS.md` + `FORM_DETAILS.md` — Form patterns
- `references/patterns/DATA_DISPLAY.md` — Tables, lists, pagination, filtering
- `references/patterns/NAVIGATION.md` — Sidebar, tabs, breadcrumbs, command palette
- `references/patterns/SEARCH.md` — Search and autocomplete patterns
- `references/patterns/NOTIFICATIONS.md` — Toasts, banners, notification center
- `references/patterns/CONTENT_MICROCOPY.md` — Button labels, errors, empty states
- `references/patterns/STATE_MANAGEMENT.md` + `SERVER_STATE.md` — State management patterns
- `references/patterns/ERROR_HANDLING.md` + `ERROR_RECOVERY.md` — Error and recovery patterns
- `references/implementation/ENGINEERING.md` — Architecture decisions, code quality
