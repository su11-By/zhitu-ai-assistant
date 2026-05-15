import { topKSimilar } from '../utils/cosineSimilarity.js'

const DB_NAME = 'ai-assistant-vectors'
const DB_VERSION = 1

let db = null

function openDB() {
  if (db) return Promise.resolve(db)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      if (!database.objectStoreNames.contains('documents')) {
        const docStore = database.createObjectStore('documents', { keyPath: 'docId' })
        docStore.createIndex('kbId_idx', 'kbId', { unique: false })
      }

      if (!database.objectStoreNames.contains('chunks')) {
        const chunkStore = database.createObjectStore('chunks', { keyPath: 'chunkId', autoIncrement: true })
        chunkStore.createIndex('kbId_idx', 'kbId', { unique: false })
        chunkStore.createIndex('docId_idx', 'docId', { unique: false })
      }
    }

    request.onsuccess = (event) => {
      db = event.target.result
      resolve(db)
    }

    request.onerror = () => reject(new Error('无法打开 IndexedDB 数据库'))
    request.onblocked = () => reject(new Error('数据库被其他标签页占用'))
  })
}

export const vectorStore = {
  async insertDocument(docMeta) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction('documents', 'readwrite')
      tx.objectStore('documents').add(docMeta)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async insertChunks(chunks) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction('chunks', 'readwrite')
      const store = tx.objectStore('chunks')
      for (const chunk of chunks) {
        store.add(chunk)
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async getChunksByKb(kbId) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction('chunks', 'readonly')
      const index = tx.objectStore('chunks').index('kbId_idx')
      const request = index.getAll(kbId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async getChunksByDoc(docId) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction('chunks', 'readonly')
      const index = tx.objectStore('chunks').index('docId_idx')
      const request = index.getAll(docId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async search(queryVector, kbId, topK = 5) {
    const chunks = await this.getChunksByKb(kbId)
    if (!chunks.length) return []
    return topKSimilar(queryVector, chunks, topK)
  },

  async getDocumentsByKb(kbId) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction('documents', 'readonly')
      const index = tx.objectStore('documents').index('kbId_idx')
      const request = index.getAll(kbId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async getDocument(docId) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction('documents', 'readonly')
      const request = tx.objectStore('documents').get(docId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async deleteDocument(docId) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(['documents', 'chunks'], 'readwrite')
      tx.objectStore('documents').delete(docId)
      const chunkIndex = tx.objectStore('chunks').index('docId_idx')
      const request = chunkIndex.openCursor(IDBKeyRange.only(docId))
      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async deleteKnowledgeBase(kbId) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(['documents', 'chunks'], 'readwrite')
      const docIndex = tx.objectStore('documents').index('kbId_idx')
      const docRequest = docIndex.openCursor(IDBKeyRange.only(kbId))
      docRequest.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) { cursor.delete(); cursor.continue() }
      }
      const chunkIndex = tx.objectStore('chunks').index('kbId_idx')
      const chunkRequest = chunkIndex.openCursor(IDBKeyRange.only(kbId))
      chunkRequest.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) { cursor.delete(); cursor.continue() }
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async getStorageStats() {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(['documents', 'chunks'], 'readonly')
      let docCount = 0
      let chunkCount = 0
      tx.objectStore('documents').count().onsuccess = (e) => { docCount = e.target.result }
      tx.objectStore('chunks').count().onsuccess = (e) => { chunkCount = e.target.result }
      tx.oncomplete = () => resolve({ docCount, chunkCount })
      tx.onerror = () => reject(tx.error)
    })
  }
}
