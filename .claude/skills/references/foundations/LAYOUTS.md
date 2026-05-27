# Layout Systems Reference

Spacing scale, grid systems, responsive breakpoints, containers, and layout patterns.

For viewport units, safe areas, z-index, scroll behavior, and browser UI, see `VIEWPORT.md`.

## Spacing Scale

### 4px Base Scale

```
0:    0px
0.5:  2px
1:    4px
1.5:  6px
2:    8px
2.5:  10px
3:    12px
4:    16px
5:    20px
6:    24px
8:    32px
10:   40px
12:   48px
16:   64px
20:   80px
24:   96px
```

### When to Use

```
2-4px:   Fine details (icon padding, badge spacing)
8-12px:  Related elements (form fields, list items)
16-24px: Component padding, related groups
32-48px: Section spacing, major groups
64px+:   Page sections, hero areas
```

## Grid Systems

### 12-Column Grid

```
┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐
│1│2│3│4│5│6│7│8│9│10│11│12│
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘

Common layouts:
Full:     col-span-12
Half:     col-span-6 + col-span-6
Thirds:   col-span-4 x 3
Sidebar:  col-span-3 + col-span-9
```

### CSS Grid Implementation

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.col-6 { grid-column: span 6; }
.col-4 { grid-column: span 4; }
.col-3 { grid-column: span 3; }
```

### Flexbox for Simple Layouts

```css
.flex-container {
  display: flex;
  gap: 16px;
}

.flex-1 { flex: 1; }
.flex-auto { flex: 0 0 auto; }
```

## Responsive Breakpoints

### Common Breakpoints

```
Mobile:     < 640px   (sm)
Tablet:     640-1024px (md, lg)
Desktop:    1024-1280px (xl)
Large:      > 1280px  (2xl)

Tailwind defaults:
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Mobile-First Approach

```css
/* Base (mobile) */
.container {
  padding: 16px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
  }
}
```

## Container Widths

### Max Width Options

```
Prose (reading): max-width: 65ch (~650px)
Narrow:          max-width: 640px
Default:         max-width: 1024px
Wide:            max-width: 1280px
Full:            max-width: 1440px
```

### Centered Container

```css
.container {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 16px;
  padding-right: 16px;
}

@media (min-width: 640px) {
  .container {
    padding-left: 24px;
    padding-right: 24px;
  }
}
```

## Layout Patterns

### Header/Main/Footer

```
┌─────────────────────────────────────────┐
│ Header (fixed or sticky)                │
├─────────────────────────────────────────┤
│                                          │
│ Main content                             │
│                                          │
├─────────────────────────────────────────┤
│ Footer                                   │
└─────────────────────────────────────────┘
```

```css
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
}
```

### Sidebar Layout

```
┌────────────────────────────────────────────┐
│ Header                                      │
├──────────┬─────────────────────────────────┤
│          │                                  │
│ Sidebar  │ Main content                     │
│ (fixed)  │ (scrollable)                     │
│          │                                  │
└──────────┴─────────────────────────────────┘
```

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
}
```

### Card Grid

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│  Card   │  │  Card   │  │  Card   │
└─────────┘  └─────────┘  └─────────┘
┌─────────┐  ┌─────────┐  ┌─────────┐
│  Card   │  │  Card   │  │  Card   │
└─────────┘  └─────────┘  └─────────┘
```

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}
```

### Split View

```
┌─────────────────────┬─────────────────────┐
│                     │                      │
│   Left content      │   Right content      │
│   (image, form)     │   (text, result)     │
│                     │                      │
└─────────────────────┴─────────────────────┘
```

```css
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
}

@media (max-width: 768px) {
  .split {
    grid-template-columns: 1fr;
  }
}
```

## Spacing Guidelines

### Component Internal Spacing

```
Card:
┌─────────────────────────┐
│  ↑ 16-24px padding      │
│  ← →                    │
│  Title                  │
│  ↓ 8px                  │
│  Description            │
│  ↓ 16px                 │
│  [Action]               │
│  ↓ 16-24px padding      │
└─────────────────────────┘
```

### Section Spacing

```
Page:
┌─────────────────────────┐
│ Hero                    │
│                         │
├─────────────────────────┤ ← 48-64px
│ Section 1               │
│                         │
├─────────────────────────┤ ← 48-64px
│ Section 2               │
│                         │
└─────────────────────────┘
```

### Related vs Unrelated

```
Related items (8-12px):
[ Input    ]
[ Input    ] ← Same form group

Unrelated items (24-32px):
[ Form group 1 ]

[ Form group 2 ] ← Different groups
```

## Checklist

- [ ] Spacing scale defined (4px or 8px base)
- [ ] Grid system established (12-column recommended)
- [ ] Breakpoints defined for responsive
- [ ] Container max-widths set
- [ ] Consistent spacing between components
- [ ] Mobile-first media queries
- [ ] Tested on multiple screen sizes
