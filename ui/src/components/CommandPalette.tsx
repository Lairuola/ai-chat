import { useEffect, useRef, useState } from 'react'

interface Command {
  id: string
  label: string
  shortcut?: string
  icon: string
  action: () => void
}

interface Props {
  open: boolean
  onClose: () => void
  commands: Command[]
}

export function CommandPalette({ open, onClose, commands }: Props) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query.trim()
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  useEffect(() => {
    if (open) {
      setQuery('')
      setIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    setIndex(0)
  }, [query])

  if (!open)
    return null

  const run = (cmd: Command) => {
    cmd.action()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="命令面板"
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-fade-in"
        style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <polyline points="4 7 4 4 7 4" />
            <line x1="9" y1="9" x2="4" y2="4" />
            <polyline points="20 17 20 20 17 20" />
            <line x1="15" y1="15" x2="20" y2="20" />
            <circle cx="10" cy="10" r="4" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onClose()
              }
              else if (e.key === 'ArrowDown') {
                e.preventDefault()
                setIndex(i => Math.min(i + 1, filtered.length - 1))
              }
              else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setIndex(i => Math.max(i - 1, 0))
              }
              else if (e.key === 'Enter' && filtered[index]) {
                run(filtered[index])
              }
            }}
            placeholder="搜索命令..."
            className="flex-1 py-4 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text)' }}
            aria-label="搜索命令"
          />
          <kbd className="text-[11px] px-1.5 py-0.5 rounded font-medium" style={{ color: 'var(--text-muted)', background: 'var(--surface-hover)' }}>Esc</kbd>
        </div>

        {/* Command list */}
        <div className="max-h-64 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              没有匹配的命令
            </div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => run(cmd)}
                onMouseEnter={() => setIndex(i)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors"
                style={{
                  background: i === index ? 'var(--surface-hover)' : 'transparent',
                  color: 'var(--text)',
                }}
              >
                <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                  <span className="text-[11px] leading-none">{cmd.icon}</span>
                </span>
                <span className="flex-1">{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="text-[11px] px-1.5 py-0.5 rounded font-medium shrink-0" style={{ color: 'var(--text-muted)', background: 'var(--surface-hover)' }}>{cmd.shortcut}</kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
