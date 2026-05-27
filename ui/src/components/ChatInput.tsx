import { useEffect, useRef, useState } from 'react'

interface Props {
  onSend: (content: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!disabled)
      ref.current?.focus()
  }, [disabled])

  useEffect(() => {
    const el = ref.current
    if (!el)
      return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  const send = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled)
      return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const hasText = value.trim().length > 0
  const active = hasText && !disabled

  return (
    <div className="shrink-0 relative px-4 pb-4 pt-2">
      <div
        className="relative flex items-center gap-2 rounded-xl px-4 py-3 transition-all duration-200"
        style={{
          background: 'var(--panel-bg-input)',
          border: '1.5px solid',
          borderColor: focused ? 'var(--input-border-focus)' : 'var(--input-border)',
          boxShadow: focused ? 'var(--input-shadow-focus)' : 'var(--input-shadow)',
        }}
      >
        {/* Textarea */}
        <textarea
          id="chat-input"
          ref={ref}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={1}
          disabled={disabled}
          aria-label="输入消息内容"
          className="block flex-1 resize-none text-[15px] leading-relaxed transition-all duration-200 disabled:opacity-40"
          style={{
            background: 'transparent',
            color: 'var(--text)',
            outline: 'none',
            maxHeight: '120px',
          }}
          placeholder="输入消息... (Enter 发送)"
        />

        {/* Send button */}
        <button
          onClick={send}
          disabled={disabled || !hasText}
          className="shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 disabled:cursor-not-allowed"
          style={{
            width: 36,
            height: 36,
            background: active
              ? 'var(--btn-bg)'
              : 'var(--btn-disabled-bg)',
            boxShadow: active ? 'var(--shadow-glow)' : 'none',
            opacity: active ? 1 : 0.25,
          }}
          aria-label="发送消息"
          title="发送"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--btn-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}
