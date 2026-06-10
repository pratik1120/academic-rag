import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { embedText } from '@/lib/embeddings'
import { similaritySearch } from '@/lib/vectorStore'
import { getCached, setCached, cacheKey } from '@/lib/cache'
import type { ChatResponse } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const ChatRequestSchema = z.object({
  question: z.string().min(1).max(2000),
  conversationHistory: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .optional()
    .default([]),
})

const SYSTEM_PROMPT = `You are an academic research assistant. Answer questions strictly based on the provided context excerpts from uploaded PDF documents.

Rules:
- Only answer from the provided context. If the answer is not in the context, say so clearly.
- Cite the source document name when referencing specific content.
- Be concise and precise — this is an academic tool.
- If asked about topics not present in the documents, reply: "This topic was not found in the uploaded documents."`

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse | { error: string }>> {
  try {
    const body = await req.json()
    const parsed = ChatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 })
    }

    const { question, conversationHistory } = parsed.data

    // Check cache
    const ck = cacheKey(question, JSON.stringify(conversationHistory))
    const cached = getCached(ck)
    if (cached) {
      return NextResponse.json(JSON.parse(cached))
    }

    // Embed + retrieve
    const queryEmbedding = await embedText(question)
    const results = await similaritySearch(queryEmbedding, 5)

    if (results.length === 0) {
      return NextResponse.json({
        answer: 'No documents have been uploaded yet. Please upload a PDF first.',
        sources: [],
      })
    }

    const context = results
      .map((r, i) => `[${i + 1}] Source: ${r.source}\n${r.text}`)
      .join('\n\n---\n\n')

    // Build prompt — Gemini uses a single string system instruction + chat history
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    // Build history for multi-turn
    const history = conversationHistory.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history })

    const userMessage = `Context from uploaded documents:\n\n${context}\n\n---\n\nQuestion: ${question}`
    const result = await chat.sendMessage(userMessage)
    const answer = result.response.text()
    const sources = [...new Set(results.map((r) => r.source))]

    const response: ChatResponse = { answer, sources }

    setCached(ck, JSON.stringify(response))

    return NextResponse.json(response)
  } catch (err) {
    console.error('[chat] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
