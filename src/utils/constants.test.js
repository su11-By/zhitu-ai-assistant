import { describe, test, expect } from 'vitest'
import {
  AI_DEFAULTS,
  CHUNK_CONFIG,
  CREATION_MODES,
  CREATION_CATEGORIES,
  RAG_SYSTEM_PROMPT,
  SKILLS,
  SKILL_CATEGORIES
} from './constants.js'

describe('AI_DEFAULTS', () => {
  test('has required model fields', () => {
    expect(AI_DEFAULTS).toHaveProperty('model')
    expect(AI_DEFAULTS).toHaveProperty('embeddingModel')
    expect(AI_DEFAULTS).toHaveProperty('temperature')
    expect(AI_DEFAULTS).toHaveProperty('maxTokens')
    expect(AI_DEFAULTS).toHaveProperty('contextWindow')
    expect(AI_DEFAULTS).toHaveProperty('topK')
  })

  test('temperature is between 0 and 2', () => {
    expect(AI_DEFAULTS.temperature).toBeGreaterThanOrEqual(0)
    expect(AI_DEFAULTS.temperature).toBeLessThanOrEqual(2)
  })

  test('contextWindow is positive', () => {
    expect(AI_DEFAULTS.contextWindow).toBeGreaterThan(0)
  })
})

describe('CHUNK_CONFIG', () => {
  test('has charSize and overlap', () => {
    expect(CHUNK_CONFIG).toHaveProperty('charSize')
    expect(CHUNK_CONFIG).toHaveProperty('overlap')
  })

  test('overlap is less than charSize', () => {
    expect(CHUNK_CONFIG.overlap).toBeLessThan(CHUNK_CONFIG.charSize)
  })
})

describe('CREATION_MODES', () => {
  test('all modes have required properties', () => {
    for (const mode of CREATION_MODES) {
      expect(mode).toHaveProperty('id')
      expect(mode).toHaveProperty('label')
      expect(mode).toHaveProperty('category')
      expect(mode).toHaveProperty('systemPrompt')
      expect(mode.systemPrompt).toBeTruthy()
    }
  })

  test('all mode ids are unique', () => {
    const ids = CREATION_MODES.map(m => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('all categories are valid', () => {
    const validCats = new Set(CREATION_CATEGORIES.map(c => c.id))
    for (const mode of CREATION_MODES) {
      expect(validCats.has(mode.category)).toBe(true)
    }
  })
})

describe('CREATION_CATEGORIES', () => {
  test('all categories have required properties', () => {
    for (const cat of CREATION_CATEGORIES) {
      expect(cat).toHaveProperty('id')
      expect(cat).toHaveProperty('label')
    }
  })
})

describe('RAG_SYSTEM_PROMPT', () => {
  test('is a non-empty string', () => {
    expect(typeof RAG_SYSTEM_PROMPT).toBe('string')
    expect(RAG_SYSTEM_PROMPT.length).toBeGreaterThan(50)
  })
})
