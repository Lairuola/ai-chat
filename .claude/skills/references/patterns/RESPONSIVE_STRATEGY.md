# Responsive Strategy

Decision frameworks, adaptive patterns, fluid typography, responsive images, and testing methodology.

---

## Decision Framework

For each UI element, choose the right responsive strategy:

```
Strategy          When to use
─────────────────────────────────────────────────────
Reflow            Stacking columns, wrapping inline elements
                  Use for: Cards, form fields, navigation items

Hide              Remove on small screens
                  Use for: Secondary columns, decorative content
                  NEVER hide essential functionality

Adapt             Change the component itself
                  Use for: Tables → cards, tabs → select, sidebar → bottom nav

Transform         Completely different UX at different breakpoints
                  Use for: Complex data tables, mega menus

Fluid             Scale smoothly between sizes
                  Use for: Typography, spacing, container widths
```

---

## Breakpoints

```css
/* Tailwind defaults (most projects use these) */
sm:   640px   /* Phones landscape + small tablets */
md:   768px   /* Tablets */
lg:   1024px  /* Laptops */
xl:   1280px  /* Desktops */
2xl:  1536px  /* Wide screens */

/* Mobile-first (default, no prefix = all sizes) */
.container { padding: 1rem; }          /* mobile */
@media (min-width: 768px) { ... }      /* md+ */

/* In Tailwind: */
<div class="p-4 md:p-6 lg:p-8">
```

---

## Container Queries

Use when a component should respond to its container, not the viewport.

```css
/* Define a containment context */
.card-grid {
  container-type: inline-size;
  container-name: card;
}

/* Style component based on container width */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
  }
}

@container card (min-width: 600px) {
  .card-actions {
    display: flex;
  }
}
```

Container queries vs media queries:
```
Use MEDIA queries:
- Layout changes (sidebar appears, nav transforms)
- Page-level decisions
- Global typography scaling

Use CONTAINER queries:
- Component adapts to available space
- Component used in multiple contexts (sidebar, main, modal)
- Reusable components (cards, form sections)
```

---

## Responsive Tables

### Strategy Selection

```
Option 1 — Scroll (simplest):
<div class="overflow-x-auto">
  <table>...</table>
</div>
Works when: All columns are important, users expect to scroll

Option 2 — Priority columns (hide on small):
Desktop: Name | Status | Date | Amount | Actions
Tablet:  Name | Status | Amount | Actions
Mobile:  Name | Amount | ···
Works when: Some columns are secondary

Option 3 — Card transform (most mobile-friendly):
Each row becomes a card with label: value pairs
Works when: Rows have 4+ columns, mobile is primary
```

### Card Transform Implementation

```tsx
function ResponsiveTable({ columns, data }) {
  return (
    <>
      {/* Desktop table */}
      <table className="hidden md:table w-full">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              {columns.map(col => (
                <td key={col.key}>{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.map(row => (
          <div key={row.id} className="border rounded-lg p-4">
            {columns.map(col => (
              <div key={col.key} className="flex justify-between py-1">
                <span className="text-sm text-gray-500">{col.label}</span>
                <span className="text-sm font-medium">{col.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
```

---

## Responsive Navigation Transforms

### Patterns

```
Desktop nav bar → Mobile hamburger:
<nav class="hidden md:flex">desktop nav</nav>
<button class="md:hidden">hamburger</button>

Desktop sidebar → Mobile drawer:
<aside class="hidden md:block fixed left-0">sidebar</aside>
<Drawer class="md:hidden">same content</Drawer>

Desktop horizontal tabs → Mobile select:
<div role="tablist" class="hidden sm:flex">tabs</div>
<select class="sm:hidden">same options</select>

Desktop top nav → Mobile bottom bar:
<header>desktop nav with logo + links</header>
<nav class="fixed bottom-0 md:hidden">bottom bar</nav>
```

---

## Fluid Typography

Scale text smoothly between minimum and maximum sizes:

```css
/* Basic clamp */
.heading {
  font-size: clamp(1.5rem, 4vw, 3rem);
  /*         min    fluid  max  */
}

/* Precise fluid scaling (from min-bp to max-bp) */
/* Formula: clamp(min, min + (max - min) * ((100vw - min-bp) / (max-bp - min-bp)), max) */
.hero-title {
  font-size: clamp(
    2rem,                                    /* 32px min */
    calc(2rem + (4 - 2) * ((100vw - 320px) / (1280px - 320px))),
    4rem                                     /* 64px max */
  );
}

/* Tailwind with fluid plugin or manual utilities */
.text-fluid-lg {
  font-size: clamp(1.25rem, 2.5vw, 1.875rem);
}
```

---

## Responsive Images

### srcset for Resolution Switching

```html
<img
  src="hero-800.jpg"
  srcset="
    hero-400.jpg  400w,
    hero-800.jpg  800w,
    hero-1200.jpg 1200w,
    hero-1600.jpg 1600w
  "
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    800px
  "
  alt="Hero image"
  width="800"
  height="450"
/>
```

### Art Direction with `<picture>`

```html
<!-- Different crop for different viewports -->
<picture>
  <source
    media="(max-width: 640px)"
    srcset="hero-portrait.jpg"
  />
  <source
    media="(max-width: 1024px)"
    srcset="hero-square.jpg"
  />
  <img
    src="hero-landscape.jpg"
    alt="Product showcase"
    width="1200"
    height="600"
  />
</picture>
```

### Modern Formats

```html
<picture>
  <source type="image/avif" srcset="hero.avif" />
  <source type="image/webp" srcset="hero.webp" />
  <img src="hero.jpg" alt="..." />
</picture>

Format priority: AVIF > WebP > JPEG/PNG
```

---

## Responsive Forms

### Layout Changes

```css
/* Single column on mobile, two columns on desktop */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }

  .form-grid .full-width {
    grid-column: 1 / -1;
  }
}
```

### Mobile-Specific Inputs

```html
<!-- Appropriate keyboard types -->
<input type="email" inputmode="email" />
<input type="tel" inputmode="tel" />
<input type="text" inputmode="numeric" pattern="[0-9]*" />
<input type="text" inputmode="decimal" />
<input type="search" />

<!-- Autocomplete for faster mobile input -->
<input autocomplete="given-name" />
<input autocomplete="family-name" />
<input autocomplete="email" />
<input autocomplete="street-address" />
<input autocomplete="postal-code" />
<input autocomplete="cc-number" />
```

---

## Content Choreography

Reorder content for different viewports (when order matters):

```html
<!-- Visual order changes on mobile -->
<div class="flex flex-col md:flex-row">
  <!-- On desktop: Image left, text right -->
  <!-- On mobile: Text first (more important), image below -->
  <div class="order-2 md:order-1">
    <img src="..." alt="..." />
  </div>
  <div class="order-1 md:order-2">
    <h2>Headline</h2>
    <p>Description...</p>
  </div>
</div>
```

Warning: CSS order changes visual order but not DOM order. Keyboard/screen reader order follows DOM. If you reorder visually, reorder the DOM too when it affects reading flow.

---

## Testing Methodology

### Real Device Testing

```
Critical devices to test:
- iPhone SE (small phone, 375px)
- iPhone 14 Pro (modern phone, 393px)
- iPad (tablet, 768px+)
- 13" laptop (1280–1440px)
- Wide monitor (1920px+)

Don't rely on emulators alone:
- Real scroll inertia behavior
- Actual touch target feel
- Browser chrome (address bar, bottom bar) impact
- Notch/Dynamic Island behavior
```

### Browser DevTools Responsive Mode

```
Good for:
- Quick breakpoint checks
- Fluid typography preview
- Container query behavior

Not reliable for:
- Touch behavior simulation
- Performance profiling
- Safari-specific rendering
```

### Responsive Design Checklist

```
□ Tested on real phones (iOS + Android)
□ No horizontal scroll on mobile
□ Text readable without zooming (min 16px body)
□ Touch targets ≥ 44x44px
□ Images don't overflow containers
□ Navigation accessible at all sizes
□ Forms usable with on-screen keyboard
□ No hover-only interactions
□ Content available at all breakpoints (nothing critical hidden)
□ Portrait and landscape orientations tested
```

---

## See Also

- **NAVIGATION.md** — Responsive navigation transforms in detail
- **VIEWPORT.md** — Viewport units, safe areas, browser UI
- **DATA_DISPLAY.md** — Responsive tables
- **FORMS.md** — Mobile form patterns
- **LAYOUTS.md** — Grid and spacing patterns
