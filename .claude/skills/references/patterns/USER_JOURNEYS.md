# User Journeys

Designing user flows, navigation patterns, and wayfinding — from entry points to exit states.

For reducing steps/friction, error handling in flows, flow documentation, and analytics, see `FLOW_OPTIMIZATION.md`.

## Overview

User journeys connect user goals to interface design through:
- **Flows** — The paths users take to complete tasks
- **Navigation** — How users move between screens
- **Wayfinding** — How users understand where they are

---

## Flow Types

### Task Flow

Linear sequence for a single task:

```
[Start] → [Step 1] → [Step 2] → [Step 3] → [End]

Example - Password Reset:
[Forgot Password] → [Enter Email] → [Check Email] → [Set New Password] → [Success]
```

### User Flow

Journey including decisions and branches:

```
[Entry Point]
      ↓
[Decision Point] ─── Yes ──→ [Path A]
      │
      No
      ↓
[Path B] ─── Success ──→ [Complete]
      │
   Error
      ↓
[Error Recovery]
```

### Wireflow

Flow combined with wireframes:

```
┌─────────┐      ┌─────────┐      ┌─────────┐
│ Screen  │      │ Screen  │      │ Screen  │
│   A     │ ───→ │   B     │ ───→ │   C     │
│ [CTA]   │      │ [Form]  │      │ [Done]  │
└─────────┘      └─────────┘      └─────────┘
```

---

## Flow Components

### Entry Points

```
Common entry points:
- Direct URL / bookmark
- Navigation menu
- Search results
- Email link
- Push notification
- Deep link (mobile)
- Another app/integration

Document how users arrive:
┌───────────────────────────────────────┐
│ Entry Points for Checkout Flow        │
├───────────────────────────────────────┤
│ • Cart page "Checkout" button (70%)   │
│ • "Buy Now" on product page (20%)     │
│ • Saved cart email link (10%)         │
└───────────────────────────────────────┘
```

### Decision Points

```
Binary decision:
           [Logged in?]
              │
    ┌────Yes──┴──No────┐
    ↓                   ↓
[Dashboard]        [Login Page]

Multiple options:
           [Account Type?]
              │
    ┌────────┼────────┐
    ↓        ↓        ↓
[Personal] [Team]  [Enterprise]
```

### Exit Points

```
Success exits:
- Task completed
- Goal achieved
- Confirmation shown

Failure exits:
- Error (recoverable)
- Abandonment
- Session timeout
- Permission denied

Document all exits:
┌───────────────────────────────────────┐
│ Exit Points for Signup Flow           │
├───────────────────────────────────────┤
│ ✓ Success: Account created (65%)      │
│ ✗ Abandoned at email step (20%)       │
│ ✗ Abandoned at verification (10%)     │
│ ✗ Error: Email already exists (5%)    │
└───────────────────────────────────────┘
```

---

## Navigation Patterns

### Primary Navigation Types

**Top Navigation Bar:**
```
┌─────────────────────────────────────────────────────────────┐
│ Logo    [Home] [Products] [About] [Contact]      [Login]    │
└─────────────────────────────────────────────────────────────┘

Best for: Marketing sites, simple apps, 3-7 items
Pros: Visible, familiar pattern
Cons: Limited space, mobile challenges
```

**Side Navigation:**
```
┌──────────────┬────────────────────────────────────────────┐
│              │                                             │
│ Dashboard    │                                             │
│ Projects     │                                             │
│ Team         │         Main Content Area                   │
│ Settings     │                                             │
│              │                                             │
│ ─────────── │                                             │
│ Help         │                                             │
│ Logout       │                                             │
└──────────────┴────────────────────────────────────────────┘

Best for: Apps, dashboards, many items
Pros: More space, always visible
Cons: Takes horizontal space, mobile needs pattern
```

**Bottom Navigation (Mobile):**
```
┌─────────────────────────────────────────┐
│                                          │
│           Main Content                   │
│                                          │
├─────────────────────────────────────────┤
│  Home   Stats   Add   Profile  Settings  │
└─────────────────────────────────────────┘

Best for: Mobile apps, 3-5 primary actions
Pros: Thumb-friendly, always visible
Cons: Limited to 5 items, takes screen space
```

### Secondary Navigation Patterns

**Hamburger Menu:**
```
Closed:                    Open:
┌──────────────────┐      ┌──────────────────┐
│ ☰  App Name      │      │ ✕  App Name      │
├──────────────────┤      ├──────────────────┤
│                  │      │ Home             │
│                  │      │ Products         │
│                  │      │ About            │
│                  │      │ Contact          │
└──────────────────┘      └──────────────────┘

When: Mobile, secondary nav, space constraints
Cons: Hidden = less discoverable, extra tap
```

**Tabs:**
```
Standard tabs:
┌───────┬───────┬───────┬───────┐
│ Tab 1 │ Tab 2 │ Tab 3 │ Tab 4 │
└───────┴───────┴───────┴───────┘
│                                 │
│ Tab content area                │
│                                 │
└─────────────────────────────────┘

Best for: 2-7 related views, same hierarchy level
Avoid: Nesting tabs, > 7 tabs visible
```

**Drill-Down Navigation:**
```
Level 1:              Level 2:              Level 3:
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ ← Back          │   │ ← Electronics   │   │ ← Phones        │
├─────────────────┤   ├─────────────────┤   ├─────────────────┤
│ Electronics   → │   │ Computers     → │   │ iPhone 15       │
│ Clothing      → │   │ Phones        → │   │ iPhone 15 Pro   │
│ Home          → │   │ Audio         → │   │ Samsung S24     │
└─────────────────┘   └─────────────────┘   └─────────────────┘

Best for: Mobile, deep hierarchies
Pattern: Each level replaces previous
```

---

## Wayfinding Elements

### Breadcrumbs

```
Standard breadcrumbs:
Home > Products > Electronics > Phones > iPhone 15

Truncated (long paths):
Home > ... > Phones > iPhone 15

Best for: Deep hierarchies, e-commerce
Don't use: Flat structures, single-level apps
```

### Current Location Indicators

```
Active nav item:
┌────────────────────────────────────┐
│ Dashboard                          │
│ [█] Projects    ← active indicator │
│ Team                               │
│ Settings                           │
└────────────────────────────────────┘
```

### Progress Indicators

```
Step indicator (wizard):
● Account ──── ○ Profile ──── ○ Payment ──── ○ Review
   Step 1         Step 2        Step 3         Step 4
```

---

## Responsive Navigation

### Mobile Transformation

```
Desktop:
[Logo] [Home] [Products] [About] [Contact] [Login]

Mobile (hamburger):
[☰] [Logo]                         [Login]

Mobile (bottom nav):
[Logo]                              [Login]
             Content
[Home]  [Products]  [About]  [Contact]
```

### Priority+ Pattern

```
Wide screen:
[Home] [Products] [Services] [About] [Contact] [Support] [Blog]

Narrow screen:
[Home] [Products] [Services] [More ▼]
                               │
                               ├─ About
                               ├─ Contact
                               ├─ Support
                               └─ Blog
```

---

## Accessibility

### ARIA Landmarks

```html
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/">Home</a>
    </li>
    <li role="none">
      <a role="menuitem" aria-current="page" href="/products">Products</a>
    </li>
  </ul>
</nav>

<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Item</li>
  </ol>
</nav>
```

### Keyboard Navigation

```
Tab:        Move to next nav item
Shift+Tab:  Move to previous nav item
Enter:      Activate link
Arrow keys: Navigate within menu
Escape:     Close dropdown/submenu
Home:       First item in menu
End:        Last item in menu
```

### Skip Links

```html
<!-- First element in body -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<main id="main-content" tabindex="-1">
  ...
</main>
```

---

## Best Practices

### Navigation Guidelines

```
1. Be consistent - Same nav everywhere
2. Be visible - Show current location
3. Be clear - Use recognizable labels
4. Be accessible - Keyboard + screen reader support
5. Be responsive - Adapt to screen size
```

### Label Guidelines

```
Good labels:
- Short (1-2 words)
- Descriptive
- Action-oriented for actions
- Noun-based for destinations

Examples:
✓ Dashboard, Projects, Settings
✓ Create Project, Export Data
✗ Miscellaneous, Other, More Stuff
✗ Click Here, Go
```

---

## See Also

- **FLOW_OPTIMIZATION.md** — Reducing friction, error recovery flows, documentation, analytics
- **NAVIGATION.md** — Sidebar, application shell, command navigation in depth
- **FORMS.md** — Form flows and multi-step wizards
- **INTERACTION_PATTERNS.md** — Micro-interactions within flows
- **ERROR_HANDLING.md** — Error recovery patterns
