import type { Conversation } from '../types'
import { memo, useState } from 'react'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { ChatEmptyState } from './ChatEmptyState'
import { ConfirmDialog } from './ConfirmDialog'
import { MessageList } from './MessageList'

interface Props {
  conversation: Conversation | null
  isConnected: boolean
  retriesExhausted: boolean
  onReconnect: () => void
  isStreaming: boolean
  isPending: boolean
  error: string | null
  onSend: (content: string) => void
  onDismissError: () => void
  onClear: () => void
  onOpenSidebar: () => void
  onEdit?: (msgId: string, content: string) => void
  onDelete?: (msgId: string) => void
  onRetry?: (msgId: string) => void
}

export const ChatWindow = memo(function ChatWindow({
  conversation,
  isConnected,
  retriesExhausted,
  onReconnect,
  isStreaming,
  isPending,
  error,
  onSend,
  onDismissError,
  onClear,
  onOpenSidebar,
  onEdit,
  onDelete,
  onRetry,
}: Props) {
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  if (!conversation) {
    return (
      <ChatEmptyState
        isConnected={isConnected}
        retriesExhausted={retriesExhausted}
        onReconnect={onReconnect}
        onOpenSidebar={onOpenSidebar}
      />
    )
  }

  return (
    <main className="flex-1 flex flex-col" style={{ background: 'var(--bg)' }}>
      {!isConnected && (
        <div
          className="flex items-center justify-center gap-3 px-4 py-2 text-xs font-medium"
          style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)' }}
        >
          <span>连接已断开</span>
          <button
            onClick={onReconnect}
            disabled={!retriesExhausted}
            className="underline underline-offset-2 hover:no-underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {retriesExhausted ? '重新连接' : '正在重连...'}
          </button>
        </div>
      )}

      <ChatHeader conversation={conversation} hasMessages={conversation.messages.length > 0} isStreaming={isStreaming} isConnected={isConnected} onClear={() => setShowClearConfirm(true)} onOpenSidebar={onOpenSidebar} />

      <MessageList
        conversation={conversation}
        isConnected={isConnected}
        isStreaming={isStreaming}
        isPending={isPending}
        error={error}
        onDismissError={onDismissError}
        onEdit={onEdit}
        onDelete={onDelete}
        onRetry={onRetry}
      />

      <ChatInput onSend={onSend} disabled={isStreaming || isPending || !isConnected} />

      <ConfirmDialog
        open={showClearConfirm}
        title="清空对话"
        message="确定清空当前对话？此操作不可撤销。"
        confirmLabel="清空"
        onConfirm={() => { onClear(); setShowClearConfirm(false) }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </main>
  )
})