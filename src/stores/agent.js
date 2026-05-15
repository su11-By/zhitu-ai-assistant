import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'
import { generatePlan, executePlanStream, AGENT_TOOLS } from '../services/agentService.js'

function generateId() {
  return 'agent-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)
}

export const useAgentStore = defineStore('agent', () => {
  const auth = useAuthStore()

  const sessions = ref(loadSessions())
  const activeSessionId = ref(loadActiveSessionId())
  const goal = ref('')
  const plan = ref([])
  const steps = ref([])
  const currentStepIdx = ref(-1)
  const finalOutput = ref('')
  const isRunning = ref(false)
  const isSynthesizing = ref(false)
  const error = ref('')
  const phase = ref('input') // 'input' | 'planning' | 'executing' | 'completed'
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
  const progress = computed(() => {
    if (!plan.value.length) return 0
    return Math.round((steps.value.filter(s => s.output).length / plan.value.length) * 100)
  })

  const completedSteps = computed(() => steps.value.filter(s => s.output))
  const currentStep = computed(() => {
    if (currentStepIdx.value >= 0 && currentStepIdx.value < steps.value.length) {
      return steps.value[currentStepIdx.value]
    }
    return null
  })

  function getStorageKey(type) {
    const prefix = auth.getUserPrefix()
    return `agent-${type}-${prefix}`
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

  function loadSessionData(id) {
    try { return JSON.parse(localStorage.getItem(`agent-data-${id}`)) || {} } catch { return {} }
  }

  function saveSessionData(id) {
    localStorage.setItem(`agent-data-${id}`, JSON.stringify({
      goal: goal.value,
      plan: plan.value,
      steps: steps.value,
      finalOutput: finalOutput.value,
      phase: phase.value
    }))
  }

  function restoreSession(session) {
    const data = loadSessionData(session.id)
    goal.value = data.goal || ''
    plan.value = data.plan || []
    steps.value = data.steps || []
    finalOutput.value = data.finalOutput || ''
    phase.value = data.phase || 'input'
  }

  function createSession() {
    const session = {
      id: generateId(),
      goal: goal.value,
      planSteps: plan.value.length,
      completedSteps: steps.value.filter(s => s.output).length,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    sessions.value.unshift(session)
    saveSessions()
    activeSessionId.value = session.id
    saveActiveSessionId()
    saveSessionData(session.id)
    return session
  }

  async function startAgent(goalText) {
    if (!goalText.trim() || isRunning.value) return

    goal.value = goalText.trim()
    isRunning.value = true
    error.value = ''
    plan.value = []
    steps.value = []
    finalOutput.value = ''
    currentStepIdx.value = -1
    isSynthesizing.value = false

    if (!activeSessionId.value) {
      createSession()
    }

    // Phase 1: Planning
    phase.value = 'planning'
    try {
      plan.value = await generatePlan(goal.value)
      steps.value = plan.value.map(p => ({
        ...p,
        toolIcon: (AGENT_TOOLS.find(t => t.id === p.tool) || {}).icon || '🔧',
        toolName: (AGENT_TOOLS.find(t => t.id === p.tool) || {}).name || p.tool,
        output: null,
        success: false,
        isExecuting: false
      }))
    } catch (e) {
      error.value = '规划失败: ' + e.message
      isRunning.value = false
      phase.value = 'input'
      return
    }

    if (activeSessionId.value) saveSessionData(activeSessionId.value)

    if (!isRunning.value) { phase.value = 'input'; return }

    // Phase 2: Execution
    phase.value = 'executing'
    const controller = new AbortController()
    abortController = controller

    try {
      const gen = executePlanStream(plan.value, goal.value, {
        signal: abortController.signal,
        onStepStart: (info) => {
          currentStepIdx.value = info.index
          if (steps.value[info.index]) {
            steps.value[info.index].isExecuting = true
          }
        }
      })

      for await (const event of gen) {
        if (abortController?.signal.aborted) return

        if (event.type === 'step_end') {
          if (steps.value[event.index]) {
            steps.value[event.index].output = event.output
            steps.value[event.index].success = event.success
            steps.value[event.index].isExecuting = false
          }
          if (activeSessionId.value) saveSessionData(activeSessionId.value)
        }

        if (event.type === 'synthesis_start') {
          isSynthesizing.value = true
        }

        if (event.type === 'synthesis_end') {
          finalOutput.value = event.output
          isSynthesizing.value = false
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        error.value = e.message || '执行失败'
      }
    } finally {
      isRunning.value = false
      isSynthesizing.value = false
      if (abortController === controller) abortController = null
      phase.value = finalOutput.value ? 'completed' : 'input'

      if (activeSession.value) {
        activeSession.value.completedSteps = steps.value.filter(s => s.output).length
        activeSession.value.updatedAt = Date.now()
        saveSessions()
      }
      if (activeSessionId.value) saveSessionData(activeSessionId.value)
    }
  }

  function stopAgent() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    isRunning.value = false
    isSynthesizing.value = false
    phase.value = 'input'
  }

  function deleteSession(sessionId) {
    sessions.value = sessions.value.filter(s => s.id !== sessionId)
    localStorage.removeItem(`agent-data-${sessionId}`)
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
    goal.value = ''
    plan.value = []
    steps.value = []
    currentStepIdx.value = -1
    finalOutput.value = ''
    isRunning.value = false
    isSynthesizing.value = false
    error.value = ''
    phase.value = 'input'
    saveActiveSessionId()
  }

  return {
    sessions,
    activeSessionId,
    activeSession,
    goal,
    plan,
    steps,
    currentStepIdx,
    currentStep,
    finalOutput,
    isRunning,
    isSynthesizing,
    error,
    phase,
    progress,
    completedSteps,
    startAgent,
    stopAgent,
    deleteSession,
    switchSession,
    resetAll
  }
})
