import { useState } from 'react'
import { ChatWindow } from './components/ChatWindow'
import { ConversationList } from './components/ConversationList'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useChatStore } from './hooks/useChatStore'
import { useWebSocket } from './hooks/useWebSocket'

export default function App() {
  const store = useChatStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isConnected, retriesExhausted, reconnect, send } = useWebSocket((msg) => {
    switch (msg.type) {
      case 'stream':
        store.handleStreamChunk(msg.convId, msg.chunk)
        break
      case 'done':
        store.handleStreamDone(msg.convId)
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

  return (
    <ErrorBoundary>
    <div className="flex h-full" style={{ background: 'var(--surface-solid)' }}>
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
      />
    </div>
    </ErrorBoundary>
  )
}
