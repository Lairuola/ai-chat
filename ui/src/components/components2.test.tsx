import type { Conversation } from '../types'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatHeader } from './ChatHeader'
import { ChatWindow } from './ChatWindow'
import { ErrorBoundary } from './ErrorBoundary'
import { MessageList } from './MessageList'

afterEach(cleanup)

/* ─── ErrorBoundary ─── */

describe('errorBoundary', () => {
  it('正常渲染子组件', () => {
    const { container } = render(<ErrorBoundary><div>正常内容</div></ErrorBoundary>)
    expect(container.textContent).toContain('正常内容')
  })

  it('捕获错误并显示错误 UI', () => {
    const Bomb = () => { throw new Error('测试错误') }
    render(<ErrorBoundary><Bomb /></ErrorBoundary>)
    expect(screen.getByText('出现了意外错误')).toBeInTheDocument()
    expect(screen.getByText('测试错误')).toBeInTheDocument()
    expect(screen.getByText('重新加载')).toBeInTheDocument()
  })

  it('重新加载按钮调用 window.location.reload', () => {
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', { value: { reload: reloadMock }, writable: true, configurable: true })
    const Bomb = () => { throw new Error('错误') }
    render(<ErrorBoundary><Bomb /></ErrorBoundary>)
    fireEvent.click(screen.getByText('重新加载'))
    expect(reloadMock).toHaveBeenCalledOnce()
  })
})

/* ─── ChatHeader ─── */

describe('chatHeader', () => {
  it('有消息时显示清空按钮', () => {
    render(<ChatHeader hasMessages onClear={vi.fn()} onOpenSidebar={vi.fn()} />)
    expect(screen.getByTitle('清空当前对话')).toBeInTheDocument()
  })

  it('无消息时隐藏清空按钮', () => {
    render(<ChatHeader hasMessages={false} onClear={vi.fn()} onOpenSidebar={vi.fn()} />)
    expect(screen.queryByTitle('清空当前对话')).not.toBeInTheDocument()
  })

  it('流式输出时清空按钮禁用', () => {
    render(<ChatHeader hasMessages isStreaming onClear={vi.fn()} onOpenSidebar={vi.fn()} />)
    expect(screen.getByTitle('AI 输出中，无法清空')).toBeDisabled()
  })

  it('点击清空触发回调', () => {
    const onClear = vi.fn()
    render(<ChatHeader hasMessages onClear={onClear} onOpenSidebar={vi.fn()} />)
    fireEvent.click(screen.getByTitle('清空当前对话'))
    expect(onClear).toHaveBeenCalledOnce()
  })
})

/* ─── MessageList ─── */

const today = Date.now()

const convWithMsgs: Conversation = {
  id: 'conv1',
  title: '测试',
  messages: [
    { id: 'm1', role: 'user', content: '你好', timestamp: today },
    { id: 'm2', role: 'assistant', content: '你好！有什么可以帮你？', timestamp: today + 1 },
  ],
  createdAt: 1000,
  updatedAt: 2000,
}

const convNoMsgs: Conversation = {
  id: 'conv2',
  title: '空会话',
  messages: [],
  createdAt: 1000,
  updatedAt: 2000,
}

describe('messageList', () => {
  it('空会话显示空白引导', () => {
    render(<MessageList conversation={convNoMsgs} isConnected isStreaming={false} isPending={false} error={null} onDismissError={vi.fn()} />)
    expect(screen.getByText('开始对话')).toBeInTheDocument()
  })

  it('有消息时渲染气泡', () => {
    render(<MessageList conversation={convWithMsgs} isConnected isStreaming={false} isPending={false} error={null} onDismissError={vi.fn()} />)
    expect(screen.getByText('你好')).toBeInTheDocument()
    expect(screen.getByText('你好！有什么可以帮你？')).toBeInTheDocument()
  })

  it('加载中显示 LoadingDots', () => {
    render(<MessageList conversation={convNoMsgs} isConnected isStreaming={false} isPending error={null} onDismissError={vi.fn()} />)
    const dots = document.querySelectorAll('.animate-bounce')
    expect(dots.length).toBe(3)
  })

  it('错误显示 ErrorBanner', () => {
    render(<MessageList conversation={convWithMsgs} isConnected isStreaming={false} isPending={false} error="网络错误" onDismissError={vi.fn()} />)
    expect(screen.getByText('网络错误')).toBeInTheDocument()
    expect(screen.getByText('关闭')).toBeInTheDocument()
  })

  it('点击关闭忽略错误', () => {
    const onDismiss = vi.fn()
    render(<MessageList conversation={convWithMsgs} isConnected isStreaming={false} isPending={false} error="错误" onDismissError={onDismiss} />)
    fireEvent.click(screen.getByText('关闭'))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('日期分割线渲染', () => {
    render(<MessageList conversation={convWithMsgs} isConnected isStreaming={false} isPending={false} error={null} onDismissError={vi.fn()} />)
    expect(screen.getByText('今天')).toBeInTheDocument()
  })
})

/* ─── ChatWindow ─── */

describe('chatWindow', () => {
  const defaultProps = {
    isConnected: true,
    retriesExhausted: false,
    onReconnect: vi.fn(),
    isStreaming: false,
    isPending: false,
    error: null,
    onSend: vi.fn(),
    onDismissError: vi.fn(),
    onClear: vi.fn(),
    onOpenSidebar: vi.fn(),
  }

  it('无会话时显示空状态', () => {
    render(<ChatWindow {...defaultProps} conversation={null} />)
    expect(screen.getByText('AI 聊天助手')).toBeInTheDocument()
    expect(screen.getByText('选择一个会话或新建开始对话')).toBeInTheDocument()
    expect(screen.getByText('已连接')).toBeInTheDocument()
  })

  it('断连时显示重连按钮', () => {
    render(<ChatWindow {...defaultProps} conversation={null} isConnected={false} retriesExhausted />)
    expect(screen.getByText('未连接')).toBeInTheDocument()
    expect(screen.getByText('重新连接')).toBeInTheDocument()
  })

  it('有会话时渲染聊天区域', () => {
    render(<ChatWindow {...defaultProps} conversation={convWithMsgs} />)
    expect(screen.getByText('你好！有什么可以帮你？')).toBeInTheDocument()
  })

  it('断连横幅显示', () => {
    render(<ChatWindow {...defaultProps} conversation={convWithMsgs} isConnected={false} retriesExhausted />)
    expect(screen.getByText('连接已断开')).toBeInTheDocument()
  })

  it('清空确认对话框', () => {
    render(<ChatWindow {...defaultProps} conversation={convWithMsgs} />)
    fireEvent.click(screen.getByTitle('清空当前对话'))
    expect(screen.getByText('确定清空当前对话？此操作不可撤销。')).toBeInTheDocument()
    fireEvent.click(screen.getByText('取消'))
    expect(screen.queryByText('确定清空当前对话？此操作不可撤销。')).not.toBeInTheDocument()
  })

  it('清空确认后触发 onClear', () => {
    const onClear = vi.fn()
    render(<ChatWindow {...defaultProps} conversation={convWithMsgs} onClear={onClear} />)
    fireEvent.click(screen.getByTitle('清空当前对话'))
    fireEvent.click(screen.getByText('清空'))
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('清空对话框按 Escape 触发取消', () => {
    render(<ChatWindow {...defaultProps} conversation={convWithMsgs} />)
    fireEvent.click(screen.getByTitle('清空当前对话'))
    expect(screen.getByText('确定清空当前对话？此操作不可撤销。')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('确定清空当前对话？此操作不可撤销。')).not.toBeInTheDocument()
  })

  it('未连接时输入框禁用', () => {
    render(<ChatWindow {...defaultProps} conversation={convWithMsgs} isConnected={false} retriesExhausted />)
    expect(screen.getByPlaceholderText(/输入消息/)).toBeDisabled()
  })
})
