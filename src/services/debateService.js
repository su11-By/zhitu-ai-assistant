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

  try {
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
  } catch (e) {
    if (e.name === 'AbortError') throw e
    console.warn(`Agent ${agent.name} API failed, using mock:`, e.message)
    fullContent = getMockResponse(agent, debateContext)
    if (options.onToken) {
      for (const char of fullContent) {
        await new Promise(r => setTimeout(r, 30 + Math.random() * 40))
        options.onToken(char)
      }
    }
  }

  return {
    agentId: agent.id,
    agentName: agent.name,
    agentIcon: agent.icon,
    agentColor: agent.color,
    role: agent.role,
    content: fullContent
  }
}

function getMockResponse(agent, context) {
  const topic = context.length > 0 ? (context.find(m => m.role === 'user')?.content || '这个话题') : '这个话题'

  const mockResponses = {
    'pro': `针对"${topic.slice(0, 30)}"这个话题，我认为确实值得支持。\n\n首先，从实际效果来看，这个方向能带来显著的积极影响。我们看过很多成功案例都证明了这一点。\n\n其次，从可行性角度，现有技术和资源完全能够支撑。关键在于执行力和持续投入。\n\n综上所述，我坚定支持这一观点，希望能给大家新的启发。`,
    'con': `关于"${topic.slice(0, 30)}"，我有不同的看法。\n\n正方提到了一些好处，但我们需要冷静分析其中的风险和问题。\n\n首先，理想和现实之间往往有差距。很多看起来美好的方案在执行中会遇到意想不到的困难。\n\n其次，我们需要考虑代价和替代方案，而不是盲目支持。\n\n因此，我建议谨慎对待，至少要先解决几个关键问题。`,
    'tech-expert': `从技术角度来看"${topic.slice(0, 30)}"，有几点值得关注：\n\n**技术可行性**：目前的技术栈可以支撑，但有几个关键技术难点需要攻克。\n\n**架构建议**：我推荐采用渐进式方案，先做MVP验证核心假设。\n\n**成本评估**：技术投入大概需要团队3-6个月的努力，建议分阶段推进。`,
    'business-analyst': `从商业角度分析"${topic.slice(0, 30)}"：\n\n**市场规模**：这个方向的市场空间是真实存在的，预计年增长在15-20%。\n\n**竞争格局**：目前头部玩家不多，存在窗口期。\n\n**商业模式**：核心变现路径清晰，单位经济效益可算。建议尽快验证PMF。`,
    'ux-designer': `从用户体验视角看"${topic.slice(0, 30)}"：\n\n**用户需求**：目标用户确实有这方面的痛点，且目前没有很好的解决方案。\n\n**体验关键**：核心体验路径需要打磨，尤其要注意首次使用的引导和上手成本。\n\n**建议**：做几轮用户访谈，验证几个关键假设后再定型。`,
    'product-manager': `作为产品经理，对"${topic.slice(0, 30)}"的思考：\n\n**用户价值**：需求真实存在，但要区分"锦上添花"和"雪中送炭"。\n\n**优先级**：如果有P0问题没解决，建议先解决核心痛点。\n\n**MVP建议**：第一版聚焦最核心的一个场景，做深做透。`,
    'professor': `从学术角度审视"${topic.slice(0, 30)}"：\n\n**理论基础**：这方面的研究可以追溯到几个经典理论框架，理论支撑是充分的。\n\n**研究前沿**：近两年的顶会论文在这个方向有不少突破，值得关注。\n\n**建议**：先做文献综述，避免重复发明轮子。`,
    'researcher': `从实证研究角度看"${topic.slice(0, 30)}"：\n\n**研究设计**：建议设计对照实验来验证核心假设。\n\n**关键指标**：需要明确定义成功的量化标准。\n\n**潜在偏差**：注意几个常见的认知偏差可能影响判断。\n\n**下一步**：先做探索性研究，确认方向后再做验证性研究。`,
    'student': `作为学生，对"${topic.slice(0, 30)}"我有些真实想法：\n\n说实话，这个问题对我们学生来说真的很实际。我之前也思考过类似的问题。\n\n我觉得老师们说得很对，但有时候理论和实际体验还是有差距的。\n\n我的看法是，这个方向确实不错，但希望能更多考虑我们学生的真实需求和困难。`,
    'host': `好的，感谢各位精彩的讨论！\n\n**辩论总结**：\n\n围绕"${topic.slice(0, 30)}"，各位从不同角度给出了深入的分析。\n\n正方强调了其积极意义和可行性，反方提醒我们注意潜在的风险和挑战。各位专家也从技术、商业、用户体验等维度给出了专业的见解。\n\n**综合评价**：这个话题确实值得深入探讨，建议在实际推进中平衡各方观点，既看到机遇也正视挑战。\n\n感谢所有参与者！`
  }

  return mockResponses[agent.id] || `关于"${topic.slice(0, 30)}"，作为${agent.name}，我认为这是一个值得深入探讨的话题。\n\n大家从不同角度给出了很好的见解，给我很多启发。\n\n综合来看，我们需要在多方面做出平衡和权衡，才能找到最优解。`
}
