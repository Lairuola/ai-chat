# Content & Microcopy

Voice, tone, and writing patterns for UI copy — buttons, headings, errors, empty states, and more.

---

## Voice & Tone Principles

```
Voice (consistent):        Tone (context-dependent):
- Clear                    - Casual in onboarding
- Direct                   - Formal in billing
- Helpful                  - Reassuring in errors
- Human                    - Concise in dense UIs

Never:
- Condescending ("Simply click the button...")
- Jargon without context
- Passive voice for errors ("An error has occurred")
- ALL CAPS for emphasis
```

---

## Button Labels

### Verb + Noun Pattern

```
Bad (vague):           Good (specific):
Submit                 Save changes
OK                     Confirm deletion
Yes                    Delete project
Continue               Next: Billing
Cancel                 Discard changes
```

### Context-Specific Labels

```
Creating:      Create project, Add member, Upload file
Saving:        Save, Save draft, Save and continue
Deleting:      Delete, Remove, Archive
Confirming:    Confirm, Yes, proceed, I understand
Cancelling:    Cancel, Discard, Keep editing, Go back
Navigating:    Next, Back, Skip, View details
Loading:       Saving…, Creating…, Deleting… (ing form while loading)
```

### Destructive Action Labels

```
Always describe what will be destroyed:
"Delete project" not "Delete"
"Remove member" not "Remove"
"Cancel subscription" not "Cancel"

Confirmation dialog labels:
Title: "Delete 'My Project'?"
Body:  "This will permanently delete the project and all its data.
        This cannot be undone."
Cancel: "Keep project"   ← describes what it preserves
Confirm: "Delete project" ← repeats the destructive action
```

---

## Headings

### Hierarchy

```
Page title:     One per page, describes the destination
Section title:  Groups related content
Subsection:     Further narrows a section
```

### Writing Style

```
Page titles (nouns):
✓ Settings
✓ Team members
✓ Invoice #1042

Action page titles (verb + noun):
✓ Create project
✓ Invite team member
✓ Edit profile

Avoid question marks in headings:
✗ "Are you sure you want to delete?"
✓ "Delete 'My Project'?" (acceptable in dialogs only)
```

---

## Empty State Copy

### Structure

```
1. Headline    — What's missing (not "No data found")
2. Explanation — Why it's empty + what it's for
3. Call to action — Primary action to fill it

Examples:

No projects yet
Projects let you organize work and collaborate with your team.
[Create your first project]

No results for "invoice 2023"
Try a different search term, or [Clear filters] to see everything.
```

### Empty State Types

```
First time (no data ever created):
- Lead with the value proposition
- Show what it will look like when used
- Strong, encouraging CTA

No results (search/filter):
- Echo the search term
- Suggest alternatives
- Offer to clear filters

Permissions (can't see data):
- Explain what's here and who can see it
- Offer to request access if applicable

Error (failed to load):
- Don't say "empty" — explain the error
- Offer retry
```

---

## Error Messages

### Structure

```
1. What went wrong     (specific, not technical)
2. Why it happened     (if helpful/actionable)
3. How to fix it       (always include)

Format:
Bad:  "Error 422"
Bad:  "Something went wrong"
Good: "We couldn't save your changes. Check your connection and try again."
Good: "This email is already in use. Sign in or use a different email address."
```

### Common Error Patterns

```
Network/server:
"We couldn't connect. Check your internet connection and try again."
"Something went wrong on our end. Please try again in a few minutes."

Validation:
"Enter a valid email address (e.g., name@company.com)"
"Password must be at least 8 characters"

Permissions:
"You don't have permission to view this. Contact your admin to request access."

Not found:
"We couldn't find that page. It may have been moved or deleted."
"This invitation has expired. Ask your team to send a new one."
```

---

## Confirmation Dialogs

### Title + Body + Actions Pattern

```
Confirm deletion:
┌─────────────────────────────────────────┐
│ Delete 'Q4 Campaign'?                   │
│                                         │
│ This will permanently delete the project│
│ and all its assets. This can't be undone│
│                                         │
│ [Keep project]      [Delete project]    │
└─────────────────────────────────────────┘

Rules:
- Title names what will be affected
- Body states consequences clearly
- Secondary button preserves the thing
- Primary (destructive) button repeats the action
- No "Are you sure?" — it's implied
```

---

## Tooltip Copy

```
Rules:
- Brief (< 10 words ideally)
- Add context, don't repeat the label
- No critical info (inaccessible to screen readers by default)
- Don't end with period

Bad:  "Click here to export your data to a file."
Good: "Export as CSV or PDF"

Bad:  "This is the settings button."
Good: "Keyboard shortcut: ⌘,"
```

---

## Loading Messages

Context-specific messages outperform generic ones:

```
Generic (bad):
"Loading..."
"Please wait..."

Context-specific (good):
"Loading your projects..."
"Saving changes..."
"Sending invitation..."
"Processing payment..."
"Generating export..."
"Analyzing your data..."
```

---

## Placeholder Text

```
Rules:
- NEVER use placeholder as the only label
- Use as an example or hint, not a description
- End search placeholders with ellipsis: "Search…"
- Use realistic examples

Good examples by field type:
Name:       "Jane Smith"
Email:      "name@company.com"
Phone:      "+1 (555) 123-4567"
API key:    "sk-1234…"
Search:     "Search projects…"
URL:        "https://example.com"
Amount:     "0.00"
```

---

## Writing for Scannability

```
Front-load key information:
Bad:  "In order to proceed, you will need to verify your email address."
Good: "Verify your email to continue."

Keep sentences short:
Bad:  "Due to the fact that your session has expired, you will be required to
       sign in again to access your account."
Good: "Your session expired. Sign in again."

Use second person (you/your):
Bad:  "Users can export data from the settings page."
Good: "You can export your data from Settings."
```

---

## Numbers and Data Formatting

```
Large numbers:
1000 → 1,000
1000000 → 1,000,000 (or 1M in compact form)

Percentages:
Whole numbers when possible: 42% (not 42.0%)
One decimal when needed: 42.5%

Currency:
$1,234.56 (with currency symbol)
$1.2K, $1.2M (compact for dashboards)

Dates:
Jan 15, 2024 (unambiguous)
2024-01-15 (ISO, for technical contexts)
"3 days ago" (relative, for recent items)
"in 2 hours" (relative, for upcoming)

File sizes:
12 KB, 3.4 MB, 1.2 GB (always one decimal for MB/GB)
```

---

## Truncation & Overflow

```
Rules:
- Truncate at natural word boundaries
- Always show full content on hover (tooltip) or expand
- Indicate truncation with ellipsis (…)
- Never truncate numbers, prices, or dates

CSS:
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Multi-line truncation */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

Patterns:
"Very Long Project Name…" → [Full name in tooltip]
"Jane S." → Never truncate full names mid-word
```

---

## Checklist

- [ ] Button labels use verb + noun pattern
- [ ] Destructive dialogs name the thing being destroyed
- [ ] Error messages explain what happened + how to fix
- [ ] Empty states have headline + explanation + CTA
- [ ] Loading messages are context-specific
- [ ] Placeholder text is never the only label
- [ ] Numbers follow consistent formatting conventions
- [ ] Truncation shows full content on hover

---

## See Also

- **FORMS.md** — Form error messages and validation copy
- **DATA_DISPLAY.md** — Empty state and loading state design
- **COMPONENT_BEHAVIOR.md** — Confirmation patterns (AlertDialog vs Toast)
- **ERROR_HANDLING.md** — Error message mapping
