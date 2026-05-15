<template>
  <div class="creation-panel">
    <div class="creation-header">
      <h2>文本创作</h2>
      <p>当前模式：{{ store.activeMode?.label }}</p>
    </div>

    <div class="mode-selector">
      <div v-for="category in categories" :key="category.id" class="category-group">
        <h4>{{ category.label }}</h4>
        <div class="mode-grid">
          <button
            v-for="mode in getModesByCategory(category.id)"
            :key="mode.id"
            class="mode-btn"
            :class="{ active: store.activeMode?.id === mode.id }"
            @click="store.setMode(mode.id)"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="creation-body">
      <div class="input-section">
        <textarea
          v-model="store.inputText"
          :placeholder="store.activeMode?.placeholder || '输入需要处理的文本...'"
          class="creation-input"
          rows="6"
        ></textarea>
        <div class="input-footer">
          <span class="char-count">{{ store.inputText.length }} 字符</span>
          <div class="input-actions">
            <button class="clear-btn" @click="store.clearInput()" :disabled="!store.inputText">清空</button>
            <button class="generate-btn" @click="store.generate()" :disabled="!store.inputText.trim() || store.isGenerating">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
              </svg>
              {{ store.isGenerating ? '生成中...' : '生成' }}
            </button>
          </div>
        </div>
      </div>

      <div class="result-section">
        <div class="result-header">
          <h3>生成结果</h3>
          <div class="result-actions">
            <button class="result-action-btn" @click="store.copyResult()" :disabled="!store.result">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              复制
            </button>
            <button class="result-action-btn" @click="store.clearResult()" :disabled="!store.result">清除</button>
          </div>
        </div>

        <div v-if="store.error" class="result-error">{{ store.error }}</div>

        <div v-if="store.isGenerating" class="generating">
          <LoadingSpinner text="AI 生成中..." inline />
        </div>

        <div v-else-if="store.result" class="result-content">
          <MarkdownRenderer :content="store.result" />
        </div>

        <div v-else class="result-empty">
          <p>输入内容并点击"生成"查看结果</p>
        </div>
      </div>
    </div>

    <div v-if="store.history.length" class="history-section">
      <div class="history-header">
        <h3>历史记录</h3>
        <button class="clear-history-btn" @click="store.clearHistory()">清空记录</button>
      </div>
      <div class="history-list">
        <div v-for="item in store.history.slice(0, 20)" :key="item.id" class="history-item">
          <div class="history-top">
            <span class="history-mode">{{ item.modeLabel }}</span>
            <span class="history-time">{{ formatTime(item.timestamp) }}</span>
          </div>
          <p class="history-input">{{ item.input }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CREATION_MODES, CREATION_CATEGORIES } from '../../utils/constants.js'
import { useCreationStore } from '../../stores/creation.js'
import { useToastStore } from '../../stores/toast.js'
import MarkdownRenderer from '../common/MarkdownRenderer.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'

const store = useCreationStore()
const toast = useToastStore()
const categories = CREATION_CATEGORIES

function getModesByCategory(categoryId) {
  return CREATION_MODES.filter((m) => m.category === categoryId)
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.creation-panel {
  padding: 24px 28px;
  height: 100%;
  overflow-y: auto;
  max-width: 860px;
}

.creation-header {
  margin-bottom: 20px;
}

.creation-header h2 {
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.creation-header p {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.mode-selector {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.category-group h4 {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  margin-bottom: 8px;
}

.mode-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mode-btn {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.mode-btn:hover {
  border-color: var(--border-focus);
  color: var(--text-primary);
}

.mode-btn.active {
  background: var(--accent-ghost);
  border-color: transparent;
  color: var(--accent);
  font-weight: 600;
}

.creation-body {
  margin: 24px 0;
}

.input-section {
  margin-bottom: 24px;
}

.creation-input {
  width: 100%;
  padding: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-base);
  resize: vertical;
  min-height: 120px;
  line-height: 1.7;
  transition: border-color var(--duration-fast) var(--ease-out);
}

.creation-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-ghost);
}

.creation-input::placeholder {
  color: var(--text-muted);
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.char-count {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.input-actions {
  display: flex;
  gap: 8px;
}

.clear-btn {
  padding: 7px 16px;
  border-radius: var(--radius-md);
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.clear-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.clear-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  border-radius: var(--radius-md);
  background: var(--accent);
  border: none;
  color: white;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--duration-fast);
}

.generate-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.generate-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Result */
.result-section {
  display: flex;
  flex-direction: column;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}

.result-header h3 {
  font-size: var(--text-base);
  font-weight: 600;
}

.result-actions {
  display: flex;
  gap: 6px;
}

.result-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.result-action-btn:hover:not(:disabled) {
  color: var(--text-primary);
  border-color: var(--border-focus);
}

.result-action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.result-error {
  padding: 12px;
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--radius-md);
  color: var(--error);
  font-size: var(--text-sm);
}

.generating {
  padding: 24px;
  display: flex;
  justify-content: center;
}

.result-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  line-height: 1.8;
}

.result-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: var(--text-muted);
  font-size: var(--text-sm);
}

/* History */
.history-section {
  margin-top: 32px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.history-header h3 {
  font-size: var(--text-lg);
  font-weight: 600;
}

.clear-history-btn {
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.clear-history-btn:hover {
  color: var(--text-primary);
  border-color: var(--border-focus);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border);
}

.history-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.history-mode {
  font-size: var(--text-xs);
  color: var(--accent);
  font-weight: 600;
}

.history-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.history-input {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
