# Motion Design Reference

Comprehensive guide to animation and motion in UI design.

## Timing Guidelines

### Duration by Context

```
Instant feedback:    100-150ms (hover, tap)
Standard:            200-300ms (most transitions)
Complex:             300-500ms (page transitions, modals)
Elaborate:           500ms+    (celebrations, onboarding)
```

### Timing Relationship

| Element Size | Duration |
|--------------|----------|
| Small (icons, badges) | 100-200ms |
| Medium (cards, buttons) | 200-300ms |
| Large (modals, pages) | 300-500ms |

## Easing Functions

### Standard Easings

```
ease-out (decelerate):
- Elements ENTERING the screen
- Hover responses
- cubic-bezier(0, 0, 0.2, 1)

ease-in (accelerate):
- Elements EXITING the screen
- Quick dismissals
- cubic-bezier(0.4, 0, 1, 1)

ease-in-out:
- Elements moving WITHIN the screen
- State changes
- cubic-bezier(0.4, 0, 0.2, 1)

linear:
- Progress indicators
- Continuous rotation
```

### Visual Representation

```
ease-out:          ease-in:           ease-in-out:
╱╱                       ╱╱           ╭────╮
  ╲                    ╱             ╱      ╲
    ╲                ╱              ╱        ╲
      ───────     ───            ───          ───
```

### Expressive Easings

```css
/* Bounce - playful overshoot */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Spring - natural settle */
--ease-spring: cubic-bezier(0.25, 0.46, 0.45, 0.94);

/* Smooth - Material Design standard */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

## Animation Types

### Micro-interactions

```
Button Press:
Default → Pressed → Released
         scale(0.95) + darker

Toggle Switch:
●───────────── → ──────────────●
  200ms ease-out

Checkbox Check:
[ ] → [✓]
  stroke-dashoffset animation, 200ms
```

### Transitions

```
Modal Open:
- Backdrop: fade in 200ms
- Modal: scale(0.95) → scale(1) + opacity, 300ms ease-out
- Focus: first focusable element

Modal Close:
- Modal: fade out 200ms ease-in
- Backdrop: fade out 150ms
```

### Loading States

```
Spinner:
- rotate 360deg
- 1s linear infinite

Skeleton Shimmer:
- background-position animation
- 1.5s ease infinite

Progress:
- width transition
- 200ms ease-out
```

## CSS Implementation

### Custom Properties

```css
:root {
  /* Durations */
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;

  /* Easings */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Common Patterns

```css
/* Button interaction */
.button {
  transition:
    transform var(--duration-instant) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}
.button:hover {
  transform: translateY(-1px);
}
.button:active {
  transform: scale(0.98);
}

/* Card hover */
.card {
  transition:
    box-shadow var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

/* Modal */
.modal {
  opacity: 0;
  transform: scale(0.95);
  transition:
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}
.modal.open {
  opacity: 1;
  transform: scale(1);
}
```

### GPU-Accelerated Properties

```css
/* Prefer these for smooth animations */
.animated {
  /* Good - GPU accelerated */
  transform: translateX(100px);
  opacity: 0.5;

  /* Avoid - triggers layout/paint */
  /* width, height, margin, padding, left, top */
}

/* Force GPU acceleration */
.smooth {
  transform: translateZ(0);
  will-change: transform, opacity;
}
```

## Accessibility

### Reduced Motion

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Alternative: reduce, don't remove */
@media (prefers-reduced-motion: reduce) {
  .card {
    transition-duration: 0.01ms;
    /* Keep functionality, remove motion */
  }
}
```

### Guidelines

- Never rely on animation alone to convey information
- Provide static alternatives for animated content
- Avoid rapid flashing (< 3 per second)
- Allow users to pause infinite animations

## Best Practices

### Do

- Use animation to provide feedback
- Keep animations short (< 500ms for most)
- Use ease-out for elements entering
- Test on lower-end devices
- Respect reduced motion preferences

### Don't

- Animate for decoration only
- Use slow animations that delay users
- Animate many elements simultaneously
- Use jarring or bouncy effects for serious UI
- Block user interaction during animations

## Testing

```css
/* Slow motion for debugging */
.debug-animations * {
  transition-duration: 2s !important;
  animation-duration: 2s !important;
}
```

---

## Animation Constraints

### MUST
- Animate only compositor properties: `transform`, `opacity`
- Respect `prefers-reduced-motion` — provide reduced-motion variant
- Pause looping animations when off-screen (use Intersection Observer)
- Make animations interruptible by user input
- Explicitly list properties in `transition` (never use `transition: all`)

### NEVER
- Animate layout properties: `width`, `height`, `top`, `left`, `margin`, `padding`
- Exceed 200ms for interaction feedback (hover, press, toggle)
- Use `transition: all` — explicitly list only intended properties
- Apply `will-change` outside of active animation (add on hover/focus, remove after)
- Animate large `blur()` or `backdrop-filter` surfaces
- Introduce custom easing curves unless explicitly requested
- Animate large images or full-screen surfaces
- Add animation unless it is explicitly requested or serves clear purpose

### SHOULD
- Use `ease-out` on entrance, `ease-in` on exit
- Avoid animating paint properties (`background-color`, `color`) except for small UI
- Prefer CSS > Web Animations API > JavaScript libraries (motion/react)
- Set correct `transform-origin` — anchor motion to where it "physically" starts

---

## SVG Animation

### Transform Wrappers
```xml
<!-- ❌ Bad - transform-origin issues in Safari -->
<svg>
  <circle class="animate-spin" />
</svg>

<!-- ✅ Good - wrap in <g> element -->
<svg>
  <g class="animate-spin" style="transform-box: fill-box; transform-origin: center;">
    <circle />
  </g>
</svg>
```

### Rules
- Apply CSS transforms/animations to `<g>` wrappers, not directly to shapes
- Set `transform-box: fill-box` for predictable origin
- Set `transform-origin: center` explicitly
- Safari has historical bugs with transform-origin on SVG elements

---

## Text Animation

### Anti-aliasing Issues
```css
/* Scaling text can change smoothing/anti-aliasing */
/* Prefer animating a wrapper instead of text directly */

/* ❌ May cause rendering artifacts */
.text-scale {
  transition: transform 200ms;
}
.text-scale:hover {
  transform: scale(1.05);
}

/* ✅ Wrap text and animate wrapper */
.text-wrapper {
  display: inline-block;
  transform: translateZ(0); /* Force layer */
  transition: transform 200ms;
}
```

### Fixes
- Animate a wrapper element instead of text node
- If artifacts persist, use `translateZ(0)` or `will-change: transform` to promote to GPU layer
- For letter-spacing animations, use `letter-spacing` (paint) sparingly

---

## Performance Optimization

### will-change Usage
```css
/* ❌ Bad - always applied */
.card {
  will-change: transform;
}

/* ✅ Good - only when needed */
.card:hover,
.card:focus-within {
  will-change: transform;
}

/* ✅ Also good - JavaScript control */
card.addEventListener('mouseenter', () => {
  card.style.willChange = 'transform';
});
card.addEventListener('transitionend', () => {
  card.style.willChange = 'auto';
});
```

### Avoid Expensive Operations
```css
/* ❌ Expensive - large blur surfaces */
.hero-blur {
  backdrop-filter: blur(20px);
  transition: backdrop-filter 300ms;
}

/* ❌ Expensive - animating shadows */
.card {
  transition: box-shadow 300ms;
}

/* ✅ Use pseudo-element for shadow animation */
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  opacity: 0;
  transition: opacity 300ms;
}
.card:hover::after {
  opacity: 1;
}
```

### Off-screen Animation Pause
```javascript
// Pause animations when element not visible
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.style.animationPlayState =
      entry.isIntersecting ? 'running' : 'paused';
  });
});
observer.observe(animatedElement);
```

---

## Common Mistakes

```
❌ Too long: 800ms for simple hover
✓ Better: 150-200ms

❌ Wrong easing: ease-in for enter
✓ Better: ease-out for enter

❌ Too many: Everything animates
✓ Better: Purposeful, key elements only

❌ Ignoring preferences: No reduced-motion
✓ Better: Always include media query

❌ Using transition: all
✓ Better: transition: transform 200ms, opacity 200ms

❌ Always applying will-change
✓ Better: Add on interaction, remove after transition

❌ Animating width/height
✓ Better: Animate transform: scale() instead
```
