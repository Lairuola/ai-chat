# WCAG 2.1 Quick Reference Checklist

Essential accessibility criteria for design validation.

## Level A (Minimum)

### 1.1 Text Alternatives
- [ ] All images have alt text
- [ ] Decorative images have empty alt=""
- [ ] Complex images have long descriptions

### 1.2 Time-based Media
- [ ] Video has captions
- [ ] Audio has transcripts

### 1.3 Adaptable
- [ ] Information doesn't rely on sensory characteristics alone
- [ ] Meaningful reading sequence
- [ ] Instructions don't rely only on shape/color/location

### 1.4 Distinguishable
- [ ] Color not sole means of conveying info

### 2.1 Keyboard Accessible
- [ ] All functionality available via keyboard
- [ ] No keyboard traps

### 2.2 Enough Time
- [ ] Time limits can be adjusted or disabled

### 2.3 Seizures
- [ ] No content flashes more than 3 times/second

### 2.4 Navigable
- [ ] Skip to main content link
- [ ] Page has descriptive title
- [ ] Focus order is logical
- [ ] Link purpose clear from text

### 3.1 Readable
- [ ] Page language specified

### 3.2 Predictable
- [ ] Focus doesn't trigger unexpected changes
- [ ] Input doesn't trigger unexpected changes

### 3.3 Input Assistance
- [ ] Error messages identify the error
- [ ] Labels or instructions for user input

### 4.1 Compatible
- [ ] No major HTML errors

---

## Level AA (Recommended - Target This)

### 1.3 Adaptable
- [ ] Orientation not restricted
- [ ] Input purpose can be identified

### 1.4 Distinguishable
- [ ] **Text contrast: 4.5:1 minimum**
- [ ] **Large text contrast: 3:1 minimum**
- [ ] Text resizable to 200% without loss
- [ ] **Images of text: use real text instead**
- [ ] Reflow at 320px width (no horizontal scroll)
- [ ] Non-text contrast: 3:1 for UI elements
- [ ] Text spacing adjustable

### 2.4 Navigable
- [ ] Multiple ways to find pages
- [ ] Headings and labels are descriptive
- [ ] Focus visible

### 2.5 Input Modalities
- [ ] Touch target: 44x44px minimum
- [ ] Motion actuation has alternatives

### 3.1 Readable
- [ ] Language of parts specified

### 3.2 Predictable
- [ ] Consistent navigation
- [ ] Consistent identification

### 3.3 Input Assistance
- [ ] Error suggestions provided
- [ ] Error prevention for important actions

### 4.1 Compatible
- [ ] Status messages announced to assistive tech

---

## Quick Contrast Reference

```
Text Size         Background    Minimum Ratio
──────────────────────────────────────────────
Normal text       Any           4.5:1
Large text (18pt+) Any          3:1
Bold 14pt+        Any           3:1
UI components     Adjacent      3:1
Focus indicators  Adjacent      3:1
```

## Quick Touch Target Reference

```
Minimum target size: 44 x 44 pixels
Spacing between targets: 8px minimum
Exception: Inline text links
```

## Common Issues Checklist

### Images
- [ ] Meaningful images have descriptive alt
- [ ] Decorative images have alt=""
- [ ] Complex charts have data table alternative

### Forms
- [ ] All inputs have visible labels
- [ ] Required fields marked accessibly
- [ ] Error messages linked to fields
- [ ] Success/error announced to screen readers

### Navigation
- [ ] Skip link present
- [ ] Headings create logical outline
- [ ] Focus order matches visual order
- [ ] Focus always visible

### Color
- [ ] Info not conveyed by color alone
- [ ] Text meets contrast requirements
- [ ] UI elements meet contrast requirements

### Keyboard
- [ ] All interactive elements focusable
- [ ] No keyboard traps
- [ ] Custom widgets have keyboard support
