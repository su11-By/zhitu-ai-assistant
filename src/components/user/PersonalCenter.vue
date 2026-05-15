<template>
  <div class="profile-page">
    <h2>个人中心</h2>

    <div class="profile-card">
      <div class="avatar-large">{{ auth.userName.charAt(0) }}</div>
      <div class="profile-info">
        <h3>{{ auth.userName }}</h3>
        <p>{{ auth.isGuest ? '游客模式' : '已登录用户' }}</p>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <strong>{{ kbCount }}</strong>
        <span>知识库</span>
      </div>
      <div class="stat-card">
        <strong>{{ docCount }}</strong>
        <span>文档数</span>
      </div>
      <div class="stat-card">
        <strong>{{ sessionCount }}</strong>
        <span>会话数</span>
      </div>
      <div class="stat-card">
        <strong>{{ storageUsed }}</strong>
        <span>已用存储</span>
      </div>
    </div>

    <div class="config-section">
      <h3 class="section-title">AI 参数配置</h3>

      <div class="config-card">
        <div class="config-row">
          <div class="config-info">
            <span class="config-label">LM Studio API Key</span>
            <span class="config-desc">如 LM Studio 开启了 API 认证，请在此填入 Key</span>
          </div>
          <input
            type="password"
            class="key-input"
            placeholder="留空则不发送认证头"
            :value="settings.lmStudioApiKey"
            @input="settings.lmStudioApiKey = $event.target.value"
          />
        </div>
      </div>

      <div class="config-card">
        <div class="config-row">
          <div class="config-info">
            <span class="config-label">温度 (Temperature)</span>
            <span class="config-desc">越高越有创意，越低越严谨</span>
          </div>
          <div class="config-control">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              :value="settings.aiConfig.temperature"
              @input="settings.updateAIConfig({ temperature: +$event.target.value })"
            />
            <span class="config-value">{{ settings.aiConfig.temperature }}</span>
          </div>
        </div>
      </div>

      <div class="config-card">
        <div class="config-row">
          <div class="config-info">
            <span class="config-label">最大输出 (Max Tokens)</span>
            <span class="config-desc">控制单次回复的最大长度</span>
          </div>
          <select
            :value="settings.aiConfig.maxTokens"
            @change="settings.updateAIConfig({ maxTokens: +$event.target.value })"
          >
            <option :value="512">512</option>
            <option :value="1024">1024</option>
            <option :value="2048">2048</option>
            <option :value="4096">4096</option>
          </select>
        </div>
      </div>

      <div class="config-card">
        <div class="config-row">
          <div class="config-info">
            <span class="config-label">上下文窗口</span>
            <span class="config-desc">控制多轮对话记忆长度</span>
          </div>
          <select
            :value="settings.aiConfig.contextWindow"
            @change="settings.updateAIConfig({ contextWindow: +$event.target.value })"
          >
            <option :value="2048">2048</option>
            <option :value="4096">4096</option>
            <option :value="6144">6144</option>
            <option :value="8192">8192</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useSettingsStore } from '../../stores/settings.js'
import { useChatStore } from '../../stores/chat.js'
import { useKnowledgeStore } from '../../stores/knowledge.js'
import { vectorStore } from '../../services/vectorStore.js'

const auth = useAuthStore()
const settings = useSettingsStore()
const chat = useChatStore()
const kb = useKnowledgeStore()

const kbCount = computed(() => kb.knowledgeBases.length)
const docCount = ref(0)
const sessionCount = computed(() => chat.sessions.length)
const storageUsed = ref('计算中...')

onMounted(async () => {
  try {
    const stats = await vectorStore.getStorageStats()
    docCount.value = stats.docCount
    const chunkCount = stats.chunkCount
    if (chunkCount > 1000) {
      storageUsed.value = (chunkCount / 1000).toFixed(1) + 'K 分块'
    } else if (chunkCount > 0) {
      storageUsed.value = chunkCount + ' 分块'
    } else {
      storageUsed.value = '0'
    }
  } catch {
    docCount.value = 0
    storageUsed.value = '0'
  }
})
</script>

<style scoped>
.profile-page {
  padding: 24px 32px;
  max-width: 720px;
  height: 100%;
  overflow-y: auto;
}

.profile-page h2 {
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  margin-bottom: 28px;
}

.avatar-large {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.profile-info h3 {
  font-size: var(--text-xl);
  font-weight: 700;
}

.profile-info p {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: 3px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

.stat-card {
  padding: 20px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: border-color var(--duration-fast);
}

.stat-card:hover {
  border-color: var(--border-focus);
}

.stat-card strong {
  display: block;
  font-size: 28px;
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.stat-card span {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 13px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  margin-bottom: 8px;
}

.config-card {
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color var(--duration-fast);
}

.config-card:hover {
  border-color: var(--border-focus);
}

.config-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.config-info {
  flex: 1;
  min-width: 0;
}

.config-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
}

.config-desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 2px;
  display: block;
}

.config-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-value {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--accent);
  min-width: 30px;
  text-align: center;
}

.config-row input[type="range"] {
  width: 140px;
  accent-color: var(--accent);
  height: 4px;
}

.config-row select {
  padding: 7px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--text-sm);
  cursor: pointer;
}

.config-row select:focus {
  outline: none;
  border-color: var(--accent);
}

.key-input {
  width: 240px;
  padding: 7px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: border-color var(--duration-fast);
}

.key-input:focus {
  outline: none;
  border-color: var(--accent);
}

.key-input::placeholder {
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
