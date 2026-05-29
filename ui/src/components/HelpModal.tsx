import { useEffect, useRef } from 'react'

interface ShortcutGroup {
  category: string
  items: { keys: string, desc: string }[]
}

const GROUPS: ShortcutGroup[] = [
  {
    category: '导航',
    items: [
      { keys: 'Ctrl+K', desc: '打开命令面板' },
      { keys: 'Ctrl+/', desc: '显示快捷键' },
      { keys: 'Ctrl+N', desc: '新建会话' },
      { keys: 'Ctrl+Shift+[', desc: '上一个会话' },
      { keys: 'Ctrl+Shift+]', desc: '下一个会话' },
      { keys: 'Esc', desc: '关闭弹窗 / 取消' },
    ],
  },
  {
    category: '会话列表',
    items: [
      { keys: '↑ ↓', desc: '浏览会话' },
      { keys: 'Enter', desc: '选中会话' },
      { keys: 'Delete', desc: '删除会话' },
    ],
  },
  {
    category: '输入',
    items: [
      { keys: 'Enter', desc: '发送消息' },
      { keys: 'Shift+Enter', desc: '换行' },
    ],
  },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function HelpModal({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open)
      return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    // Trap focus on open
    requestAnimationFrame(() => panelRef.current?.focus())
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open)
    return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="快捷键参考"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="w-full max-w-sm rounded-xl overflow-hidden shadow-2xl animate-fade-in outline-none"
        style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => { e.stopPropagation() }}
        onKeyDown={(e) => {
          if (e.key === 'Escape')
            onClose()
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            快捷键参考
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--surface-hover)] active:scale-90"
            style={{ color: 'var(--text-muted)' }}
            aria-label="关闭"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* Groups */}
        <div className="max-h-80 overflow-y-auto px-5 py-3 space-y-4">
          {GROUPS.map(group => (
            <div key={group.category}>
              <div
                className="text-[11px] font-semibold tracking-wide uppercase mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {group.category}
              </div>
              <div className="space-y-1">
                {group.items.map(item => (
                  <div
                    key={item.keys}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {item.desc}
                    </span>
                    <kbd
                      className="text-[11px] px-2 py-1 rounded font-mono font-medium"
                      style={{
                        color: 'var(--text)',
                        background: 'var(--surface-hover)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {item.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div
          className="px-5 py-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            在命令面板 (Ctrl+K) 中也可使用部分操作
          </p>
        </div>
      </div>
    </div>
  )
}
