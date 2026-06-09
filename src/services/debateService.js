import { apiPost } from './api.js'
import { AI_DEFAULTS } from '../utils/constants.js'
import { parseSSEStream } from './streamParser.js'

export const DEBATE_AGENTS = [
  {
    id: 'pro',
    name: '正方',
    icon: '👍',
    color: '#3B82F6',
    role: '正方',
    systemPrompt: '你是辩论正方。你的任务是坚定支持辩题观点，用逻辑严密、证据充分的论证说服观众。你擅长：引用数据、逻辑推理、列举好处、反驳反方观点。风格：理性、自信、有说服力。每次发言控制在200字以内，使用中文。'
  },
  {
    id: 'con',
    name: '反方',
    icon: '👎',
    color: '#EF4444',
    role: '反方',
    systemPrompt: '你是辩论反方。你的任务是质疑和反驳正方观点，指出逻辑漏洞和潜在风险。你擅长：发现逻辑矛盾、提出反例、分析风险、质疑假设。风格：尖锐、批判、善于发现漏洞。每次发言控制在200字以内，使用中文。'
  },
  {
    id: 'tech-expert',
    name: '技术专家',
    icon: '💻',
    color: '#8B5CF6',
    role: '专家',
    systemPrompt: '你是一位资深技术专家，拥有20年行业经验。你从技术可行性、架构方案、工程成本角度分析问题。你喜欢引用具体技术案例和数据。风格：务实、深入浅出、技术导向。每次发言控制在200字以内，使用中文。'
  },
  {
    id: 'business-analyst',
    name: '商业分析师',
    icon: '📊',
    color: '#F59E0B',
    role: '专家',
    systemPrompt: '你是一位顶级商业分析师。你从市场前景、商业模式、ROI、竞争格局角度分析问题。你擅长用数据说话，引用行业报告和市场趋势。风格：商业敏锐、数据驱动、注重落地。每次发言控制在200字以内，使用中文。'
  },
  {
    id: 'ux-designer',
    name: '用户体验师',
    icon: '🎨',
    color: '#EC4899',
    role: '专家',
    systemPrompt: '你是一位资深的用户体验设计师。你从用户需求、交互体验、可用性角度分析问题。你关注用户真实场景，善于发现体验痛点。风格：同理心强、用户视角、注重细节。每次发言控制在200字以内，使用中文。'
  },
  {
    id: 'product-manager',
    name: '产品经理',
    icon: '🎯',
    color: '#10B981',
    role: '专家',
    systemPrompt: '你是一位资深产品经理。你从用户价值、商业价值、产品策略、资源优先级角度分析问题。你擅长权衡取舍，找到最优解。风格：全局视角、务实平衡、善于拆解。每次发言控制在200字以内，使用中文。'
  },
  {
    id: 'professor',
    name: '教授',
    icon: '🎓',
    color: '#6366F1',
    role: '专家',
    systemPrompt: '你是一位大学教授，学术造诣深厚。你从学术理论、研究方法、学科前沿角度分析问题。你引用经典理论和最新论文，注重严谨性。风格：严谨、深入、富有启发性。每次发言控制在200字以内，使用中文。'
  },
  {
    id: 'researcher',
    name: '研究员',
    icon: '🔬',
    color: '#14B8A6',
    role: '专家',
    systemPrompt: '你是一位资深研究员，在一线从事科研工作。你从实验设计、数据验证、实证研究角度分析问题。你喜欢提出可验证的假设和具体研究方案。风格：实证导向、严谨务实、细节丰富。每次发言控制在200字以内，使用中文。'
  },
  {
    id: 'student',
    name: '学生代表',
    icon: '✋',
    color: '#F97316',
    role: '专家',
    systemPrompt: '你是一位善于思考的大学生。你从年轻人视角、学习体验、实际感受角度分析问题。你勇于提出不同看法，代表学生的真实声音。风格：真诚、接地气、敢于质疑。每次发言控制在200字以内，使用中文。'
  },
  {
    id: 'host',
    name: '主持人',
    icon: '🎤',
    color: '#9CA3AF',
    role: '主持',
    systemPrompt: '你是辩论主持人。你的任务是：1) 在辩论开始时用简洁的语言介绍辩题和规则；2) 控制辩论节奏；3) 在辩论结束时做客观公正的总结，概括各方核心观点，给出综合评价。风格：公正、简洁、有分寸感。每次发言控制在150字以内，使用中文。'
  }
]

export const DEBATE_PRESETS = [
  {
    id: 'pro-con',
    name: '正反辩论',
    desc: '正方与反方的经典辩论，3轮交锋',
    icon: '⚔️',
    agentIds: ['pro', 'con'],
    rounds: 3,
    roundLabels: ['开篇立论', '自由辩论', '总结陈词']
  },
  {
    id: 'expert-roundtable',
    name: '专家圆桌',
    desc: '四位不同领域专家多角度讨论',
    icon: '🪑',
    agentIds: ['tech-expert', 'business-analyst', 'ux-designer', 'product-manager'],
    rounds: 2,
    roundLabels: ['观点阐述', '深入讨论']
  },
  {
    id: 'academic',
    name: '学术研讨',
    desc: '教授、研究员与学生三方探讨',
    icon: '📚',
    agentIds: ['professor', 'researcher', 'student'],
    rounds: 2,
    roundLabels: ['学术观点', '自由探讨']
  }
]

async function streamOneAgent(agent, debateContext, options = {}) {
  const messages = [
    { role: 'system', content: agent.systemPrompt },
    ...debateContext
  ]

  const payload = {
    model: AI_DEFAULTS.model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 400,
    stream: true
  }

  const response = await apiPost('/chat/completions', payload, {
    signal: options.signal
  })

  return {
    response,
    [Symbol.asyncIterator]: () => parseSSEStream(response, { onToken: options.onToken })
  }
}

export async function runDebateAgent(agent, debateContext, options = {}) {
  let fullContent = ''

  const streamResult = await streamOneAgent(agent, debateContext, {
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    signal: options.signal,
    onToken: (token) => {
      fullContent += token
      if (options.onToken) options.onToken(token)
    }
  })

  for await (const _token of streamResult) { }

  return {
    agentId: agent.id,
    agentName: agent.name,
    agentIcon: agent.icon,
    agentColor: agent.color,
    role: agent.role,
    content: fullContent
  }
}
