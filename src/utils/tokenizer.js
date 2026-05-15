const CHINESE_RE = /[一-鿿　-〿＀-￯]/g
const CHINESE_PUNCT_RE = /[　-〿＀-￯]/g

export function estimateTokens(text) {
  if (!text) return 0
  const chineseChars = (text.match(CHINESE_RE) || []).length
  const pureChinese = chineseChars - (text.match(CHINESE_PUNCT_RE) || []).length
  const nonChinese = text.replace(CHINESE_RE, '')
  const asciiWords = nonChinese.split(/\s+/).filter(Boolean).length
  return Math.ceil(pureChinese * 0.55 + asciiWords * 1.3)
}

export function estimateMessagesTokens(messages) {
  let total = 0
  for (const msg of messages) {
    total += estimateTokens(msg.content) + 4
  }
  return total
}
