import { createEmbedding, embedChunks } from './embeddingService.js'
import { vectorStore } from './vectorStore.js'
import { useSettingsStore } from '../stores/settings.js'

export async function queryWithRAG(query, kbId) {
  const settings = useSettingsStore()
  const topK = settings.aiConfig.topK || 5

  const queryVector = await createEmbedding(query)

  const results = await vectorStore.search(queryVector, kbId, topK)

  if (!results.length) {
    return {
      sources: [],
      grounded: false
    }
  }

  return {
    sources: results.map((r) => ({
      title: r.docTitle,
      score: r.score,
      snippet: r.text.slice(0, 300)
    })),
    grounded: true
  }
}

export async function indexDocumentChunks(chunks, kbId, docTitle) {
  return embedChunks(chunks, kbId, docTitle)
}
