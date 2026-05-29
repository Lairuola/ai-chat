import { memo } from 'react'

interface ChatEmptyStateProps {
  isConnected: boolean
  retriesExhausted: boolean
  onReconnect: () => void
  onOpenSidebar: () => void
}

export const ChatEmptyState = memo(function ChatEmptyState({
  isConnected,
  retriesExhausted,
  onReconnect,
  onOpenSidebar,
}: ChatEmptyStateProps) {
  return (
    <main className="flex-1 flex items-center justify-center relative" style={{ background: 'var(--bg)' }}>
      {/* Hamburger — mobile only */}
      <button
        onClick={onOpenSidebar}
        aria-label="打开侧边栏"
        className="lg:hidden absolute top-4 left-4 w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--surface-hover)] active:scale-90"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="text-center animate-fade-in max-w-sm">
        {/* Decorative logo mark */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'var(--primary-soft)',
            border: '1px solid color-mix(in srgb, var(--primary) 12%, transparent)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 32 32" style={{ color: 'var(--primary)' }}>
            <rect rx="6" width="32" height="32" fill="var(--primary)" />
            <path d="M8 11a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2h-8l-4 3v-3h-2a2 2 0 01-2-2z" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="12" cy="14" r="1.2" fill="#fff" />
            <circle cx="16" cy="14" r="1.2" fill="#fff" />
            <circle cx="20" cy="14" r="1.2" fill="#fff" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>开始对话</h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          新建一个会话，或者从侧边栏选择已有会话继续。
        </p>

        {/* Quick tips */}
        <div
          className="mt-6 flex flex-col gap-2 text-left mx-auto w-fit"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs" style={{ background: 'var(--surface-hover)' }}>
            <kbd className="min-w-[4.5rem] text-center px-2 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--code-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Ctrl+N</kbd>
            <span style={{ color: 'var(--text-secondary)' }}>新建会话</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs" style={{ background: 'var(--surface-hover)' }}>
            <kbd className="min-w-[4.5rem] text-center px-2 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--code-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Ctrl+K</kbd>
            <span style={{ color: 'var(--text-secondary)' }}>命令面板</span>
          </div>
        </div>

        <div
          className="flex items-center gap-2 mt-6 mx-auto w-fit px-3 py-2 rounded-md text-xs font-medium"
          style={{
            background: isConnected ? 'var(--primary-soft)' : 'color-mix(in srgb, var(--danger) 12%, transparent)',
            color: isConnected ? 'var(--user-bubble-color)' : 'var(--danger)',
            border: '1px solid',
            borderColor: isConnected ? 'var(--primary-soft)' : 'color-mix(in srgb, var(--danger) 25%, transparent)',
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
})