import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'
import { useSettingsStore } from './settings.js'
import { streamChat } from '../services/chatService.js'
import { queryWithRAG } from '../services/ragService.js'
import { searchWeb, fetchPageContent } from '../services/webSearchService.js'
import { buildChatMessages } from '../services/contextManager.js'
import { estimateTokens } from '../utils/tokenizer.js'
import { getSkillById } from '../services/skillsRegistry.js'

function generateId() {
  return 'session-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)
}

function generateMsgId() {
  return 'msg-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)
}

export const useChatStore = defineStore('chat', () => {
  const auth = useAuthStore()
  const settings = useSettingsStore()

  const sessions = ref(loadSessions())
  const activeSessionId = ref(loadActiveSessionId())
  const messages = ref([])
  const isStreaming = ref(false)
  const streamingContent = ref('')
  const streamingReasoning = ref('')
  const error = ref('')
  const boundKbId = ref(null)
  const webSearchEnabled = ref(loadWebSearch())
  const isSearching = ref(false)
  const activeSkill = ref(loadActiveSkill())
  const prefillPrompt = ref('')
  let abortController = null

  // Restore messages when activeSessionId is set (e.g. after page refresh)
  if (activeSessionId.value) {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (session) {
      messages.value = loadMessages(activeSessionId.value)
      boundKbId.value = session.boundKbId || null
    } else {
      activeSessionId.value = null
      saveActiveSessionId()
    }
  }

  const activeSession = computed(() => sessions.value.find((s) => s.id === activeSessionId.value))
  const contextTokens = computed(() => estimateTokens(streamingContent.value) || estimateTokens(lastMessageContent.value))

  const lastMessageContent = computed(() => {
    if (!messages.value.length) return ''
    return messages.value[messages.value.length - 1].content
  })

  function getStorageKey(type) {
    const prefix = auth.getUserPrefix()
    return `chat-${type}-${prefix}`
  }

  function loadSessions() {
    try { return JSON.parse(localStorage.getItem(getStorageKey('sessions'))) || [] } catch { return [] }
  }

  function saveSessions() {
    localStorage.setItem(getStorageKey('sessions'), JSON.stringify(sessions.value))
  }

  function loadActiveSessionId() {
    try { return localStorage.getItem(getStorageKey('active-session')) || null } catch { return null }
  }

  function saveActiveSessionId() {
    if (activeSessionId.value) {
      localStorage.setItem(getStorageKey('active-session'), activeSessionId.value)
    } else {
      localStorage.removeItem(getStorageKey('active-session'))
    }
  }

  function loadWebSearch() {
    try { return JSON.parse(localStorage.getItem(getStorageKey('web-search'))) || false } catch { return false }
  }

  function saveWebSearch() {
    localStorage.setItem(getStorageKey('web-search'), JSON.stringify(webSearchEnabled.value))
  }

  function loadActiveSkill() {
    try {
      const skillId = JSON.parse(localStorage.getItem(getStorageKey('active-skill')))
      return skillId ? getSkillById(skillId) : null
    } catch { return null }
  }

  function saveActiveSkill() {
    if (activeSkill.value) {
      localStorage.setItem(getStorageKey('active-skill'), JSON.stringify(activeSkill.value.id))
    } else {
      localStorage.removeItem(getStorageKey('active-skill'))
    }
  }

  function loadMessages(sessionId) {
    try { return JSON.parse(localStorage.getItem(`chat-msgs-${sessionId}`)) || [] } catch { return [] }
  }

  function saveMessages(sessionId) {
    localStorage.setItem(`chat-msgs-${sessionId}`, JSON.stringify(messages.value))
  }

  function newSession(title = '新对话') {
    const session = {
      id: generateId(),
      title,
      boundKbId: boundKbId.value || null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    sessions.value.unshift(session)
    saveSessions()
    switchSession(session.id)
    return session
  }

  function switchSession(sessionId) {
    activeSessionId.value = sessionId
    saveActiveSessionId()
    messages.value = loadMessages(sessionId)
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session) {
      boundKbId.value = session.boundKbId || null
    }
    error.value = ''
  }

  function deleteSession(sessionId) {
    sessions.value = sessions.value.filter((s) => s.id !== sessionId)
    localStorage.removeItem(`chat-msgs-${sessionId}`)
    if (activeSessionId.value === sessionId) {
      const next = sessions.value[0]
      if (next) {
        switchSession(next.id)
      } else {
        activeSessionId.value = null
        messages.value = []
        saveActiveSessionId()
      }
    }
    saveSessions()
  }

  function bindKnowledgeBase(kbId) {
    boundKbId.value = kbId
    if (activeSession.value) {
      activeSession.value.boundKbId = kbId
      saveSessions()
    }
  }

  function unbindKnowledgeBase() {
    boundKbId.value = null
    if (activeSession.value) {
      activeSession.value.boundKbId = null
      saveSessions()
    }
  }

  function toggleWebSearch() {
    webSearchEnabled.value = !webSearchEnabled.value
    saveWebSearch()
  }

  function setSkill(skillId) {
    const skill = getSkillById(skillId)
    if (skill) {
      activeSkill.value = skill
      webSearchEnabled.value = false
      boundKbId.value = null
      saveWebSearch()
      saveActiveSkill()
    }
  }

  function clearSkill() {
    activeSkill.value = null
    saveActiveSkill()
  }

  function cancel() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    isStreaming.value = false
    isSearching.value = false
  }

  async function gatherKbContext(userText) {
    if (!boundKbId.value) return null
    try {
      return await queryWithRAG(userText, boundKbId.value)
    } catch { return null }
  }

  async function gatherWebContext(userText) {
    if (!webSearchEnabled.value) return []
    let webResults = []
    try {
      webResults = await searchWeb(userText, 5)
    } catch { return [] }

    for (const r of webResults) {
      if (!r.url) continue
      try {
        const pageText = await fetchPageContent(r.url)
        if (pageText) {
          webResults = webResults.map(item =>
            item.url === r.url ? { ...item, snippet: pageText, _fullText: true } : item
          )
        }
      } catch { /* ignore */ }
    }
    return webResults
  }

  async function streamAugmentedResponse(userText, kbResult, webResults) {
    const hasKb = kbResult && kbResult.grounded && kbResult.sources.length > 0
    const hasWeb = webResults.length > 0

    const contextParts = []
    let allSources = []

    if (hasKb) {
      contextParts.push('=== 知识库文档内容 ===\n' + kbResult.sources.map((s, i) => `[KB-${i + 1}: ${s.title}]\n${s.snippet}`).join('\n\n'))
      allSources = kbResult.sources.map(s => ({ ...s, type: 'kb' }))
    }

    if (hasWeb) {
      contextParts.push('=== 网络搜索结果 ===\n' + webResults.map((r, i) => `[Web-${i + 1}: ${r.title}]\n${r.snippet}\n来源: ${r.url}`).join('\n\n'))
      allSources = [...allSources, ...webResults.map(r => ({ title: r.title, snippet: r.snippet, url: r.url, score: 0, type: 'web' }))]
    }

    const contextBlock = contextParts.join('\n\n')

    const augmentedMessages = [
      { role: 'system', content: '你是智途AI助手。请严格基于下方"参考内容"回答用户问题。引用时注明来源编号（如[Web-1]、[KB-1]）。如果参考内容与问题无关或无答案，直接说明"搜索结果未找到相关信息"，然后使用你自己的知识简要回答。回答简洁准确，不要编造。' },
      { role: 'user', content: `参考内容：\n${contextBlock}\n\n问题：${userText.trim()}` }
    ]

    let fullContent = ''
    streamingReasoning.value = ''
    let reasoningBuf = ''
    let reasoningRaf = null
    const stream = await streamChat(augmentedMessages, {
      temperature: 0.3,
      maxTokens: settings.aiConfig.maxTokens,
      signal: abortController?.signal,
      onToken: (token) => {
        fullContent += token
        streamingContent.value = fullContent
      },
      onReasoning: (token) => {
        reasoningBuf += token
        if (!reasoningRaf) {
          reasoningRaf = requestAnimationFrame(() => {
            streamingReasoning.value += reasoningBuf
            reasoningBuf = ''
            reasoningRaf = null
          })
        }
      }
    })

    for await (const _token of stream) { }

    messages.value.push({
      id: generateMsgId(),
      role: 'assistant',
      content: fullContent,
      sources: allSources,
      grounded: hasKb,
      webSearch: hasWeb,
      timestamp: Date.now()
    })
  }

  async function streamGeneralResponse(userText) {
    const historyForContext = messages.value.slice(0, -1).slice(-20)
    const ctx = buildChatMessages(userText, historyForContext, {
      maxTokens: settings.aiConfig.contextWindow
    })

    if (activeSkill.value) {
      ctx.messages.unshift({ role: 'system', content: activeSkill.value.systemPrompt })
    }

    let fullContent = ''
    streamingReasoning.value = ''
    let reasoningBuf = ''
    let reasoningRaf = null
    const stream = await streamChat(ctx.messages, {
      temperature: settings.aiConfig.temperature,
      maxTokens: settings.aiConfig.maxTokens,
      signal: abortController?.signal,
      onToken: (token) => {
        fullContent += token
        streamingContent.value = fullContent
      },
      onReasoning: (token) => {
        reasoningBuf += token
        if (!reasoningRaf) {
          reasoningRaf = requestAnimationFrame(() => {
            streamingReasoning.value += reasoningBuf
            reasoningBuf = ''
            reasoningRaf = null
          })
        }
      }
    })

    for await (const _token of stream) { }

    messages.value.push({
      id: generateMsgId(),
      role: 'assistant',
      content: fullContent,
      contextStats: ctx.stats,
      skillId: activeSkill.value?.id || null,
      timestamp: Date.now()
    })
  }

  async function sendMessage(userText) {
    if (!userText.trim() || isStreaming.value) return

    if (!activeSessionId.value) {
      newSession(userText.slice(0, 30))
    }

    const sessionId = activeSessionId.value

    error.value = ''
    const userMsg = { id: generateMsgId(), role: 'user', content: userText.trim(), timestamp: Date.now() }
    messages.value.push(userMsg)
    saveMessages(sessionId)

    isStreaming.value = true
    streamingContent.value = ''
    streamingReasoning.value = ''
    const controller = new AbortController()
    abortController = controller

    try {
      isSearching.value = true
      const [kbResult, webResults] = await Promise.all([
        boundKbId.value ? gatherKbContext(userText) : Promise.resolve(null),
        webSearchEnabled.value ? gatherWebContext(userText) : Promise.resolve([])
      ])
      isSearching.value = false

      const hasKb = kbResult && kbResult.grounded && kbResult.sources.length > 0
      const hasWeb = webResults.length > 0

      if (hasKb || hasWeb) {
        await streamAugmentedResponse(userText, kbResult, webResults)
      } else {
        await streamGeneralResponse(userText)
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        if (streamingContent.value) {
            messages.value.push({
              id: generateMsgId(),
              role: 'assistant',
              content: streamingContent.value + ' [已停止生成]',
              timestamp: Date.now()
            })
          }
      } else {
        error.value = e.message || '请求失败'
      }
    } finally {
      isStreaming.value = false
      isSearching.value = false
      if (abortController === controller) abortController = null
      if (activeSession.value) {
        activeSession.value.updatedAt = Date.now()
        activeSession.value.title = getSessionTitle()
        saveSessions()
      }
      saveMessages(sessionId)
    }
  }

  function getSessionTitle() {
    const userMsgs = messages.value.filter((m) => m.role === 'user')
    if (!userMsgs.length) return '新对话'
    const last = userMsgs[userMsgs.length - 1].content
    return last.slice(0, 30) + (last.length > 30 ? '...' : '')
  }

  function clearSession() {
    messages.value = []
    streamingContent.value = ''
    streamingReasoning.value = ''
    error.value = ''
    if (activeSessionId.value) {
      saveMessages(activeSessionId.value)
    }
  }

  function retry() {
    const reversed = [...messages.value].reverse()
    const lastUser = reversed.find((m) => m.role === 'user')
    if (!lastUser) return
    const idx = messages.value.indexOf(lastUser)
    if (idx === -1) return
    messages.value = messages.value.slice(0, idx)
    sendMessage(lastUser.content)
  }

  function editMessage(msgId, newContent) {
    const idx = messages.value.findIndex(m => m.id === msgId)
    if (idx === -1) return false

    messages.value[idx].content = newContent
    messages.value[idx].timestamp = Date.now()

    if (activeSessionId.value) {
      saveMessages(activeSessionId.value)
    }

    const nextMsgIdx = idx + 1
    if (nextMsgIdx < messages.value.length && messages.value[nextMsgIdx].role === 'assistant') {
      messages.value = messages.value.slice(0, nextMsgIdx)
      if (activeSessionId.value) {
        saveMessages(activeSessionId.value)
      }
      sendMessage(newContent)
      return true
    }

    return true
  }

  return {
    sessions,
    activeSessionId,
    activeSession,
    messages,
    isStreaming,
    streamingContent,
    streamingReasoning,
    error,
    boundKbId,
    webSearchEnabled,
    isSearching,
    activeSkill,
    contextTokens,
    newSession,
    switchSession,
    deleteSession,
    sendMessage,
    clearSession,
    bindKnowledgeBase,
    unbindKnowledgeBase,
    toggleWebSearch,
    setSkill,
    clearSkill,
    prefillPrompt,
    cancel,
    retry,
    editMessage,
    saveMessages(sessionId) {
      localStorage.setItem(`chat-msgs-${sessionId}`, JSON.stringify(messages.value))
    }
  }
})
