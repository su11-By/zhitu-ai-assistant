import { describe, test, expect } from 'vitest'
import { estimateTokens, estimateMessagesTokens } from './tokenizer.js'

describe('estimateTokens', () => {
  test('returns 0 for null', () => {
    expect(estimateTokens(null)).toBe(0)
  })

  test('returns 0 for undefined', () => {
    expect(estimateTokens(undefined)).toBe(0)
  })

  test('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0)
  })

  test('estimates Chinese text', () => {
    const tokens = estimateTokens('你好世界')
    expect(tokens).toBeGreaterThan(0)
    expect(tokens).toBeGreaterThanOrEqual(2)
  })

  test('estimates English text', () => {
    const tokens = estimateTokens('Hello world this is a test')
    expect(tokens).toBeGreaterThan(0)
  })

  test('estimates mixed Chinese-English text higher than single language', () => {
    const pureEn = estimateTokens('Hello world')
    const mixed = estimateTokens('Hello world 你好')
    expect(mixed).toBeGreaterThanOrEqual(pureEn)
  })

  test('estimates longer text as more tokens', () => {
    const short = estimateTokens('a')
    const long = estimateTokens('a a a a a a a a a a')
    expect(long).toBeGreaterThan(short)
  })

  test('returns integer', () => {
    expect(Number.isInteger(estimateTokens('test'))).toBe(true)
  })
})

describe('estimateMessagesTokens', () => {
  test('returns total across all messages', () => {
    const msgs = [
      { content: 'Hello' },
      { content: 'World' },
      { content: '你好' }
    ]
    const total = estimateMessagesTokens(msgs)
    const sum = estimateTokens('Hello') + estimateTokens('World') + estimateTokens('你好') + 3 * 4
    expect(total).toBe(sum)
  })

  test('returns 0 for empty array', () => {
    expect(estimateMessagesTokens([])).toBe(0)
  })

  test('handles messages with empty content', () => {
    const msgs = [{ content: '' }, { content: 'test' }]
    expect(estimateMessagesTokens(msgs)).toBeGreaterThan(0)
  })
})
