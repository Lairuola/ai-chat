# Design Model Reference

Detailed reference for the Design Model v2.0 operating concepts. Loaded on demand when deeper understanding of lenses, transitions, or scale is needed. For the full design model document, see `docs/design-model-v2.0.md`.

---

## The Lenses (Detailed)

Five always-on navigation instruments. They don't prescribe what to do — they reveal what needs attention. Any lens can fire in any phase.

### Clarity — *Is the problem well understood?*

Guards against premature solutioning.

- **Signal**: Cannot articulate what you're solving without referencing the solution. Or prototyping reveals the problem was different than assumed.
- **Response**: Stop. Restate the problem in one sentence — user-focused, solution-agnostic. If it changed, acknowledge the shift and re-evaluate scope.
- **Fires most urgently**: Understand, Define. Most expensive failure: Deliver.
- **Loop-back target**: Understand.

### Exploration — *Have I considered enough alternatives?*

Guards against first-idea fixation.

- **Signal**: Cannot name alternatives considered and why they were rejected. Converged without evaluating other options. AI outputs all look similar.
- **Response**: Deliberately diverge. Generate at least two more options. Different framings, scopes, or solution approaches. AI trends toward sameness without explicit prompting for diversity.
- **Phase applications**: Understand (multiple problem angles), Define (alternative framings), Create (multiple directions, minimum 3), Deliver (scope hammer — could simpler work?).
- **Loop-back target**: Create, or Define for reframing.

### Evidence — *Am I basing decisions on data or assumption?*

Guards against assumption-based decisions.

- **Signal**: Justification is intuition alone. Problem definition based on assumptions. Proceeding to Deliver without real user testing.
- **Response**: Identify what's ASSUMED vs. PROVEN. Test riskiest assumptions first. Negative test: "If we proceed, what could we be wrong about?"
- **Key principle**: Evidence is not certainty. Reversible decisions need less evidence than irreversible ones.
- **Loop-back target**: Validate, or Understand if the problem itself is assumed.

### Appetite — *How much is this problem worth investing?*

Guards against unbounded expansion. A strategic choice, not a prediction.

- **Signal**: Work approaching appetite boundary without convergence. Scope expanding beyond original pitch.
- **Response**: Fixed time, variable scope. If work doesn't fit appetite, cut scope — don't extend time. Circuit breaker: if not converged by boundary, stop, reassess, reshape or drop.
- **Set during**: Define. **Constrains**: Everything downstream.
- **Calibration reference**: `docs/project/calibration.md`
- **Loop-back target**: Define (for reshaping).

### Fidelity — *Am I at the right level of detail for this moment?*

Guards against premature commitment.

- **The ladder**: Words → Sketches → Wireflows → Prototypes → Production
- **Signal**: Working at higher fidelity than the question demands. AI-generated high-fidelity output when low-fidelity would suffice.
- **Response**: Match fidelity to the question being answered. Low fidelity forces clarity. The constraint is the point.
- **Key principle**: AI collapses the fidelity ladder. Resist the temptation. Use the lowest fidelity that answers your current question.
- **Adjusts within current phase** (not a loop-back trigger).

---

## Phase Transitions

Transitions are not automatic. The AI proposes advancement when exit criteria are met. The user confirms.

| Transition | Ready signal |
|------------|-------------|
| Understand → Define | Problem stated in plain language without referencing a solution. Clarity satisfied. |
| Define → Create | Problem sharp, alternative framings considered, appetite set, rabbit holes identified. Clarity + Exploration satisfied. |
| Create → Validate | Something testable exists at appropriate fidelity. 3+ directions explored. Exploration satisfied. |
| Validate → Deliver | Evidence supports direction. Riskiest assumptions tested. Evidence satisfied. |
| Deliver → Cooldown | Work shipped. All lenses satisfied in aggregate. |

**Loop-backs** (lenses fire, AI recommends returning to earlier phase):
- Clarity fires in Create → loop back to Understand
- Exploration fires in Deliver → loop back to Create (simpler approach?)
- Evidence fires in Deliver → loop back to Create or Define

---

## Scale Flexibility

The same model applies at every scale. What changes is depth and duration, not shape.

| Scale | Understand | Define | Create | Validate | Deliver | Cooldown |
|-------|-----------|--------|--------|----------|---------|----------|
| **Micro** (button, interaction) | 30 min review | 15 min scope | 1 day build + test | 1 hour colleague review | Hours polish | 30 min notes |
| **Small** (single feature) | 1-2 days research | 1 day pitch | 1 week prototype + iterate | Days user testing | Days quality + ship | 1 day reflection |
| **Large** (initiative) | Weeks investigation | Days shaping | Weeks building | Weeks testing | Weeks polish + ship | 1-2 weeks reflection |

---

## Co-Pilot Principles

These apply universally across every phase:

1. **Governor**: The co-pilot generates, you decide. Output is always provisional — a suggestion, not a decision. You review, accept, modify, or reject.
2. **Questions over assertions**: The co-pilot's agency is expressed through questions and suggestions, never assertions.
3. **Diverge before converge**: In divergent phases, generate multiple options before evaluating. Flag premature convergence.
4. **Fidelity discipline**: Start at the lowest fidelity that answers the current question. Resist AI's tendency to collapse the ladder.
5. **Real users matter**: AI-simulated research skips the unexpected. Flag when real human observation is needed.
6. **Document as you go**: Decisions, rationale, and rejected alternatives are captured as a natural byproduct of working — not as a separate documentation step.
