import { apiPost } from './api.js'
import { AI_DEFAULTS } from '../utils/constants.js'
import { useSettingsStore } from '../stores/settings.js'
import { parseSSEStream } from './streamParser.js'

export async function sendMessage(messages, options = {}) {
  const settings = useSettingsStore()
  const payload = {
    model: AI_DEFAULTS.model,
    messages,
    temperature: options.temperature ?? settings.aiConfig.temperature,
    max_tokens: options.maxTokens ?? settings.aiConfig.maxTokens,
    stream: false
  }

  const response = await apiPost('/chat/completions', payload)
  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content?.trim()

  if (!content) throw new Error('AI 返回了空响应')
  return content
}

export async function streamChat(messages, options = {}) {
  const settings = useSettingsStore()
  const payload = {
    model: AI_DEFAULTS.model,
    messages,
    temperature: options.temperature ?? settings.aiConfig.temperature,
    max_tokens: options.maxTokens ?? settings.aiConfig.maxTokens,
    stream: true
  }

  const response = await apiPost('/chat/completions', payload, {
    signal: options.signal
  })

  return {
    response,
    [Symbol.asyncIterator]: () => parseSSEStream(response, { onToken: options.onToken, onReasoning: options.onReasoning })
  }
}
