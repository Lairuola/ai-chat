# Viewport & Browser Coordination

Viewport units, safe areas, z-index scale, overflow handling, scroll behavior, and browser UI coordination.

For spacing, grid, responsive breakpoints, and layout patterns, see `LAYOUTS.md`.

---

## Viewport Units

### Height Units
```
NEVER use h-screen — use h-dvh instead
```

| Unit | Behavior | Use Case |
|------|----------|----------|
| `vh` | Fixed to initial viewport | Causes issues on mobile (ignores browser chrome) |
| `svh` | Small viewport height | When browser chrome is visible |
| `lvh` | Large viewport height | When browser chrome is hidden |
| `dvh` | Dynamic viewport height | **Recommended** - adapts to browser chrome |

```css
/* ❌ Bad - doesn't account for mobile browser chrome */
.full-height {
  height: 100vh;
}

/* ✅ Good - adapts to mobile browser chrome */
.full-height {
  height: 100dvh;
}
```

### Width Units
```css
/* Full width minus scrollbar */
.full-width {
  width: 100vw; /* May cause horizontal scroll if scrollbar visible */
  width: 100%; /* Usually what you want */
}
```

---

## Safe Areas

### Mobile Device Insets
```css
/* Account for notches, home indicators, sidebars */
.fixed-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.fixed-nav {
  padding-top: env(safe-area-inset-top, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}
```

### Required for Fixed Elements
- Bottom navigation bars
- Floating action buttons
- Fixed headers on notched devices
- Full-screen modals

### Viewport Meta
```html
<!-- Enable safe area support -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

---

## Z-Index Scale

### Structured Scale
Use ONLY these z-index values — no arbitrary `z-*`:

| Token | Value | Usage |
|-------|-------|-------|
| `z-0` | 0 | Base layer, backgrounds |
| `z-10` | 10 | Elevated cards, raised surfaces |
| `z-20` | 20 | Dropdowns, select menus |
| `z-30` | 30 | Sticky elements, affixed headers |
| `z-40` | 40 | Fixed elements, floating buttons |
| `z-50` | 50 | Modal backdrop |
| `z-60` | 60 | Modal content, dialogs |
| `z-70` | 70 | Popovers, combobox listbox |
| `z-80` | 80 | Tooltips |
| `z-90` | 90 | Toast notifications |

### Rules
```
NEVER use arbitrary z-index values (z-[999], z-[9999])
```
- Arbitrary values create stacking context chaos
- Always use the defined scale
- If you need a new level, add it to the scale

### Stacking Context
```css
/* Creates new stacking context */
.creates-context {
  position: relative; /* or absolute/fixed/sticky */
  z-index: 1; /* any non-auto value */
}

/* Also creates stacking context */
.also-creates-context {
  transform: translateZ(0);
  opacity: 0.99;
  isolation: isolate;
}
```

---

## Overflow Handling

### Scrollable Containers
```css
/* Modal/drawer content - prevent background scroll */
.modal-content {
  overscroll-behavior: contain;
}

/* Horizontal scroll container */
.scroll-x {
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
}
```

### Preventing Excessive Scrollbars
- Test with macOS "Show scroll bars: Always" (simulates Windows)
- Fix overflow issues that cause unwanted scrollbars
- Use `overflow: hidden` on parent when content shouldn't scroll

### Body Scroll Lock
```css
/* When modal is open */
body.modal-open {
  overflow: hidden;
  /* Prevent iOS bounce */
  position: fixed;
  width: 100%;
}
```

---

## Scroll Behavior

### Position Persistence
- Scroll positions MUST persist on Back/Forward navigation
- Use browser's scroll restoration API
- Restore scroll after async content loads

### Anchored Headings
```css
/* Account for sticky header when linking to sections */
h2, h3, h4 {
  scroll-margin-top: 80px; /* Height of sticky header + padding */
}

/* Or use CSS variable */
:root {
  --header-height: 64px;
}

[id] {
  scroll-margin-top: calc(var(--header-height) + 16px);
}
```

### Smooth Scroll
```css
/* Enable smooth scrolling for anchor links */
html {
  scroll-behavior: smooth;
}

/* Disable for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

---

## Browser UI Coordination

### Theme Color
```html
<!-- Match browser chrome to page background -->
<meta name="theme-color" content="#000000">

<!-- Different colors for light/dark mode -->
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
```

### Color Scheme
```css
/* Ensure scrollbars and other device UI have proper contrast */
html {
  color-scheme: light; /* or dark, or light dark */
}

/* For dark mode */
html.dark {
  color-scheme: dark;
}
```

---

## Checklist

- [ ] Using `dvh` instead of `vh` for full height
- [ ] Safe areas respected for fixed elements
- [ ] Z-index scale documented (no arbitrary values)
- [ ] `overscroll-behavior` set on modals/drawers
- [ ] `scroll-margin-top` on anchored headings
- [ ] `theme-color` meta tag set
- [ ] `color-scheme` CSS property set
- [ ] Scroll positions persist on navigation
