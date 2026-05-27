# Typography Reference

Comprehensive typography system guidance.

## Font Selection

### Categories
```
Serif: Traditional, editorial, luxury
- Georgia, Merriweather, Playfair Display
- Best for: Long-form content, trustworthiness

Sans-serif: Modern, clean, tech
- Inter, Roboto, SF Pro, Open Sans
- Best for: UI, digital interfaces, clarity

Monospace: Code, technical, data
- Fira Code, JetBrains Mono, Source Code Pro
- Best for: Code blocks, terminal output
```

### Font Pairing
```
Single font (safest):
- Use one font for everything
- Vary weight and size for hierarchy
- Example: Inter at multiple weights

Two fonts:
- Serif headings + Sans body
- Sans headings + Serif body
- Example: Playfair (headings) + Inter (body)
```

### System Font Stack
```css
font-family:
  'Geist',
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  sans-serif;
```

## Type Scale

### Modular Scale (1.25 ratio)
```
xs:   12px (0.75rem)   - Captions, labels
sm:   14px (0.875rem)  - Secondary text
base: 16px (1rem)      - Body text
lg:   20px (1.25rem)   - Large body
xl:   24px (1.5rem)    - H4
2xl:  32px (2rem)      - H3
3xl:  40px (2.5rem)    - H2
4xl:  48px (3rem)      - H1
5xl:  64px (4rem)      - Display
```

### Common Ratios
```
1.125 (Major Second): Subtle, conservative
1.200 (Minor Third): Modest, professional
1.250 (Major Third): Balanced, versatile ← Recommended
1.333 (Perfect Fourth): Clear, distinct
1.414 (Augmented Fourth): Strong, dramatic
```

## Hierarchy

### Heading Styles
```
Display (Hero):
- Size: 4xl-5xl (48-64px)
- Weight: Bold (700)
- Line height: 1.1-1.2
- Letter spacing: -0.02em

H1 (Page Title):
- Size: 3xl-4xl (40-48px)
- Weight: Bold (700)
- Line height: 1.2
- Letter spacing: -0.01em

H2 (Section):
- Size: 2xl-3xl (32-40px)
- Weight: SemiBold (600)
- Line height: 1.3

H3 (Subsection):
- Size: xl-2xl (24-32px)
- Weight: SemiBold (600)
- Line height: 1.4

H4 (Minor):
- Size: lg-xl (20-24px)
- Weight: SemiBold (600)
- Line height: 1.5
```

### Body Styles
```
Body Large:
- Size: lg (18-20px)
- Weight: Normal (400)
- Line height: 1.6-1.8

Body (Primary):
- Size: base (16px)
- Weight: Normal (400)
- Line height: 1.5-1.75

Body Small:
- Size: sm (14px)
- Weight: Normal (400)
- Line height: 1.5

Caption/Label:
- Size: xs-sm (12-14px)
- Weight: Medium (500)
- Line height: 1.4
```

## Readability

### Line Height (Leading)
```
Headings: 1.1-1.3 (tighter)
Body text: 1.5-1.75 (optimal)
Small text: 1.4-1.5

Relationship:
- Longer lines → More line height
- Shorter lines → Less line height
```

### Line Length (Measure)
```
Optimal: 50-75 characters
Ideal: 65 characters
Minimum: 45-50 characters
Maximum: 75-85 characters

Implementation:
max-width: 65ch;
```

### Letter Spacing (Tracking)
```
Large headings: -0.02em to -0.01em
Body text: 0 (default)
All caps text: 0.05em to 0.1em
Small caps/labels: 0.02em to 0.05em
```

## Font Weights
```
Available:
100 Thin (rare)
200 ExtraLight (rare)
300 Light
400 Normal/Regular ← Body text
500 Medium ← Labels, emphasis
600 SemiBold ← Headings
700 Bold ← Strong headings
800 ExtraBold (rare)
900 Black (rare)

Recommended subset:
- 400 Normal (body)
- 500 Medium (labels)
- 600 SemiBold (headings)
- 700 Bold (emphasis)
```

## Contrast

### WCAG Requirements
```
Body text: 4.5:1 minimum
Large text (18pt+): 3:1 minimum
Bold 14pt+: 3:1 minimum

Examples:
#333333 on #FFFFFF = 12.6:1 ✓
#666666 on #FFFFFF = 5.7:1 ✓
#999999 on #FFFFFF = 2.8:1 ✗
```

### Tips
```
Avoid: Pure black (#000) on pure white (#FFF)
Better: Dark gray (#333) on white (#FFF)
Or: Black on off-white (#000 on #FAFAFA)
```

## CSS Implementation

```css
:root {
  /* Font families */
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: 'Geist Mono', monospace;

  /* Font sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}

/* Responsive typography */
h1 {
  font-size: clamp(2rem, 5vw, 3rem);
}

body {
  font-size: clamp(1rem, 2vw, 1.125rem);
}
```

---

## CSS Typography Features

### Text Wrapping
```css
/* Headings - balanced line breaks */
h1, h2, h3 {
  text-wrap: balance;
}

/* Body text - prevent orphans */
p {
  text-wrap: pretty;
}
```
- `text-balance`: Equalizes line lengths in headings
- `text-pretty`: Prevents single-word orphans at end of paragraphs
- Both improve visual quality without manual intervention

### Numeric Display
```css
/* Data tables, comparisons, prices */
.data-cell,
.price,
.stats {
  font-variant-numeric: tabular-nums;
}
```
- `tabular-nums`: Equal-width numerals for alignment
- Use for: prices, statistics, tables, countdowns
- Alternative: Use monospace font (Geist Mono) for numeric data

### Truncation
```css
/* Single line truncation */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Multi-line truncation */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```
- Use `truncate` or `line-clamp-*` for dense UI
- ALWAYS provide full text via tooltip or expansion
- Never truncate without access to full content

### Letter Spacing Rules
```
NEVER modify letter-spacing (tracking-*) unless explicitly requested
```
- Default tracking is optimized by type designers
- Arbitrary tracking changes reduce readability
- Exception: ALL CAPS text may need +0.05em to +0.1em

### Special Characters
```
Typography:
" " (curly quotes) not " " (straight quotes)
'  ' (curly apostrophes) not ' (straight)
…   (ellipsis) not ... (three periods)
–   (en-dash) for ranges: 10–20
—   (em-dash) for breaks—like this

Non-breaking spaces:
10&nbsp;MB     (keep number with unit)
⌘&nbsp;+&nbsp;K (keep shortcut together)
Vercel&nbsp;SDK (keep brand names together)

Zero-width joiner for no space:
&#x2060;
```

### Mobile Input Font Size
```css
/* Prevent iOS Safari auto-zoom on focus */
input, textarea, select {
  font-size: 16px; /* Minimum to prevent zoom */
}

/* Or use viewport meta (less recommended) */
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
```
- iOS Safari zooms when input font-size < 16px
- Always use ≥16px for form inputs on mobile
- Meta tag approach disables user zoom (accessibility concern)

### Font Loading
```css
/* Preload critical fonts */
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

/* Subset fonts - only load needed characters */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF; /* Latin only */
}
```
- Preload fonts for critical above-fold text
- Subset fonts to only characters you use
- Reduces font file size significantly

---

## Checklist

- [ ] Font stack defined
- [ ] Type scale established (6-10 sizes)
- [ ] Heading hierarchy clear (H1-H4)
- [ ] Body text 16px minimum
- [ ] Line height 1.5-1.75 for body
- [ ] Line length 50-75 characters
- [ ] Contrast meets WCAG AA (4.5:1)
- [ ] Font weights limited (3-4)
- [ ] Responsive scaling defined
- [ ] `text-balance` on headings
- [ ] `tabular-nums` on numeric data
- [ ] Mobile inputs ≥16px font-size
- [ ] Curly quotes and proper ellipsis used
