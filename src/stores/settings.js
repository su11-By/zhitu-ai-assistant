import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { AI_DEFAULTS } from '../utils/constants.js'

export const useSettingsStore = defineStore('settings', () => {
  const savedTheme = localStorage.getItem('app-theme')
  const savedSettings = loadSettings()

  const theme = ref(savedTheme || 'light')
  const deepseekApiKey = ref(savedSettings.deepseekApiKey || '')
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
      deepseekApiKey: deepseekApiKey.value
    }))
  }

  watch(aiConfig, () => {
    saveAIConfig()
  }, { deep: true })

  watch(deepseekApiKey, () => {
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

  return { theme, deepseekApiKey, aiConfig, toggleTheme, setTheme, updateAIConfig }
})
