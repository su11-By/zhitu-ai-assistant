export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dotProduct / denom
}

export function topKSimilar(queryVector, vectors, k = 5) {
  const scored = vectors.map((v) => ({
    ...v,
    score: cosineSimilarity(queryVector, v.vector)
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, k)
}
