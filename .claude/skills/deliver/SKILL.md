---
name: deliver
description: "Quality, scope hammering, and shipping to production. Runs completeness checklists, cuts scope to fit appetite, extracts design system patterns, and enforces the circuit breaker. Use when user says 'ship it', 'quality check', 'scope hammer', 'what can we cut', 'is this ready', 'final review', or has validated work that needs to reach production."
---

# Deliver

*Primarily convergent. Where work meets reality.*

"Almost done" is the most dangerous state. A feature that's 90% complete but not shipped delivers zero value. The danger is dual: shipping a happy-path-only version that breaks for real users, or endlessly adding scope when you should be converging.

## Purpose

- **Scope hammers** to fit the appetite — simpler and focused beats complex and incomplete
- **Runs quality pass** — functional completeness, accessibility, responsive, performance
- **Extracts** design system patterns from completed work
- **Enforces** the circuit breaker when appetite is exceeded
- **Ships** to production — done means deployed

## When to Load

- Entering Deliver (evidence supports direction from Validate)
- After scope hammer decision (reshaping what to ship)

---

## Core Activities

### 1. Scope Hammer

"What is the SMALLEST version that would be genuinely valuable?"

- Cut non-essential work to fit appetite
- Reference Define pitch for no-gos and appetite boundary
- Simpler and focused beats complex and incomplete

### 2. Quality Pass

Run through systematically:

**Functional completeness**:
- [ ] Happy path works end-to-end
- [ ] Error states handled (network, validation, permission, server)
- [ ] Loading states present (skeleton, spinner, progress)
- [ ] Empty states designed (first use, no results, cleared)
- [ ] Edge cases covered (overflow, special characters, concurrent actions)

**Accessibility (WCAG 2.1 AA)**:
- [ ] Keyboard: all functionality accessible, logical focus order, no traps
- [ ] Focus: visible indicators on all interactive elements
- [ ] Contrast: 4.5:1 text, 3:1 large text and UI elements
- [ ] Touch targets: 44x44px minimum
- [ ] Screen reader: landmarks, heading hierarchy, form labels, live regions
- [ ] Reduced motion: respects `prefers-reduced-motion`

**Responsive**:
- [ ] Mobile (320px-767px)
- [ ] Tablet (768px-1023px)
- [ ] Desktop (1024px+)

**Performance**:
- [ ] Core Web Vitals within budget (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] Images optimized (lazy load below fold, correct format)
- [ ] Code split appropriately

### 3. Design System Updates

Before shipping, extract patterns for the design system:
- Any new tokens used? Flag for `docs/design-system/tokens.md`
- Any new component patterns? Flag for `docs/design-system/patterns.md`
- Any hardcoded values that should be tokens? Fix them.

See the `design-system` skill for extraction protocol.

### 4. Circuit Breaker

If appetite is exceeded:
1. **Stop.** Don't extend indefinitely.
2. **Assess**: What can ship within remaining appetite?
3. **Options**:
   - Ship reduced scope (scope hammer)
   - Cancel and reshape for future cycle
   - Explicitly extend appetite (user decision, not AI recommendation)
4. Record the decision in Canvas decisions log.

### 5. Ship

"Done means deployed." Not merged, not staged — deployed where real users encounter it.

---

## Output

Write to Canvas Deliver section:
- What shipped
- What was descoped (and why)
- Quality pass results
- Design system updates (patterns flagged or extracted)

---

## Co-Pilot Behavior

**DO**:
- Run completeness assessment systematically (the checklists above)
- Suggest scope cuts when appetite is running out: "Dropping [X] would let you ship today."
- Hold the line on completeness: "Error states aren't designed yet — address or descope?"
- Track appetite and flag circuit breaker when approaching boundary

**DO NOT**:
- Let review fatigue cause rubber-stamping
- Ship without the quality pass (even under time pressure)
- Add scope ("while we're here, we should also...")
- Extend appetite without explicit user decision

**CRITICAL BOUNDARY**: Review fatigue is real — humans rubber-stamp AI output when auditing takes longer than the time saved. Budget explicit review time. Check error states, accessibility, and edge cases yourself. The co-pilot handles the checklist; you verify the judgment calls.

---

## Exit Criteria

Ready to advance to Cooldown when:
- Work is deployed to production
- All five lenses satisfied in aggregate:
  - Clarity: shipped problem matches understood problem
  - Exploration: chosen direction was deliberate
  - Evidence: direction was validated
  - Appetite: within boundary (or explicit extension)
  - Fidelity: production quality

> Work shipped. All lenses satisfied. Ready for Cooldown.
> Loading `documentation` skill for reflection.

---

## Anti-Patterns

- **Skipping the quality pass** under time pressure
- **Adding scope during Deliver** — the scope hammer cuts, doesn't add
- **Confusing "it works" with "it's validated"** — working software is not evidence of behavior change
- **Ignoring accessibility until Deliver** — build it in from the start
- **Extending appetite without decision** — the circuit breaker is a discipline

---

## Related

- [Validate](../validate/SKILL.md) — Provides the evidence that justifies shipping
- [Create](../create/SKILL.md) — Loop target if Exploration lens fires (simpler approach?)
- [Define](../define/SKILL.md) — Loop target if circuit breaker triggers reshaping
- [Design System](../design-system/SKILL.md) — Pattern extraction during Deliver
- [Documentation](../documentation/SKILL.md) — Handoff target for Cooldown
- `references/implementation/WCAG.md` — Full accessibility checklist
- `references/implementation/ENGINEERING.md` — Architecture, code quality standards
- `references/implementation/PERFORMANCE.md` — Core Web Vitals, images, JS bundles
- `references/implementation/TESTING.md` — Testing patterns
