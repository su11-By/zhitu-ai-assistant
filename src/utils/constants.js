export const AI_DEFAULTS = {
  model: 'qwen3-4b-thinking-2507',
  embeddingModel: 'text-embedding-nomic-embed-text-v1.5',
  temperature: 0.4,
  maxTokens: 2048,
  contextWindow: 4096,
  topK: 5
}

export const CHUNK_CONFIG = {
  charSize: 400,
  overlap: 50
}

export const CREATION_MODES = [
  {
    id: 'summarize',
    label: '文章总结',
    category: 'summary',
    icon: 'doc',
    placeholder: '粘贴需要总结的文章内容...',
    systemPrompt: '你是一个文本总结专家。请用简洁的中文总结以下内容，提取核心要点，使用要点列表形式输出。不要添加原文没有的信息。'
  },
  {
    id: 'shorten',
    label: '缩写',
    category: 'summary',
    icon: 'compress',
    placeholder: '粘贴需要缩写的文本...',
    systemPrompt: '你是一个文本精简专家。请将以下内容缩写为更短的版本，保留核心信息，删除冗余表述。只输出缩写后的文本。'
  },
  {
    id: 'expand',
    label: '扩写',
    category: 'expand',
    icon: 'expand',
    placeholder: '粘贴需要扩写的简短内容...',
    systemPrompt: '你是一个内容创作专家。请将以下简短内容进行扩写，增加合理的细节、例子和解释，使内容更加充实丰满。保持原意不变。'
  },
  {
    id: 'polish',
    label: '润色',
    category: 'refine',
    icon: 'brush',
    placeholder: '粘贴需要润色的文本...',
    systemPrompt: '你是一个文字润色专家。请润色以下文本，使其表达更流畅、更专业、更优美。保持原意和语气不变。只输出润色后的文本。'
  },
  {
    id: 'rewrite',
    label: '改写',
    category: 'refine',
    icon: 'refresh',
    placeholder: '粘贴需要改写的文本...',
    systemPrompt: '你是一个文本改写专家。请用不同的表达方式重写以下内容，保持原意但改变措辞和句式。只输出改写后的文本。'
  },
  {
    id: 'study-outline',
    label: '学习提纲',
    category: 'study',
    icon: 'list',
    placeholder: '输入学习主题或粘贴学习材料...',
    systemPrompt: '你是一个学习指导专家。请根据以下内容生成一份结构化的学习提纲，包含主要知识点、重点难点和学习建议。使用层级标题和要点列表。'
  },
  {
    id: 'exam-points',
    label: '复习考点',
    category: 'study',
    icon: 'star',
    placeholder: '输入考试科目或粘贴复习资料...',
    systemPrompt: '你是一个考试辅导专家。请根据以下内容提炼出核心考点、易错点和复习重点，按重要性排序。使用清晰的分类和要点列表。'
  },
  {
    id: 'homework-idea',
    label: '作业思路',
    category: 'study',
    icon: 'lightbulb',
    placeholder: '描述你的作业题目和要求...',
    systemPrompt: '你是一个学术辅导专家。请针对以下作业题目提供解题思路、方法论建议和参考资料方向。不要直接给出完整答案，而是引导学生思考。'
  },
  {
    id: 'defense-script',
    label: '答辩稿',
    category: 'write',
    icon: 'presentation',
    placeholder: '输入项目信息、答辩要求和时间限制...',
    systemPrompt: '你是一个答辩辅导专家。请根据以下项目信息生成一份结构清晰的答辩讲稿，包含开场白、项目介绍、核心亮点、总结展望。语言正式但不僵硬。'
  },
  {
    id: 'copywriting',
    label: '文案创作',
    category: 'write',
    icon: 'pen',
    placeholder: '描述你需要的文案类型和主题...',
    systemPrompt: '你是一个专业文案创作者。请根据以下需求创作吸引人的文案，注意目标受众、语言风格和传播效果。只输出创作好的文案。'
  },
  {
    id: 'sentence-gen',
    label: '短句生成',
    category: 'write',
    icon: 'quote',
    placeholder: '描述你想要表达的意境或主题...',
    systemPrompt: '你是一个短句创作专家。请根据以下主题生成一系列精炼、有感染力的短句。每句独立一行，风格可以多样化。'
  },
  {
    id: 'paragraph',
    label: '段落重构',
    category: 'refine',
    icon: 'layout',
    placeholder: '粘贴需要重构的段落...',
    systemPrompt: '你是一个文本结构专家。请重新组织以下段落的结构，使逻辑更清晰、层次更分明。保持原意和关键信息不变。只输出重构后的文本。'
  },
  {
    id: 'translate',
    label: '中英翻译',
    category: 'translate',
    icon: 'globe',
    placeholder: '输入需要翻译的文本...',
    systemPrompt: '你是一个专业翻译。请将以下文本进行中英文互译。如果是中文翻译成英文，如果是英文翻译成中文。保持专业术语的准确性，语言流畅自然。只输出翻译结果。'
  },
  {
    id: 'proofread',
    label: '文本纠错',
    category: 'refine',
    icon: 'check',
    placeholder: '粘贴需要纠错的文本...',
    systemPrompt: '你是一个文本校对专家。请检查以下文本中的错别字、语法错误、标点符号问题和表达不当之处，列出错误并给出修改建议。格式：先列出问题，再给出修正后的全文。'
  }
]

export const CREATION_CATEGORIES = [
  { id: 'summary', label: '总结提炼', icon: 'doc' },
  { id: 'refine', label: '改写润色', icon: 'brush' },
  { id: 'expand', label: '扩写展开', icon: 'expand' },
  { id: 'study', label: '学习辅助', icon: 'star' },
  { id: 'write', label: '文案写作', icon: 'pen' },
  { id: 'translate', label: '翻译纠错', icon: 'globe' }
]

export const RAG_SYSTEM_PROMPT = `你是一个基于知识库的问答助手。请严格遵循以下规则：

1. 只能根据下面提供的"参考文档内容"来回答问题。
2. 如果参考文档中有相关信息，请用中文给出准确、简洁的回答，并在回答末尾标注引用的文档标题。
3. 如果参考文档中找不到相关信息，请明确回答："根据当前知识库中的文档内容，我无法回答这个问题。请尝试上传相关文档或换一种方式提问。"
4. 不要编造、推测或使用你自身的知识来补充答案。
5. 回答时尽量引用原文中的具体表述。`
