import { defineStore } from 'pinia'
import { ref } from 'vue'

let nextId = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  const confirmState = ref(null)

  function add(message, type = 'info', duration = 3000) {
    const id = ++nextId
    toasts.value.push({ id, message, type, duration })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  function remove(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function success(message, duration) { return add(message, 'success', duration) }
  function error(message, duration) { return add(message, 'error', duration ?? 5000) }
  function warning(message, duration) { return add(message, 'warning', duration ?? 4000) }
  function info(message, duration) { return add(message, 'info', duration) }

  function confirm({ title = '确认操作', message = '确定要执行此操作吗？', confirmText = '确定', cancelText = '取消', variant = 'danger' } = {}) {
    return new Promise((resolve) => {
      confirmState.value = {
        title,
        message,
        confirmText,
        cancelText,
        variant,
        onConfirm: () => {
          confirmState.value = null
          resolve(true)
        },
        onCancel: () => {
          confirmState.value = null
          resolve(false)
        }
      }
    })
  }

  return { toasts, confirmState, add, remove, success, error, warning, info, confirm }
})
