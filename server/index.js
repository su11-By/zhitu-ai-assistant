import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import * as cheerio from 'cheerio'

// ── Config ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
const SEARCH_TIMEOUT = 15_000
const FETCH_TIMEOUT = 10_000
const MAX_BODY_SIZE = '2mb'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// ── App ─────────────────────────────────────────────────────────────
const app = express()

// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1)

// ── Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Not a browser-facing page
}))
app.use(compression())
app.use(morgan('short'))
app.use(express.json({ limit: MAX_BODY_SIZE }))

// Rate limiting: 30 req/min per IP for search, 60 req/min for fetch
const searchLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '搜索请求过于频繁，请稍后重试' }
})

const fetchLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '抓取请求过于频繁，请稍后重试' }
})

// ── Helpers ─────────────────────────────────────────────────────────
function fetchWithTimeout(url, timeout) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  return fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'zh-CN,zh;q=0.9' }
  }).finally(() => clearTimeout(timer))
}

// ── Search endpoint ─────────────────────────────────────────────────
app.get('/search/web', searchLimiter, async (req, res, next) => {
  const query = (req.query.query || '').trim()
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' })
  }
  if (query.length > 200) {
    return res.status(400).json({ error: 'Query too long' })
  }

  try {
    const response = await fetchWithTimeout(
      `https://www.sogou.com/web?query=${encodeURIComponent(query)}`,
      SEARCH_TIMEOUT
    )

    if (!response.ok) {
      return res.status(502).json({ error: `上游搜索返回状态 ${response.status}` })
    }

    const html = await response.text()
    if (!html || html.length < 500) {
      return res.status(502).json({ error: '搜索返回内容为空' })
    }

    if (html.includes('请输入验证码') || html.includes('异常流量')) {
      return res.status(503).json({ error: '搜索引擎需要验证，请稍后重试' })
    }

    const results = parseSogouResults(html, 5)
    if (!results.length) {
      return res.json({ results: [{ title: query, snippet: '请基于你的知识直接回答这个问题。', url: '' }] })
    }

    res.json({ results })
  } catch (e) {
    if (e.name === 'AbortError') {
      return res.status(504).json({ error: '搜索请求超时' })
    }
    next(e)
  }
})

// ── Fetch endpoint ──────────────────────────────────────────────────
app.get('/fetch/:encodedUrl', fetchLimiter, async (req, res, next) => {
  const encoded = req.params.encodedUrl
  if (!encoded) {
    return res.status(400).json({ error: 'Missing URL' })
  }

  let targetUrl
  try {
    targetUrl = decodeURIComponent(encoded)
    const parsed = new URL(targetUrl)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Only http/https URLs allowed' })
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  try {
    const response = await fetchWithTimeout(targetUrl, FETCH_TIMEOUT)

    if (!response.ok) {
      return res.status(502).json({ error: `上游返回状态 ${response.status}` })
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return res.status(415).json({ error: 'Unsupported content type' })
    }

    const html = await response.text()
    const extracted = extractContent(html)

    res.json({
      title: extracted.title,
      text: extracted.text.slice(0, 3000),
      url: targetUrl
    })
  } catch (e) {
    if (e.name === 'AbortError') {
      return res.status(504).json({ error: '请求超时' })
    }
    next(e)
  }
})

// ── Health check ────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), uptime: process.uptime() })
})

// ── 404 ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ── Error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.message)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  })
})

// ── Sogou HTML parser ───────────────────────────────────────────────
function parseSogouResults(html, maxResults) {
  const results = []
  const $ = cheerio.load(html)

  // Pass 1: Extract JSON from React-rendered result cards
  $('script[type="application/json"]').each((_, script) => {
    if (results.length >= maxResults) return false
    try {
      const data = JSON.parse($(script).html() || '{}')
      if (!data.url || !data.title) return
      const title = stripHtml(data.title)
      if (title.length < 3) return
      const snippet = (data.content || '').replace(/\s+/g, ' ').trim()
      const url = resolveUrl(data.url)
      if (!url) return
      results.push({ title, snippet: snippet.slice(0, 500), url })
    } catch { /* skip malformed JSON */ }
  })

  // Pass 2: Traditional server-rendered results
  $('.vrwrap').each((_, wrap) => {
    if (results.length >= maxResults) return false
    const $wrap = $(wrap)
    if ($wrap.attr('data-reactroot') != null) return

    const $h3 = $wrap.find('h3').first()
    if (!$h3.length) return

    const $link = $h3.find('a[href]').first()
    if (!$link.length) return

    const rawHref = $link.attr('href')
    const url = resolveUrl(rawHref)
    if (!url) return
    if (url.includes('sogou.com') && !url.includes('sogou.com/link')) return

    const title = ($link.text() || '').replace(/\s+/g, ' ').trim()
    if (title.length < 3) return

    let snippet = ''
    const $snippet = $wrap.find('.star-wiki, .space-txt, .str_info, .abstract, .text-layout .fz-mid').first()
    if ($snippet.length) {
      snippet = ($snippet.text() || '').replace(/\s+/g, ' ').trim()
    }
    if (!snippet || snippet.length < 15) {
      const fullText = ($wrap.find('.text-layout').text() || $wrap.text() || '').replace(/\s+/g, ' ').replace(title, '').trim()
      snippet = fullText
    }

    results.push({ title, snippet: snippet.slice(0, 500), url })
  })

  // Pass 3: Fallback — scan all h3 a[href]
  if (!results.length) {
    $('h3 a[href]').each((_, link) => {
      if (results.length >= maxResults) return false
      const $link = $(link)
      const url = resolveUrl($link.attr('href'))
      if (!url) return
      const title = ($link.text() || '').replace(/\s+/g, ' ').trim()
      if (title.length < 5) return

      const parentText = ($link.closest('.vrwrap, .rb, .result, div').text() || '').replace(/\s+/g, ' ').replace(title, '').trim()
      results.push({ title, snippet: parentText.slice(0, 500), url })
    })
  }

  return results
}

// ── Content extractor ───────────────────────────────────────────────
function extractContent(html) {
  const $ = cheerio.load(html)

  const title = $('title').first().text().trim() ||
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') || ''

  // Remove noise elements
  $('script, style, nav, header, footer, .sidebar, .nav, .footer, .header, .ad, [role="navigation"], noscript').remove()

  // Try main content areas first
  const $main = $('main, article, .content, .article, #content, [role="main"]').first()
  const source = $main.length ? $main : $('body')
  const text = (source.text() || '').replace(/\s+/g, ' ').trim()

  // Deduplicate repeated lines
  const lines = text.split('. ')
  const seen = new Set()
  const deduped = lines.filter(line => {
    const key = line.slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).join('. ')

  return { title, text: deduped }
}

// ── Shared utilities ────────────────────────────────────────────────
function stripHtml(str) {
  return str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
}

function resolveUrl(raw) {
  if (!raw) return ''
  const decoded = decodeEntities(raw.trim())
  if (decoded.startsWith('http://') || decoded.startsWith('https://')) return decoded
  if (decoded.startsWith('/link?') || decoded.startsWith('/web?')) {
    return 'https://www.sogou.com' + decoded
  }
  return ''
}

// ── Start ───────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] http://127.0.0.1:${PORT}  |  env: ${process.env.NODE_ENV || 'development'}`)
  console.log(`[Server] Network access: http://0.0.0.0:${PORT}`)
})
