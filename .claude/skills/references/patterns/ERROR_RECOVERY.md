# Error Recovery Patterns

Recovery strategies — optimistic rollback, form data preservation, offline queuing, and error monitoring.

For error categories, boundaries, network handling, and UI components, see `ERROR_HANDLING.md`.

---

## Optimistic Updates with Rollback

```tsx
function useOptimisticUpdate<T>(
  queryKey: QueryKey,
  mutationFn: (data: T) => Promise<T>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, newData);

      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKey, context?.previousData);
      toast.error('Changes could not be saved. Reverted to previous state.');
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
```

### When to Use Optimistic Updates

```
Good candidates:
- Toggle operations (like, bookmark, pin)
- Status changes (mark as read, archive)
- Reordering lists (drag-and-drop)
- Inline editing of single fields

Bad candidates:
- Creating new records (no ID yet)
- Payment processing (must confirm)
- Destructive actions (delete, overwrite)
- Multi-step transactions
```

---

## Form Recovery (Preserve Input)

```tsx
function useFormRecovery(formId: string) {
  const storageKey = `form-recovery-${formId}`;

  // Save form state on change
  const saveState = useCallback((data: Record<string, unknown>) => {
    sessionStorage.setItem(storageKey, JSON.stringify(data));
  }, [storageKey]);

  // Recover state on mount
  const recoverState = useCallback(() => {
    const saved = sessionStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  }, [storageKey]);

  // Clear state on successful submit
  const clearState = useCallback(() => {
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  return { saveState, recoverState, clearState };
}

// Usage
function CheckoutForm() {
  const { recoverState, saveState, clearState } = useFormRecovery('checkout');

  const form = useForm({
    defaultValues: recoverState() ?? defaultValues,
  });

  // Auto-save on change
  useEffect(() => {
    const subscription = form.watch((data) => saveState(data));
    return () => subscription.unsubscribe();
  }, [form, saveState]);

  const onSubmit = async (data) => {
    await submitOrder(data);
    clearState(); // Only clear on success
  };
}
```

### Recovery Strategy Decision

```
sessionStorage (current tab):
- Short forms, checkout flows
- Data clears when tab closes
- No cross-tab persistence needed

localStorage (persistent):
- Long forms (applications, surveys)
- Multi-session drafts
- Show "Resume where you left off?" prompt

Server-side drafts:
- Collaborative editing
- Cross-device access
- Auto-save with conflict resolution
```

---

## Offline Queue

```tsx
interface QueuedAction {
  id: string;
  action: () => Promise<void>;
  timestamp: number;
}

class OfflineQueue {
  private queue: QueuedAction[] = [];
  private processing = false;

  add(action: () => Promise<void>) {
    const id = crypto.randomUUID();
    this.queue.push({ id, action, timestamp: Date.now() });
    this.persist();
    this.processQueue();
    return id;
  }

  private async processQueue() {
    if (this.processing || !navigator.onLine) return;
    this.processing = true;

    while (this.queue.length > 0 && navigator.onLine) {
      const item = this.queue[0];
      try {
        await item.action();
        this.queue.shift();
        this.persist();
      } catch (error) {
        // Keep in queue for retry
        break;
      }
    }

    this.processing = false;
  }

  private persist() {
    // Note: Can't persist functions, store serializable action descriptors instead
    localStorage.setItem('offline-queue-count', String(this.queue.length));
  }
}

// Listen for online status
window.addEventListener('online', () => offlineQueue.processQueue());
```

### Offline UI Indicators

```tsx
function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div role="status" className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-sm">
      You're offline. Changes will sync when you reconnect.
    </div>
  );
}
```

---

## Monitoring & Reporting

### Error Tracking Integration

```tsx
// Initialize error tracking (e.g., Sentry)
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Filter out noise
    const error = hint.originalException;
    if (error instanceof AbortError) return null;
    if (error?.message?.includes('ResizeObserver')) return null;
    return event;
  },
});

// Add context to errors
function setErrorContext(user: User) {
  Sentry.setUser({ id: user.id, email: user.email });
  Sentry.setTag('subscription', user.plan);
}

// Manual error reporting
function reportError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}
```

### User-Friendly Error Reporting

```tsx
function ErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const [reported, setReported] = useState(false);

  const handleReport = () => {
    reportError(error, { userReported: true });
    setReported(true);
  };

  return (
    <div className="p-6 text-center">
      <h2>Something went wrong</h2>
      <p className="text-gray-600">We've been notified and are looking into it.</p>

      <div className="mt-4 flex gap-2 justify-center">
        <Button onClick={onRetry}>Try again</Button>
        {!reported && (
          <Button variant="ghost" onClick={handleReport}>
            Report this issue
          </Button>
        )}
      </div>

      {reported && (
        <p className="mt-2 text-sm text-green-600">Thanks for reporting!</p>
      )}
    </div>
  );
}
```

### What to Track

```
Always track:
- Unhandled exceptions (via error boundary)
- Failed API calls (status, endpoint, duration)
- Client-side validation failures (which fields, how often)
- Performance marks (slow operations > threshold)

Context to attach:
- User ID (anonymized if needed)
- Current route/page
- Browser + device info
- Feature flags active
- Recent user actions (breadcrumbs)

Alert on:
- Error rate spike (> 2x baseline)
- New error types (never-before-seen)
- Critical path failures (auth, checkout, save)
- P95 response time increase
```

---

## Checklist

### Recovery
- [ ] Optimistic updates have rollback on failure
- [ ] Form input preserved on submission error
- [ ] Long forms auto-save to session/local storage
- [ ] Offline queue processes when connection returns

### Monitoring
- [ ] Errors logged to tracking service
- [ ] User context attached to errors
- [ ] Noise filtered (ResizeObserver, AbortError, etc.)
- [ ] Alerts configured for error spikes
- [ ] User-facing error reporting option available

---

## See Also

- **ERROR_HANDLING.md** — Error categories, boundaries, network handling, UI components
- **STATE_MANAGEMENT.md** — Async state and loading states
- **FORMS.md** — Form validation and submission patterns
- **SERVER_STATE.md** — TanStack Query mutation patterns
