<template>
  <div class="debate-setup">
    <div class="setup-card">
      <h2 class="setup-title">配置辩论</h2>

      <!-- Presets -->
      <div class="setup-section">
        <label class="setup-label">快速预设</label>
        <div class="preset-grid">
          <button
            v-for="p in presets"
            :key="p.id"
            class="preset-card"
            :class="{ active: activePreset === p.id }"
            @click="selectPreset(p)"
          >
            <span class="preset-icon">{{ p.icon }}</span>
            <div class="preset-info">
              <strong>{{ p.name }}</strong>
              <span>{{ p.desc }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Topic -->
      <div class="setup-section">
        <label class="setup-label">辩论主题</label>
        <textarea
          v-model="localTopic"
          class="topic-input"
          placeholder="输入你想要辩论的主题，例如：人工智能是否会取代人类工作？"
          rows="3"
        ></textarea>
      </div>

      <!-- Agents -->
      <div class="setup-section">
        <label class="setup-label">
          参与角色
          <span class="label-hint">（至少选择 2 个）</span>
        </label>
        <div class="agent-grid">
          <button
            v-for="agent in availableAgents"
            :key="agent.id"
            class="agent-chip"
            :class="{ selected: selectedIds.has(agent.id) }"
            :style="selectedIds.has(agent.id) ? { '--chip-color': agent.color } : {}"
            @click="toggleAgent(agent)"
          >
            <span class="agent-chip-icon">{{ agent.icon }}</span>
            <span class="agent-chip-name">{{ agent.name }}</span>
            <span class="agent-chip-role">{{ agent.role }}</span>
          </button>
        </div>
      </div>

      <!-- Rounds -->
      <div class="setup-section">
        <label class="setup-label">辩论轮次：<strong>{{ localRounds }}</strong> 轮</label>
        <input
          type="range"
          v-model.number="localRounds"
          min="2"
          max="5"
          class="rounds-slider"
        />
        <div class="round-labels-preview">
          <span v-for="(label, i) in computedRoundLabels" :key="i" class="round-label-chip">
            R{{ i + 1 }}: {{ label }}
          </span>
        </div>
      </div>

      <!-- Start -->
      <button
        class="start-btn"
        :disabled="!canStart"
        @click="$emit('start', { topic: localTopic, agents: selectedAgents, rounds: localRounds, roundLabels: computedRoundLabels })"
      >
        开始辩论 ⚡
      </button>
      <p v-if="!canStart" class="start-hint">请填写主题并选择至少 2 个角色</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { DEBATE_AGENTS, DEBATE_PRESETS } from '../../services/debateService.js'

const props = defineProps({
  topic: { type: String, default: '' },
  agents: { type: Array, default: () => [] },
  rounds: { type: Number, default: 3 },
  roundLabels: { type: Array, default: () => [] }
})

const emit = defineEmits(['start'])

const presets = DEBATE_PRESETS

const localTopic = ref(props.topic)
const selectedIds = ref(new Set(props.agents.map(a => a.id)))
const localRounds = ref(props.rounds || 3)
const activePreset = ref('')

const availableAgents = DEBATE_AGENTS.filter(a => a.id !== 'host')

const selectedAgents = computed(() =>
  DEBATE_AGENTS.filter(a => selectedIds.value.has(a.id))
)

const canStart = computed(() =>
  localTopic.value.trim().length > 0 && selectedIds.value.size >= 2
)

const defaultRoundLabels = ['开篇立论', '自由辩论', '深入交锋', '补充观点', '总结陈词']

const computedRoundLabels = computed(() => {
  if (localRounds.value === 3) return ['开篇立论', '自由辩论', '总结陈词']
  if (localRounds.value === 2) return ['观点阐述', '深入讨论']
  return defaultRoundLabels.slice(0, localRounds.value)
})

function selectPreset(preset) {
  activePreset.value = preset.id
  selectedIds.value = new Set(preset.agentIds)
  localRounds.value = preset.rounds
}

function toggleAgent(agent) {
  const next = new Set(selectedIds.value)
  if (next.has(agent.id)) {
    if (next.size > 2) next.delete(agent.id)
  } else {
    next.add(agent.id)
  }
  selectedIds.value = next
  if (activePreset.value) activePreset.value = ''
}
</script>

<style scoped>
.debate-setup {
  max-width: 640px;
  margin: 0 auto;
  padding: 40px 20px;
}

.setup-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 32px;
}

.setup-title {
  font-size: var(--text-xl);
  font-weight: 700;
  margin-bottom: 28px;
  text-align: center;
}

.setup-section {
  margin-bottom: 24px;
}

.setup-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.label-hint {
  font-weight: 400;
  color: var(--text-muted);
  font-size: var(--text-xs);
}

/* Presets */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.preset-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  text-align: left;
  font-family: inherit;
}

.preset-card:hover {
  border-color: var(--border-focus);
}

.preset-card.active {
  border-color: var(--accent);
  background: var(--accent-ghost);
}

.preset-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.preset-info strong {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.preset-info span {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Topic */
.topic-input {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  resize: vertical;
  transition: border var(--duration-fast) var(--ease-out);
}

.topic-input:focus {
  outline: none;
  border-color: var(--accent);
}

/* Agents */
.agent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.agent-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  font-family: inherit;
}

.agent-chip:hover {
  border-color: var(--border-focus);
}

.agent-chip.selected {
  border-color: var(--chip-color, var(--accent));
  background: color-mix(in srgb, var(--chip-color, var(--accent)) 12%, transparent);
}

.agent-chip-icon {
  font-size: 16px;
}

.agent-chip-name {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-primary);
}

.agent-chip-role {
  font-size: 10px;
  color: var(--text-muted);
  margin-left: auto;
}

/* Rounds */
.rounds-slider {
  width: 100%;
  accent-color: var(--accent);
  margin-bottom: 10px;
}

.round-labels-preview {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.round-label-chip {
  font-size: 11px;
  padding: 3px 10px;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  color: var(--text-muted);
}

/* Start */
.start-btn {
  display: block;
  width: 100%;
  padding: 14px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  margin-top: 8px;
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

.start-hint {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 8px;
}

@media (max-width: 600px) {
  .preset-grid,
  .agent-grid {
    grid-template-columns: 1fr;
  }
  .setup-card {
    padding: 20px;
  }
}
</style>
