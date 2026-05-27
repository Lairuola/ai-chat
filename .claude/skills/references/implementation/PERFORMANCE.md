# Performance

Web performance optimization — Core Web Vitals, images, fonts, JavaScript, CSS, and React-specific patterns.

---

## Performance Budgets

Set targets before building, not after:

```
Core Web Vitals (quality bar):
- LCP < 2.5s    (Largest Contentful Paint)
- INP < 200ms   (Interaction to Next Paint)
- CLS < 0.1     (Cumulative Layout Shift)

API response time targets:
- GET requests:      < 200ms
- POST/PATCH/DELETE: < 500ms
- Search queries:    < 300ms

Bundle size budgets:
- Initial JS:        < 200KB (compressed)
- Per-route chunk:   < 50KB (compressed)
- Total CSS:         < 50KB (compressed)
```

---

## LCP Optimization

LCP measures when the largest visible element loads.

### Critical Rendering Path

```html
<!-- 1. Preconnect to critical origins -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://api.example.com" crossorigin />

<!-- 2. Preload LCP image -->
<link
  rel="preload"
  as="image"
  href="/hero.avif"
  fetchpriority="high"
/>

<!-- 3. Mark LCP image with fetchpriority -->
<img
  src="/hero.avif"
  alt="..."
  fetchpriority="high"
  loading="eager"      <!-- never lazy-load above-fold images -->
  width="1200"
  height="600"
/>
```

### Font Loading

```html
<!-- Preload critical fonts -->
<link
  rel="preload"
  as="font"
  type="font/woff2"
  href="/fonts/inter.woff2"
  crossorigin
/>
```

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;     /* Show fallback immediately, swap when loaded */
  font-weight: 400;
  font-style: normal;
}
```

```
font-display values:
- swap:     Fallback → custom (can cause FOUT)
- optional: Only use if cached (best for body text)
- block:    Wait up to 3s (bad for LCP — avoid)
```

---

## INP Optimization

INP measures responsiveness to user interactions.

### Long Task Splitting

```tsx
// Bad: Long synchronous computation blocks main thread
function handleClick() {
  const result = expensiveComputation(largeDataset); // blocks for 500ms
  setState(result);
}

// Good: Defer non-critical work
function handleClick() {
  // Update UI immediately
  setLoading(true);

  // Defer heavy work
  setTimeout(() => {
    const result = expensiveComputation(largeDataset);
    setState(result);
    setLoading(false);
  }, 0);
}

// Better: Use scheduler API
function handleClick() {
  setLoading(true);
  scheduler.postTask(() => {
    const result = expensiveComputation(largeDataset);
    setState(result);
    setLoading(false);
  }, { priority: 'user-blocking' });
}
```

### Event Handler Optimization

```tsx
// Debounce search inputs (reduces unnecessary processing)
const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    performSearch(value);
  }, 300),
  []
);

// Throttle scroll handlers
const throttledScroll = useMemo(
  () => throttle(() => {
    updateScrollPosition();
  }, 16), // ~60fps
  []
);
```

---

## CLS Optimization

CLS measures unexpected layout shifts.

### Always Specify Dimensions

```html
<!-- Always set width + height to reserve space -->
<img src="photo.jpg" width="800" height="600" alt="..." />

<!-- Aspect ratio CSS for fluid images -->
<style>
  img {
    width: 100%;
    height: auto;
    aspect-ratio: 4/3; /* or inferred from width/height attrs */
  }
</style>
```

### Reserve Space for Dynamic Content

```css
/* Reserve space for ads/embeds */
.ad-slot {
  min-height: 250px;
  width: 300px;
}

/* Reserve space for late-loading content */
.skeleton {
  height: 200px; /* Match expected content height */
}
```

### Font Swap Without Layout Shift

```css
/* Use size-adjust to match fallback to custom font metrics */
@font-face {
  font-family: 'Inter-fallback';
  src: local('Arial');
  ascent-override: 90%;
  descent-override: 22%;
  size-adjust: 107%;
}

body {
  font-family: 'Inter', 'Inter-fallback', sans-serif;
}
```

---

## Image Optimization

```html
<!-- Modern format with fallback -->
<picture>
  <source type="image/avif" srcset="photo.avif" />
  <source type="image/webp" srcset="photo.webp" />
  <img src="photo.jpg" alt="..." width="800" height="600" />
</picture>

<!-- Responsive images with srcset -->
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
  alt="..."
  width="800"
  height="600"
/>

<!-- Lazy load below-fold images -->
<img src="..." loading="lazy" decoding="async" alt="..." />
```

```
Format guide:
AVIF:  Best compression, modern browsers
WebP:  Good compression, wide support
JPEG:  Photos with high detail
PNG:   Images with transparency
SVG:   Icons, logos, illustrations
```

---

## JavaScript Bundle Optimization

### Route-Based Code Splitting

```tsx
import { lazy, Suspense } from 'react';

// Each route is a separate chunk
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### Dynamic Imports for Heavy Libraries

```tsx
// Don't import chart library in main bundle
// Load only when user navigates to chart view
async function loadChart() {
  const { Chart } = await import('chart.js');
  return Chart;
}

// Or with lazy:
const ChartComponent = lazy(() =>
  import('./components/Chart').then(module => ({
    default: module.ChartComponent,
  }))
);
```

### Bundle Analysis

```bash
# Analyze bundle with vite
npx vite-bundle-visualizer

# Or with webpack-bundle-analyzer
npm run build -- --stats
npx webpack-bundle-analyzer dist/stats.json
```

Watch for:
- Duplicate packages (multiple versions of same lib)
- Accidental full library imports (`import { pick } from 'lodash'` → `import pick from 'lodash/pick'`)
- Dev-only packages in production bundle

---

## CSS Optimization

### CSS Containment

```css
/* Prevent style recalculation from spreading */
.card {
  contain: layout style; /* or 'strict' for full containment */
}

/* Hint paint layers for animated elements */
.animated-element {
  will-change: transform; /* only add while animating */
}

/* Remove will-change after animation completes */
.animated-element.done {
  will-change: auto;
}
```

### Critical CSS

```html
<!-- Inline critical CSS (above-fold styles) -->
<style>
  /* Styles for initial viewport — extracted with critters/penthouse */
  .header { ... }
  .hero { ... }
</style>

<!-- Defer non-critical CSS -->
<link
  rel="preload"
  href="/styles/full.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
```

---

## React-Specific Optimizations

```tsx
// Memoize expensive component
const ExpensiveList = memo(({ items }: { items: Item[] }) => {
  return <ul>{items.map(item => <ListItem key={item.id} item={item} />)}</ul>;
});

// Memoize expensive calculations
function ProductPage({ products, filter }) {
  const filtered = useMemo(
    () => products.filter(p => p.category === filter),
    [products, filter]
  );
}

// Stable callback references
function ParentComponent() {
  const handleClick = useCallback((id: string) => {
    doSomething(id);
  }, []); // No deps → stable reference

  return <ChildComponent onClick={handleClick} />;
}

// Virtualize long lists
import { useVirtualizer } from '@tanstack/react-virtual';
// (see DATA_DISPLAY.md for full example)
```

---

## Caching Strategy

```
HTTP Cache-Control headers:
- Static assets (hashed filenames): Cache-Control: max-age=31536000, immutable
- HTML pages:                        Cache-Control: no-cache (revalidate always)
- API responses:                     Cache-Control: max-age=60, stale-while-revalidate=300

Service worker cache (PWA):
- Cache-first: Static assets, fonts
- Stale-while-revalidate: API data
- Network-first: Critical real-time data
```

---

## Measurement Tools

```
Lighthouse (local):
- npm install -g lighthouse
- lighthouse https://example.com --output html

PageSpeed Insights: pagespeed.web.dev
  → Real user data from Chrome User Experience Report (CrUX)

WebPageTest: webpagetest.org
  → Waterfall, film strip, multi-location testing

Performance API (in-app measurement):
performance.mark('component-start');
// ...
performance.mark('component-end');
performance.measure('component-render', 'component-start', 'component-end');
```

---

## Checklist

- [ ] LCP element identified and preloaded
- [ ] Above-fold images have `fetchpriority="high"`, not lazy
- [ ] Below-fold images have `loading="lazy"`
- [ ] All images have `width` and `height` attributes
- [ ] Fonts use `font-display: swap` or `optional`
- [ ] JavaScript split at route level
- [ ] Bundle analyzed — no accidental large imports
- [ ] Core Web Vitals measured in production (CrUX data)

---

## See Also

- **ENGINEERING.md** — Engineering standards hub
- **VIEWPORT.md** — CSS containment and overflow
- **RESPONSIVE_STRATEGY.md** — Responsive images in depth
- **DATA_DISPLAY.md** — Virtual scrolling for long lists
