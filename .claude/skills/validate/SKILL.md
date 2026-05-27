---
name: validate
description: "Testing and evidence gathering. Runs heuristic evaluations, accessibility audits, tracks assumptions against evidence, and facilitates user testing. Use when user says 'test this', 'validate', 'check assumptions', 'heuristic review', 'accessibility audit', 'does this work', or has something testable that needs evaluation before shipping."
---

# Validate

*Primarily evaluative. Assumptions feel like knowledge until tested.*

Every designer has shipped something they were certain about — and watched real users struggle with it. The most common iteration cycle is Create-Validate-Create. Making this explicit gives it the space and methods it deserves.

## Purpose

- **Tests** with real users and systematic evaluation methods
- **Tracks** assumptions from Understand through to evidence
- **Assesses** progress with hill charts (uphill = uncertainty, downhill = execution)
- **Decides** direction explicitly: iterate, pivot, or proceed

## When to Load

- Entering Validate (something testable exists from Create)
- Looping within the Create-Validate cycle

---

## Core Activities

### 1. Test with Real Users

There is no substitute for watching someone interact with what you've built.

| Question to answer | Method |
|-------------------|--------|
| Does the flow make sense? | Usability walkthrough |
| Which direction works better? | A/B or preference test |
| Are there usability issues? | Think-aloud task testing |
| Does the concept resonate? | Concept test / interview |

**User testing structure** (when conducting):
1. Welcome + consent (3 min)
2. Context questions (5 min)
3. Tasks with think-aloud (20 min)
4. Follow-up questions (10 min)
5. Wrap-up (2 min)

### 2. Systematic Evaluation

When real user testing isn't feasible or as a complement to it:

**Heuristic evaluation** — Check against established principles:
- Visibility of system status
- Match between system and real world
- User control and freedom
- Consistency and standards
- Error prevention
- Recognition over recall
- Flexibility and efficiency
- Aesthetic and minimalist design
- Help users recognize, diagnose, recover from errors
- Help and documentation

**Accessibility audit** (proportional to fidelity):
- Keyboard navigation: all functionality accessible
- Focus indicators: visible on all interactive elements
- Color contrast: 4.5:1 text, 3:1 large text and UI
- Touch targets: 44x44px minimum
- Screen reader: landmarks, headings, labels
- See `references/implementation/WCAG.md` for full checklist

**Edge case identification**:
- Empty states (first use, no results, cleared data)
- Error states (network, validation, permission, server)
- Loading states (skeleton, spinner, progress)
- Overflow (long text, many items, deep nesting)
- Permissions (unauthorized, expired, revoked)

### 3. Assumption Tracking

Pull assumption inventory from Canvas Understand section. Update status:

| # | Assumption | Previous | Updated | Evidence |
|---|-----------|----------|---------|----------|
| 1 | Users drop off because... | OBSERVED | CONFIRMED | 4/5 test users... |
| 2 | Users expect wizard flow | ASSUMED | CHALLENGED | 3/5 preferred... |

Test the **riskiest assumptions first** — the ones that, if wrong, invalidate the direction.

### 4. Hill Chart Assessment

For each scope within the feature:

| Scope | Position | Note |
|-------|----------|------|
| Main flow | Downhill 80% | Structure solved, details remain |
| Settings grouping | Uphill 40% | Still figuring out the taxonomy |

- **Uphill**: Still figuring out — needs new information, not more hours
- **Downhill**: Executing — needs effort, not insight

Scopes stuck uphill signal genuine uncertainty.

### 5. Direction Decision

This must be explicit — not implied, not skipped:

- **Iterate**: Back to Create with specific learning. "The [X] didn't work because [Y]. Try [Z] instead."
- **Pivot**: Back to Define or Understand with new information. "The problem is different than we thought."
- **Proceed**: Forward to Deliver with evidence. "Evidence supports this direction."

---

## Output

Write to Canvas Validate section:
- Test results (method, findings)
- Assumption status updates
- Hill chart (if applicable)
- Surprises (what testing revealed that thinking couldn't)
- **Direction decision**: iterate / pivot / proceed + specific rationale

---

## Co-Pilot Behavior

**DO**:
- Run systematic quality checks (accessibility, heuristics, edge cases)
- Track assumption status across phases
- Structure test plans (what to test, how, in what order)
- Synthesize findings into actionable direction
- Clearly distinguish synthetic evaluation from real user evidence

**DO NOT**:
- Treat AI heuristic checks as replacement for user testing
- Declare "validated" without real user evidence for key assumptions
- Skip the direction decision (iterate/pivot/proceed MUST be explicit)
- Confuse "it works" with "it changes behavior"

**CRITICAL BOUNDARY**: Real user observation is irreplaceable. AI-simulated research skips the unexpected. Flag when synthetic evaluation is insufficient and real human testing is needed.

---

## Exit Criteria

Ready to advance to Deliver when:
- Evidence supports the direction
- Riskiest assumptions tested
- Direction decision is "proceed"
- **Evidence lens**: satisfied

> Validate complete. Evidence supports proceeding. Loading `deliver` skill.

---

## Related

- [Create](../create/SKILL.md) — Loop target for "iterate" decision
- [Understand](../understand/SKILL.md) — Loop target for "pivot" when problem shifted
- [Define](../define/SKILL.md) — Loop target for "pivot" when scope needs reshaping
- [Deliver](../deliver/SKILL.md) — Handoff target for "proceed" decision
- [Documentation](../documentation/SKILL.md) — Canvas management, session protocols
- `references/implementation/WCAG.md` — Full accessibility checklist
- `references/methods/HEURISTIC_EVALUATION.md` — Nielsen's 10 heuristics with severity ratings
- `references/methods/USABILITY_TESTING.md` — Test planning, facilitation, analysis
- `references/DESIGN_MODEL.md` — Detailed lens descriptions and transitions
