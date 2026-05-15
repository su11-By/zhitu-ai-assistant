<template>
  <div class="debate-arena">
    <!-- Agent Status Bar -->
    <div class="agent-bar">
      <div
        v-for="agent in store.agents"
        :key="agent.id"
        class="agent-status"
        :class="{
          speaking: store.streamingAgentId === agent.id,
          done: hasAgentSpoken(agent.id),
          waiting: !hasAgentSpoken(agent.id) && store.streamingAgentId !== agent.id
        }"
        :style="{ '--agent-color': agent.color }"
      >
        <div class="agent-dot">
          <span class="agent-emoji">{{ agent.icon }}</span>
          <div v-if="store.streamingAgentId === agent.id" class="pulse-ring"></div>
        </div>
        <span class="agent-status-name">{{ agent.name }}</span>
        <span class="agent-status-state">
          {{ store.streamingAgentId === agent.id ? '发言中...' : (hasAgentSpoken(agent.id) ? '已发言' : '等待中') }}
        </span>
      </div>
    </div>

    <!-- Round Progress -->
    <div class="round-progress">
      <div class="round-track">
        <div
          v-for="r in store.totalRounds"
          :key="r"
          class="round-dot"
          :class="{
            completed: r < store.currentRound,
            active: r === store.currentRound,
            pending: r > store.currentRound
          }"
        >
          <span class="round-num">{{ r }}</span>
        </div>
        <div
          class="round-progress-fill"
          :style="{ width: ((store.currentRound - 1) / Math.max(store.totalRounds - 1, 1)) * 100 + '%' }"
        ></div>
      </div>
      <div class="round-labels">
        <span v-for="(label, i) in store.roundLabels" :key="i" class="round-label-text" :class="{ active: i + 1 <= store.currentRound }">
          {{ label }}
        </span>
      </div>
    </div>

    <!-- Messages -->
    <div class="arena-messages" ref="msgContainer">
      <template v-for="(msg, i) in store.messages" :key="msg.id">
        <div v-if="isNewRound(i)" class="round-separator">
          <span>第 {{ msg.round }} 轮</span>
        </div>
        <DebateMessage :message="msg" />
      </template>

      <!-- Streaming placeholder -->
      <div v-if="store.streamingContent && store.streamingAgentId" class="debate-msg streaming" :style="{ '--agent-color': streamingAgent?.color }">
        <div class="msg-header">
          <span class="msg-avatar">{{ streamingAgent?.icon }}</span>
          <span class="msg-agent-name">{{ streamingAgent?.name }}</span>
          <span class="msg-role-tag">发言中</span>
        </div>
        <div class="msg-body">
          <MarkdownRenderer :content="store.streamingContent" />
          <span class="cursor-blink">|</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useDebateStore } from '../../stores/debate.js'
import DebateMessage from './DebateMessage.vue'
import MarkdownRenderer from '../common/MarkdownRenderer.vue'

const store = useDebateStore()
const msgContainer = ref(null)

const streamingAgent = computed(() =>
  store.agents.find(a => a.id === store.streamingAgentId)
)

const spokenAgentIds = computed(() => new Set(store.messages.map(m => m.agentId)))

function isNewRound(index) {
  if (index === 0) return true
  return store.messages[index].round !== store.messages[index - 1].round
}

function hasAgentSpoken(agentId) {
  return spokenAgentIds.value.has(agentId)
}

watch(
  () => [store.messages.length, store.streamingContent],
  () => nextTick(scrollToBottom)
)

function isNearBottom() {
  if (!msgContainer.value) return true
  const el = msgContainer.value
  return el.scrollHeight - el.scrollTop - el.clientHeight < 120
}

function scrollToBottom() {
  if (msgContainer.value && isNearBottom()) {
    requestAnimationFrame(() => {
      if (msgContainer.value) {
        msgContainer.value.scrollTop = msgContainer.value.scrollHeight
      }
    })
  }
}
</script>

<style scoped>
.debate-arena {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Agent Bar */
.agent-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
}

.agent-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  font-size: var(--text-xs);
  white-space: nowrap;
  transition: all var(--duration-fast) var(--ease-out);
  opacity: 0.6;
}

.agent-status.speaking {
  border-color: var(--agent-color);
  opacity: 1;
  box-shadow: 0 0 12px color-mix(in srgb, var(--agent-color) 30%, transparent);
}

.agent-status.done {
  opacity: 0.8;
  border-color: color-mix(in srgb, var(--agent-color) 40%, transparent);
}

.agent-dot {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.pulse-ring {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 2px solid var(--agent-color);
  animation: pulse 0.8s ease-out infinite;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}

.agent-status-name {
  font-weight: 600;
  color: var(--text-primary);
}

.agent-status-state {
  color: var(--text-muted);
}

.agent-status.speaking .agent-status-state {
  color: var(--agent-color);
  font-weight: 600;
}

/* Round Progress */
.round-progress {
  padding: 16px 16px 8px;
}

.round-track {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
}

.round-track::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--border);
  transform: translateY(-50%);
  z-index: 0;
}

.round-progress-fill {
  position: absolute;
  top: 50%;
  left: 0;
  height: 2px;
  background: var(--accent);
  transform: translateY(-50%);
  z-index: 1;
  transition: width 0.5s var(--ease-out);
}

.round-dot {
  position: relative;
  z-index: 2;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border);
  background: var(--bg-root);
  transition: all 0.3s var(--ease-out);
}

.round-dot.completed {
  border-color: var(--accent);
  background: var(--accent);
}

.round-dot.active {
  border-color: var(--accent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 40%, transparent);
}

.round-num {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
}

.round-dot.completed .round-num {
  color: #fff;
}

.round-dot.active .round-num {
  color: var(--accent);
}

.round-labels {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  margin-top: 4px;
}

.round-label-text {
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
  width: 28px;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.round-label-text.active {
  opacity: 1;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Messages */
.arena-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}

.round-separator {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0 12px;
  color: var(--accent);
  font-size: var(--text-xs);
  font-weight: 600;
}

.round-separator::before,
.round-separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* Streaming message */
.debate-msg.streaming {
  border-left: 3px solid var(--agent-color, var(--accent));
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  margin-bottom: 12px;
}

.debate-msg.streaming .msg-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.debate-msg.streaming .msg-avatar {
  font-size: 20px;
}

.debate-msg.streaming .msg-agent-name {
  font-weight: 700;
  font-size: var(--text-sm);
  color: var(--agent-color);
}

.debate-msg.streaming .msg-role-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--agent-color) 20%, transparent);
  color: var(--agent-color);
  animation: pulse-bg 1s infinite;
}

@keyframes pulse-bg {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.debate-msg.streaming .msg-body {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.7;
}

.cursor-blink {
  animation: blink 0.6s infinite;
  color: var(--agent-color, var(--accent));
  font-weight: 700;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@media (max-width: 600px) {
  .agent-bar {
    gap: 4px;
    padding: 8px;
  }
  .agent-status {
    padding: 4px 6px;
    gap: 3px;
    font-size: 10px;
  }
}
</style>
