# Component Patterns Reference

Frontend component implementation patterns for React/TypeScript.

## Component Structure

### Basic Component

```tsx
// Good: Simple, focused component
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded font-medium transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Compound Components

```tsx
// Card with compound pattern
const Card = ({ children, className }: CardProps) => (
  <div className={cn('rounded-lg border bg-white shadow-sm', className)}>
    {children}
  </div>
);

Card.Header = ({ children, className }: CardHeaderProps) => (
  <div className={cn('px-6 py-4 border-b', className)}>{children}</div>
);

Card.Body = ({ children, className }: CardBodyProps) => (
  <div className={cn('px-6 py-4', className)}>{children}</div>
);

Card.Footer = ({ children, className }: CardFooterProps) => (
  <div className={cn('px-6 py-4 border-t', className)}>{children}</div>
);

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### Polymorphic Components

```tsx
// Component that can render as different elements
type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<E>, 'as' | 'children'>;

function Text<E extends React.ElementType = 'p'>({
  as,
  children,
  className,
  ...props
}: PolymorphicProps<E>) {
  const Component = as || 'p';
  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
}

// Usage
<Text>Paragraph</Text>
<Text as="span">Inline</Text>
<Text as="h1">Heading</Text>
```

## Props Patterns

### Discriminated Unions

```tsx
// Button with different behaviors based on type
type ButtonProps =
  | { type: 'button'; onClick: () => void }
  | { type: 'submit'; form: string }
  | { type: 'link'; href: string };

// Usage enforces correct props
<Button type="link" href="/about" />     // ✓
<Button type="submit" form="myForm" />   // ✓
<Button type="button" onClick={fn} />    // ✓
<Button type="link" onClick={fn} />      // ✗ Type error
```

### Render Props

```tsx
interface DataFetcherProps<T> {
  url: string;
  children: (data: T, loading: boolean, error: Error | null) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const { data, loading, error } = useFetch<T>(url);
  return <>{children(data, loading, error)}</>;
}

// Usage
<DataFetcher<User[]> url="/api/users">
  {(users, loading, error) => (
    loading ? <Spinner /> : <UserList users={users} />
  )}
</DataFetcher>
```

### Slot Pattern

```tsx
interface ModalProps {
  trigger: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

function Modal({ trigger, title, children, actions }: ModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div className="modal">
          <div className="modal-header">{title}</div>
          <div className="modal-body">{children}</div>
          {actions && <div className="modal-footer">{actions}</div>}
        </div>
      )}
    </>
  );
}

// Usage
<Modal
  trigger={<Button>Open</Button>}
  title="Confirm"
  actions={<Button onClick={save}>Save</Button>}
>
  Content here
</Modal>
```

## State Patterns

### Controlled vs Uncontrolled

```tsx
// Supports both controlled and uncontrolled usage
interface InputProps {
  defaultValue?: string;          // Uncontrolled
  value?: string;                 // Controlled
  onChange?: (value: string) => void;
}

function Input({ defaultValue, value, onChange }: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return <input value={currentValue} onChange={handleChange} />;
}

// Uncontrolled usage
<Input defaultValue="initial" onChange={console.log} />

// Controlled usage
<Input value={value} onChange={setValue} />
```

### State Lifting

```tsx
// Parent manages state, children display/modify
function FilterableList() {
  const [filter, setFilter] = useState('');
  const [items, setItems] = useState<Item[]>([]);

  const filteredItems = items.filter(item =>
    item.name.includes(filter)
  );

  return (
    <div>
      <SearchInput value={filter} onChange={setFilter} />
      <ItemList items={filteredItems} />
    </div>
  );
}
```

## Composition Patterns

### Container/Presenter

```tsx
// Container: handles logic
function UserListContainer() {
  const { data: users, loading, error } = useUsers();

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return <UserListPresenter users={users} />;
}

// Presenter: handles display
function UserListPresenter({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </ul>
  );
}
```

### Higher-Order Component (HOC)

```tsx
// Add loading state to any component
function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithLoading({ loading, ...props }: P & { loading: boolean }) {
    if (loading) return <Spinner />;
    return <Component {...(props as P)} />;
  };
}

const UserListWithLoading = withLoading(UserList);
```

### Custom Hooks Extraction

```tsx
// Extract reusable logic into hooks
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

// Usage in component
function Accordion() {
  const { value: isOpen, toggle } = useToggle(false);

  return (
    <div>
      <button onClick={toggle}>Toggle</button>
      {isOpen && <div>Content</div>}
    </div>
  );
}
```

## Event Handling

### Event Delegation

```tsx
// Handle events at parent level
function ItemList({ items, onItemClick }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    const itemId = (e.target as HTMLElement).closest('[data-item-id]')
      ?.getAttribute('data-item-id');
    if (itemId) onItemClick(itemId);
  };

  return (
    <ul onClick={handleClick}>
      {items.map(item => (
        <li key={item.id} data-item-id={item.id}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

### Forwarding Refs

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
    </div>
  )
);

// Usage with ref
const inputRef = useRef<HTMLInputElement>(null);
<Input ref={inputRef} label="Name" />
```

## Performance Patterns

### Memoization

```tsx
// Memoize expensive renders
const ExpensiveList = memo(function ExpensiveList({ items }: Props) {
  return (
    <ul>
      {items.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </ul>
  );
});

// Memoize callbacks
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // Stable reference

  return <Child onClick={handleClick} />;
}

// Memoize computed values
function FilteredList({ items, filter }: Props) {
  const filteredItems = useMemo(
    () => items.filter(item => item.name.includes(filter)),
    [items, filter]
  );

  return <List items={filteredItems} />;
}
```

### Lazy Loading

```tsx
// Code split with lazy
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
```

## Accessibility Patterns

### Focus Management

```tsx
function Modal({ isOpen, onClose, children }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus first element on open
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Trap focus inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
      <button ref={closeButtonRef} onClick={onClose}>
        Close
      </button>
      {children}
    </div>
  );
}
```

### ARIA Attributes

```tsx
function Accordion({ title, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div>
      <button
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
      </button>
      <div
        id={contentId}
        role="region"
        aria-hidden={!isOpen}
        hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
}
```

## File Organization

```
components/
├── ui/                    # Primitive components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   └── Card/
├── features/              # Feature-specific
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── useAuth.ts
│   └── dashboard/
└── layouts/               # Page layouts
    ├── MainLayout.tsx
    └── AuthLayout.tsx
```
