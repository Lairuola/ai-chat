# Usability Testing

Planning, running, and analyzing usability tests — from test plan to prioritized recommendations.

---

## Test Types

```
Moderated vs Unmoderated:
- Moderated:   Facilitator present, can probe and redirect
                Use for: Complex tasks, new concepts, formative testing
- Unmoderated: Participant works alone (tools: Maze, UserTesting)
                Use for: Validation, quick iterations, remote testing

Remote vs In-person:
- Remote:      More participants, faster, lower cost
               Drawback: Harder to observe context, technical issues
- In-person:   Richer observation, can see body language and context
               Use for: Physical products, complex workflows

Formative vs Summative:
- Formative:   Find problems during design (qualitative, iterative)
               "What's confusing? Where do people get stuck?"
- Summative:   Measure performance against standards (quantitative)
               "What % complete the task? How long does it take?"
```

---

## Test Plan Template

```markdown
## Usability Test Plan: [Feature/Product]

**Objective**
What decisions will this test inform?
"Determine whether users can complete onboarding without support"

**Research Questions**
1. Can users [task 1] without errors?
2. Do users understand [concept]?
3. Where does the checkout flow cause confusion?

**Participants**
- Target: [user type, e.g., "first-time users, non-technical"]
- Number: 5-8 (diminishing returns beyond 8 for qualitative)
- Screener criteria: [what makes someone qualified/disqualified]

**Tasks**
1. [Task scenario]
2. [Task scenario]
3. [Task scenario]

**Metrics**
- Task success rate
- Time on task
- Error rate
- Satisfaction (SUS score or post-task rating)

**Schedule**
- Sessions: 45-60 minutes each
- Buffer: 15 minutes between sessions for notes
```

---

## Writing Good Tasks

### Scenario-Based Tasks

```
Bad (leading, describes the UI):
"Click the Settings icon and change your notification preferences"

Bad (too vague):
"Use the app as you normally would"

Good (scenario-based, realistic):
"You want to stop receiving daily digest emails. Please do that."

Good (outcome-focused):
"You've decided to invite your colleague Sarah (sarah@example.com)
to collaborate on your current project. Please go ahead."
```

### Task Writing Rules

```
1. Realistic scenario:  Give them a character/context to inhabit
2. Clear success:       Evaluator can tell when task is complete
3. No leading:         Don't name UI elements ("click Settings")
4. Appropriate scope:  One task per scenario (not compound)
5. Ordered by flow:    Complete tasks in logical order
```

### Success Criteria

```
Define before testing (not retroactively):
✓ "Participant successfully adds item to cart and reaches checkout"
✓ "Participant changes email preference within 3 minutes"

Not:
✗ "Participant understands the feature" (unmeasurable)
✗ "Participant doesn't struggle" (too vague)
```

---

## Participant Recruitment

### How Many

```
Qualitative (finding problems):
- 5-8 participants finds ~85% of usability issues
- Run in rounds of 5, fix, retest
- Don't test with 20 before making changes

Quantitative (measuring performance):
- 20+ for meaningful statistics
- More for subgroup analysis
```

### Screener Criteria

```
Include criteria for:
- Experience level with product/domain
- Frequency of use of similar products
- Technical comfort level
- Relevant role/job type

Exclude:
- People who work for your company
- People who have seen the product before
- Anyone with conflict of interest
```

---

## Facilitation Techniques

### Think-Aloud Protocol

```
Instructions to participant:
"As you work through these tasks, please say out loud what
you're thinking, what you're looking for, and any reactions
you have — even if it seems obvious or trivial to you."

Encourage with neutral prompts:
- "What are you thinking right now?"
- "What do you expect to happen?"
- "What are you looking for?"
```

### Neutral Probing

```
Good (neutral):             Bad (leading):
"Tell me more about that"   "Did you find that confusing?"
"What would you expect?"    "You'd expect a button here, right?"
"What did you see?"         "Did you notice the button?"
"How did that feel?"        "Was that frustrating?"
```

### Managing Silence

```
Rule: Wait 15-20 seconds before intervening
Silence often means thinking — not being stuck

Intervene when:
- Participant has clearly abandoned the task
- They ask directly for help ("Can you tell me?")
- They're in obvious distress

If they ask for help:
"I want to see how you'd figure it out on your own.
What would you try next?"
```

---

## Observation and Note-Taking

### Structured Note Format

```
[Time] [Task] [Observation] [Quote] [Severity]

Example:
2:14  T2  Clicked "Settings" instead of "Preferences"  "I expected it to be in settings"  S2
2:45  T2  Couldn't find notification toggle  "Where is it? Is it in here?"  S3
3:02  T2  TASK FAIL - gave up after 3:00  -  S3
```

### What to Record

```
Behaviors:        Where they click, where they hesitate, where they go wrong
Quotes:           Verbatim when possible (captures exact language)
Emotions:         Confusion, frustration, delight, surprise
Success/Failure:  Did they complete the task? How?
Time:             Timestamps for calculating time-on-task
```

---

## Metrics

### Task Success Rate

```
Complete = reached defined success criteria
Partial  = reached goal via workaround or with significant effort
Failure  = gave up or reached incorrect outcome

Report as: X% complete, Y% partial, Z% fail
```

### System Usability Scale (SUS)

10-question satisfaction survey after testing:

```
Scored 1-5 (strongly disagree → strongly agree):
1. I think I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think I would need support from a technical person to use this.
5. I found the various functions well integrated.
6. I thought there was too much inconsistency in this system.
7. I imagine most people would learn to use this very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using the system.
10. I needed to learn a lot of things before I could get going.

Scoring:
- Odd questions (1,3,5,7,9): score - 1
- Even questions (2,4,6,8,10): 5 - score
- Sum × 2.5 = SUS score (0-100)

SUS benchmarks:
> 85: Excellent
70-85: Good
51-70: Marginal
< 51: Poor
```

---

## Analysis

### Affinity Mapping

```
After sessions:
1. Write each observation on a separate note
2. Group by theme (silently)
3. Label clusters
4. Identify most common/severe themes

Tools: FigJam, Miro, physical sticky notes
```

### Severity Prioritization

```
Frequency × Severity matrix:

         Low freq     High freq
Severe │  Fix next   │  Fix now  │
       ├─────────────┼───────────┤
Minor  │  Backlog    │  Fix soon │

Factors:
- How many participants encountered it?
- How severe was the impact?
- Does it affect first-time or returning users?
```

---

## Quick Testing Methods

### 5-Second Test
Show design for 5 seconds, then ask: "What do you remember? What's the page about?"
Use for: Landing pages, dashboards, visual hierarchy

### First-Click Test
One click — "Where would you click to do X?" — no navigation.
Use for: Navigation labels, CTA placement, page scannability

### Tree Test
Text-only navigation — "Where would you find X?"
Use for: Information architecture, navigation labels

---

## Report Format

```markdown
## Usability Test Report: [Feature]

**Date:** [Date]
**Participants:** 6 (5 first-time users, 1 returning)
**Method:** Moderated remote, think-aloud
**SUS Score:** 67 (Marginal — below target of 75)

## Key Findings

### F1 — Users couldn't find the invite feature  [Severity: 3]
4 of 6 participants looked in Settings → Team, not in the sidebar.
"I'd expect inviting people to be in the settings somewhere."
**Recommendation:** Add "Invite members" to sidebar nav, not just settings.

### F2 — Confirmation email delay caused abandonment  [Severity: 2]
3 participants assumed signup failed when email didn't arrive instantly.
"Did it not work? I'm not getting anything."
**Recommendation:** Show in-app message: "Check your inbox — we just sent
a confirmation to [email]."

## Summary of Recommendations

| Priority | Finding | Action |
|----------|---------|--------|
| Fix now  | F1 - Invite location | Move to sidebar |
| Fix soon | F2 - Email delay UX | Add in-app message |
```

---

## Checklist

- [ ] Test plan written before recruiting
- [ ] Tasks scenario-based, not UI-describing
- [ ] Success criteria defined before testing
- [ ] 5+ participants recruited per round
- [ ] Think-aloud protocol explained at start
- [ ] Neutral facilitation (no leading)
- [ ] Notes structured with time/task/observation
- [ ] SUS survey given after all tasks
- [ ] Report includes verbatim quotes as evidence
- [ ] Recommendations actionable and specific

---

## See Also

- **HEURISTIC_EVALUATION.md** — Expert review without users
- **WCAG.md** — Accessibility audit methods
- **USER_JOURNEYS.md** — Flow documentation to inform test tasks
- **INFORMATION_ARCHITECTURE.md** — Tree testing for IA validation
