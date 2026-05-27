# Navigation Patterns

Sidebar navigation, application shell patterns, tabs, command navigation, and responsive transforms.

For higher-level IA decisions, see `INFORMATION_ARCHITECTURE.md`. For flow-level navigation, see `USER_JOURNEYS.md`.

---

## Application Shell Patterns

### Persistent Chrome

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  [Nav items...]                     [User] [Settings]│  ← always visible
├────────────┬────────────────────────────────────────────────┤
│            │                                                 │
│  Sidebar   │         Main content area                      │  ← sidebar always
│  nav       │                                                 │     visible
│            │                                                 │
└────────────┴────────────────────────────────────────────────┘

Use for: Complex apps, many sections, power users
```

### Contextual Chrome

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Project Name                              [Share] [···] │  ← context-specific
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    Content area (no persistent sidebar)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Use for: Focused tasks (editor, checkout, setup wizard)
When: The current screen has one primary context
```

### Minimal Chrome

```
┌─────────────────────────────────────────────────────────────┐
│                        Content                              │
│                         only                               │  ← no nav visible
│                                                             │
└─────────────────────────────────────────────────────────────┘

Use for: Full-screen experiences (presentations, immersive tools)
Access nav via: Escape key, overlay trigger
```

---

## Sidebar Navigation

### Anatomy

```
┌─────────────────────┐
│ [Logo]              │  ← brand
├─────────────────────┤
│ ○ Dashboard         │  ← primary items (with icon + label)
│ ● Projects          │  ← active item (filled indicator)
│ ○ Team              │
│ ○ Reports           │
├─────────────────────┤
│ ─ Label ──────────  │  ← optional section divider
│ ○ Integrations      │
│ ○ API               │
├─────────────────────┤  ← push remaining items to bottom
│ ○ Help              │
│ [Avatar] John S.    │  ← user + account
└─────────────────────┘
```

### Nested Navigation

```
Top level:
○ Projects

On expansion:
▼ Projects
    ○ All Projects
    ○ Shared with me
    ○ Archived

Rules:
- Max 2 levels deep in sidebar
- Expand on click (accordion, not hover)
- Persist expanded state per session
- Show parent as active when child is selected
```

### Collapsible Sidebar

```
Expanded (200px):           Collapsed (56px):
┌────────────────────┐      ┌──────┐
│ [Logo] App Name    │      │ [●]  │
├────────────────────┤      ├──────┤
│ ○ Dashboard        │      │  ○   │
│ ● Projects         │      │  ●   │
│ ○ Team             │      │  ○   │
└────────────────────┘      └──────┘

Collapsed rules:
- Icons only — labels shown on hover tooltip
- Keep icon consistent with expanded label
- Preserve active indicator on icon
- Toggle button at top or bottom
```

### Active State Propagation

```tsx
// Active state bubbles up to parent when child is active
function NavItem({ href, label, children }) {
  const { pathname } = useLocation();
  const isActive = pathname === href;
  const hasActiveChild = children?.some(child =>
    pathname.startsWith(child.href)
  );

  return (
    <li>
      <a
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'nav-item',
          (isActive || hasActiveChild) && 'nav-item--active'
        )}
      >
        {label}
      </a>
      {hasActiveChild && (
        <ul>
          {children.map(child => (
            <NavItem key={child.href} {...child} />
          ))}
        </ul>
      )}
    </li>
  );
}
```

---

## Tab Navigation

### Top Tabs

```
┌──────────┬──────────┬──────────┬──────────┐
│ Overview │ Activity │ Members  │ Settings │
└──────────┴──────────┴──────────┴──────────┘  ← underline on active
│                                              │
│  Tab content                                 │
└──────────────────────────────────────────────┘

Rules:
- Use for switching between views of same content
- 2–7 tabs maximum (use overflow menu for more)
- Persist tab selection in URL: ?tab=activity
- Don't use for navigation between pages
```

### Bottom Tab Bar (Mobile)

```
┌──────────────────────────────────────────┐
│                                          │
│              Content                     │
│                                          │
├──────────────────────────────────────────┤
│  ○        ○        ●        ○        ○  │
│ Home    Search  Activity  Profile  More  │
└──────────────────────────────────────────┘

Rules:
- 3–5 items maximum
- Most important destinations first
- Icons + labels (labels required for a11y)
- Badge for unread counts
- "More" drawer for overflow (> 5 items)
```

### Tab Accessibility

```html
<div role="tablist" aria-label="Project sections">
  <button
    role="tab"
    aria-selected="true"
    aria-controls="panel-overview"
    id="tab-overview"
  >
    Overview
  </button>
  <button
    role="tab"
    aria-selected="false"
    aria-controls="panel-activity"
    id="tab-activity"
    tabindex="-1"
  >
    Activity
  </button>
</div>

<div
  role="tabpanel"
  id="panel-overview"
  aria-labelledby="tab-overview"
>
  <!-- Overview content -->
</div>
```

```
Keyboard behavior for tabs:
→/←: Move between tabs
Enter/Space: Select focused tab
Home: First tab
End: Last tab
```

---

## Mega Menu

```
┌───────────────────────────────────────────────────────────────┐
│ Logo  [Products ▼]  Solutions  Pricing  Support                │
├───────────────────────────────────────────────────────────────┤
│ ┌───────────────┬───────────────┬───────────────┬───────────┐ │
│ │ By Team       │ By Use Case   │ Platform      │ Featured  │ │
│ ├───────────────┼───────────────┼───────────────┤           │ │
│ │ • Designers   │ • Onboarding  │ • Web         │ [Image]   │ │
│ │ • Developers  │ • Dashboards  │ • Mobile      │           │ │
│ │ • Marketing   │ • Analytics   │ • API         │ New: v4.0 │ │
│ └───────────────┴───────────────┴───────────────┴───────────┘ │
└───────────────────────────────────────────────────────────────┘

Rules:
- Only for desktop — use drill-down on mobile
- Open on click (not hover) for accessibility
- Close on Escape, click outside, or focus leaving menu
- Treat as a modal for focus management
```

---

## Breadcrumbs in SPAs

```tsx
function Breadcrumbs() {
  const { pathname } = useLocation();

  // Build breadcrumb trail from current route
  const crumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, i) => ({
      label: formatSegment(segment),
      href: '/' + segments.slice(0, i + 1).join('/'),
    }));
  }, [pathname]);

  if (crumbs.length <= 1) return null; // Don't show single breadcrumb

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <a href="/" aria-label="Home">
            <HomeIcon className="h-4 w-4" aria-hidden />
          </a>
        </li>
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1">
            <ChevronRightIcon className="h-3 w-3 text-gray-400" aria-hidden />
            {i === crumbs.length - 1 ? (
              <span aria-current="page">{crumb.label}</span>
            ) : (
              <a href={crumb.href}>{crumb.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

---

## Command Navigation (⌘K)

```
Trigger: ⌘K (Mac) / Ctrl+K (Win)

┌──────────────────────────────────────────────────────┐
│ 🔍  Go to or search…                                 │
├──────────────────────────────────────────────────────┤
│ Recent pages                                         │
│   📄  Q4 Campaign Brief                              │
│   📁  Design System                                  │
├──────────────────────────────────────────────────────┤
│ Actions                                              │
│   ➕  New project                          ⌘N        │
│   👤  Invite team member                            │
│   ⚙️   Open settings                       ⌘,        │
├──────────────────────────────────────────────────────┤
│ Navigate                                             │
│   🏠  Dashboard                                      │
│   📊  Analytics                                      │
└──────────────────────────────────────────────────────┘

Rules:
- Keyboard shortcut shown next to items
- Fuzzy matching on labels
- Group by type with section headers
- Arrow keys to navigate, Enter to select, Escape to close
```

---

## Responsive Transforms

### Desktop Sidebar → Mobile Bottom Bar

```
Desktop (≥ 768px):               Mobile (< 768px):
┌────────┬──────────────┐        ┌─────────────────────┐
│        │              │        │                     │
│ Sidebar│   Content    │   →    │     Content         │
│        │              │        │                     │
└────────┴──────────────┘        ├─────────────────────┤
                                 │ Home Proj Team  ··· │
                                 └─────────────────────┘
```

### Desktop Tabs → Mobile Select

```tsx
function ResponsiveTabs({ tabs, activeTab, onChange }) {
  const isMobile = useMediaQuery('(max-width: 640px)');

  if (isMobile) {
    return (
      <select
        value={activeTab}
        onChange={e => onChange(e.target.value)}
        aria-label="Select section"
      >
        {tabs.map(tab => (
          <option key={tab.id} value={tab.id}>{tab.label}</option>
        ))}
      </select>
    );
  }

  return (
    <div role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeTab}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

---

## Navigation Accessibility

```
Required:
- Skip link to main content (first element in body)
- aria-label on all <nav> elements
- aria-current="page" on active link
- Keyboard navigable without mouse

Skip link:
<a href="#main" class="skip-link sr-focus-visible">
  Skip to main content
</a>

Multiple navs:
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Breadcrumb">...</nav>
<nav aria-label="Page navigation">...</nav>
```

---

## Checklist

- [ ] Application shell pattern chosen for context
- [ ] Sidebar has clear active state with `aria-current`
- [ ] Nested nav max 2 levels deep
- [ ] Tabs use ARIA tablist/tab/tabpanel roles
- [ ] Tab selection persisted in URL
- [ ] Breadcrumbs present for deep hierarchies
- [ ] Command palette triggers with ⌘K / Ctrl+K
- [ ] Responsive transforms defined for mobile
- [ ] Skip link present as first focusable element

---

## See Also

- **INFORMATION_ARCHITECTURE.md** — IA strategy and structure
- **USER_JOURNEYS.md** — Navigation flow patterns
- **RESPONSIVE_STRATEGY.md** — Responsive navigation transforms
- **WCAG.md** — Navigation accessibility requirements
- **ADVANCED_INTERACTIONS.md** — Focus management for menus
