# Notification Patterns

Toasts, banners, notification centers, badges, real-time updates, and push notifications.

---

## Notification Types

```
System alerts:        App-generated, operational (error, warning, update)
Transactional:        Response to user action (saved, sent, failed)
Activity:             User-triggered events (comment, mention, share)
Marketing:            Promotional, optional
```

---

## Toast / Snackbar

### Anatomy

```
┌─────────────────────────────────────────────────┐
│ ✓  Changes saved                          [×]  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ✓  Message sent                        [Undo]  │
└─────────────────────────────────────────────────┘
```

### Rules

```
Duration:
- Default: 4-5 seconds
- With action (Undo): 6-8 seconds
- Error: 8-10 seconds (or persist until dismissed)
- Never auto-dismiss errors that require action

Position:
- Bottom right (most common)
- Bottom center (mobile)
- Top center (warnings that block workflow)

Stacking:
- Stack oldest at bottom, newest at top
- Max 3 visible at once
- Queue additional toasts
```

### Implementation

```tsx
// Using a toast library like sonner or react-hot-toast
import { toast } from 'sonner';

// Success
toast.success('Changes saved');

// With undo action
toast.success('Message sent', {
  action: {
    label: 'Undo',
    onClick: () => undoSend(),
  },
  duration: 8000,
});

// Error (persistent)
toast.error('Failed to save. Check your connection.', {
  duration: Infinity, // Requires manual dismiss
});

// Loading → Success pattern
const toastId = toast.loading('Saving changes…');
await saveChanges();
toast.success('Changes saved', { id: toastId });
```

### Accessibility

```tsx
// Toasts must be announced to screen readers
// Most libraries handle this via aria-live — verify your library does

// Manual implementation:
<div
  role="status"          // For success/info (polite)
  aria-live="polite"
  aria-atomic="true"
>
  {message}
</div>

// For urgent errors:
<div
  role="alert"           // For errors (assertive)
  aria-live="assertive"
>
  {errorMessage}
</div>
```

---

## Banner Notifications

### Types

```
Info banner (dismissible):
┌──────────────────────────────────────────────────────────────┐
│ ℹ  We're updating our privacy policy on March 1st.   [×]   │
└──────────────────────────────────────────────────────────────┘

Warning banner (persistent):
┌──────────────────────────────────────────────────────────────┐
│ ⚠  Your trial ends in 3 days.          [Upgrade now]        │
└──────────────────────────────────────────────────────────────┘

Error banner (critical):
┌──────────────────────────────────────────────────────────────┐
│ ✕  Payment failed. Update your billing info to continue.    │
│    [Update billing]                                          │
└──────────────────────────────────────────────────────────────┘

Success banner (temporary):
┌──────────────────────────────────────────────────────────────┐
│ ✓  Your account has been verified.                   [×]   │
└──────────────────────────────────────────────────────────────┘
```

### Placement

```
Top of page (below nav):
- Affects full session
- Billing issues, trial warnings, announcements

Top of content area:
- Affects current context
- Form submission errors, sync issues

Inline (within content):
- Affects specific item
- Item-level errors or warnings
```

---

## Notification Center

### Inbox Pattern

```
┌─────────────────────────────────────────────────┐
│ Notifications                        [Mark all read] │
├─────────────────────────────────────────────────┤
│ Today                                           │
│                                                 │
│ ●  Sarah commented on Q4 Brief      2 min ago  │
│    "Looks great! Just one change..."            │
│                                                 │
│ ●  Build succeeded                  1 hr ago   │
│    main branch · 3 files changed               │
│                                                 │
├─────────────────────────────────────────────────┤
│ Yesterday                                       │
│                                                 │
│    Invoice #1042 was paid            Jan 14     │
│    $2,400 from Acme Corp                        │
└─────────────────────────────────────────────────┘
```

### Notification Grouping

```
Group by type (cleaner for high volume):
─── Comments (3) ────────────────────────
  Sarah: "Great work on this..."
  Tom: "One question about..."
  Alex: "Approved!"

─── System (2) ──────────────────────────
  Build #142 succeeded
  Deployment complete
```

### Read/Unread State

```tsx
interface Notification {
  id: string;
  type: 'comment' | 'system' | 'billing';
  title: string;
  body: string;
  read: boolean;
  timestamp: Date;
  href?: string;
}

function NotificationItem({ notification, onRead }) {
  return (
    <a
      href={notification.href}
      onClick={() => !notification.read && onRead(notification.id)}
      className={cn(
        'flex gap-3 p-3 hover:bg-gray-50',
        !notification.read && 'bg-blue-50'
      )}
      aria-label={`${notification.read ? '' : 'Unread: '}${notification.title}`}
    >
      {!notification.read && (
        <span className="mt-2 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
      )}
      <div>
        <p className="font-medium text-sm">{notification.title}</p>
        <p className="text-sm text-gray-600">{notification.body}</p>
        <time className="text-xs text-gray-400">
          {formatRelativeTime(notification.timestamp)}
        </time>
      </div>
    </a>
  );
}
```

---

## Badge Patterns

### Variants

```
Dot badge (has notifications, no count):
[🔔]●

Count badge:
[🔔] 3

Max display:
[🔔] 99+   ← never show raw large numbers
```

### Implementation

```tsx
function BadgeIcon({
  icon: Icon,
  count,
  label,
}: {
  icon: React.ComponentType;
  count: number;
  label: string;
}) {
  const displayCount = count > 99 ? '99+' : count;

  return (
    <button className="relative" aria-label={`${label}, ${count} unread`}>
      <Icon className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1
                     bg-red-500 text-white text-xs rounded-full
                     flex items-center justify-center"
          aria-hidden  // Screen reader gets count from button aria-label
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}
```

---

## Real-time Updates

### Strategy Selection

```
WebSocket:
- Full duplex, low latency
- Use for: Chat, collaborative editing, live dashboards
- Complexity: High

Server-Sent Events (SSE):
- Server → client, auto-reconnects
- Use for: Live feeds, progress updates, notifications
- Complexity: Medium

Polling:
- Client requests on interval
- Use for: Low-frequency updates, simple setups
- Complexity: Low
- Interval: 10-60 seconds typical
```

### Optimistic UI with Real-time

```tsx
function useNotifications() {
  const queryClient = useQueryClient();

  // Real-time updates via SSE
  useEffect(() => {
    const es = new EventSource('/api/notifications/stream');

    es.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      queryClient.setQueryData(['notifications'], (old: Notification[]) => [
        notification,
        ...old,
      ]);
    };

    return () => es.close();
  }, [queryClient]);

  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });
}
```

---

## Push Notifications

### Permission Request Timing

```
Never ask immediately on page load.

Ask after:
- User completes a key action (sends first message, creates first project)
- User has been active for > 2 sessions
- User has expressed intent (clicked notification icon, opted into updates)

Do not ask again if denied — wait for user to re-enable in settings.
```

### Notification Preferences

```
Granular controls:
┌────────────────────────────────────────────────────┐
│ Notifications                                      │
├────────────────────────────────────────────────────┤
│ Comments on my posts          [Email] [Push] [Both]│
│ Mentions                      [Email] [Push] [Both]│
│ Team activity                 [Email] [Push] [Off] │
│ Product updates               [Email] [Off]  [Off] │
├────────────────────────────────────────────────────┤
│ Quiet hours                                        │
│ Don't disturb from [10:00 PM] to [8:00 AM]        │
└────────────────────────────────────────────────────┘
```

---

## Checklist

### Toasts
- [ ] Auto-dismiss timing appropriate for content type
- [ ] Errors persist until manually dismissed
- [ ] `role="status"` for success/info, `role="alert"` for errors
- [ ] Undo option for destructive actions

### Notification Center
- [ ] Unread/read state visually distinct
- [ ] Group by time period (Today, Yesterday, This week)
- [ ] Mark all read available
- [ ] Badge count uses aria-label on trigger

### Real-time
- [ ] Reconnection handling for WebSocket/SSE
- [ ] Graceful degradation to polling if SSE unsupported
- [ ] No notification spam on reconnect (dedup)

---

## See Also

- **COMPONENT_BEHAVIOR.md** — Toast vs AlertDialog decision
- **ADVANCED_INTERACTIONS.md** — ARIA live regions
- **ERROR_HANDLING.md** — Error notification patterns
- **CONTENT_MICROCOPY.md** — Notification copy guidelines
