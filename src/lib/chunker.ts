export interface ChunkOptions {
  maxChunkSize?: number
  overlap?: number
}

export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const { maxChunkSize = 500, overlap = 50 } = options

  if (!text || text.trim().length === 0) return []

  const normalized = text.replace(/\s+/g, ' ').trim()
  const chunks: string[] = []
  let start = 0

  while (start < normalized.length) {
    const end = Math.min(start + maxChunkSize, normalized.length)
    const chunk = normalized.slice(start, end).trim()
    if (chunk.length > 0) chunks.push(chunk)
    start += maxChunkSize - overlap
    if (start <= 0) break // safety guard
  }

  return chunks
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}