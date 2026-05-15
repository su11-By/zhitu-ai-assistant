<template>
  <div class="search-result">
    <div class="result-header">
      <h3>搜索结果</h3>
      <span>{{ results.length }} 条匹配</span>
    </div>

    <div v-if="results.length" class="result-list">
      <div v-for="(item, i) in results" :key="i" class="result-item">
        <div class="result-top">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          <strong>{{ item.docTitle || item.title }}</strong>
          <span v-if="item.score !== undefined" class="score">{{ (item.score * 100).toFixed(0) }}%</span>
        </div>
        <p>{{ item.text?.slice(0, 200) || item.snippet }}</p>
      </div>
    </div>

    <EmptyState
      v-else
      title="暂无结果"
      description="知识库中没有匹配的内容"
    />

    <div v-if="loading" class="loading-hint">
      <LoadingSpinner text="搜索中..." inline />
    </div>
  </div>
</template>

<script setup>
import EmptyState from '../common/EmptyState.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'

defineProps({
  results: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})
</script>

<style scoped>
.search-result { padding: 16px; }
.result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.result-header h3 { font-size: 14px; }
.result-header span { font-size: 12px; color: var(--text-muted); }

.result-list { display: flex; flex-direction: column; gap: 8px; }
.result-item { padding: 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); }
.result-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.result-top strong { font-size: 13px; }
.score { font-size: 11px; color: var(--accent); font-weight: 600; margin-left: auto; }
.result-item p { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }

.loading-hint { margin-top: 12px; }
</style>
