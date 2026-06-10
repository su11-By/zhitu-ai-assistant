const express = require('express')
const app = express()

const PORT = process.env.PORT || 3004
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1'

app.use(express.json({ limit: '2mb' }))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.all('/ai/*', async (req, res) => {
  const path = req.params[0]
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
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    })

    res.status(response.status)
    const contentType = response.headers.get('content-type')
    if (contentType) res.setHeader('Content-Type', contentType)
    
    const buffer = await response.arrayBuffer()
    res.send(Buffer.from(buffer))
  } catch (e) {
    res.status(502).json({ error: 'Proxy error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})