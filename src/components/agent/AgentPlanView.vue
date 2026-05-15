<template>
  <div class="plan-view">
    <div class="plan-header">
      <div class="plan-spinner"></div>
      <div>
        <h3>正在分析目标，生成执行计划...</h3>
        <p class="plan-subtitle">AI 正在将你的目标拆解为有序步骤</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.plan-view {
  max-width: 560px;
  margin: 40px auto;
  padding: 0 20px;
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.plan-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.plan-header h3 {
  font-size: var(--text-base);
  font-weight: 600;
  margin-bottom: 4px;
}

.plan-subtitle {
  font-size: var(--text-sm);
  color: var(--text-muted);
}
</style>
