# AI 聊天助手 — 实现计划

> 使用 superpowers:executing-plans 按任务逐步执行。

**目标**: 构建微信风格的本地 AI 聊天助手，Claude Code 作为后端，WebSocket 通信
**架构**: React UI ↔ ws ↔ server.js ↔ 文件 inbox/outbox ↔ Claude Code /loop
**技术栈**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4 + Node.js ws + LocalStorage

---

## 阶段 1: 项目骨架

### Task 1: 初始化项目结构

**Create**: `ui/package.json`, `ui/tsconfig.json`, `ui/vite.config.ts`, `ui/index.html`, `ui/vite-env.d.ts`, `ui/src/main.tsx`, `ui/src/index.css`

```json
// ui/package.json
{
  "name": "ai-chat-ui",
  "private": true,
  "type": "module",
  "scripts": { "dev": "vite", "build": "tsc -b && vite build", "typecheck": "tsc --noEmit" },
  "dependencies": { "react": "^19.0.0", "react-dom": "^19.0.0", "react-markdown": "^10.1.0", "rehype-highlight": "^7.0.2" },
  "devDependencies": { "@tailwindcss/vite": "^4.1.0", "@vitejs/plugin-react": "^4.4.0", "@types/react": "^19.0.0", "@types/react-dom": "^19.0.0", "tailwindcss": "^4.1.0", "typescript": "^5.8.0", "vite": "^6.3.0" }
}
```

```ts
// ui/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [react(), tailwindcss()] })
```

```html
<!-- ui/index.html -->
<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>AI 聊天助手</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>
```

```tsx
// ui/src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
```

```css
/* ui/src/index.css */
@import "tailwindcss";
:root {
  --bg: #fafbfc;
  --border: #e8ecf1;
  --text: #333333;
  --text-muted: #999999;
  --user-bubble: #dce3f0;
  --ai-bubble: #ffffff;
  --ai-border: #e8ecf1;
  --user-avatar: #7c8db5;
  --ai-avatar: #9ea8c0;
  --primary: #7c8db5;
  --sidebar-bg: #f5f5f7;
}
* { scrollbar-width: thin; scrollbar-color: #d0d0d0 transparent; }
html, body, #root { height: 100%; margin: 0; background: var(--bg); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 3px; }
```

**Verify**: `cd ui && pnpm install && pnpm typecheck && pnpm dev` → 空白但无报错

---

### Task 2: 类型定义

**Create**: `ui/src/types.ts`

```ts
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export type WsInMessage =
  | { type: 'message'; convId: string; content: string }
  | { type: 'clear'; convId: string }
  | { type: 'create_conversation' }
  | { type: 'delete_conversation'; convId: string }

export type WsOutMessage =
  | { type: 'stream'; convId: string; chunk: string; index: number }
  | { type: 'done'; convId: string }
  | { type: 'error'; convId: string; message: string }
```

**Verify**: `pnpm typecheck` 通过

---

## 阶段 2: Server（WebSocket + 文件桥接）

### Task 3: WebSocket Server

**Create**: `server/package.json`, `server/server.js`, 创建 `bridge/inbox/` 和 `bridge/outbox/` 目录

```json
// server/package.json
{ "name": "ai-chat-server", "private": true, "type": "module", "scripts": { "start": "node server.js" }, "dependencies": { "ws": "^8.18.0" } }
```

```js
// server/server.js
import { WebSocketServer } from 'ws'
import { existsSync, mkdirSync, readFileSync, writeFileSync, watch } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const INBOX = join(ROOT, 'bridge', 'inbox')
const OUTBOX = join(ROOT, 'bridge', 'outbox')
const PORT = 3090

;[INBOX, OUTBOX].forEach(d => { if (!existsSync(d)) mkdirSync(d, { recursive: true }) })

const wss = new WebSocketServer({ port: PORT })
console.log(`WS server on ws://localhost:${PORT}`)

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString())
    if (msg.type === 'message') {
      const file = join(INBOX, `${msg.convId}.json`)
      writeFileSync(file, JSON.stringify({ id: Date.now().toString(36), content: msg.content, timestamp: Date.now() }))
    }
  })
})

// 监听 outbox 变化，推送给 WebSocket 客户端
watch(OUTBOX, (eventType, filename) => {
  if (!filename || eventType !== 'change') return
  const convId = filename.replace('.json', '')
  try {
    const content = readFileSync(join(OUTBOX, filename), 'utf-8')
    const data = JSON.parse(content)
    if (data.chunks) {
      data.chunks.forEach((chunk, i) => {
        wss.clients.forEach(c => {
          if (c.readyState === 1) c.send(JSON.stringify({ type: 'stream', convId, chunk, index: i }))
        })
      })
      wss.clients.forEach(c => {
        if (c.readyState === 1) c.send(JSON.stringify({ type: 'done', convId }))
      })
    }
  } catch { /* ignore bad reads */ }
})

// 清理旧 outbox
setInterval(() => {
  // keep
}, 60_000)
```

**Verify**: `cd server && pnpm install && pnpm start` → `WS server on ws://localhost:3090`

---

## 阶段 3: React 组件

### Task 4: useConversations Hook

**Create**: `ui/src/hooks/useConversations.ts`

```ts
import { useState, useCallback, useEffect } from 'react'
import type { Conversation } from '../types'

const STORAGE_KEY = 'chat-conversations'

function load(): Conversation[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : [] }
  catch { return [] }
}

function save(convs: Conversation[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(convs)) } catch { /* ignore */ }
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(load)
  const [activeId, setActiveId] = useState<string>(conversations[0]?.id || '')

  useEffect(() => { save(conversations) }, [conversations])

  const activeConv = conversations.find(c => c.id === activeId) || null

  const createConv = useCallback(() => {
    const conv: Conversation = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setConversations(prev => [conv, ...prev])
    setActiveId(conv.id)
    return conv.id
  }, [])

  const deleteConv = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (id === activeId) setActiveId('')
  }, [activeId])

  const addMessage = useCallback((convId: string, msg: { role: 'user' | 'assistant'; content: string }) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c
      const message = { id: Date.now().toString(36), role: msg.role, content: msg.content, timestamp: Date.now() }
      const title = c.messages.length === 0 && msg.role === 'user' ? msg.content.slice(0, 30) : c.title
      return { ...c, title, messages: [...c.messages, message], updatedAt: Date.now() }
    }))
  }, [])

  const updateLastAssistant = useCallback((convId: string, content: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c
      const msgs = [...c.messages]
      if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
      }
      return { ...c, messages: msgs, updatedAt: Date.now() }
    }))
  }, [])

  const clearConv = useCallback((id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, messages: [], updatedAt: Date.now() } : c))
  }, [])

  return { conversations, activeId, activeConv, setActiveId, createConv, deleteConv, addMessage, updateLastAssistant, clearConv }
}
```

**Verify**: `pnpm typecheck`

### Task 5: useWebSocket Hook

**Create**: `ui/src/hooks/useWebSocket.ts`

```ts
import { useEffect, useRef, useState, useCallback } from 'react'
import type { WsInMessage, WsOutMessage } from '../types'

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [streaming, setStreaming] = useState<{ convId: string; content: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const listenersRef = useRef<Map<string, (msg: WsOutMessage) => void>>(new Map())

  useEffect(() => {
    let retries = 0
    function connect() {
      const ws = new WebSocket('ws://localhost:3090')
      wsRef.current = ws
      ws.onopen = () => { setIsConnected(true); setError(null); retries = 0 }
      ws.onclose = () => { setIsConnected(false); if (retries < 3) { retries++; setTimeout(connect, Math.pow(2, retries) * 1000) } }
      ws.onmessage = (e) => {
        const msg: WsOutMessage = JSON.parse(e.data)
        if (msg.type === 'stream') {
          setStreaming(prev => prev ? { ...prev, content: prev.content + msg.chunk } : { convId: msg.convId, content: msg.chunk })
        }
        if (msg.type === 'done') setStreaming(null)
        if (msg.type === 'error') setError(msg.message)
        listenersRef.current.forEach(fn => fn(msg))
      }
    }
    connect()
    return () => { wsRef.current?.close() }
  }, [])

  const send = useCallback((msg: WsInMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(msg))
  }, [])

  const onMessage = useCallback((key: string, fn: (msg: WsOutMessage) => void) => {
    listenersRef.current.set(key, fn)
    return () => { listenersRef.current.delete(key) }
  }, [])

  return { isConnected, streaming, error, setError, send, onMessage }
}
```

**Verify**: `pnpm typecheck`

### Task 6: App.tsx 主布局

**Create**: `ui/src/App.tsx`

```tsx
import { useConversations } from './hooks/useConversations'
import { useWebSocket } from './hooks/useWebSocket'
import { ConversationList } from './components/ConversationList'
import { ChatWindow } from './components/ChatWindow'

export default function App() {
  const { conversations, activeId, activeConv, setActiveId, createConv, deleteConv, addMessage, updateLastAssistant, clearConv } = useConversations()
  const { isConnected, streaming, error, setError, send, onMessage } = useWebSocket()

  return (
    <div className="flex h-full bg-white">
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={createConv}
        onDelete={deleteConv}
      />
      <ChatWindow
        conversation={activeConv}
        isConnected={isConnected}
        streaming={streaming}
        error={error}
        onSend={(content) => {
          if (!activeId) return
          const convId = activeId
          addMessage(convId, { role: 'user', content })
          send({ type: 'message', convId, content })
        }}
        onClear={() => activeId && clearConv(activeId)}
        onDoneMsg={(msg) => {
          updateLastAssistant(msg.convId, '')
          addMessage(msg.convId, { role: 'assistant', content: '' })
        }}
        onStreamUpdate={(convId, text) => updateLastAssistant(convId, text)}
        onMessage={onMessage}
        clearError={() => setError(null)}
      />
    </div>
  )
}
```

**Verify**: `pnpm typecheck`

### Task 7: ConversationList 组件

**Create**: `ui/src/components/ConversationList.tsx`

```tsx
import type { Conversation } from '../types'

interface Props {
  conversations: Conversation[]
  activeId: string
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

export function ConversationList({ conversations, activeId, onSelect, onCreate, onDelete }: Props) {
  return (
    <div className="w-[260px] shrink-0 flex flex-col border-r" style={{ borderColor: 'var(--border)', background: 'var(--sidebar-bg)' }}>
      <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>聊天</span>
        <button onClick={onCreate} className="w-7 h-7 rounded flex items-center justify-center text-lg transition-colors hover:bg-black/5" style={{ color: 'var(--text-muted)' }}>+</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(c => (
          <div key={c.id}
            className={`px-4 py-3 cursor-pointer transition-colors group flex items-center justify-between ${c.id === activeId ? 'bg-white' : 'hover:bg-black/[0.02]'}`}
            onClick={() => onSelect(c.id)}
            style={{ borderBottom: '1px solid #f0f0f0' }}
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{c.title}</div>
              <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {c.messages.length > 0 ? c.messages[c.messages.length - 1].content.slice(0, 40) : '暂无消息'}
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onDelete(c.id) }}
              className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded transition-all" style={{ color: 'var(--text-muted)' }}>×</button>
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="text-center py-12 text-xs" style={{ color: 'var(--text-muted)' }}>暂无会话<br/>点击 + 新建</div>
        )}
      </div>
    </div>
  )
}
```

**Verify**: `pnpm typecheck`

### Task 8: ChatWindow 组件

**Create**: `ui/src/components/ChatWindow.tsx`

```tsx
import { useEffect, useRef } from 'react'
import type { Conversation, WsOutMessage } from '../types'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'

interface Props {
  conversation: Conversation | null
  isConnected: boolean
  streaming: { convId: string; content: string } | null
  error: string | null
  onSend: (content: string) => void
  onClear: () => void
  onStreamUpdate: (convId: string, text: string) => void
  onDoneMsg: (msg: { convId: string }) => void
  onMessage: (key: string, fn: (msg: WsOutMessage) => void) => () => void
  clearError: () => void
}

export function ChatWindow({ conversation, isConnected, streaming, error, onSend, onClear, onStreamUpdate, onDoneMsg, onMessage, clearError }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages, streaming?.content])

  useEffect(() => {
    if (!conversation) return
    return onMessage('chat', (msg: WsOutMessage) => {
      if (msg.convId !== conversation.id) return
      if (msg.type === 'stream') onStreamUpdate(conversation.id, streaming ? streaming.content + msg.chunk : msg.chunk)
      if (msg.type === 'done') onDoneMsg({ convId: conversation.id })
    })
  }, [conversation?.id, streaming])

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>AI 聊天助手</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>选择一个会话或新建开始对话</p>
          <p className="text-xs mt-4" style={{ color: isConnected ? '#10b981' : '#ef4444' }}>
            {isConnected ? '● 已连接' : '● 未连接'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{conversation.title}</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{conversation.messages.length} 条消息</p>
        </div>
        <button onClick={onClear} className="text-xs px-3 py-1.5 rounded transition-colors hover:bg-black/5" style={{ color: 'var(--text-muted)' }}>清空</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {conversation.messages.length === 0 && (
          <div className="text-center py-16">
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">开始一段新对话吧</p>
          </div>
        )}
        {conversation.messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming message */}
        {streaming && streaming.convId === conversation.id && streaming.content && (
          <MessageBubble message={{ id: 'streaming', role: 'assistant', content: streaming.content, timestamp: Date.now() }} isStreaming />
        )}

        {/* Loading indicator */}
        {streaming && streaming.convId === conversation.id && !streaming.content && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ background: 'var(--ai-avatar)' }}>AI</div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm border" style={{ background: 'var(--ai-bubble)', borderColor: 'var(--ai-border)' }}>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--ai-avatar)', animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-500 text-sm text-center">
            {error}
            <button onClick={clearError} className="ml-2 underline">关闭</button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={!!streaming} />
    </div>
  )
}
```

**Verify**: `pnpm typecheck`

### Task 9: MessageBubble 组件

**Create**: `ui/src/components/MessageBubble.tsx`

```tsx
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import type { Message } from '../types'

interface Props {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
        style={{ background: isUser ? 'var(--user-avatar)' : 'var(--ai-avatar)' }}>
        {isUser ? '我' : 'AI'}
      </div>
      <div className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${isUser ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm border'}`}
        style={{
          background: isUser ? 'var(--user-bubble)' : 'var(--ai-bubble)',
          borderColor: isUser ? 'transparent' : 'var(--ai-border)',
          color: 'var(--text)',
        }}>
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre({ children }) { return <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 my-2 overflow-x-auto text-xs">{children}</pre> },
                code({ className, children, ...props }) {
                  return className ? <code className={className} {...props}>{children}</code>
                    : <code className="bg-gray-100 text-rose-600 px-1 py-0.5 rounded text-xs" {...props}>{children}</code>
                },
              }}>
              {message.content}
            </ReactMarkdown>
            {isStreaming && <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Verify**: `pnpm typecheck`

### Task 10: ChatInput 组件

**Create**: `ui/src/components/ChatInput.tsx`

```tsx
import { useState, useRef, useEffect } from 'react'

interface Props {
  onSend: (content: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (!disabled) ref.current?.focus() }, [disabled])

  const send = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <div className="px-4 py-3 bg-white border-t flex gap-2 items-end" style={{ borderColor: 'var(--border)' }}>
      <textarea ref={ref} value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
        rows={1} disabled={disabled}
        className="flex-1 resize-none rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
        style={{ background: '#f5f7fa', border: '1px solid #e0e4ea', color: 'var(--text)', outline: 'none' }}
        placeholder="输入消息，Enter 发送，Shift+Enter 换行"
      />
      <button onClick={send} disabled={disabled || !value.trim()}
        className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'var(--primary)' }}>
        发送
      </button>
    </div>
  )
}
```

**Verify**: `pnpm typecheck`

---

## 阶段 4: Claude Code 集成

### Task 11: Claude Code /loop Hook

**Create 目录**: `bridge/inbox/`, `bridge/outbox/`, `conversations/`

配置 Claude Code 循环模式：`/loop 3s` 执行以下检查逻辑：

```
读取 bridge/inbox/ 下所有 .json 文件 → 对每个新消息：
  1. 读取 conversations/{convId}.json 获取历史上下文
  2. 结合用户消息和记忆生成回复
  3. 将回复写入 bridge/outbox/{convId}.json
  4. 删除 bridge/inbox/{convId}.json（标记已处理）
```

回复格式：
```json
{
  "convId": "xxx",
  "chunks": ["文", "字", "逐", "字", "推", "送"],
  "timestamp": 1779766000
}
```

**Verify**: 发送一条消息，检查 bridge/outbox/ 是否有回复文件生成

---

## 任务依赖

```
Task 1 (骨架) → Task 2 (类型)
              → Task 3 (Server, 并行)
Task 2 → Task 4 (useConversations)
       → Task 5 (useWebSocket, 并行)
Task 2+4+5 → Task 6 (App.tsx)
           → Task 7 (ConversationList, 并行)
           → Task 8 (ChatWindow, 并行)
           → Task 9 (MessageBubble, 并行)
           → Task 10 (ChatInput, 并行)
Task 3+6+7+8+9+10 → Task 11 (Claude Code 集成)
```

## 验证方式

每个 Task 完成后：
1. `pnpm typecheck` 零错误
2. `pnpm dev` 启动查看效果
3. 所有状态覆盖（空/加载/错误/流式）
