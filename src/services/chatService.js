import { apiPost } from './api.js'
import { AI_DEFAULTS } from '../utils/constants.js'
import { useSettingsStore } from '../stores/settings.js'
import { SKILLS } from './skillsRegistry.js'
import { parseSSEStream } from './streamParser.js'

function detectSkill(messages) {
  const sysMsg = messages.find(m => m.role === 'system')
  if (!sysMsg) return null
  for (const skill of SKILLS) {
    if (sysMsg.content === skill.systemPrompt) return skill
  }
  return null
}

function getUserQuestion(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content
  }
  return ''
}

function generateSkillMockResponse(skill, userQuestion) {
  const intro = `好的！我现在以 **${skill.icon} ${skill.name}** 专家的身份来回答您的问题。\n\n`
  const questionRef = `> 您的问题：*"${userQuestion}"*\n\n`

  const skillSpecific = {
    'brainstorming': `让我们来一场头脑风暴！💡\n\n针对您的想法，我先提几个方向供参考：\n\n**方向一：从用户需求出发**\n- 目标用户是谁？他们最核心的痛点是什么？\n- 您的方案如何解决这个痛点？\n\n**方向二：从技术可行性出发**\n- 现有技术能否支撑这个想法？\n- 有没有更轻量的 MVP 方案？\n\n**方向三：从差异化出发**\n- 市场上已有的方案有什么不足？\n- 您的独特优势在哪里？\n\n请告诉我您更倾向哪个方向，我们继续深入探讨！`,
    'prd': `以下是按照 PRD 标准结构为您整理的需求文档框架：\n\n## 项目概述\n- **项目名称**：[待填写]\n- **目标**：${userQuestion.slice(0, 50)}...\n- **解决的问题**：[请补充核心痛点]\n\n## 用户故事\n| 优先级 | 角色 | 功能 | 收益 |\n|--------|------|------|------|\n| P0 | [角色A] | [核心功能] | [核心收益] |\n| P1 | [角色B] | [重要功能] | [重要收益] |\n| P2 | [角色C] | [锦上添花] | [附加收益] |\n\n## 功能规格\n1. **功能一**：[描述]\n   - 输入：[...]\n   - 输出：[...]\n2. **功能二**：[描述]\n\n## 非功能需求\n- 性能：[...]\n- 安全：[...]\n\n## 验收标准\n- [ ] 用户故事 P0 全部通过\n- [ ] [具体验收条件]\n\n请补充具体细节，我可以帮您进一步完善！`,
    'brand': `好的，让我为您规划一套品牌设计方案：\n\n## 1. 色彩方案\n| 用途 | 色值 | 说明 |\n|------|------|------|\n| 主色 | \`#2563EB\` | 品牌核心色，用于按钮、链接 |\n| 辅色 | \`#0EA5E9\` | 辅助强调，用于图标、标签 |\n| 中性色-深 | \`#1E293B\` | 标题文字 |\n| 中性色-中 | \`#64748B\` | 正文文字 |\n| 中性色-浅 | \`#F1F5F9\` | 背景色 |\n\n## 2. 字体系统\n- **标题**：系统默认 sans-serif，Bold，H1=32px / H2=24px / H3=18px\n- **正文**：系统默认 sans-serif，Regular，16px，行高 1.6\n- **代码**：Consolas / monospace，14px\n\n## 3. Logo 使用规范\n- 最小尺寸：24px\n- 安全间距：Logo 高度的 50%\n- 浅色背景使用彩色版，深色背景使用反白版\n\n## 4. 品牌声音\n- **关键词**：专业、可信赖、创新、温暖\n- **该做**：用"您"称呼用户，语气友好专业\n- **不该做**：避免过度营销用语，不使用行业黑话\n\n---\n💡 提示：以上为通用建议，请告诉我您的具体行业和品牌定位，我可以给出更精准的方案！`,
    'logo-design': `好的，让我为您提供 Logo 设计建议：\n\n## 风格推荐\n根据您的需求，推荐以下风格方向：\n\n| 风格 | 特点 | 适用场景 |\n|------|------|----------|\n| 极简线性 | 干净利落，识别度高 | 科技、SaaS |\n| 渐变填充 | 现代感强，视觉冲击 | 互联网、创意 |\n| 字体标志 | 以文字为主，专业稳重 | 企业、金融 |\n| 图形+文字 | 图形记忆点 + 文字识别 | 消费品牌 |\n\n## 配色建议\n- **科技蓝**：\`#2563EB\` → \`#7C3AED\`（渐变）\n- **活力橙**：\`#F97316\` → \`#EF4444\`（渐变）\n- **自然绿**：\`#10B981\` → \`#06B6D4\`（渐变）\n\n## 设计原则\n1. 简洁：能在 16px 尺寸下清晰识别\n2. 可缩放：矢量格式，支持各种尺寸\n3. 有意义：图形与品牌内涵关联\n4. 持久：避免追随短期设计潮流\n\n请告诉我您的行业和品牌名称，我可以给出更具体的方向！`,
    'banner-design': `好的，让我为您规划 Banner 设计方案：\n\n## 布局结构\n\`\`\`\n┌─────────────────────────────────────┐\n│  [品牌 Logo]           [CTA 按钮]   │\n│                                     │\n│   主标题（大字，吸引眼球）           │\n│   副标题（补充说明，小字）           │\n│                                     │\n│         [主视觉图/插画]              │\n│                                     │\n└─────────────────────────────────────┘\n\`\`\`\n\n## 尺寸建议\n| 场景 | 尺寸 | 比例 |\n|------|------|------|\n| 全屏 Banner | 1920×800 | 2.4:1 |\n| 卡片 Banner | 1200×600 | 2:1 |\n| 移动端 | 750×1000 | 3:4 |\n\n## 设计要点\n1. **视觉层级**：主标题 > CTA > 副标题 > 装饰\n2. **留白**：至少 20% 留白空间\n3. **CTA 按钮**：对比色，圆角，足够大的点击区域\n4. **文字可读性**：标题与背景对比度 ≥ 4.5:1\n\n请告诉我具体用途和文案内容，我帮您细化！`,
    'ui-style': `好的，让我为您设计一套 UI 样式方案：\n\n## 设计令牌（Design Tokens）\n\n### 颜色\n\`\`\`css\n--primary: #2563EB;\n--primary-light: #3B82F6;\n--primary-dark: #1D4ED8;\n--success: #10B981;\n--warning: #F59E0B;\n--error: #EF4444;\n--bg-root: #0F172A;\n--bg-panel: #1E293B;\n--bg-card: #1E293B;\n--bg-input: #334155;\n--bg-hover: rgba(255,255,255,0.05);\n--text-primary: #F1F5F9;\n--text-secondary: #94A3B8;\n--text-muted: #64748B;\n--border: #334155;\n--border-light: #475569;\n\`\`\`\n\n### 圆角\n| Token | 值 | 用途 |\n|-------|-----|------|\n| \`--radius-sm\` | 6px | 小按钮、标签 |\n| \`--radius-md\` | 8px | 卡片、输入框 |\n| \`--radius-lg\` | 12px | 模态框、大卡片 |\n| \`--radius-xl\` | 16px | 特大容器 |\n\n### 阴影\n\`\`\`css\n--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);\n--shadow-md: 0 4px 12px rgba(0,0,0,0.4);\n--shadow-lg: 0 8px 32px rgba(0,0,0,0.5);\n\`\`\`\n\n以上参数可直接用于 Tailwind 或 CSS 变量系统！`,
    'design-system': `好的，让我为您规划一套完整的设计系统：\n\n## 设计系统架构\n\n### 1. 基础层（Primitives）\n- 色彩调色板（主色/辅色/中性色/语义色）\n- 间距量表（4px 基准：4, 8, 12, 16, 20, 24, 32, 40, 48, 64）\n- 字体层级（H1-H4, Body, Caption, Overline）\n\n### 2. 组件层（Components）\n| 组件 | 变体 | 状态 |\n|------|------|------|\n| Button | primary/secondary/ghost/danger | default/hover/active/disabled/loading |\n| Input | text/textarea/select | default/focus/error/disabled |\n| Card | elevated/outlined/filled | default/hover |\n| Modal | default/small/large | open/closed |\n| Badge | info/success/warning/error | default |\n\n### 3. 模式层（Patterns）\n- 表单布局（单列/双列）\n- 空状态（Empty State）\n- 加载状态（Skeleton/Loading）\n- 错误处理（Error Boundary）\n\n### 4. 页面模板\n- 列表页（List + Filter + Pagination）\n- 详情页（Header + Content + Sidebar）\n- 设置页（Tab + Form）\n\n需要我针对某个具体组件给出详细规范吗？`,
    'icon-design': `好的，让我为您提供图标设计建议：\n\n## 图标风格选择\n\n| 风格 | 示例描述 | 适用场景 |\n|------|----------|----------|\n| 线性 (Line) | 2px 描边，圆角端点 | 通用 UI，导航 |\n| 填充 (Fill) | 实心填充，简洁有力 | 移动端，标签 |\n| 双色 (Duotone) | 两种透明度叠加 | 特色功能，品牌 |\n| 扁平 (Flat) | 纯色块，无渐变 | 仪表盘，数据 |\n\n## 图标网格规范\n\`\`\`\n基准画布：24×24px\n内边距：2px（实际绘制区域 20×20px）\n笔画宽度：2px（线性风格）\n圆角：round（stroke-linejoin + stroke-linecap）\n\`\`\`\n\n## 核心图标清单（建议优先设计）\n- **导航类**：home, search, settings, menu, close, back\n- **操作类**：add, edit, delete, download, upload, share\n- **状态类**：check, error, warning, info, lock, star\n\n## SVG 优化建议\n- 使用 \`currentColor\` 继承颜色\n- 移除不必要的 \`<g>\` 嵌套\n- 路径精度保留 2 位小数\n\n需要我生成某个具体图标的 SVG 代码吗？`,
    'ppt': `好的，让我为您规划 PPT 演示方案：\n\n## 推荐结构（10-15 页）\n\n| 页码 | 内容 | 类型 |\n|------|------|------|\n| 1 | 封面（标题 + 副标题 + 演讲者） | 封面 |\n| 2 | 目录/议程 | 导航 |\n| 3 | 背景与问题 | 内容 |\n| 4-5 | 解决方案核心 | 内容 |\n| 6 | 数据支撑/案例 | 内容 |\n| 7 | 竞品对比 | 对比 |\n| 8 | 实施路线图 | 时间线 |\n| 9 | 团队介绍 | 人物 |\n| 10 | 预期成果 | 数据 |\n| 11 | 总结与下一步 | 总结 |\n| 12 | Q&A + 联系方式 | 结尾 |\n\n## 设计原则\n- **一页一观点**：每页只传达一个核心信息\n- **3秒法则**：观众 3 秒内能抓住重点\n- **图文比例**：70% 视觉 + 30% 文字\n- **字体大小**：标题 ≥ 28pt，正文 ≥ 18pt\n\n## 配色建议\n- 深色背景 + 亮色文字（科技感）\n- 浅色背景 + 品牌色强调（商务感）\n\n请告诉我演示主题和受众，我帮您细化每页内容！`,
    'copywriting': `好的，让我为您创作文案：\n\n## 方案一（简洁有力型）\n> [核心卖点一句话概括]\n> [行动号召]\n\n## 方案二（情感共鸣型）\n> [从用户痛点出发]\n> [引出解决方案]\n> [品牌承诺]\n\n## 方案三（数据驱动型）\n> [关键数据/事实]\n> [解决方案]\n> [信任背书]\n\n## 推荐方案\n我个人推荐**方案[X]**，因为：\n1. [理由一]\n2. [理由二]\n\n---\n💡 请告诉我具体产品/服务信息和目标受众，我可以写出更精准的文案！`
  }

  const body = skillSpecific[skill.id] || `我正在以 ${skill.name} 专家的身份为您服务。请告诉我更多关于您需求的具体信息，我会给出专业的建议！`
  return intro + questionRef + body + '\n\n---\n*💡 提示：LM Studio 未连接，当前为本地模拟响应。请确认 LM Studio 已启动并加载模型。*'
}

function generateMockResponse(messages) {
  const skill = detectSkill(messages)
  const userQuestion = getUserQuestion(messages)

  if (skill) return generateSkillMockResponse(skill, userQuestion)

  if (!userQuestion) {
    return '您好！我是智途 AI 助手。我可以帮助您：\n\n**1. 日常对话** - 回答各种问题，聊天交流\n**2. 知识库问答** - 上传文档后基于文档内容进行问答\n**3. 联网搜索** - 获取最新的网络信息\n**4. 内容创作** - 总结、润色、扩写各种文本\n**5. AI 技能** - 品牌设计、Logo 设计、PRD 文档等专业服务\n\n请问有什么我可以帮助您的？'
  }

  return `收到您的问题：*"${userQuestion}"*\n\n这是一个很好的问题！当前 LM Studio 未连接，我使用本地模拟响应来演示功能。\n\n连接 LM Studio 并加载模型后，我将能够：\n- 基于您的具体问题给出深度回答\n- 结合知识库文档进行 RAG 问答\n- 搜索网络获取最新信息\n- 使用专业技能提供专业服务\n\n---\n*💡 提示：LM Studio 未连接，当前为本地模拟响应。请确认 LM Studio 已启动并加载模型。*`
}

export async function sendMessage(messages, options = {}) {
  try {
    const settings = useSettingsStore()
    const payload = {
      model: AI_DEFAULTS.model,
      messages,
      temperature: options.temperature ?? settings.aiConfig.temperature,
      max_tokens: options.maxTokens ?? settings.aiConfig.maxTokens,
      stream: false
    }

    const response = await apiPost('/chat/completions', payload)
    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content?.trim()

    if (!content) throw new Error('AI 返回了空响应')
    return content
  } catch (e) {
    if (e.name === 'AbortError') throw e
    console.warn('LM Studio 不可用，使用模拟响应:', e.message)
    const mockResponse = generateMockResponse(messages)
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
    return mockResponse
  }
}

export async function streamChat(messages, options = {}) {
  async function* mockStream() {
    const response = generateMockResponse(messages)
    for (let i = 0; i < response.length; i++) {
      if (options.signal?.aborted) return
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 50))
      const char = response[i]
      if (options.onToken) options.onToken(char)
      yield char
    }
  }

  try {
    const settings = useSettingsStore()
    const payload = {
      model: AI_DEFAULTS.model,
      messages,
      temperature: options.temperature ?? settings.aiConfig.temperature,
      max_tokens: options.maxTokens ?? settings.aiConfig.maxTokens,
      stream: true
    }

    const response = await apiPost('/chat/completions', payload, {
      signal: options.signal
    })

    return {
      response,
      [Symbol.asyncIterator]: () => parseSSEStream(response, { onToken: options.onToken, onReasoning: options.onReasoning })
    }
  } catch (e) {
    if (e.name === 'AbortError') throw e
    console.warn('LM Studio 不可用，使用模拟响应:', e.message)
    return {
      response: { ok: false, mock: true },
      [Symbol.asyncIterator]: mockStream
    }
  }
}
