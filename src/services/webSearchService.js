const SEARCH_TIMEOUT = 15_000
const FETCH_TIMEOUT = 10_000

// 后端服务地址（部署到 Render 后替换为您的公网地址）
const BACKEND_URL = 'https://zhitu-ai-assistant.netlify.app/api'

const BLOCKED_IP_PATTERNS = [
  /^https?:\/\/127\./,
  /^https?:\/\/10\./,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
  /^https?:\/\/192\.168\./,
  /^https?:\/\/169\.254\.169\.254/,
  /^https?:\/\/localhost/i,
  /^https?:\/\/0\.0\.0\.0/,
  /^https?:\/\/\[::1\]/,
  /^https?:\/\/169\.254\./
]

function isSafeUrl(url) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    if (!parsed.hostname || parsed.hostname === '') return false
    for (const pattern of BLOCKED_IP_PATTERNS) {
      if (pattern.test(url)) return false
    }
    return true
  } catch {
    return false
  }
}

async function fetchJson(url, timeout) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json', 'Accept-Language': 'zh-CN,zh;q=0.9' }
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || `请求失败 (${response.status})`)
    }
    return response.json()
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('请求超时')
    throw e
  } finally {
    clearTimeout(timer)
  }
}

export async function searchWeb(query, maxResults = 5) {
  if (!query?.trim()) return []

  try {
    const data = await fetchJson(
      `${BACKEND_URL}/search/web?query=${encodeURIComponent(query.trim())}`,
      SEARCH_TIMEOUT
    )
    return (data.results || []).slice(0, maxResults)
  } catch {
    return []
  }
}

export async function fetchPageContent(url) {
  if (!url) return ''
  if (!isSafeUrl(url)) return ''
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'sogou.com' && parsed.pathname.startsWith('/link')) return ''
  } catch { return '' }

  try {
    const encoded = encodeURIComponent(url)
    const data = await fetchJson(`${BACKEND_URL}/fetch/${encoded}`, FETCH_TIMEOUT)
    return data.text || ''
  } catch {
    return ''
  }
}
