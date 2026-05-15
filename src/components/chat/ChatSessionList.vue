<template>
  <div class="sidebar-sessions">
    <div class="sessions-header">
      <h3>对话</h3>
      <button class="new-session-btn" @click="createNew" title="新建对话">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>

    <div class="session-list">
      <div
        v-for="session in store.sessions"
        :key="session.id"
        class="session-card"
        :class="{ active: store.activeSessionId === session.id }"
        @click="store.switchSession(session.id)"
      >
        <div class="session-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div class="session-info">
          <span class="session-title">{{ session.title }}</span>
          <span class="session-meta">{{ formatDate(session.updatedAt) }}</span>
        </div>
        <button class="session-delete" @click.stop="remove(session.id)" title="删除">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <p v-if="!store.sessions.length" class="empty-state">暂无对话，点击 + 开始</p>
  </div>
</template>

<script setup>
import { useChatStore } from '../../stores/chat.js'
import { useToastStore } from '../../stores/toast.js'

const store = useChatStore()
const toast = useToastStore()

function createNew() {
  store.newSession()
  store.unbindKnowledgeBase()
  store.clearSkill()
}

async function remove(id) {
  const ok = await toast.confirm({
    title: '删除对话',
    message: '确定删除此对话？删除后不可恢复。',
    confirmText: '删除',
    variant: 'danger'
  })
  if (ok) {
    store.deleteSession(id)
    toast.success('对话已删除')
  }
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.sidebar-sessions {
  padding: 8px;
}

.sessions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 12px;
}

.sessions-header h3 {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.new-session-btn {
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

.new-session-btn:hover {
  background: var(--accent-ghost);
  color: var(--accent);
  border-color: var(--accent-ghost);
}

.new-session-btn svg {
  width: 14px;
  height: 14px;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.session-card {
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

.session-card:hover {
  background: var(--bg-hover);
}

.session-card.active {
  background: var(--accent-ghost);
  color: var(--accent);
}

.session-icon {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.session-card.active .session-icon {
  background: var(--accent);
  color: white;
}

.session-icon svg {
  width: 15px;
  height: 15px;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-card.active .session-title {
  font-weight: 600;
}

.session-meta {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 2px;
  display: block;
}

.session-delete {
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

.session-card:hover .session-delete {
  opacity: 1;
}

.session-delete:hover {
  color: var(--error);
  background: rgba(220, 38, 38, 0.06);
}

.session-delete svg {
  width: 14px;
  height: 14px;
}

.empty-state {
  padding: 24px 12px;
  text-align: center;
  font-size: var(--text-xs);
  color: var(--text-muted);
}
</style>
