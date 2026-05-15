import { apiPostJson } from './api.js'
import { AI_DEFAULTS } from '../utils/constants.js'

export async function createEmbedding(text) {
  if (!text?.trim()) throw new Error('Cannot embed empty text')

  const data = await apiPostJson('/embeddings', {
    model: AI_DEFAULTS.embeddingModel,
    input: text.trim()
  })

  const embedding = data?.data?.[0]?.embedding
  if (!embedding || !embedding.length) {
    throw new Error('Embedding API returned empty result')
  }

  return embedding
}

export async function createEmbeddings(texts) {
  const embeddings = []
  for (const text of texts) {
    embeddings.push(await createEmbedding(text))
  }
  return embeddings
}

export async function embedChunks(chunks, kbId, docTitle, onProgress) {
  const embedded = []
  const failed = []
  for (let i = 0; i < chunks.length; i++) {
    try {
      const vector = await createEmbedding(chunks[i].text)
      embedded.push({
        kbId,
        docId: chunks[i].docId || '',
        docTitle,
        text: chunks[i].text,
        vector,
        chunkIndex: chunks[i].chunkIndex ?? i,
        charCount: chunks[i].charCount ?? chunks[i].text.length
      })
    } catch (e) {
      console.warn(`[embedChunks] Chunk ${i} (${chunks[i].text.slice(0, 50)}...) failed:`, e.message)
      failed.push(i)
    }
    if (onProgress) onProgress(i + 1, chunks.length)
  }
  if (failed.length) {
    throw new Error(`嵌入失败: ${failed.length}/${chunks.length} 个分块处理出错 (索引: ${failed.join(', ')})`)
  }
  return embedded
}
