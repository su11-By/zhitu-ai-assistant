<template>
  <Teleport to="body">
    <div v-if="show" class="confirm-mask" @click.self="cancel">
      <div class="confirm-card">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="cancel">{{ cancelText }}</button>
          <button class="confirm-btn" :class="variant" @click="confirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '确定要执行此操作吗？' },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
  variant: { type: String, default: 'primary' } // 'primary' | 'danger'
})

const emit = defineEmits(['confirm', 'cancel'])

function confirm() { emit('confirm') }
function cancel() { emit('cancel') }
</script>

<style scoped>
.confirm-mask {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1100;
  backdrop-filter: blur(4px);
}

.confirm-card {
  width: 380px; max-width: 90vw;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 24px;
}

.confirm-card h3 { font-size: 17px; margin-bottom: 8px; }
.confirm-card p { font-size: 14px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.6; }

.confirm-actions { display: flex; justify-content: flex-end; gap: 10px; }

.cancel-btn, .confirm-btn {
  padding: 9px 20px; border-radius: var(--radius-md);
  font-size: 14px; cursor: pointer;
}

.cancel-btn {
  background: var(--bg-input); border: 1px solid var(--border);
  color: var(--text-secondary);
}

.confirm-btn.primary { background: var(--accent); border: none; color: white; }
.confirm-btn.danger { background: var(--error); border: none; color: white; }
</style>
