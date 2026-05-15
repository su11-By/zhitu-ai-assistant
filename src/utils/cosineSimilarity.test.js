import { describe, test, expect } from 'vitest'
import { cosineSimilarity, topKSimilar } from './cosineSimilarity.js'

describe('cosineSimilarity', () => {
  test('returns 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 5)
  })

  test('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBe(0)
  })

  test('returns 0 when first argument is null', () => {
    expect(cosineSimilarity(null, [1, 2])).toBe(0)
  })

  test('returns 0 when second argument is null', () => {
    expect(cosineSimilarity([1, 2], null)).toBe(0)
  })

  test('returns 0 when both arguments are null', () => {
    expect(cosineSimilarity(null, null)).toBe(0)
  })

  test('returns 0 when vectors have different lengths', () => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0)
  })

  test('returns 0 for zero vectors', () => {
    expect(cosineSimilarity([0, 0], [1, 2])).toBe(0)
  })

  test('handles negative values', () => {
    const result = cosineSimilarity([1, -1], [-1, 1])
    expect(result).toBeCloseTo(-1, 5)
  })

  test('handles empty arrays', () => {
    expect(cosineSimilarity([], [])).toBe(0)
  })
})

describe('topKSimilar', () => {
  const chunks = [
    { id: 'a', text: 'apple', vector: [1, 0, 0] },
    { id: 'b', text: 'banana', vector: [0, 1, 0] },
    { id: 'c', text: 'cherry', vector: [0, 0, 1] },
    { id: 'd', text: 'date', vector: [0.8, 0.2, 0] },
    { id: 'e', text: 'elderberry', vector: [0.9, 0.1, 0] }
  ]

  test('returns top K most similar vectors', () => {
    const results = topKSimilar([1, 0, 0], chunks, 3)
    expect(results).toHaveLength(3)
    expect(results[0].id).toBe('a')
    expect(results[0].score).toBeCloseTo(1, 5)
  })

  test('returns all vectors when K exceeds count', () => {
    const results = topKSimilar([1, 0, 0], chunks, 10)
    expect(results).toHaveLength(5)
  })

  test('preserves original chunk properties and adds score', () => {
    const results = topKSimilar([1, 0, 0], chunks, 2)
    expect(results[0]).toHaveProperty('id')
    expect(results[0]).toHaveProperty('text')
    expect(results[0]).toHaveProperty('vector')
    expect(results[0]).toHaveProperty('score')
  })

  test('returns empty array for empty input', () => {
    expect(topKSimilar([1, 0, 0], [], 5)).toEqual([])
  })

  test('defaults to top 5 when k is not provided', () => {
    const results = topKSimilar([1, 0, 0], chunks)
    expect(results.length).toBeLessThanOrEqual(5)
  })
})
