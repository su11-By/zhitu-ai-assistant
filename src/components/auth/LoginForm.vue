<template>
  <form class="auth-form" @submit.prevent="handleLogin">
    <div class="form-group">
      <label>用户名</label>
      <input v-model="username" type="text" placeholder="输入用户名" autocomplete="username" />
    </div>
    <div class="form-group">
      <label>密码</label>
      <input v-model="password" type="password" placeholder="输入密码" autocomplete="current-password" />
    </div>
    <p v-if="error" class="error-msg">{{ error }}</p>
    <button type="submit" class="submit-btn" :disabled="loading">
      {{ loading ? '登录中...' : '登录' }}
    </button>
    <p class="switch-text">
      还没有账号？<button type="button" class="link-btn" @click="$emit('switch')">去注册</button>
    </p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'

const emit = defineEmits(['switch', 'done'])
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  if (!username.value.trim() || !password.value.trim()) {
    error.value = '请填写用户名和密码'
    return
  }
  loading.value = true
  try {
    await auth.login(username.value.trim(), password.value)
    emit('done')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.form-group input {
  padding: 10px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-ghost);
}

.submit-btn {
  padding: 12px;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-msg {
  font-size: var(--text-sm);
  color: var(--error);
  padding: 8px 12px;
  background: rgba(220, 38, 38, 0.06);
  border-radius: var(--radius-sm);
}

.switch-text {
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-align: center;
}

.link-btn {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
}

.link-btn:hover {
  text-decoration: underline;
}
</style>
