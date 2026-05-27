---
name: understand
description: "Problem discovery and investigation. Observes user goals, maps assumptions, investigates from multiple perspectives, and frames the real problem. Use when user says 'explore this problem', 'what are we solving', 'who is this for', 'frame the problem', 'what are the assumptions', or needs to investigate a design challenge before committing to scope. Does not write code or create design artifacts."
---

# Understand

*Primarily divergent. The stated problem is rarely the actual problem.*

The most expensive rework comes from building the right solution to the wrong problem. Sit with the problem before reaching for solutions.

## Purpose

- **Discovers** the real problem through observation, research, and multi-perspective investigation
- **Frames** the problem in one sentence — user-focused, solution-agnostic
- **Maps** assumptions, constraints, and user goals
- **Hands off** to Define when the problem is clear

## When to Load

- Entering Understand (Clarity is low, problem not yet articulated)
- Looping back from Create or Validate (Clarity fired, problem shifted)

## What Understand Does NOT Do

- Write code or create design artifacts
- Skip to solutions — Understand sits with the problem
- Make scope decisions (that's Define)

---

## Core Activities

### 1. Observation Over Assumption

Map user **goals**, not tasks. Goals are stable end-conditions that endure; tasks are transient steps that change with tools and context. "Feel confident my finances are healthy" is a goal. "Check my bank balance" is a task.

Discover the mental models users bring — from other products, platform conventions, and real-world experience. The product must communicate through these models, not against them.

### 2. Multi-Perspective Investigation

Investigate from at least these perspectives:

- **User perspective**: What are they trying to accomplish? What frustrates them? What mental models do they bring?
- **Business perspective**: What are the constraints? What does success look like for the business? What's the cost of not solving this?
- **Technical perspective**: What's feasible? What's the existing architecture? What constraints does it impose?

### 3. Assumption Inventory

List everything believed about the problem. For each assumption:

| # | Assumption | Status | Evidence | Risk |
|---|-----------|--------|----------|------|
| 1 | Users drop off at step 3 | OBSERVED | Analytics: 62% drop-off | High |
| 2 | Users expect wizard-style flow | ASSUMED | None yet | High |

- **OBSERVED**: Evidence exists (data, research, user quotes)
- **ASSUMED**: No evidence yet — belief or intuition
- Flag riskiest assumptions: those that, if wrong, invalidate everything

### 4. Constraint Mapping

Constraints are not obstacles — they are the shape of the solution space.

- Technical: platform, stack, performance, existing code
- Business: timeline, resources, regulatory, brand
- Design: existing design system, accessibility requirements, device targets

### 5. Research

- Check `docs/research/INDEX.md` for prior work on this domain
- Check `docs/project/users.md` for accumulated user knowledge
- For deeper research needs, invoke Research skill:
  > "This needs dedicated research. Loading `research` skill for [topic]."
- Lightweight research (quick web searches, checking references) can happen inline

---

## Output

Write to Canvas Understand section:
- Problem statement (one sentence, user-focused, solution-agnostic)
- Assumption inventory (OBSERVED vs. ASSUMED marked)
- Constraint map
- Perspectives investigated
- Research findings (inline summary + pointers to research artifacts)
- Mental model notes (if applicable)

---

## Co-Pilot Behavior

**DO**:
- Synthesize existing knowledge from previous cycles and research library
- Generate alternative problem framings (same situation from different perspectives)
- Draft problem statements from messy, ambiguous input (user refines)
- Ask probing questions: "Who else is affected?" "What happens if we do nothing?"
- Bring in relevant prior work from `docs/project/` and `docs/research/`

**DO NOT**:
- Treat AI synthesis as sufficient evidence for real user behavior
- Skip to solutions ("here's what we could build")
- Present AI-simulated user perspectives as real evidence
- Narrow too quickly — this phase is divergent

**CRITICAL BOUNDARY**: AI synthesis risks masking gaps. Flag when real human observation is needed rather than treating AI output as sufficient evidence. Say: "This is my synthesis, but real user observation would validate [specific assumption]."

---

## Exit Criteria

Ready to advance to Define when:
- Can state the problem, the user, and the goal in plain language WITHOUT referencing a solution
- Assumption inventory exists (observed vs. assumed marked)
- At least 2 perspectives investigated
- **Clarity lens**: satisfied

> Understand is complete. Problem framed. Ready to enter Define.
> Loading `define` skill.

---

## Related

- [Define](../define/SKILL.md) — Handoff target after Understand
- [Research](../research/SKILL.md) — For deep research needs during Understand
- [Documentation](../documentation/SKILL.md) — Canvas management, session protocols
- [Design System](../design-system/SKILL.md) — May inform constraint mapping
- `docs/project/users.md` — Accumulated user knowledge
- `references/DESIGN_MODEL.md` — Detailed lens descriptions and transitions
- `references/patterns/USER_JOURNEYS.md` — For flow mapping during Understand
- `references/patterns/INFORMATION_ARCHITECTURE.md` — For IA constraint mapping
