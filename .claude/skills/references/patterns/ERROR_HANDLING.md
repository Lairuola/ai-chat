# Error Handling Patterns

Patterns for graceful error handling — categories, boundaries, network resilience, and error UI.

For recovery patterns (optimistic rollback, form recovery, offline queue, monitoring), see `ERROR_RECOVERY.md`.

## Overview

Errors are inevitable. Good error handling:
- Explains what happened (clear messaging)
- Offers recovery paths (actionable next steps)
- Preserves user work (no data loss)
- Fails gracefully (partial functionality over total failure)

## Error Categories

### User Errors
```
Validation errors     → Inline feedback, keep user in flow
Permission denied     → Explain why, offer alternative
Invalid input         → Show correct format, preserve input
```

### System Errors
```
Network failure       → Retry option, offline indicator
Server error (5xx)    → Apologize, suggest retry later
Timeout               → Auto-retry with backoff, manual retry
Service unavailable   → Status page link, estimated recovery
```

### Application Errors
```
JavaScript exception  → Error boundary, report to monitoring
Missing data          → Fallback UI, skeleton states
Stale data            → Refresh prompt, auto-update
```

---

## React Error Boundaries

### Basic Error Boundary

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Resettable Error Boundary

```tsx
interface ResettableState extends State {
  errorKey: number;
}

class ResettableErrorBoundary extends Component<Props & { resetKeys?: unknown[] }, ResettableState> {
  state: ResettableState = { hasError: false, error: null, errorKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<ResettableState> {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: Props & { resetKeys?: unknown[] }) {
    // Reset when resetKeys change
    if (this.state.hasError && prevProps.resetKeys !== this.props.resetKeys) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorKey: this.state.errorKey + 1 });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.reset}
        />
      );
    }
    return <Fragment key={this.state.errorKey}>{this.props.children}</Fragment>;
  }
}
```

### Strategic Boundary Placement

```tsx
// Good: Boundaries at logical UI sections
function App() {
  return (
    <ErrorBoundary fallback={<AppCrashScreen />}>
      <Header /> {/* If header crashes, whole app fails gracefully */}

      <ErrorBoundary fallback={<SidebarError />}>
        <Sidebar />
      </ErrorBoundary>

      <ErrorBoundary fallback={<MainContentError />}>
        <MainContent />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}

// Good: Boundary per route
function Router() {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <ErrorBoundary fallback={<RouteError />}>
          <Dashboard />
        </ErrorBoundary>
      } />
    </Routes>
  );
}

// Bad: Boundary around every component (overkill)
// Bad: Single boundary at root only (one error kills everything)
```

---

## Network Error Handling

### Fetch with Retry

```tsx
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  config: RetryConfig = { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        // Don't retry client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new ClientError(response.status, await response.text());
        }
        // Retry server errors (5xx)
        throw new ServerError(response.status);
      }

      return response.json();
    } catch (error) {
      lastError = error as Error;

      // Don't retry client errors or aborts
      if (error instanceof ClientError || error.name === 'AbortError') {
        throw error;
      }

      if (attempt < config.maxRetries) {
        // Exponential backoff with jitter
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          config.maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

### React Query Error Handling

```tsx
// Global error handling configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry 4xx errors
        if (error instanceof ClientError) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      onError: (error) => {
        // Global mutation error handling
        if (error instanceof NetworkError) {
          toast.error('Network error. Please check your connection.');
        }
      },
    },
  },
});

// Component-level error handling
function UserProfile({ userId }: { userId: string }) {
  const { data, error, isError, refetch } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load profile"
        message={getErrorMessage(error)}
        onRetry={refetch}
      />
    );
  }

  return <Profile user={data} />;
}
```

---

## Error UI Components

### Inline Error (Form Fields)

```tsx
interface FieldErrorProps {
  message: string;
  id: string;
}

function FieldError({ message, id }: FieldErrorProps) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-1 text-sm text-red-600 flex items-center gap-1"
    >
      <AlertCircle className="h-4 w-4" aria-hidden />
      {message}
    </p>
  );
}

// Usage with input
<input
  aria-invalid={!!error}
  aria-describedby={error ? `${id}-error` : undefined}
/>
{error && <FieldError message={error} id={`${id}-error`} />}
```

### Error State (Sections)

```tsx
interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

function ErrorState({ title, message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" aria-hidden />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {message && (
        <p className="mt-2 text-sm text-gray-600 max-w-sm">{message}</p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" className="mt-4">
          Try again
        </Button>
      )}
    </div>
  );
}
```

### Full Page Error

```tsx
function FullPageError({
  statusCode,
  title,
  message,
  showHomeLink = true,
  showRetry = false,
  onRetry,
}: FullPageErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        {statusCode && (
          <p className="text-6xl font-bold text-gray-200">{statusCode}</p>
        )}
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{message}</p>

        <div className="mt-6 flex gap-4 justify-center">
          {showRetry && onRetry && (
            <Button onClick={onRetry} variant="primary">
              Try again
            </Button>
          )}
          {showHomeLink && (
            <Button as="a" href="/" variant="secondary">
              Go home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Common error pages
const NotFound = () => (
  <FullPageError
    statusCode={404}
    title="Page not found"
    message="The page you're looking for doesn't exist or has been moved."
  />
);

const ServerError = () => (
  <FullPageError
    statusCode={500}
    title="Something went wrong"
    message="We're working on fixing this. Please try again in a few minutes."
    showRetry
    onRetry={() => window.location.reload()}
  />
);
```

---

## Error Messages

### Writing Good Error Messages

```
Good error messages:
- "Your session has expired. Please sign in again."
- "We couldn't save your changes. Check your connection and try again."
- "This email is already registered. Sign in or use a different email."

Bad error messages:
- "Error 500"
- "Something went wrong"
- "Invalid input"
- "null is not an object"
```

### Error Message Structure

```
┌─────────────────────────────────────────────────┐
│  What happened (clear, human language)          │
│  Why it happened (if helpful)                   │
│  What to do next (actionable)                   │
└─────────────────────────────────────────────────┘

Example:
"We couldn't process your payment. Your card was declined.
 Please try a different payment method or contact your bank."
```

### Mapping API Errors

```tsx
const errorMessages: Record<string, string> = {
  // Auth errors
  'auth/invalid-credentials': 'Incorrect email or password.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/email-in-use': 'This email is already registered.',
  'auth/weak-password': 'Password must be at least 8 characters.',
  'auth/session-expired': 'Your session has expired. Please sign in again.',

  // Network errors
  'network/offline': 'You appear to be offline. Check your connection.',
  'network/timeout': 'Request timed out. Please try again.',

  // Validation errors
  'validation/required': 'This field is required.',
  'validation/email': 'Please enter a valid email address.',
  'validation/min-length': 'Must be at least {min} characters.',

  // Generic fallbacks
  'server/internal': 'Something went wrong on our end. Please try again.',
  'unknown': 'An unexpected error occurred. Please try again.',
};

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code in errorMessages) {
    return errorMessages[error.code];
  }
  if (error instanceof Error) {
    return error.message;
  }
  return errorMessages.unknown;
}
```

---

## Checklist

### Error Boundary Setup
- [ ] Root-level boundary catches unexpected crashes
- [ ] Route-level boundaries isolate page failures
- [ ] Critical sections have dedicated boundaries
- [ ] Boundaries report to error tracking service

### Network Resilience
- [ ] Retry logic for transient failures
- [ ] Exponential backoff prevents thundering herd
- [ ] Timeout handling with user feedback

### User Experience
- [ ] Clear, actionable error messages
- [ ] Retry options where appropriate
- [ ] Graceful degradation (partial functionality)

---

## See Also

- **ERROR_RECOVERY.md** — Optimistic rollback, form recovery, offline queue, monitoring
- **COMPONENT_BEHAVIOR.md** — Error display placement, confirmation patterns
- **FORMS.md** — Form validation patterns
- **STATE_MANAGEMENT.md** — Async state and loading states
