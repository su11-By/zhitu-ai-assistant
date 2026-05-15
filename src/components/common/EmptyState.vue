<template>
  <div class="empty-state">
    <div class="empty-icon" v-if="icon" v-html="icon"></div>
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '' },
  title: { type: String, default: '暂无内容' },
  description: { type: String, default: '' }
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--text-muted);
}

.empty-icon :deep(svg) { width: 24px; height: 24px; }

.empty-state h3 { font-size: 17px; margin-bottom: 6px; }
.empty-state p { font-size: 13px; color: var(--text-muted); max-width: 320px; line-height: 1.6; }
</style>
