import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { hashPassword, verifyPassword, createSalt } from '../utils/crypto.js'

function generateId() {
  return 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
}

function loadUsers() {
  try {
    const raw = JSON.parse(localStorage.getItem('app-users')) || []
    // Migrate old plaintext-password users
    const needsMigration = raw.some((u) => typeof u.password === 'string' && !u.salt)
    if (needsMigration) return []
    return raw
  } catch { return [] }
}

function saveUsers(users) {
  localStorage.setItem('app-users', JSON.stringify(users))
}

function loadCurrentUser() {
  try { return JSON.parse(localStorage.getItem('app-current-user')) || null } catch { return null }
}

function saveCurrentUser(user) {
  if (user) {
    localStorage.setItem('app-current-user', JSON.stringify(user))
  } else {
    localStorage.removeItem('app-current-user')
  }
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(loadCurrentUser())
  const isLoggedIn = computed(() => !!currentUser.value)
  const isGuest = computed(() => currentUser.value?.role === 'guest')
  const userName = computed(() => currentUser.value?.username || '游客')

  async function login(username, password) {
    const users = loadUsers()
    const found = users.find((u) => u.username === username)
    if (!found) throw new Error('用户名或密码错误')

    const valid = await verifyPassword(password, found.password, found.salt)
    if (!valid) throw new Error('用户名或密码错误')

    const session = { id: found.id, username: found.username, role: 'user', loginAt: Date.now() }
    currentUser.value = session
    saveCurrentUser(session)
    return session
  }

  async function register(username, password) {
    if (!username.trim() || !password.trim()) throw new Error('用户名和密码不能为空')
    if (username.trim().length < 2) throw new Error('用户名至少2个字符')
    if (password.length < 8) throw new Error('密码至少8个字符')
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new Error('密码需包含字母和数字')
    }

    const users = loadUsers()
    if (users.find((u) => u.username === username)) throw new Error('用户名已存在')

    const salt = createSalt()
    const hashed = await hashPassword(password, salt)

    const newUser = { id: generateId(), username: username.trim(), password: hashed, salt, createdAt: Date.now() }
    users.push(newUser)
    saveUsers(users)
    return { id: newUser.id, username: newUser.username }
  }

  function loginAsGuest() {
    const guest = { id: generateId(), username: '游客', role: 'guest', loginAt: Date.now() }
    currentUser.value = guest
    saveCurrentUser(guest)
    return guest
  }

  function logout() {
    currentUser.value = null
    saveCurrentUser(null)
  }

  function getUserPrefix() {
    if (!currentUser.value) return 'shared'
    return currentUser.value.id
  }

  return { currentUser, isLoggedIn, isGuest, userName, login, register, loginAsGuest, logout, getUserPrefix }
})
