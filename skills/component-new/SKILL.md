---
name: component-new
description: "Scaffold a new Vue 3 component following project conventions. Use when adding a new component. Triggers on: new component, create component, 新建组件, scaffold component, 添加一个xx组件."
user-invocable: true
---

# Vue Component Scaffolder

Quickly scaffold new Vue 3 components that follow this project's conventions.

---

## The Job

1. Ask the user what component they need (name, purpose, which directory)
2. Generate the `.vue` file with proper structure
3. If needed, create the corresponding store, service, or route entry
4. Register the route if it's a new page

---

## Project Conventions (Must Follow)

### Tech Stack
- Vue 3 + Composition API + `<script setup>`
- Pinia for state management (`defineStore` with setup function style)
- Vue Router with `createWebHashHistory` and lazy-loaded routes
- CSS variables from `src/styles/variables.css` (use `var(--xxx)`, never hardcode colors)
- Scoped styles by default

### Directory Structure
```
src/
├── components/
│   ├── common/          # Shared UI: LoadingSpinner, EmptyState, ConfirmDialog, MarkdownRenderer
│   ├── chat/            # Chat-related: ChatWindow, ChatMessage, ChatInput, ChatSessionList
│   ├── knowledge/       # Knowledge base: KbDetail, DocumentPreview, KnowledgeBaseList, ChunkViewer, SearchResult
│   ├── creation/        # Content creation: CreationPanel
│   ├── auth/            # Auth forms: LoginForm, RegisterForm
│   ├── user/            # User profile: PersonalCenter, StorageUsage
│   └── layout/          # Layout shell: AppLayout, TopBar, SideNav
├── stores/              # Pinia stores: chat.js, knowledge.js, auth.js, settings.js, creation.js, vector.js
├── services/            # API & business logic: api.js, chatService.js, ragService.js, etc.
├── router/              # index.js (single file, lazy-loaded routes)
├── styles/              # variables.css, base.css
└── utils/               # tokenizer.js, cosineSimilarity.js, constants.js
```

### Component Template
```vue
<template>
  <div class="component-name">
    <!-- template here -->
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  // ...
})

// Emits
const emit = defineEmits([
  // ...
])

// State & logic here
</script>

<style scoped>
.component-name {
  /* styles using var(--xxx) */
}
</style>
```

### CSS Variables Reference
```css
/* Colors */
--primary          /* Main brand color */
--primary-hover
--primary-light
--bg-main          /* Page background */
--bg-card          /* Card/panel background */
--bg-input         /* Input field background */
--bg-hover         /* Hover state background */
--border           /* Border color */
--text-primary     /* Main text */
--text-secondary   /* Secondary text */
--text-muted       /* Muted/placeholder text */
--error            /* Error/danger color */
--success          /* Success color */
--warning          /* Warning color */

/* Radius */
--radius-sm, --radius-md, --radius-lg, --radius-xl

/* Shadows */
--shadow-sm, --shadow-md, --shadow-lg
```

### Code Patterns

**Props with defaults:**
```js
const props = defineProps({
  title: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  items: { type: Array, default: () => [] }
})
```

**Emits (kebab-case for template, camelCase in script):**
```js
const emit = defineEmits(['update:modelValue', 'submit', 'close'])
```

**v-model binding (standard Vue 3 pattern):**
```vue
<script setup>
const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
</script>
```

**If you need a store**, compose from existing stores rather than creating new ones. Only create a new store when the state domain is truly new.

**If you need an API call**, add to `src/services/api.js` or create a new service file.

---

## Step-by-Step

### Step 1: Clarify

Ask these questions (with suggested answers based on context):

1. **Component name?** (PascalCase, e.g., `SearchResult`, `ExportButton`)
2. **Which directory?** under `src/components/` (common / chat / knowledge / creation / auth / user / layout)
3. **Is it a new page?** If yes → need route entry; if no → embedded in existing page
4. **Does it need props?** What data does the parent pass in?
5. **Does it emit events?** What user actions bubble up?
6. **Does it manage its own state, or delegate to a store?**

### Step 2: Generate Component

Create the `.vue` file with:
- Proper scoped template
- All props with types and defaults
- All emits declared
- Internal state if needed (ref/reactive)
- Scoped styles using CSS variables

### Step 3: Wire Up (if applicable)

- **New page?** Add route in `src/router/index.js` with lazy import
- **New store?** Create in `src/stores/` and register in the component
- **New API call?** Add to appropriate service file
- **Reused component?** No extra wiring needed

### Step 4: Verify

- Component name matches filename
- Props have types and defaults
- Emits are declared
- Styles are scoped and use CSS variables
- Route added if it's a page

---

## Example

**Request:** "添加一个导出按钮组件，点击后导出当前对话为 Markdown"

**Generated:** `src/components/chat/ExportButton.vue`

```vue
<template>
  <button
    class="export-btn"
    :disabled="disabled || exporting"
    @click="handleExport"
  >
    <span v-if="exporting" class="spinner"></span>
    <span>{{ exporting ? '导出中...' : '导出 Markdown' }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  messages: { type: Array, required: true },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['exported', 'error'])

const exporting = ref(false)

function messagesToMarkdown(messages) {
  return messages.map(m => {
    const role = m.role === 'user' ? '## 用户' : '## 助手'
    return `${role}\n\n${m.content}\n`
  }).join('\n---\n')
}

function downloadMarkdown(content) {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chat-export-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
}

async function handleExport() {
  if (exporting.value) return
  exporting.value = true
  try {
    const md = messagesToMarkdown(props.messages)
    downloadMarkdown(md)
    emit('exported')
  } catch (e) {
    emit('error', e.message)
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.export-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary); font-size: 13px; cursor: pointer;
  transition: background 0.2s;
}
.export-btn:hover:not(:disabled) { background: var(--bg-hover); }
.export-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid var(--border); border-top-color: var(--primary);
  border-radius: 50%; animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
```

---

## Checklist

- [ ] Component name is PascalCase and matches filename
- [ ] Placed in correct subdirectory under `src/components/`
- [ ] Uses `<script setup>` and Composition API
- [ ] All props have types and defaults
- [ ] All emits are declared
- [ ] Styles are scoped
- [ ] Uses CSS variables, not hardcoded colors
- [ ] Route added if it's a new page
- [ ] Follows existing component patterns in the project
