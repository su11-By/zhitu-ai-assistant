<template>
  <div class="kb-detail">
    <div class="kb-main">
      <div class="kb-header">
        <div>
          <h2>{{ store.activeKb?.name || '知识库' }}</h2>
          <p v-if="store.activeKb">{{ store.kbDocs.length }} 个文档{{ store.activeKb.description ? ' · ' + store.activeKb.description : '' }}</p>
        </div>
        <div class="kb-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索文档标题..." />
        </div>
      </div>

      <div v-if="!store.activeKbId" class="empty-hint">
        <div class="hint-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
        </div>
        <h3>选择一个知识库</h3>
        <p>在左侧面板选择或创建一个知识库，上传文档构建私有知识库</p>
      </div>

      <div v-else class="kb-body">
        <div class="docs-section">
          <div class="section-header">
            <h3>文档列表</h3>
            <span v-if="filteredDocs.length !== store.kbDocs.length" class="filter-count">
              {{ filteredDocs.length }} / {{ store.kbDocs.length }}
            </span>
          </div>

          <div v-if="filteredDocs.length" class="docs-list">
            <div
              v-for="doc in filteredDocs"
              :key="doc.docId"
              class="doc-card"
              :class="{ selected: selectedDoc?.docId === doc.docId }"
              @click="selectDoc(doc)"
            >
              <div class="doc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div class="doc-info">
                <span class="doc-name">{{ doc.title }}</span>
                <span class="doc-meta">{{ doc.formatLabel }} · {{ doc.chunkCount }} 分块</span>
              </div>
              <button class="doc-delete" @click.stop="removeDoc(doc.docId)" title="删除文档">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
                </svg>
              </button>
            </div>
          </div>

          <EmptyState
            v-else
            title="暂无文档"
            description="拖拽文件到下方上传区域，支持 PDF、Word、MD、TXT 格式"
          />

          <div class="uploader">
            <div
              class="drop-zone"
              :class="{ dragging: isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="onDrop"
              @click="triggerInput"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p>拖拽文件或点击上传</p>
              <span class="hint">PDF、Word、MD、TXT（最大 50MB）</span>
            </div>

            <input ref="fileInput" type="file" accept=".pdf,.docx,.doc,.md,.txt,.text" @change="onFileChange" style="display:none" />

            <div v-if="uploadError" class="upload-error">{{ uploadError }}</div>

            <button v-if="store.activeKbId" class="upload-btn" @click="triggerInput" :disabled="store.isLoading">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              上传到 {{ store.activeKb?.name || '' }}
            </button>
            <p v-else class="hint-text">请先在左侧选择或创建一个知识库</p>
          </div>
        </div>
      </div>
    </div>

    <transition name="slide-panel">
      <div v-if="selectedDoc" class="doc-detail-panel">
        <div class="panel-header">
          <h3>{{ selectedDoc.title }}</h3>
          <button class="close-btn" @click="selectedDoc = null">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="panel-body">
          <div class="doc-stats">
            <div class="stat">
              <strong>{{ selectedDoc.chunkCount }}</strong>
              <span>分块数</span>
            </div>
            <div class="stat">
              <strong>{{ selectedDoc.formatLabel }}</strong>
              <span>格式</span>
            </div>
            <div class="stat">
              <strong>{{ formatDate(selectedDoc.createdAt) }}</strong>
              <span>上传时间</span>
            </div>
          </div>
          <div class="preview-text">
            <pre>{{ selectedDoc.rawText?.slice(0, 5000) }}</pre>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useKnowledgeStore } from '../../stores/knowledge.js'
import { useToastStore } from '../../stores/toast.js'
import EmptyState from '../common/EmptyState.vue'

const route = useRoute()
const store = useKnowledgeStore()
const toast = useToastStore()

const searchQuery = ref('')
const selectedDoc = ref(null)
const fileInput = ref(null)
const isDragging = ref(false)
const uploadError = ref('')

const filteredDocs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return store.kbDocs
  return store.kbDocs.filter((d) => d.title.toLowerCase().includes(q))
})

watch(
  () => route.params.kbId,
  (kbId) => {
    if (kbId && kbId !== store.activeKbId) {
      store.loadDocuments(kbId)
    }
  },
  { immediate: true }
)

function selectDoc(doc) {
  selectedDoc.value = doc
}

async function removeDoc(docId) {
  const ok = await toast.confirm({
    title: '删除文档',
    message: '确定删除此文档？所有关联的分块数据将被移除。',
    confirmText: '删除',
    variant: 'danger'
  })
  if (ok) {
    store.deleteDocument(docId)
    if (selectedDoc.value?.docId === docId) selectedDoc.value = null
    toast.success('文档已删除')
  }
}

function triggerInput() {
  if (!store.activeKbId) return
  uploadError.value = ''
  fileInput.value?.click()
}

async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) await processFile(file)
  if (fileInput.value) fileInput.value.value = ''
}

async function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) await processFile(file)
}

async function processFile(file) {
  if (!store.activeKbId) return
  uploadError.value = ''

  try {
    await store.uploadDocument(file, store.activeKbId)
    searchQuery.value = ''
    toast.success(`"${file.name}" 上传成功`)
  } catch (e) {
    uploadError.value = e.message || '上传失败'
    toast.error(e.message || '上传失败')
  }
}

function formatDate(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.kb-detail {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.kb-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 24px 28px;
}

.kb-header {
  margin-bottom: 24px;
}

.kb-header h2 {
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.kb-header p {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.kb-search {
  margin-top: 14px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 9px 14px 9px 36px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-ghost);
}

.empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60%;
  text-align: center;
  gap: 12px;
}

.hint-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.hint-icon svg {
  width: 24px;
  height: 24px;
}

.empty-hint h3 {
  font-size: var(--text-lg);
  font-weight: 600;
}

.empty-hint p {
  font-size: var(--text-sm);
  color: var(--text-muted);
  max-width: 340px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 12px;
}

.section-header h3 {
  font-size: var(--text-base);
  font-weight: 600;
}

.filter-count {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.docs-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 16px;
}

.doc-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
  border: 1px solid transparent;
}

.doc-card:hover {
  background: var(--bg-hover);
}

.doc-card.selected {
  background: var(--bg-card);
  border-color: var(--border);
}

.doc-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-muted);
}

.doc-icon svg {
  width: 15px;
  height: 15px;
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-name {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-meta {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 2px;
  display: block;
}

.doc-delete {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  opacity: 0;
  transition: all var(--duration-fast);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.doc-card:hover .doc-delete {
  opacity: 1;
}

.doc-delete:hover {
  color: var(--error);
  background: rgba(220, 38, 38, 0.06);
}

.doc-delete svg {
  width: 15px;
  height: 15px;
}

/* Uploader */
.uploader {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drop-zone {
  padding: 32px 20px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  text-align: center;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--border-focus);
  background: var(--bg-hover);
}

.drop-zone svg {
  width: 32px;
  height: 32px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.drop-zone p {
  font-size: var(--text-base);
  color: var(--text-secondary);
  font-weight: 500;
}

.hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 4px;
  display: block;
}

.upload-error {
  padding: 10px 14px;
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--radius-sm);
  color: var(--error);
  font-size: var(--text-sm);
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--duration-fast);
}

.upload-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-btn svg {
  width: 16px;
  height: 16px;
}

.hint-text {
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-align: center;
}

/* Document detail panel */
.doc-detail-panel {
  width: 380px;
  border-left: 1px solid var(--border);
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.panel-header h3 {
  font-size: var(--text-base);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  transition: all var(--duration-fast);
}

.close-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.doc-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.stat {
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  text-align: center;
}

.stat strong {
  display: block;
  font-size: var(--text-lg);
  color: var(--accent);
  font-weight: 700;
}

.stat span {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 2px;
  display: block;
}

.preview-text pre {
  font-size: var(--text-sm);
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-secondary);
}

/* Slide transition */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
