import { POST } from '@/app/api/upload/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/pdfParser', () => ({
  parsePDF: jest.fn().mockResolvedValue({ text: 'Sample text '.repeat(50), numPages: 2, info: {} }),
}))
jest.mock('@/lib/embeddings', () => ({
  embedBatch: jest.fn().mockResolvedValue([[0.1, 0.2]]),
}))
jest.mock('@/lib/vectorStore', () => ({
  storeChunks: jest.fn().mockResolvedValue(undefined),
}))

const makeFormData = (filename: string, content: string, type = 'application/pdf') => {
  const fd = new FormData()
  fd.append('file', new File([content], filename, { type }))
  return fd
}

describe('POST /api/upload', () => {
  it('returns 400 when no file is provided', async () => {
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: new FormData(),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/no file/i)
  })

  it('returns 400 for non-PDF file', async () => {
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: makeFormData('notes.txt', 'plain text', 'text/plain'),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 and chunksStored for valid PDF', async () => {
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: makeFormData('paper.pdf', '%PDF-1.4 fake content'),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(typeof json.chunksStored).toBe('number')
  })
})
