<template>
  <div class="agent-result">
    <div class="result-header">
      <div class="result-badge completed">✅ 执行完成</div>
      <h3>最终输出</h3>
    </div>

    <div class="result-body">
      <MarkdownRenderer :content="store.finalOutput" />
    </div>

    <div class="result-actions">
      <button class="action-btn primary" @click="$emit('export')">
        <span>📥</span> 导出 Markdown
      </button>
      <button class="action-btn secondary" @click="$emit('save-to-kb')">
        <span>📚</span> 保存到知识库
      </button>
      <button class="action-btn secondary" @click="$emit('create-tasks')">
        <span>✅</span> 生成任务清单
      </button>
      <button class="action-btn ghost" @click="$emit('new')">
        <span>🔄</span> 开始新任务
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAgentStore } from '../../stores/agent.js'
import MarkdownRenderer from '../common/MarkdownRenderer.vue'

const store = useAgentStore()

defineEmits(['export', 'save-to-kb', 'create-tasks', 'new'])
</script>

<style scoped>
.agent-result {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.result-header {
  text-align: center;
  margin-bottom: 24px;
}

.result-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  margin-bottom: 12px;
}

.result-badge.completed {
  background: rgba(16, 185, 129, 0.12);
  color: var(--success);
}

.result-header h3 {
  font-size: var(--text-xl);
  font-weight: 700;
}

.result-body {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  margin-bottom: 24px;
  line-height: 1.8;
  font-size: var(--text-sm);
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  font-family: inherit;
}

.action-btn.primary {
  background: var(--accent);
  color: #fff;
  border: none;
}

.action-btn.primary:hover {
  opacity: 0.9;
}

.action-btn.secondary {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.action-btn.secondary:hover {
  border-color: var(--border-focus);
  background: var(--bg-hover);
}

.action-btn.ghost {
  background: none;
  border: 1px solid transparent;
  color: var(--text-muted);
}

.action-btn.ghost:hover {
  border-color: var(--border);
  color: var(--text-primary);
}
</style>
