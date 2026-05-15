import mammoth from 'mammoth'

export async function parseDOCX(arrayBuffer) {
  const result = await mammoth.extractRawText({ arrayBuffer })
  const text = result.value.trim()
  if (!text) throw new Error('无法从 DOCX 文件中提取文本内容')
  return {
    text,
    pages: [{ page: 1, text }],
    warnings: result.messages
  }
}
