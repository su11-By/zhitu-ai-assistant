import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'
import { parseFile } from '../services/fileParser.js'
import { chunkDocument } from '../services/chunker.js'
import { vectorStore } from '../services/vectorStore.js'
import { embedChunks } from '../services/embeddingService.js'

function generateId() {
  return 'kb-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)
}

function generateDocId() {
  return 'doc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)
}

export const useKnowledgeStore = defineStore('knowledge', () => {
  const auth = useAuthStore()

  const knowledgeBases = ref(loadKBs())
  const activeKbId = ref(loadActiveKbId())
  const documents = ref([])
  const chunks = ref([])
  const isLoading = ref(false)
  const uploadProgress = ref({})

  // Verify restored activeKbId still exists
  if (activeKbId.value && !knowledgeBases.value.find((kb) => kb.id === activeKbId.value)) {
    activeKbId.value = null
    saveActiveKbId()
  }

  const activeKb = computed(() => knowledgeBases.value.find((kb) => kb.id === activeKbId.value))
  const kbDocs = computed(() => documents.value.filter((d) => d.kbId === activeKbId.value))

  function getStorageKey() {
    return `kb-list-${auth.getUserPrefix()}`
  }

  function loadKBs() {
    try { return JSON.parse(localStorage.getItem(getStorageKey())) || [] } catch { return [] }
  }

  function saveKBs() {
    localStorage.setItem(getStorageKey(), JSON.stringify(knowledgeBases.value))
  }

  function loadActiveKbId() {
    return localStorage.getItem(`kb-active-${auth.getUserPrefix()}`) || null
  }

  function saveActiveKbId() {
    if (activeKbId.value) {
      localStorage.setItem(`kb-active-${auth.getUserPrefix()}`, activeKbId.value)
    } else {
      localStorage.removeItem(`kb-active-${auth.getUserPrefix()}`)
    }
  }

  function createKB({ name, description = '', category = '' }) {
    const kb = {
      id: generateId(),
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    knowledgeBases.value.unshift(kb)
    saveKBs()
    if (!activeKbId.value) activeKbId.value = kb.id
    return kb
  }

  function deleteKB(kbId) {
    knowledgeBases.value = knowledgeBases.value.filter((kb) => kb.id !== kbId)
    if (activeKbId.value === kbId) {
      activeKbId.value = knowledgeBases.value[0]?.id || null
      saveActiveKbId()
    }
    saveKBs()
    vectorStore.deleteKnowledgeBase(kbId).catch(() => {})
  }

  function renameKB(kbId, newName) {
    const kb = knowledgeBases.value.find((k) => k.id === kbId)
    if (kb) {
      kb.name = newName.trim()
      kb.updatedAt = Date.now()
      saveKBs()
    }
  }

  async function uploadDocument(file, kbId) {
    isLoading.value = true
    const docId = generateDocId()

    try {
      uploadProgress.value[docId] = { stage: 'parsing', percent: 0 }
      const parsed = await parseFile(file, file.name)
      uploadProgress.value[docId] = { stage: 'chunking', percent: 30 }

      const chunkResults = chunkDocument(parsed.text)
      uploadProgress.value[docId] = { stage: 'indexing', percent: 30 }

      const chunkRecords = await embedChunks(chunkResults, kbId, parsed.fileName, (current, total) => {
        uploadProgress.value[docId] = { stage: 'indexing', percent: 30 + Math.round(current / total * 60) }
      })

      if (chunkRecords.length === 0) {
        throw new Error('所有分块嵌入失败，请检查 LM Studio 是否运行了嵌入模型 (nomic-embed-text-v1.5)')
      }

      await vectorStore.insertChunks(chunkRecords)

      const docMeta = {
        docId,
        kbId,
        title: parsed.fileName,
        originalFormat: parsed.format,
        formatLabel: parsed.formatLabel,
        rawText: parsed.text,
        chunkCount: chunkResults.length,
        fileSize: parsed.fileSize,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      await vectorStore.insertDocument(docMeta)

      const kb = knowledgeBases.value.find((k) => k.id === kbId)
      if (kb) { kb.updatedAt = Date.now(); saveKBs() }

      uploadProgress.value[docId] = { stage: 'done', percent: 100 }
      await refreshDocuments(kbId)

      return docMeta
    } catch (e) {
      delete uploadProgress.value[docId]
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function refreshDocuments(kbId) {
    try {
      documents.value = await vectorStore.getDocumentsByKb(kbId)
      chunks.value = await vectorStore.getChunksByKb(kbId)
    } catch { /* documents may not be persisted yet */ }
  }

  async function loadDocuments(kbId) {
    activeKbId.value = kbId
    saveActiveKbId()
    await refreshDocuments(kbId)
  }

  async function deleteDocument(docId) {
    await vectorStore.deleteDocument(docId)
    documents.value = documents.value.filter((d) => d.docId !== docId)
  }

  async function getDocChunks(docId) {
    return vectorStore.getChunksByDoc(docId)
  }

  return {
    knowledgeBases,
    activeKbId,
    activeKb,
    documents,
    kbDocs,
    chunks,
    isLoading,
    uploadProgress,
    createKB,
    deleteKB,
    renameKB,
    uploadDocument,
    loadDocuments,
    refreshDocuments,
    deleteDocument,
    getDocChunks
  }
})
