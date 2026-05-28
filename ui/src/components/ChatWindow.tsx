import type { Conversation } from '../types'
import { useState } from 'react'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
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
}

export function ChatWindow({
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
}: Props) {
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  if (!conversation) {
    return (
      <main className="flex-1 flex items-center justify-center relative" style={{ background: 'var(--bg)' }}>
        {/* Hamburger — mobile only */}
        <button
          onClick={onOpenSidebar}
          aria-label="打开侧边栏"
          className="lg:hidden absolute top-4 left-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--surface-hover)] active:scale-90"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="text-center animate-fade-in">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: 'var(--primary-soft)',
            }}
          >
            <svg className="w-8 h-8" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>AI 聊天助手</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>选择一个会话或新建开始对话</p>
          <div
            className="flex items-center gap-2 mt-4 mx-auto w-fit px-3 py-2 rounded-md text-xs font-medium"
            style={{
              background: isConnected ? 'var(--primary-soft)' : 'rgba(238,0,0,0.1)',
              color: isConnected ? '#fff' : 'var(--danger)',
              border: '1px solid',
              borderColor: isConnected ? 'var(--primary-soft)' : 'rgba(238,0,0,0.2)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
            {isConnected ? '已连接' : '未连接'}
          </div>
          {!isConnected && (
            <button
              onClick={onReconnect}
              disabled={!retriesExhausted}
              aria-label="重新连接"
              className="mt-3 px-4 py-2 rounded-md text-sm font-medium transition-all hover:opacity-80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                color: 'var(--primary)',
                background: 'var(--primary-soft)',
              }}
            >
              {retriesExhausted ? '重新连接' : '正在重连...'}
            </button>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col" style={{ background: 'var(--bg)' }}>
      {!isConnected && (
        <div
          className="flex items-center justify-center gap-3 px-4 py-2 text-xs font-medium"
          style={{ background: 'rgba(238,0,0,0.08)', color: 'var(--danger)' }}
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

      <ChatHeader conversation={conversation} hasMessages={conversation.messages.length > 0} isStreaming={isStreaming} onClear={() => setShowClearConfirm(true)} onOpenSidebar={onOpenSidebar} />

      <MessageList
        conversation={conversation}
        isConnected={isConnected}
        isStreaming={isStreaming}
        isPending={isPending}
        error={error}
        onDismissError={onDismissError}
        onEdit={onEdit}
        onDelete={onDelete}
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
}
