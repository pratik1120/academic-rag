import { GoogleGenerativeAI, TaskType } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const EMBEDDING_MODEL = 'gemini-embedding-001'
export const EMBEDDING_DIM = 3072

export async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })
  const result = await model.embedContent({
    content: { parts: [{ text: text.slice(0, 8000) }], role: 'user' },
    taskType: TaskType.RETRIEVAL_QUERY,
  })
  return result.embedding.values
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const CONCURRENCY = 5
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += CONCURRENCY) {
    const batch = texts.slice(i, i + CONCURRENCY)
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })

    const embeddings = await Promise.all(
      batch.map((text) =>
        model.embedContent({
          content: { parts: [{ text: text.slice(0, 8000) }], role: 'user' },
          taskType: TaskType.RETRIEVAL_DOCUMENT,
        })
      )
    )

    results.push(...embeddings.map((e) => e.embedding.values))

    if (i + CONCURRENCY < texts.length) {
      await new Promise((r) => setTimeout(r, 200))
    }
  }

  return results
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Vector dimension mismatch')
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
  if (normA === 0 || normB === 0) return 0
  return dot / (normA * normB)
}