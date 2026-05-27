# Interaction Patterns

Touch gestures, drag-and-drop, swipe, keyboard navigation, hover, and cross-platform considerations.

For advanced patterns (focus management, loading states, tooltips, URL state, scroll, autofocus), see `ADVANCED_INTERACTIONS.md`.

## Touch Gestures

### Primary Gestures

```
Tap:
●  →  ○
Duration: < 300ms
Use for: Button activation, selection, navigation

Double Tap:
● ● → Action
Gap: < 300ms
Use for: Zoom, like/favorite, edit mode

Long Press:
●━━━━━━ (500ms) → Action
Use for: Context menu, drag initiation, preview
Feedback: Haptic/visual at threshold
```

### Navigation Gestures

```
Swipe:
●━━━━━━━━━→
Minimum: 30-50px
Use for: Page navigation, dismiss, reveal actions

Pan:
    ↗
●━━━━→
    ↘
Use for: Scrolling, canvas navigation, map panning

Edge Swipe:
←┃ (from left edge)
Use for: Back navigation (iOS pattern)
Start: Within 20-30px of edge
```

### Transform Gestures

```
Pinch:
●       ●
  ╲   ╱
    ╳
  ╱   ╲
●       ●
Use for: Zoom in/out, scale objects

Rotate:
●      ●
 ╲    ╱
  ╲  ╱
   ○ ← pivot
Use for: Image rotation, object manipulation
```

## Drag and Drop

### Lifecycle

```
1. Idle          - Default state
2. Drag Start    - User initiates (long press on touch)
3. Dragging      - Item follows cursor
4. Drag Over     - Hovering over drop zone
5. Drop          - User releases
6. Drop Effect   - Item settles into position
```

### Visual States

```
Draggable (idle):
┌────────────────────────────────────┐
│ ⋮⋮  Item content                   │
└────────────────────────────────────┘

Dragging:
┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐ ← Placeholder
┆                                    ┆

       ┌────────────────────────────────────┐
       │ ⋮⋮  Item content                   │ ← Ghost
       └────────────────────────────────────┘
         opacity: 0.8, slight rotation, shadow

Valid drop target:
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│      Drop here                      │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
  dashed border, accent background

Invalid drop target:
  ⊘ cursor: not-allowed
```

### Drop Position Indicators

```
Insert before:
─────────────────────────  ← Blue line
┌────────────────────────┐
│ Item A                 │
└────────────────────────┘

Insert after:
┌────────────────────────┐
│ Item A                 │
└────────────────────────┘
─────────────────────────  ← Blue line

Insert into container:
┌────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░ │ ← Highlighted
│ ░░░  Folder A     ░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────┘
```

## Swipe Actions

### List Item Swipe

```
← Swipe left (destructive):
┌────────────────────────┬───────┬───────┐
│     List Item          │Archive│Delete │
└────────────────────────┴───────┴───────┘

→ Swipe right (positive):
┌───────┬────────────────────────────────┐
│ Done  │     List Item                  │
└───────┴────────────────────────────────┘

Full swipe for primary action:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ →
                    ✓ Archived
```

### Pull to Refresh

```
States:
1. Pulling    - Arrow rotates with pull distance
2. Triggered  - "Release to refresh"
3. Refreshing - Spinner
4. Complete   - Content updates, spinner hides

┌─────────────────────────────┐
│      ↓ Pull to refresh      │
│         ◠                   │ ← Spinner
├─────────────────────────────┤
│ Content...                  │
└─────────────────────────────┘
```

## Keyboard Interactions

### Standard Shortcuts

```
Navigation:
Tab         - Move focus forward
Shift+Tab   - Move focus backward
Arrow keys  - Navigate within component
Enter       - Activate focused element
Space       - Toggle, select
Escape      - Close, cancel

Form:
Enter       - Submit form (in text field)
Tab         - Next field
Shift+Tab   - Previous field
```

### Component-Specific

```
Dropdown/Select:
↑/↓         - Navigate options
Enter/Space - Select option
Type        - Jump to matching option
Escape      - Close

Modal:
Tab         - Cycle through elements (trapped)
Escape      - Close modal
Enter       - Confirm (if focused on button)

Slider:
←/→         - Decrease/increase by step
Home        - Minimum value
End         - Maximum value
```

## Hover Interactions

### Hover States

```
Interactive elements need:
1. Visual change on hover (cursor, color)
2. Focus equivalent for keyboard
3. Sufficient hit area

Button hover:
┌─────────────┐    ┌─────────────┐
│   Default   │ →  │   Hover     │
└─────────────┘    └─────────────┘
                   darker/lighter bg
                   cursor: pointer
```

### Hover-Triggered Content

```
Tooltip:
       ┌───────────────────┐
       │ Helpful info      │
       └───────────────────┘
              ▼
         [Element]

Timing:
- Show delay: 200-500ms
- Hide delay: 100-200ms
- Prevents flicker on quick mouse moves
```

## Accessibility

### Touch Alternatives

```
Every gesture needs a non-gesture alternative:

Swipe to delete  → Button in overflow menu
Pinch to zoom    → Zoom buttons (+/-)
Pull to refresh  → Refresh button
Drag to reorder  → Move up/down buttons
```

### Keyboard Alternatives

```
All mouse interactions need keyboard support:

Click        → Enter or Space
Right-click  → Application key or Shift+F10
Hover        → Focus
Drag         → Arrow keys + modifier
```

### Touch Targets

```
Minimum size: 44 x 44 pixels
Spacing between targets: 8px minimum
Exception: Inline text links

┌──────────────────┐
│                  │
│     Button       │  ← At least 44px tall
│                  │
└──────────────────┘
```

## Platform Considerations

### iOS

```
- Back gesture from left edge (respect this)
- Control Center from top-right
- Home indicator area at bottom
- Reachability (swipe down on home indicator)
- 44pt touch targets
```

### Android

```
- Back button/gesture (system-level)
- Edge swipe for back (Android 10+)
- Notification shade from top
- 48dp touch targets (recommended)
```

### Web

```
- Browser navigation gestures
- Pull to refresh (browser native on some)
- Pinch zoom (browser native)
- Use touch-action CSS to customize
```

## Feedback Guidelines

### Visual Feedback

```
Immediate (< 100ms):
- Hover state change
- Button press effect
- Focus ring

Short (100-300ms):
- State transitions
- Selection changes
- Toggle animations

Longer (300ms+):
- Loading indicators
- Success confirmations
- Complex transitions
```

### Haptic Feedback (Mobile)

```
Light impact:   Selection, toggle
Medium impact:  Action triggered
Heavy impact:   Significant action

Use for:
- Threshold reached (long press ready)
- Action confirmed
- Edge of scrollable content
```

## Best Practices

1. **Be consistent** — Same gesture = same action everywhere
2. **Provide feedback** — Visual + haptic for touch
3. **Support alternatives** — Every gesture has button fallback
4. **Respect platform** — Don't override system gestures
5. **Test on devices** — Emulators miss nuances

---

## See Also

- **ADVANCED_INTERACTIONS.md** — Focus management, loading states, tooltips, URL state, scroll, autofocus
- **COMPONENT_BEHAVIOR.md** — Component-level behavior rules
- **WCAG.md** — Accessibility requirements
- **VIEWPORT.md** — Viewport and browser coordination
