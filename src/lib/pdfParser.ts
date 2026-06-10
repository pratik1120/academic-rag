import pdfParse from 'pdf-parse'

export interface ParseResult {
  text: string
  numPages: number
  info: Record<string, unknown>
}

export async function parsePDF(buffer: Buffer): Promise<ParseResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty PDF buffer')
  }

  const data = await pdfParse(buffer)

  if (!data.text || data.text.trim().length === 0) {
    throw new Error('PDF contains no extractable text (possibly scanned/image-only)')
  }

  return {
    text: data.text,
    numPages: data.numpages,
    info: data.info ?? {},
  }
}
