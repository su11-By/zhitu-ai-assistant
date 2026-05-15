import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'
import { runDebateAgent } from '../services/debateService.js'
import { DEBATE_AGENTS, DEBATE_PRESETS } from '../services/debateService.js'

function generateId() {
  return 'debate-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)
}

function generateMsgId() {
  return 'dmsg-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)
}

export const useDebateStore = defineStore('debate', () => {
  const auth = useAuthStore()

  const sessions = ref(loadSessions())
  const activeSessionId = ref(loadActiveSessionId())
  const topic = ref('')
  const agents = ref([])
  const totalRounds = ref(3)
  const roundLabels = ref(['开篇立论', '自由辩论', '总结陈词'])
  const currentRound = ref(0)
  const currentAgentIdx = ref(0)
  const messages = ref([])
  const isRunning = ref(false)
  const isCompleted = ref(false)
  const streamingContent = ref('')
  const streamingAgentId = ref(null)
  const error = ref('')
  const phase = ref('setup') // 'setup' | 'running' | 'completed'
  let abortController = null

  if (activeSessionId.value) {
    const session = sessions.value.find(s => s.id === activeSessionId.value)
    if (session) {
      restoreSession(session)
    } else {
      activeSessionId.value = null
      saveActiveSessionId()
    }
  }

  const activeSession = computed(() => sessions.value.find(s => s.id === activeSessionId.value))

  const roundMessages = computed(() => {
    const grouped = {}
    for (const msg of messages.value) {
      if (!grouped[msg.round]) grouped[msg.round] = []
      grouped[msg.round].push(msg)
    }
    return grouped
  })

  const currentAgent = computed(() => {
    if (currentAgentIdx.value < agents.value.length) {
      return agents.value[currentAgentIdx.value]
    }
    return null
  })

  function getStorageKey(type) {
    const prefix = auth.getUserPrefix()
    return `debate-${type}-${prefix}`
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

  function loadMessages(sessionId) {
    try { return JSON.parse(localStorage.getItem(`debate-msgs-${sessionId}`)) || [] } catch { return [] }
  }

  function saveMessages(sessionId) {
    localStorage.setItem(`debate-msgs-${sessionId}`, JSON.stringify(messages.value))
  }

  function restoreSession(session) {
    topic.value = session.topic || ''
    agents.value = session.agents || []
    totalRounds.value = session.totalRounds || 3
    roundLabels.value = session.roundLabels || []
    currentRound.value = session.currentRound || 0
    messages.value = loadMessages(session.id) || []
    isCompleted.value = session.isCompleted || false
    phase.value = isCompleted.value ? 'completed' : (messages.value.length > 0 ? 'running' : 'setup')
  }

  function setupDebate(config) {
    topic.value = config.topic
    agents.value = config.agents
    totalRounds.value = config.rounds
    roundLabels.value = config.roundLabels
    currentRound.value = 0
    currentAgentIdx.value = 0
    messages.value = []
    isRunning.value = false
    isCompleted.value = false
    streamingContent.value = ''
    streamingAgentId.value = null
    error.value = ''
    phase.value = 'setup'
  }

  function applyPreset(presetId) {
    const preset = DEBATE_PRESETS.find(p => p.id === presetId)
    if (!preset) return

    const selectedAgents = preset.agentIds
      .map(id => DEBATE_AGENTS.find(a => a.id === id))
      .filter(Boolean)

    setupDebate({
      topic: '',
      agents: selectedAgents,
      rounds: preset.rounds,
      roundLabels: preset.roundLabels
    })
  }

  function addHostAgent() {
    const host = DEBATE_AGENTS.find(a => a.id === 'host')
    if (host && !agents.value.find(a => a.id === 'host')) {
      agents.value = [...agents.value, host]
    }
  }

  function createSession() {
    const session = {
      id: generateId(),
      topic: topic.value,
      agents: agents.value,
      totalRounds: totalRounds.value,
      roundLabels: roundLabels.value,
      currentRound: currentRound.value,
      isCompleted: isCompleted.value,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    sessions.value.unshift(session)
    saveSessions()
    activeSessionId.value = session.id
    saveActiveSessionId()
    saveMessages(session.id)
    return session
  }

  async function startDebate() {
    if (!topic.value.trim() || agents.value.length < 2 || isRunning.value) return

    if (!activeSessionId.value) {
      createSession()
    }

    phase.value = 'running'
    isRunning.value = true
    isCompleted.value = false
    messages.value = []
    const controller = new AbortController()
    abortController = controller

    try {
      for (let round = 0; round < totalRounds.value; round++) {
        currentRound.value = round + 1
        currentAgentIdx.value = -1

        for (let aIdx = 0; aIdx < agents.value.length; aIdx++) {
          if (abortController?.signal.aborted) return

          currentAgentIdx.value = aIdx
          const agent = agents.value[aIdx]
          streamingAgentId.value = agent.id
          streamingContent.value = ''

          const debateContext = buildDebateContext(agent, round)

          let fullContent = ''
          try {
            const result = await runDebateAgent(agent, debateContext, {
              signal: abortController.signal,
              onToken: (token) => {
                fullContent += token
                streamingContent.value = fullContent
              }
            })

            fullContent = result.content

            messages.value.push({
              id: generateMsgId(),
              agentId: agent.id,
              agentName: agent.name,
              agentIcon: agent.icon,
              agentColor: agent.color,
              role: agent.role,
              content: fullContent,
              round: round + 1,
              timestamp: Date.now()
            })
          } catch (e) {
            if (e.name === 'AbortError') return
            error.value = e.message || '辩论出错'
          }
        }

        // Save after each round completes
        if (activeSessionId.value) {
          saveMessages(activeSessionId.value)
          updateSessionProgress()
        }
      }

      // Debate completed, add host summary if host agent exists
      const hostAgent = agents.value.find(a => a.id === 'host')
      if (hostAgent && !abortController?.signal.aborted) {
        currentAgentIdx.value = agents.value.indexOf(hostAgent)
        streamingAgentId.value = hostAgent.id
        streamingContent.value = ''

        const summaryContext = buildHostContext()
        let fullContent = ''
        try {
          const result = await runDebateAgent(hostAgent, summaryContext, {
            signal: abortController.signal,
            onToken: (token) => {
              fullContent += token
              streamingContent.value = fullContent
            }
          })
          fullContent = result.content
        } catch (e) {
          if (e.name === 'AbortError') return
        }

        messages.value.push({
          id: generateMsgId(),
          agentId: hostAgent.id,
          agentName: hostAgent.name,
          agentIcon: hostAgent.icon,
          agentColor: hostAgent.color,
          role: '主持',
          content: fullContent,
          round: totalRounds.value + 1,
          timestamp: Date.now()
        })

        if (activeSessionId.value) {
          saveMessages(activeSessionId.value)
        }
      }

      isCompleted.value = true
      phase.value = 'completed'
    } catch (e) {
      if (e.name !== 'AbortError') {
        error.value = e.message || '辩论出错'
      }
    } finally {
      isRunning.value = false
      streamingAgentId.value = null
      streamingContent.value = ''
      if (abortController === controller) abortController = null
      currentAgentIdx.value = -1

      if (activeSessionId.value) {
        updateSessionProgress()
        if (activeSession.value) {
          activeSession.value.updatedAt = Date.now()
          saveSessions()
        }
        saveMessages(activeSessionId.value)
      }
    }
  }

  function buildDebateContext(agent, round) {
    const context = []

    context.push({
      role: 'user',
      content: `【辩论主题】${topic.value}\n\n【当前轮次】第${round + 1}轮：${roundLabels.value[round]}\n\n【你的角色】${agent.name} - ${agent.role}\n\n请根据你的角色定位，就此辩题发表你的观点。注意回顾之前各方的发言，进行有针对性的回应。`
    })

    // Add message history
    for (const msg of messages.value) {
      const role = msg.agentId === agent.id ? 'assistant' : 'user'
      context.push({
        role,
        content: `[${msg.agentName}(${msg.role}) - 第${msg.round}轮]: ${msg.content}`
      })
    }

    return context
  }

  function buildHostContext() {
    const summary = messages.value.map(m =>
      `[${m.agentName}(${m.role}) - 第${m.round}轮]: ${m.content}`
    ).join('\n\n')

    return [{
      role: 'user',
      content: `【辩论主题】${topic.value}\n\n以下是全部辩论记录：\n\n${summary}\n\n请作为主持人对本次辩论进行总结：概括各方核心观点，进行客观评价，给出综合结论。控制在200字以内。`
    }]
  }

  function stopDebate() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    isRunning.value = false
    streamingAgentId.value = null
    streamingContent.value = ''
    phase.value = messages.value.length > 0 ? 'completed' : 'setup'
  }

  function deleteSession(sessionId) {
    sessions.value = sessions.value.filter(s => s.id !== sessionId)
    localStorage.removeItem(`debate-msgs-${sessionId}`)
    if (activeSessionId.value === sessionId) {
      const next = sessions.value[0]
      if (next) {
        activeSessionId.value = next.id
        saveActiveSessionId()
        restoreSession(next)
      } else {
        resetAll()
      }
    }
    saveSessions()
  }

  function switchSession(sessionId) {
    activeSessionId.value = sessionId
    saveActiveSessionId()
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) restoreSession(session)
  }

  function resetAll() {
    activeSessionId.value = null
    topic.value = ''
    agents.value = []
    totalRounds.value = 3
    roundLabels.value = []
    currentRound.value = 0
    currentAgentIdx.value = 0
    messages.value = []
    isRunning.value = false
    isCompleted.value = false
    streamingContent.value = ''
    streamingAgentId.value = null
    error.value = ''
    phase.value = 'setup'
    saveActiveSessionId()
  }

  function updateSessionProgress() {
    if (activeSession.value) {
      activeSession.value.currentRound = currentRound.value
      activeSession.value.isCompleted = isCompleted.value
      activeSession.value.updatedAt = Date.now()
      saveSessions()
    }
  }

  return {
    sessions,
    activeSessionId,
    activeSession,
    topic,
    agents,
    totalRounds,
    roundLabels,
    currentRound,
    currentAgentIdx,
    messages,
    isRunning,
    isCompleted,
    streamingContent,
    streamingAgentId,
    error,
    phase,
    roundMessages,
    currentAgent,
    setupDebate,
    applyPreset,
    addHostAgent,
    createSession,
    startDebate,
    stopDebate,
    deleteSession,
    switchSession,
    resetAll
  }
})
