<template>
  <div class="debate-page">
    <!-- Sidebar: Sessions list -->
    <aside class="debate-sidebar">
      <div class="sidebar-header">
        <h3>辩论记录</h3>
        <button class="new-debate-btn" @click="handleNewDebate" title="新建辩论">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
      <div class="session-list" v-if="store.sessions.length">
        <button
          v-for="s in store.sessions"
          :key="s.id"
          class="session-item"
          :class="{ active: s.id === store.activeSessionId }"
          @click="store.switchSession(s.id)"
        >
          <div class="session-main">
            <span class="session-topic">{{ s.topic || '未命名辩论' }}</span>
            <span class="session-meta">{{ s.agents?.length || 0 }}人 · {{ s.totalRounds }}轮</span>
          </div>
          <button class="session-delete" @click.stop="confirmDelete(s)" title="删除">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </button>
      </div>
      <div v-else class="sidebar-empty">暂无辩论记录</div>
    </aside>

    <!-- Main Content -->
    <main class="debate-main">
      <!-- Header -->
      <header class="debate-header" v-if="store.topic">
        <h2 class="debate-topic-title">{{ store.topic }}</h2>
        <div class="debate-header-meta">
          <span>{{ store.agents.length }} 位参与者</span>
          <span>·</span>
          <span>{{ store.totalRounds }} 轮</span>
          <span v-if="store.isCompleted" class="badge-completed">已完成</span>
          <span v-else-if="store.isRunning" class="badge-running">进行中</span>
        </div>
        <button
          v-if="store.isRunning"
          class="stop-btn"
          @click="store.stopDebate()"
        >
          停止辩论
        </button>
      </header>

      <!-- Phase: Setup -->
      <DebateSetup
        v-if="store.phase === 'setup'"
        :topic="store.topic"
        :agents="store.agents"
        :rounds="store.totalRounds"
        :round-labels="store.roundLabels"
        @start="handleStart"
      />

      <!-- Phase: Running or Completed -->
      <DebateArena v-if="store.phase === 'running' || store.phase === 'completed'" />

      <!-- Completed actions -->
      <div v-if="store.phase === 'completed'" class="completed-actions">
        <button class="action-btn primary" @click="handleNewDebate">开始新辩论</button>
        <button class="action-btn secondary" @click="exportMarkdown">导出 Markdown</button>
      </div>
    </main>

    <!-- Delete Confirm -->
    <ConfirmDialog
      v-if="deleteTarget"
      title="删除辩论"
      :message="`确定删除辩论「${deleteTarget.topic || '未命名'}」？此操作不可恢复。`"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDebateStore } from '../../stores/debate.js'
import { DEBATE_AGENTS } from '../../services/debateService.js'
import DebateSetup from './DebateSetup.vue'
import DebateArena from './DebateArena.vue'
import ConfirmDialog from '../common/ConfirmDialog.vue'

const store = useDebateStore()
const deleteTarget = ref(null)

function handleStart(config) {
  store.setupDebate(config)
  const host = DEBATE_AGENTS.find(a => a.id === 'host')
  if (!config.agents.find(a => a.id === 'host')) {
    store.addHostAgent()
  }
  store.startDebate()
}

function handleNewDebate() {
  store.resetAll()
}

function confirmDelete(session) {
  deleteTarget.value = session
}

function handleDelete() {
  if (deleteTarget.value) {
    store.deleteSession(deleteTarget.value.id)
  }
  deleteTarget.value = null
}

function exportMarkdown() {
  let md = `# 多智能体辩论记录\n\n`
  md += `**辩题**: ${store.topic}\n\n`
  md += `**参与者**: ${store.agents.map(a => `${a.icon} ${a.name}`).join(' | ')}\n\n`
  md += `**轮次**: ${store.totalRounds}\n\n`
  md += `---\n\n`

  for (let round = 1; round <= Math.max(...store.messages.map(m => m.round)); round++) {
    const roundMsgs = store.messages.filter(m => m.round === round)
    if (!roundMsgs.length) continue
    md += `## 第 ${round} 轮\n\n`
    for (const msg of roundMsgs) {
      md += `### ${msg.agentIcon} ${msg.agentName}（${msg.role}）\n\n${msg.content}\n\n`
    }
  }

  md += `---\n*生成时间: ${new Date().toLocaleString()}*`

  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `debate-${store.topic.slice(0, 20) || 'record'}-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.debate-page {
  display: flex;
  height: 100%;
  overflow: hidden;
}

/* Sidebar */
.debate-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.sidebar-header h3 {
  font-size: var(--text-sm);
  font-weight: 600;
}

.new-debate-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-md);
  color: #fff;
  cursor: pointer;
  transition: opacity var(--duration-fast);
}

.new-debate-btn:hover {
  opacity: 0.85;
}

.new-debate-btn svg {
  width: 16px;
  height: 16px;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  margin-bottom: 2px;
  transition: all var(--duration-fast) var(--ease-out);
}

.session-item:hover {
  background: var(--bg-hover);
}

.session-item.active {
  background: var(--accent-ghost);
  border-color: var(--accent);
}

.session-main {
  flex: 1;
  min-width: 0;
}

.session-topic {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-meta {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.session-delete {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0;
  transition: all var(--duration-fast);
  flex-shrink: 0;
}

.session-item:hover .session-delete {
  opacity: 1;
}

.session-delete:hover {
  color: var(--error);
  background: rgba(239, 68, 68, 0.1);
}

.session-delete svg {
  width: 12px;
  height: 12px;
}

.sidebar-empty {
  padding: 24px 16px;
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* Main */
.debate-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.debate-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.debate-topic-title {
  font-size: var(--text-base);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.debate-header-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-xs);
  color: var(--text-muted);
  flex-shrink: 0;
}

.badge-completed {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: rgba(16, 185, 129, 0.12);
  color: var(--success);
  font-weight: 600;
}

.badge-running {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: rgba(59, 130, 246, 0.12);
  color: var(--accent);
  font-weight: 600;
  animation: pulse-bg 2s infinite;
}

@keyframes pulse-bg {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.stop-btn {
  padding: 6px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error);
  border-radius: var(--radius-full);
  color: var(--error);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--duration-fast);
}

.stop-btn:hover {
  background: var(--error);
  color: #fff;
}

/* Completed actions */
.completed-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  background: var(--bg-card);
  flex-shrink: 0;
}

.action-btn {
  padding: 10px 24px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  font-family: inherit;
}

.action-btn.primary {
  background: var(--accent);
  color: #fff;
  border: none;
}

.action-btn.primary:hover {
  opacity: 0.9;
}

.action-btn.secondary {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.action-btn.secondary:hover {
  border-color: var(--border-focus);
  background: var(--bg-hover);
}

@media (max-width: 700px) {
  .debate-sidebar {
    display: none;
  }
}
</style>
