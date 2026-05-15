import { CHUNK_CONFIG } from '../utils/constants.js'

const SENTENCE_ENDS = /[。！？；\n](?![」』）\)\]\}])/g
const PARAGRAPH_SPLIT = /\n{2,}/

export function splitSentences(text) {
  const sentences = []
  let lastIndex = 0
  let match

  while ((match = SENTENCE_ENDS.exec(text)) !== null) {
    sentences.push(text.slice(lastIndex, match.index + 1).trim())
    lastIndex = match.index + 1
  }

  const remaining = text.slice(lastIndex).trim()
  if (remaining) sentences.push(remaining)

  return sentences.filter(Boolean)
}

export function chunkByParagraphs(text, options = {}) {
  const maxChars = options.charSize || CHUNK_CONFIG.charSize
  const overlap = options.overlap || CHUNK_CONFIG.overlap

  const paragraphs = text.split(PARAGRAPH_SPLIT).filter((p) => p.trim())
  const chunks = []

  let currentChunk = ''
  let paraIndex = 0

  for (const para of paragraphs) {
    const cleaned = para.trim()

    if (currentChunk.length + cleaned.length > maxChars && currentChunk.length > 0) {
      chunks.push({ text: currentChunk.trim(), paraStart: paraIndex - countParasInText(currentChunk) })
      const sentences = splitSentences(currentChunk)
      const overlapText = sentences.slice(-Math.max(1, Math.floor(overlap / 30))).join('')
      currentChunk = overlapText + '\n\n' + cleaned
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + cleaned
    }
    paraIndex++
  }

  if (currentChunk.trim()) {
    chunks.push({ text: currentChunk.trim(), paraStart: paraIndex - countParasInText(currentChunk) })
  }

  return chunks.map((c, i) => ({
    chunkIndex: i,
    text: c.text,
    charCount: c.text.length
  }))
}

function countParasInText(text) {
  return text.split(PARAGRAPH_SPLIT).filter(Boolean).length
}

export function chunkDocument(text, options = {}) {
  return chunkByParagraphs(text, options)
}
