<template>
  <div class="task-panel">
    <div class="page-header">
      <h2>任务管理</h2>
      <button class="create-btn" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新建任务
      </button>
    </div>

    <div class="stats-bar">
      <button class="stat-chip" :class="{ active: store.filterStatus === 'all' }" @click="store.setFilter('all')">
        全部 <strong>{{ store.stats.total }}</strong>
      </button>
      <button class="stat-chip" :class="{ active: store.filterStatus === 'todo' }" @click="store.setFilter('todo')">
        待办 <strong>{{ store.stats.todo }}</strong>
      </button>
      <button class="stat-chip" :class="{ active: store.filterStatus === 'in_progress' }" @click="store.setFilter('in_progress')">
        进行中 <strong>{{ store.stats.inProgress }}</strong>
      </button>
      <button class="stat-chip" :class="{ active: store.filterStatus === 'completed' }" @click="store.setFilter('completed')">
        已完成 <strong>{{ store.stats.completed }}</strong>
      </button>
      <button v-if="store.stats.overdue > 0" class="stat-chip overdue" @click="store.setFilter('all')">
        已逾期 <strong>{{ store.stats.overdue }}</strong>
      </button>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="store.searchQuery" type="text" placeholder="搜索任务..." />
      </div>
      <select :value="store.filterPriority" @change="store.setPriorityFilter($event.target.value)">
        <option value="all">全部优先级</option>
        <option value="urgent">紧急</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>
    </div>

    <div class="task-list" v-if="store.filteredTasks.length">
      <div
        v-for="task in store.filteredTasks"
        :key="task.id"
        class="task-card"
        :class="{ completed: task.status === 'completed', overdue: isOverdue(task) }"
      >
        <button class="task-check" :class="task.status" @click="store.toggleStatus(task.id)" :title="statusTitle(task.status)">
          <svg v-if="task.status === 'completed'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          <svg v-else-if="task.status === 'in_progress'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="9"/>
          </svg>
          <div v-else class="empty-circle"></div>
        </button>

        <div class="task-body" @click="openEdit(task)">
          <div class="task-header">
            <span class="task-title" :class="{ done: task.status === 'completed' }">{{ task.title }}</span>
            <span class="priority-tag" :class="task.priority">{{ priorityLabel(task.priority) }}</span>
          </div>
          <p v-if="task.description" class="task-desc">{{ task.description }}</p>
          <div class="task-meta">
            <span v-if="task.dueDate" class="due-date" :class="{ urgent: isOverdue(task) }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
                <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
              </svg>
              {{ formatDue(task.dueDate) }}
            </span>
            <span class="created-date">{{ formatDate(task.createdAt) }}</span>
          </div>
        </div>

        <button class="task-delete" @click.stop="removeTask(task.id)" title="删除">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      </div>
      <h3>{{ store.filterStatus === 'all' ? '暂无任务' : '没有匹配的任务' }}</h3>
      <p>{{ store.filterStatus === 'all' ? '点击"新建任务"开始规划你的答辩准备' : '尝试调整筛选条件' }}</p>
    </div>

    <Teleport to="body">
      <div v-if="showDialog" class="dialog-overlay" @click.self="closeDialog">
        <div class="dialog-card">
          <h3>{{ editingTask ? '编辑任务' : '新建任务' }}</h3>
          <div class="form-group">
            <input
              ref="titleInput"
              v-model="form.title"
              type="text"
              placeholder="任务标题"
              @keydown.enter="submit"
            />
            <textarea v-model="form.description" placeholder="任务描述（可选）" rows="3"></textarea>
            <div class="form-row">
              <select v-model="form.priority">
                <option value="low">低优先级</option>
                <option value="medium" selected>中优先级</option>
                <option value="high">高优先级</option>
                <option value="urgent">紧急</option>
              </select>
              <input v-model="form.dueDate" type="date" />
            </div>
          </div>
          <div class="dialog-actions">
            <button class="cancel-btn" @click="closeDialog">取消</button>
            <button class="confirm-btn" @click="submit">{{ editingTask ? '保存' : '创建' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useTaskStore } from '../../stores/tasks.js'
import { useToastStore } from '../../stores/toast.js'

const store = useTaskStore()
const toast = useToastStore()

const showDialog = ref(false)
const editingTask = ref(null)
const titleInput = ref(null)

const form = reactive({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: ''
})

const priorityLabels = { low: '低', medium: '中', high: '高', urgent: '紧急' }

function priorityLabel(p) { return priorityLabels[p] || p }

function statusTitle(s) {
  return { todo: '点击标记进行中', in_progress: '点击标记完成', completed: '点击重新打开' }[s] || ''
}

function isOverdue(task) {
  return task.status !== 'completed' && task.dueDate && task.dueDate < Date.now()
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function formatDue(ts) {
  const now = Date.now()
  const diff = ts - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0) return `逾期 ${Math.abs(days)} 天`
  if (days === 0) return '今天截止'
  if (days === 1) return '明天截止'
  if (days <= 7) return `${days} 天后截止`
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + ' 截止'
}

function openCreate() {
  editingTask.value = null
  form.title = ''
  form.description = ''
  form.priority = 'medium'
  form.dueDate = ''
  showDialog.value = true
  nextTick(() => titleInput.value?.focus())
}

function openEdit(task) {
  editingTask.value = task
  form.title = task.title
  form.description = task.description || ''
  form.priority = task.priority
  form.dueDate = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
  showDialog.value = true
  nextTick(() => titleInput.value?.focus())
}

function closeDialog() {
  showDialog.value = false
  editingTask.value = null
}

function submit() {
  if (!form.title.trim()) return

  if (editingTask.value) {
    store.update(editingTask.value.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate).getTime() : null
    })
    toast.success('任务已更新')
  } else {
    store.add({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      dueDate: form.dueDate || null
    })
    toast.success('任务已创建')
  }

  closeDialog()
}

async function removeTask(id) {
  const ok = await toast.confirm({
    title: '删除任务',
    message: '确定删除此任务？',
    confirmText: '删除',
    variant: 'danger'
  })
  if (ok) {
    store.remove(id)
    toast.success('任务已删除')
  }
}
</script>

<style scoped>
.task-panel {
  padding: 24px 32px;
  max-width: 800px;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  background: var(--accent);
  border: none;
  color: white;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--duration-fast);
}

.create-btn:hover { opacity: 0.9; }

.create-btn svg {
  width: 15px;
  height: 15px;
}

.stats-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.stat-chip {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.stat-chip:hover {
  border-color: var(--border-focus);
  color: var(--text-primary);
}

.stat-chip.active {
  background: var(--accent-ghost);
  border-color: transparent;
  color: var(--accent);
}

.stat-chip strong {
  font-weight: 700;
  margin-left: 2px;
}

.stat-chip.overdue {
  color: var(--error);
  border-color: rgba(220, 38, 38, 0.15);
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 8px 14px 8px 34px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: border-color var(--duration-fast);
}

.search-box input:focus {
  outline: none;
  border-color: var(--accent);
}

.toolbar select {
  padding: 8px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-sm);
  cursor: pointer;
}

.toolbar select:focus {
  outline: none;
  border-color: var(--accent);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-out);
}

.task-card:hover {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-sm);
}

.task-card.completed {
  opacity: 0.6;
}

.task-card.overdue {
  border-left: 3px solid var(--error);
}

.task-check {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all var(--duration-fast);
  color: var(--text-muted);
}

.task-check:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.task-check.completed {
  background: var(--success);
  border-color: var(--success);
  color: white;
}

.task-check.in_progress {
  border-color: var(--accent);
  color: var(--accent);
}

.task-check svg {
  width: 16px;
  height: 16px;
}

.empty-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.task-body {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.task-title {
  font-size: var(--text-base);
  font-weight: 600;
}

.task-title.done {
  text-decoration: line-through;
  color: var(--text-muted);
}

.priority-tag {
  padding: 1px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.priority-tag.low { background: var(--bg-hover); color: var(--text-muted); }
.priority-tag.medium { background: rgba(234, 88, 12, 0.08); color: var(--warning); }
.priority-tag.high { background: rgba(234, 88, 12, 0.12); color: var(--warning); }
.priority-tag.urgent { background: rgba(220, 38, 38, 0.08); color: var(--error); }

.task-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.due-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.due-date.urgent {
  color: var(--error);
  font-weight: 600;
}

.created-date {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.task-delete {
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

.task-card:hover .task-delete { opacity: 1; }

.task-delete:hover {
  color: var(--error);
  background: rgba(220, 38, 38, 0.06);
}

.task-delete svg {
  width: 15px;
  height: 15px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
  text-align: center;
  gap: 12px;
}

.empty-icon {
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

.empty-icon svg {
  width: 24px;
  height: 24px;
}

.empty-state h3 {
  font-size: var(--text-lg);
  font-weight: 600;
}

.empty-state p {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.dialog-card {
  width: 460px;
  max-width: 90vw;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 28px;
  box-shadow: var(--shadow-xl);
}

.dialog-card h3 {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.form-group input[type="text"],
.form-group textarea {
  padding: 10px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  resize: none;
  transition: border-color var(--duration-fast);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-ghost);
}

.form-row {
  display: flex;
  gap: 10px;
}

.form-row select,
.form-row input[type="date"] {
  flex: 1;
  padding: 9px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-sm);
  cursor: pointer;
}

.form-row select:focus,
.form-row input[type="date"]:focus {
  outline: none;
  border-color: var(--accent);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 9px 18px;
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
  color: var(--text-primary);
}

.confirm-btn {
  padding: 9px 22px;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--duration-fast);
}

.confirm-btn:hover { opacity: 0.9; }
</style>
