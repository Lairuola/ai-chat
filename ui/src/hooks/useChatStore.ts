import type { Conversation, Message, WsInMessage } from '../types'
import { useEffect, useReducer } from 'react'

const STORAGE_KEY = 'chat-conversations'

function genId(): string {
  return crypto.randomUUID()
}

/* ─── State ─── */

interface ChatState {
  conversations: Conversation[]
  activeId: string
  streamingConvId: string | null
  pendingConvId: string | null
  error: string | null
}

/* ─── Actions ─── */

type ChatAction
  = | { type: 'SET_ACTIVE', id: string }
    | { type: 'CREATE_CONV', id: string }
    | { type: 'DELETE_CONV', id: string }
    | { type: 'CLEAR_CONV', id: string }
    | { type: 'ADD_MESSAGE', convId: string, role: 'user' | 'assistant', content: string }
    | { type: 'STREAM_CHUNK', convId: string, chunk: string }
    | { type: 'STREAM_DONE', convId: string }
    | { type: 'SYNC', conversations: Conversation[] }
    | { type: 'SET_PENDING', convId: string | null }
    | { type: 'SET_ERROR', message: string | null }

/* ─── Reducer ─── */

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_ACTIVE':
      return { ...state, activeId: action.id }

    case 'CREATE_CONV': {
      const conv: Conversation = {
        id: action.id,
        title: '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      return {
        ...state,
        conversations: [conv, ...state.conversations],
        activeId: conv.id,
      }
    }

    case 'DELETE_CONV': {
      const filtered = state.conversations.filter(c => c.id !== action.id)
      return {
        ...state,
        conversations: filtered,
        activeId: state.activeId === action.id ? (filtered[0]?.id || '') : state.activeId,
      }
    }

    case 'CLEAR_CONV':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.id ? { ...c, messages: [], updatedAt: Date.now() } : c,
        ),
      }

    case 'ADD_MESSAGE': {
      const msg: Message = {
        id: genId(),
        role: action.role,
        content: action.content,
        timestamp: Date.now(),
      }
      return {
        ...state,
        conversations: state.conversations.map((c) => {
          if (c.id !== action.convId)
            return c
          const title = c.messages.length === 0 && action.role === 'user'
            ? action.content.slice(0, 30)
            : c.title
          return { ...c, title, messages: [...c.messages, msg], updatedAt: Date.now() }
        }),
      }
    }

    case 'STREAM_CHUNK': {
      const { convId, chunk } = action
      return {
        ...state,
        streamingConvId: convId,
        pendingConvId: null,
        conversations: state.conversations.map((c) => {
          if (c.id !== convId)
            return c
          const msgs = [...c.messages]
          const last = msgs[msgs.length - 1]
          const newContent = (last?.role === 'assistant' ? last.content : '') + chunk
          if (last?.role === 'assistant') {
            msgs[msgs.length - 1] = { ...last, content: newContent }
          }
          else {
            msgs.push({
              id: genId(),
              role: 'assistant',
              content: newContent,
              timestamp: Date.now(),
            })
          }
          return { ...c, messages: msgs, updatedAt: Date.now() }
        }),
      }
    }

    case 'STREAM_DONE':
      return { ...state, streamingConvId: null, pendingConvId: null }

    case 'SYNC': {
      const merged = new Map(state.conversations.map(c => [c.id, c]))
      for (const rc of action.conversations) {
        const existing = merged.get(rc.id)
        if (!existing || rc.updatedAt > existing.updatedAt) {
          merged.set(rc.id, rc)
        }
      }
      return {
        ...state,
        conversations: Array.from(merged.values()).sort((a, b) => b.updatedAt - a.updatedAt),
      }
    }

    case 'SET_PENDING':
      return { ...state, pendingConvId: action.convId }

    case 'SET_ERROR':
      return { ...state, error: action.message }

    default:
      return state
  }
}

/* ─── Initial state from localStorage ─── */

function load(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  }
  catch {
    localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

/* ─── Hook ─── */

export function useChatStore() {
  const [state, dispatch] = useReducer(chatReducer, null, () => {
    const convs = load()
    return {
      conversations: convs,
      activeId: convs[0]?.id || '',
      streamingConvId: null,
      pendingConvId: null,
      error: null,
    }
  })

  // Persist conversations
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.conversations)) }
    catch { /* ignore */ }
  }, [state.conversations])

  const activeConv = state.conversations.find(c => c.id === state.activeId) || null
  const canCreate = state.conversations.length === 0 || state.conversations.every(c => c.messages.length > 0)

  return {
    /* ── state ── */
    conversations: state.conversations,
    activeId: state.activeId,
    activeConv,
    canCreate,
    isStreaming: state.streamingConvId !== null,
    isPending: state.pendingConvId !== null,
    error: state.error,

    /* ── actions ── */
    setActiveId: (id: string) => dispatch({ type: 'SET_ACTIVE', id }),
    setError: (message: string | null) => dispatch({ type: 'SET_ERROR', message }),

    createConv: () => {
      const id = genId()
      dispatch({ type: 'CREATE_CONV', id })
      return id
    },

    deleteConv: (id: string) => dispatch({ type: 'DELETE_CONV', id }),
    clearConv: (id: string) => dispatch({ type: 'CLEAR_CONV', id }),

    addMessage: (convId: string, role: 'user' | 'assistant', content: string) =>
      dispatch({ type: 'ADD_MESSAGE', convId, role, content }),

    handleStreamChunk: (convId: string, chunk: string) =>
      dispatch({ type: 'STREAM_CHUNK', convId, chunk }),

    handleStreamDone: (convId: string) =>
      dispatch({ type: 'STREAM_DONE', convId }),

    syncAll: (conversations: Conversation[]) =>
      dispatch({ type: 'SYNC', conversations }),

    /* ── high-level send (with conversation history for AI) ── */
    sendMessage: (content: string, sendFn: (msg: WsInMessage) => boolean) => {
      const contentTrimmed = content.trim()
      if (!contentTrimmed) return

      let convId = state.activeId
      let history: { role: 'user' | 'assistant', content: string }[] = []

      if (!convId) {
        convId = genId()
        dispatch({ type: 'CREATE_CONV', id: convId })
      }
      else {
        const conv = state.conversations.find(c => c.id === convId)
        if (conv) {
          history = conv.messages.map(m => ({ role: m.role, content: m.content }))
        }
      }

      history.push({ role: 'user', content: contentTrimmed })

      dispatch({ type: 'ADD_MESSAGE', convId, role: 'user', content: contentTrimmed })
      dispatch({ type: 'SET_PENDING', convId })

      if (!sendFn({ type: 'chat', convId, messages: history })) {
        dispatch({ type: 'SET_PENDING', convId: null })
        dispatch({ type: 'SET_ERROR', message: '发送失败，未连接到服务器' })
      }
    },
  }
}
