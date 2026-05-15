import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth.js'
import { useToastStore } from './toast.js'
import { sendMessage } from '../services/chatService.js'
import { CREATION_MODES } from '../utils/constants.js'

export const useCreationStore = defineStore('creation', () => {
  const auth = useAuthStore()

  function loadActiveMode() {
    try {
      const savedId = JSON.parse(localStorage.getItem(getStorageKey('mode')))
      return CREATION_MODES.find((m) => m.id === savedId) || CREATION_MODES[0]
    } catch { return CREATION_MODES[0] }
  }

  const activeMode = ref(loadActiveMode())
  const inputText = ref('')
  const result = ref('')
  const isGenerating = ref(false)
  const error = ref('')
  const history = ref(loadHistory())

  function getStorageKey() {
    return `creation-history-${auth.getUserPrefix()}`
  }

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(getStorageKey())) || [] } catch { return [] }
  }

  function saveHistory() {
    localStorage.setItem(getStorageKey(), JSON.stringify(history.value.slice(0, 50)))
  }

  function setMode(modeId) {
    const found = CREATION_MODES.find((m) => m.id === modeId)
    if (found) {
      activeMode.value = found
      result.value = ''
      error.value = ''
      localStorage.setItem(getStorageKey('mode'), JSON.stringify(found.id))
    }
  }

  async function generate() {
    if (!inputText.value.trim() || isGenerating.value) return

    isGenerating.value = true
    error.value = ''
    result.value = ''

    const systemPrompt = activeMode.value.systemPrompt

    try {
      const output = await sendMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inputText.value.trim() }
      ], {
        temperature: activeMode.value.id === 'proofread' ? 0.1 : 0.5,
        maxTokens: 2048
      })

      result.value = output

      history.value.unshift({
        id: Date.now(),
        mode: activeMode.value.id,
        modeLabel: activeMode.value.label,
        input: inputText.value.trim().slice(0, 500),
        output: output.slice(0, 1000),
        timestamp: Date.now()
      })
      saveHistory()
    } catch (e) {
      error.value = e.message || '生成失败，请检查 LM Studio 是否在运行'
    } finally {
      isGenerating.value = false
    }
  }

  function clearResult() {
    result.value = ''
    error.value = ''
  }

  function clearInput() {
    inputText.value = ''
    result.value = ''
    error.value = ''
  }

  function clearHistory() {
    history.value = []
    saveHistory()
  }

  function copyResult() {
    if (!result.value) return
    const toast = useToastStore()
    navigator.clipboard.writeText(result.value)
      .then(() => toast.success('已复制到剪贴板'))
      .catch(() => toast.error('复制失败'))
  }

  return {
    activeMode,
    inputText,
    result,
    isGenerating,
    error,
    history,
    setMode,
    generate,
    clearResult,
    clearInput,
    clearHistory,
    copyResult
  }
})
