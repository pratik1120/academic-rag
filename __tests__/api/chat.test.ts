import { POST } from '@/app/api/chat/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/embeddings', () => ({
  embedText: jest.fn().mockResolvedValue(new Array(1536).fill(0.1)),
}))
jest.mock('@/lib/vectorStore', () => ({
  similaritySearch: jest.fn().mockResolvedValue([
    { text: 'Neural networks learn from data', source: 'ml_intro.pdf', score: 0.95 },
  ]),
}))
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Neural networks are machine learning models.' } }],
          usage: { total_tokens: 120 },
        }),
      },
    },
  }))
})

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

describe('POST /api/chat', () => {
  it('returns 400 for empty question', async () => {
    const res = await POST(makeRequest({ question: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for missing question field', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('returns answer and sources for valid question', async () => {
    const res = await POST(makeRequest({ question: 'What are neural networks?' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.answer).toBeTruthy()
    expect(Array.isArray(json.sources)).toBe(true)
  })

  it('returns 400 for question exceeding 2000 chars', async () => {
    const res = await POST(makeRequest({ question: 'x'.repeat(2001) }))
    expect(res.status).toBe(400)
  })
})
