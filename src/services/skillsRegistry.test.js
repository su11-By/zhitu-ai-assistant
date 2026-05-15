import { describe, test, expect } from 'vitest'
import { SKILLS, SKILL_CATEGORIES, findSkillByTrigger, getSkillById } from './skillsRegistry.js'

describe('SKILLS', () => {
  test('all skills have required properties', () => {
    for (const skill of SKILLS) {
      expect(skill).toHaveProperty('id')
      expect(skill).toHaveProperty('name')
      expect(skill).toHaveProperty('icon')
      expect(skill).toHaveProperty('category')
      expect(skill).toHaveProperty('description')
      expect(skill).toHaveProperty('trigger')
      expect(skill).toHaveProperty('systemPrompt')
      expect(Array.isArray(skill.trigger)).toBe(true)
      expect(skill.trigger.length).toBeGreaterThan(0)
      expect(skill.systemPrompt).toBeTruthy()
    }
  })

  test('all skill ids are unique', () => {
    const ids = SKILLS.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('all skill categories reference valid SKILL_CATEGORIES', () => {
    const validCats = new Set(SKILL_CATEGORIES.map(c => c.id))
    for (const skill of SKILLS) {
      expect(validCats.has(skill.category)).toBe(true)
    }
  })
})

describe('SKILL_CATEGORIES', () => {
  test('has required properties', () => {
    for (const cat of SKILL_CATEGORIES) {
      expect(cat).toHaveProperty('id')
      expect(cat).toHaveProperty('label')
    }
  })
})

describe('findSkillByTrigger', () => {
  test('finds brainstorming skill with Chinese trigger', () => {
    const result = findSkillByTrigger('帮我头脑风暴一下')
    expect(result).not.toBeNull()
    expect(result.id).toBe('brainstorming')
  })

  test('finds PRD skill with trigger word', () => {
    const result = findSkillByTrigger('帮我写个PRD文档')
    expect(result).not.toBeNull()
    expect(result.id).toBe('prd')
  })

  test('finds brand skill with English trigger', () => {
    const result = findSkillByTrigger('I need a brand design')
    expect(result).not.toBeNull()
    expect(result.id).toBe('brand')
  })

  test('returns null when no trigger matches', () => {
    const result = findSkillByTrigger('今天天气怎么样')
    expect(result).toBeNull()
  })

  test('returns null for empty string', () => {
    const result = findSkillByTrigger('')
    expect(result).toBeNull()
  })

  test('matches are case-insensitive', () => {
    const result = findSkillByTrigger('PRD')
    expect(result).not.toBeNull()
    expect(result.id).toBe('prd')
  })
})

describe('getSkillById', () => {
  test('returns correct skill for valid id', () => {
    const skill = getSkillById('brainstorming')
    expect(skill).not.toBeNull()
    expect(skill.name).toBe('头脑风暴')
  })

  test('returns null for invalid id', () => {
    expect(getSkillById('nonexistent')).toBeNull()
  })

  test('returns null for empty string', () => {
    expect(getSkillById('')).toBeNull()
  })

  test('every skill in the list is findable by id', () => {
    for (const skill of SKILLS) {
      expect(getSkillById(skill.id)).not.toBeNull()
    }
  })
})
