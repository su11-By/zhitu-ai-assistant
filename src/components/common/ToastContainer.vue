<template>
  <Teleport to="body">
    <!-- Toast stack -->
    <div class="toast-stack" aria-live="polite">
      <transition-group name="toast" tag="div" class="toast-wrapper">
        <div
          v-for="t in store.toasts"
          :key="t.id"
          class="toast-item"
          :class="t.type"
          @click="store.remove(t.id)"
        >
          <div class="toast-icon">
            <svg v-if="t.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <svg v-else-if="t.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <svg v-else-if="t.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <span class="toast-msg">{{ t.message }}</span>
        </div>
      </transition-group>
    </div>

    <!-- Confirm dialog -->
    <transition name="modal">
      <div v-if="store.confirmState" class="confirm-overlay" @click.self="store.confirmState.onCancel()">
        <div class="confirm-card">
          <h3>{{ store.confirmState.title }}</h3>
          <p>{{ store.confirmState.message }}</p>
          <div class="confirm-actions">
            <button class="c-btn cancel" @click="store.confirmState.onCancel()">
              {{ store.confirmState.cancelText }}
            </button>
            <button
              class="c-btn"
              :class="store.confirmState.variant"
              @click="store.confirmState.onConfirm()"
            >
              {{ store.confirmState.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { useToastStore } from '../../stores/toast.js'

const store = useToastStore()
</script>

<style scoped>
/* Toast stack */
.toast-stack {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

.toast-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  pointer-events: auto;
  min-width: 280px;
  max-width: 420px;
  transition: all var(--duration-fast) var(--ease-out);
}

.toast-item:hover {
  box-shadow: var(--shadow-xl);
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-icon svg {
  width: 100%;
  height: 100%;
}

.toast-item.success .toast-icon { color: var(--success); }
.toast-item.error .toast-icon { color: var(--error); }
.toast-item.warning .toast-icon { color: var(--warning); }
.toast-item.info .toast-icon { color: var(--accent); }

.toast-msg {
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: 1.4;
}

/* Toast animations */
.toast-enter-active {
  transition: all 0.3s var(--ease-out);
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

/* Confirm dialog */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.confirm-card {
  width: 380px;
  max-width: 90vw;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 28px;
  box-shadow: var(--shadow-xl);
}

.confirm-card h3 {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: 8px;
}

.confirm-card p {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.c-btn {
  padding: 9px 20px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  border: 1px solid var(--border);
}

.c-btn.cancel {
  background: transparent;
  color: var(--text-secondary);
}

.c-btn.cancel:hover {
  background: var(--bg-hover);
}

.c-btn.danger {
  background: var(--error);
  border-color: transparent;
  color: white;
}

.c-btn.danger:hover {
  opacity: 0.9;
}

.c-btn.primary {
  background: var(--accent);
  border-color: transparent;
  color: white;
}

.c-btn.primary:hover {
  opacity: 0.9;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .confirm-card {
  transform: scale(0.96);
}
</style>
