# Form Details

Advanced validation, password handling, placeholder guidelines, unsaved changes, number inputs, and form accessibility.

For form flows, UI components, validation patterns, and field states, see `FORMS.md`.

---

## Advanced Validation

### Real-time vs On Blur

```
Real-time validation (on keystroke):
- Password strength meter
- Character count approaching limit
- Phone/credit card formatting

On blur validation (preferred for most):
- Email format
- Required fields
- Pattern matching
- Don't validate empty fields until attempted submit
```

### Error Message Guidelines

#### Structure

```
Bad:  "Invalid input"
Good: "Email must include @ and a domain (e.g., name@company.com)"

Bad:  "Error"
Good: "Phone number must be exactly 10 digits"

Bad:  "Required"
Good: "Please enter your email address"
```

#### Actionable Error Copy

```
MUST include:
1. What's wrong (specific)
2. How to fix it (actionable)
3. Example if helpful

Examples:
❌ "Invalid API key"
✅ "This API key is incorrect or expired. Generate a new key in Settings → API Keys."

❌ "Password too weak"
✅ "Password needs at least 8 characters, including a number and symbol."
```

---

## Password Field Patterns

### Password Requirements Display

```
Password
┌─────────────────────────────────────┐
│ ••••••••                            │
└─────────────────────────────────────┘
Requirements:
✓ At least 8 characters
✓ One uppercase letter
✗ One number
✗ One special character

Show requirements upfront, check off as met.
```

### Password Manager Compatibility

```html
<!-- Login form - trigger password manager -->
<input type="password" name="password" autocomplete="current-password" />

<!-- Signup form - new password -->
<input type="password" name="new-password" autocomplete="new-password" />

<!-- OTP/verification code -->
<input type="text" inputmode="numeric" autocomplete="one-time-code" />

<!-- NEVER trigger password manager for non-auth -->
<input type="text" name="search" autocomplete="off" />
```

---

## Placeholder Patterns

```
MUST:
- End with ellipsis to signal emptiness: "Search…"
- Use example values when helpful: "+1 (555) 123-4567"
- Never use placeholder as label substitute

Examples:
Email: "name@company.com"
Phone: "+1 (555) 123-4567"
API Key: "sk-0123456789…"
Search: "Search…"
```

---

## Unsaved Changes Warning

```javascript
// Warn user before leaving with unsaved data
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```

Also use router guards for SPA navigation.

```tsx
// React Router v6 blocker
const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    hasUnsavedChanges &&
    currentLocation.pathname !== nextLocation.pathname
);

{blocker.state === 'blocked' && (
  <ConfirmDialog
    title="Discard changes?"
    description="You have unsaved changes. Are you sure you want to leave?"
    onConfirm={blocker.proceed}
    onCancel={blocker.reset}
  />
)}
```

---

## Input Value Sanitization

```
MUST trim whitespace from pasted values:
- Email addresses
- API keys
- Usernames
- Codes

Some input methods and copy/paste add trailing whitespace.
Trim on blur or before validation.
```

```tsx
// Trim on blur
<input
  onBlur={(e) => {
    const trimmed = e.target.value.trim();
    if (trimmed !== e.target.value) {
      onChange(trimmed);
    }
  }}
/>
```

---

## Number Input Patterns

```html
<!-- ❌ Avoid type="number" - has UX issues -->
<input type="number" />

<!-- ✅ Prefer inputmode with pattern -->
<input
  type="text"
  inputmode="numeric"
  pattern="[0-9]*"
  placeholder="12345"
/>

<!-- ✅ For currency -->
<input
  type="text"
  inputmode="decimal"
  pattern="[0-9]*\.?[0-9]*"
/>
```

Why avoid `type="number"`:
- Scroll wheel changes value accidentally
- Invalid state hard to style
- Copy/paste issues
- Screen reader announces "spinbutton"

---

## Accessibility

### Labels

```html
<!-- Always use labels -->
<label for="email">Email address</label>
<input id="email" type="email" />

<!-- Required fields -->
<label for="name">
  Name <span aria-hidden="true">*</span>
  <span class="sr-only">(required)</span>
</label>
<input id="name" required aria-required="true" />
```

### Error Handling

```html
<div>
  <label for="email">Email</label>
  <input
    id="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <span id="email-error" role="alert">
    Please enter a valid email address
  </span>
</div>
```

### Help Text

```html
<div>
  <label for="password">Password</label>
  <input
    id="password"
    type="password"
    aria-describedby="password-help"
  />
  <span id="password-help">
    Must be at least 8 characters with 1 number
  </span>
</div>
```

### Accessibility Mistakes

- Missing labels
- No error announcements
- Inaccessible date pickers
- No keyboard navigation
- CAPTCHAs without alternatives

---

## Example: Contact Form

```
┌─────────────────────────────────────────┐
│ Contact Us                               │
│                                          │
│ Name *                                   │
│ ┌─────────────────────────────────────┐ │
│ │                                      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Email *                                  │
│ ┌─────────────────────────────────────┐ │
│ │                                      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Subject *                                │
│ ┌─────────────────────────────────────┐ │
│ │ Select a topic               ▼      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Message *                                │
│ ┌─────────────────────────────────────┐ │
│ │                                      │ │
│ │                                      │ │
│ │                                      │ │
│ └─────────────────────────────────────┘ │
│ 0/500 characters                         │
│                                          │
│              ┌───────────────────────┐  │
│              │    Send Message       │  │
│              └───────────────────────┘  │
│                                          │
│ * Required fields                        │
└─────────────────────────────────────────┘
```

## Example: Multi-Step Form

```
Step 2 of 3: Shipping Address
━━━━━━━●━━━━━━━━○━━━━━━━━○

┌─────────────────────────────────────────┐
│                                          │
│ Address Line 1 *                         │
│ ┌─────────────────────────────────────┐ │
│ │ 123 Main Street                      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Address Line 2                           │
│ ┌─────────────────────────────────────┐ │
│ │ Apt 4B                               │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ City *              State *    Zip *     │
│ ┌────────────┐  ┌─────────┐  ┌────────┐ │
│ │ New York   │  │ NY   ▼  │  │ 10001  │ │
│ └────────────┘  └─────────┘  └────────┘ │
│                                          │
│ ┌──────────┐           ┌──────────────┐ │
│ │ ← Back   │           │  Continue →  │ │
│ └──────────┘           └──────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

---

## Checklist

- [ ] All inputs have visible labels (never placeholder-only)
- [ ] Password fields have show/hide toggle
- [ ] `autocomplete` attributes set correctly
- [ ] Unsaved changes prompt on navigation
- [ ] Whitespace trimmed from email/API key fields
- [ ] Number inputs use `inputmode` not `type="number"`
- [ ] Errors use `aria-invalid` + `aria-describedby`
- [ ] Required fields marked with both visual and `aria-required`

---

## See Also

- **FORMS.md** — Form flows, validation patterns, error display, field states
- **WCAG.md** — Full accessibility requirements
- **INTERACTION_PATTERNS.md** — Keyboard navigation
- **COMPONENT_BEHAVIOR.md** — Input rules (NEVER block paste, MUST trim whitespace)
