<template>
  <div class="dashboard">
    <section class="hero">
      <div class="hero-badge">毕业设计项目</div>
      <h1 class="hero-title">智途 AI 学习助手工作台</h1>
      <p class="hero-desc">
        集知识库管理、智能问答、任务协同与内容创作于一体的 AI 工作台，
        面向课程期末答辩场景设计，提升资料管理与项目展示完整度。
      </p>
      <div class="hero-actions">
        <router-link to="/chat" class="hero-btn primary">开始对话</router-link>
        <router-link to="/knowledge" class="hero-btn secondary">管理知识库</router-link>
      </div>
    </section>

    <section class="stats-section">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.bg }">
          <span v-html="stat.icon"></span>
        </div>
        <div class="stat-body">
          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <section class="features-section">
      <h2>核心功能</h2>
      <div class="features-grid">
        <div class="feature-card" v-for="f in features" :key="f.title" @click="goTo(f.route)">
          <div class="feature-icon" :style="{ background: f.bg }">
            <span v-html="f.icon"></span>
          </div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
          <span class="feature-link">{{ f.action }}</span>
        </div>
      </div>
    </section>

    <section class="tech-section">
      <h2>技术架构</h2>
      <div class="tech-stack">
        <div class="tech-layer">
          <h4>前端层</h4>
          <div class="tech-tags">
            <span>Vue 3</span><span>Vite 5</span><span>Pinia</span><span>Vue Router</span>
            <span>CSS Variables</span><span>IndexedDB</span><span>LocalStorage</span>
          </div>
        </div>
        <div class="tech-layer">
          <h4>AI 服务层</h4>
          <div class="tech-tags">
            <span>DeepSeek</span><span>deepseek-v4-pro</span><span>TF-IDF 向量化</span>
            <span>RAG 检索</span><span>向量存储</span><span>文档解析</span>
          </div>
        </div>
        <div class="tech-layer">
          <h4>后端服务层</h4>
          <div class="tech-tags">
            <span>Express</span><span>搜索代理</span><span>内容抓取</span>
            <span>API 网关</span><span>流式响应</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../../stores/chat.js'
import { useKnowledgeStore } from '../../stores/knowledge.js'
import { vectorStore } from '../../services/vectorStore.js'

const router = useRouter()
const chat = useChatStore()
const kb = useKnowledgeStore()

const docCount = ref(0)
const chunkCount = ref(0)

onMounted(async () => {
  try {
    const s = await vectorStore.getStorageStats()
    docCount.value = s.docCount || 0
    chunkCount.value = s.chunkCount || 0
  } catch { /* ignore */ }
})

const stats = computed(() => [
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
    value: kb.knowledgeBases.length,
    label: '知识库',
    bg: 'rgba(79, 70, 229, 0.08)'
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>',
    value: docCount.value,
    label: '文档',
    bg: 'rgba(22, 163, 74, 0.08)'
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
    value: chat.sessions.length,
    label: '对话会话',
    bg: 'rgba(234, 88, 12, 0.08)'
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>',
    value: chunkCount.value,
    label: '向量分块',
    bg: 'rgba(139, 92, 246, 0.08)'
  }
])

const features = [
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
    title: 'AI 智能对话',
    desc: '支持流式输出、多轮对话、上下文管理，集成知识库 RAG 与联网搜索双源问答',
    route: '/chat',
    action: '开始对话 →',
    bg: 'rgba(79, 70, 229, 0.06)'
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
    title: '知识库管理',
    desc: '支持 PDF/Word/MD/TXT 文档上传、自动分块、向量嵌入与语义检索，构建私有知识库',
    route: '/knowledge',
    action: '管理知识库 →',
    bg: 'rgba(22, 163, 74, 0.06)'
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    title: '文本创作',
    desc: '内置 13 种创作模式：总结、润色、翻译、学习提纲、答辩稿、文案写作等',
    route: '/creation',
    action: '开始创作 →',
    bg: 'rgba(234, 88, 12, 0.06)'
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>',
    title: '11 种 AI 技能',
    desc: '头脑风暴、PRD 文档、品牌设计、Logo 设计、Banner、PPT、文案创作等专业服务',
    route: '/chat',
    action: '探索技能 →',
    bg: 'rgba(139, 92, 246, 0.06)'
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
    title: '联网搜索增强',
    desc: '当知识库不足时，自动通过网络搜索获取最新信息，提供来源溯源',
    route: '/chat',
    action: '体验搜索 →',
    bg: 'rgba(6, 182, 212, 0.06)'
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1"/><path d="M15 4H5a2 2 0 00-2 2v6a2 2 0 002 2h1"/><circle cx="10" cy="9" r="2"/><circle cx="18" cy="5" r="2"/></svg>',
    title: '多智能体辩论',
    desc: '多个 AI 角色围绕话题进行多轮辩论，从不同角度深度分析问题',
    route: '/debate',
    action: '开始辩论 →',
    bg: 'rgba(168, 85, 247, 0.06)'
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>',
    title: 'AI 自主工作流',
    desc: 'AI 自动拆解复杂目标，依次执行搜索、总结、创作等工具，输出完整成果',
    route: '/agent',
    action: '开始任务 →',
    bg: 'rgba(239, 68, 68, 0.06)'
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    title: '任务管理中心',
    desc: '答辩任务规划、进度追踪、优先级管理，确保每个环节有序推进',
    route: '/tasks',
    action: '管理任务 →',
    bg: 'rgba(245, 158, 11, 0.06)'
  }
]

function goTo(route) {
  if (route) router.push(route)
}
</script>

<style scoped>
.dashboard {
  padding: 32px 40px;
  max-width: 960px;
  height: 100%;
  overflow-y: auto;
}

.hero {
  text-align: center;
  padding: 40px 0 32px;
  position: relative;
}

.hero-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: var(--radius-full);
  background: var(--accent-ghost);
  color: var(--accent);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 20px;
}

.hero-title {
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin-bottom: 14px;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  max-width: 580px;
  margin: 0 auto;
  font-size: var(--text-base);
  color: var(--text-muted);
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 28px;
}

.hero-btn {
  padding: 12px 28px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-out);
}

.hero-btn.primary {
  background: var(--accent);
  color: white;
}

.hero-btn.primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.hero-btn.secondary {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-primary);
}

.hero-btn.secondary:hover {
  border-color: var(--border-focus);
  background: var(--bg-hover);
  transform: translateY(-1px);
}

/* Stats */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin: 36px 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-out);
}

.stat-card:hover {
  border-color: var(--border-focus);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--accent);
}

.stat-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.stat-body strong {
  display: block;
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}

.stat-body span {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 4px;
  display: block;
}

/* Features */
.features-section h2,
.tech-section h2 {
  font-size: var(--text-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 18px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 40px;
}

.feature-card {
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.feature-card:hover {
  border-color: var(--border-focus);
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  color: var(--accent);
}

.feature-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.feature-card h3 {
  font-size: var(--text-base);
  font-weight: 600;
  margin-bottom: 6px;
}

.feature-card p {
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 12px;
}

.feature-link {
  font-size: var(--text-sm);
  color: var(--accent);
  font-weight: 600;
}

/* Tech section */
.tech-section {
  padding-bottom: 48px;
}

.tech-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tech-layer {
  padding: 18px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.tech-layer h4 {
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tags span {
  padding: 5px 12px;
  border-radius: var(--radius-full);
  background: var(--bg-hover);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 500;
}

@media (max-width: 800px) {
  .dashboard { padding: 20px; }
  .hero-title { font-size: 1.6rem; }
  .stats-section { grid-template-columns: repeat(2, 1fr); }
  .features-grid { grid-template-columns: 1fr; }
}
</style>
