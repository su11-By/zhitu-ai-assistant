import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url
).toString()

export async function parsePDF(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (pageText) {
      pages.push({ page: i, text: pageText })
      fullText += pageText + '\n\n'
    }
  }

  if (!fullText.trim()) throw new Error('无法从 PDF 中提取文本内容（可能是扫描版或图片型 PDF）')
  return { text: fullText.trim(), pages, pageCount: pdf.numPages }
}
