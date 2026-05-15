import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'

function genId() {
  return 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)
}

export const useTaskStore = defineStore('tasks', () => {
  const auth = useAuthStore()
  const tasks = ref(load())
  const filterStatus = ref('all')
  const filterPriority = ref('all')
  const searchQuery = ref('')

  function key() {
    return `tasks-${auth.getUserPrefix()}`
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(key())) || [] } catch { return [] }
  }

  function save() {
    localStorage.setItem(key(), JSON.stringify(tasks.value))
  }

  const filteredTasks = computed(() => {
    let result = tasks.value
    if (filterStatus.value !== 'all') {
      result = result.filter(t => t.status === filterStatus.value)
    }
    if (filterPriority.value !== 'all') {
      result = result.filter(t => t.priority === filterPriority.value)
    }
    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      result = result.filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
    }
    return result.slice().sort((a, b) => b.createdAt - a.createdAt)
  })

  const stats = computed(() => {
    const now = Date.now()
    return {
      total: tasks.value.length,
      todo: tasks.value.filter(t => t.status === 'todo').length,
      inProgress: tasks.value.filter(t => t.status === 'in_progress').length,
      completed: tasks.value.filter(t => t.status === 'completed').length,
      overdue: tasks.value.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < now).length
    }
  })

  function add({ title, description = '', priority = 'medium', dueDate = null }) {
    const task = {
      id: genId(),
      title: title.trim(),
      description: description.trim(),
      status: 'todo',
      priority,
      dueDate: dueDate ? new Date(dueDate).getTime() : null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    tasks.value.unshift(task)
    save()
    return task
  }

  function update(taskId, patch) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      Object.assign(task, { ...patch, updatedAt: Date.now() })
      save()
    }
  }

  function remove(taskId) {
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    save()
  }

  function toggleStatus(taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    const flow = { todo: 'in_progress', in_progress: 'completed', completed: 'todo' }
    task.status = flow[task.status] || 'todo'
    task.updatedAt = Date.now()
    save()
  }

  function setFilter(status) {
    filterStatus.value = status
  }

  function setPriorityFilter(priority) {
    filterPriority.value = priority
  }

  return {
    tasks,
    filterStatus,
    filterPriority,
    searchQuery,
    filteredTasks,
    stats,
    add,
    update,
    remove,
    toggleStatus,
    setFilter,
    setPriorityFilter
  }
})
