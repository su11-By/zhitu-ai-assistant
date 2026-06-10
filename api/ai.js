const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1'

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const path = req.query.path || 'chat/completions'
  const targetUrl = `${DEEPSEEK_BASE_URL}/${path}`

  try {
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json'
    }
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    })

    res.status(response.status)
    const contentType = response.headers.get('content-type')
    if (contentType) res.setHeader('Content-Type', contentType)

    const buffer = await response.arrayBuffer()
    return res.send(Buffer.from(buffer))
  } catch (e) {
    return res.status(502).json({ error: 'Proxy error', message: e.message })
  }
}