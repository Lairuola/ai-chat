import type { Conversation } from '../types'

interface Props {
  conversation?: Conversation | null
  hasMessages?: boolean
  isStreaming?: boolean
  isConnected?: boolean
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

export function ChatHeader({ conversation, hasMessages, isStreaming, isConnected, onClear, onOpenSidebar }: Props) {
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
        className="w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-all hover:bg-[var(--surface-hover)] active:scale-90 lg:hidden"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Brand badge */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
        style={{
          background: 'var(--primary-soft)',
          border: '1px solid color-mix(in srgb, var(--primary) 15%, transparent)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
          <rect rx="6" width="32" height="32" fill="var(--primary)" />
          <path d="M8 11a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2h-8l-4 3v-3h-2a2 2 0 01-2-2z" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="12" cy="14" r="1.2" fill="#fff" />
          <circle cx="16" cy="14" r="1.2" fill="#fff" />
          <circle cx="20" cy="14" r="1.2" fill="#fff" />
        </svg>
        <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--primary)' }}>
          DeepSeek
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: isConnected ? 'var(--primary)' : 'var(--danger)' }}
        />
      </div>

      <div className="flex-1" />

      {hasMessages && conversation && (
        <button
          onClick={() => exportMarkdown(conversation)}
          className="flex items-center gap-1.5 h-10 px-2.5 rounded-lg transition-all duration-200 hover:bg-[var(--surface-hover)] active:scale-90"
          style={{ color: 'var(--text-muted)' }}
          aria-label="导出对话"
          title="导出为 Markdown"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="text-[11px] font-medium hidden sm:inline">导出</span>
        </button>
      )}

      {hasMessages && onClear && (
        <button
          onClick={() => onClear?.()}
          disabled={isStreaming}
          className="flex items-center gap-1.5 h-10 px-2.5 rounded-lg transition-all duration-200 hover:bg-[var(--surface-hover)] active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:active:scale-100"
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
          <span className="text-[11px] font-medium hidden sm:inline">清空</span>
        </button>
      )}
    </div>
  )
}
