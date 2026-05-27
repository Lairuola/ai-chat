# Refactoring Patterns Reference

Common frontend refactoring patterns and techniques.

## Code Quality Refactoring

### Extract Component

```tsx
// Before: Large component with mixed concerns
function UserProfile() {
  return (
    <div>
      <div className="avatar">
        <img src={user.avatar} alt={user.name} />
        <span className="status">{user.status}</span>
      </div>
      <div className="info">
        <h2>{user.name}</h2>
        <p>{user.bio}</p>
      </div>
      {/* More UI */}
    </div>
  );
}

// After: Extracted reusable components
function Avatar({ src, alt, status }: AvatarProps) {
  return (
    <div className="avatar">
      <img src={src} alt={alt} />
      {status && <span className="status">{status}</span>}
    </div>
  );
}

function UserProfile() {
  return (
    <div>
      <Avatar src={user.avatar} alt={user.name} status={user.status} />
      <UserInfo name={user.name} bio={user.bio} />
    </div>
  );
}
```

### Extract Custom Hook

```tsx
// Before: Logic mixed in component
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(data => setResults(data))
      .finally(() => setLoading(false));
  }, [query]);

  // ... render
}

// After: Logic extracted to hook
function useSearch(query: string) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(data => setResults(data))
      .finally(() => setLoading(false));
  }, [query]);

  return { results, loading };
}

function SearchResults() {
  const [query, setQuery] = useState('');
  const { results, loading } = useSearch(query);
  // ... render (cleaner, focused on UI)
}
```

### Replace Conditional with Polymorphism

```tsx
// Before: Complex conditionals
function NotificationBadge({ type, count }: Props) {
  let color, icon;
  if (type === 'error') {
    color = 'red';
    icon = '!';
  } else if (type === 'warning') {
    color = 'yellow';
    icon = '⚠';
  } else if (type === 'success') {
    color = 'green';
    icon = '✓';
  } else {
    color = 'blue';
    icon = 'i';
  }
  return <span style={{ color }}>{icon} {count}</span>;
}

// After: Configuration object
const BADGE_CONFIG = {
  error: { color: 'red', icon: '!' },
  warning: { color: 'yellow', icon: '⚠' },
  success: { color: 'green', icon: '✓' },
  info: { color: 'blue', icon: 'i' },
} as const;

function NotificationBadge({ type, count }: Props) {
  const { color, icon } = BADGE_CONFIG[type];
  return <span style={{ color }}>{icon} {count}</span>;
}
```

## Performance Refactoring

### Optimize Renders with Memoization

```tsx
// Before: Unnecessary re-renders
function ParentComponent() {
  const [count, setCount] = useState(0);

  // This function is recreated every render
  const handleClick = () => console.log('clicked');

  // This computation runs every render
  const expensiveValue = items.filter(i => i.active).map(i => i.name);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <ExpensiveChild data={expensiveValue} onClick={handleClick} />
    </div>
  );
}

// After: Memoized properly
function ParentComponent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => console.log('clicked'), []);

  const expensiveValue = useMemo(
    () => items.filter(i => i.active).map(i => i.name),
    [items]
  );

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <ExpensiveChild data={expensiveValue} onClick={handleClick} />
    </div>
  );
}

const ExpensiveChild = memo(function ExpensiveChild({ data, onClick }: Props) {
  // ... expensive render
});
```

### Code Splitting

```tsx
// Before: Everything in main bundle
import { HeavyChart } from './HeavyChart';
import { ComplexTable } from './ComplexTable';

function Dashboard() {
  return (
    <div>
      <HeavyChart data={data} />
      <ComplexTable data={tableData} />
    </div>
  );
}

// After: Lazy loaded
const HeavyChart = lazy(() => import('./HeavyChart'));
const ComplexTable = lazy(() => import('./ComplexTable'));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart data={data} />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <ComplexTable data={tableData} />
      </Suspense>
    </div>
  );
}
```

### Virtualization for Long Lists

```tsx
// Before: Render all items
function ItemList({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// After: Virtualized (only visible items rendered)
import { useVirtualizer } from '@tanstack/react-virtual';

function ItemList({ items }: { items: Item[] }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <ul ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <li
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              height: virtualItem.size,
            }}
          >
            {items[virtualItem.index].name}
          </li>
        ))}
      </div>
    </ul>
  );
}
```

## Accessibility Refactoring

### Add Semantic HTML

```tsx
// Before: Div soup
function Navigation() {
  return (
    <div className="nav">
      <div className="nav-item" onClick={goHome}>Home</div>
      <div className="nav-item" onClick={goAbout}>About</div>
    </div>
  );
}

// After: Semantic elements
function Navigation() {
  return (
    <nav aria-label="Main navigation">
      <ul role="menubar">
        <li role="none">
          <a href="/" role="menuitem">Home</a>
        </li>
        <li role="none">
          <a href="/about" role="menuitem">About</a>
        </li>
      </ul>
    </nav>
  );
}
```

### Add Keyboard Support

```tsx
// Before: Mouse only
function Dropdown({ items, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Select</button>
      {isOpen && (
        <ul>
          {items.map(item => (
            <li key={item.id} onClick={() => onSelect(item)}>
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// After: Full keyboard support
function Dropdown({ items, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        if (activeIndex >= 0) {
          onSelect(items[activeIndex]);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <button
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        Select
      </button>
      {isOpen && (
        <ul role="listbox" tabIndex={-1}>
          {items.map((item, index) => (
            <li
              key={item.id}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => onSelect(item)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Design System Migration

### Token Migration

```tsx
// Before: Hard-coded values
const Button = styled.button`
  background-color: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
`;

// After: Using tokens
const Button = styled.button`
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
`;
```

### Component Standardization

```tsx
// Before: Inconsistent button implementations
// File A:
<button className="btn btn-primary" onClick={...}>Save</button>

// File B:
<div className="action-button blue" onClick={...}>Save</div>

// File C:
<Button variant="blue" size="medium">Save</Button>

// After: Standardized design system component
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md">Save</Button>
```

## Refactoring Checklist

### Before Starting

```
□ Tests exist for affected code
□ Current behavior documented
□ Scope clearly defined
□ Stakeholders notified
```

### During Refactoring

```
□ Small, incremental changes
□ Tests pass after each change
□ No behavior changes (unless intended)
□ Git commits are atomic
```

### After Completing

```
□ All tests pass
□ No performance regressions
□ Accessibility maintained/improved
□ Documentation updated
□ Code reviewed
```

## Common Pitfalls

```
❌ Refactoring without tests
✓ Write tests first, then refactor

❌ Big bang refactoring
✓ Small, incremental changes

❌ Changing behavior while refactoring
✓ Separate behavior changes from refactoring

❌ Not measuring performance impact
✓ Profile before and after

❌ Premature abstraction
✓ Wait for three similar cases before abstracting
```
