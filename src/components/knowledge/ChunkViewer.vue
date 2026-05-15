<template>
  <div class="chunk-viewer">
    <div class="chunk-header">
      <h3>文档分块 <span>({{ chunks.length }} 块)</span></h3>
    </div>

    <div class="chunk-list">
      <div v-for="chunk in chunks" :key="chunk.chunkId" class="chunk-card">
        <div class="chunk-index">#{{ chunk.chunkIndex + 1 }}</div>
        <div class="chunk-body">
          <p>{{ chunk.text }}</p>
          <div class="chunk-footer">
            <span>{{ chunk.charCount }} 字符</span>
            <span v-if="chunk.score !== undefined" class="chunk-score">
              相似度 {{ (chunk.score * 100).toFixed(0) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <EmptyState v-if="!chunks.length" title="暂无分块数据" description="上传文档后自动分块" />
  </div>
</template>

<script setup>
import EmptyState from '../common/EmptyState.vue'

defineProps({
  chunks: { type: Array, default: () => [] }
})
</script>

<style scoped>
.chunk-viewer { padding: 16px; }
.chunk-header { margin-bottom: 14px; }
.chunk-header h3 { font-size: 14px; color: var(--text-secondary); }
.chunk-header span { font-weight: 400; color: var(--text-muted); }

.chunk-list { display: flex; flex-direction: column; gap: 10px; }

.chunk-card { display: flex; gap: 12px; padding: 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); }

.chunk-index { width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--bg-hover); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }

.chunk-body { flex: 1; min-width: 0; }
.chunk-body p { font-size: 13px; line-height: 1.7; color: var(--text-secondary); }

.chunk-footer { display: flex; gap: 12px; margin-top: 8px; }
.chunk-footer span { font-size: 11px; color: var(--text-muted); }
.chunk-score { color: var(--success) !important; }
</style>
