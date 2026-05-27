# Advanced Interaction Patterns

Focus management, loading states, tooltips, URL state, scroll behavior, clean drag, and autofocus.

For core interactions (touch, drag-drop, swipe, keyboard, hover, platform), see `INTERACTION_PATTERNS.md`.

---

## Focus Management

### Visibility
- Every focusable element MUST show a visible focus ring
- Prefer `:focus-visible` over `:focus` to avoid distracting pointer users
- Use `:focus-within` for grouped controls (e.g., search input with button)
- Focus indicators MUST have 3:1 contrast ratio minimum

### Focus Trapping
- Modals and drawers MUST trap focus inside
- Move focus to first focusable element on open
- Return focus to trigger element on close
- Follow WAI-ARIA Authoring Patterns for focus management

```tsx
function Modal({ isOpen, onClose, children }: ModalProps) {
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      firstFocusableRef.current?.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    triggerRef.current?.focus(); // Return focus to trigger
  };

  return isOpen ? (
    <FocusTrap>
      <dialog>
        <button ref={firstFocusableRef}>Close</button>
        {children}
      </dialog>
    </FocusTrap>
  ) : null;
}
```

### Hit Target Matching
- If visual target < 24px, expand hit target to ≥24px
- Use padding or pseudo-elements, not just visual size
- Mobile minimum: 44×44px touch targets
- No dead zones — if it looks interactive, it must be interactive

```css
/* Expand small icon buttons */
.icon-button {
  position: relative;
  width: 16px;
  height: 16px;
}

.icon-button::after {
  content: '';
  position: absolute;
  inset: -14px; /* Expand to 44px touch target */
}
```

---

## Loading States

### Timing

```
Minimum loading-state duration:
- Show delay: 150-300ms (prevents flash for fast responses)
- Minimum visible: 300-500ms (prevents flicker)
- React <Suspense> handles this automatically
```

### Button Loading
- Show loading indicator AND keep original label visible
- Disable button during in-flight request
- Example: "Save" → spinner + "Save" (not just spinner)

```tsx
<Button disabled={isPending}>
  {isPending && <Spinner className="mr-2 h-4 w-4" aria-hidden />}
  {isPending ? 'Saving…' : 'Save'}
</Button>
```

### Skeleton Loading
- Skeletons MUST mirror final content exactly
- Match heights, widths, and spacing of real content
- Prevents layout shift (CLS)
- Use structural skeletons, not generic placeholders

```tsx
// Good: mirrors real content shape
function PostSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse" />
      <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
      <div className="h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
    </div>
  );
}
```

### Progress Indicators

```
Unknown duration:  Spinner
Known progress:    Progress bar with percentage
Content loading:   Skeleton matching content shape
Background task:   Toast or status indicator
```

---

## Tooltip Behavior

### Timing

```
First tooltip in group:   200-500ms delay
Subsequent peer tooltips: No delay (instant)
Hide delay:               100-200ms
```

### Positioning
- Auto-position based on viewport (above/below/left/right)
- Flip to opposite side if insufficient space
- Never clip outside viewport

### Accessibility
- MUST be keyboard accessible (focus trigger shows tooltip)
- Use `aria-describedby` to associate tooltip with trigger
- Dismiss on mouse leave, focus leave, or Escape key
- Touch: show on long-press or tap (not hover)

```tsx
function Tooltip({ content, children }: TooltipProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <span
        aria-describedby={visible ? id : undefined}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        {children}
      </span>
      {visible && (
        <div id={id} role="tooltip">{content}</div>
      )}
    </div>
  );
}
```

---

## Advanced Keyboard Patterns

### Form Submission

```
Single text input:      Enter submits form
Multiple inputs:        Enter on last field submits
Textarea:               Enter = newline, ⌘/Ctrl+Enter submits
Search input:           Enter triggers search
```

### Internationalization
- Locale-aware shortcuts for non-QWERTY layouts
- Show platform-specific symbols (⌘ vs Ctrl)
- Don't rely on letter positions (Z for undo fails on AZERTY)
- Test keyboard shortcuts with international layouts

### Command Palettes

```
Open:     ⌘K (Mac) / Ctrl+K (Win)
Navigate: ↑/↓ arrow keys
Select:   Enter
Close:    Escape
Search:   Start typing (auto-focus input)
```

---

## URL State Management

### Persist in URL
- Filters and search queries
- Tab/panel selection
- Pagination (page number, sort order)
- Expanded/collapsed sections
- Modal open state (if deep-linkable)

### Requirements
- **Share**: Copy URL shares exact state
- **Refresh**: Page reload preserves state
- **Back/Forward**: Browser navigation works correctly
- **Bookmarks**: Users can save specific views

### Implementation
- Use URL search params for filters: `?status=active&sort=date`
- Use hash for in-page state: `#section-name`
- Deep-link everything that uses `useState`
- Consider libraries like `nuqs` for React

---

## Clean Drag Interactions

### During Drag
- Disable text selection while dragging
- Apply `inert` attribute to prevent accidental interaction
- Selection/hover states don't occur simultaneously
- Ghost element follows cursor with slight offset

### Cursor States

```
Idle:         grab (open hand)
Dragging:     grabbing (closed hand)
Over valid:   copy/move (based on action)
Over invalid: not-allowed
```

### Performance
- Use `transform` for positioning (not `top/left`)
- Request animation frame for smooth tracking
- Consider `will-change: transform` during drag only
- Clean up `will-change` after drop

---

## Scroll Behavior

### Position Persistence
- Scroll positions MUST persist on Back/Forward navigation
- Restore scroll after async content loads
- Consider scroll restoration API

### Anchored Headings

```css
h2, h3, h4 {
  scroll-margin-top: 80px; /* Account for sticky header */
}
```

### Overscroll Control

```css
/* Modal/drawer content */
.modal-content {
  overscroll-behavior: contain;
}
```

- Prevents body scroll when scrolling inside modal
- Prevents pull-to-refresh on modal content

### Smooth Scroll

```css
/* Apply only when no motion preference */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

---

## Autofocus Guidelines

### Desktop
- Autofocus single primary input on page load
- Search pages: focus search input
- Forms: focus first required field
- Modal with form: focus first input

### Mobile
- Rarely autofocus (keyboard opening causes layout shift)
- Only autofocus if keyboard is already open
- Consider user expectation for the screen

### Never Autofocus
- When multiple inputs compete for attention
- When autofocus would scroll past important content
- On informational pages without primary input

---

## Optimistic Updates

### When to Use
- Success is highly likely (>95%)
- Action is reversible
- Immediate feedback improves UX significantly
- Network latency is noticeable

### Pattern

```
1. Update UI immediately on user action
2. Send request to server
3. On success: Reconcile any server changes
4. On failure: Show error + roll back OR provide Undo
```

---

## See Also

- **INTERACTION_PATTERNS.md** — Touch, drag-drop, keyboard, hover patterns
- **COMPONENT_BEHAVIOR.md** — Component-level behavior rules
- **VIEWPORT.md** — Viewport units, safe areas, z-index
- **ERROR_RECOVERY.md** — Optimistic rollback patterns
