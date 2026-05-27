# Form Patterns

UX/UI patterns for form flows, UI components, validation, and field states.

For password handling, placeholders, unsaved changes, number inputs, accessibility, and examples, see `FORM_DETAILS.md`.

## Overview

Forms are the primary way users input data. They need to be:
- Efficient (minimize effort)
- Clear (obvious what to do)
- Forgiving (easy to fix mistakes)
- Accessible (usable by everyone)

## Key Flows

### Single-Page Form

```
[Enter data] → [Validate] → [Submit] → [Confirmation]

Best for:
- Short forms (<7 fields)
- Simple data collection
- Quick tasks
```

### Multi-Step Form (Wizard)

```
[Step 1: Basic] → [Step 2: Details] → [Step 3: Review] → [Confirm]

Best for:
- Long forms (7+ fields)
- Complex data collection
- Progressive disclosure
- Conditional sections
```

### Inline Editing

```
[View mode] → [Click to edit] → [Edit mode] → [Save/Cancel]

Best for:
- Settings pages
- Profile editing
- Quick updates
```

## UI Components

### Input Fields

```
Standard input:
┌────────────────────────────┐
│ Label                       │
├────────────────────────────┤
│ Placeholder text            │
└────────────────────────────┘
  Help text below

With error:
┌────────────────────────────┐
│ Label                       │
├────────────────────────────┤
│ Invalid value           ⚠️  │
└────────────────────────────┘
  ⚠️ Error message in red
```

### Field Types

```
Text input: Names, short text
Email input: Email addresses (with validation)
Password: Hidden input with toggle
Textarea: Long text, comments
Number: Numeric values
Date picker: Date selection
Select: Dropdown choices
Radio: Single choice (visible options)
Checkbox: Multiple choice or boolean
File upload: Documents, images
```

### Progress Indicator

```
Multi-step progress:

Step 1     Step 2     Step 3     Step 4
●──────────○──────────○──────────○
Personal   Address    Payment    Review

Or simpler:
Step 2 of 4: Address Information
```

### Form Actions

```
Primary action: Submit, Save, Continue
Secondary action: Cancel, Back, Save Draft

Button placement:
- Single step: Right-aligned or full-width
- Multi-step: Back (left), Continue (right)
- Modal: Cancel (left), Submit (right)
```

## Validation Patterns

### When to Validate

```
On blur (field exit):
- Best for most fields
- Immediate feedback
- Doesn't interrupt typing

On change (real-time):
- Good for formatting (phone, card)
- Password strength
- Character limits

On submit:
- Final validation
- Cross-field validation
- Server-side validation
```

### Validation Timing Table

| Strategy | When | Best For |
|----------|------|----------|
| On blur | When field loses focus | Most fields — immediate feedback without interrupting |
| On change | Each keystroke | Formatting (phone, card), character limits |
| On submit | Form submission | Cross-field validation, server checks |
| Debounced | 300-500ms after typing stops | Async validation (username availability) |

### Cross-field Validation

```
Validate together:
- Password + Confirm password
- Start date + End date
- Min value + Max value

Show error on dependent field:
"Confirm password must match"
"End date must be after start date"
```

### Field State Transitions

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  Empty  │ ──→ │ Focused │ ──→ │ Filled  │
└─────────┘     └─────────┘     └─────────┘
     │               │               │
     │               │               ▼
     │               │         ┌─────────┐
     │               │    ┌──→ │  Valid  │
     │               │    │    └─────────┘
     │               ▼    │
     │          ┌─────────┴───┐
     └────────→ │  Validating │
               └─────────┬───┘
                    │    │
                    │    ▼
                    │ ┌─────────┐
                    └→│ Invalid │
                      └─────────┘
```

### Error Display

```
Field-level errors:
- Below the field
- Icon + message
- Field border color change

Summary errors:
- Top of form
- List all errors
- Link to fields

Toast/Alert:
- Server errors
- Network issues
- Success confirmation
```

### Error Messages

```
Format: What's wrong + How to fix

Bad: "Invalid input"
Good: "Enter a valid email address (e.g., name@example.com)"

Bad: "Error"
Good: "Phone number must be 10 digits"

Bad: "Required"
Good: "Email address is required"
```

## States to Design

### Field States
- Default (empty, unfocused)
- Focused (cursor in field)
- Filled (has value)
- Disabled (not editable)
- Read-only (viewable, not editable)
- Error (invalid value)
- Success (validated)

### Form States
- Empty (initial state)
- In progress (partially filled)
- Submitting (loading)
- Error (validation failed)
- Success (submitted)

### Multi-Step States
- Current step (active)
- Completed step (can navigate back)
- Future step (not accessible yet)
- Error step (has validation issues)

## Best Practices

### General
- Show all fields upfront (avoid "Add more")
- Group related fields
- One column layout (except short fields)
- Clear required vs optional
- Preserve data on error

### Validation
- Validate on blur, not on change
- Show success state for valid fields
- Be specific about errors
- Don't block submission for warnings

### Multi-Step
- Show progress
- Allow going back
- Save progress automatically
- Review step before final submit

### Mobile
- Large touch targets (44px+)
- Appropriate keyboard types
- Minimize typing (use selects)
- Sticky submit button

## Common Mistakes

### UX Mistakes
- Too many required fields
- No inline validation
- Clearing form on error
- No autosave for long forms
- Confusing field order
- No progress indicator for wizards

### Design Mistakes
- Labels inside inputs only
- No visible focus states
- Error colors only (no icon/text)
- Inconsistent field sizes
- Too much space between fields

### Technical Mistakes
- Client-side validation only
- No duplicate submission prevention
- Losing data on back button
- No session timeout handling

---

## See Also

- **FORM_DETAILS.md** — Password fields, placeholders, unsaved changes, number inputs, accessibility, examples
- **COMPONENT_BEHAVIOR.md** — Input behavior rules (NEVER block paste, MUST trim whitespace)
- **ERROR_HANDLING.md** — Error state UI components
- **USER_JOURNEYS.md** — Multi-step form flows
- **I18N.md** — Input formatting by locale
