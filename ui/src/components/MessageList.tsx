import type { Conversation } from '../types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { dateGroupLabel } from '../utils/time'
import { MessageBubble } from './MessageBubble'

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  )
}

function LoadingDots() {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
        style={{
          background: 'var(--ai-avatar-bg)',
        }}
      >
        AI
      </div>
      <div
        className="px-5 py-4 rounded-xl rounded-tl-sm"
        style={{
          background: 'var(--ai-bubble-bg)',
          border: '1px solid var(--ai-border)',
        }}
      >
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                background: 'var(--primary)',
                opacity: 0.2 + i * 0.3,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: 'var(--primary-soft)',
        }}
      >
        <svg className="w-6 h-6" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>开始对话</h3>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>输入消息开始与 AI 对话</p>
    </div>
  )
}

function ErrorBanner({ message, onDismiss }: { message: string, onDismiss: () => void }) {
  return (
    <div
      className="flex items-center justify-between gap-3 p-4 rounded-xl"
      style={{
        background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
        border: '1px solid color-mix(in srgb, var(--danger) 20%, transparent)',
      }}
    >
      <span className="text-sm" style={{ color: 'var(--danger)' }}>{message}</span>
      <button onClick={onDismiss} aria-label="关闭错误提示" className="shrink-0 text-xs font-medium underline" style={{ color: 'var(--danger)' }}>关闭</button>
    </div>
  )
}

/* ─── Props ─── */

interface Props {
  conversation: Conversation
  isConnected: boolean
  isStreaming: boolean
  isPending: boolean
  error: string | null
  onDismissError: () => void
  onEdit?: (msgId: string, content: string) => void
  onDelete?: (msgId: string) => void
}

/* ─── Component ─── */

export function MessageList({ conversation, isStreaming, isPending, error, onDismissError, onEdit, onDelete }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  /* Auto-scroll when new content arrives and user is near bottom */
  useEffect(() => {
    if (conversation.messages.length === 0 && !isPending)
      return
    const el = containerRef.current
    if (!el)
      return
    const threshold = isStreaming ? 300 : 150
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight
    if (dist < threshold) {
      bottomRef.current?.scrollIntoView({ behavior: isStreaming ? 'instant' : 'smooth' })
    }
  }, [conversation.messages, isStreaming, isPending])

  /* Track scroll position to show/hide back-to-bottom button */
  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el)
      return
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 300)
  }, [])

  /* Check scroll position on mount / when messages change (e.g. switching convs) */
  useEffect(() => {
    const el = containerRef.current
    if (!el)
      return
    requestAnimationFrame(() => {
      setShowScrollBtn(el.scrollHeight - el.clientHeight > 300)
    })
  }, [conversation.id])

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const { messages } = conversation

  if (messages.length === 0 && !isPending) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col">
        <EmptyState />
      </div>
    )
  }

  /* ── Render messages with date dividers ── */
  const rendered: React.ReactNode[] = []
  let lastDate = ''

  messages.forEach((msg, i) => {
    const label = dateGroupLabel(msg.timestamp)
    if (label !== lastDate) {
      rendered.push(<DateDivider key={`date-${msg.id}`} label={label} />)
      lastDate = label
    }

    rendered.push(
      <div key={msg.id} className="mb-4">
        {msg.role === 'assistant' && isStreaming && i === messages.length - 1
          ? (
              <MessageBubble message={msg} isStreaming onEdit={onEdit} onDelete={onDelete} />
            )
          : (
              <MessageBubble message={msg} onEdit={onEdit} onDelete={onDelete} />
            )}
      </div>,
    )
  })

  /* ── Pending loading dots (no content yet) ── */
  if (isPending) {
    rendered.push(<div key="pending" className="mb-4"><LoadingDots /></div>)
  }

  return (
    <div className="flex-1 overflow-y-auto relative" ref={containerRef} onScroll={handleScroll}>
      <div className="px-6 py-6 2xl:px-10">
        {rendered}

        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onDismiss={onDismissError} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Back-to-bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg animate-fade-in"
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          aria-label="回到底部"
          title="回到底部"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </div>
  )
}
