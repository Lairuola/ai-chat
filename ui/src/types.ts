export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface WsInMessage {
  type: 'chat'
  convId: string
  messages: { role: 'user' | 'assistant', content: string }[]
}

export type WsOutMessage
  = | { type: 'stream', convId: string, chunk: string }
    | { type: 'done', convId: string }
    | { type: 'error', convId: string, message: string }
