import { AI_DEFAULTS } from '../utils/constants.js'

// 本地 TF-IDF 向量化（MiMo 不提供 embedding API）
const VOCAB_SIZE = 512
let globalVocab = new Map()
let globalDocCount = 0

function tokenize(text) {
  // 简单分词：中文按字/词，英文按空格
  const tokens = []
  // 提取中文词（2-4字组合）和英文单词
  const chineseWords = text.match(/[\u4e00-\u9fa5]{2,4}/g) || []
  const englishWords = text.match(/[a-zA-Z]+/g) || []
  tokens.push(...chineseWords, ...englishWords.map(w => w.toLowerCase()))
  return tokens
}

function buildVocab(tokens) {
  for (const token of tokens) {
    if (!globalVocab.has(token) && globalVocab.size < VOCAB_SIZE) {
      globalVocab.set(token, globalVocab.size)
    }
  }
}

function computeTF(tokens) {
  const tf = new Float32Array(VOCAB_SIZE)
  const count = new Map()
  for (const token of tokens) {
    count.set(token, (count.get(token) || 0) + 1)
  }
  for (const [token, idx] of globalVocab) {
    tf[idx] = (count.get(token) || 0) / tokens.length
  }
  return tf
}

function computeTFIDF(tokens) {
  const tf = computeTF(tokens)
  // 简化：使用 TF 作为向量（IDF 需要全局文档频率，这里近似）
  // 对向量做 L2 归一化
  let norm = 0
  for (let i = 0; i < tf.length; i++) {
    norm += tf[i] * tf[i]
  }
  norm = Math.sqrt(norm)
  if (norm > 0) {
    for (let i = 0; i < tf.length; i++) {
      tf[i] /= norm
    }
  }
  return Array.from(tf)
}

export async function createEmbedding(text) {
  if (!text?.trim()) throw new Error('Cannot embed empty text')

  const tokens = tokenize(text.trim())
  if (tokens.length === 0) {
    // 空分词时返回零向量
    return new Array(VOCAB_SIZE).fill(0)
  }

  buildVocab(tokens)
  globalDocCount++
  return computeTFIDF(tokens)
}

export async function createEmbeddings(texts) {
  // 先构建词汇表
  const allTokens = texts.map(t => tokenize(t?.trim() || ''))
  for (const tokens of allTokens) {
    buildVocab(tokens)
  }
  globalDocCount += texts.length

  // 再计算向量
  return allTokens.map(tokens => {
    if (tokens.length === 0) return new Array(VOCAB_SIZE).fill(0)
    return computeTFIDF(tokens)
  })
}

export async function embedChunks(chunks, kbId, docTitle, onProgress) {
  const embedded = []
  const failed = []

  // 先收集所有 token 构建统一词汇表
  const allTokens = chunks.map(c => tokenize(c.text?.trim() || ''))
  for (const tokens of allTokens) {
    buildVocab(tokens)
  }

  for (let i = 0; i < chunks.length; i++) {
    try {
      const tokens = allTokens[i]
      let vector
      if (tokens.length === 0) {
        vector = new Array(VOCAB_SIZE).fill(0)
      } else {
        vector = computeTFIDF(tokens)
      }

      embedded.push({
        kbId,
        docId: chunks[i].docId || '',
        docTitle,
        text: chunks[i].text,
        vector,
        chunkIndex: chunks[i].chunkIndex ?? i,
        charCount: chunks[i].charCount ?? chunks[i].text.length
      })
    } catch (e) {
      console.warn(`[embedChunks] Chunk ${i} (${chunks[i].text.slice(0, 50)}...) failed:`, e.message)
      failed.push(i)
    }
    if (onProgress) onProgress(i + 1, chunks.length)
  }
  if (failed.length) {
    throw new Error(`嵌入失败: ${failed.length}/${chunks.length} 个分块处理出错 (索引: ${failed.join(', ')})`)
  }
  return embedded
}
