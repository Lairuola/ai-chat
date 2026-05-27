# Color Systems Reference

Comprehensive guide to color in design systems.

## Color Scale Structure

### Numeric Scale (50-950)

```
gray-50:   #fafafa   (lightest - backgrounds)
gray-100:  #f5f5f5
gray-200:  #e5e5e5   (borders, dividers)
gray-300:  #d4d4d4
gray-400:  #a3a3a3   (placeholder text)
gray-500:  #737373   (secondary text)
gray-600:  #525252
gray-700:  #404040   (primary text)
gray-800:  #262626
gray-900:  #171717   (headings)
gray-950:  #0a0a0a   (darkest)
```

### When to Use Each Level

```
50-100:   Backgrounds, surfaces
200-300:  Borders, dividers
400-500:  Secondary/muted text, icons
600-700:  Primary text, labels
800-950:  Headings, emphasis
```

## Semantic Colors

### Status Colors

```
Success (green):
- Light: #dcfce7 (background)
- Default: #22c55e (text, icons)
- Dark: #166534 (emphasis)

Error (red):
- Light: #fee2e2 (background)
- Default: #ef4444 (text, icons)
- Dark: #991b1b (emphasis)

Warning (yellow/amber):
- Light: #fef3c7 (background)
- Default: #f59e0b (text, icons)
- Dark: #92400e (emphasis)

Info (blue):
- Light: #dbeafe (background)
- Default: #3b82f6 (text, icons)
- Dark: #1e40af (emphasis)
```

### Usage Guidelines

```
Status backgrounds:
┌─────────────────────────────────┐
│ ✓ Success message here          │ ← green-100 bg, green-700 text
└─────────────────────────────────┘

Status badges:
[Active] ← green-500 bg, white text
[Error]  ← red-500 bg, white text
```

## Brand Colors

### Primary Color Application

```
Primary (e.g., blue-600: #2563eb):
- Buttons (primary action)
- Links
- Active states
- Focus rings
- Brand accents

Usage ratio: ~10% of interface
```

### Generating a Palette from Primary

```
Given primary: #2563eb

Lighter variants (tints):
primary-50:  Add white, reduce saturation slightly
primary-100: More white
primary-200: Even more

Darker variants (shades):
primary-700: Add black, maintain saturation
primary-800: More black
primary-900: Darkest
```

## Contrast Requirements

### WCAG 2.1 Ratios

```
Text Contrast (AA level):
- Normal text: 4.5:1 minimum
- Large text (18pt+ or 14pt bold): 3:1 minimum
- UI components: 3:1 minimum

Text Contrast (AAA level):
- Normal text: 7:1 minimum
- Large text: 4.5:1 minimum
```

### Common Combinations

```
High contrast (safe):
#1a1a1a on #ffffff = 16:1 ✓
#374151 on #ffffff = 9.4:1 ✓
#ffffff on #2563eb = 4.7:1 ✓

Borderline (check carefully):
#6b7280 on #ffffff = 4.6:1 ✓ (just passes)
#9ca3af on #ffffff = 2.9:1 ✗ (fails)
```

### Checking Contrast

```
Tools:
- WebAIM Contrast Checker
- Chrome DevTools (inspect element)
- Figma contrast plugins
- axe DevTools
```

## Dark Mode

### Approach: Invert the Scale

```
Light Mode:          Dark Mode:
gray-50 (bg)    →    gray-900 (bg)
gray-100        →    gray-800
gray-700 (text) →    gray-100 (text)
gray-900 (head) →    gray-50 (head)
```

### Color Adjustments for Dark Mode

```
Don't use pure colors:
❌ #000000 background (too harsh)
✓  #0a0a0a or #121212 background

Reduce saturation slightly:
❌ blue-500 (#3b82f6) can feel too bright
✓  blue-400 (#60a5fa) works better in dark

Reduce elevation/shadows:
❌ Heavy shadows don't work on dark
✓  Use lighter surfaces or subtle borders
```

### CSS Implementation

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #2563eb;
}

[data-theme="dark"] {
  --color-bg: #0a0a0a;
  --color-text: #fafafa;
  --color-primary: #60a5fa;
}

/* Or use media query */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0a0a0a;
    --color-text: #fafafa;
  }
}
```

## Color Tokens

### Token Naming

```
Primitive tokens (raw values):
--blue-500: #3b82f6;
--gray-900: #171717;

Semantic tokens (purpose-based):
--color-text-primary: var(--gray-900);
--color-text-secondary: var(--gray-500);
--color-bg-surface: var(--gray-50);
--color-border: var(--gray-200);
--color-action-primary: var(--blue-600);

Component tokens (scoped):
--button-bg: var(--color-action-primary);
--button-text: var(--white);
```

### Token Organization

```css
:root {
  /* Primitives */
  --blue-50: #eff6ff;
  --blue-500: #3b82f6;
  --blue-600: #2563eb;

  /* Semantic */
  --color-primary: var(--blue-600);
  --color-primary-hover: var(--blue-700);
  --color-text: var(--gray-900);
  --color-text-muted: var(--gray-500);
  --color-surface: var(--white);
  --color-border: var(--gray-200);

  /* Feedback */
  --color-success: var(--green-600);
  --color-error: var(--red-600);
  --color-warning: var(--amber-500);
  --color-info: var(--blue-500);
}
```

## Color Accessibility

### Don't Rely on Color Alone

```
Bad:
[Green field] [Red field]
"Green = valid, Red = invalid"

Good:
✓ Valid     ✗ Invalid
[Field]     [Field]
            Error message below
```

### Colorblind Considerations

```
Problematic combinations:
- Red/Green (most common deficiency)
- Blue/Purple
- Green/Brown

Safe combinations:
- Blue/Orange
- Blue/Yellow
- Dark/Light of same hue
```

## Checklist

- [ ] Color scale defined (50-950 or similar)
- [ ] Semantic colors for status (success, error, warning, info)
- [ ] Primary/brand color with variants
- [ ] All text meets 4.5:1 contrast minimum
- [ ] UI elements meet 3:1 contrast minimum
- [ ] Dark mode palette defined
- [ ] Color tokens named semantically
- [ ] Color not sole indicator of information
- [ ] Tested for colorblind accessibility
