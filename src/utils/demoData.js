// Seeds demo data on first visit for graduation defense presentation
import { useAuthStore } from '../stores/auth.js'
import { useKnowledgeStore } from '../stores/knowledge.js'
import { useTaskStore } from '../stores/tasks.js'
import { useChatStore } from '../stores/chat.js'

let seeded = false

export function seedDemoData() {
  if (seeded) return
  try {
    if (localStorage.getItem('demo-seeded-v2')) return
  } catch { return }

  seeded = true
  const auth = useAuthStore()
  const kb = useKnowledgeStore()
  const tasks = useTaskStore()
  const chat = useChatStore()

  // Login as guest first so stores have a user prefix
  if (!auth.isLoggedIn) {
    auth.loginAsGuest()
  }

  // Seed knowledge bases
  const kb1 = kb.createKB({ name: '毕业设计资料', description: '答辩相关论文与参考文献', category: '学术研究' })
  const kb2 = kb.createKB({ name: '技术学习笔记', description: 'Vue 3、RAG、LLM 相关技术文档', category: '技术学习' })

  // Seed tasks
  tasks.add({ title: '完成项目需求分析文档', description: '明确功能模块与技术选型', priority: 'urgent', dueDate: Date.now() - 2 * 86400000 })
  tasks.add({ title: '实现知识库 RAG 检索功能', description: '文档解析、分块、向量嵌入与相似度搜索', priority: 'high', dueDate: Date.now() - 86400000 })
  tasks.add({ title: '搭建 Express 后端代理服务', description: '搜索代理与网页内容抓取', priority: 'high', dueDate: Date.now() + 86400000 })
  tasks.add({ title: '设计项目仪表盘页面', description: '展示核心统计数据与功能导航', priority: 'medium' })
  tasks.add({ title: '编写答辩 PPT', description: '10-15 页演示文稿，突出创新点', priority: 'high', dueDate: Date.now() + 3 * 86400000 })
  tasks.add({ title: '准备项目演示视频', description: '5 分钟功能演示录像', priority: 'medium', dueDate: Date.now() + 5 * 86400000 })
  tasks.add({ title: 'UI 细节打磨', description: '过渡动效、空状态、骨架屏', priority: 'low' })

  // Mark some tasks as completed
  const allTasks = tasks.tasks
  if (allTasks[0]) tasks.toggleStatus(allTasks[0].id) // in_progress
  if (allTasks[1]) tasks.toggleStatus(allTasks[1].id)
  if (allTasks[1]) tasks.toggleStatus(allTasks[1].id) // completed
  if (allTasks[6]) tasks.toggleStatus(allTasks[6].id) // in_progress

  // Seed chat sessions
  const s1 = chat.newSession('毕业设计思路讨论')
  // Simulate a conversation
  chat.messages.push(
    { id: 'demo-1', role: 'user', content: '帮我梳理毕业设计的整体架构思路', timestamp: Date.now() - 3600000 },
    { id: 'demo-2', role: 'assistant', content: '好的！建议采用以下架构：\n\n**前端层**：Vue 3 + Vite + Pinia\n- 组件化开发，组合式 API\n- CSS 变量实现主题系统\n- IndexedDB 存储向量数据\n\n**AI 服务层**：LM Studio 本地部署\n- Qwen3-4B-Thinking 对话模型\n- Nomic Embed Text 嵌入模型\n- OpenAI 兼容 API 调用\n\n**后端服务层**：Express\n- 搜索代理（搜狗搜索）\n- 网页内容抓取\n- API 网关\n\n**数据层**：\n- LocalStorage 持久化用户数据\n- IndexedDB 存储文档向量\n\n这样的架构既完整又能体现技术深度，适合毕业设计展示！', timestamp: Date.now() - 3500000 }
  )
  chat.saveMessages(s1.id)

  const s2 = chat.newSession('RAG 实现方案咨询')
  chat.messages.push(
    { id: 'demo-3', role: 'user', content: 'RAG 检索增强生成的实现流程是怎样的？', timestamp: Date.now() - 7200000 },
    { id: 'demo-4', role: 'assistant', content: 'RAG 的完整流程如下：\n\n1. **文档解析** → 支持 PDF、DOCX、MD、TXT 格式\n2. **文本分块** → 按段落 + 句子边界切分，400字符/块，50字符重叠\n3. **向量嵌入** → 调用 Nomic Embed Text 模型生成 768 维向量\n4. **向量存储** → IndexedDB 按知识库 ID 建立索引\n5. **语义检索** → 余弦相似度计算，Top-K 检索\n6. **上下文增强** → 将检索结果注入 System Prompt\n7. **生成回答** → LLM 基于检索内容生成回答\n\n回答时会标注来源文档和相似度分数，实现可溯源的问答！', timestamp: Date.now() - 7100000 }
  )
  chat.saveMessages(s2.id)

  // Switch back to first session
  chat.switchSession(s1.id)

  // Mark as seeded
  try { localStorage.setItem('demo-seeded-v2', '1') } catch { /* ignore */ }
}
