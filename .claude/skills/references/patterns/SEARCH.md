# Search Patterns

Search inputs, autocomplete, results display, faceted filtering, no-results states, and command palettes.

---

## Search Input Patterns

### Persistent vs Expandable

```
Persistent (always visible):
┌─────────────────────────────────────────────────────┐
│ 🔍  Search projects…                                │
└─────────────────────────────────────────────────────┘
Use for: Search is primary action, content-heavy apps

Expandable (icon that opens):
[🔍] → [🔍 ____________________ ]
Use for: Space-constrained headers, secondary search
Problem: Harder to discover — prefer persistent where possible
```

### Search Input Anatomy

```
┌─────────────────────────────────────────────┐
│ 🔍  Search…                            [×] │
└─────────────────────────────────────────────┘
 ↑                                        ↑
 Leading icon                         Clear button
 (decorative, aria-hidden)             (show only when has value)
```

```tsx
function SearchInput({ value, onChange, onClear, placeholder }) {
  return (
    <div className="relative">
      <SearchIcon
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search…'}
        className="w-full pl-9 pr-9 py-2 border rounded-md"
        aria-label="Search"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label="Clear search"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
```

---

## Autocomplete & Suggestions

### Suggestion Types

```
┌─────────────────────────────────────────────────┐
│ 🔍 project                                      │
├─────────────────────────────────────────────────┤
│ 🕐 My Project (Recent)                          │  ← recent
│ 🕐 Project Alpha (Recent)                       │
│ ─────────────────────────────                  │
│ 📄 project-brief.pdf                            │  ← result
│ 📁 Projects > Q4 Campaign                       │  ← result
│ ─────────────────────────────                  │
│ 🔍 Search for "project"                         │  ← full search
└─────────────────────────────────────────────────┘
```

### Debounced Input

```tsx
function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function SearchWithSuggestions() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions', debouncedQuery],
    queryFn: () => fetchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });
}
```

### Cancelling Previous Requests

```tsx
const abortControllerRef = useRef<AbortController | null>(null);

async function fetchSuggestions(query: string) {
  // Cancel previous request
  abortControllerRef.current?.abort();
  abortControllerRef.current = new AbortController();

  const response = await fetch(`/api/suggest?q=${query}`, {
    signal: abortControllerRef.current.signal,
  });

  return response.json();
}
```

---

## Search Results Layout

### List vs Grid

```
List layout (search results, files, records):
┌────────────────────────────────────────────────┐
│ [thumb] Title — matching excerpt highlight     │
│         Subtitle · meta                        │
├────────────────────────────────────────────────┤
│ [thumb] Title — matching excerpt highlight     │
└────────────────────────────────────────────────┘

Grid layout (images, products, visual content):
┌──────────┬──────────┬──────────┐
│ [image]  │ [image]  │ [image]  │
│ Title    │ Title    │ Title    │
└──────────┴──────────┴──────────┘
```

### Highlighting Matches

```tsx
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <span>{text}</span>;

  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-100 text-yellow-900">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
```

### Relevance Indicators

```
Sort options:
○ Most relevant  ←  default
○ Newest first
○ Alphabetical

Showing 47 results for "project"
```

---

## Faceted Search

```
┌─────────────────┬───────────────────────────────────────┐
│ Filters         │ 47 results                            │
│                 │                                       │
│ Type            │ Applied: [Status: Active ×] [Clear]   │
│ □ Document (23) │                                       │
│ □ Image (15)    │ ┌──────────────────────────────────┐  │
│ □ Video (9)     │ │ Result 1                         │  │
│                 │ │ Result 2                         │  │
│ Status          │ └──────────────────────────────────┘  │
│ ☑ Active (32)   │                                       │
│ □ Archived (15) │                                       │
│                 │                                       │
│ Date Modified   │                                       │
│ ○ Any time      │                                       │
│ ○ Last 7 days   │                                       │
│ ○ Last 30 days  │                                       │
└─────────────────┴───────────────────────────────────────┘
```

### Filter Implementation

```tsx
// Persist filters in URL for shareability
const [searchParams, setSearchParams] = useSearchParams();

const filters = {
  type: searchParams.getAll('type'),
  status: searchParams.getAll('status'),
  dateRange: searchParams.get('date') ?? 'any',
};

function addFilter(key: string, value: string) {
  setSearchParams(prev => {
    const next = new URLSearchParams(prev);
    next.append(key, value);
    next.delete('page'); // Reset pagination on filter change
    return next;
  });
}
```

---

## No Results States

### Types of No Results

```
Empty search (no query yet):
→ Show recent searches + popular/suggested

No matches found:
┌────────────────────────────────────────┐
│                                        │
│   No results for "invoce 2023"         │
│                                        │
│   Check your spelling or try:          │
│   · "invoice 2023"                     │
│   · [Clear filters] to broaden search  │
│                                        │
└────────────────────────────────────────┘

Zero results with active filters:
"No results with current filters. [Clear all filters]"
```

---

## Command Palette

```
Trigger: ⌘K (Mac) / Ctrl+K (Win)

┌─────────────────────────────────────────────────┐
│ 🔍 Type a command or search…                    │
├─────────────────────────────────────────────────┤
│ Recent                                          │
│   📄 Q4 Campaign Brief                          │
│   ⚙️  Billing settings                          │
├─────────────────────────────────────────────────┤
│ Actions                                         │
│   ➕ New project                       ⌘N       │
│   👤 Invite team member                         │
│   📤 Export data                       ⌘E       │
├─────────────────────────────────────────────────┤
│ Navigation                                      │
│   🏠 Dashboard                                  │
│   ⚙️  Settings                         ⌘,       │
└─────────────────────────────────────────────────┘
```

### Command Palette Accessibility

```tsx
function CommandPalette({ isOpen, onClose }) {
  return (
    <dialog
      open={isOpen}
      aria-label="Command palette"
      aria-modal="true"
    >
      <input
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="command-list"
        aria-autocomplete="list"
        autoFocus
      />
      <ul id="command-list" role="listbox">
        {results.map((item, index) => (
          <li
            key={item.id}
            role="option"
            aria-selected={index === selectedIndex}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </dialog>
  );
}
```

---

## Search Accessibility

```html
<!-- Combobox pattern -->
<div role="combobox" aria-expanded="true" aria-haspopup="listbox">
  <input
    type="text"
    aria-label="Search"
    aria-controls="search-suggestions"
    aria-activedescendant="suggestion-2"
  />
</div>

<ul id="search-suggestions" role="listbox">
  <li id="suggestion-1" role="option">Suggestion 1</li>
  <li id="suggestion-2" role="option" aria-selected="true">Suggestion 2</li>
</ul>

<!-- Live region for result count -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  47 results found
</div>
```

---

## Search Analytics

Track to improve search quality:

```
Per query:
- Query text (anonymized)
- Results count
- Time to first result click
- Which result was clicked (position)
- Did user refine/abandon?

Aggregate:
- Top queries (optimize for these)
- Zero-result queries (content/feature gaps)
- Queries with high abandonment (quality issues)
- Filter usage frequency
```

---

## Checklist

- [ ] Search input has clear button when value is present
- [ ] Suggestions debounced (300ms) to reduce API calls
- [ ] Previous requests cancelled when new query starts
- [ ] Match highlighting uses `<mark>` with appropriate contrast
- [ ] Filters persist in URL for shareability
- [ ] No-results state suggests alternatives or clear filters
- [ ] Command palette opens with ⌘K / Ctrl+K
- [ ] ARIA combobox pattern for autocomplete
- [ ] Live region announces result count updates

---

## See Also

- **DATA_DISPLAY.md** — Sorting, filtering, and results display
- **ADVANCED_INTERACTIONS.md** — Command palette keyboard patterns
- **WCAG.md** — ARIA combobox requirements
- **CONTENT_MICROCOPY.md** — No-results copy patterns
