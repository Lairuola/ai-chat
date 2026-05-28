import type { Message } from '../types'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MessageBubble } from './MessageBubble'

afterEach(cleanup)

const userMsg: Message = { id: '1', role: 'user', content: '用户消息', timestamp: 1000 }
const aiMsg: Message = { id: '2', role: 'assistant', content: 'AI 回复 **加粗**', timestamp: 1001 }
const codeMsg: Message = { id: '3', role: 'assistant', content: '```js\nconst a = 1\n```', timestamp: 1002 }

describe('messageBubble - clipboard', () => {
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

  it('codeBlock 复制切换按钮状态', async () => {
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

  it('codeBlock 显示语言标签', () => {
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

describe('messageBubble - edit/delete', () => {
  it('用户消息 hover 显示编辑和删除按钮', () => {
    const { container } = render(<MessageBubble message={userMsg} />)
    const bubble = container.querySelector('.items-center')
    fireEvent.mouseEnter(bubble!)
    expect(screen.getByText('编辑')).toBeInTheDocument()
    expect(screen.getByText('删除')).toBeInTheDocument()
    fireEvent.mouseLeave(bubble!)
    expect(screen.queryByText('编辑')).not.toBeInTheDocument()
  })

  it('aI 消息 hover 不显示编辑和删除按钮', () => {
    const { container } = render(<MessageBubble message={aiMsg} />)
    const bubble = container.querySelector('.items-center')
    fireEvent.mouseEnter(bubble!)
    expect(screen.queryByText('编辑')).not.toBeInTheDocument()
    expect(screen.queryByText('删除')).not.toBeInTheDocument()
  })

  it('点击编辑进入编辑模式', () => {
    const { container } = render(<MessageBubble message={userMsg} />)
    const bubble = container.querySelector('.items-center')
    fireEvent.mouseEnter(bubble!)
    fireEvent.click(screen.getByText('编辑'))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByText('保存')).toBeInTheDocument()
    expect(screen.getByText('取消')).toBeInTheDocument()
  })

  it('enter 保存编辑内容', () => {
    const onEdit = vi.fn()
    const { container } = render(<MessageBubble message={userMsg} onEdit={onEdit} />)
    fireEvent.mouseEnter(container.querySelector('.items-center')!)
    fireEvent.click(screen.getByText('编辑'))
    const textbox = screen.getByRole('textbox')
    fireEvent.change(textbox, { target: { value: '修改后的内容' } })
    fireEvent.keyDown(textbox, { key: 'Enter', shiftKey: false })
    expect(onEdit).toHaveBeenCalledWith('1', '修改后的内容')
  })

  it('escape 取消编辑恢复原内容', () => {
    const onEdit = vi.fn()
    const { container } = render(<MessageBubble message={userMsg} onEdit={onEdit} />)
    fireEvent.mouseEnter(container.querySelector('.items-center')!)
    fireEvent.click(screen.getByText('编辑'))
    const textbox = screen.getByRole('textbox')
    fireEvent.change(textbox, { target: { value: '修改后的内容' } })
    fireEvent.keyDown(textbox, { key: 'Escape' })
    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('用户消息')).toBeInTheDocument()
  })

  it('保存按钮触发 onEdit', () => {
    const onEdit = vi.fn()
    const { container } = render(<MessageBubble message={userMsg} onEdit={onEdit} />)
    fireEvent.mouseEnter(container.querySelector('.items-center')!)
    fireEvent.click(screen.getByText('编辑'))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '新内容' } })
    fireEvent.click(screen.getByText('保存'))
    expect(onEdit).toHaveBeenCalledWith('1', '新内容')
  })

  it('取消按钮取消编辑', () => {
    const onEdit = vi.fn()
    const { container } = render(<MessageBubble message={userMsg} onEdit={onEdit} />)
    fireEvent.mouseEnter(container.querySelector('.items-center')!)
    fireEvent.click(screen.getByText('编辑'))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '修改' } })
    fireEvent.click(screen.getByText('取消'))
    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('删除按钮触发 onDelete', () => {
    const onDelete = vi.fn()
    const { container } = render(<MessageBubble message={userMsg} onDelete={onDelete} />)
    fireEvent.mouseEnter(container.querySelector('.items-center')!)
    fireEvent.click(screen.getByText('删除'))
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('流式消息不显示编辑和删除按钮', () => {
    const { container } = render(<MessageBubble message={userMsg} isStreaming />)
    fireEvent.mouseEnter(container.querySelector('.items-center')!)
    expect(screen.queryByText('编辑')).not.toBeInTheDocument()
    expect(screen.queryByText('删除')).not.toBeInTheDocument()
  })
})
