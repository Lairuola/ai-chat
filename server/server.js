import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { WebSocketServer } from 'ws'

const {
  DEEPSEEK_API_KEY,
  DEEPSEEK_BASE_URL = 'https://api.deepseek.com',
  DEEPSEEK_MODEL = 'deepseek-chat',
  PORT = 3090,
  NODE_ENV,
} = process.env

const isProd = NODE_ENV === 'production'

const SYSTEM_PROMPT = {
  role: 'system',
  content: '你是 AI 聊天助手，由 DeepSeek 驱动。请用中文交流，回答简洁清晰。对于代码问题提供可运行的示例。',
}

if (!DEEPSEEK_API_KEY) {
  console.warn('⚠ DEEPSEEK_API_KEY 未设置')
}

/* ── HTTP server (serves static files in production) ── */

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
}

const server = http.createServer((req, res) => {
  if (!isProd) {
    res.writeHead(404).end()
    return
  }

  let url = req.url === '/' ? '/index.html' : req.url

  // Resolve to ui/dist/ and prevent path traversal
  const dist = path.resolve('ui/dist')
  const filePath = path.normalize(path.join(dist, url))
  if (!filePath.startsWith(dist)) {
    res.writeHead(403).end('Forbidden')
    return
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback — serve index.html for any non-file route
      fs.readFile(path.join(dist, 'index.html'), (err2, fallback) => {
        if (err2) {
          res.writeHead(500).end('Internal Server Error')
          return
        }
        res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' }).end(fallback)
      })
      return
    }

    const ext = path.extname(filePath)
    const cacheable = ext !== '.html'
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': cacheable ? 'public, max-age=31536000, immutable' : 'no-cache',
    }).end(data)
  })
})

/* ── WebSocket ── */

const wss = new WebSocketServer({ server })
console.log(`WS 服务器启动 ws://localhost:${PORT}`)

wss.on('connection', (ws) => {
  let lastChat = 0

  ws.on('message', async (raw) => {
    let msg
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }

    if (msg.type === 'chat') {
      const now = Date.now()
      if (now - lastChat < 500) {
        ws.send(JSON.stringify({ type: 'error', convId: msg.convId, message: '发送过快，请稍候' }))
        return
      }
      lastChat = now
      await handleChat(msg, ws)
    }
  })
})

async function handleChat({ convId, messages }, ws) {
  if (!DEEPSEEK_API_KEY) {
    ws.send(JSON.stringify({ type: 'error', convId, message: 'API Key 未配置' }))
    return
  }

  let response
  try {
    response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [SYSTEM_PROMPT, ...messages],
        stream: true,
      }),
    })
  } catch (err) {
    ws.send(JSON.stringify({ type: 'error', convId, message: `网络错误: ${err.message}` }))
    return
  }

  if (!response.ok) {
    ws.send(JSON.stringify({ type: 'error', convId, message: `API 请求失败 (${response.status})` }))
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let streamed = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data: ')) continue

      const data = trimmed.slice(6)
      if (data === '[DONE]') {
        ws.send(JSON.stringify({ type: 'done', convId }))
        streamed = true
        continue
      }

      try {
        const chunk = JSON.parse(data)?.choices?.[0]?.delta?.content || ''
        if (chunk) {
          ws.send(JSON.stringify({ type: 'stream', convId, chunk }))
          streamed = true
        }
      } catch { /* skip malformed */ }
    }
  }

  if (!streamed) {
    ws.send(JSON.stringify({ type: 'done', convId }))
  }
}

/* ── Start ── */

server.listen(PORT, () => {
  console.log(`HTTP 服务器启动 http://localhost:${PORT}${isProd ? ' (生产模式)' : ''}`)
})
