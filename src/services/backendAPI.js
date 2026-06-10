// 后端服务地址（PythonAnywhere 部署）
const API_BASE_URL = 'https://admin051104.pythonanywhere.com/api'
const TOKEN_KEY = 'app-auth-token'

let _token = localStorage.getItem(TOKEN_KEY)

export class BackendApiError extends Error {
  constructor(message, { status = 0, path = '', cause = null } = {}) {
    super(message)
    this.name = 'BackendApiError'
    this.status = status
    this.path = path
    this.cause = cause
  }
}

export function setAuthToken(token) {
  _token = token
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getAuthToken() {
  return _token
}

function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`
  }
  return headers
}

export async function apiRequest(method, path, body = null, options = {}) {
  const url = `${API_BASE_URL}${path}`
  const config = {
    method,
    headers: buildHeaders(),
    ...options
  }
  if (body) {
    config.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url, config)
  } catch (e) {
    throw new BackendApiError('无法连接后端服务', { path, cause: e })
  }

  if (!response.ok) {
    if (response.status === 401 && _token) {
      setAuthToken(null)
      window.dispatchEvent(new CustomEvent('auth-expired'))
    }
    let errorMsg = 'Request failed'
    try {
      const errData = await response.json()
      errorMsg = errData.error || errorMsg
    } catch { /* 非 JSON 响应 */ }
    throw new BackendApiError(errorMsg, { status: response.status, path })
  }

  return response.json()
}

export const authAPI = {
  register: (username, password, email) => apiRequest('POST', '/auth/register', { username, password, email }),
  login: (username, password) => apiRequest('POST', '/auth/login', { username, password }),
  me: () => apiRequest('GET', '/auth/me')
}

export const kbAPI = {
  list: () => apiRequest('GET', '/kbs'),
  create: (name, description, category) => apiRequest('POST', '/kbs', { name, description, category }),
  get: (id) => apiRequest('GET', `/kbs/${id}`),
  update: (id, name, description, category) => apiRequest('PUT', `/kbs/${id}`, { name, description, category }),
  delete: (id) => apiRequest('DELETE', `/kbs/${id}`)
}

export const docAPI = {
  list: (kbId) => apiRequest('GET', `/kbs/${kbId}/docs`),
  create: (kbId, title, content, fileType) => apiRequest('POST', `/kbs/${kbId}/docs`, { title, content, fileType }),
  get: (id) => apiRequest('GET', `/docs/${id}`),
  delete: (id) => apiRequest('DELETE', `/docs/${id}`)
}

export const chunkAPI = {
  batch: (chunks, kbId, docId, docTitle) => apiRequest('POST', '/chunks/batch', { chunks, kbId, docId, docTitle }),
  byKb: (kbId) => apiRequest('GET', `/chunks/kb/${kbId}`),
  byHash: (hash) => apiRequest('GET', `/chunks/hash/${hash}`)
}

export const chatAPI = {
  sessions: () => apiRequest('GET', '/chat/sessions'),
  create: (title, kbId, skillId) => apiRequest('POST', '/chat/sessions', { title, kbId, skillId }),
  messages: (sessionId) => apiRequest('GET', `/chat/sessions/${sessionId}/messages`),
  addMessage: (sessionId, role, content) => apiRequest('POST', `/chat/sessions/${sessionId}/messages`, { role, content }),
  delete: (sessionId) => apiRequest('DELETE', `/chat/sessions/${sessionId}`)
}

export const taskAPI = {
  list: () => apiRequest('GET', '/tasks'),
  create: (title, description, status, priority, dueDate = null) => apiRequest('POST', '/tasks', { title, description, status, priority, dueDate }),
  update: (id, title, description, status, priority, dueDate = null) => apiRequest('PUT', `/tasks/${id}`, { title, description, status, priority, dueDate }),
  delete: (id) => apiRequest('DELETE', `/tasks/${id}`)
}
