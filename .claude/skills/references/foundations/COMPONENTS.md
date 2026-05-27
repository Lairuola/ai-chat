# Component Patterns Reference

Common UI component visual specifications and guidelines.

For behavior rules (loading states, input handling, ARIA), see `COMPONENT_BEHAVIOR.md`.

## Buttons

### Variants
```
Solid: Primary actions, high emphasis
Outline: Secondary actions, medium emphasis
Ghost: Tertiary actions, low emphasis
Link: Inline actions, minimal emphasis
```

### Sizes
```
sm: Compact UI, dense info (px-3 py-1.5 text-sm)
md: Default (px-4 py-2 text-base)
lg: Prominent, touch-friendly (px-6 py-3 text-lg)
```

### States
```
Default: Resting state
Hover: Mouse over (slightly darker/lighter)
Focus: Keyboard focus (visible ring)
Active: Being pressed (more contrast)
Disabled: Not available (reduced opacity)
Loading: Action in progress (spinner)
```

### Guidelines
```
Labels: Verb + noun ("Save changes")
Icons: Left of text, same size as text
Width: Auto or full-width, not arbitrary
Touch targets: 44x44px minimum
```

## Cards

### Structure
```
┌─────────────────────────────────┐
│ [Image/Media - optional]        │
├─────────────────────────────────┤
│ [Header/Title]                  │
│ [Description/Body]              │
│ [Metadata - optional]           │
├─────────────────────────────────┤
│ [Actions - optional]            │
└─────────────────────────────────┘
```

### Variants
```
Basic: Content only
Interactive: Clickable/hoverable
Elevated: Shadow for prominence
Outlined: Border, no shadow
```

### Guidelines
```
Padding: Consistent (16px common)
Spacing: Same between all cards
Actions: Max 2-3 per card
Images: Consistent aspect ratio
```

## Modals

### Structure
```
┌─────────────────────────────────┐
│ [Header]              [Close X] │
├─────────────────────────────────┤
│                                 │
│ [Content]                       │
│                                 │
├─────────────────────────────────┤
│            [Cancel] [Confirm]   │
└─────────────────────────────────┘
```

### Sizes
```
sm: Confirmations, alerts (max-width: 400px)
md: Forms, content (max-width: 500px)
lg: Complex content (max-width: 700px)
full: Take over (max-width: 900px)
```

### Guidelines
```
Backdrop: Semi-transparent overlay
Focus trap: Keep focus inside modal
Close: X button, Escape key, backdrop click
Scrolling: Modal body scrolls, not page
Animation: Fade in, scale up
```

## Forms

### Input Structure
```
[Label]
[Input field]
[Help text or Error]
```

### Input States
```
Default: Empty, not focused
Focused: Active cursor
Filled: Has value
Disabled: Not editable
Error: Invalid value
Success: Validated
```

### Field Types
```
Text: General text input
Email: Email with validation
Password: Hidden with toggle
Textarea: Multi-line text
Select: Dropdown choices
Checkbox: Multiple selection
Radio: Single selection
Date: Date picker
File: File upload
```

### Guidelines
```
Labels: Always visible (not just placeholder)
Required: Mark with * or (required)
Errors: Below field, specific message
Help text: Below label or field
Grouping: Related fields together
Alignment: Single column preferred
```

## Tables

### Structure
```
┌────────────────────────────────────────────┐
│ [Header row - sortable columns]            │
├────────────────────────────────────────────┤
│ [Data row 1]                               │
│ [Data row 2]                               │
│ [Data row 3]                               │
├────────────────────────────────────────────┤
│ [Pagination]                               │
└────────────────────────────────────────────┘
```

### Features
```
Sorting: Click column header
Filtering: Search/filter bar
Selection: Checkboxes
Actions: Row actions, bulk actions
Pagination: Page numbers or infinite scroll
```

### Guidelines
```
Headers: Clear, consistent alignment
Rows: Zebra striping optional
Actions: Overflow menu for many actions
Empty: Meaningful empty state
Loading: Skeleton rows
Responsive: Scroll or stack on mobile
```

## Tooltips

### Structure
```
       ┌───────────────────┐
       │ Tooltip content   │
       └───────────────────┘
              ▼
         [Trigger]
```

### Guidelines
```
Trigger: Hover (desktop), tap (mobile)
Delay: Show after 200-500ms
Position: Above, below, left, right (auto)
Content: Short, helpful info
Dismiss: On mouse leave or tap elsewhere
Accessibility: Keyboard accessible
```

## Dropdowns/Menus

### Structure
```
┌─────────────────┐
│ [Trigger]    ▼  │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ Option 1        │
│ Option 2        │
│ ─────────────── │
│ Option 3        │
└─────────────────┘
```

### Guidelines
```
Trigger: Button or clickable element
Options: Max 7-10 visible, scroll if more
Dividers: Group related items
Icons: Left of text if used
Selection: Highlight current selection
Keyboard: Arrow keys to navigate
```

## Tabs

### Structure
```
┌───────┬───────┬───────┬───────┐
│ Tab 1 │ Tab 2 │ Tab 3 │ Tab 4 │
└───────┴───────┴───────┴───────┘
│                               │
│ [Tab content panel]           │
│                               │
└───────────────────────────────┘
```

### Guidelines
```
Selection: Clearly show active tab
Count: 3-5 tabs ideal, max 7-8
Labels: Short, clear, consistent
Overflow: Scroll or dropdown on mobile
Content: Don't auto-switch, user controls
Accessibility: Proper ARIA roles
```

## Badges/Tags

### Uses
```
Status: Active, Pending, Error
Count: Notifications (3)
Category: Feature, Bug, Enhancement
Label: New, Sale, Featured
```

### Variants
```
Solid: High emphasis
Outline: Lower emphasis
Dot: Minimal indicator
```

### Guidelines
```
Position: Upper right for notifications
Size: Small, don't dominate
Color: Semantic (green=success, red=error)
Text: Short (1-2 words or number)
```

## Avatars

### Variants
```
Image: User photo
Initials: First/last initials
Icon: Generic user icon
```

### Sizes
```
xs: 24px (compact lists)
sm: 32px (small contexts)
md: 40px (default)
lg: 48-64px (profiles)
xl: 80-96px (large profiles)
```

### Guidelines
```
Fallback: Initials if no image
Shape: Circle (common) or square
Border: Optional ring
Group: Overlapping for multiple users
```

## Feedback Components

### Toast/Snackbar
```
Brief notifications:
- Auto-dismiss (3-5 seconds)
- Position: Top or bottom
- Types: Success, error, warning, info
- Action: Optional (Undo, View)
```

### Alert/Banner
```
Important messages:
- Persistent until dismissed
- Position: Top of content
- Types: Success, error, warning, info
- Action: Optional (Learn more)
```

### Progress
```
Loading indicators:
- Spinner: Unknown duration
- Bar: Known progress percentage
- Skeleton: Content loading
- Shimmer: Content loading (animated)
```

### Empty States
```
No content:
- Icon or illustration
- Headline
- Description
- Call to action
```

---

## See Also

- **COMPONENT_BEHAVIOR.md** — Behavior rules, loading states, input handling, ARIA
- **COMPONENT_PATTERNS.md** — React implementation patterns
- **TYPOGRAPHY.md** — Text styling in components
- **COLORS.md** — Color usage and states
- **MOTION.md** — Animation patterns
- **WCAG.md** — Accessibility requirements
- **INTERACTION_PATTERNS.md** — User interactions
