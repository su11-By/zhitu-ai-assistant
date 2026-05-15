export async function* parseSSEStream(response, { onToken, onReasoning } = {}) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue

        const dataStr = trimmed.slice(5).trim()
        if (dataStr === '[DONE]') return

        try {
          const parsed = JSON.parse(dataStr)
          const delta = parsed?.choices?.[0]?.delta
          if (!delta) continue
          if (delta.content) {
            if (onToken) onToken(delta.content)
            yield delta.content
          }
          if (delta.reasoning_content) {
            if (onReasoning) onReasoning(delta.reasoning_content)
          }
        } catch (e) {
          console.warn('[SSE Parse]', dataStr.slice(0, 80), e.message)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
