<template>
  <div class="app-shell" :class="{ 'right-open': showRightPanel }">
    <TopBar @open-auth="showAuthModal = true" />

    <div class="app-body">
      <aside class="sidebar-left">
        <SideNav />
        <div class="sidebar-divider" />
        <div class="sidebar-content">
          <KnowledgeBaseList v-if="showKbList" />
          <ChatSessionList v-else-if="showChatList" />
          <slot name="left" />
        </div>
      </aside>

      <main class="main-area">
        <router-view v-slot="{ Component }">
          <transition name="view" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <aside v-if="showRightPanel" class="sidebar-right">
        <slot name="right" />
      </aside>
    </div>

    <Teleport to="body">
      <transition name="modal">
        <div v-if="showAuthModal" class="dialog-overlay" @click.self="showAuthModal = false">
          <div class="dialog-box">
            <div class="dialog-header">
              <h2>{{ authMode === 'login' ? '欢迎回来' : '创建账户' }}</h2>
              <p class="dialog-subtitle">
                {{ authMode === 'login' ? '登录以同步您的对话和数据' : '注册后即可使用全部功能' }}
              </p>
            </div>
            <LoginForm
              v-if="authMode === 'login'"
              @switch="authMode = 'register'"
              @done="onAuthDone"
            />
            <RegisterForm
              v-else
              @switch="authMode = 'login'"
              @done="onAuthDone"
            />
            <div class="guest-section">
              <span class="guest-divider-text">或</span>
              <button class="guest-login-btn" @click="loginAsGuestAndClose">游客模式使用</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { useToastStore } from '../../stores/toast.js'
import TopBar from './TopBar.vue'
import SideNav from './SideNav.vue'
import KnowledgeBaseList from '../knowledge/KnowledgeBaseList.vue'
import ChatSessionList from '../chat/ChatSessionList.vue'
import LoginForm from '../auth/LoginForm.vue'
import RegisterForm from '../auth/RegisterForm.vue'

const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()
const showAuthModal = ref(false)
const authMode = ref('login')
const showRightPanel = ref(false)

const showKbList = computed(() => route.path.startsWith('/knowledge'))
const showChatList = computed(() => route.path.startsWith('/chat'))

provide('showRightPanel', showRightPanel)

function onAuthDone() {
  showAuthModal.value = false
  authMode.value = 'login'
  toast.success('登录成功')
}

function loginAsGuestAndClose() {
  auth.loginAsGuest()
  showAuthModal.value = false
  toast.info('已进入游客模式')
}
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.sidebar-left {
  width: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  flex-shrink: 0;
}

.sidebar-divider {
  height: 1px;
  background: var(--border);
  margin: 0 12px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.main-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-root);
}

.sidebar-right {
  width: var(--right-panel-width);
  border-left: 1px solid var(--border);
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  flex-shrink: 0;
  overflow-y: auto;
}

/* Auth modal */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.dialog-box {
  width: 420px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-xl);
}

.dialog-header {
  text-align: center;
  margin-bottom: 28px;
}

.dialog-header h2 {
  font-size: var(--text-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.dialog-subtitle {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: 6px;
}

.guest-section {
  margin-top: 20px;
  text-align: center;
}

.guest-divider-text {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-bottom: 12px;
  position: relative;
}

.guest-divider-text::before,
.guest-divider-text::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 60px;
  height: 1px;
  background: var(--border);
}

.guest-divider-text::before {
  right: calc(50% + 20px);
}

.guest-divider-text::after {
  left: calc(50% + 20px);
}

.guest-login-btn {
  padding: 10px 28px;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.guest-login-btn:hover {
  border-color: var(--border-focus);
  color: var(--text-primary);
  background: var(--bg-input);
}

/* Page transitions */
.view-enter-active,
.view-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.view-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.view-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .dialog-box {
  transform: scale(0.96);
}

@media (max-width: 900px) {
  .sidebar-left { display: none; }
  .sidebar-right { display: none; }
}
</style>
