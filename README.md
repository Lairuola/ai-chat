# AI 聊天助手

基于 DeepSeek API + React 19 的实时 AI 聊天应用，支持流式对话、Markdown 渲染、代码高亮、多会话管理、消息编辑、AI 标题生成、导出对话。

## 特性

- **流式对话** — 实时流式输出，打字机效果
- **Markdown 渲染** — 支持代码高亮、表格、列表、引用等
- **多会话管理** — 创建、切换、清空、删除会话
- **消息编辑/删除** — 发送后可编辑或删除消息
- **AI 标题生成** — 自动为对话生成标题（3-8 字）
- **导出对话** — 一键导出为 Markdown 文件
- **深色/浅色主题** — 自由切换
- **响应式布局** — 桌面和移动端适配
- **自动重连** — WebSocket 断线指数退避重试

## 项目结构

```
ai-chat/
├── ui/                         # React 前端
│   ├── src/
│   │   ├── App.tsx                     # 根组件，布局与状态编排
│   │   ├── main.tsx                    # 入口
│   │   ├── index.css                   # 全局样式 + 主题变量 + 动画
│   │   ├── types.ts                    # TypeScript 类型定义
│   │   ├── components/
│   │   │   ├── ChatHeader.tsx          # 顶部栏：模型名、清空、导出
│   │   │   ├── ChatInput.tsx           # 消息输入框：自动伸缩、Enter 发送
│   │   │   ├── ChatWindow.tsx          # 聊天主面板：消息列表 + 输入框
│   │   │   ├── ConversationList.tsx    # 侧边栏：会话列表、主题切换
│   │   │   ├── MessageBubble.tsx       # 消息气泡：Markdown、代码高亮、编辑/删除
│   │   │   ├── MessageList.tsx         # 消息列表：自动滚动、日期分割线
│   │   │   ├── ConfirmDialog.tsx       # 确认对话框
│   │   │   └── ErrorBoundary.tsx       # 错误边界
│   │   ├── hooks/
│   │   │   ├── useChatStore.ts         # 会话状态管理（useReducer + localStorage）
│   │   │   └── useWebSocket.ts         # WebSocket 连接 + 自动重连
│   │   └── utils/
│   │       └── time.ts                # 日期/时间格式化
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
├── server/
│   ├── server.js               # HTTP + WebSocket 服务器（代理 DeepSeek API）
│   └── package.json
├── Dockerfile                  # 多阶段 Docker 构建
├── .env.example                # 环境变量示例
├── .github/workflows/ci.yml    # CI 工作流（Node 22/24）
└── package.json                # 根工作区配置
```

## 快速开始

### 前置条件

- Node.js >= 22
- pnpm >= 11

### 安装

```bash
# 克隆仓库
git clone <repo-url>
cd ai-chat

# 安装所有依赖
pnpm install
cd ui && pnpm install && cd ..

# 配置 API Key
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY
```

### 开发

```bash
# 同时启动前端和后端
pnpm dev

# 或分别启动
pnpm dev:ui     # http://localhost:5173
pnpm dev:server # ws://localhost:3090
```

### 构建 & 测试

```bash
pnpm build       # 构建前端（输出到 ui/dist/）
pnpm test        # 运行测试
pnpm typecheck   # TypeScript 类型检查
pnpm lint        # ESLint 代码检查
pnpm fix         # 自动修复 lint 问题
```

## 架构

```
┌──────────────────┐    WebSocket    ┌──────────────┐    HTTP/SSE    ┌──────────────┐
│   React 前端      │ ◄──────────────► │  Node.js 服务 │ ◄─────────────► │  DeepSeek API │
│   (Vite + React)  │   ws://3090     │  (ws proxy)   │  stream:true  │  (deepseek)   │
└──────────────────┘                 └──────────────┘                └──────────────┘
```

生产模式下，同一 Node.js 服务同时提供静态文件（从 `ui/dist/` 输出）和 WebSocket 连接。

### 数据流

1. 用户在 `ChatInput` 输入消息 → `useChatStore.sendMessage()`
2. 消息通过 `useWebSocket.send()` 发送到后端
3. `server.js` 将对话历史 + system prompt 转发到 DeepSeek
4. DeepSeek 以 SSE 流式返回 → 后端逐块转发 WebSocket 消息
5. `useWebSocket.onMessage` 接收 → `useChatStore.handleStreamChunk()` 追加内容
6. `MessageBubble` 实时渲染流式输出
7. 流结束时发 `done` → `useChatStore.handleStreamDone()`
8. 首次回复完成后，自动请求 AI 生成标题（`summarize` → `title`）

### 持久化

- 所有会话数据存储在 `localStorage`（key: `chat-conversations`）
- 主题偏好存储在 `localStorage`（key: `chat-theme`）
- 刷新页面后自动恢复会话和主题

## 核心组件

### App.tsx — 根编排

```typescript
export default function App() {
  const store = useChatStore()          // 会话状态
  const ws = useWebSocket(...)          // WebSocket 连接

  // 将 WS 事件路由到 store
  // 'stream' → store.handleStreamChunk
  // 'done'   → store.handleStreamDone
  // 'error'  → store.setError
}
```

### useChatStore — 状态管理

| 状态 | 类型 | 说明 |
|------|------|------|
| `conversations` | `Conversation[]` | 所有会话 |
| `activeId` | `string` | 当前选中会话 ID |
| `isStreaming` | `boolean` | AI 是否正在输出 |
| `isPending` | `boolean` | 等待首次响应 |
| `error` | `string \| null` | 错误信息 |
| `canCreate` | `boolean` | 是否可以创建新会话 |

| 操作 | 说明 |
|------|------|
| `createConv()` | 创建新会话 |
| `deleteConv(id)` | 删除会话 |
| `clearConv(id)` | 清空会话消息 |
| `sendMessage(content, sendFn)` | 发送消息完整流程 |
| `handleStreamChunk(convId, chunk)` | 追加流式片段 |
| `handleStreamDone(convId)` | 完成流式输出 |
| `setError(msg)` | 设置错误 |

### useWebSocket — 连接管理

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `isConnected` | `boolean` | 是否已连接 |
| `retriesExhausted` | `boolean` | 3 次重试是否耗尽 |
| `reconnect()` | `() => void` | 手动重连 |
| `send(msg)` | `(msg) => void` | 发送消息 |

重连策略：断开后指数退避重试 3 次（1s / 2s / 4s）。重试中发送按钮禁用、+ 按钮禁用、显示"正在重连..."。耗时后显示"重新连接"按钮。

## WebSocket 协议

### 发送消息（客户端 → 服务端）

```json
{
  "type": "chat",
  "convId": "uuid-string",
  "messages": [
    { "role": "user", "content": "你好" },
    { "role": "assistant", "content": "你好！有什么可以帮助你的？" },
    { "role": "user", "content": "介绍一下 React" }
  ]
}
```

### 接收消息（服务端 → 客户端）

**流式片段**

```json
{ "type": "stream", "convId": "uuid", "chunk": "React " }
```

**流式完成**

```json
{ "type": "done", "convId": "uuid" }
```

**错误**

```json
{ "type": "error", "convId": "uuid", "message": "API key invalid" }
```

**标题生成**

```json
// 客户端请求
{ "type": "summarize", "convId": "uuid", "messages": [...] }
// 服务端响应
{ "type": "title", "convId": "uuid", "title": "新对话" }
```

## 主题系统

使用 CSS 变量实现深色/浅色双主题。深色为 `:root` 默认值，浅色为 `.light` 类覆盖。

### 关键变量

| 变量 | 深色 | 浅色 |
|------|------|------|
| `--bg` | `#0c0c14` | `#f7f5f0` |
| `--text` | `#e8e8ed` | `#1a1a26` |
| `--primary` | `#00d4ff` | `#0098cc` |
| `--accent` | `#7c3aed` | `#7c3aed` |
| `--panel-bg` | `rgba(20,20,32,0.75)` | `rgba(255,255,255,0.75)` |
| `--ai-bubble-bg` | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.85)` |
| `--user-bubble-bg` | `rgba(0,212,255,0.12)` | `rgba(0,152,204,0.07)` |

**重要**：`.light` 中使用直接值而非 `var(--tweak-*)`，因为 Tweaks 面板通过内联样式设置 `--tweak-*`，其优先级高于 class 选择器。

## 响应式设计

| 断点 | 行为 |
|------|------|
| `>= 1024px` | 侧边栏常驻左侧 (260-360px) |
| `< 1024px` | 侧边栏作为遮罩层从左侧滑入，顶栏显示汉堡按钮 |

移动端侧边栏遮罩层点击背景或选择会话后自动关闭。

## 交互细节

| 场景 | 行为 |
|------|------|
| Enter 键 | 发送消息 |
| Shift+Enter | 换行 |
| 流式输出中 | 发送和清空按钮禁用 |
| 未连接 | 输入框禁用，显示重连按钮 |
| 滚动查看历史 | 右下角出现回到底部按钮 |
| 滚动距底 < 150px | 新消息自动滚动到底部 |
| 消息 > 30 分钟间隔 | 日期分割线 |
| 鼠标悬停用户消息 | 显示编辑、删除、复制按钮 |
| 鼠标悬停 AI 消息 | 显示复制按钮 |
| 消息编辑 | Enter 保存，Escape 取消 |
| 清空会话 | 弹出确认对话框 |
| 复制不支持 | 降级到 `execCommand('copy')` |

## 部署

### Docker

```bash
docker build -t ai-chat .
docker run -p 3090:3090 -e DEEPSEEK_API_KEY=your_key ai-chat
```

### 生产模式

```bash
pnpm build
DEEPSEEK_API_KEY=your_key NODE_ENV=production node server/server.js
```

服务器默认监听 `3090` 端口，通过 `PORT` 环境变量配置。

### CI

GitHub Actions 自动运行类型检查、lint、测试和构建。Node 版本：22、24。

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | React 19 |
| 语言 | TypeScript (strict) |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS 4 + CSS 变量 |
| Markdown | react-markdown + rehype-highlight |
| 后端 | Node.js + http + ws |
| AI 接口 | DeepSeek Chat API (流式) |
| 测试 | Vitest + @testing-library/react |
| 规范 | @antfu/eslint-config |
