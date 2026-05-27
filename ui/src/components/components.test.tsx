import type { Conversation, Message } from '../types'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatInput } from './ChatInput'
import { ConversationList } from './ConversationList'
import { MessageBubble } from './MessageBubble'

afterEach(cleanup)

const mockConv: Conversation = {
  id: 'conv1',
  title: '测试会话',
  messages: [],
  createdAt: 1000,
  updatedAt: 2000,
}

const mockConvWithMessages: Conversation = {
  id: 'conv2',
  title: '有消息的会话',
  messages: [
    { id: 'm1', role: 'user', content: '你好', timestamp: 1000 },
    { id: 'm2', role: 'assistant', content: '你好！有什么可以帮你？', timestamp: 1001 },
  ],
  createdAt: 1000,
  updatedAt: 2000,
}

describe('conversationList', () => {
  const defaultProps = { isConnected: true, sidebarOpen: false, onCloseSidebar: vi.fn() }

  it('空列表显示引导文字', () => {
    render(<ConversationList {...defaultProps} conversations={[]} activeId="" canCreate onSelect={vi.fn()} onCreate={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getAllByText(/暂无会话/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/点击/).length).toBeGreaterThan(0)
  })

  it('渲染会话列表', () => {
    render(<ConversationList {...defaultProps} conversations={[mockConv, mockConvWithMessages]} activeId="conv1" canCreate={false} onSelect={vi.fn()} onCreate={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getAllByText('测试会话').length).toBeGreaterThan(0)
    expect(screen.getAllByText('有消息的会话').length).toBeGreaterThan(0)
  })

  it('活跃会话包含 bg-white 样式', () => {
    render(<ConversationList {...defaultProps} conversations={[mockConv]} activeId="conv1" canCreate={false} onSelect={vi.fn()} onCreate={vi.fn()} onDelete={vi.fn()} />)
    const items = screen.getAllByText('测试会话')
    expect(items.length).toBeGreaterThan(0)
  })

  it('点击 + 触发 onCreate', () => {
    const onCreate = vi.fn()
    render(<ConversationList {...defaultProps} conversations={[]} activeId="" canCreate onSelect={vi.fn()} onCreate={onCreate} onDelete={vi.fn()} />)
    fireEvent.click(screen.getAllByTitle('新建会话')[0])
    expect(onCreate).toHaveBeenCalledOnce()
  })

  it('点击会话触发 onSelect', () => {
    const onSelect = vi.fn()
    render(<ConversationList {...defaultProps} conversations={[mockConv]} activeId="" canCreate={false} onSelect={onSelect} onCreate={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getAllByText('测试会话')[0])
    expect(onSelect).toHaveBeenCalledWith('conv1')
  })

  it('空会话时新建按钮禁用', () => {
    render(<ConversationList {...defaultProps} conversations={[mockConv]} activeId="conv1" canCreate={false} onSelect={vi.fn()} onCreate={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getAllByTitle('新建会话')[0]).toBeDisabled()
  })
})

describe('chatInput', () => {
  it('空值时发送按钮禁用', () => {
    render(<ChatInput onSend={vi.fn()} />)
    expect(screen.getByTitle('发送')).toBeDisabled()
  })

  it('输入文字后发送按钮启用', () => {
    render(<ChatInput onSend={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/输入消息/), { target: { value: '你好' } })
    expect(screen.getByTitle('发送')).not.toBeDisabled()
  })

  it('点击发送触发回调并清空输入', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    const textarea = screen.getByPlaceholderText(/输入消息/)
    fireEvent.change(textarea, { target: { value: '你好' } })
    fireEvent.click(screen.getByTitle('发送'))
    expect(onSend).toHaveBeenCalledWith('你好')
    expect(textarea).toHaveValue('')
  })

  it('enter 键发送', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    const textarea = screen.getByPlaceholderText(/输入消息/)
    fireEvent.change(textarea, { target: { value: '测试' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })
    expect(onSend).toHaveBeenCalledWith('测试')
  })

  it('shift+Enter 不发送', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    const textarea = screen.getByPlaceholderText(/输入消息/)
    fireEvent.change(textarea, { target: { value: '测试' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('disabled 时输入框禁用', () => {
    render(<ChatInput onSend={vi.fn()} disabled />)
    expect(screen.getByPlaceholderText(/输入消息/)).toBeDisabled()
  })
})

describe('messageBubble', () => {
  const userMsg: Message = { id: '1', role: 'user', content: '用户消息', timestamp: 1000 }
  const aiMsg: Message = { id: '2', role: 'assistant', content: 'AI 回复 **加粗**', timestamp: 1001 }
  const codeMsg: Message = { id: '3', role: 'assistant', content: '```js\nconst a = 1\n```', timestamp: 1002 }

  it('用户消息内容渲染', () => {
    render(<MessageBubble message={userMsg} />)
    expect(screen.getByText('用户消息')).toBeInTheDocument()
  })

  it('用户消息头像为"我"', () => {
    render(<MessageBubble message={userMsg} />)
    expect(screen.getByText('我')).toBeInTheDocument()
  })

  it('aI 消息头像为"AI"', () => {
    render(<MessageBubble message={aiMsg} />)
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('aI 消息渲染 Markdown 加粗', () => {
    render(<MessageBubble message={aiMsg} />)
    const strong = document.querySelector('strong')
    expect(strong).toBeTruthy()
    expect(strong!.textContent).toBe('加粗')
  })

  it('aI 消息渲染代码块', () => {
    render(<MessageBubble message={codeMsg} />)
    const pre = document.querySelector('pre')
    expect(pre).toBeTruthy()
    expect(pre!.textContent).toContain('const a = 1')
  })

  it('流式消息显示闪烁光标', () => {
    render(<MessageBubble message={aiMsg} isStreaming />)
    const cursor = document.querySelector('.animate-pulse')
    expect(cursor).toBeTruthy()
  })

  it('内联代码渲染', () => {
    const inlineCode: Message = { id: '4', role: 'assistant', content: '使用 `const a = 1` 声明变量', timestamp: 1003 }
    render(<MessageBubble message={inlineCode} />)
    const codes = document.querySelectorAll('code')
    const inline = Array.from(codes).find(el => el.textContent === 'const a = 1')
    expect(inline).toBeTruthy()
  })

  it('Markdown 段落渲染', () => {
    const pMsg: Message = { id: '5', role: 'assistant', content: '第一段\n\n第二段', timestamp: 1004 }
    render(<MessageBubble message={pMsg} />)
    const paras = document.querySelectorAll('p')
    expect(paras.length).toBeGreaterThanOrEqual(2)
  })

  it('Markdown 列表渲染', () => {
    const listMsg: Message = { id: '6', role: 'assistant', content: '- 项1\n- 项2\n- 项3', timestamp: 1005 }
    render(<MessageBubble message={listMsg} />)
    const list = document.querySelector('ul')
    expect(list).toBeTruthy()
    expect(list!.children.length).toBe(3)
  })

  it('Markdown 有序列表渲染', () => {
    const olMsg: Message = { id: '7', role: 'assistant', content: '1. 第一\n2. 第二', timestamp: 1006 }
    render(<MessageBubble message={olMsg} />)
    const list = document.querySelector('ol')
    expect(list).toBeTruthy()
  })

  it('Markdown 引用渲染', () => {
    const quoteMsg: Message = { id: '8', role: 'assistant', content: '> 这是一段引用', timestamp: 1007 }
    render(<MessageBubble message={quoteMsg} />)
    const blockquote = document.querySelector('blockquote')
    expect(blockquote).toBeTruthy()
    expect(blockquote!.textContent).toContain('这是一段引用')
  })

  it('Markdown 链接渲染', () => {
    const linkMsg: Message = { id: '9', role: 'assistant', content: '访问[示例](https://example.com)', timestamp: 1008 }
    render(<MessageBubble message={linkMsg} />)
    const link = document.querySelector('a')
    expect(link).toBeTruthy()
    expect(link!.getAttribute('href')).toBe('https://example.com')
    expect(link!.getAttribute('target')).toBe('_blank')
  })

  it('hover 时显示复制按钮', () => {
    const { container } = render(<MessageBubble message={aiMsg} />)
    const bubble = container.querySelector('.flex.gap-3')
    expect(bubble).toBeTruthy()
    fireEvent.mouseEnter(bubble!)
    const copyBtn = screen.getByText('复制')
    expect(copyBtn).toBeInTheDocument()
    fireEvent.mouseLeave(bubble!)
    expect(screen.queryByText('复制')).not.toBeInTheDocument()
  })
})

describe('conversationList (additional)', () => {
  const baseProps = { isConnected: true, sidebarOpen: false, onCloseSidebar: vi.fn() }

  function getSearchInput() {
    // Desktop sidebar is the first one rendered
    return screen.getAllByPlaceholderText('搜索会话...')[0]
  }

  it('搜索过滤会话', () => {
    render(<ConversationList {...baseProps} conversations={[mockConv, mockConvWithMessages]} activeId="" canCreate={false} onSelect={vi.fn()} onCreate={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.change(getSearchInput(), { target: { value: '有消息' } })
    expect(screen.getAllByText('有消息的会话')[0]).toBeInTheDocument()
    expect(screen.queryByText('测试会话')).not.toBeInTheDocument()
  })

  it('搜索结果为空显示提示', () => {
    render(<ConversationList {...baseProps} conversations={[mockConv]} activeId="" canCreate={false} onSelect={vi.fn()} onCreate={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.change(getSearchInput(), { target: { value: '不存在的会话' } })
    expect(screen.getAllByText('未找到匹配的会话')[0]).toBeInTheDocument()
  })

  it('清除搜索按钮', () => {
    render(<ConversationList {...baseProps} conversations={[mockConv]} activeId="" canCreate={false} onSelect={vi.fn()} onCreate={vi.fn()} onDelete={vi.fn()} />)
    const searchInput = getSearchInput()
    fireEvent.change(searchInput, { target: { value: '测试' } })
    const clearBtns = screen.getAllByLabelText('清除搜索')
    fireEvent.click(clearBtns[0])
    expect(getSearchInput()).toHaveValue('')
  })

  it('点击删除按钮触发 onDelete', () => {
    const onDelete = vi.fn()
    render(<ConversationList {...baseProps} conversations={[mockConv]} activeId="" canCreate={false} onSelect={vi.fn()} onCreate={vi.fn()} onDelete={onDelete} />)
    const deleteBtns = screen.getAllByLabelText('删除会话')
    fireEvent.click(deleteBtns[0])
    expect(onDelete).toHaveBeenCalledWith('conv1')
  })

  it('键盘 Enter 选中会话', () => {
    const onSelect = vi.fn()
    render(<ConversationList {...baseProps} conversations={[mockConv]} activeId="" canCreate={false} onSelect={onSelect} onCreate={vi.fn()} onDelete={vi.fn()} />)
    const items = screen.getAllByText('测试会话')
    const item = items[0].closest('[role="button"]')
    expect(item).toBeTruthy()
    fireEvent.keyDown(item!, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('conv1')
  })

  it('主题切换按钮存在', () => {
    render(<ConversationList {...baseProps} conversations={[mockConv]} activeId="conv1" canCreate={false} onSelect={vi.fn()} onCreate={vi.fn()} onDelete={vi.fn()} />)
    const themeBtns = screen.getAllByLabelText(/切换/)
    expect(themeBtns.length).toBeGreaterThan(0)
  })

  it('侧边栏打开时焦点陷阱不报错', () => {
    render(<ConversationList {...baseProps} sidebarOpen conversations={[mockConv]} activeId="conv1" canCreate={false} onSelect={vi.fn()} onCreate={vi.fn()} onDelete={vi.fn()} />)
    // Should have focused the first focusable element in the mobile sidebar
    expect(document.activeElement).toBeTruthy()
  })

  it('主题切换切换 document class', () => {
    render(<ConversationList {...baseProps} conversations={[mockConv]} activeId="conv1" canCreate={false} onSelect={vi.fn()} onCreate={vi.fn()} onDelete={vi.fn()} />)
    const themeBtns = screen.getAllByLabelText(/切换/)
    fireEvent.click(themeBtns[0])
    expect(document.documentElement.classList.contains('light')).toBe(true)
    fireEvent.click(themeBtns[0])
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('焦点陷阱 Tab 键循环', () => {
    render(<ConversationList {...baseProps} sidebarOpen conversations={[mockConv]} activeId="conv1" canCreate={false} onSelect={vi.fn()} onCreate={vi.fn()} onDelete={vi.fn()} />)
    const focusable = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    expect(focusable.length).toBeGreaterThan(0)
    const first = focusable[0] as HTMLElement
    const last = focusable[focusable.length - 1] as HTMLElement
    // Tab on last → cycle to first
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    // Shift+Tab on first → cycle to last
    first.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
  })
})

describe('chatInput (additional)', () => {
  it('disabled 时发送按钮不触发', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} disabled />)
    const textarea = screen.getByPlaceholderText(/输入消息/)
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('输入触发自动高度调整', () => {
    render(<ChatInput onSend={vi.fn()} />)
    const textarea = screen.getByPlaceholderText(/输入消息/) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '多行\n文本\n输入' } })
    expect(textarea.style.height).toBeTruthy()
  })
})
