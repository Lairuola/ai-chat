# Component Behavior Rules

Behavioral requirements for UI components — loading states, input handling, ARIA patterns, and interaction rules.

For visual specs (variants, sizes, states), see `COMPONENTS.md`.

---

## Button Behavior

### Loading State
```
MUST:
- Show loading indicator AND keep original label visible
- Disable button during in-flight request
- Include idempotency key for form submissions

Example:
[Save]  →  [◌ Save]  (not just [◌])
```

### Submission Rules
```
MUST:
- Keep submit button enabled until submission starts
- Don't pre-disable submit — allow clicking to surface validation errors
- On destructive actions: require confirmation OR provide Undo

Form submission:
1. User clicks submit
2. Validation runs (show errors if any)
3. If valid: disable button, show spinner, send request
4. On success: show confirmation or redirect
5. On error: re-enable button, show error message
```

### Destructive Actions
```
MUST use AlertDialog for:
- Delete operations
- Irreversible changes
- Data loss scenarios

Alternative: Provide Undo with safe window (5-10 seconds)
```

---

## Input Behavior

### NEVER
- Block paste in `<input>` or `<textarea>` — ever
- Block typing even for number-only fields — show validation instead
- Use `type="number"` for most numeric input — use `inputmode="numeric"` instead

### MUST
- Trim whitespace from pasted values (input methods may add trailing space)
- Set appropriate `autocomplete` and `name` for autofill support
- Disable spellcheck for: emails, codes, usernames, URLs, API keys

```html
<!-- ✅ Good patterns -->
<input type="email" autocomplete="email" spellcheck="false" />
<input type="text" inputmode="numeric" pattern="[0-9]*" />
<input type="text" name="api_key" autocomplete="off" spellcheck="false" />
```

### Mobile Considerations
```css
/* Prevent iOS Safari auto-zoom on focus */
input, textarea, select {
  font-size: 16px; /* Minimum */
}

/* Prevent double-tap zoom on controls */
button, [role="button"] {
  touch-action: manipulation;
}
```

### Password Fields
```
MUST:
- Ensure password manager compatibility
- Allow pasting one-time codes
- Don't trigger password managers for non-auth fields

For OTP fields:
<input type="text" autocomplete="one-time-code" inputmode="numeric" />
```

---

## Select Behavior

### Windows Dark Mode Fix
```css
/* Windows has contrast bugs with native select in dark mode */
select {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

---

## Links vs Buttons

### Rule
```
Navigation → <a> or <Link>
Action → <button>
```

### MUST for Navigation
- Use `<a>` or framework's `<Link>` component
- Never substitute with `<button>` or `<div onClick>`
- Standard browser behaviors must work:
  - Cmd/Ctrl+Click → new tab
  - Middle-click → new tab
  - Right-click → context menu with "Open in new tab"

```jsx
// ❌ Bad - breaks browser conventions
<div onClick={() => navigate('/dashboard')}>Dashboard</div>
<button onClick={() => navigate('/settings')}>Settings</button>

// ✅ Good - proper navigation
<Link href="/dashboard">Dashboard</Link>
<a href="/settings">Settings</a>
```

---

## Empty States

### Requirements
```
MUST:
- Give one clear next action (CTA button)
- Explain why empty and what user can do
- Use appropriate illustration/icon

Structure:
┌─────────────────────────────────────┐
│                                     │
│          [Illustration]             │
│                                     │
│      No projects yet               │
│                                     │
│  Create your first project to      │
│  get started with deployment.      │
│                                     │
│       [Create Project]              │
│                                     │
└─────────────────────────────────────┘
```

---

## Error Display

### Placement
```
MUST show errors next to where the action happens:
- Form field errors: below the field
- Form submission errors: above or below the form
- Action errors: near the trigger (button, link)

On form submit with errors:
1. Focus first error field
2. Scroll to error if needed
3. Announce error for screen readers (aria-live)
```

### Error Message Content
```
❌ "Invalid API key"
✅ "Your API key is incorrect or expired. Generate a new key in your account settings."

MUST:
- State what's wrong
- Tell how to fix it
- Provide action when possible (link, button)
```

---

## Confirmation Patterns

### When to Use
```
AlertDialog (blocking confirmation):
- Deleting data
- Canceling subscription
- Leaving page with unsaved changes
- Any irreversible action

Toast with Undo (non-blocking):
- Archiving items
- Moving to trash
- Removing from list
- Reversible actions
```

### Alert Dialog Structure
```
┌─────────────────────────────────────┐
│ Delete project?                     │
├─────────────────────────────────────┤
│ This will permanently delete        │
│ "My Project" and all its data.      │
│ This action cannot be undone.       │
├─────────────────────────────────────┤
│              [Cancel] [Delete]      │
└─────────────────────────────────────┘

- Destructive action button on right
- Destructive button uses danger/red variant
- Cancel is always an option
```

---

## Async Update Announcements

### ARIA Live Regions
```html
<!-- For toast notifications -->
<div role="status" aria-live="polite">
  Changes saved successfully.
</div>

<!-- For inline validation -->
<div id="email-error" aria-live="polite">
  Please enter a valid email address.
</div>
```

Use `polite` for:
- Toast notifications
- Form validation messages
- Success confirmations
- Non-urgent status updates

---

## See Also

- **COMPONENTS.md** — Visual specs (variants, sizes, states)
- **COMPONENT_PATTERNS.md** — React implementation patterns
- **INTERACTION_PATTERNS.md** — User interactions
- **WCAG.md** — Accessibility requirements
