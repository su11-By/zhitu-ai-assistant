<template>
  <div class="chat-window">
    <div class="chat-header">
      <div class="chat-header-info">
        <h2>{{ store.activeSession?.title || 'AI 对话' }}</h2>
        <div class="chat-badges">
          <template v-if="store.activeSkill">
            <span class="badge skill-badge">
              {{ store.activeSkill.icon }} {{ store.activeSkill.name }}
            </span>
          </template>
          <template v-if="boundKb">
            <span class="badge kb-badge" @click="goToKb" title="点击前往知识库">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
              {{ boundKb.name }}
            </span>
            <span class="mode-tag">知识库问答</span>
          </template>
          <template v-else-if="store.webSearchEnabled">
            <span class="badge web-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
              联网搜索
            </span>
          </template>
          <span v-else class="mode-tag">通用模式</span>
        </div>
      </div>
      <div class="chat-actions">
        <button class="icon-btn" @click="exportMarkdown" title="导出对话">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        <button class="icon-btn" @click="handleClear" title="清空对话">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="context-meter" :class="meterLevel">
      <div class="meter-track">
        <div class="meter-fill" :style="{ width: contextPercent + '%' }"></div>
      </div>
      <div class="meter-label">
        <span>{{ contextUsed }} / {{ contextMax }} tokens</span>
        <span v-if="contextTrimmed">已截断历史</span>
      </div>
    </div>

    <div class="message-list" ref="msgListRef">
      <div v-if="!store.messages.length" class="empty-chat">
        <div class="empty-chat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <h3>开始对话</h3>
        <p>输入消息与 AI 助手交流。在知识库绑定后可进行 RAG 问答。</p>
        <div class="suggestions">
          <button
            v-for="(prompt, i) in promptSuggestions"
            :key="i"
            class="suggestion-chip"
            @click="useSuggestion(prompt)"
          >
            {{ prompt }}
          </button>
        </div>
      </div>

      <ChatMessage
        v-for="(msg, i) in store.messages"
        :key="msg.id || i"
        :message="msg"
        @retry="store.retry()"
        @edit="handleEdit"
      />

      <div v-if="store.isStreaming && store.streamingContent" class="streaming-msg">
        <div class="ai-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="streaming-body">
          <div class="streaming-header"><span class="streaming-role">智途 AI</span></div>
          <div class="streaming-content">
            <MarkdownRenderer :content="store.streamingContent" />
            <span class="cursor-blink">|</span>
          </div>
        </div>
      </div>

      <div v-if="store.isStreaming && !store.streamingContent" class="thinking-block">
        <details v-if="store.streamingReasoning" open>
          <summary class="thinking-summary">思考中...</summary>
          <div class="thinking-content">{{ store.streamingReasoning }}</div>
        </details>
        <div v-else class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div v-if="store.isSearching" class="search-status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="spin-icon">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.2"/>
          <path d="M12 2a10 10 0 019.95 9" stroke-linecap="round"/>
        </svg>
        <span>{{ store.boundKbId && store.webSearchEnabled ? '检索知识库与网络中...' : store.boundKbId ? '检索知识库中...' : '搜索网络中...' }}</span>
      </div>
    </div>

    <ChatInput />
  </div>
</template>

<script setup>
import { watch, ref, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../../stores/chat.js'
import { useKnowledgeStore } from '../../stores/knowledge.js'
import { useSettingsStore } from '../../stores/settings.js'
import { useToastStore } from '../../stores/toast.js'
import { getSkillById } from '../../services/skillsRegistry.js'
import { estimateTokens } from '../../utils/tokenizer.js'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'
import MarkdownRenderer from '../common/MarkdownRenderer.vue'

const store = useChatStore()
const kbStore = useKnowledgeStore()
const settings = useSettingsStore()
const toast = useToastStore()
const router = useRouter()
const msgListRef = ref(null)

const boundKb = computed(() => {
  if (!store.boundKbId) return null
  return kbStore.knowledgeBases.find(k => k.id === store.boundKbId) || null
})

const promptSuggestions = computed(() => {
  if (store.activeSkill) {
    const name = store.activeSkill.name
    return [
      `用${name}技能帮我处理一段文本`,
      `${name}模式适合什么场景？`,
      `给我一个${name}的使用示例`
    ]
  }
  if (store.boundKbId) {
    const name = boundKb.value?.name || '知识库'
    return [
      `总结「${name}」中的核心内容`,
      `「${name}」里有哪些关键要点？`,
      `根据「${name}」回答我的问题`
    ]
  }
  if (store.webSearchEnabled) {
    return [
      '最近 AI 领域有什么新进展？',
      '帮我搜索最新的科技新闻',
      '2026年有哪些重要的技术趋势？'
    ]
  }
  return [
    '解释一下什么是人工智能',
    '帮我写一段 Python 代码',
    '推荐几本值得阅读的书籍',
    '如何提高工作效率？',
    '帮我翻译一段英文文本'
  ]
})

const contextMax = computed(() => settings.aiConfig.contextWindow || 4096)
const contextUsed = computed(() => {
  let total = 0
  for (const msg of store.messages) {
    total += estimateTokens(msg.content) + 4
  }
  return total
})
const contextPercent = computed(() => Math.min(100, (contextUsed.value / contextMax.value) * 100))
const contextTrimmed = computed(() => contextUsed.value > contextMax.value * 0.9)
const meterLevel = computed(() => {
  if (contextPercent.value > 90) return 'danger'
  if (contextPercent.value > 60) return 'warning'
  return 'normal'
})

function goToKb() {
  if (store.boundKbId) {
    router.push(`/knowledge/${store.boundKbId}`)
  }
}

function useSuggestion(text) {
  store.prefillPrompt = text
}

function handleEdit({ messageId, newContent }) {
  store.editMessage(messageId, newContent)
}

function handleClear() {
  store.clearSession()
  toast.info('对话已清空')
}

function exportMarkdown() {
  if (!store.messages.length) {
    toast.warning('暂无内容可导出')
    return
  }
  const title = store.activeSession?.title || 'AI对话'
  let md = `# ${title}\n\n> 导出时间: ${new Date().toLocaleString('zh-CN')}\n\n---\n\n`
  for (const msg of store.messages) {
    const role = msg.role === 'user' ? '**你**' : '**智途 AI**'
    const badges = []
    if (msg.skillId) {
      const skill = getSkillById(msg.skillId)
      if (skill) badges.push(`${skill.icon} ${skill.name}`)
    }
    if (msg.grounded) badges.push('知识库回答')
    if (msg.webSearch) badges.push('联网搜索')
    const badgeStr = badges.length ? ` (${badges.join(' | ')})` : ''
    md += `### ${role}${badgeStr}\n\n${msg.content}\n\n---\n\n`
  }
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/[\\/:*?"<>|]/g, '_')}.md`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('对话已导出为 Markdown')
}

function isNearBottom() {
  if (!msgListRef.value) return true
  const el = msgListRef.value
  return el.scrollHeight - el.scrollTop - el.clientHeight < 120
}

function scrollToBottom() {
  if (msgListRef.value && isNearBottom()) {
    requestAnimationFrame(() => {
      if (msgListRef.value) {
        msgListRef.value.scrollTop = msgListRef.value.scrollHeight
      }
    })
  }
}

watch(
  () => [store.messages.length, store.streamingContent, store.streamingReasoning],
  () => nextTick(() => scrollToBottom()),
  { deep: true }
)
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.chat-header-info h2 {
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.chat-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
}

.kb-badge {
  background: rgba(22, 163, 74, 0.08);
  color: var(--success);
  cursor: pointer;
  transition: background var(--duration-fast);
}

.kb-badge:hover {
  background: rgba(22, 163, 74, 0.14);
}

.web-badge {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.skill-badge {
  background: var(--accent-ghost);
  color: var(--accent);
}

.mode-tag {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.chat-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}

.icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-focus);
}

.icon-btn svg {
  width: 15px;
  height: 15px;
}

.context-meter {
  padding: 6px 24px;
}

.meter-track {
  height: 3px;
  background: var(--bg-input);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.meter-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s var(--ease-out);
  background: var(--success);
}

.danger .meter-fill { background: var(--error); }
.warning .meter-fill { background: var(--warning); }

.meter-label {
  display: flex;
  justify-content: space-between;
}

.meter-label span {
  font-size: 10px;
  color: var(--text-muted);
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  gap: 12px;
}

.empty-chat-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.empty-chat-icon svg {
  width: 28px;
  height: 28px;
}

.empty-chat h3 {
  font-size: var(--text-lg);
  font-weight: 600;
}

.empty-chat p {
  font-size: var(--text-sm);
  color: var(--text-muted);
  max-width: 320px;
  line-height: 1.6;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
  max-width: 420px;
  justify-content: center;
}

.suggestion-chip {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.suggestion-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-ghost);
  transform: translateY(-1px);
}

/* Streaming message */
.streaming-msg {
  display: flex;
  gap: 12px;
  padding: 16px 0;
}

.ai-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.ai-avatar svg {
  width: 18px;
  height: 18px;
}

.streaming-body {
  flex: 1;
  min-width: 0;
}

.streaming-header {
  margin-bottom: 6px;
}

.streaming-role {
  font-size: var(--text-sm);
  font-weight: 600;
}

.streaming-content {
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  border: 1px solid var(--border);
  font-size: var(--text-base);
  line-height: 1.8;
}

.cursor-blink {
  animation: pulse 0.8s infinite;
  color: var(--accent);
  font-weight: 300;
}

/* Thinking / reasoning block */
.thinking-block {
  padding: 12px 16px;
}

.thinking-summary {
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-muted);
  user-select: none;
  list-style: none;
}

.thinking-summary::-webkit-details-marker { display: none; }

.thinking-summary::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent, #f59e0b);
  margin-right: 8px;
  animation: pulse-dot 1.2s infinite ease-in-out;
}

.thinking-content {
  margin-top: 8px;
  padding: 10px 14px;
  background: rgba(245, 158, 11, 0.06);
  border-left: 2px solid var(--accent, #f59e0b);
  border-radius: 0 6px 6px 0;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: 5px;
  padding: 12px 16px;
  align-items: center;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
}

/* Search status */
.search-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: var(--text-xs);
  color: var(--text-muted);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin: 8px 0;
}

.spin-icon {
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
</style>
