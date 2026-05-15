<template>
  <div class="agent-input">
    <div class="input-card">
      <div class="input-icon">🤖</div>
      <h2>AI 自主工作流</h2>
      <p class="input-desc">
        描述一个复杂目标，AI 会自动拆解为执行步骤，依次调用搜索、总结、创作等工具，最终输出完整成果。
      </p>

      <!-- Templates -->
      <div class="templates-section">
        <span class="templates-label">试试这些：</span>
        <div class="template-chips">
          <button
            v-for="tpl in templates"
            :key="tpl.id"
            class="tpl-chip"
            :class="{ active: activeTemplate === tpl.id }"
            @click="selectTemplate(tpl)"
          >
            <span>{{ tpl.icon }}</span>
            <span>{{ tpl.label }}</span>
          </button>
        </div>
      </div>

      <!-- Goal input -->
      <textarea
        v-model="localGoal"
        class="goal-input"
        :placeholder="activeTemplate ? templates.find(t => t.id === activeTemplate)?.placeholder : '输入你的目标，例如：帮我研究人工智能在医疗领域的应用，写一份分析报告并出10道考题'"
        rows="4"
        @input="activeTemplate = ''"
      ></textarea>

      <button class="start-btn" :disabled="!localGoal.trim()" @click="$emit('start', localGoal)">
        <span>🚀</span>
        <span>开始执行</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['start'])

const localGoal = ref('')
const activeTemplate = ref('')

const templates = [
  {
    id: 'research',
    label: '研究报告',
    icon: '📊',
    placeholder: '帮我研究__________的现状和趋势，写一份研究报告'
  },
  {
    id: 'exam',
    label: '出考题',
    icon: '❓',
    placeholder: '根据__________的知识点，生成10道考试题目'
  },
  {
    id: 'prd',
    label: 'PRD文档',
    icon: '📋',
    placeholder: '为__________功能写一份产品需求文档（PRD）'
  },
  {
    id: 'outline',
    label: '学习提纲',
    icon: '📝',
    placeholder: '帮我整理__________的学习提纲，标注重点难点'
  },
  {
    id: 'brainstorm',
    label: '头脑风暴',
    icon: '💡',
    placeholder: '针对__________，帮我进行一次头脑风暴'
  },
  {
    id: 'translate',
    label: '翻译整理',
    icon: '🔤',
    placeholder: '搜索并翻译关于__________的英文资料，整理成中文摘要'
  }
]

function selectTemplate(tpl) {
  activeTemplate.value = tpl.id
  localGoal.value = tpl.placeholder
}
</script>

<style scoped>
.agent-input {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 20px;
}

.input-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 36px 32px;
  text-align: center;
}

.input-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.input-card h2 {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: 8px;
}

.input-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 480px;
  margin: 0 auto 24px;
}

.templates-section {
  margin-bottom: 20px;
}

.templates-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  display: block;
  margin-bottom: 10px;
}

.template-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.tpl-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  font-family: inherit;
}

.tpl-chip:hover {
  border-color: var(--border-focus);
  color: var(--text-primary);
}

.tpl-chip.active {
  border-color: var(--accent);
  background: var(--accent-ghost);
  color: var(--accent);
}

.goal-input {
  width: 100%;
  padding: 14px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  resize: vertical;
  transition: border var(--duration-fast) var(--ease-out);
  margin-bottom: 20px;
}

.goal-input:focus {
  outline: none;
  border-color: var(--accent);
}

.start-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 36px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  font-family: inherit;
}

.start-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.start-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
