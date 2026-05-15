<template>
  <div class="storage-usage">
    <div class="usage-header">
      <h4>存储用量</h4>
      <span>{{ usedFormatted }} / {{ totalFormatted }}</span>
    </div>
    <div class="usage-bar">
      <div class="usage-fill" :style="{ width: percent + '%' }" :class="usageClass"></div>
    </div>
    <div class="usage-detail">
      <div class="detail-item">
        <span>文档</span><strong>{{ docCount }}</strong>
      </div>
      <div class="detail-item">
        <span>分块</span><strong>{{ chunkCount }}</strong>
      </div>
      <div class="detail-item">
        <span>会话</span><strong>{{ sessionCount }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  usedBytes: { type: Number, default: 0 },
  totalBytes: { type: Number, default: 50 * 1024 * 1024 },
  docCount: { type: Number, default: 0 },
  chunkCount: { type: Number, default: 0 },
  sessionCount: { type: Number, default: 0 }
})

const usedFormatted = computed(() => formatBytes(props.usedBytes))
const totalFormatted = computed(() => formatBytes(props.totalBytes))
const percent = computed(() => Math.min(100, (props.usedBytes / props.totalBytes) * 100))

const usageClass = computed(() => {
  if (percent.value > 90) return 'danger'
  if (percent.value > 70) return 'warning'
  return 'normal'
})

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.storage-usage {
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.usage-header h4 { font-size: 14px; }
.usage-header span { font-size: 12px; color: var(--text-muted); }

.usage-bar {
  height: 8px;
  background: var(--bg-input);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 14px;
}

.usage-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.usage-fill.normal { background: var(--accent); }
.usage-fill.warning { background: var(--warning); }
.usage-fill.danger { background: var(--error); }

.usage-detail {
  display: flex;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-item span { font-size: 11px; color: var(--text-muted); }
.detail-item strong { font-size: 18px; }
</style>
