import type { Conversation } from '../types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { dateGroupLabel, formatRelativeTime } from '../utils/time'

interface Props {
  conversations: Conversation[]
  activeId: string
  canCreate: boolean
  isConnected: boolean
  sidebarOpen: boolean
  onCloseSidebar: () => void
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-3 pt-4 pb-2">
      <span className="text-[11px] font-medium tracking-wide" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  )
}

export function ConversationList({ conversations, activeId, canCreate, isConnected, sidebarOpen, onCloseSidebar, onSelect, onCreate, onDelete }: Props) {
  const [isLight, setIsLight] = useState(() => {
    try { return document.documentElement.classList.contains('light') }
    catch { return false }
  })
  const [search, setSearch] = useState('')
  const sidebarRef = useRef<HTMLDivElement>(null)

  /* Focus trap for mobile sidebar */
  useEffect(() => {
    if (!sidebarOpen)
      return
    const el = sidebarRef.current
    if (!el)
      return
    const focusable = el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab')
        return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      }
      else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [sidebarOpen])

  /* ── Filter by search ── */
  const q = search.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!q)
      return conversations
    return conversations.filter((c) => {
      if (c.title.toLowerCase().includes(q))
        return true
      return c.messages.some(m => m.content.toLowerCase().includes(q))
    })
  }, [conversations, q])

  /* ── Group by date ── */
  const groups = new Map<string, Conversation[]>()
  for (const c of filtered) {
    const label = dateGroupLabel(c.updatedAt, true)
    const list = groups.get(label) || []
    list.push(c)
    groups.set(label, list)
  }
  const groupOrder = ['今天', '昨天', '近7天', '近30天', '更早']

  const sidebar = (
    <div
      className="flex flex-col h-full w-[260px] xl:w-[300px] 2xl:w-[360px]"
      style={{
        borderRight: '1px solid var(--border)',
        background: 'var(--panel-bg-sidebar)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          {/* Close button — mobile only */}
          <button
            onClick={onCloseSidebar}
            aria-label="关闭侧边栏"
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--surface-hover)] active:scale-90"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
          <svg width="22" height="22" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
            <rect rx="6" width="32" height="32" fill="#0070F3" />
            <path d="M8 11a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2h-8l-4 3v-3h-2a2 2 0 01-2-2z" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="12" cy="14" r="1.2" fill="#fff" />
            <circle cx="16" cy="14" r="1.2" fill="#fff" />
            <circle cx="20" cy="14" r="1.2" fill="#fff" />
          </svg>
          <h2 className="font-bold text-base tracking-tight" style={{ color: 'var(--text)' }}>
            AI 助手
          </h2>
        </div>
        <button
          onClick={onCreate}
          disabled={!canCreate || !isConnected}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
          style={{
            background: !canCreate || !isConnected
              ? 'var(--btn-disabled-bg)'
              : 'var(--btn-bg)',
            color: 'var(--btn-color)',
            boxShadow: !canCreate || !isConnected ? 'none' : 'var(--shadow-glow)',
          }}
          aria-label="新建会话"
          title={isConnected ? '新建会话' : '未连接，无法创建'}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div
        className="px-3 py-3"
        style={{ borderBottom: q ? '1px solid var(--border)' : 'none' }}
      >
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ color: 'var(--text-muted)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="搜索会话"
            placeholder="搜索会话..."
            className="w-full rounded-xl py-2 pl-9 pr-9 text-[13px] font-medium placeholder:font-normal transition-all duration-200 outline-none"
            style={{
              background: 'var(--surface-hover)',
              color: 'var(--text)',
            }}
          />
          {q && (
            <button
              onClick={() => setSearch('')}
              aria-label="清除搜索"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--surface-hover)] active:scale-90"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {q && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>未找到匹配的会话</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>尝试其他关键词</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: 'var(--primary-soft)',
              }}
            >
              <svg className="w-6 h-6" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>暂无会话</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>点击 + 开始新对话</p>
          </div>
        ) : (
          groupOrder.map((label) => {
            const list = groups.get(label)
            if (!list || list.length === 0)
              return null
            return (
              <div key={label}>
                <SectionHeader label={label} />
                {list.map((c) => {
                  const active = c.id === activeId
                  const lastMsg = c.messages[c.messages.length - 1]

                  return (
                    <div
                      key={c.id}
                      onClick={() => { onSelect(c.id); setSearch('') }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(c.id); setSearch('') } }}
                      role="button"
                      tabIndex={0}
                      className="group relative w-full text-left px-3 py-2.5 my-1 cursor-pointer rounded-xl transition-all duration-150"
                      style={{
                        background: active
                          ? 'var(--sidebar-active)'
                          : 'transparent',
                        border: '1px solid',
                        borderColor: active
                          ? 'var(--primary-soft)'
                          : 'transparent',
                      }}
                    >
                      {active && (
                        <div
                          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                          style={{
                            background: 'var(--primary)',
                          }}
                        />
                      )}

                      {/* Delete button (left side, always occupies space) */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(c.id) }}
                        className={`absolute left-1.5 inset-y-0 my-auto w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 ${
                          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:bg-white/10'
                        }`}
                        aria-label="删除会话"
                        style={{ color: 'var(--text-muted)' }}
                        title="删除会话"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="6" y1="6" x2="18" y2="18" />
                          <line x1="18" y1="6" x2="6" y2="18" />
                        </svg>
                      </button>

                      <div className="pl-7">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
                            {c.title}
                          </div>
                          {lastMsg && (
                            <span className="shrink-0 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              {formatRelativeTime(lastMsg.timestamp)}
                            </span>
                          )}
                        </div>
                        <div
                          className="text-xs mt-1 truncate pr-1"
                          style={{ color: active ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                        >
                          {lastMsg ? lastMsg.content.slice(0, 50) : '暂无消息'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })
        )}
      </div>

      {/* ── Profile footer ── */}
      <div
        className="flex items-center gap-2.5 px-4 py-4 shrink-0"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{
            background: '#0070F3',
          }}
        >
          不
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          不知
        </span>
        <div className="flex-1" />
        <button
          onClick={() => {
            const html = document.documentElement
            html.classList.toggle('light')
            const now = html.classList.contains('light')
            setIsLight(now)
            try { localStorage.setItem('chat-theme', now ? 'light' : 'dark') }
            catch {}
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90"
          style={{ color: 'var(--text-muted)' }}
          aria-label={isLight ? '切换到夜间模式' : '切换到日间模式'}
          title={isLight ? '切换到夜间' : '切换到日间'}
        >
          {isLight
            ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )
            : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        {sidebar}
      </div>

      {/* Mobile overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={onCloseSidebar}
        />
        {/* Panel sliding from left */}
        <div
          ref={sidebarRef}
          className={`absolute inset-y-0 left-0 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {sidebar}
        </div>
      </div>
    </>
  )
}
