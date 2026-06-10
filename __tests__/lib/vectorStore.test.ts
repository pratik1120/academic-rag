import { storeChunks, similaritySearch, clearStore } from '@/lib/vectorStore'
import type { Chunk } from '@/types'

const makeChunk = (id: string, text: string, embedding: number[]): Chunk => ({
  id,
  text,
  embedding,
  metadata: { source: 'test.pdf', page: 1, chunkIndex: 0 },
})

const vecA = new Array(768).fill(0).map((_, i) => (i === 0 ? 1 : 0))
const vecB = new Array(768).fill(0).map((_, i) => (i === 1 ? 1 : 0))
const vecC = new Array(768).fill(0).map((_, i) => (i === 2 ? 1 : 0))

beforeEach(async () => {
  await clearStore()
})

afterAll(async () => {
  await clearStore()
})

describe('storeChunks', () => {
  it('stores chunks without throwing', async () => {
    const chunks = [makeChunk('1', 'about neural networks', vecA)]
    await expect(storeChunks(chunks)).resolves.not.toThrow()
  })

  it('handles empty array gracefully', async () => {
    await expect(storeChunks([])).resolves.not.toThrow()
  })
})

describe('similaritySearch', () => {
  it('returns top-k closest vectors', async () => {
    await storeChunks([
      makeChunk('a', 'neural networks', vecA),
      makeChunk('b', 'transformers', vecB),
      makeChunk('c', 'attention mechanism', vecC),
    ])
    const results = await similaritySearch(vecA, 3)
    expect(results.length).toBe(3)
    expect(results[0].text).toBe('neural networks')
  })

  it('returns fewer than k results when store has fewer docs', async () => {
    await storeChunks([makeChunk('only', 'only chunk', vecA)])
    const results = await similaritySearch(vecA, 5)
    expect(results.length).toBeLessThanOrEqual(1)
  })
})
