import { NextRequest, NextResponse } from 'next/server'
import { parsePDF } from '@/lib/pdfParser'
import { chunkText } from '@/lib/chunker'
import { embedBatch } from '@/lib/embeddings'
import { storeChunks } from '@/lib/vectorStore'
import { randomUUID } from 'crypto'
import type { Chunk, UploadResult } from '@/types'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

export async function POST(req: NextRequest): Promise<NextResponse<UploadResult>> {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, filename: '', chunksStored: 0, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, filename: file.name, chunksStored: 0, error: 'Only PDF files are supported' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, filename: file.name, chunksStored: 0, error: 'File exceeds 20 MB limit' },
        { status: 413 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { text, numPages } = await parsePDF(buffer)
    const rawChunks = chunkText(text, { maxChunkSize: 500, overlap: 50 })

    if (rawChunks.length === 0) {
      return NextResponse.json(
        { success: false, filename: file.name, chunksStored: 0, error: 'No text could be extracted from PDF' },
        { status: 422 }
      )
    }

    const embeddings = await embedBatch(rawChunks)

    const chunks: Chunk[] = rawChunks.map((chunkText, i) => ({
      id: randomUUID(),
      text: chunkText,
      embedding: embeddings[i],
      metadata: {
        source: file.name,
        page: Math.floor((i / rawChunks.length) * numPages) + 1,
        chunkIndex: i,
      },
    }))

    await storeChunks(chunks)

    return NextResponse.json({
      success: true,
      filename: file.name,
      chunksStored: chunks.length,
    })
  } catch (err) {
    console.error('[upload] error:', err)
    return NextResponse.json(
      { success: false, filename: '', chunksStored: 0, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
