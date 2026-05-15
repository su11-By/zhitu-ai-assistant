export async function parseMD(arrayBuffer) {
  const decoder = new TextDecoder('utf-8')
  const text = decoder.decode(arrayBuffer)
  if (!text.trim()) throw new Error('文件内容为空')
  return { text: text.trim(), pages: [{ page: 1, text: text.trim() }] }
}
