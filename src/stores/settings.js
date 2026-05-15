import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { AI_DEFAULTS } from '../utils/constants.js'

export const useSettingsStore = defineStore('settings', () => {
  const savedTheme = localStorage.getItem('app-theme')
  const savedSettings = loadSettings()

  const theme = ref(savedTheme || 'light')
  const lmStudioApiKey = ref(savedSettings.lmStudioApiKey || '')
  const aiConfig = ref({
    temperature: savedSettings.temperature ?? AI_DEFAULTS.temperature,
    maxTokens: savedSettings.maxTokens ?? AI_DEFAULTS.maxTokens,
    contextWindow: savedSettings.contextWindow ?? AI_DEFAULTS.contextWindow,
    topK: savedSettings.topK ?? AI_DEFAULTS.topK
  })

  watch(theme, (val) => {
    document.documentElement.setAttribute('data-theme', val)
    localStorage.setItem('app-theme', val)
  }, { immediate: true })

  function saveAIConfig() {
    localStorage.setItem('app-ai-config', JSON.stringify({
      ...aiConfig.value,
      lmStudioApiKey: lmStudioApiKey.value
    }))
  }

  watch(aiConfig, () => {
    saveAIConfig()
  }, { deep: true })

  watch(lmStudioApiKey, () => {
    saveAIConfig()
  })

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(t) {
    theme.value = t
  }

  function updateAIConfig(patch) {
    Object.assign(aiConfig.value, patch)
  }

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem('app-ai-config')) || {}
    } catch {
      return {}
    }
  }

  return { theme, lmStudioApiKey, aiConfig, toggleTheme, setTheme, updateAIConfig }
})
