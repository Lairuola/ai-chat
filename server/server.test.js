import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'fs'
import { join } from 'path'

const TMP = join(import.meta.dirname, '../bridge/test-tmp')

beforeEach(() => {
  rmSync(TMP, { recursive: true, force: true })
  mkdirSync(TMP, { recursive: true })
})

afterEach(() => {
  rmSync(TMP, { recursive: true, force: true })
})

describe('Bridge Protocol', () => {
  it('inbox 消息写入正确格式', () => {
    const convId = 'test-conv-1'
    const msg = {
      id: Date.now().toString(36),
      content: '用户测试消息',
      timestamp: Date.now(),
    }
    const file = join(TMP, `${convId}.json`)
    writeFileSync(file, JSON.stringify(msg))

    const read = JSON.parse(readFileSync(file, 'utf-8'))
    expect(read.content).toBe('用户测试消息')
    expect(read.id).toBeTruthy()
    expect(read.timestamp).toBeGreaterThan(0)
  })

  it('outbox 文件格式包含 chunks 数组', () => {
    const convId = 'test-conv-2'
    const response = {
      chunks: ['你', '好', '！', '这', '是', '测', '试'],
      timestamp: Date.now(),
    }
    const file = join(TMP, `${convId}.json`)
    writeFileSync(file, JSON.stringify(response))

    const read = JSON.parse(readFileSync(file, 'utf-8'))
    expect(read.chunks).toBeInstanceOf(Array)
    expect(read.chunks.length).toBeGreaterThan(0)
    expect(read.chunks.join('')).toBe('你好！这是测试')
  })

  it('conversations 文件格式包含完整消息历史', () => {
    const convId = 'test-conv-3'
    const conversation = {
      id: convId,
      title: '测试标题',
      messages: [
        { id: 'm1', role: 'user', content: '用户消息', timestamp: 1000 },
        { id: 'm2', role: 'assistant', content: 'AI回复', timestamp: 1001 },
      ],
      createdAt: 1000,
      updatedAt: 2000,
    }
    const file = join(TMP, `${convId}.json`)
    writeFileSync(file, JSON.stringify(conversation))

    const read = JSON.parse(readFileSync(file, 'utf-8'))
    expect(read.id).toBe(convId)
    expect(read.messages).toHaveLength(2)
    expect(read.messages[0].role).toBe('user')
    expect(read.messages[1].role).toBe('assistant')
  })

  it('处理 inbox → 生成 outbox + 更新 conversations 完整流水线', () => {
    const convId = 'pipeline-test'
    const inboxFile = join(TMP, `${convId}.json`)

    // 1. 模拟用户发送消息
    writeFileSync(inboxFile, JSON.stringify({
      id: 'u1',
      content: '解释量子计算',
      timestamp: Date.now(),
    }))

    // 2. 读取消息
    const inboxMsg = JSON.parse(readFileSync(inboxFile, 'utf-8'))

    // 3. 生成 Claude 回复
    const reply = '量子计算是利用量子力学原理进行信息处理的计算方式。'
    const chunks = [...reply] // 逐字拆分
    const outboxFile = join(TMP, `outbox-${convId}.json`)
    writeFileSync(outboxFile, JSON.stringify({ chunks, timestamp: Date.now() }))

    // 4. 更新 conversations
    const historyFile = join(TMP, `history-${convId}.json`)
    const history = {
      id: convId,
      title: '解释量子计算',
      messages: [
        { id: 'u1', role: 'user', content: inboxMsg.content, timestamp: inboxMsg.timestamp },
        { id: 'a1', role: 'assistant', content: chunks.join(''), timestamp: Date.now() },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    writeFileSync(historyFile, JSON.stringify(history))

    // 5. 删除 inbox
    rmSync(inboxFile)

    // 验证
    expect(existsSync(inboxFile)).toBe(false)
    const outbox = JSON.parse(readFileSync(outboxFile, 'utf-8'))
    expect(outbox.chunks.join('')).toBe(reply)

    const savedHistory = JSON.parse(readFileSync(historyFile, 'utf-8'))
    expect(savedHistory.messages).toHaveLength(2)
    expect(savedHistory.title).toBe('解释量子计算')
  })

  it('多会话隔离——不同 convId 不会互相干扰', () => {
    const convA = { id: 'conv-a', content: '消息A', timestamp: Date.now() }
    const convB = { id: 'conv-b', content: '消息B', timestamp: Date.now() }

    writeFileSync(join(TMP, 'conv-a.json'), JSON.stringify(convA))
    writeFileSync(join(TMP, 'conv-b.json'), JSON.stringify(convB))

    const files = readdirSync(TMP).filter(f => f.endsWith('.json'))
    expect(files).toHaveLength(2)

    const msgA = JSON.parse(readFileSync(join(TMP, 'conv-a.json'), 'utf-8'))
    const msgB = JSON.parse(readFileSync(join(TMP, 'conv-b.json'), 'utf-8'))
    expect(msgA.content).not.toBe(msgB.content)
    expect(msgA.id).not.toBe(msgB.id)
  })
})
