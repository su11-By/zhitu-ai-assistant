<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <span class="logo-text">智途 AI</span>
    </div>

    <div class="header-center">
      <span class="page-title">{{ pageTitle }}</span>
    </div>

    <div class="header-right">
      <button class="header-btn" :title="themeLabel" @click="settings.toggleTheme()">
        <svg v-if="settings.theme === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      </button>

      <button v-if="!auth.isLoggedIn" class="auth-btn" @click="$emit('open-auth')">
        登录
      </button>

      <div v-else class="user-trigger" @click="showMenu = !showMenu">
        <div class="user-avatar">{{ auth.userName.charAt(0) }}</div>
        <span class="user-name">{{ auth.userName }}</span>
      </div>

      <Teleport to="body">
        <div v-if="showMenu" class="menu-backdrop" @click="showMenu = false" />
        <div v-if="showMenu" class="user-menu" @click.stop>
          <div class="menu-header">
            <div class="menu-avatar">{{ auth.userName.charAt(0) }}</div>
            <div>
              <div class="menu-name">{{ auth.userName }}</div>
              <div class="menu-role">{{ auth.isGuest ? '游客' : '用户' }}</div>
            </div>
          </div>
          <div class="menu-divider" />
          <button class="menu-item" @click="goProfile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            个人中心
          </button>
          <button class="menu-item danger" @click="handleLogout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            退出登录
          </button>
        </div>
      </Teleport>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from '../../stores/settings.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToastStore } from '../../stores/toast.js'

defineEmits(['open-auth'])

const route = useRoute()
const router = useRouter()
const settings = useSettingsStore()
const auth = useAuthStore()
const toast = useToastStore()
const showMenu = ref(false)

const themeLabel = computed(() => (settings.theme === 'dark' ? '切换到浅色' : '切换到深色'))
const pageTitle = computed(() => route.meta?.title || '')

function goProfile() {
  showMenu.value = false
  router.push('/profile')
}

function handleLogout() {
  auth.logout()
  showMenu.value = false
  toast.info('已退出登录')
}
</script>

<style scoped>
.app-header {
  height: var(--topbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: var(--sidebar-width);
  padding-right: 12px;
}

.logo {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 6px;
}

.logo svg {
  width: 100%;
  height: 100%;
}

.logo-text {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.header-center {
  flex: 1;
  text-align: center;
}

.page-title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: var(--sidebar-width);
  justify-content: flex-end;
}

.header-btn {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}

.header-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-focus);
}

.header-btn svg {
  width: 17px;
  height: 17px;
}

.auth-btn {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  background: var(--text-primary);
  color: var(--text-inverse);
  border: none;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.auth-btn:hover {
  opacity: 0.85;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.user-trigger:hover {
  background: var(--bg-hover);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
}

.user-name {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.user-menu {
  position: fixed;
  top: 52px;
  right: 16px;
  width: 240px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 100;
  overflow: hidden;
  animation: menuIn var(--duration-normal) var(--ease-out);
}

@keyframes menuIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.menu-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.menu-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

.menu-role {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 2px;
}

.menu-divider {
  height: 1px;
  background: var(--border);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background var(--duration-fast);
}

.menu-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.menu-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.menu-item.danger {
  color: var(--error);
}

.menu-item.danger:hover {
  background: rgba(220, 38, 38, 0.06);
}
</style>
