// DeepSeek API 直接调用
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1'

let _getApiKey = null

export function setApiKeyProvider(fn) {
  _getApiKey = fn
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export async function apiPost(path, body, options = {}) {
  // 直接调用 DeepSeek API
  const url = `${DEEPSEEK_API_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // 获取 API Key
  if (_getApiKey) {
    const key = _getApiKey()
    if (key) {
      headers['Authorization'] = `Bearer ${key}`
    }
  }

  // 检查是否设置了 API Key
  if (!headers['Authorization']) {
    throw new ApiError(401, '请先设置 DeepSeek API Key')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: options.signal
  })

  if (!response.ok) {
    let errorText
    try { errorText = await response.text() } catch { errorText = response.statusText }
    throw new ApiError(response.status, errorText || response.statusText)
  }

  return response
}

export async function apiPostJson(path, body, options = {}) {
  const response = await apiPost(path, body, options)
  return response.json()
}

export function createTimeout(ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, clear: () => clearTimeout(timer) }
}