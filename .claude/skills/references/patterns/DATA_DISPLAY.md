# Data Display

Patterns for tables, lists, data visualization, sorting, filtering, pagination, and data states.

---

## Tables

### Responsive Table Strategies

```
Option 1 — Horizontal scroll (simple):
┌─────────────────────────────────────────────────────────────┐
│ Name         Status    Date        Amount   Actions         │
├─────────────────────────────────────────────────────────────┤
│ Invoice 001  Paid      2024-01-15  $240     ···             │
│ Invoice 002  Pending   2024-01-20  $150     ···             │
└─────────────────────────────────────────────────────────────┘
↔ scroll on mobile

Option 2 — Column priority (hide less important columns):
Desktop: Name | Status | Date | Amount | Actions
Mobile:  Name | Amount | ···

Option 3 — Card transform (stack on mobile):
Mobile:
┌─────────────────────────┐
│ Invoice 001             │
│ Paid  ·  Jan 15  ·  $240│
│                  [···]  │
└─────────────────────────┘
```

### Sortable Columns

```tsx
interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

function SortableHeader({
  label,
  column,
  sort,
  onSort,
}: {
  label: string;
  column: string;
  sort: SortState;
  onSort: (column: string) => void;
}) {
  const isActive = sort.column === column;
  const icon = isActive
    ? sort.direction === 'asc' ? '↑' : '↓'
    : '↕';

  return (
    <th>
      <button
        onClick={() => onSort(column)}
        aria-sort={
          isActive
            ? sort.direction === 'asc' ? 'ascending' : 'descending'
            : 'none'
        }
      >
        {label} <span aria-hidden>{icon}</span>
      </button>
    </th>
  );
}
```

### Row Actions

```
Inline actions (always visible):
┌──────────────────────────────────────────────────────────┐
│ Name         Status    Date       [Edit] [Archive]       │
└──────────────────────────────────────────────────────────┘
Use for: Primary actions, 1-2 actions per row

Overflow menu (space-efficient):
┌──────────────────────────────────────────────────────────┐
│ Name         Status    Date                         [···]│
└──────────────────────────────────────────────────────────┘
  On click: Edit / Duplicate / Archive / Delete
Use for: 3+ actions, secondary actions

Row hover reveal:
┌──────────────────────────────────────────────────────────┐
│ Name         Status    Date              [Edit] [Delete] │  ← on hover
└──────────────────────────────────────────────────────────┘
Use for: Clean layout + mouse-first UIs
Problem: Inaccessible to keyboard/touch — always add overflow too
```

### Bulk Selection

```tsx
function BulkSelectionTable() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = selected.size === items.length;
  const someSelected = selected.size > 0 && !allSelected;

  return (
    <div>
      {selected.size > 0 && (
        <div role="toolbar" aria-label="Bulk actions">
          <span>{selected.size} selected</span>
          <Button onClick={() => bulkArchive(Array.from(selected))}>
            Archive
          </Button>
          <Button onClick={() => setSelected(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected; }}
                onChange={() =>
                  setSelected(allSelected ? new Set() : new Set(items.map(i => i.id)))
                }
                aria-label="Select all"
              />
            </th>
            {/* ... headers */}
          </tr>
        </thead>
      </table>
    </div>
  );
}
```

### Inline Editing

```
Click to edit pattern:
┌──────────────────────────────────────────────────────────┐
│ [John Smith]  →  [John Smith          ] ✓ ✗             │
└──────────────────────────────────────────────────────────┘

Rules:
- Show edit affordance on hover (pencil icon or underline)
- Activate on double-click OR click on pencil icon
- Confirm with Enter or checkmark
- Cancel with Escape or X
- Show character limit if applicable
- Validate inline before saving
```

---

## Lists

### List Types

```
Flat list:
┌──────────────────────────────────────┐
│ Item 1                               │
│ Item 2                               │
│ Item 3                               │
└──────────────────────────────────────┘

Grouped list:
┌──────────────────────────────────────┐
│ Group A                              │
│   Item 1                             │
│   Item 2                             │
│ Group B                              │
│   Item 3                             │
└──────────────────────────────────────┘

Tree/nested:
┌──────────────────────────────────────┐
│ ▼ Parent                             │
│   ▶ Child (collapsed)                │
│   ▼ Child (expanded)                 │
│     ○ Grandchild 1                   │
│     ○ Grandchild 2                   │
└──────────────────────────────────────┘
```

### Virtual Scrolling

Use when list exceeds ~200 items to avoid DOM bloat:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // estimated row height in px
  });

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
              height: `${virtualItem.size}px`,
            }}
          >
            <ListItem item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Pagination

### Patterns

```
Page numbers (traditional):
← Prev  [1] [2] [3] ... [10]  Next →
Use for: Navigating to specific pages, known total count

Cursor-based (next page token):
                          Next 25 →
Use for: Real-time data, large datasets, simple forward navigation

Infinite scroll:
Content loads as user scrolls down
Use for: Feeds, galleries, social content
Problem: No footer, can't return to position — prefer "Load more" instead

Load more button:
[Load 25 more results]  (47 remaining)
Use for: Search results, batched exploration
Better than infinite scroll: preserves scroll position, user controls loading
```

### Pagination Accessibility

```html
<nav aria-label="Pagination">
  <a href="?page=1" aria-label="Go to page 1">1</a>
  <a href="?page=2" aria-current="page" aria-label="Page 2, current page">2</a>
  <a href="?page=3" aria-label="Go to page 3">3</a>
</nav>
```

---

## Sorting

### Client vs Server Sort

```
Client-side sort:
- Fast (no network)
- Use for: < 1000 items already loaded
- Problem: Only sorts loaded items, not total dataset

Server-side sort:
- Required for: paginated data, large datasets
- Pattern: Update URL → Fetch sorted data → Render
- Show loading state during sort change
```

### Multi-Column Sort

```
Primary: Name (asc)
Secondary: Date (desc)

Show in header:
┌─────────────────────────────────────────┐
│ Name ↑¹   Status   Date ↓²   Amount    │
└─────────────────────────────────────────┘
```

---

## Filtering

### Faceted Filters

```
┌─────────────┬────────────────────────────────────┐
│ Status      │ Results (47)                       │
│ □ All (47)  │                                    │
│ ☑ Active (32│ ┌────────────────────────────────┐ │
│ □ Paused (10│ │ Item                           │ │
│ □ Draft (5) │ │ Item                           │ │
│             │ └────────────────────────────────┘ │
│ Date Range  │                                    │
│ Last 7 days │                                    │
│ Last 30 days│                                    │
└─────────────┴────────────────────────────────────┘
```

### Applied Filter Chips

```
Active filters:
[Status: Active ×] [Date: Last 30 days ×] [Clear all]
```

```tsx
function FilterChips({ filters, onRemove, onClearAll }) {
  return (
    <div role="group" aria-label="Active filters">
      {filters.map(filter => (
        <span key={filter.id} className="filter-chip">
          {filter.label}
          <button
            onClick={() => onRemove(filter.id)}
            aria-label={`Remove ${filter.label} filter`}
          >
            ×
          </button>
        </span>
      ))}
      {filters.length > 0 && (
        <button onClick={onClearAll}>Clear all</button>
      )}
    </div>
  );
}
```

---

## Data States

### Loading

```
Table skeleton:
┌────────────────────────────────────────────────────┐
│ ████████████  ████████  ██████  ██████████████     │  ← animated
│ ████████████  ████████  ██████  ██████████████     │
│ ████████████  ████████  ██████  ██████████████     │
└────────────────────────────────────────────────────┘

Rules:
- Match number of skeleton rows to expected results
- Match column widths roughly to real data
- Use CSS animation (pulse/shimmer)
```

### Empty State

```
No data yet:
┌────────────────────────────────────────┐
│                                        │
│         [Empty illustration]           │
│                                        │
│     No invoices yet                    │
│   Create your first invoice to         │
│   get started.                         │
│                                        │
│         [Create Invoice]               │
│                                        │
└────────────────────────────────────────┘

No results (filtered):
┌────────────────────────────────────────┐
│                                        │
│    No results for "search term"        │
│                                        │
│  Try adjusting your filters or         │
│  [Clear filters]                       │
│                                        │
└────────────────────────────────────────┘
```

### Error State

```
┌────────────────────────────────────────┐
│                                        │
│   ⚠️  Couldn't load invoices           │
│                                        │
│   There was a problem fetching         │
│   your data. Please try again.         │
│                                        │
│           [Try Again]                  │
│                                        │
└────────────────────────────────────────┘
```

---

## When to Use Charts vs Tables

```
Use TABLES when:
- Users need exact values
- Users will compare specific data points
- Data has many dimensions/attributes
- Users need to search/filter

Use CHARTS when:
- Showing trends over time
- Comparing proportions
- Highlighting patterns
- Quick visual overview more valuable than precision

Use BOTH when:
- Dashboard context: chart for overview, table for detail
- Export: chart for presentation, table for data access
```

---

## Checklist

- [ ] Tables have responsive strategy (scroll, stack, or priority columns)
- [ ] Sort state shown in column headers with `aria-sort`
- [ ] Row actions accessible via keyboard
- [ ] Bulk selection uses indeterminate checkbox state
- [ ] Virtual scrolling used for lists > 200 items
- [ ] Empty states explain why empty + offer action
- [ ] Loading skeletons match real content shape
- [ ] Filter chips show active state, allow removal
- [ ] Pagination landmarks use `<nav>` with aria-label

---

## See Also

- **SEARCH.md** — Search and filtering patterns
- **CONTENT_MICROCOPY.md** — Empty state copy patterns
- **RESPONSIVE_STRATEGY.md** — Responsive table strategies
- **WCAG.md** — Accessible table markup
