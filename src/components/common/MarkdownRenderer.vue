<template>
  <div class="markdown-body" v-html="rendered"></div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
  breaks: true,
  gfm: true
})

const props = defineProps({
  content: { type: String, default: '' }
})

const rendered = ref('')
let timer = null

function renderMarkdown(text) {
  if (!text) return ''
  try {
    const html = marked.parse(text)
    return DOMPurify.sanitize(html)
  } catch {
    return DOMPurify.sanitize(text.replace(/\n/g, '<br>'))
  }
}

watch(
  () => props.content,
  (val) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      rendered.value = renderMarkdown(val)
    }, 80)
  },
  { immediate: true }
)

onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.markdown-body {
  line-height: 1.8;
  color: var(--text-primary);
  word-break: break-word;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
  margin: 16px 0 8px;
  font-weight: 700;
}

.markdown-body h1 { font-size: 1.5em; }
.markdown-body h2 { font-size: 1.3em; }
.markdown-body h3 { font-size: 1.15em; }
.markdown-body h4 { font-size: 1.05em; }

.markdown-body p { margin: 8px 0; }

.markdown-body ul, .markdown-body ol {
  padding-left: 20px;
  margin: 8px 0;
}

.markdown-body li { margin: 4px 0; }

.markdown-body code {
  background: var(--bg-input);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.9em;
}

.markdown-body pre {
  background: var(--bg-input);
  padding: 14px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 12px 0;
}

.markdown-body pre code {
  background: none;
  padding: 0;
}

.markdown-body blockquote {
  border-left: 3px solid var(--accent);
  padding: 8px 16px;
  margin: 12px 0;
  background: var(--bg-hover);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--text-secondary);
}

.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}

.markdown-body th, .markdown-body td {
  padding: 8px 12px;
  border: 1px solid var(--border);
  text-align: left;
}

.markdown-body th {
  background: var(--bg-input);
  font-weight: 600;
}

.markdown-body hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 16px 0;
}
</style>
