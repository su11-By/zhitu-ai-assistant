<template>
  <div class="agent-page">
    <!-- Sidebar -->
    <aside class="agent-sidebar">
      <div class="sidebar-header">
        <h3>执行记录</h3>
        <button class="new-btn" @click="store.resetAll()" title="新建任务">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
            <span class="session-goal">{{ s.goal || '未命名任务' }}</span>
            <span class="session-meta">{{ s.planSteps }}步 · {{ s.completedSteps }}/{{ s.planSteps }}完成</span>
          </div>
          <button class="session-delete" @click.stop="confirmDelete(s)" title="删除">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </button>
      </div>
      <div v-else class="sidebar-empty">暂无执行记录</div>
    </aside>

    <!-- Main -->
    <main class="agent-main">
      <!-- Phase: Input -->
      <AgentInput
        v-if="store.phase === 'input'"
        @start="store.startAgent($event)"
      />

      <!-- Phase: Planning -->
      <AgentPlanView v-if="store.phase === 'planning'" />

      <!-- Phase: Executing -->
      <AgentExecution v-if="store.phase === 'executing'" />

      <!-- Phase: Completed -->
      <template v-if="store.phase === 'completed'">
        <AgentExecution />
        <AgentResult
          @export="exportMarkdown"
          @save-to-kb="saveToKnowledgeBase"
          @create-tasks="createTasks"
          @new="store.resetAll()"
        />
      </template>
    </main>

    <!-- Delete confirm -->
    <ConfirmDialog
      v-if="deleteTarget"
      title="删除执行记录"
      :message="`确定删除「${deleteTarget.goal || '未命名任务'}」的执行记录？`"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />

    <!-- Toast -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAgentStore } from '../../stores/agent.js'
import { useKnowledgeStore } from '../../stores/knowledge.js'
import { useTaskStore } from '../../stores/tasks.js'
import { useToastStore } from '../../stores/toast.js'
import AgentInput from './AgentInput.vue'
import AgentPlanView from './AgentPlanView.vue'
import AgentExecution from './AgentExecution.vue'
import AgentResult from './AgentResult.vue'
import ConfirmDialog from '../common/ConfirmDialog.vue'
import ToastContainer from '../common/ToastContainer.vue'

const store = useAgentStore()
const toast = useToastStore()
const deleteTarget = ref(null)

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
  const md = `# ${store.goal}\n\n---\n\n${store.finalOutput}\n\n---\n*由 AI 自主工作流生成 · ${new Date().toLocaleString()}*`
  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `agent-output-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
  toast.show('已导出 Markdown 文件', 'success')
}

async function saveToKnowledgeBase() {
  try {
    const kbStore = useKnowledgeStore()
    const kb = kbStore.createKB({ name: store.goal.slice(0, 40), description: '由 AI 自主工作流生成' })
    const file = new File([store.finalOutput], `${store.goal.slice(0, 20) || 'output'}.md`, { type: 'text/markdown' })
    await kbStore.uploadDocument(file, kb.id)
    toast.show(`已保存到知识库「${kb.name}」`, 'success')
  } catch (e) {
    toast.show('保存失败: ' + e.message, 'error')
  }
}

function createTasks() {
  const taskStore = useTaskStore()
  const stepLines = store.finalOutput.split('\n').filter(l => /^[-*]\s/.test(l.trim()) || /^\d+[\.\)]\s/.test(l.trim()))
  const items = stepLines.length > 0 ? stepLines.slice(0, 8) : [store.goal]

  for (const item of items) {
    const text = item.replace(/^[-*\d]+[\.\)]\s*/, '').trim().slice(0, 80)
    taskStore.add({ title: text, description: `来自 AI 工作流: ${store.goal}`, priority: 'medium' })
  }
  toast.show(`已创建 ${Math.min(items.length, 8)} 个任务`, 'success')
}
</script>

<style scoped>
.agent-page {
  display: flex;
  height: 100%;
  overflow: hidden;
}

/* Sidebar */
.agent-sidebar {
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

.new-btn {
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
}

.new-btn svg {
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
  transition: all var(--duration-fast);
}

.session-item:hover { background: var(--bg-hover); }
.session-item.active { background: var(--accent-ghost); border-color: var(--accent); }

.session-main { flex: 1; min-width: 0; }
.session-goal {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.session-meta { font-size: var(--text-xs); color: var(--text-muted); }

.session-delete {
  width: 24px; height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none; border: none;
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0;
  flex-shrink: 0;
}

.session-item:hover .session-delete { opacity: 1; }
.session-delete:hover { color: var(--error); background: rgba(239, 68, 68, 0.1); }
.session-delete svg { width: 12px; height: 12px; }

.sidebar-empty { padding: 24px 16px; text-align: center; font-size: var(--text-sm); color: var(--text-muted); }

/* Main */
.agent-main {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-root);
}

@media (max-width: 700px) {
  .agent-sidebar { display: none; }
}
</style>
