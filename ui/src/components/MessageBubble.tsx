import type { Message } from '../types'
import type { ReactNode } from 'react'
import { memo, useCallback, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in (node as any)) {
    return extractText((node as any).props.children)
  }
  return ''
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText)
    return navigator.clipboard.writeText(text)
  // Fallback for older browsers / insecure contexts
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy') ? resolve() : reject(new Error('execCommand copy failed'))
    }
    catch (e) {
      reject(e)
    }
    finally {
      document.body.removeChild(ta)
    }
  })
}

const CodeBlock = memo(function CodeBlock({ className, code }: { className?: string, code: string }) {
  const [copied, setCopied] = useState(false)
  const lang = className?.replace('language-', '') || ''

  const handleCopy = useCallback(() => {
    copyToClipboard(code).then(() => {
      setCopied(true)
      setTimeout(setCopied, 2000, false)
    })
  }, [code])

  return (
    <div className="relative group/code my-3">
      <div
        className="flex items-center justify-between px-4 py-2 rounded-t-xl"
        style={{ background: 'var(--code-header-bg)', borderBottom: '1px solid var(--code-border)' }}
      >
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="text-[11px] px-2 py-1 rounded-md transition-colors"
          style={{ color: copied ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre
        className="rounded-b-xl p-4 m-0 overflow-x-auto text-[13px] leading-relaxed"
        style={{
          background: 'var(--code-bg)',
          color: 'var(--code-text)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {code}
      </pre>
    </div>
  )
})

interface Props {
  message: Message
  isStreaming?: boolean
  onEdit?: (msgId: string, content: string) => void
  onDelete?: (msgId: string) => void
  onRetry?: (msgId: string) => void
}

export const MessageBubble = memo(function MessageBubble({ message, isStreaming, onEdit, onDelete, onRetry }: Props) {
  const isUser = message.role === 'user'
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(message.content)
  const timeStr = new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  const handleSaveEdit = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== message.content) {
      onEdit?.(message.id, trimmed)
    }
    setEditing(false)
  }

  const handleCopyMessage = () => {
    copyToClipboard(message.content).then(() => {
      setCopied(true)
      setTimeout(setCopied, 2000, false)
    })
  }

  return (
    <div
      className={`flex gap-3 items-start msg-enter ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 select-none"
        style={{
          background: isUser ? 'var(--primary)' : 'var(--ai-avatar-bg)',
        }}
      >
        {isUser ? '我' : 'AI'}
      </div>

      {/* Bubble + actions wrapper */}
      <div className="flex flex-col gap-1 min-w-0 max-w-[min(85%,42rem)]">
        {/* Timestamp — above bubble */}
        <div className={`text-[10px] leading-none select-none flex items-center gap-2 ${isUser ? 'justify-end' : 'text-left'}`} style={{ color: 'var(--text-muted)' }}>
          <span>{timeStr}</span>
          {message.failed && (
            <span className="text-[10px] font-medium" style={{ color: 'var(--danger)' }}>
              发送失败
            </span>
          )}
        </div>
        <div
          className={`relative px-4 py-3 text-[15px] leading-relaxed ${
            isUser ? 'rounded-xl rounded-tr-sm' : 'rounded-xl rounded-tl-sm'
          }`}
          style={{
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            background: isUser
              ? 'var(--user-bubble-bg)'
              : 'var(--ai-bubble-bg)',
            border: isUser ? 'none' : '1px solid var(--ai-border)',
            color: isUser ? 'var(--user-bubble-color)' : 'var(--text)',
          }}
        >
          {isUser ? editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="w-full rounded-lg p-2 text-sm outline-none resize-none"
                style={{
                  background: 'var(--surface-hover)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  minHeight: 60,
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit() }
                  if (e.key === 'Escape') { setEditValue(message.content); setEditing(false) }
                }}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setEditValue(message.content); setEditing(false) }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                  style={{ background: 'var(--btn-bg)' }}
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          ) : (
            <div className="max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                components={{
                  pre({ children, ...props }) {
                    const text = extractText(children)
                    return <CodeBlock code={text} />
                  },
                  code({ className, children, ...props }) {
                    if (className)
                      return <code className={className} {...props}>{children}</code>
                    return (
                      <code
                        className="px-2 py-1 rounded-md text-[13px] font-medium"
                        style={{
                          background: 'var(--primary-soft)',
                          color: 'var(--primary)',
                          fontFamily: 'var(--font-mono)',
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  p({ children }) { return <p className="mb-2 last:mb-0">{children}</p> },
                  ul({ children }) { return <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul> },
                  ol({ children }) { return <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol> },
                  blockquote({ children }) {
                    return <blockquote className="border-l-2 pl-3 my-2 italic" style={{ borderColor: 'var(--primary)', color: 'var(--text-secondary)' }}>{children}</blockquote>
                  },
                  a({ href, children }) {
                    if (!href) return <span>{children}</span>
                    let url: URL | undefined
                    try { url = new URL(href) } catch { return <span>{children}</span> }
                    if (url.protocol !== 'https:' && url.protocol !== 'http:' && url.protocol !== 'mailto:') return <span>{children}</span>
                    return <a href={url.href} className="underline underline-offset-2" style={{ color: 'var(--primary)' }} target="_blank" rel="noopener noreferrer">{children}</a>
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span
                  className="inline-block w-1.5 h-4 ml-1 align-middle rounded-full animate-pulse"
                  style={{ background: 'var(--primary)', boxShadow: '0 0 8px var(--primary-glow)' }}
                />
              )}
            </div>
          )}

          {/* Action buttons — always visible */}
          {!isStreaming && (
            <div className={`flex gap-1 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {isUser && message.failed ? (
                <button
                  onClick={() => onRetry?.(message.id)}
                  className="px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all hover:opacity-80 active:scale-95"
                  style={{ background: 'var(--copy-btn-bg)', border: '1px solid var(--border)', color: 'var(--primary)' }}
                  title="重新发送"
                >
                  重新发送
                </button>
              ) : (
                isUser && (
                  <>
                    <button
                      onClick={() => { setEditValue(message.content); setEditing(true) }}
                      className="px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all hover:opacity-80 active:scale-95"
                      style={{ background: 'var(--copy-btn-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                      title="编辑"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => onDelete?.(message.id)}
                      className="px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all hover:opacity-80 active:scale-95"
                      style={{ background: 'var(--copy-btn-bg)', border: '1px solid var(--border)', color: 'var(--danger)' }}
                      title="删除"
                    >
                      删除
                    </button>
                  </>
                )
              )}
              <button
                onClick={handleCopyMessage}
                className="px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all hover:opacity-80 active:scale-95"
                style={{ background: 'var(--copy-btn-bg)', border: '1px solid var(--border)', color: copied ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})