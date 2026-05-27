# Flow Optimization

Reducing friction, error handling in flows, documentation templates, and analytics.

For flow types, navigation patterns, and wayfinding, see `USER_JOURNEYS.md`.

---

## Reducing Steps

```
Before (5 steps):
[Cart] → [Login] → [Address] → [Payment] → [Review] → [Confirm]

After (3 steps with smart defaults):
[Cart] → [Checkout: Address + Payment] → [Confirm]

Techniques:
- Pre-fill from saved data
- Skip redundant steps
- Combine related screens
- Progressive disclosure
```

### When to Combine Steps

```
Combine when:
- Fields are closely related (address + shipping options)
- Combined screen stays < 7 fields
- No conditional branching between steps

Keep separate when:
- Steps have different mental contexts
- One step is optional/conditional
- Combined screen would be overwhelming
```

---

## Reducing Friction

```
High friction:
- Creating account before purchase
- Entering same info twice
- Mandatory fields not needed
- Slow loading between steps

Reduce by:
- Guest checkout option
- Smart defaults (pre-fill from profile)
- Save progress automatically
- Inline validation (don't wait until submit)
```

### Friction Audit Questions

```
For each step, ask:
1. Why does this step exist?
2. Is every required field actually required?
3. Can any data be inferred or pre-filled?
4. What % of users drop off here?
5. What errors occur most at this step?
```

---

## Error Handling in Flows

### Error States to Design

```
Input errors:
- Invalid format (email, phone)
- Missing required fields
- Out of range values

Business logic errors:
- Item out of stock
- Coupon expired
- Account locked

System errors:
- Network failure
- Server error
- Timeout

Permission errors:
- Not authenticated
- Insufficient permissions
- Session expired
```

### Error Recovery Flows

```
Inline recovery:
┌─────────────────────────────────────┐
│ Email: [invalid@email]              │
│ ⚠️ Please enter a valid email       │
│ [Fix and continue]                  │
└─────────────────────────────────────┘

Separate error page:
┌─────────────────────────────────────┐
│         Something went wrong        │
│                                     │
│   We couldn't process your payment  │
│                                     │
│   [Try Again]  [Contact Support]    │
└─────────────────────────────────────┘

Redirect to resolution:
[Error: Not logged in] → [Login] → [Return to original flow]
```

### Preserving Flow State on Error

```
Always preserve:
- Form input values (never clear on error)
- Step progress (don't reset to step 1)
- Scroll position within a step
- Selections made in previous steps

On session timeout:
- Save progress to localStorage/session
- After re-auth, restore user to their position
```

---

## Flow Documentation

### Flow Overview Template

```markdown
## Checkout Flow

**Goal**: Enable users to complete purchase
**Entry**: Cart page, Buy Now button
**Success criteria**: Order confirmed, payment processed

### Assumptions
- User is authenticated
- Cart contains at least 1 item
- Payment method available

### Dependencies
- Payment service (Stripe)
- Inventory service
- Email service
```

### Step Documentation Template

```markdown
### Step 2: Shipping Address

**Screen**: /checkout/shipping
**Purpose**: Collect delivery information

**Entry conditions**:
- Cart validated
- User authenticated

**Actions available**:
- Enter new address
- Select saved address
- Edit saved address

**Validation**:
- All required fields filled
- Address format valid
- Delivery available to location

**Exits**:
- Success → Payment step
- Error → Show validation messages
- Back → Cart page
```

---

## Flow Testing Checklist

```
□ All entry points tested
□ All decision branches covered
□ All error states have recovery
□ All exit points documented
□ Back button behavior defined
□ Browser refresh behavior defined
□ Session timeout handling
□ Deep link behavior
□ Mobile-specific flows
□ Accessibility: keyboard navigation through full flow
□ Accessibility: screen reader announces step changes
```

---

## Analytics to Track

### Per Step

```
- Time on step (identify confusion)
- Drop-off rate (identify friction)
- Error frequency (identify UX problems)
- Back navigation rate (identify uncertainty)
- Field-level errors (identify unclear fields)
```

### Overall Flow

```
- Completion rate
- Average steps to completion
- Conversion by entry point
- Error type distribution
- Abandonment reasons (exit surveys)
```

### Setting Up Funnel Analytics

```javascript
// Track step views
analytics.track('Flow Step Viewed', {
  flow: 'checkout',
  step: 2,
  step_name: 'shipping_address',
  session_id: sessionId,
});

// Track completions
analytics.track('Flow Step Completed', {
  flow: 'checkout',
  step: 2,
  time_spent_ms: Date.now() - stepStartTime,
});

// Track errors
analytics.track('Flow Step Error', {
  flow: 'checkout',
  step: 2,
  error_type: 'validation',
  field: 'zip_code',
});

// Track abandonment
analytics.track('Flow Abandoned', {
  flow: 'checkout',
  last_step: 2,
  reason: 'timeout', // or 'back', 'close', 'error'
});
```

---

## Search Navigation Pattern

### Searchable Flows

```
Simple search:
┌────────────────────────────────────────────────┐
│ Search...                                       │
└────────────────────────────────────────────────┘

Search with suggestions:
┌────────────────────────────────────────────────┐
│ product                                        │
├────────────────────────────────────────────────┤
│ product design                                 │
│ product management                             │
│ Product page (Recent)                          │
│ Products category                              │
└────────────────────────────────────────────────┘

Command palette (power users):
┌────────────────────────────────────────────────┐
│ > search commands...              ⌘K           │
├────────────────────────────────────────────────┤
│ Go to file...                     ⌘P           │
│ Run command...                    ⌘⇧P          │
│ Search in files                   ⌘⇧F          │
└────────────────────────────────────────────────┘
```

---

## See Also

- **USER_JOURNEYS.md** — Flow types, navigation patterns, wayfinding
- **ERROR_HANDLING.md** — Error state UI components
- **ERROR_RECOVERY.md** — Form recovery, session preservation
- **FORMS.md** — Form flows and multi-step validation
- **SEARCH.md** — Search pattern implementation
