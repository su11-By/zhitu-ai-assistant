import { describe, test, expect, vi } from 'vitest'
import { parseSSEStream } from './streamParser.js'

function createMockResponse(chunks) {
  const encoder = new TextEncoder()
  let index = 0

  const readable = new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]))
        index++
      } else {
        controller.close()
      }
    }
  })

  return { body: readable, ok: true }
}

async function collectStream(response, onToken) {
  const tokens = []
  const gen = parseSSEStream(response, { onToken })
  for await (const token of gen) {
    tokens.push(token)
  }
  return tokens
}

describe('parseSSEStream', () => {
  test('yields delta content tokens', async () => {
    const response = createMockResponse([
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'
    ])
    const tokens = await collectStream(response)
    expect(tokens).toEqual(['Hello'])
  })

  test('yields multiple tokens across data events', async () => {
    const response = createMockResponse([
      'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n'
    ])
    const tokens = await collectStream(response)
    expect(tokens).toEqual(['Hel', 'lo'])
  })

  test('stops on [DONE] sentinel', async () => {
    const response = createMockResponse([
      'data: {"choices":[{"delta":{"content":"first"}}]}\n\n',
      'data: [DONE]\n\n',
      'data: {"choices":[{"delta":{"content":"after"}}]}\n\n'
    ])
    const tokens = await collectStream(response)
    expect(tokens).toEqual(['first'])
  })

  test('ignores non-data lines', async () => {
    const response = createMockResponse([
      ': comment line\n',
      'event: ping\n',
      'data: {"choices":[{"delta":{"content":"valid"}}]}\n\n'
    ])
    const tokens = await collectStream(response)
    expect(tokens).toEqual(['valid'])
  })

  test('skips malformed JSON gracefully', async () => {
    const response = createMockResponse([
      'data: {broken json\n\n',
      'data: {"choices":[{"delta":{"content":"ok"}}]}\n\n'
    ])
    const tokens = await collectStream(response)
    expect(tokens).toEqual(['ok'])
  })

  test('calls onToken callback for each token', async () => {
    const onToken = vi.fn()
    const response = createMockResponse([
      'data: {"choices":[{"delta":{"content":"a"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"b"}}]}\n\n'
    ])
    await collectStream(response, onToken)
    expect(onToken).toHaveBeenCalledTimes(2)
    expect(onToken).toHaveBeenNthCalledWith(1, 'a')
    expect(onToken).toHaveBeenNthCalledWith(2, 'b')
  })

  test('handles empty response body', async () => {
    const response = createMockResponse([])
    const tokens = await collectStream(response)
    expect(tokens).toEqual([])
  })

  test('handles data with no delta content', async () => {
    const response = createMockResponse([
      'data: {"choices":[{"delta":{}}]}\n\n'
    ])
    const tokens = await collectStream(response)
    expect(tokens).toEqual([])
  })

  test('handles empty data string', async () => {
    const response = createMockResponse([
      'data: \n\n',
      'data: {"choices":[{"delta":{"content":"test"}}]}\n\n'
    ])
    const tokens = await collectStream(response)
    expect(tokens).toEqual(['test'])
  })
})
