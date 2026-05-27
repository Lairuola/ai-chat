# AI Chat Assistant — Design Spec

## Summary
微信风格的 AI 聊天助手。左侧会话列表，右侧聊天窗口。AI 后端为 Claude Code，通过文件桥接 + WebSocket 通信。支持多轮对话、流式输出、历史持久化。

---

## Visual Design

- **Layout**: 微信 PC 双栏——左窄（~260px 会话列表）+ 右宽（聊天窗口）
- **Palette**: 淡蓝灰方案
  - 聊天区背景 `#fafbfc`
  - 用户气泡 `#dce3f0` 右对齐
  - AI 气泡 `#fff` + `1px #e8ecf1` 边框 左对齐
  - 用户头像 `#7c8db5` / AI 头像 `#9ea8c0`
  - 发送按钮 `#7c8db5` 药丸形
  - 侧栏 `#f5f5f7` 底 + `#e5e5e5` 分割线
  - 输入栏 `#f5f7fa` 药丸形
- **Font**: 系统默认（-apple-system / system-ui）
- **Bubble**: 圆角 `16px`，底部尖角 `4px`

---

## Architecture

```
E:\workspace\program\ai-chat\
├── ui/                          # React 前端
│   ├── src/
│   │   ├── App.tsx                    # 主布局：左列表 + 右聊天
│   │   ├── components/
│   │   │   ├── ConversationList.tsx   # 会话列表
│   │   │   ├── ChatWindow.tsx         # 聊天窗口（消息列表 + 输入栏）
│   │   │   ├── MessageBubble.tsx      # 消息气泡
│   │   │   └── ChatInput.tsx          # 底部输入栏
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts        # WebSocket 连接管理
│   │   │   └── useConversations.ts    # 会话管理 + LocalStorage
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/
│   ├── server.js                 # WebSocket + 文件桥接
│   └── package.json
├── bridge/
│   ├── inbox/                    # 用户消息 {convId}.json
│   └── outbox/                   # Claude 回复 {convId}.json
└── conversations/               # 完整历史 {convId}.json
```

### Data Flow

```
用户点击发送
  → ChatInput 触发 onSend
  → useWebSocket 发送 JSON: { type: "message", convId, content }
  → server.js 写入 bridge/inbox/{convId}.json
  → Claude Code /loop 3s 检测到新文件
  → Claude 读取 conversations/{convId}.json（上下文）
  → Claude 生成回复
  → /loop hook 写入 bridge/outbox/{convId}.json
  → server.js fs.watch 检测到 outbox 变化
  → server.js 逐字推送到 WebSocket: { type: "stream", chunk, done }
  → ChatWindow 逐字渲染
  → 回复完成，UI 写入 conversations/{convId}.json + LocalStorage
```

---

## WebSocket Protocol

### Client → Server
```json
{ "type": "message", "convId": "uuid", "content": "用户输入" }
{ "type": "clear", "convId": "uuid" }
{ "type": "create_conversation" }
{ "type": "delete_conversation", "convId": "uuid" }
```

### Server → Client
```json
{ "type": "stream", "convId": "uuid", "chunk": "文", "index": 0 }
{ "type": "stream", "convId": "uuid", "chunk": "字", "index": 1 }
{ "type": "done", "convId": "uuid" }
{ "type": "error", "convId": "uuid", "message": "错误描述" }
```

---

## Data Structures

### Message
```typescript
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}
```

### Conversation
```typescript
interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}
```

### LocalStorage
```typescript
// Key: "chat-conversations"
// Value: Conversation[]
```

---

## Components

### App.tsx
- 管理 `conversations` state + `activeConvId` state
- 左侧 ConversationList + 右侧 ChatWindow
- 启动时从 LocalStorage 加载数据

### ConversationList.tsx
- 渲染会话列表
- 点击切换 activeConvId
- "+" 新建会话
- 右键删除

### ChatWindow.tsx
- 渲染当前会话的消息列表
- 底部 ChatInput
- 流式接收 WebSocket 数据
- 加载状态动画
- 错误提示横幅
- "清空对话"按钮

### MessageBubble.tsx
- 根据 role 渲染左右对齐
- 用户气泡 #dce3f0 / AI 气泡 white + border
- Markdown 渲染（react-markdown）
- 代码高亮（rehype-highlight）

### ChatInput.tsx
- 药丸形 textarea
- Enter 发送 / Shift+Enter 换行
- 发送中 disabled
- 空值不可发送

---

## States & Edge Cases

| 状态 | 处理 |
|------|------|
| 空会话 | 显示"开始对话"引导 |
| 加载中 | 淡蓝灰脉冲动画 + "Claude 正在思考..." |
| 错误 | 红色横幅，不中断 UI |
| WebSocket 断连 | 自动重连（3 次，指数退避） |
| 文件不存在 | 优雅降级，空历史 |
| 发送中 | 输入框 disable + 按钮变灰 |

---

## Tech Stack

| 层 | 选型 |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 6 |
| CSS | Tailwind CSS 4 |
| Server | Node.js + ws |
| AI | Claude Code (/loop 3s) |
| Storage | LocalStorage |
| Markdown | react-markdown + rehype-highlight |
