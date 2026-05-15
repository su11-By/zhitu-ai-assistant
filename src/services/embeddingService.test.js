import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock the api module before importing
vi.mock('./api.js', () => ({
  apiPostJson: vi.fn()
}))

vi.mock('../utils/constants.js', () => ({
  AI_DEFAULTS: {
    embeddingModel: 'text-embedding-nomic-embed-text-v1.5'
  }
}))

import { createEmbedding, createEmbeddings, embedChunks } from './embeddingService.js'
import { apiPostJson } from './api.js'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createEmbedding', () => {
  test('throws on empty text', async () => {
    await expect(createEmbedding('')).rejects.toThrow('Cannot embed empty text')
  })

  test('throws on whitespace-only text', async () => {
    await expect(createEmbedding('   ')).rejects.toThrow('Cannot embed empty text')
  })

  test('returns embedding vector on success', async () => {
    apiPostJson.mockResolvedValueOnce({
      data: [{ embedding: [0.1, 0.2, 0.3] }]
    })
    const result = await createEmbedding('test text')
    expect(result).toEqual([0.1, 0.2, 0.3])
  })

  test('trims input text', async () => {
    apiPostJson.mockResolvedValueOnce({
      data: [{ embedding: [1.0] }]
    })
    await createEmbedding('  hello  ')
    expect(apiPostJson).toHaveBeenCalledWith('/embeddings', {
      model: 'text-embedding-nomic-embed-text-v1.5',
      input: 'hello'
    })
  })

  test('throws on empty embedding result', async () => {
    apiPostJson.mockResolvedValueOnce({
      data: [{ embedding: [] }]
    })
    await expect(createEmbedding('test')).rejects.toThrow('Embedding API returned empty result')
  })

  test('throws on missing embedding', async () => {
    apiPostJson.mockResolvedValueOnce({
      data: [{}]
    })
    await expect(createEmbedding('test')).rejects.toThrow('Embedding API returned empty result')
  })
})

describe('createEmbeddings', () => {
  test('embeds multiple texts', async () => {
    apiPostJson
      .mockResolvedValueOnce({ data: [{ embedding: [1, 0] }] })
      .mockResolvedValueOnce({ data: [{ embedding: [0, 1] }] })

    const results = await createEmbeddings(['text1', 'text2'])
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual([1, 0])
    expect(results[1]).toEqual([0, 1])
  })

  test('returns empty array for empty input', async () => {
    const results = await createEmbeddings([])
    expect(results).toEqual([])
  })
})

describe('embedChunks', () => {
  test('embeds all chunks successfully', async () => {
    apiPostJson
      .mockResolvedValueOnce({ data: [{ embedding: [1, 0] }] })
      .mockResolvedValueOnce({ data: [{ embedding: [0, 1] }] })

    const chunks = [
      { text: 'chunk1', docId: 'doc1' },
      { text: 'chunk2', docId: 'doc1' }
    ]
    const results = await embedChunks(chunks, 'kb1', 'Test Doc')
    expect(results).toHaveLength(2)
    expect(results[0]).toHaveProperty('kbId', 'kb1')
    expect(results[0]).toHaveProperty('docTitle', 'Test Doc')
    expect(results[0]).toHaveProperty('vector', [1, 0])
  })

  test('throws error when some chunks fail', async () => {
    apiPostJson
      .mockResolvedValueOnce({ data: [{ embedding: [1, 0] }] })
      .mockRejectedValueOnce(new Error('API failure'))

    const chunks = [
      { text: 'chunk1', docId: 'doc1' },
      { text: 'chunk2', docId: 'doc1' }
    ]
    await expect(embedChunks(chunks, 'kb1', 'Test')).rejects.toThrow('嵌入失败')
  })

  test('calls onProgress callback', async () => {
    apiPostJson.mockResolvedValue({ data: [{ embedding: [1] }] })
    const onProgress = vi.fn()
    await embedChunks([{ text: 'a' }, { text: 'b' }], 'kb1', 'Test', onProgress)
    expect(onProgress).toHaveBeenCalledTimes(2)
    expect(onProgress).toHaveBeenNthCalledWith(1, 1, 2)
    expect(onProgress).toHaveBeenNthCalledWith(2, 2, 2)
  })
})
