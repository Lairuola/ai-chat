import type { Conversation } from '../types'

interface Props {
  conversation?: Conversation | null
  hasMessages?: boolean
  isStreaming?: boolean
  onClear?: () => void
  onOpenSidebar?: () => void
}

function exportMarkdown(conv: Conversation) {
  const lines: string[] = [`# ${conv.title}`, '']
  for (const m of conv.messages) {
    const label = m.role === 'user' ? '**你**' : '**AI**'
    lines.push(`${label}：`, '', m.content, '')
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safeName = (conv.title || '对话').slice(0, 20).replace(/[/\\?%*:|"<>]/g, '_') || '对话'
  a.download = `${safeName}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function ChatHeader({ conversation, hasMessages, isStreaming, onClear, onOpenSidebar }: Props) {
  return (
    <div
      className="shrink-0 flex items-center select-none px-6"
      style={{
        paddingTop: 16,
        paddingBottom: 16,
        background: 'var(--panel-bg)',
        borderBottom: '1px solid var(--border)',
      }}
    >

      {/* Hamburger — visible on mobile only */}
      <button
        onClick={onOpenSidebar}
        aria-label="打开侧边栏"
        className="w-8 h-8 rounded-lg flex items-center justify-center mr-4 transition-all hover:bg-[var(--surface-hover)] active:scale-90"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Model name */}
      <span
        className="font-semibold tracking-wide"
        style={{ color: 'var(--text-secondary)', fontSize: 15 }}
      >
        DeepSeek
      </span>

      <div className="flex-1" />

      {hasMessages && conversation && (
        <button
          onClick={() => exportMarkdown(conversation)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-[var(--surface-hover)] active:scale-90"
          style={{ color: 'var(--text-muted)' }}
          aria-label="导出对话"
          title="导出为 Markdown"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      )}

      {hasMessages && onClear && (
        <button
          onClick={() => onClear?.()}
          disabled={isStreaming}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-[var(--surface-hover)] active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:active:scale-100"
          style={{ color: 'var(--text-muted)' }}
          aria-label="清空当前对话"
          title={isStreaming ? 'AI 输出中，无法清空' : '清空当前对话'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      )}
    </div>
  )
}
