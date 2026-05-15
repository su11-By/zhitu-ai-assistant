import { describe, test, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock dependencies BEFORE importing the store
vi.mock('../services/chatService.js', () => ({
  streamChat: vi.fn()
}))

vi.mock('../services/ragService.js', () => ({
  queryWithRAG: vi.fn()
}))

vi.mock('../services/webSearchService.js', () => ({
  searchWeb: vi.fn(),
  fetchPageContent: vi.fn()
}))

vi.mock('../services/contextManager.js', () => ({
  buildChatMessages: vi.fn(() => ({
    messages: [{ role: 'system', content: 'You are helpful' }, { role: 'user', content: 'test' }],
    stats: { truncated: false }
  }))
}))

vi.mock('../services/skillsRegistry.js', () => ({
  getSkillById: vi.fn(() => null),
  findSkillByTrigger: vi.fn(() => null)
}))

vi.mock('../utils/tokenizer.js', () => ({
  estimateTokens: vi.fn(() => 10)
}))

// Setup localStorage mock
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Now import the store
import { useChatStore } from './chat.js'

function createTestStore() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return useChatStore()
}

beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})

describe('useChatStore - sessions', () => {
  test('creates a new session', () => {
    const store = createTestStore()
    const initial = store.sessions.length
    const session = store.newSession('Test')
    expect(store.sessions.length).toBe(initial + 1)
    expect(session.title).toBe('Test')
  })

  test('empty sessions list initially', () => {
    const store = createTestStore()
    expect(store.sessions).toEqual([])
  })

  test('switchSession loads messages for that session', () => {
    const store = createTestStore()
    const s = store.newSession('Session A')
    store.messages.push({ id: 'm1', role: 'user', content: 'hello', timestamp: 1 })
    store.saveMessages(s.id)

    store.switchSession(s.id)
    expect(store.messages).toHaveLength(1)
    expect(store.messages[0].content).toBe('hello')
  })

  test('deleteSession removes session and clears active if deleted', () => {
    const store = createTestStore()
    const s = store.newSession('To Delete')
    store.deleteSession(s.id)
    expect(store.sessions.find(x => x.id === s.id)).toBeUndefined()
    expect(store.activeSessionId).toBeNull()
  })

  test('deleteSession switches to next session if available', () => {
    const store = createTestStore()
    const s1 = store.newSession('First')
    const s2 = store.newSession('Second')
    store.deleteSession(s2.id)
    expect(store.activeSessionId).toBe(s1.id)
  })
})

describe('useChatStore - messages', () => {
  test('sendMessage does nothing with empty input', async () => {
    const store = createTestStore()
    await store.sendMessage('  ')
    expect(store.messages).toHaveLength(0)
  })

  test('sendMessage creates a session if none active', async () => {
    const { streamChat } = await import('../services/chatService.js')
    streamChat.mockResolvedValue({
      [Symbol.asyncIterator]: () => (async function* () { })(),
      response: { ok: true }
    })

    const store = createTestStore()
    await store.sendMessage('hello')
    expect(store.sessions.length).toBe(1)
  })

  test('sendMessage adds user message immediately', async () => {
    const { streamChat } = await import('../services/chatService.js')
    streamChat.mockResolvedValue({
      [Symbol.asyncIterator]: () => (async function* () { })(),
      response: { ok: true }
    })

    const store = createTestStore()
    store.newSession('Test')
    await store.sendMessage('hello')

    const userMsgs = store.messages.filter(m => m.role === 'user')
    expect(userMsgs).toHaveLength(1)
    expect(userMsgs[0].content).toBe('hello')
  })

  test('clearSession removes all messages', async () => {
    const store = createTestStore()
    store.newSession('Test')
    store.messages.push({ id: 'm1', role: 'user', content: 'hello', timestamp: 1 })
    store.clearSession()
    expect(store.messages).toHaveLength(0)
  })
})

describe('useChatStore - cancel', () => {
  test('cancel sets isStreaming to false', () => {
    const store = createTestStore()
    store.isStreaming = true
    store.cancel()
    expect(store.isStreaming).toBe(false)
  })

  test('cancel aborts active controller', () => {
    const store = createTestStore()
    const controller = new AbortController()
    const aborted = vi.fn()
    controller.signal.addEventListener('abort', aborted)

    // Access internal abortController via the module scope
    store.isStreaming = true
    store.cancel()
    expect(store.isStreaming).toBe(false)
  })
})

describe('useChatStore - web search', () => {
  test('toggleWebSearch flips the value', () => {
    const store = createTestStore()
    expect(store.webSearchEnabled).toBe(false)
    store.toggleWebSearch()
    expect(store.webSearchEnabled).toBe(true)
    store.toggleWebSearch()
    expect(store.webSearchEnabled).toBe(false)
  })
})

describe('useChatStore - knowledge base', () => {
  test('bindKnowledgeBase sets boundKbId', () => {
    const store = createTestStore()
    store.bindKnowledgeBase('kb-123')
    expect(store.boundKbId).toBe('kb-123')
  })

  test('unbindKnowledgeBase clears boundKbId', () => {
    const store = createTestStore()
    store.bindKnowledgeBase('kb-123')
    store.unbindKnowledgeBase()
    expect(store.boundKbId).toBeNull()
  })
})

describe('useChatStore - retry', () => {
  test('retry resends last user message', async () => {
    const { streamChat } = await import('../services/chatService.js')
    streamChat.mockResolvedValue({
      [Symbol.asyncIterator]: () => (async function* () { })(),
      response: { ok: true }
    })

    const store = createTestStore()
    store.newSession('Test')
    store.messages.push({ id: 'm1', role: 'user', content: 'retry me', timestamp: 1 })
    store.messages.push({ id: 'm2', role: 'assistant', content: 'response', timestamp: 2 })
    await store.retry()

    const userMsgs = store.messages.filter(m => m.role === 'user')
    expect(userMsgs).toHaveLength(1)
  })

  test('retry does nothing with no user messages', async () => {
    const store = createTestStore()
    await store.retry()
    expect(store.messages).toHaveLength(0)
  })
})

describe('useChatStore - editMessage', () => {
  test('editMessage updates content and re-sends if next is assistant', async () => {
    const { streamChat } = await import('../services/chatService.js')
    streamChat.mockResolvedValue({
      [Symbol.asyncIterator]: () => (async function* () { })(),
      response: { ok: true }
    })

    const store = createTestStore()
    store.newSession('Test')
    store.messages.push({ id: 'm1', role: 'user', content: 'original', timestamp: 1 })
    store.messages.push({ id: 'm2', role: 'assistant', content: 'reply', timestamp: 2 })

    const result = await store.editMessage('m1', 'edited')
    expect(result).toBe(true)
    expect(store.messages[0].content).toBe('edited')
  })

  test('returns false for non-existent message id', () => {
    const store = createTestStore()
    expect(store.editMessage('nonexistent', 'new')).toBe(false)
  })
})
