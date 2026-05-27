# Client State Management

Patterns for managing local and shared client state in React — useState, useReducer, and Context.

For server state (TanStack Query), URL state, Zustand, and state machines, see `SERVER_STATE.md`.

## Overview

State management choices depend on:
- **Scope** — Component, feature, or global?
- **Persistence** — Memory, URL, storage, or server?
- **Complexity** — Simple values or complex objects?
- **Sharing** — How many components need this state?

## State Categories

```
┌─────────────────────────────────────────────────────────────┐
│                        State Types                          │
├──────────────┬──────────────┬──────────────┬───────────────┤
│   UI State   │  Form State  │ Server State │  URL State    │
├──────────────┼──────────────┼──────────────┼───────────────┤
│ Modal open   │ Input values │ User data    │ Filters       │
│ Sidebar      │ Validation   │ API responses│ Pagination    │
│ Accordion    │ Dirty flags  │ Cache        │ Tab selection │
│ Hover/focus  │ Submit state │ Loading      │ Search query  │
└──────────────┴──────────────┴──────────────┴───────────────┘
```

---

## Local State (useState)

### Simple State

```tsx
// Good: Simple, isolated state
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Good: Lazy initialization for expensive defaults
function Editor() {
  const [content, setContent] = useState(() => parseMarkdown(initialContent));
}
```

### Derived State

```tsx
// Bad: Storing derived state
function ProductList({ products }) {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFilteredProducts(products.filter(p => p.name.includes(searchTerm)));
  }, [products, searchTerm]);
}

// Good: Compute during render
function ProductList({ products }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredProducts = useMemo(
    () => products.filter(p => p.name.includes(searchTerm)),
    [products, searchTerm]
  );
}
```

### State Batching

```tsx
// React 18+ automatically batches these
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  setName('React');
  // Only one re-render
}

// For async operations that need manual batching (pre-React 18)
import { flushSync } from 'react-dom';

function handleAsync() {
  flushSync(() => {
    setCount(c => c + 1);
  });
  // DOM updated here
}
```

---

## Complex Local State (useReducer)

### When to Use Reducer

```
Use useState when:           Use useReducer when:
- Single value              - Multiple related values
- Simple updates            - Complex update logic
- Independent states        - Next state depends on previous
- Few state transitions     - Many possible actions
```

### Reducer Pattern

```tsx
interface State {
  items: Item[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  selectedId: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Item[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'DELETE_ITEM'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', error: null };

    case 'FETCH_SUCCESS':
      return { ...state, status: 'idle', items: action.payload };

    case 'FETCH_ERROR':
      return { ...state, status: 'error', error: action.payload };

    case 'SELECT_ITEM':
      return { ...state, selectedId: action.payload };

    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        selectedId: state.selectedId === action.payload ? null : state.selectedId,
      };

    default:
      return state;
  }
}

const initialState: State = {
  items: [],
  status: 'idle',
  error: null,
  selectedId: null,
};

function ItemList() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleFetch = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const items = await fetchItems();
      dispatch({ type: 'FETCH_SUCCESS', payload: items });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  };
}
```

### Reducer with Immer

```tsx
import { useImmerReducer } from 'use-immer';

function reducer(draft: State, action: Action) {
  switch (action.type) {
    case 'ADD_ITEM':
      draft.items.push(action.payload);
      break;

    case 'UPDATE_ITEM':
      const item = draft.items.find(i => i.id === action.payload.id);
      if (item) {
        Object.assign(item, action.payload.changes);
      }
      break;

    case 'TOGGLE_ALL':
      draft.items.forEach(item => {
        item.completed = action.payload;
      });
      break;
  }
}
```

---

## Context for Shared State

### Context Pattern

```tsx
interface ThemeContextValue {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Custom hook with null check
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Provider component
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Memoize to prevent unnecessary re-renders
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Split Context for Performance

```tsx
// Bad: One context for everything causes unnecessary re-renders
const AppContext = createContext({ user, theme, settings, dispatch });

// Good: Split by update frequency
const UserContext = createContext(user);        // Rarely changes
const ThemeContext = createContext(theme);      // User toggles
const SettingsContext = createContext(settings); // Occasionally changes

// Good: Split state from dispatch
const StateContext = createContext(state);
const DispatchContext = createContext(dispatch);

// Components that only dispatch don't re-render on state changes
function AddButton() {
  const dispatch = useContext(DispatchContext);
  return <button onClick={() => dispatch({ type: 'ADD' })}>Add</button>;
}
```

### Context with Reducer

```tsx
interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

type TodoAction =
  | { type: 'ADD'; payload: string }
  | { type: 'TOGGLE'; payload: string }
  | { type: 'DELETE'; payload: string }
  | { type: 'SET_FILTER'; payload: TodoState['filter'] };

const TodoStateContext = createContext<TodoState | null>(null);
const TodoDispatchContext = createContext<Dispatch<TodoAction> | null>(null);

function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

// Convenience hooks
function useTodoState() {
  const context = useContext(TodoStateContext);
  if (!context) throw new Error('useTodoState must be used within TodoProvider');
  return context;
}

function useTodoDispatch() {
  const context = useContext(TodoDispatchContext);
  if (!context) throw new Error('useTodoDispatch must be used within TodoProvider');
  return context;
}
```

---

## Decision Guide

```
What kind of state is it?
│
├─ UI state (modal, sidebar) → useState or useReducer
│   └─ Shared across routes? → Context or Zustand (see SERVER_STATE.md)
│
├─ Form state → React Hook Form or controlled useState
│   └─ Complex validation? → React Hook Form + Zod
│
├─ Server data → TanStack Query (see SERVER_STATE.md)
│   └─ Need offline? → TanStack Query + persist
│
├─ URL state (filters, pagination) → useSearchParams (see SERVER_STATE.md)
│
└─ Global app state → Zustand (see SERVER_STATE.md)
    └─ Need devtools? → Zustand with devtools middleware
```

---

## Checklist

### Local State
- [ ] Prefer `useState` for simple, isolated state
- [ ] Use `useReducer` for complex state transitions
- [ ] Avoid storing derived state (compute during render)
- [ ] Use lazy initialization for expensive defaults

### Context
- [ ] Split context by update frequency
- [ ] Memoize context value to prevent re-renders
- [ ] Create custom hooks with null checks
- [ ] Consider Zustand if prop drilling is the only issue

---

## See Also

- **SERVER_STATE.md** — TanStack Query, URL state, Zustand, state machines
- **COMPONENT_PATTERNS.md** — Component state patterns
- **FORMS.md** — Form state management
- **ERROR_HANDLING.md** — Error states and recovery
