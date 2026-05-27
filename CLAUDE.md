# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start both services (UI + WebSocket)
pnpm dev                   # Concurrently start Vite (:5173) + WebSocket (:3090)
pnpm dev:ui                # Vite dev server only (:5173)
pnpm dev:server            # WebSocket server only (:3090)

# Build & check
pnpm build                 # TypeScript check + Vite production build
pnpm typecheck             # tsc --noEmit only
pnpm lint                  # ESLint (antfu config)
pnpm fix                   # ESLint --fix

# Test
pnpm test                  # Run all unit tests (UI + server)
pnpm test:watch            # Watch mode

# Server (direct)
cd server && pnpm start    # Start WebSocket server on :3090 (reads .env)
```

## Architecture

### Data Flow (Main Mode: WebSocket → DeepSeek API)

```
ChatInput → useChatStore.sendMessage() → useWebSocket.send()
  → server.js → POST DeepSeek Chat API (stream:true)
  → SSE chunks → WebSocket { type: "stream", chunk }
  → useChatStore.handleStreamChunk() → reducer appends to last assistant msg
  → { type: "done" } → handleStreamDone() clears streaming state
```

Server forwards full conversation history + system prompt to DeepSeek on each request (stateless proxy).

### Data Flow (Claude Code Bridge Mode)

```
server.js writes to bridge/inbox/{convId}.json
  → Claude Code /loop polls inbox, reads conversations/{convId}.json for context
  → Writes chunks to bridge/outbox/{convId}.json
  → Updates conversations/{convId}.json
  → Deletes inbox file
```

### State Management (useChatStore)

`useReducer` with discriminated union actions. All conversations persisted to `localStorage` under key `chat-conversations`.

### WebSocket Protocol

| Direction | Type | Payload |
|-----------|------|---------|
| Client → Server | `chat` | `{ convId, messages: {role, content}[] }` |
| Server → Client | `stream` | `{ convId, chunk: string }` |
| Server → Client | `done` | `{ convId }` |
| Server → Client | `error` | `{ convId, message }` |

### Key Architectural Details

- **No React Router** — single-page app, conversation switching via store state
- **No external state library** — useReducer is sufficient
- **Vite manualChunks** — `react-markdown` + `rehype-highlight` split into separate vendor chunk
- **WebSocket reconnect** — exponential backoff (1s/2s/4s), max 3 retries, 10s connection timeout
- **Server rate limiting** — 500ms minimum interval between chat messages
- **Styling** — CSS custom properties (`--bg`, `--text`, `--primary`, etc.); dark = `:root`, light = `.light` class overrides
- **Responsive** — sidebar permanent ≥1024px, slide-in overlay below

### Setup

```bash
# Configure DeepSeek API key
cd server && echo 'DEEPSEEK_API_KEY=sk-your-key-here' > .env
# Start both
cd server && pnpm start & cd ui && pnpm dev
```
