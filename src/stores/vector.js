import { defineStore } from 'pinia'
import { ref } from 'vue'
import { vectorStore } from '../services/vectorStore.js'
import { createEmbedding, embedChunks } from '../services/embeddingService.js'

export const useVectorStore = defineStore('vector', () => {
  const isIndexing = ref(false)
  const indexingProgress = ref({ current: 0, total: 0 })
  const lastSearchResults = ref([])
  const error = ref('')

  async function indexChunks(chunks, kbId, docTitle) {
    if (!chunks.length) return 0

    isIndexing.value = true
    indexingProgress.value = { current: 0, total: chunks.length }
    error.value = ''

    try {
      const indexed = await embedChunks(chunks, kbId, docTitle, (current, total) => {
        indexingProgress.value = { current, total }
      })

      if (indexed.length > 0) {
        await vectorStore.insertChunks(indexed)
      }

      return indexed.length
    } catch (e) {
      error.value = e.message
      return 0
    } finally {
      isIndexing.value = false
    }
  }

  async function search(query, kbId, topK = 5) {
    const queryVector = await createEmbedding(query)
    const results = await vectorStore.search(queryVector, kbId, topK)
    lastSearchResults.value = results
    return results
  }

  return {
    isIndexing,
    indexingProgress,
    lastSearchResults,
    error,
    indexChunks,
    search
  }
})
