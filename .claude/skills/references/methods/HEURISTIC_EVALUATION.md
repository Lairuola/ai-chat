# Heuristic Evaluation

Structured expert review against Nielsen's 10 Usability Heuristics — methodology, severity ratings, and reporting.

---

## What Is a Heuristic Evaluation?

An expert review that identifies usability problems by checking the interface against established principles. Faster than user testing; catches a different class of problems.

```
Strengths:
- Fast (1-2 hours per evaluator)
- Inexpensive (no recruitment)
- Finds obvious problems before user testing
- Produces actionable, prioritized findings

Limitations:
- Experts aren't real users
- Can miss domain-specific issues
- 3-5 evaluators needed for coverage
- Won't reveal why users struggle
```

---

## Nielsen's 10 Usability Heuristics

### 1. Visibility of System Status

> Always keep users informed about what's going on through appropriate feedback within a reasonable time.

```
Good signals:
✓ Loading indicators when fetching data
✓ Progress bars for file uploads
✓ Confirmation messages after actions
✓ Autosave "Saved just now" indicator
✓ Connection status (offline indicator)

Common violations:
✗ No loading state — blank screen appears hung
✗ No feedback after form submission
✗ No indication when background task completes
✗ No error state when action silently fails
```

### 2. Match Between System and Real World

> Speak the users' language. Use words, phrases, and concepts familiar to the user, rather than system-oriented terms.

```
Good signals:
✓ "Trash" not "DELETE_DIR"
✓ "Email address" not "username@domain"
✓ Shopping cart metaphor for e-commerce
✓ Calendar affordance for date selection

Common violations:
✗ HTTP status codes shown to users
✗ Database field names as labels ("user_id")
✗ Internal team jargon in UI
✗ Technical error messages ("null pointer exception")
```

### 3. User Control and Freedom

> Support undo and redo. Provide clearly marked "emergency exits" for users who arrive in unexpected places.

```
Good signals:
✓ Undo for destructive actions
✓ Cancel button on multi-step flows
✓ Back navigation works correctly
✓ "Save draft" before submitting
✓ Close/dismiss on all overlays

Common violations:
✗ No undo for delete (permanent)
✗ Modal with no close button
✗ Form clears on back navigation
✗ Wizard with no "Back" option
✗ Can't cancel in-progress upload
```

### 4. Consistency and Standards

> Users should not have to wonder whether different words, situations, or actions mean the same thing.

```
Internal consistency:
✓ Same component used for same interaction everywhere
✓ Terminology consistent throughout
✓ Visual treatment consistent (primary buttons always blue)

External consistency (platform conventions):
✓ ⌘Z = Undo (don't redefine)
✓ Blue underlined text = link
✓ Gear icon = settings

Common violations:
✗ "Save" on one screen, "Submit" on another for same action
✗ Primary button color varies
✗ Navigation pattern differs between sections
```

### 5. Error Prevention

> Even better than good error messages is careful design that prevents problems from occurring in the first place.

```
Prevention strategies:
✓ Disable submit until required fields complete
✓ Confirm before destructive actions
✓ Format hints before validation ("MM/DD/YYYY")
✓ Smart defaults to guide toward valid input
✓ Constraints that prevent invalid input

Common violations:
✗ Form submits with invalid data, then shows errors
✗ Delete without confirmation
✗ Date field accepts any text (validate late)
✗ No warning when closing unsaved changes
```

### 6. Recognition Rather Than Recall

> Minimize the user's memory load. Objects, actions, and options should be visible. The user should not have to remember information from one screen to another.

```
Good signals:
✓ Recent items in dropdowns
✓ Auto-fill from previous data
✓ Summary shown on review step (not just final step)
✓ Breadcrumbs showing where they came from
✓ Selected filter chips visible

Common violations:
✗ Filter settings not visible — user must remember what's applied
✗ Shopping cart shows item count but not names
✗ Checkout review doesn't show cart contents
✗ Command palette requires memorizing commands
```

### 7. Flexibility and Efficiency of Use

> Allow users to tailor frequent actions. Accelerators — unseen by novice users — may speed up interaction for experts.

```
Good signals:
✓ Keyboard shortcuts for common actions
✓ Bulk operations for power users
✓ Saved searches / presets
✓ API access for automation
✓ Command palette (⌘K)

Common violations:
✗ No keyboard navigation possible
✗ Every action requires multiple clicks (no bulk operations)
✗ No way to save commonly used configurations
```

### 8. Aesthetic and Minimalist Design

> Dialogues should not contain irrelevant or rarely needed information. Every extra unit of information competes with relevant information.

```
Good signals:
✓ Progressive disclosure (advanced options hidden)
✓ Only relevant actions shown in context
✓ White space to reduce cognitive load
✓ Single primary action per screen/dialog

Common violations:
✗ Every possible option shown at once
✗ Long forms when most fields aren't needed
✗ Warning/info alerts that can't be dismissed
✗ Dense tables with 12+ columns
```

### 9. Help Users Recognize, Diagnose, and Recover from Errors

> Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.

```
Good signals:
✓ Plain language error messages
✓ Error points to specific field
✓ Actionable next step provided
✓ Preserves user input on error

Common violations:
✗ "An error occurred" — no specifics
✗ Error on wrong field (e.g., validation on unrelated field)
✗ Form clears after submission error
✗ No recovery path offered
```

### 10. Help and Documentation

> Even though it's better if the system can be used without documentation, it may be necessary to provide help. Such information should be easy to search, focused on the user's task, and list concrete steps.

```
Good signals:
✓ Contextual help (? icon near complex fields)
✓ Onboarding for first-time users
✓ Searchable docs/help center
✓ Inline tooltip for unfamiliar terms
✓ Keyboard shortcut reference (⌘?)

Common violations:
✗ No help for technical error codes
✗ Help link goes to unrelated docs
✗ No onboarding for complex features
✗ Tooltips only, no deeper documentation
```

---

## Severity Rating Scale

Rate each finding to prioritize remediation:

```
0 — Cosmetic: Not a usability problem per se, fix if time
    "Button label could be more descriptive"

1 — Minor: Slightly inconvenient, fix in next release
    "Tooltip appears a fraction too late"

2 — Major: Causes frustration or extra work, fix soon
    "Filter state lost when navigating away and returning"

3 — Serious: Blocks or significantly impairs task completion
    "Submit button inactive state indistinguishable from active"

4 — Catastrophic: Prevents task completion, fix before launch
    "File upload silently fails with no error message"
```

---

## Evaluation Methodology

### Preparation (30 min)

```
1. Define scope: Which flows to evaluate
2. Prepare task scenarios:
   - "Complete a purchase"
   - "Invite a team member"
   - "Export data to CSV"
3. Identify 3-5 evaluators (more = diminishing returns beyond 5)
4. Set up recording if needed
```

### Individual Evaluation (60-90 min per evaluator)

```
1. Walk through each scenario
2. Note every problem encountered
3. Tag each problem with the heuristic it violates
4. Don't rate severity yet (save for aggregation)
5. Note positive findings too (for balance)
```

### Aggregation (30 min)

```
1. Collect findings from all evaluators
2. Remove duplicates
3. Rate severity (all evaluators agree, or average)
4. Sort by severity × frequency
```

---

## Reporting Format

### Executive Summary

```
Evaluation of: [Product/Feature]
Date: [Date]
Evaluators: 3
Findings: 24 (4 catastrophic, 6 serious, 10 major, 4 minor)
```

### Finding Template

```markdown
### F-07: No confirmation before deleting a project

**Heuristic**: #3 User Control and Freedom, #5 Error Prevention
**Severity**: 4 (Catastrophic)
**Location**: Projects list → Delete button
**Frequency**: 3/3 evaluators

**Description**:
Clicking "Delete" immediately deletes the project with no
confirmation dialog. There is no undo.

**Evidence**:
[Screenshot/video]

**Recommendation**:
Add confirmation dialog: "Delete 'Project Name'? This will
permanently delete all data and cannot be undone."
Add 30-second undo window via toast.
```

### Severity/Priority Matrix

```
┌────────────┬──────────────────────────────────────┐
│ Severity   │ Priority                             │
├────────────┼──────────────────────────────────────┤
│ 4 Critical │ Fix before launch                    │
│ 3 Serious  │ Fix in this sprint                   │
│ 2 Major    │ Add to backlog, next 2 sprints        │
│ 1 Minor    │ Backlog, fix when in the area        │
│ 0 Cosmetic │ If time, track as tech debt          │
└────────────┴──────────────────────────────────────┘
```

---

## Checklist

- [ ] 3-5 evaluators recruited
- [ ] Task scenarios prepared before evaluation
- [ ] Each evaluator evaluates independently (no group think)
- [ ] All 10 heuristics checked for each scenario
- [ ] Severity rated after aggregation, not during
- [ ] Report includes specific location + screenshot
- [ ] Recommendations actionable, not just criticism

---

## See Also

- **USABILITY_TESTING.md** — User testing methodology
- **WCAG.md** — Accessibility audit (complements heuristic evaluation)
- **ERROR_HANDLING.md** — H9: Error recognition and recovery
- **CONTENT_MICROCOPY.md** — H9: Error message writing
