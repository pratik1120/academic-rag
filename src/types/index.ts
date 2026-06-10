export interface Chunk {
  id: string
  text: string
  embedding: number[]
  metadata: {
    source: string
    page: number
    chunkIndex: number
  }
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  sources?: string[]
}

export interface UploadResult {
  success: boolean
  filename: string
  chunksStored: number
  error?: string
}

export interface ChatRequest {
  question: string
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[]
}

export interface ChatResponse {
  answer: string
  sources: string[]
  tokensUsed?: number
}
