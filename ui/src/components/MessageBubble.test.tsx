import type { Message } from '../types'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MessageBubble } from './MessageBubble'

afterEach(cleanup)

const aiMsg: Message = { id: '2', role: 'assistant', content: 'AI 回复 **加粗**', timestamp: 1001 }
const codeMsg: Message = { id: '3', role: 'assistant', content: '```js\nconst a = 1\n```', timestamp: 1002 }

describe('MessageBubble - clipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Mock clipboard API to resolve
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.resolve()) },
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('CodeBlock 复制切换按钮状态', async () => {
    render(<MessageBubble message={codeMsg} />)
    const copyBtn = screen.getByText('复制')
    expect(copyBtn).toBeInTheDocument()
    await act(async () => { fireEvent.click(copyBtn) })
    expect(screen.getByText('已复制')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByText('复制')).toBeInTheDocument()
  })

  it('消息 Hover 显示复制按钮', () => {
    const { container } = render(<MessageBubble message={aiMsg} />)
    const bubble = container.querySelector('.items-center')
    expect(bubble).toBeTruthy()
    fireEvent.mouseEnter(bubble!)
    expect(screen.getByText('复制')).toBeInTheDocument()
    fireEvent.mouseLeave(bubble!)
    expect(screen.queryByText('复制')).not.toBeInTheDocument()
  })

  it('消息复制按钮切换状态', async () => {
    const { container } = render(<MessageBubble message={aiMsg} />)
    const bubble = container.querySelector('.items-center')
    fireEvent.mouseEnter(bubble!)
    const bubbleCopyBtn = screen.getByText('复制')
    expect(bubbleCopyBtn).toBeInTheDocument()
    await act(async () => { fireEvent.click(bubbleCopyBtn) })
    expect(screen.getByText('已复制')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByText('复制')).toBeInTheDocument()
  })

  it('CodeBlock 显示语言标签', () => {
    render(<MessageBubble message={codeMsg} />)
    // rehype-highlight adds hljs class; the CodeBlock uses `lang` from className
    // It shows "code" as fallback when there's no language- class on the pre element
    expect(screen.getByText('code')).toBeInTheDocument()
  })

  it('流式消息不显示复制按钮', () => {
    render(<MessageBubble message={aiMsg} isStreaming />)
    const bubble = document.querySelector('[class*="flex"]')
    fireEvent.mouseEnter(bubble!)
    expect(screen.queryByText('复制')).not.toBeInTheDocument()
  })

  it('copyToClipboard 回退路径 (clipboard 不可用时用 textarea)', async () => {
    const origClipboard = navigator.clipboard
    const origExecCommand = document.execCommand
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    document.execCommand = vi.fn(() => true) as any

    render(<MessageBubble message={codeMsg} />)
    await act(async () => { fireEvent.click(screen.getByText('复制')) })
    expect(screen.getByText('已复制')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByText('复制')).toBeInTheDocument()

    Object.defineProperty(navigator, 'clipboard', { value: origClipboard, configurable: true })
    document.execCommand = origExecCommand
  })
})
