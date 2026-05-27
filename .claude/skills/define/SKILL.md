---
name: define
description: "Scope commitment, appetite setting, and pitch writing. Shapes the investment level, identifies rabbit holes, and writes a pitch sharp enough to evaluate. Use when user says 'set appetite', 'write a pitch', 'scope this', 'how much is this worth', 'proceed or drop', or has a framed problem that needs investment commitment. Does not write code or create design artifacts."
---

# Define

*Primarily convergent. Where you commit.*

Define is where you choose what the problem is worth, draw boundaries, and write it down sharply enough that anyone could evaluate whether the work succeeded. Without this, you jump from vague understanding to enthusiastic building.

## Purpose

- **Sharpens** the problem statement from Understand into a commitment
- **Sets appetite** as a strategic choice — how much is this problem worth?
- **Writes the pitch** — problem, appetite, solution sketch, rabbit holes, no-gos
- **Generates scope variants** to make the appetite choice concrete
- **Decides**: proceed, reshape, or drop
- **Hands off** to Create when scope is committed

## When to Load

- Entering Define (Clarity high from Understand, Appetite not yet set)
- Looping back from Create or Validate (Appetite needs reshaping)

## What Define Does NOT Do

- Write code or create design artifacts
- Make scope decisions — it presents options; the user decides
- Push toward larger scope

---

## Core Activities

### 1. Sharpen the Problem Statement

Refine the statement from Understand. Evaluate against user goals, not feature lists. If the real problem differs from the one assumed, acknowledge the shift.

### 2. Set Appetite

This is a STRATEGIC CHOICE, not an estimate. "How much is this problem WORTH?" — not "How long will it TAKE?"

| Uncertainty Level | Solution Pattern | Appetite Range |
|------------------|-----------------|----------------|
| Known problem, known pattern | Copy/adapt existing | Hours |
| Known problem, unknown solution | Explore approaches | Days |
| Uncertain problem, needs exploration | Research + prototype | 1-2 weeks |
| High uncertainty, strategic importance | Shape further first | 4-6 weeks |

Check `docs/project/calibration.md` for historical accuracy data.

### 3. Write the Pitch

The pitch captures:
- **Problem**: Refined from Understand (one sentence)
- **Appetite**: Investment level + rationale
- **Solution sketch**: Just enough direction — NOT a spec. Enough to constrain without over-specifying.
- **Rabbit holes**: What could derail the work
- **No-gos**: What we explicitly will NOT do

A pitch is ready when someone outside the work could read it and know whether to bet on it.

### 4. Generate Scope Variants

Make the appetite choice concrete:
- "Here's the 2-day version" (minimal, core value only)
- "Here's the 1-week version" (core + one key enhancement)
- "Here's the 2-week version" (full exploration + quality)

User chooses which level of investment.

### 5. Decide: Proceed / Reshape / Drop

- **Proceed**: Pitch is sharp enough to commit. Move to Create.
- **Reshape**: Can't be shaped well enough at this appetite. Needs more understanding or different framing.
- **Drop**: Not worth the investment. Good ideas come back.

---

## Output

Write to Canvas Define section:
- Pitch (problem, appetite, solution sketch, rabbit holes, no-gos)
- Scope variants considered (and which was chosen, with rationale)
- Proceed/reshape/drop decision with reasoning

---

## Co-Pilot Behavior

**DO**:
- Draft pitches from Understand exploration (user refines, not writes from scratch)
- Generate scope variants at multiple appetite levels
- Identify rabbit holes from domain knowledge and patterns
- Stress-test no-gos: "You said X is out of scope, but the solution sketch seems to require it"
- Pull calibration data from `docs/project/calibration.md`

**DO NOT**:
- Make scope decisions (strategic judgment, not analytical)
- Push toward larger scope ("we should also...")
- Treat AI-generated scope variants as recommendations
- Skip the proceed/reshape/drop decision

**CRITICAL BOUNDARY**: Scope decisions are strategic, not analytical. The co-pilot can show what different scope levels look like, but choosing how much a problem is worth is a human judgment about values and priorities.

---

## Exit Criteria

Ready to advance to Create when:
- Problem is sharp and specific
- Alternative framings considered (not just the first one)
- Appetite is set with explicit rationale
- Rabbit holes identified, no-gos documented
- Decision is "proceed"
- **Clarity + Exploration lenses**: satisfied

> Define is complete. The pitch is written with [X] appetite.
> Ready to enter Create. Loading `create` skill.

---

## Related

- [Understand](../understand/SKILL.md) — Provides the problem framing that Define sharpens
- [Create](../create/SKILL.md) — Handoff target after Define
- [Documentation](../documentation/SKILL.md) — Canvas management, session protocols
- [Design System](../design-system/SKILL.md) — May inform constraint mapping
- `docs/project/calibration.md` — Appetite calibration data
- `references/DESIGN_MODEL.md` — Detailed lens descriptions and transitions
