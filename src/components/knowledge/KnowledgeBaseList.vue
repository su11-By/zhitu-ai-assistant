<template>
  <div class="sidebar-kb-list">
    <div class="kb-list-header">
      <h3>知识库</h3>
      <button class="create-kb-btn" @click="showCreate = true" title="新建知识库">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>

    <div class="kb-list">
      <div
        v-for="kb in store.knowledgeBases"
        :key="kb.id"
        class="kb-card"
        :class="{ active: store.activeKbId === kb.id }"
        @click="select(kb.id)"
      >
        <div class="kb-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
        </div>
        <div class="kb-info">
          <span class="kb-name">{{ kb.name }}</span>
          <span class="kb-meta">{{ kb.category || '未分类' }}</span>
        </div>
        <button class="kb-delete" @click.stop="remove(kb.id)" title="删除">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="!store.knowledgeBases.length" class="empty-state">
      <p>暂无知识库</p>
      <p>点击 + 创建一个</p>
    </div>

    <Teleport to="body">
      <div v-if="showCreate" class="dialog-overlay" @click.self="showCreate = false">
        <div class="dialog-card">
          <h3>新建知识库</h3>
          <div class="form-group">
            <input v-model="newName" type="text" placeholder="知识库名称" @keydown.enter="create" />
            <input v-model="newCategory" type="text" placeholder="分类（可选）" />
            <textarea v-model="newDesc" placeholder="用途说明（可选）" rows="2"></textarea>
          </div>
          <div class="dialog-actions">
            <button class="cancel-btn" @click="showCreate = false">取消</button>
            <button class="confirm-btn" @click="create">创建</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useKnowledgeStore } from '../../stores/knowledge.js'
import { useToastStore } from '../../stores/toast.js'

const store = useKnowledgeStore()
const toast = useToastStore()
const router = useRouter()

const showCreate = ref(false)
const newName = ref('')
const newCategory = ref('')
const newDesc = ref('')

function select(kbId) {
  store.loadDocuments(kbId)
  router.push(`/knowledge/${kbId}`)
}

async function remove(kbId) {
  const ok = await toast.confirm({
    title: '删除知识库',
    message: '确定删除此知识库？所有文档和向量数据将被永久删除。',
    confirmText: '删除',
    variant: 'danger'
  })
  if (ok) {
    store.deleteKB(kbId)
    toast.success('知识库已删除')
  }
}

function create() {
  if (!newName.value.trim()) return
  const kb = store.createKB({ name: newName.value, category: newCategory.value, description: newDesc.value })
  newName.value = ''
  newCategory.value = ''
  newDesc.value = ''
  showCreate.value = false
  store.loadDocuments(kb.id)
  router.push(`/knowledge/${kb.id}`)
  toast.success('知识库已创建')
}
</script>

<style scoped>
.sidebar-kb-list {
  padding: 8px;
}

.kb-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 12px;
}

.kb-list-header h3 {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.create-kb-btn {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}

.create-kb-btn:hover {
  background: var(--accent-ghost);
  color: var(--accent);
  border-color: var(--accent-ghost);
}

.create-kb-btn svg {
  width: 14px;
  height: 14px;
}

.kb-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.kb-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all var(--duration-fast) var(--ease-out);
}

.kb-card:hover {
  background: var(--bg-hover);
}

.kb-card.active {
  background: var(--accent-ghost);
  color: var(--accent);
}

.kb-icon {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kb-card.active .kb-icon {
  background: var(--accent);
  color: white;
}

.kb-icon svg {
  width: 15px;
  height: 15px;
}

.kb-info {
  flex: 1;
  min-width: 0;
}

.kb-name {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kb-card.active .kb-name {
  font-weight: 600;
}

.kb-meta {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 2px;
  display: block;
}

.kb-delete {
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

.kb-card:hover .kb-delete {
  opacity: 1;
}

.kb-delete:hover {
  color: var(--error);
  background: rgba(220, 38, 38, 0.06);
}

.empty-state {
  padding: 24px 12px;
  text-align: center;
}

.empty-state p {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-bottom: 2px;
}

/* Create dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.dialog-card {
  width: 400px;
  max-width: 90vw;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-xl);
}

.dialog-card h3 {
  margin-bottom: 16px;
  font-size: var(--text-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.form-group input,
.form-group textarea {
  padding: 10px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  resize: none;
  transition: border-color var(--duration-fast) var(--ease-out);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-ghost);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn {
  padding: 8px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.cancel-btn:hover {
  background: var(--bg-hover);
}

.confirm-btn {
  padding: 8px 20px;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--duration-fast);
}

.confirm-btn:hover {
  opacity: 0.9;
}
</style>
