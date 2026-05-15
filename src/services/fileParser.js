import { parsePDF } from './parsers/pdfParser.js'
import { parseDOCX } from './parsers/docxParser.js'
import { parseMD } from './parsers/mdParser.js'
import { parseTXT } from './parsers/txtParser.js'

const PARSER_MAP = {
  pdf: parsePDF,
  docx: parseDOCX,
  doc: parseDOCX,
  md: parseMD,
  markdown: parseMD,
  txt: parseTXT,
  text: parseTXT
}

export const SUPPORTED_EXTENSIONS = Object.keys(PARSER_MAP)

export const SUPPORTED_FORMATS = {
  pdf: 'PDF 文档',
  docx: 'Word 文档',
  doc: 'Word 文档',
  md: 'Markdown',
  markdown: 'Markdown',
  txt: '纯文本',
  text: '纯文本'
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function getFileExtension(filename) {
  return (filename.split('.').pop() || '').toLowerCase()
}

export function isFileSupported(filename) {
  return getFileExtension(filename) in PARSER_MAP
}

export function getFormatLabel(filename) {
  return SUPPORTED_FORMATS[getFileExtension(filename)] || '未知格式'
}

export async function parseFile(fileOrBuffer, filename) {
  const ext = getFileExtension(filename)
  const parser = PARSER_MAP[ext]

  if (!parser) {
    throw new Error(`不支持的文件格式: .${ext}。支持: ${SUPPORTED_EXTENSIONS.join(', ')}`)
  }

  let arrayBuffer
  if (fileOrBuffer instanceof File) {
    if (fileOrBuffer.size > MAX_FILE_SIZE) {
      throw new Error(`文件过大 (${(fileOrBuffer.size / 1024 / 1024).toFixed(1)}MB)，最大支持 50MB`)
    }
    if (fileOrBuffer.size === 0) {
      throw new Error('文件为空')
    }
    arrayBuffer = await fileOrBuffer.arrayBuffer()
  } else {
    arrayBuffer = fileOrBuffer
  }

  const result = await parser(arrayBuffer)
  return {
    ...result,
    format: ext,
    formatLabel: getFormatLabel(filename),
    fileName: fileOrBuffer instanceof File ? fileOrBuffer.name : filename,
    fileSize: fileOrBuffer instanceof File ? fileOrBuffer.size : arrayBuffer.byteLength
  }
}
