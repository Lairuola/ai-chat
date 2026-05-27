# Information Architecture

Organizing content and navigation so users can find what they need — site mapping, taxonomy, labeling, and IA for SPAs.

---

## IA Fundamentals

```
Four components of IA:
1. Organization systems  — How content is grouped and structured
2. Labeling systems      — How content is named/described
3. Navigation systems    — How users move through content
4. Search systems        — How users search for content
```

---

## Content Inventory

Before designing IA, audit what exists:

```markdown
| ID  | Page/Item       | Content Type | Owner     | Status   | Notes         |
|-----|-----------------|--------------|-----------|----------|---------------|
| 1   | Dashboard       | Page         | Product   | Current  | Entry point   |
| 2   | Settings/Profile| Page         | Product   | Outdated | Needs update  |
| 3   | Help articles   | Article (×47)| Support   | Current  | Separate site |
```

---

## Site Structure Models

### Hierarchical (Tree)

```
Home
├── Products
│   ├── Category A
│   │   ├── Product 1
│   │   └── Product 2
│   └── Category B
└── About
    ├── Team
    └── Careers

Best for: Large content sites, e-commerce, documentation
```

### Flat

```
Home ─── Page A
     ─── Page B
     ─── Page C

Best for: Small sites, utilities, single-purpose tools
```

### Hub and Spoke

```
        [Home]
       /  |  \
  [A]   [B]   [C]
   ↑           ↑
   └───────────┘ (A ↔ C possible but hub is primary)

Best for: Portals, dashboards, feature-rich apps
```

### Matrix

```
Multiple navigation paths to same content:
By Type: Documents > Reports > Q4 Report
By Date: 2024 > Q4 > Q4 Report
By Author: Jane > Reports > Q4 Report

Best for: Large content libraries, knowledge bases
```

---

## Navigation Models

### Global Navigation
Top-level structure visible on every page. Answers: "Where am I? Where can I go?"

### Local Navigation
Secondary navigation within a section. Answers: "What else is in this area?"

### Contextual Navigation
Links within content (inline links, related content, "see also"). Answers: "What's connected to this?"

### Breadcrumb Navigation
Hierarchical trail. Answers: "How did I get here? How do I go up?"

---

## Content Taxonomy

### Category Types

```
Exact (mutually exclusive):
- Alphabetical
- Chronological
- Geographical

Approximate (subjective):
- Topic-based
- Task-based
- Audience-based
- Format-based
```

### Tagging vs Categories

```
Categories (single hierarchy):
- One parent per item
- Predictable, easy to navigate
- Use for: Primary organization

Tags (flat, multi-value):
- Multiple tags per item
- Flexible, cross-cutting
- Use for: Filtering, discovery, search facets
```

---

## Card Sorting Methodology

Used to validate whether your taxonomy matches user mental models.

### Open Card Sort
Users create their own groups and label them.
```
Use for: Discovering user mental models, early-stage IA
Process:
1. Write ~40 content items on cards
2. Ask users to group similar items
3. Label their groups
4. Analyze clusters across participants
```

### Closed Card Sort
Users sort cards into pre-defined categories.
```
Use for: Validating your proposed structure
Process:
1. Pre-define categories (your proposed navigation)
2. Write content items on cards
3. Ask users to place items in categories
4. Identify items with low agreement
```

### Hybrid Card Sort
Users can create new categories AND use pre-defined ones.

---

## Tree Testing

Validates whether users can find things in your proposed structure.

```
Process:
1. Build navigation hierarchy (text-only, no visual design)
2. Write realistic tasks: "Find where to change your password"
3. Ask users to click through the tree to find the answer
4. Measure: success rate, directness, time

Tools: Optimal Workshop, Maze, UserZoom

Success criteria:
- > 70% success rate per task
- > 50% direct success (no backtracking)
```

---

## Labeling Systems

### Principles

```
Clear:        Users understand immediately
Specific:     No ambiguity between labels
Consistent:   Same format throughout (all nouns, or all verbs)
Familiar:     User vocabulary, not internal jargon

Bad:          Good:
Miscellaneous Settings
General       Preferences
Utilities     Tools
Manage        Edit
My Area       Profile
```

### Label Testing

```
Simple test: Show label only, ask "What do you expect to find here?"
First-click test: Show labeled navigation, ask user to click where they'd find X
```

---

## URL Structure

```
Resources:
/projects                  list
/projects/new              create form
/projects/abc-123          detail
/projects/abc-123/edit     edit form
/projects/abc-123/settings resource settings

Nested resources:
/projects/abc-123/members
/projects/abc-123/files

Actions (when REST isn't enough):
/projects/abc-123/archive
/projects/abc-123/duplicate

Search/filter:
/projects?status=active&sort=updated
```

---

## IA for Single Page Apps

### Route Organization

```
Feature-based routes (recommended):
/dashboard
/projects                  → ProjectList
/projects/:id              → ProjectDetail
/projects/:id/settings     → ProjectSettings
/settings/profile          → UserProfile
/settings/billing          → Billing
```

### Lazy Loading Boundaries

```tsx
// Split code at route level
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const Settings = lazy(() => import('./pages/Settings'));

// Each route boundary is an IA boundary too
// Consider this when deciding where to split features
```

### Browser History

```
Push state (new URL): Actions that create new context
  - Navigating to a page
  - Applying major filters (sharable state)
  - Opening a deep-linkable modal

Replace state (update URL silently): Minor state changes
  - Tab selection within a page
  - Sort order changes

No URL change: Transient UI state
  - Tooltip open
  - Dropdown expanded
  - Hover states
```

---

## Mental Models

```
Design to match user expectations:

Spreadsheet users expect:
- Row/column manipulation
- Cell-level editing
- Sort/filter per column

Email client users expect:
- Inbox → Compose flow
- Folders/labels for organization
- Thread grouping

Document editor users expect:
- Save/autosave feedback
- Version history
- Share/collaborate actions

When breaking conventions, provide onboarding to bridge the gap.
```

---

## Wayfinding Cues

```
You-are-here indicators:
- Active nav item highlighting
- Breadcrumbs
- Page title matching nav label
- URL reflecting current location

Landmarks:
- Consistent header/footer
- Persistent navigation
- Recurring content patterns (same button locations)

Orientation:
- Progress indicators for multi-step flows
- Section headings
- "N results" count after search/filter
```

---

## Checklist

- [ ] Content inventory complete before designing structure
- [ ] Navigation labels validated with card sorting or user testing
- [ ] URL structure follows RESTful conventions
- [ ] Breadcrumbs present for hierarchies deeper than 2 levels
- [ ] Mobile IA considered (different navigation transforms)
- [ ] Search covers what navigation doesn't
- [ ] IA decisions documented (rationale, alternatives considered)

---

## See Also

- **NAVIGATION.md** — Navigation component patterns
- **USER_JOURNEYS.md** — Flow design and wayfinding
- **SEARCH.md** — Search system design
- **RESPONSIVE_STRATEGY.md** — Mobile IA considerations
