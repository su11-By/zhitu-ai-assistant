import { apiPost } from './api.js'
import { searchWeb } from './webSearchService.js'
import { sendMessage } from './chatService.js'
import { AI_DEFAULTS } from '../utils/constants.js'

export const AGENT_TOOLS = [
  {
    id: 'web_search',
    name: '联网搜索',
    icon: '🌐',
    description: '通过网络搜索引擎搜索最新信息',
    hasArgs: true,
    argField: 'query',
    argLabel: '搜索关键词'
  },
  {
    id: 'summarize',
    name: '内容总结',
    icon: '📝',
    description: '将长文本总结为简洁要点',
    hasArgs: false
  },
  {
    id: 'write_report',
    name: '撰写报告',
    icon: '📄',
    description: '根据资料撰写结构化报告，含摘要、正文、结论',
    hasArgs: false
  },
  {
    id: 'generate_questions',
    name: '出考题',
    icon: '❓',
    description: '根据内容生成选择题、简答题等考试题目',
    hasArgs: true,
    argField: 'count',
    argLabel: '题目数量',
    argDefault: 10
  },
  {
    id: 'brainstorm',
    name: '头脑风暴',
    icon: '💡',
    description: '针对话题进行创意发散，提出多角度思路',
    hasArgs: false
  },
  {
    id: 'expand',
    name: '内容扩写',
    icon: '📖',
    description: '将简短内容扩展为详细的论述',
    hasArgs: false
  },
  {
    id: 'polish',
    name: '文本润色',
    icon: '✨',
    description: '优化文本表达，使其更流畅专业',
    hasArgs: false
  },
  {
    id: 'translate',
    name: '中英翻译',
    icon: '🔤',
    description: '中英文互译，保持专业术语准确',
    hasArgs: false
  },
  {
    id: 'create_outline',
    name: '生成提纲',
    icon: '📋',
    description: '根据主题生成结构化学习或写作提纲',
    hasArgs: false
  },
  {
    id: 'create_prd',
    name: 'PRD文档',
    icon: '📋',
    description: '根据需求描述生成产品需求文档',
    hasArgs: false
  }
]

const SYSTEM_PROMPTS = {
  summarize: '你是一个内容总结专家。请用简洁的中文总结以下内容，提取核心要点，使用要点列表输出。保留关键数据和结论。',
  write_report: '你是一个专业报告撰写专家。请根据以下资料撰写一份结构化的报告。包含：摘要、背景、核心内容（分章节）、结论。使用Markdown格式，语言专业准确。',
  generate_questions: '你是一个考试出题专家。请根据以下内容生成{count}道考题。包含选择题和简答题，每道题标注难度（简单/中等/困难）和参考答案。格式：题号 + 题型 + 题目 + 选项（选择题）+ 答案。',
  brainstorm: '你是一个创意头脑风暴专家。请围绕以下话题进行多角度创意发散。列出至少5个不同方向的想法，每个想法包括：核心思路、可行性分析、潜在价值。鼓励大胆创新。',
  expand: '你是一个内容创作专家。请将以下简短内容扩写为详细版本。增加合理的细节、案例和解释，使内容更充实。保持原意不变，用中文输出。',
  polish: '你是一个文字润色专家。请润色以下文本，使其表达更流畅、更专业。修复语法问题，优化句式结构。只输出润色后的文本。',
  translate: '你是一个专业翻译。请将以下文本进行中英文互译。如果是中文，翻译成英文；如果是英文，翻译成中文。保持专业术语的准确性。只输出翻译结果。',
  create_outline: '你是一个学习指导专家。请根据以下主题生成一份结构化学习提纲。包含：学习目标、核心知识点（层级结构）、推荐学习路径、重点难点标注。使用Markdown格式。',
  create_prd: '你是一个专业产品经理。请根据以下需求描述撰写一份产品需求文档（PRD）。包含：项目背景、目标用户、核心功能、非功能需求、验收标准。使用Markdown格式。'
}

const PLANNING_PROMPT = `你是一个任务规划专家。用户会给你一个复杂目标，你需要将其分解为有序的执行步骤。

可用的工具有：
${AGENT_TOOLS.map(t => `- ${t.id}: ${t.description}${t.hasArgs ? `（参数: ${t.argField}）` : ''}`).join('\n')}

请返回一个JSON数组，表示执行步骤。每个步骤格式：
{
  "tool": "工具ID",
  "description": "这一步做什么",
  "args": { "参数名": "参数值" }
}

规则：
1. 第一步通常是web_search（如果目标需要最新信息）
2. 最后一步之前的结果会被自动传入，所以后面的步骤不需要重复搜索
3. 总共3-5步，不要太多
4. 只返回JSON数组，不要其他内容
5. 工具ID必须从上述列表中选择`

function cleanJsonResponse(text) {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '')
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1)
  }
  return cleaned
}

function getFallbackPlan(goal) {
  return [
    { tool: 'web_search', description: '搜索相关信息', args: { query: goal.slice(0, 50) } },
    { tool: 'summarize', description: '总结搜索结果', args: {} },
    { tool: 'write_report', description: '撰写综合报告', args: {} }
  ]
}

export async function generatePlan(goal) {
  try {
    const messages = [
      { role: 'system', content: PLANNING_PROMPT },
      { role: 'user', content: goal }
    ]

    const data = await apiPost('/chat/completions', {
      model: AI_DEFAULTS.model,
      messages,
      temperature: 0.2,
      max_tokens: 800,
      stream: false
    })

    const json = await data.json()
    const text = json?.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error('Empty plan response')

    const cleaned = cleanJsonResponse(text)
    const plan = JSON.parse(cleaned)

    if (!Array.isArray(plan) || plan.length === 0) throw new Error('Invalid plan format')

    return plan.map((step, i) => ({
      step: i + 1,
      tool: step.tool || 'summarize',
      description: step.description || `步骤 ${i + 1}`,
      args: step.args || {}
    }))
  } catch (e) {
    console.warn('AI planning failed, using fallback:', e.message)
    return getFallbackPlan(goal)
  }
}

export async function executeTool(toolId, args, context) {
  const previousResults = context.previousResults || []
  const goal = context.goal || ''
  const inputText = previousResults.length > 0
    ? previousResults.map((r, i) => `[步骤${i + 1}结果]: ${r}`).join('\n\n')
    : goal

  switch (toolId) {
    case 'web_search': {
      const query = args.query || goal.slice(0, 80)
      try {
        const results = await searchWeb(query, 5)
        return results.map((r, i) =>
          `[${i + 1}] ${r.title}\n${r.snippet}\n来源: ${r.url}`
        ).join('\n\n') || '未找到相关搜索结果'
      } catch {
        return `关于"${query}"的搜索结果暂时不可用，请基于已有知识回答。`
      }
    }

    case 'summarize': {
      const response = await sendMessage([
        { role: 'system', content: SYSTEM_PROMPTS.summarize },
        { role: 'user', content: `请总结以下内容：\n\n${inputText.slice(0, 3000)}` }
      ], { temperature: 0.3, maxTokens: 1024 })
      return response
    }

    case 'write_report': {
      const response = await sendMessage([
        { role: 'system', content: SYSTEM_PROMPTS.write_report },
        { role: 'user', content: `请根据以下资料撰写报告：\n\n${inputText.slice(0, 4000)}` }
      ], { temperature: 0.4, maxTokens: 2048 })
      return response
    }

    case 'generate_questions': {
      const count = args.count || 10
      const prompt = SYSTEM_PROMPTS.generate_questions.replace('{count}', count)
      const response = await sendMessage([
        { role: 'system', content: prompt },
        { role: 'user', content: `请根据以下内容出题：\n\n${inputText.slice(0, 4000)}` }
      ], { temperature: 0.5, maxTokens: 2048 })
      return response
    }

    case 'brainstorm': {
      const response = await sendMessage([
        { role: 'system', content: SYSTEM_PROMPTS.brainstorm },
        { role: 'user', content: `话题：${goal}\n\n已有信息：${inputText.slice(0, 2000)}` }
      ], { temperature: 0.7, maxTokens: 1536 })
      return response
    }

    case 'expand': {
      const response = await sendMessage([
        { role: 'system', content: SYSTEM_PROMPTS.expand },
        { role: 'user', content: inputText.slice(0, 3000) }
      ], { temperature: 0.5, maxTokens: 1536 })
      return response
    }

    case 'polish': {
      const response = await sendMessage([
        { role: 'system', content: SYSTEM_PROMPTS.polish },
        { role: 'user', content: inputText.slice(0, 4000) }
      ], { temperature: 0.3, maxTokens: 1536 })
      return response
    }

    case 'translate': {
      const response = await sendMessage([
        { role: 'system', content: SYSTEM_PROMPTS.translate },
        { role: 'user', content: inputText.slice(0, 4000) }
      ], { temperature: 0.3, maxTokens: 1536 })
      return response
    }

    case 'create_outline': {
      const response = await sendMessage([
        { role: 'system', content: SYSTEM_PROMPTS.create_outline },
        { role: 'user', content: `主题：${goal}\n\n参考资料：${inputText.slice(0, 3000)}` }
      ], { temperature: 0.4, maxTokens: 1536 })
      return response
    }

    case 'create_prd': {
      const response = await sendMessage([
        { role: 'system', content: SYSTEM_PROMPTS.create_prd },
        { role: 'user', content: `需求描述：${goal}\n\n补充信息：${inputText.slice(0, 3000)}` }
      ], { temperature: 0.4, maxTokens: 2048 })
      return response
    }

    default:
      return `工具 ${toolId} 暂不支持`
  }
}

export async function synthesizeResults(goal, stepResults) {
  const resultsText = stepResults
    .map((r, i) => `### 步骤 ${i + 1}: ${r.toolName}\n${r.output}`)
    .join('\n\n---\n\n')

  try {
    const response = await sendMessage([
      {
        role: 'system',
        content: '你是一个综合整理专家。请根据各步骤的执行结果，为用户的目标生成一份完整的综合输出。整合所有信息，去除冗余，输出一份结构清晰、内容完整的最终成果。使用Markdown格式，包含合适的标题层级。'
      },
      {
        role: 'user',
        content: `用户目标：${goal}\n\n各步骤执行结果：\n\n${resultsText}\n\n请综合以上所有结果，输出完整的最终成果。`
      }
    ], { temperature: 0.4, maxTokens: 3072 })

    return response
  } catch (e) {
    console.warn('Synthesis failed:', e.message)
    return `# ${goal}\n\n${resultsText}`
  }
}

export async function* executePlanStream(plan, goal, options = {}) {
  const stepResults = []
  const toolDetails = []

  for (let i = 0; i < plan.length; i++) {
    if (options.signal?.aborted) return

    const step = plan[i]
    const tool = AGENT_TOOLS.find(t => t.id === step.tool) || AGENT_TOOLS[1]

    const context = {
      goal,
      previousResults: stepResults.map(r => r.output),
      stepIndex: i,
      totalSteps: plan.length
    }

    // Notify step start
    options.onStepStart?.({
      index: i,
      step: step.step,
      tool: tool,
      description: step.description
    })

    // Yield intermediate state for streaming display
    yield {
      type: 'step_start',
      index: i,
      total: plan.length,
      tool,
      description: step.description
    }

    try {
      let output = ''
      const result = await executeTool(step.tool, step.args, context)
      output = result

      stepResults.push({ toolName: tool.name, output })
      toolDetails.push({
        ...step,
        toolName: tool.name,
        toolIcon: tool.icon,
        output,
        success: true
      })

      yield {
        type: 'step_end',
        index: i,
        total: plan.length,
        tool,
        description: step.description,
        output,
        success: true
      }
    } catch (e) {
      if (e.name === 'AbortError') return

      const errorOutput = `执行失败: ${e.message || '未知错误'}`
      stepResults.push({ toolName: tool.name, output: errorOutput })
      toolDetails.push({
        ...step,
        toolName: tool.name,
        toolIcon: tool.icon,
        output: errorOutput,
        success: false
      })

      yield {
        type: 'step_end',
        index: i,
        tool,
        output: errorOutput,
        success: false
      }
    }
  }

  // Final synthesis
  yield { type: 'synthesis_start' }

  const finalOutput = await synthesizeResults(goal, stepResults)

  yield {
    type: 'synthesis_end',
    output: finalOutput,
    steps: toolDetails
  }
}
