<template>
  <div class="execution">
    <!-- Progress bar -->
    <div class="exec-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: store.progress + '%' }"></div>
      </div>
      <span class="progress-text">{{ store.progress }}%</span>
    </div>

    <!-- Steps -->
    <div class="step-list">
      <div
        v-for="(step, i) in store.steps"
        :key="i"
        class="step-card"
        :class="{
          active: step.isExecuting,
          completed: step.output && !step.isExecuting,
          failed: step.output && !step.success,
          pending: !step.output && !step.isExecuting
        }"
      >
        <div class="step-left">
          <div class="step-indicator">
            <span v-if="step.isExecuting" class="indicator-spin"></span>
            <span v-else-if="step.output && step.success" class="indicator-check">✓</span>
            <span v-else-if="step.output && !step.success" class="indicator-fail">✗</span>
            <span v-else class="indicator-num">{{ i + 1 }}</span>
          </div>
          <div v-if="i < store.steps.length - 1" class="step-line" :class="{ done: step.output }"></div>
        </div>
        <div class="step-body">
          <div class="step-header">
            <span class="step-icon">{{ step.toolIcon }}</span>
            <strong class="step-name">{{ step.toolName }}</strong>
            <span v-if="step.isExecuting" class="step-badge running">执行中</span>
            <span v-else-if="step.output && step.success" class="step-badge done">完成</span>
            <span v-else-if="step.output && !step.success" class="step-badge fail">失败</span>
          </div>
          <p class="step-desc">{{ step.description }}</p>

          <!-- Output preview for completed steps -->
          <div v-if="step.output" class="step-output">
            <div class="output-header" @click="toggleExpand(i)">
              <span>{{ expanded.has(i) ? '收起结果' : '查看结果' }}</span>
              <span class="expand-arrow" :class="{ open: expanded.has(i) }">▾</span>
            </div>
            <div v-if="expanded.has(i)" class="output-body">
              <MarkdownRenderer :content="step.output.slice(0, 2000)" />
              <p v-if="step.output.length > 2000" class="output-truncated">
                ... 结果过长，已截断显示
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Synthesis indicator -->
    <div v-if="store.isSynthesizing" class="synthesis-bar">
      <div class="plan-spinner"></div>
      <span>正在综合所有步骤结果，生成最终输出...</span>
    </div>

    <!-- Stop button -->
    <div v-if="store.isRunning" class="stop-area">
      <button class="stop-btn" @click="store.stopAgent()">⏹ 停止执行</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAgentStore } from '../../stores/agent.js'
import MarkdownRenderer from '../common/MarkdownRenderer.vue'

const store = useAgentStore()
const expanded = ref(new Set())

function toggleExpand(i) {
  const next = new Set(expanded.value)
  if (next.has(i)) next.delete(i)
  else next.add(i)
  expanded.value = next
}
</script>

<style scoped>
.execution {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 20px;
}

/* Progress */
.exec-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-input);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.5s var(--ease-out);
}

.progress-text {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--accent);
  width: 36px;
  text-align: right;
}

/* Steps */
.step-list {
  position: relative;
}

.step-card {
  display: flex;
  gap: 14px;
  padding-bottom: 20px;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.step-card.active,
.step-card.completed {
  opacity: 1;
}

.step-card.failed {
  opacity: 0.8;
}

.step-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 28px;
}

.step-indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--bg-root);
  z-index: 1;
  transition: all 0.3s;
}

.step-card.active .step-indicator {
  border-color: var(--accent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 30%, transparent);
}

.step-card.completed .step-indicator {
  border-color: var(--success);
  background: var(--success);
  color: #fff;
}

.step-card.failed .step-indicator {
  border-color: var(--error);
  background: var(--error);
  color: #fff;
}

.indicator-spin {
  width: 12px;
  height: 12px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.indicator-check {
  font-size: 14px;
}

.step-line {
  flex: 1;
  width: 2px;
  background: var(--border);
  margin-top: 4px;
  transition: background 0.3s;
}

.step-line.done {
  background: var(--success);
}

/* Step body */
.step-body {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.step-icon {
  font-size: 18px;
}

.step-name {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.step-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.step-badge.running {
  background: rgba(59, 130, 246, 0.12);
  color: var(--accent);
  animation: pulse-bg 1s infinite;
}

@keyframes pulse-bg {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.step-badge.done {
  background: rgba(16, 185, 129, 0.12);
  color: var(--success);
}

.step-badge.fail {
  background: rgba(239, 68, 68, 0.12);
  color: var(--error);
}

.step-desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-bottom: 6px;
}

/* Output */
.step-output {
  margin-top: 8px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--duration-fast);
}

.output-header:hover {
  background: var(--bg-hover);
}

.expand-arrow {
  transition: transform 0.2s;
}

.expand-arrow.open {
  transform: rotate(180deg);
}

.output-body {
  padding: 12px;
  border-top: 1px solid var(--border);
  font-size: var(--text-xs);
  line-height: 1.6;
  max-height: 300px;
  overflow-y: auto;
}

.output-truncated {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 8px;
}

/* Synthesis */
.synthesis-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: 20px;
}

.plan-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

/* Stop */
.stop-area {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.stop-btn {
  padding: 8px 24px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid var(--error);
  border-radius: var(--radius-full);
  color: var(--error);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--duration-fast);
}

.stop-btn:hover {
  background: var(--error);
  color: #fff;
}
</style>
