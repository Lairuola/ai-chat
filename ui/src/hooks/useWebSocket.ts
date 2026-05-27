import type { WsInMessage, WsOutMessage } from '../types'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useWebSocket(onMessage?: (msg: WsOutMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [retriesExhausted, setRetriesExhausted] = useState(false)
  const stoppedRef = useRef(false)
  const retriesRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const cbRef = useRef(onMessage)
  cbRef.current = onMessage

  const connect = useCallback(() => {
    if (stoppedRef.current)
      return
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING)
      return

    const url = import.meta.env.DEV
      ? 'ws://localhost:3090'
      : `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    const timeout = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING)
        ws.close()
    }, 10000)

    ws.onopen = () => {
      clearTimeout(timeout)
      setIsConnected(true)
      setRetriesExhausted(false)
      retriesRef.current = 0
    }

    ws.onclose = () => {
      clearTimeout(timeout)
      setIsConnected(false)
      if (stoppedRef.current)
        return
      if (retriesRef.current < 3) {
        retriesRef.current++
        timerRef.current = setTimeout(connect, 2 ** (retriesRef.current - 1) * 1000)
      }
      else {
        setRetriesExhausted(true)
      }
    }

    ws.onmessage = (e) => {
      try { cbRef.current?.(JSON.parse(e.data)) }
      catch { /* ignore malformed */ }
    }

    ws.onerror = () => { /* onclose fires after this */ }
  }, [])

  useEffect(() => {
    stoppedRef.current = false
    connect()
    return () => {
      stoppedRef.current = true
      clearTimeout(timerRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const reconnect = useCallback(() => {
    clearTimeout(timerRef.current)
    wsRef.current?.close()
    retriesRef.current = 0
    setRetriesExhausted(false)
    connect()
  }, [connect])

  return {
    isConnected,
    retriesExhausted,
    reconnect,
    send: (msg: WsInMessage) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(msg))
        return true
      }
      return false
    },
  }
}
