<template>
  <div class="debate-msg" :style="{ '--agent-color': message.agentColor }">
    <div class="msg-round-badge">R{{ message.round }}</div>
    <div class="msg-header">
      <span class="msg-avatar">{{ message.agentIcon }}</span>
      <span class="msg-agent-name">{{ message.agentName }}</span>
      <span class="msg-role-tag" :class="message.role">{{ message.role }}</span>
    </div>
    <div class="msg-body">
      <MarkdownRenderer :content="message.content" />
    </div>
  </div>
</template>

<script setup>
import MarkdownRenderer from '../common/MarkdownRenderer.vue'

defineProps({
  message: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.debate-msg {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-left: 3px solid var(--agent-color, var(--accent));
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  margin-bottom: 12px;
  animation: msg-in 0.3s var(--ease-out);
}

@keyframes msg-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.msg-round-badge {
  position: absolute;
  top: -8px;
  right: 16px;
  background: var(--agent-color, var(--accent));
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  letter-spacing: 0.05em;
}

.msg-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.msg-avatar {
  font-size: 20px;
  line-height: 1;
}

.msg-agent-name {
  font-weight: 700;
  font-size: var(--text-sm);
  color: var(--agent-color, var(--text-primary));
}

.msg-role-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 500;
  background: color-mix(in srgb, var(--agent-color, var(--accent)) 15%, transparent);
  color: var(--agent-color, var(--accent));
}

.msg-body {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.7;
}
</style>
