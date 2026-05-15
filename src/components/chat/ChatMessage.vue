<template>
  <div class="message-row" :class="message.role">
    <div class="message-avatar">
      <template v-if="message.role === 'user'">
        <span>{{ userInitial }}</span>
      </template>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    </div>

    <div class="message-body">
      <div class="message-header">
        <span class="sender-name">{{ message.role === 'user' ? '你' : '智途 AI' }}</span>
        <span v-if="message.grounded" class="tag kb-tag">知识库</span>
        <span v-if="message.webSearch" class="tag web-tag">联网</span>
        <span v-if="message.skillId" class="tag skill-tag">{{ getSkillName(message.skillId) }}</span>
        <span class="send-time">{{ formatTime(message.timestamp) }}</span>
      </div>

      <div class="message-content" :class="{ 'is-user': message.role === 'user' }">
        <div v-if="isEditing" class="edit-area">
          <textarea
            ref="editTextarea"
            v-model="editContent"
            class="edit-input"
            @keydown.enter.meta="submitEdit"
            @keydown.enter.ctrl="submitEdit"
            @keydown.escape="cancelEdit"
          ></textarea>
          <div class="edit-actions">
            <button class="edit-btn cancel" @click="cancelEdit">取消</button>
            <button class="edit-btn submit" @click="submitEdit">更新并发送</button>
          </div>
        </div>
        <MarkdownRenderer v-else :content="message.content" />
      </div>

      <div v-if="message.role === 'assistant'" class="message-actions">
        <button class="action-btn" @click="copyContent" title="复制">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>
        <button class="action-btn" @click="$emit('retry')" title="重新生成">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      <div v-if="message.role === 'user'" class="message-actions">
        <button class="action-btn" @click="startEdit" title="编辑">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="action-btn" @click="copyContent" title="复制">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>
      </div>

      <div v-if="message.sources?.length" class="source-list">
        <div class="source-list-header">参考来源</div>
        <div class="source-card" v-for="(source, i) in message.sources" :key="i">
          <div class="source-title">
            <svg v-if="source.type === 'web'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <span
              v-if="source.type === 'web' && source.url"
              class="source-link"
              :title="source.url"
              @click="openUrl(source.url)"
            >
              {{ source.title }}
            </span>
            <span v-else>{{ source.title }}</span>
            <span v-if="source.type === 'web'" class="source-type">网页</span>
            <span v-else-if="source.type === 'kb'" class="source-type">文档</span>
            <span v-if="source.score" class="source-score">{{ (source.score * 100).toFixed(0) }}%</span>
          </div>
          <p class="source-snippet">{{ source.snippet }}</p>
          <div v-if="source.type === 'web' && source.url" class="source-url-row">
            <span class="source-url">{{ source.url }}</span>
            <button class="copy-url-btn" @click="copyUrl(source.url)">复制</button>
          </div>
        </div>
      </div>

      <div v-if="message.contextStats" class="context-info">
        <span>{{ message.contextStats.historyCount }} 轮历史</span>
        <span v-if="message.contextStats.historyTrimmed">(部分已截断)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useToastStore } from '../../stores/toast.js'
import { getSkillById } from '../../services/skillsRegistry.js'
import MarkdownRenderer from '../common/MarkdownRenderer.vue'

const auth = useAuthStore()
const toast = useToastStore()

const props = defineProps({
  message: { type: Object, required: true }
})

const emit = defineEmits(['retry', 'edit'])

const isEditing = ref(false)
const editContent = ref('')
const editTextarea = ref(null)

const userInitial = auth.userName?.charAt(0) || 'U'

function startEdit() {
  isEditing.value = true
  editContent.value = props.message.content
  nextTick(() => {
    if (editTextarea.value) {
      editTextarea.value.focus()
      editTextarea.value.select()
    }
  })
}

function cancelEdit() {
  isEditing.value = false
  editContent.value = ''
}

function submitEdit() {
  const newContent = editContent.value.trim()
  if (!newContent) return
  emit('edit', { messageId: props.message.id, newContent })
  isEditing.value = false
  editContent.value = ''
}

function getSkillName(skillId) {
  const skill = getSkillById(skillId)
  return skill ? `${skill.icon} ${skill.name}` : ''
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function openUrl(url) {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

function copyUrl(url) {
  if (!url) return
  navigator.clipboard.writeText(url)
}

function copyContent() {
  navigator.clipboard.writeText(props.message.content).then(() => {
    toast.success('已复制')
  }).catch(() => {
    toast.error('复制失败')
  })
}
</script>

<style scoped>
.message-row {
  display: flex;
  gap: 12px;
  padding: 18px 0;
}

.message-row.assistant {
  flex-direction: row;
}

.message-row.user {
  flex-direction: row-reverse;
}

.message-row.user .message-body {
  align-items: flex-end;
}

.message-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.message-avatar svg {
  width: 18px;
  height: 18px;
}

.message-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
  max-width: 85%;
}

.message-row.user .message-body {
  align-items: flex-end;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sender-name {
  font-size: var(--text-sm);
  font-weight: 600;
}

.send-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.tag {
  padding: 1px 7px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
}

.kb-tag {
  background: rgba(22, 163, 74, 0.08);
  color: var(--success);
}

.web-tag {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.skill-tag {
  background: var(--accent-ghost);
  color: var(--accent);
}

.message-content {
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  line-height: 1.8;
  background: var(--bg-card);
  border: 1px solid var(--border);
}

.message-content.is-user {
  background: var(--bg-hover);
  border-color: var(--border-light);
}

.message-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.message-row:hover .message-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-focus);
}

.action-btn svg {
  width: 13px;
  height: 13px;
}

/* Sources */
.source-list {
  margin-top: 8px;
  width: 100%;
}

.source-list-header {
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.source-card {
  padding: 10px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-bottom: 6px;
}

.source-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: 4px;
}

.source-score {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-weight: 400;
  margin-left: auto;
}

.source-link {
  color: var(--accent);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.source-link:hover {
  text-decoration: underline;
}

.source-type {
  padding: 1px 6px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
  background: var(--bg-hover);
  color: var(--text-muted);
  flex-shrink: 0;
}

.source-snippet {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 4px;
}

.source-url-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.source-url {
  font-size: 10px;
  color: var(--text-muted);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-url-btn {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 10px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--duration-fast);
}

.copy-url-btn:hover {
  color: var(--text-primary);
  border-color: var(--border-focus);
}

.context-info {
  margin-top: 4px;
}

.context-info span {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Edit mode */
.edit-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-input {
  width: 100%;
  min-height: 80px;
  padding: 10px 12px;
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: var(--text-base);
  line-height: 1.6;
  resize: vertical;
  outline: none;
}

.edit-input:focus {
  box-shadow: 0 0 0 3px var(--accent-ghost);
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-btn {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast);
  border: 1px solid var(--border);
}

.edit-btn.cancel {
  background: transparent;
  color: var(--text-secondary);
}

.edit-btn.cancel:hover {
  background: var(--bg-hover);
}

.edit-btn.submit {
  background: var(--accent);
  color: white;
  border-color: transparent;
}

.edit-btn.submit:hover {
  opacity: 0.9;
}
</style>
