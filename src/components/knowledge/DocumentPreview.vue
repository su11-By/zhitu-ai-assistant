<template>
  <div class="doc-preview">
    <div class="preview-header">
      <h3>文档预览</h3>
      <button class="close-btn" @click="$emit('close')">&times;</button>
    </div>

    <div v-if="!document" class="empty-hint">
      <p>选择文档进行预览</p>
    </div>

    <div v-else class="preview-body">
      <div class="doc-meta">
        <span class="format-badge">{{ document.formatLabel }}</span>
        <strong>{{ document.title }}</strong>
        <span class="meta-text">{{ document.chunkCount }} 个分块 · {{ formatSize(document.fileSize) }}</span>
      </div>

      <div class="preview-text">
        <pre>{{ previewText }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  document: { type: Object, default: null }
})

defineEmits(['close'])

const previewText = ref('')

watch(
  () => props.document,
  (doc) => {
    if (doc?.rawText) {
      previewText.value = doc.rawText.slice(0, 10000)
    } else {
      previewText.value = ''
    }
  },
  { immediate: true }
)

function formatSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.doc-preview { display: flex; flex-direction: column; height: 100%; }

.preview-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid var(--border);
}

.preview-header h3 { font-size: 14px; }
.close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }

.preview-body { flex: 1; overflow-y: auto; }

.doc-meta {
  display: flex; flex-direction: column; gap: 6px; padding: 16px;
  border-bottom: 1px solid var(--border);
}

.format-badge {
  display: inline-block; padding: 3px 10px; border-radius: 999px;
  background: var(--bg-hover); color: var(--text-secondary);
  font-size: 11px; font-weight: 600; width: fit-content;
}

.doc-meta strong { font-size: 15px; }

.meta-text { font-size: 12px; color: var(--text-muted); }

.preview-text { padding: 16px; }
.preview-text pre {
  font-size: 13px; line-height: 1.8; white-space: pre-wrap; word-break: break-word;
  color: var(--text-secondary); font-family: var(--font);
}

.empty-hint { padding: 32px 16px; text-align: center; }
.empty-hint p { font-size: 13px; color: var(--text-muted); }
</style>
