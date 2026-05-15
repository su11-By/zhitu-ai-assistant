<template>
  <div class="chat-input">
    <div class="toolbar">
      <div class="selector-group" ref="kbSelectorRef">
        <button
          class="tool-btn"
          :class="{ active: store.boundKbId }"
          @click="toggleKbDropdown"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
          <span>{{ store.boundKbId ? kbName : '知识库' }}</span>
        </button>

        <button
          class="tool-btn"
          :class="{ active: store.webSearchEnabled }"
          @click="store.toggleWebSearch()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
          </svg>
          <span>联网</span>
        </button>

        <button
          class="tool-btn"
          :class="{ active: store.activeSkill }"
          @click="toggleSkillDropdown"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
          </svg>
          <span>{{ store.activeSkill ? store.activeSkill.name : '技能' }}</span>
        </button>

        <!-- KB dropdown -->
        <div v-if="showKbDropdown" class="dropdown" @click.stop>
          <div class="dropdown-header">
            <span>选择知识库</span>
            <button class="dropdown-close" @click="showKbDropdown = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div v-if="kbStore.knowledgeBases.length === 0" class="dropdown-empty">
            暂无知识库，请先创建
          </div>
          <div
            v-for="kb in kbStore.knowledgeBases"
            :key="kb.id"
            class="dropdown-item"
            :class="{ selected: store.boundKbId === kb.id }"
            @click="selectKb(kb)"
          >
            <div class="item-info">
              <span class="item-name">{{ kb.name }}</span>
              <span class="item-desc">{{ kb.description || '无描述' }}</span>
            </div>
            <svg v-if="store.boundKbId === kb.id" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <div v-if="store.boundKbId" class="dropdown-footer">
            <button @click="unbindKb">解除绑定</button>
          </div>
        </div>

        <!-- Skill dropdown -->
        <div v-if="showSkillDropdown" class="dropdown skill-dropdown" @click.stop>
          <div class="dropdown-header">
            <span>选择技能</span>
            <button class="dropdown-close" @click="showSkillDropdown = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div v-for="cat in skillCategories" :key="cat.id" class="category-group">
            <div class="category-label">{{ cat.icon }} {{ cat.label }}</div>
            <div
              v-for="skill in skillsByCategory(cat.id)"
              :key="skill.id"
              class="dropdown-item"
              :class="{ selected: store.activeSkill?.id === skill.id }"
              @click="selectSkill(skill)"
            >
              <div class="item-info">
                <span class="item-name">{{ skill.icon }} {{ skill.name }}</span>
                <span class="item-desc">{{ skill.description }}</span>
              </div>
              <svg v-if="store.activeSkill?.id === skill.id" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
          </div>
          <div v-if="store.activeSkill" class="dropdown-footer">
            <button @click="unselectSkill">取消技能</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="suggestedSkill && !store.activeSkill" class="suggestion-bar">
      <span class="suggestion-icon">💡</span>
      <span>试试 <strong>{{ suggestedSkill.icon }} {{ suggestedSkill.name }}</strong></span>
      <button class="suggestion-activate" @click="activateSuggestedSkill">启用</button>
      <button class="suggestion-dismiss" @click="dismissSuggestion">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="input-row">
      <div class="input-box">
        <div class="bound-tags" v-if="store.boundKbId || store.activeSkill">
          <button v-if="store.boundKbId" class="bound-tag" @click="unbindKb">
            @{{ kbName }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="12" height="12">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button v-if="store.activeSkill" class="bound-tag skill-bound" @click="unselectSkill">
            {{ store.activeSkill.icon }} {{ store.activeSkill.name }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="12" height="12">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <textarea
          ref="textareaRef"
          v-model="inputText"
          :placeholder="placeholder"
          @keydown.enter.exact.prevent="send"
          @keydown.enter.shift.prevent="insertNewline"
          @input="autoResize"
          rows="1"
          :disabled="store.isStreaming"
        ></textarea>

        <button
          v-if="store.isStreaming"
          class="stop-btn"
          @click="store.cancel()"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
          </svg>
        </button>
        <button
          v-else
          class="send-btn"
          @click="send"
          :disabled="!inputText.trim()"
          title="发送 (Enter)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2"/>
          </svg>
        </button>
      </div>
    </div>
    <div v-if="store.error" class="input-error">{{ store.error }}</div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useChatStore } from '../../stores/chat.js'
import { useKnowledgeStore } from '../../stores/knowledge.js'
import { SKILLS, SKILL_CATEGORIES, findSkillByTrigger } from '../../services/skillsRegistry.js'

const store = useChatStore()
const kbStore = useKnowledgeStore()

const inputText = ref('')
const textareaRef = ref(null)
const showKbDropdown = ref(false)
const showSkillDropdown = ref(false)
const kbSelectorRef = ref(null)
const suggestedSkill = ref(null)

const skillCategories = SKILL_CATEGORIES

const placeholder = computed(() => {
  const parts = []
  if (store.activeSkill) parts.push(store.activeSkill.name + '模式')
  if (store.boundKbId) parts.push('知识库')
  if (store.webSearchEnabled) parts.push('联网搜索')
  if (parts.length) return `${parts.join(' + ')} — Enter 发送`
  return '输入消息，Enter 发送，Shift+Enter 换行'
})

const kbName = computed(() => {
  if (!store.boundKbId) return ''
  const kb = kbStore.knowledgeBases.find((k) => k.id === store.boundKbId)
  return kb ? kb.name : '知识库'
})

function skillsByCategory(catId) {
  return SKILLS.filter(s => s.category === catId)
}

function toggleKbDropdown() {
  showKbDropdown.value = !showKbDropdown.value
  showSkillDropdown.value = false
}

function toggleSkillDropdown() {
  showSkillDropdown.value = !showSkillDropdown.value
  showKbDropdown.value = false
}

function selectKb(kb) {
  store.bindKnowledgeBase(kb.id)
  showKbDropdown.value = false
}

function unbindKb() {
  store.unbindKnowledgeBase()
  showKbDropdown.value = false
}

function selectSkill(skill) {
  store.setSkill(skill.id)
  showSkillDropdown.value = false
}

function unselectSkill() {
  store.clearSkill()
  showSkillDropdown.value = false
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function insertNewline() {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  inputText.value = inputText.value.slice(0, start) + '\n' + inputText.value.slice(end)
  nextTick(() => {
    el.selectionStart = el.selectionEnd = start + 1
    autoResize()
  })
}

async function send() {
  const text = inputText.value.trim()
  if (!text || store.isStreaming) return

  inputText.value = ''
  suggestedSkill.value = null
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  await store.sendMessage(text)
  await nextTick()
}

function activateSuggestedSkill() {
  if (suggestedSkill.value) {
    store.setSkill(suggestedSkill.value.id)
    suggestedSkill.value = null
  }
}

function dismissSuggestion() {
  suggestedSkill.value = null
}

watch(inputText, (val) => {
  if (!val.trim() || store.activeSkill) {
    suggestedSkill.value = null
    return
  }
  const matched = findSkillByTrigger(val)
  if (matched && matched.id !== store.activeSkill?.id) {
    suggestedSkill.value = matched
  } else {
    suggestedSkill.value = null
  }
})

watch(() => store.prefillPrompt, (val) => {
  if (!val) return
  inputText.value = val
  store.prefillPrompt = ''
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
      autoResize()
    }
  })
})

const showAnyDropdown = computed(() => showKbDropdown.value || showSkillDropdown.value)

function handleClickOutside(e) {
  if (kbSelectorRef.value && !kbSelectorRef.value.contains(e.target)) {
    showKbDropdown.value = false
    showSkillDropdown.value = false
  }
}

watch(showAnyDropdown, (val) => {
  if (val) {
    setTimeout(() => document.addEventListener('click', handleClickOutside), 0)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<style scoped>
.chat-input {
  padding: 12px 24px 16px;
  border-top: 1px solid var(--border);
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  flex-shrink: 0;
}

.input-error {
  margin-top: 8px;
  font-size: var(--text-xs);
  color: var(--error);
}

.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.selector-group {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.tool-btn:hover {
  border-color: var(--border-focus);
  color: var(--text-secondary);
}

.tool-btn.active {
  background: var(--accent-ghost);
  border-color: var(--accent-ghost);
  color: var(--accent);
}

.suggestion-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  margin-bottom: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  animation: slideDown 0.2s var(--ease-out);
}

.suggestion-icon {
  font-size: 14px;
}

.suggestion-activate {
  padding: 4px 14px;
  border-radius: var(--radius-full);
  background: var(--accent);
  border: none;
  color: white;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;
  transition: opacity var(--duration-fast);
}

.suggestion-activate:hover {
  opacity: 0.9;
}

.suggestion-dismiss {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.input-row {
  display: flex;
  flex-direction: column;
}

.input-box {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.input-box:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--bg-hover);
}

.bound-tags {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  align-items: center;
}

.bound-tag {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 10px;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 11px;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--duration-fast);
}

.bound-tag:hover {
  border-color: var(--border-focus);
  color: var(--text-primary);
}

.bound-tag.skill-bound {
  background: var(--accent-ghost);
  border-color: transparent;
  color: var(--accent);
}

textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: var(--text-base);
  resize: none;
  min-height: 24px;
  max-height: 120px;
  padding: 3px 0;
  line-height: 1.5;
}

textarea:focus {
  outline: none;
}

textarea::placeholder {
  color: var(--text-muted);
}

textarea:disabled {
  opacity: 0.6;
}

.send-btn {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: var(--accent);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--duration-fast) var(--ease-out);
}

.send-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.send-btn svg {
  width: 16px;
  height: 16px;
}

.stop-btn {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: var(--error);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: pulse-stop 1.5s infinite;
}

.stop-btn:hover {
  background: #b91c1c;
}

@keyframes pulse-stop {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
}

/* Dropdowns */
.dropdown {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 280px;
  max-height: 360px;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 100;
}

.skill-dropdown {
  width: 320px;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 600;
}

.dropdown-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
  border-radius: var(--radius-sm);
  transition: color var(--duration-fast);
}

.dropdown-close:hover {
  color: var(--text-primary);
}

.dropdown-empty {
  padding: 28px 14px;
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  transition: background var(--duration-fast);
}

.dropdown-item:hover {
  background: var(--bg-hover);
}

.dropdown-item.selected {
  background: var(--accent-ghost);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.item-name {
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-weight: 500;
}

.item-desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-item svg {
  color: var(--accent);
  flex-shrink: 0;
}

.dropdown-footer {
  padding: 8px 14px;
  border-top: 1px solid var(--border);
}

.dropdown-footer button {
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 11px;
  cursor: pointer;
  transition: all var(--duration-fast);
}

.dropdown-footer button:hover {
  color: var(--text-primary);
  border-color: var(--border-focus);
}

.category-group {
  border-bottom: 1px solid var(--border);
}

.category-group:last-child {
  border-bottom: none;
}

.category-label {
  padding: 8px 14px 4px;
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
</style>
