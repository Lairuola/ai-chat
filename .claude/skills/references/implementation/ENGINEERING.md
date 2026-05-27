# Engineering Reference

Engineering standards, architectural decisions, and cross-references to all implementation references.

This is the hub for implementation guidance — navigate to specific references below.

---

## Implementation References

| Need to... | Read... |
|------------|---------|
| Manage state (client: useState, Context) | `STATE_MANAGEMENT.md` |
| Manage server state (TanStack Query, Zustand) | `SERVER_STATE.md` |
| Handle errors gracefully | `ERROR_HANDLING.md` + `ERROR_RECOVERY.md` |
| Organize components | `COMPONENT_PATTERNS.md` |
| Write tests | `TESTING.md` |
| Optimize performance | `PERFORMANCE.md` |
| Integrate design tokens | `TOKEN_INTEGRATION.md` |
| Ensure accessibility | `WCAG.md` |
| Internationalize the UI | `I18N.md` |
| Refactor existing code | `REFACTORING.md` |

---

## Architectural Decisions

### Server vs Client Components (Next.js App Router)

```
Default to Server Components. Use Client Components when you need:
- Browser APIs (localStorage, window, navigator)
- Event listeners (onClick, onChange)
- useState / useEffect / hooks
- Third-party libraries that use browser APIs

Decision tree:
Does it need interactivity or browser APIs?
├─ No  → Server Component (default)
└─ Yes → Client Component ('use client' directive)
         └─ Push Client Components as far down the tree as possible
```

### Data Fetching Patterns

```
Server-side (SSR/SSG): For SEO-critical content, public data
├─ Static (SSG):   getStaticProps / generateStaticParams
├─ Dynamic (SSR):  fetch() in Server Components
└─ ISR:            revalidate: N seconds

Client-side: For user-specific, interactive, real-time data
├─ TanStack Query: API data with caching/background refresh
├─ SWR:            Lighter alternative to TanStack Query
└─ Server Actions: Form submissions, mutations
```

### Rendering Strategy

```
SSG (Static):
- Generated at build time
- Use for: Marketing pages, documentation, public content
- Fastest possible delivery (CDN-cacheable)

SSR (Server Rendered):
- Generated at request time
- Use for: Authenticated pages, personalized content
- Good for: SEO + dynamic data

CSR (Client Rendered):
- Rendered in browser
- Use for: Highly interactive dashboards, real-time apps
- Drawback: Slower initial load, SEO requires effort

ISR (Incremental Static Regeneration):
- Static with periodic refresh
- Use for: Product catalogs, news feeds, semi-dynamic content
```

---

## State Management Decision Tree

```
What kind of state is it?
│
├─ UI state (modal, sidebar, toggle)   → useState / useReducer
│   └─ Shared across many components? → Context or Zustand
│
├─ Form state                          → React Hook Form + Zod
│   └─ Complex multi-step?            → React Hook Form with steps
│
├─ Server data                         → TanStack Query
│   └─ Need offline?                  → TanStack Query + persistQueryClient
│
├─ URL state (shareable filters)       → useSearchParams (nuqs)
│
└─ Global app state                    → Zustand
    └─ Need persistence?              → Zustand persist middleware
```

---

## Performance Guidelines

### Response Time Targets

```
GET requests:              < 200ms
POST/PATCH/DELETE:         < 500ms
Show loading indicator:    > 200ms wait time
```

### Rendering Performance

```
- Virtualize lists > 100 items (@tanstack/react-virtual)
- Lazy load components below the fold
- Code split at route boundaries (minimum)
- Memoize expensive computations with useMemo
- Stable callback references with useCallback
```

### Core Web Vitals (Deliver Quality Bar)

```
LCP (Largest Contentful Paint):  < 2.5s
INP (Interaction to Next Paint):  < 200ms
CLS (Cumulative Layout Shift):    < 0.1
```

See `PERFORMANCE.md` for full optimization patterns.

---

## Code Quality Standards

```
Naming:
- Clear, descriptive names — no single-letter variables (except counters)
- Functions: verb + noun (fetchUser, handleSubmit, parseDate)
- Booleans: is/has/can prefix (isLoading, hasError, canEdit)
- Constants: SCREAMING_SNAKE_CASE

Size limits:
- Functions:   < 50 lines
- Components:  < 200 lines (>200 → split)
- Files:       < 500 lines (>500 → split)
- Nesting:     < 3 levels deep

Single responsibility:
- One reason to change per function/component
- Extract when a function does two things
```

---

## Code Organization

### Feature-Based Structure (Recommended)

```
src/
  features/
    auth/
      components/     LoginForm.tsx, SignupForm.tsx
      hooks/          useAuth.ts
      api/            auth.api.ts
      types.ts
    projects/
      components/     ProjectList.tsx, ProjectCard.tsx
      hooks/          useProjects.ts
      api/            projects.api.ts
      types.ts
  shared/
    components/       Button.tsx, Modal.tsx
    hooks/            useDebounce.ts
    utils/            cn.ts, formatDate.ts
  pages/              Route-level components
```

### Colocation Principle

> Keep related code together. Move files closer to where they are used.

```
Good: feature-specific hook next to the feature component
Good: test file next to the component it tests
Good: types file next to the API it describes

Avoid: Generic "helpers/" folder with unrelated utilities
Avoid: Separating all types into a central types.ts
```

---

## Dependency Management

### Evaluating New Dependencies

```
Before adding a package, consider:
1. Bundle size impact (bundlephobia.com)
2. Maintenance status (last commit, open issues, npm downloads)
3. Can it be replicated with ~20 lines of code?
4. Does it have TypeScript types?
5. Is it tree-shakeable?

Prefer:
- Libraries with focused scope
- Actively maintained (< 6 months since last commit)
- Used by the existing project ecosystem (already peer deps)

Avoid:
- Massive utility libraries when you need 2 functions (use lodash-es at minimum)
- Unmaintained packages (even if they "just work")
- Multiple packages that do the same thing
```

### Keeping Dependencies Updated

```
Strategy:
- Minor + patch: Auto-update with Dependabot / Renovate
- Major: Review changelog, update manually with testing
- Security: Fix immediately regardless of breaking changes

Schedule: Monthly dependency review
Tool: `npm outdated` or `npx npm-check-updates`
```

---

## Security Standards

```
Input validation:
- Validate at system boundaries (user input, external APIs)
- Use Zod for runtime type validation
- Never trust client-sent data on the server
- Sanitize HTML if rendering user content (DOMPurify)

Authentication:
- Tokens: httpOnly cookies preferred over localStorage
- Never log sensitive data (tokens, passwords, PII)
- CSRF protection for cookie-based auth

Common vulnerabilities (OWASP):
- XSS: Sanitize HTML, use safe React rendering (no dangerouslySetInnerHTML)
- SQL injection: Use parameterized queries, never string concat
- IDOR: Verify ownership on every server request
- Secrets: Never commit API keys (use env vars, .gitignore .env)
```

---

## Checklist

### Before Shipping
- [ ] Core Web Vitals measured (LCP, INP, CLS)
- [ ] No security vulnerabilities (XSS, SQL injection, IDOR)
- [ ] Error boundaries in place at route level
- [ ] Accessible (WCAG 2.1 AA minimum)
- [ ] Tests cover critical paths

### Code Review
- [ ] No unnecessary dependencies added
- [ ] No secrets or PII in code/logs
- [ ] TypeScript errors resolved (no `any`)
- [ ] Component size within limits

---

## See Also

- **STATE_MANAGEMENT.md** — Client state patterns
- **SERVER_STATE.md** — Server state (TanStack Query, Zustand)
- **ERROR_HANDLING.md** — Error boundary and network patterns
- **ERROR_RECOVERY.md** — Optimistic updates and recovery
- **PERFORMANCE.md** — Full performance optimization guide
- **TESTING.md** — Testing approaches and patterns
- **TOKEN_INTEGRATION.md** — Design token integration
- **WCAG.md** — Accessibility standards
- **I18N.md** — Internationalization patterns
- **REFACTORING.md** — Refactoring strategies
