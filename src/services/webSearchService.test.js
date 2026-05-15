import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

// We need to import dynamic modules that reference 'fetch' and other globals.
// Test the isSafeUrl logic by extracting it for pure testing.

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

describe('isSafeUrl', () => {
  test('allows valid https URLs', () => {
    expect(isSafeUrl('https://example.com/page')).toBe(true)
  })

  test('allows valid http URLs', () => {
    expect(isSafeUrl('http://example.com')).toBe(true)
  })

  test('blocks 127.0.0.1 localhost IP', () => {
    expect(isSafeUrl('http://127.0.0.1:8080/admin')).toBe(false)
  })

  test('blocks 10.x private range', () => {
    expect(isSafeUrl('http://10.0.0.1/api')).toBe(false)
  })

  test('blocks 192.168.x private range', () => {
    expect(isSafeUrl('http://192.168.1.1')).toBe(false)
  })

  test('blocks 172.16-31.x private range', () => {
    expect(isSafeUrl('http://172.16.0.1')).toBe(false)
  })

  test('blocks 172.31.x.x', () => {
    expect(isSafeUrl('http://172.31.255.255')).toBe(false)
  })

  test('blocks cloud metadata endpoint', () => {
    expect(isSafeUrl('http://169.254.169.254/latest/meta-data/')).toBe(false)
  })

  test('blocks 169.254.x.x range', () => {
    expect(isSafeUrl('http://169.254.1.1')).toBe(false)
  })

  test('blocks localhost', () => {
    expect(isSafeUrl('http://localhost:3000')).toBe(false)
  })

  test('blocks 0.0.0.0', () => {
    expect(isSafeUrl('http://0.0.0.0')).toBe(false)
  })

  test('blocks IPv6 loopback', () => {
    expect(isSafeUrl('http://[::1]')).toBe(false)
  })

  test('blocks non-http protocols (ftp)', () => {
    expect(isSafeUrl('ftp://example.com')).toBe(false)
  })

  test('blocks non-http protocols (file)', () => {
    expect(isSafeUrl('file:///etc/passwd')).toBe(false)
  })

  test('blocks javascript protocol', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false)
  })

  test('returns false for invalid URLs', () => {
    expect(isSafeUrl('not-a-url')).toBe(false)
  })

  test('returns false for empty string', () => {
    expect(isSafeUrl('')).toBe(false)
  })

  test('allows public IPs', () => {
    expect(isSafeUrl('https://8.8.8.8')).toBe(true)
  })

  test('allows URLs with query params', () => {
    expect(isSafeUrl('https://example.com/page?q=test&lang=zh')).toBe(true)
  })

  test('correctly identifies sogou.com/link as safe (filtered separately)', () => {
    expect(isSafeUrl('https://sogou.com/link?url=xxx')).toBe(true)
  })
})

describe('webSearchService imports', () => {
  test('searchWeb and fetchPageContent are callable functions', async () => {
    const mod = await import('./webSearchService.js')
    expect(typeof mod.searchWeb).toBe('function')
    expect(typeof mod.fetchPageContent).toBe('function')
  })
})
