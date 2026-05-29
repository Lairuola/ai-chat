import type { WsInMessage } from '../types'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatStore } from './useChatStore'

beforeEach(() => {
  localStorage.clear()
})

describe('useChatStore', () => {
  it('初始状态为空', () => {
    const { result } = renderHook(() => useChatStore())
    expect(result.current.conversations).toEqual([])
    expect(result.current.activeId).toBe('')
    expect(result.current.activeConv).toBeNull()
    expect(result.current.isStreaming).toBe(false)
    expect(result.current.isPending).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('createConv 创建新会话并设为活跃', () => {
    const { result } = renderHook(() => useChatStore())
    let id = ''
    act(() => { id = result.current.createConv() })
    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations[0].title).toBe('新对话')
    expect(result.current.activeId).toBe(id)
    expect(result.current.activeId).toBe(result.current.conversations[0].id)
  })

  it('addMessage 追加消息，首条用户消息自动设为标题', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '帮我写一段代码', 'test-msg-id-1') })
    expect(result.current.activeConv!.messages).toHaveLength(1)
    expect(result.current.activeConv!.title).toBe('帮我写一段代码')
  })

  it('addMessage 追加多条消息保持标题不变', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '第一条消息', 'test-msg-id-1') })
    act(() => { result.current.addMessage(convId, 'assistant', '回复', 'test-msg-id-2') })
    act(() => { result.current.addMessage(convId, 'user', '第二条消息', 'test-msg-id-3') })
    expect(result.current.activeConv!.messages).toHaveLength(3)
    expect(result.current.activeConv!.title).toBe('第一条消息')
  })

  it('deleteConv 删除会话', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.deleteConv(convId) })
    expect(result.current.conversations).toHaveLength(0)
    expect(result.current.activeId).toBe('')
  })

  it('clearConv 清空消息但保留会话', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '测试', 'test-msg-id') })
    act(() => { result.current.clearConv(convId) })
    expect(result.current.activeConv!.messages).toHaveLength(0)
    expect(result.current.conversations).toHaveLength(1)
  })

  it('handleStreamChunk 创建新的 AI 消息', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '你好', 'test-msg-id-1') })
    act(() => { result.current.handleStreamChunk(convId, '你好！', 'test-msg-id-2') })
    expect(result.current.activeConv!.messages).toHaveLength(2)
    expect(result.current.activeConv!.messages[1].role).toBe('assistant')
    expect(result.current.activeConv!.messages[1].content).toBe('你好！')
    expect(result.current.isStreaming).toBe(true)
  })

  it('handleStreamChunk 追加到已有的 AI 消息', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '你好', 'test-msg-id-1') })
    act(() => { result.current.handleStreamChunk(convId, '第一', 'test-msg-id-2') })
    act(() => { result.current.handleStreamChunk(convId, '第二', 'test-msg-id-2') })
    expect(result.current.activeConv!.messages).toHaveLength(2)
    expect(result.current.activeConv!.messages[1].content).toBe('第一第二')
    expect(result.current.isStreaming).toBe(true)
  })

  it('handleStreamDone 清除流式状态', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.handleStreamChunk(convId, '内容', 'test-msg-id') })
    expect(result.current.isStreaming).toBe(true)
    act(() => { result.current.handleStreamDone(convId) })
    expect(result.current.isStreaming).toBe(false)
  })

  it('setError 设置和清除错误', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.setError('出错了') })
    expect(result.current.error).toBe('出错了')
    act(() => { result.current.setError(null) })
    expect(result.current.error).toBeNull()
  })

  it('syncAll 合并远程会话', () => {
    const { result } = renderHook(() => useChatStore())
    const remoteConv = {
      id: 'remote1',
      title: '远程会话',
      messages: [
        { id: 'r1', role: 'user' as const, content: '远程消息', timestamp: 1000 },
      ],
      createdAt: 1000,
      updatedAt: 2000,
    }
    act(() => { result.current.syncAll([remoteConv]) })
    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations[0].title).toBe('远程会话')
  })

  it('数据持久化到 LocalStorage', () => {
    const { result, unmount } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '持久化测试', 'test-msg-id') })
    unmount()

    const { result: result2 } = renderHook(() => useChatStore())
    expect(result2.current.conversations).toHaveLength(1)
    expect(result2.current.conversations[0].title).toBe('持久化测试')
  })

  it('deleteConv 删除非活跃会话不改变 activeId', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const id1 = result.current.activeId
    act(() => { result.current.createConv() })
    const id2 = result.current.activeId
    expect(result.current.conversations).toHaveLength(2)
    act(() => { result.current.deleteConv(id1) })
    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.activeId).toBe(id2)
  })

  it('sendMessage 无活跃会话时创建新会话', () => {
    const sendFn = vi.fn(() => true)
    const { result } = renderHook(() => useChatStore())
    expect(result.current.activeId).toBe('')
    act(() => { result.current.sendMessage('新消息', sendFn) })
    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations[0].messages).toHaveLength(1)
    expect(result.current.conversations[0].messages[0].content).toBe('新消息')
    expect(sendFn).toHaveBeenCalledOnce()
  })

  it('sendMessage 空内容不执行', () => {
    const sendFn = vi.fn()
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.sendMessage('   ', sendFn) })
    expect(result.current.conversations).toHaveLength(0)
    expect(sendFn).not.toHaveBeenCalled()
  })

  it('sendMessage 发送失败设置错误', () => {
    const sendFn = vi.fn(() => false)
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.sendMessage('会失败的消息', sendFn) })
    expect(result.current.error).toBe('发送失败，未连接到服务器')
    expect(result.current.isPending).toBe(false)
  })

  it('sendMessage 使用已有活跃会话', () => {
    const sendFn = vi.fn(() => true)
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '历史消息', 'test-msg-id-1') })
    act(() => { result.current.sendMessage('新消息', sendFn) })
    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.activeConv!.messages).toHaveLength(2)
    expect(sendFn).toHaveBeenCalledWith(
      expect.objectContaining({ convId, type: 'chat' }),
    )
  })

  it('sendMessage 发送时携带历史上下文', () => {
    const sendFn = vi.fn(() => true)
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '上一条', 'test-msg-id-1') })
    act(() => { result.current.addMessage(convId, 'assistant', '回复', 'test-msg-id-2') })
    act(() => { result.current.sendMessage('再来一条', sendFn) })
    const callArg = (sendFn as unknown as { mock: { calls: Array<[WsInMessage]> } }).mock.calls[0]![0]
    expect(callArg?.messages).toHaveLength(3)
    expect(callArg?.messages[0].content).toBe('上一条')
  })

  it('STREAM_CHUNK 当没有上一条 AI 消息时创建新消息', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.handleStreamChunk(convId, '首个块', 'test-msg-id') })
    expect(result.current.activeConv!.messages).toHaveLength(1)
    expect(result.current.activeConv!.messages[0].role).toBe('assistant')
    expect(result.current.isStreaming).toBe(true)
  })

  it('SYNC 合并时本地更新保留', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '本地消息', 'test-msg-id') })

    const remoteConv = {
      id: convId,
      title: '远程标题',
      messages: [],
      createdAt: 1000,
      updatedAt: 1, // older than local
    }
    act(() => { result.current.syncAll([remoteConv]) })
    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations[0].title).toBe('本地消息') // local message set title
  })

  it('SYNC 合并时远程更新覆盖', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId

    const remoteConv = {
      id: convId,
      title: '远程最新',
      messages: [{ id: 'r1', role: 'user' as const, content: '远程', timestamp: 5000 }],
      createdAt: 1000,
      updatedAt: Date.now() + 100000, // newer
    }
    act(() => { result.current.syncAll([remoteConv]) })
    expect(result.current.conversations[0].title).toBe('远程最新')
    expect(result.current.conversations[0].messages).toHaveLength(1)
  })

  it('SYNC 合并本地和远程不重复', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const localId = result.current.activeId

    const remoteConv = {
      id: 'remote-only',
      title: '仅远程',
      messages: [],
      createdAt: 2000,
      updatedAt: 3000,
    }
    act(() => { result.current.syncAll([remoteConv]) })
    expect(result.current.conversations).toHaveLength(2)
    expect(result.current.conversations.some(c => c.id === remoteConv.id)).toBe(true)
    expect(result.current.conversations.some(c => c.id === localId)).toBe(true)
  })

  it('canCreate 所有会话都有消息时为 true', () => {
    const { result } = renderHook(() => useChatStore())
    expect(result.current.canCreate).toBe(true)
    act(() => { result.current.createConv() })
    expect(result.current.canCreate).toBe(false)
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '消息', 'test-msg-id') })
    expect(result.current.canCreate).toBe(true)
  })

  it('setActiveId 切换活跃会话', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const id1 = result.current.activeId
    act(() => { result.current.createConv() })
    const id2 = result.current.activeId
    act(() => { result.current.setActiveId(id1) })
    expect(result.current.activeId).toBe(id1)
    expect(result.current.activeId).not.toBe(id2)
  })

  it('localStorage 数据损坏回退到空数组', () => {
    localStorage.setItem('chat-conversations', '{corrupt-json')
    const { result } = renderHook(() => useChatStore())
    expect(result.current.conversations).toEqual([])
    expect(result.current.activeId).toBe('')
  })

  it('setTitle 修改会话标题', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '原始标题', 'test-msg-id') })
    act(() => { result.current.setTitle(convId, '新标题') })
    expect(result.current.activeConv!.title).toBe('新标题')
  })

  it('editMessage 修改消息内容', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '原始内容', 'test-msg-id') })
    act(() => { result.current.editMessage(convId, 'test-msg-id', '修改后的内容') })
    expect(result.current.activeConv!.messages[0].content).toBe('修改后的内容')
  })

  it('deleteMessage 删除消息', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '要删除的消息', 'test-msg-id') })
    expect(result.current.activeConv!.messages).toHaveLength(1)
    act(() => { result.current.deleteMessage(convId, 'test-msg-id') })
    expect(result.current.activeConv!.messages).toHaveLength(0)
  })

  it('undoDeleteMessage 恢复已删除的消息', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '消息', 'test-msg-id') })
    act(() => { result.current.deleteMessage(convId, 'test-msg-id') })
    expect(result.current.activeConv!.messages).toHaveLength(0)
    const deletedMsg = { id: 'test-msg-id', role: 'user' as const, content: '消息', timestamp: 1000 }
    act(() => { result.current.undoDeleteMessage(convId, deletedMsg) })
    expect(result.current.activeConv!.messages).toHaveLength(1)
    expect(result.current.activeConv!.messages[0].content).toBe('消息')
  })

  it('markMessageFailed 标记消息失败', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '消息', 'test-msg-id') })
    expect(result.current.activeConv!.messages[0].failed).toBeUndefined()
    act(() => { result.current.markMessageFailed(convId, 'test-msg-id') })
    expect(result.current.activeConv!.messages[0].failed).toBe(true)
  })

  it('clearMessageFailed 清除消息失败状态', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '消息', 'test-msg-id') })
    act(() => { result.current.markMessageFailed(convId, 'test-msg-id') })
    expect(result.current.activeConv!.messages[0].failed).toBe(true)
    act(() => { result.current.clearMessageFailed(convId, 'test-msg-id') })
    expect(result.current.activeConv!.messages[0].failed).toBe(false)
  })

  it('retryMessage 重试发送失败的消息', () => {
    const sendFn = vi.fn(() => true)
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    act(() => { result.current.addMessage(convId, 'user', '失败的消息', 'test-msg-id') })
    act(() => { result.current.markMessageFailed(convId, 'test-msg-id') })
    act(() => { result.current.retryMessage(convId, 'test-msg-id', sendFn) })
    expect(result.current.isPending).toBe(true)
    expect(sendFn).toHaveBeenCalled()
  })

  it('retryMessage 无效消息不重试', () => {
    const sendFn = vi.fn(() => true)
    const { result } = renderHook(() => useChatStore())
    act(() => { result.current.createConv() })
    const convId = result.current.activeId
    // retry with non-existent message
    act(() => { result.current.retryMessage(convId, 'non-existent-id', sendFn) })
    expect(sendFn).not.toHaveBeenCalled()
  })
})
