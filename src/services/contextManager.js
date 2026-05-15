import { estimateTokens, estimateMessagesTokens } from '../utils/tokenizer.js'

const RESERVED_FOR_GENERATION = 512
const SYSTEM_PROMPT_BUDGET = 300

export function buildChatContext({
  systemPrompt = '',
  userMessage = '',
  ragChunks = [],
  history = [],
  maxTokens = 4096
}) {
  const reservedTokens = RESERVED_FOR_GENERATION
  const systemTokens = estimateTokens(systemPrompt)
  const userTokens = estimateTokens(userMessage)
  const baseTokens = systemTokens + userTokens + reservedTokens

  let available = maxTokens - baseTokens

  // Phase 1: Add RAG chunks (sorted by score, highest first)
  let ragText = ''
  for (const chunk of ragChunks) {
    const chunkStr = `[来源: ${chunk.title || chunk.docTitle}]\n${chunk.text}\n`
    const chunkTokens = estimateTokens(chunkStr)
    if (chunkTokens <= available) {
      ragText += chunkStr
      available -= chunkTokens
    }
  }

  // Phase 2: Add history from newest to oldest
  const includedHistory = []
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i]
    const msgTokens = estimateTokens(msg.content) + 4
    if (msgTokens <= available) {
      includedHistory.unshift(msg)
      available -= msgTokens
    }
  }

  // Build final messages array
  const messages = []
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  for (const msg of includedHistory) {
    messages.push({ role: msg.role, content: msg.content })
  }

  let userContent = userMessage
  if (ragText) {
    userContent = `参考文档：\n${ragText}\n\n问题：${userMessage}`
  }

  messages.push({ role: 'user', content: userContent })

  const totalTokens = estimateMessagesTokens(messages) + reservedTokens
  const historyTrimmed = history.length > includedHistory.length

  return {
    messages,
    stats: {
      totalTokens,
      maxTokens,
      historyCount: includedHistory.length,
      historyTrimmed,
      ragChunksUsed: ragChunks.length,
      available
    }
  }
}

const GENERAL_SYSTEM_PROMPT = `你是智途 AI 助手，运行在 Qwen3-4B-Thinking 模型上。请用简洁的中文回答用户问题。如果问题超出你的能力范围，诚实说明。`

export function buildChatMessages(userMessage, history = [], options = {}) {
  return buildChatContext({
    systemPrompt: options.systemPrompt || GENERAL_SYSTEM_PROMPT,
    userMessage,
    history,
    maxTokens: options.maxTokens || 4096
  })
}
