import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWebSocket } from './useWebSocket'

function createMockWs() {
  const ws: any = { readyState: 0, close: vi.fn(() => { ws.readyState = 3 }), send: vi.fn() }
  ws.onopen = null
  ws.onclose = null
  ws.onmessage = null
  ws.onerror = null
  return ws
}

let currentMock: any

beforeEach(() => {
  currentMock = createMockWs()

  // Preserve WebSocket static properties that the hook's code uses (WebSocket.OPEN etc.)
  const OrigWs = globalThis.WebSocket
  const MockWebSocket = function () { return currentMock } as any
  MockWebSocket.CONNECTING = OrigWs?.CONNECTING ?? 0
  MockWebSocket.OPEN = OrigWs?.OPEN ?? 1
  MockWebSocket.CLOSING = OrigWs?.CLOSING ?? 2
  MockWebSocket.CLOSED = OrigWs?.CLOSED ?? 3
  globalThis.WebSocket = MockWebSocket
})

afterEach(() => {
  delete (globalThis as any).WebSocket
})

describe('useWebSocket', () => {
  it('连接成功后设置 isConnected', () => {
    const { result } = renderHook(() => useWebSocket())

    expect(result.current.isConnected).toBe(false)
    act(() => { currentMock.onopen() })
    expect(result.current.isConnected).toBe(true)
    expect(result.current.retriesExhausted).toBe(false)
  })

  it('连接关闭后设置 isConnected 为 false', () => {
    const { result } = renderHook(() => useWebSocket())

    act(() => { currentMock.onopen() })
    expect(result.current.isConnected).toBe(true)

    act(() => { currentMock.onclose({}) })
    expect(result.current.isConnected).toBe(false)
  })

  it('reconnect 重置重试计数', () => {
    const { result } = renderHook(() => useWebSocket())

    act(() => { currentMock.onopen() })
    act(() => { currentMock.onclose({}) })

    act(() => { result.current.reconnect() })
    expect(result.current.retriesExhausted).toBe(false)
  })

  it('send 返回 true 当连接已打开', () => {
    const { result } = renderHook(() => useWebSocket())

    currentMock.readyState = 1 // OPEN
    act(() => { currentMock.onopen() })

    const sent = result.current.send({ type: 'chat', convId: '1', messages: [{ role: 'user', content: 'hi' }] })
    expect(sent).toBe(true)
    expect(currentMock.send).toHaveBeenCalledWith(expect.stringContaining('"convId":"1"'))
  })

  it('send 返回 false 当未连接', () => {
    const { result } = renderHook(() => useWebSocket())

    const sent = result.current.send({ type: 'chat', convId: '1', messages: [] })
    expect(sent).toBe(false)
    expect(currentMock.send).not.toHaveBeenCalled()
  })

  it('onmessage 触发回调', () => {
    const onMessage = vi.fn()
    renderHook(() => useWebSocket(onMessage))

    act(() => { currentMock.onopen() })
    act(() => { currentMock.onmessage({ data: JSON.stringify({ type: 'done', convId: '1' }) }) })
    expect(onMessage).toHaveBeenCalledWith({ type: 'done', convId: '1' })
  })

  it('onmessage 忽略非法 JSON', () => {
    const onMessage = vi.fn()
    renderHook(() => useWebSocket(onMessage))

    act(() => { currentMock.onopen() })
    act(() => { currentMock.onmessage({ data: 'not-json' }) })
    expect(onMessage).not.toHaveBeenCalled()
  })

  it('cleanup 关闭连接', () => {
    const { unmount } = renderHook(() => useWebSocket())

    act(() => { currentMock.onopen() })
    unmount()
    expect(currentMock.close).toHaveBeenCalled()
  })

  it('连接超时 10s 关闭', () => {
    vi.useFakeTimers()
    renderHook(() => useWebSocket())

    act(() => { vi.advanceTimersByTime(10_000) })
    expect(currentMock.close).toHaveBeenCalled()
  })

  it('重试后重置超时计时器', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useWebSocket())

    act(() => { currentMock.onopen() })
    act(() => { currentMock.onclose({}) })
    act(() => { result.current.reconnect() })
    act(() => { vi.advanceTimersByTime(10_000) })
  })
})
