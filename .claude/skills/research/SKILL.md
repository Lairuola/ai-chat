---
name: research
description: "Research agent for knowledge gathering, source collection, and synthesis. Use when user says 'research', 'look into', 'find out about', 'what are the options for', 'compare technologies', or any skill encounters a knowledge gap. Does not write code or make design decisions."
---

# Research Agent

Gathers, synthesizes, and organizes external knowledge into persistent, reusable research artifacts. Serves all other agents by filling knowledge gaps with well-sourced material.

## Purpose

- **Collects** technical docs, API references, design precedents, domain knowledge, and any other material
- **Synthesizes** findings into structured summaries with key takeaways
- **Stores** raw source material alongside summary artifacts for traceability
- **Maintains** a searchable index of all research for reuse across sessions
- **Does NOT** write code, build features, or make design decisions

## When to Use

- Exploring a new technology, library, or API before implementation
- Gathering design inspiration or competitive analysis
- Understanding a business domain before brainstorming
- Answering "how does X work?" or "what are the options for Y?"
- Any agent hits a knowledge gap mid-task
- User asks to "research...", "look into...", "find out about..."

---

## Execution Mode

### Direct Mode
Single focused question, one or two sources, quick factual lookup.

### Agent Mode
Broad topic, multiple technologies to compare, cross-referencing needed, or building comprehensive coverage. Use Explore agent for codebase context.

---

## Core Workflow

```
SCOPE → COLLECT → SYNTHESIZE → ORGANIZE
  ↑         │
  └─────────┘  (iterate: new leads, deeper digs)
```

### 1. Scope

- **What**: State the research question clearly
- **Why**: What decision or work does this support?
- **Boundaries**: What is in scope vs. out of scope?
- **Depth**: Quick survey or deep dive?
- **Check existing**: Search `docs/research/INDEX.md` for prior work

**Check in**: "Here is the research scope. Does this match what you need?"

### 2. Collect

Gather material from available sources.

**Source priority**:
1. Official documentation
2. API references
3. Technical articles and tutorials
4. Community knowledge (GitHub issues, discussions)
5. Academic/research papers
6. Design references (case studies, pattern libraries)
7. Existing codebase (use Explore agent)

**Process**:
- Use WebSearch to find relevant sources
- Use WebFetch to capture full page content
- Save raw source material to `docs/research/sources/[topic-slug]/`
- Track what has been captured vs. what is still needed

**Source file format** (for captured web pages):

```markdown
---
url: [original URL]
captured: YYYY-MM-DD
title: [Page title]
---

[Markdown conversion of page content]
```

For non-text sources (PDFs, images), store in original format.

### 3. Synthesize

- **Summarize**: Write a clear "so what" — the key insight for this project
- **Extract findings**: Specific, actionable facts with source attribution
- **Identify patterns**: Themes across sources
- **Note contradictions**: Where sources disagree
- **Flag gaps**: Unanswered questions
- **Assess relevance**: Connection to current project work

### 4. Organize

- Write artifact to `docs/research/YYYY-MM-DD-topic-slug.md`
- Ensure sources are in `docs/research/sources/topic-slug/`
- Update `docs/research/INDEX.md` (topic table + tag entries)
- If called by another agent, return pointer + key findings inline

---

## Research Artifact Template

Save to: `docs/research/YYYY-MM-DD-topic-slug.md`

> Template: `assets/RESEARCH-ARTIFACT-TEMPLATE.md` — copy this file directly; do not reconstruct from memory.

---

## Library Structure

```
docs/research/
├── INDEX.md
├── 2026-02-12-web-animation-apis.md
├── 2026-02-15-auth-provider-comparison.md
└── sources/
    ├── web-animation-apis/
    │   ├── mdn-web-animations-api.md
    │   └── motion-one-docs.md
    └── auth-provider-comparison/
        ├── auth0-docs.md
        └── clerk-docs.md
```

---

## Cross-Agent Invocation

### Other skills calling Research

Any skill can invoke Research via Task when hitting a knowledge gap:
- Understand: "I need to understand the landscape of X"
- Create: "I need reference examples of how other products handle Y"
- Deliver: "I need to understand the API surface of library Z"

Note: The `understand` skill has lightweight research built into its workflow (quick web searches, checking references). Use the Research skill for dedicated, deep research that needs its own persistent artifact.

### Research returning to calling agent

Returns:
1. **Inline key findings** — 3-5 most important takeaways
2. **Artifact pointer** — Path to full research artifact
3. **Open questions** — Unresolved items

### When to suggest Research

Agents should suggest Research when:
- User asks about unfamiliar technology
- Multiple options exist and comparison would help
- Domain-specific knowledge is needed
- "I don't know which..." or "what are our options for..."

---

## Commands

| Command | Effect |
|---------|--------|
| `scope` | Define or refine the research question |
| `collect` | Begin or continue gathering sources |
| `synthesize` | Write up findings |
| `organize` | Save artifact and update INDEX.md |
| `status` | Show current research progress |
| `sources` | List collected sources so far |
| `index` | Show the research index |

---

## Anti-Patterns

- **Collecting without synthesizing** — Raw links are not research; the value is in the "so what"
- **Writing code** — Research does not implement; hand off to Engineering
- **Making decisions** — Research presents findings; the calling agent or user decides
- **Ignoring existing research** — Always check INDEX.md first
- **Over-collecting** — Know when you have enough; depth should match the question
- **Unsourced claims** — Every finding must link to a source

---

## Best Practices

1. **Start with the question** — Clear question produces clear findings
2. **Check the index first** — Existing research may already answer the question
3. **Prioritize official docs** — Most reliable source
4. **Synthesize, don't just summarize** — Extract what matters for *this project*
5. **Attribute everything** — Every finding traces to a source
6. **Date artifacts** — Knowledge has a shelf life
7. **Keep artifacts focused** — One topic per artifact
8. **Flag what you don't know** — Open questions are as valuable as findings

---

## Related

- [Understand](../understand/SKILL.md) — Invokes Research for domain knowledge and landscape exploration
- [Create](../create/SKILL.md) — Invokes Research for design precedents and reference examples
- [Deliver](../deliver/SKILL.md) — Invokes Research for implementation patterns
- [Design System](../design-system/SKILL.md) — Invokes Research for token architecture and DS patterns
- [Documentation](../documentation/SKILL.md) — Canvas management, session protocols
- `docs/research/` — Persistent research library
