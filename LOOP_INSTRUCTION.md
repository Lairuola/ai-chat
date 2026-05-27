# Claude Code /loop 配置

启动聊天助手后端：

```bash
# 1. 启动 WebSocket Server
cd E:/workspace/program/ai-chat/server && pnpm start &

# 2. 启动前端
cd E:/workspace/program/ai-chat/ui && pnpm dev &

# 3. 启动 Claude Code 消息监听循环
# 在 Claude Code 中执行: /loop 3s 处理 bridge/inbox 中的新消息
```

## Claude Code /loop 处理逻辑

每 3 秒检查 `bridge/inbox/` 目录：

```
1. 读取 bridge/inbox/ 下所有 .json 文件
2. 对每个文件:
   a. 解析 { id, content, timestamp }
   b. 读取 conversations/{convId}.json 作为上下文
   c. Claude 生成回复（使用流式思考，回复要完整、自然、有帮助）
   d. 将回复拆分为单字符数组: { "chunks": ["好","的","，","我","来","帮","你"] }
   e. 写入 bridge/outbox/{convId}.json
   f. 更新 conversations/{convId}.json（追加双方消息）
   g. 删除 bridge/inbox/{convId}.json
```

### Outbox 格式
```json
{
  "chunks": ["逐", "字", "推", "送", "的", "内", "容"],
  "timestamp": 1779766000
}
```
