import { chunkText, estimateTokens } from '@/lib/chunker'

describe('chunkText', () => {
  it('returns empty array for empty input', () => {
    expect(chunkText('')).toEqual([])
    expect(chunkText('   ')).toEqual([])
  })

  it('returns single chunk when text is shorter than maxChunkSize', () => {
    const text = 'Short text.'
    const chunks = chunkText(text, { maxChunkSize: 500 })
    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toBe(text)
  })

  it('splits long text into multiple chunks', () => {
    const text = 'word '.repeat(300)
    const chunks = chunkText(text, { maxChunkSize: 200, overlap: 0 })
    expect(chunks.length).toBeGreaterThan(1)
  })

  it('does not produce chunks of length 0', () => {
    const text = 'x'.repeat(1000)
    const chunks = chunkText(text, { maxChunkSize: 100, overlap: 20 })
    chunks.forEach((c) => expect(c.length).toBeGreaterThan(0))
  })

  it('handles text with only whitespace between words', () => {
    const text = 'hello    world   foo   bar'
    const chunks = chunkText(text)
    expect(chunks[0]).not.toMatch(/\s{2,}/)
  })
})

describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0)
  })

  it('approximates token count as chars/4', () => {
    expect(estimateTokens('abcd')).toBe(1)
    expect(estimateTokens('a'.repeat(400))).toBe(100)
  })
})
