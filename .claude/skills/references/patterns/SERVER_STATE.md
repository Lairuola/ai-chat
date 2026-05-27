# Server & External State Management

Patterns for server state (TanStack Query), URL state, global stores (Zustand), and state machines.

For client state (useState, useReducer, Context), see `STATE_MANAGEMENT.md`.

---

## Server State (TanStack Query)

### Basic Queries

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });

  if (isLoading) return <Skeleton />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  return <Profile user={data} />;
}
```

### Dependent Queries

```tsx
function UserPosts({ userId }: { userId: string }) {
  // First query: get user
  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  // Second query: get posts (depends on user)
  const postsQuery = useQuery({
    queryKey: ['posts', userQuery.data?.id],
    queryFn: () => fetchPostsByUser(userQuery.data!.id),
    enabled: !!userQuery.data, // Only run when user is loaded
  });
}
```

### Mutations

```tsx
function CreatePostForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      // Invalidate and refetch posts list
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      // Or optimistically add to cache
      queryClient.setQueryData(['posts'], (old: Post[]) => [...old, newPost]);
    },
    onError: (error) => {
      toast.error('Failed to create post');
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate({ title, content });
    }}>
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

### Optimistic Updates

```tsx
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // Snapshot previous value
    const previousTodos = queryClient.getQueryData(['todos']);

    // Optimistically update
    queryClient.setQueryData(['todos'], (old: Todo[]) =>
      old.map(todo => todo.id === newTodo.id ? newTodo : todo)
    );

    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    // Rollback on error
    queryClient.setQueryData(['todos'], context?.previousTodos);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

---

## URL State

### Search Params for Shareable State

```tsx
import { useSearchParams } from 'react-router-dom';

function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') ?? 'all';
  const sort = searchParams.get('sort') ?? 'newest';
  const page = parseInt(searchParams.get('page') ?? '1');

  const updateFilters = (updates: Record<string, string>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });
      return next;
    });
  };

  return (
    <div>
      <select
        value={category}
        onChange={e => updateFilters({ category: e.target.value, page: '1' })}
      >
        {/* options */}
      </select>
    </div>
  );
}
```

### Custom Hook for URL State

```tsx
function useQueryParam<T>(
  key: string,
  defaultValue: T,
  parse: (value: string) => T = (v) => v as T,
  serialize: (value: T) => string = String
): [T, (value: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.has(key)
    ? parse(searchParams.get(key)!)
    : defaultValue;

  const setValue = useCallback((newValue: T) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (newValue === defaultValue) {
        next.delete(key);
      } else {
        next.set(key, serialize(newValue));
      }
      return next;
    });
  }, [key, defaultValue, serialize, setSearchParams]);

  return [value, setValue];
}

// Usage
const [page, setPage] = useQueryParam('page', 1, parseInt);
const [search, setSearch] = useQueryParam('q', '');
```

---

## Zustand (Lightweight Global State)

### Basic Store

```tsx
import { create } from 'zustand';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: () => number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((sum, item) => sum + item.price, 0),
}));

// Usage in components
function Cart() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const clearCart = useCartStore((state) => state.clearCart);
}
```

### Zustand with Persistence

```tsx
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist<SettingsStore>(
    (set) => ({
      theme: 'light',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'settings-storage', // localStorage key
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
    }
  )
);
```

### Zustand with Immer

```tsx
import { immer } from 'zustand/middleware/immer';

const useTodoStore = create(
  immer<TodoStore>((set) => ({
    todos: [],

    addTodo: (text) => set((state) => {
      state.todos.push({ id: nanoid(), text, completed: false });
    }),

    toggleTodo: (id) => set((state) => {
      const todo = state.todos.find(t => t.id === id);
      if (todo) todo.completed = !todo.completed;
    }),
  }))
);
```

---

## State Machine Pattern

### For Complex UI States

```tsx
type SubmitState =
  | { status: 'idle' }
  | { status: 'validating' }
  | { status: 'submitting' }
  | { status: 'success'; data: Response }
  | { status: 'error'; error: Error };

function useFormSubmit() {
  const [state, setState] = useState<SubmitState>({ status: 'idle' });

  const submit = async (data: FormData) => {
    setState({ status: 'validating' });

    const errors = validate(data);
    if (errors.length > 0) {
      setState({ status: 'error', error: new ValidationError(errors) });
      return;
    }

    setState({ status: 'submitting' });

    try {
      const response = await api.submit(data);
      setState({ status: 'success', data: response });
    } catch (error) {
      setState({ status: 'error', error: error as Error });
    }
  };

  const reset = () => setState({ status: 'idle' });

  return { state, submit, reset };
}

// Usage
function Form() {
  const { state, submit, reset } = useFormSubmit();

  // Exhaustive state handling
  switch (state.status) {
    case 'idle':
      return <FormFields onSubmit={submit} />;
    case 'validating':
      return <FormFields disabled validating />;
    case 'submitting':
      return <FormFields disabled loading />;
    case 'success':
      return <SuccessMessage data={state.data} onReset={reset} />;
    case 'error':
      return <ErrorMessage error={state.error} onRetry={reset} />;
  }
}
```

---

## Decision Guide

```
What kind of external state?
│
├─ Server data (API responses) → TanStack Query
│   ├─ Need caching? → staleTime + gcTime
│   ├─ Need optimistic UI? → onMutate + rollback
│   └─ Need offline? → persistQueryClient
│
├─ URL state (shareable/bookmarkable) → useSearchParams
│   ├─ Filters, pagination → search params
│   ├─ In-page anchors → hash
│   └─ Complex URL state → nuqs library
│
├─ Global client state → Zustand
│   ├─ Need persistence? → persist middleware
│   ├─ Need devtools? → devtools middleware
│   └─ Complex mutations? → immer middleware
│
└─ Complex state transitions → State machine
    ├─ Known finite states → Discriminated union
    └─ Complex workflows → XState (if needed)
```

---

## Checklist

### Server State
- [ ] Use TanStack Query for server data
- [ ] Configure appropriate stale times
- [ ] Implement optimistic updates for better UX
- [ ] Handle loading, error, and empty states

### URL State
- [ ] Use URL for shareable/bookmarkable state
- [ ] Sync URL params with component state
- [ ] Reset pagination when filters change

### Global State
- [ ] Use Zustand for cross-component state
- [ ] Select only needed slices to avoid re-renders
- [ ] Persist user preferences where appropriate

---

## See Also

- **STATE_MANAGEMENT.md** — Client state (useState, useReducer, Context)
- **ERROR_HANDLING.md** — Error states and recovery
- **ERROR_RECOVERY.md** — Optimistic rollback patterns
- **COMPONENT_PATTERNS.md** — Component state patterns
