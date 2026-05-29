import type { Message } from './types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatWindow } from './components/ChatWindow'
import { CommandPalette } from './components/CommandPalette'
import { ConversationList } from './components/ConversationList'
import { ErrorBoundary } from './components/ErrorBoundary'
import { HelpModal } from './components/HelpModal'
import { useChatStore } from './hooks/useChatStore'
import { useWebSocket } from './hooks/useWebSocket'

export default function App() {
  const store = useChatStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const titleRequestedRef = useRef(new Set<string>())
  const streamingMsgIdRef = useRef('')

  const { isConnected, retriesExhausted, reconnect, send } = useWebSocket((msg) => {
    switch (msg.type) {
      case 'stream': {
        if (!streamingMsgIdRef.current)
          streamingMsgIdRef.current = crypto.randomUUID()
        store.handleStreamChunk(msg.convId, msg.chunk, streamingMsgIdRef.current)
        break
      }
      case 'done': {
        streamingMsgIdRef.current = ''
        store.handleStreamDone(msg.convId)
        const conv = store.conversations.find(c => c.id === msg.convId)
        if (conv && !titleRequestedRef.current.has(msg.convId)) {
          const firstMsg = conv.messages.find(m => m.role === 'user')
          if (firstMsg && conv.title === firstMsg.content.slice(0, 30)) {
            titleRequestedRef.current.add(msg.convId)
            send({
              type: 'summarize',
              convId: msg.convId,
              messages: conv.messages.map(m => ({ role: m.role, content: m.content })),
            })
          }
        }
        break
      }
      case 'title':
        store.setTitle(msg.convId, msg.title)
        break
      case 'error':
        store.setError(msg.message)
        break
    }
  })

  const handleSend = (content: string) => {
    store.sendMessage(content, send)
  }

  const handleSelect = (id: string) => {
    store.setActiveId(id)
    setSidebarOpen(false)
  }

  const toggleTheme = useCallback(() => {
    const html = document.documentElement
    html.classList.toggle('light')
    const now = html.classList.contains('light')
    try { localStorage.setItem('chat-theme', now ? 'light' : 'dark') }
    catch {}
    setStatusMessage(now ? '已切换为日间模式' : '已切换为夜间模式')
  }, [])

  /* ── Stable store ref for closures ── */
  const storeRef = useRef(store)
  storeRef.current = store

  /* ── Message delete with undo ── */
  const [undoMsg, setUndoMsg] = useState<{ convId: string, message: Message } | null>(null)
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleDeleteMessage = useCallback((msgId: string) => {
    const conv = storeRef.current.activeConv
    if (!conv)
      return
    const msg = conv.messages.find(m => m.id === msgId)
    if (!msg)
      return
    storeRef.current.deleteMessage(conv.id, msgId)
    setUndoMsg({ convId: conv.id, message: msg })
    clearTimeout(undoTimeoutRef.current)
    undoTimeoutRef.current = setTimeout(setUndoMsg, 5000, null)
  }, [])

  const handleUndoDelete = useCallback(() => {
    if (!undoMsg)
      return
    storeRef.current.undoDeleteMessage(undoMsg.convId, undoMsg.message)
    setUndoMsg(null)
    clearTimeout(undoTimeoutRef.current)
    setStatusMessage('已撤销删除')
  }, [undoMsg])

  /* ── Message retry ── */
  const handleRetry = useCallback((msgId: string) => {
    const conv = storeRef.current.activeConv
    if (!conv)
      return
    storeRef.current.retryMessage(conv.id, msgId, send)
    setStatusMessage('正在重新发送...')
  }, [send])

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K — toggle command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(prev => !prev)
        return
      }

      // Ctrl+/ — toggle help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setHelpOpen(prev => !prev)
        return
      }

      // Ctrl+N — new conversation
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        storeRef.current.createConv()
        setStatusMessage('已创建新会话')
        return
      }

      // Ctrl+Shift+[ — prev conversation
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '[') {
        e.preventDefault()
        const convs = storeRef.current.conversations
        const idx = convs.findIndex(c => c.id === storeRef.current.activeId)
        if (idx > 0) {
          storeRef.current.setActiveId(convs[idx - 1].id)
          setStatusMessage(`已切换到: ${convs[idx - 1].title}`)
        }
        return
      }

      // Ctrl+Shift+] — next conversation
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === ']') {
        e.preventDefault()
        const convs = storeRef.current.conversations
        const idx = convs.findIndex(c => c.id === storeRef.current.activeId)
        if (idx < convs.length - 1) {
          storeRef.current.setActiveId(convs[idx + 1].id)
          setStatusMessage(`已切换到: ${convs[idx + 1].title}`)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  /* ── Announced status auto-clear ── */
  useEffect(() => {
    if (!statusMessage)
      return
    const t = setTimeout(setStatusMessage, 3000, '')
    return () => clearTimeout(t)
  }, [statusMessage])

  const paletteCommands = [
    {
      id: 'new',
      label: '新建会话',
      shortcut: 'Ctrl+N',
      icon: '＋',
      action: () => {
        storeRef.current.createConv()
        setStatusMessage('已创建新会话')
      },
    },
    {
      id: 'theme',
      label: '切换主题',
      shortcut: '',
      icon: '◐',
      action: toggleTheme,
    },
    {
      id: 'clear',
      label: '清空当前会话',
      shortcut: '',
      icon: '✕',
      action: () => {
        if (storeRef.current.activeId) {
          storeRef.current.clearConv(storeRef.current.activeId)
          setStatusMessage('已清空当前会话')
        }
      },
    },
    {
      id: 'help',
      label: '显示快捷键',
      shortcut: 'Ctrl+/',
      icon: '?',
      action: () => setHelpOpen(true),
    },
  ]

  return (
    <ErrorBoundary>
      <div className="flex h-full" style={{ background: 'var(--surface-solid)' }}>
        {/* aria-live region for screen readers — visually hidden */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {statusMessage}
        </div>

        <ConversationList
          conversations={store.conversations}
          activeId={store.activeId}
          canCreate={store.canCreate}
          isConnected={isConnected}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onSelect={handleSelect}
          onCreate={store.createConv}
          onDelete={store.deleteConv}
        />
        <ChatWindow
          conversation={store.activeConv}
          isConnected={isConnected}
          retriesExhausted={retriesExhausted}
          onReconnect={reconnect}
          isStreaming={store.isStreaming}
          isPending={store.isPending}
          error={store.error}
          onSend={handleSend}
          onDismissError={() => store.setError(null)}
          onClear={() => store.activeId && store.clearConv(store.activeId)}
          onOpenSidebar={() => setSidebarOpen(true)}
          onEdit={(msgId, content) => store.activeId && store.editMessage(store.activeId, msgId, content)}
          onDelete={handleDeleteMessage}
          onRetry={handleRetry}
        />

        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          commands={paletteCommands}
        />
        <HelpModal
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
        />

        {/* Undo toast for message deletion */}
        {undoMsg && (
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-fade-in"
            style={{
              background: 'var(--surface-solid)',
              border: '1px solid var(--border)',
            }}
          >
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>消息已删除</span>
            <button
              onClick={handleUndoDelete}
              className="text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
              style={{ color: 'var(--primary)' }}
            >
              撤销
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
