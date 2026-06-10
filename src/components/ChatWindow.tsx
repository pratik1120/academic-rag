'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { randomUUID } from 'crypto'
import MessageBubble from './MessageBubble'
import type { Message, ChatResponse } from '@/types'

interface Props {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  hasDocuments: boolean
}

export default function ChatWindow({ messages, setMessages, hasDocuments }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const question = input.trim()
    if (!question || loading) return

    const userMsg: Message = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))
      const { data } = await axios.post<ChatResponse>('/api/chat', {
        question,
        conversationHistory: history,
      })

      const assistantMsg: Message = {
        id: Math.random().toString(36).slice(2),
        role: 'assistant',
        content: data.answer,
        timestamp: Date.now(),
        sources: data.sources,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          timestamp: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginTop: '1rem', minHeight: 0 }}>
      {/* Message list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        background: 'var(--bg-surface)',
        borderRadius: 10,
        border: '1px solid var(--border)',
        marginBottom: '0.75rem',
        minHeight: 200,
      }}>
        {messages.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
            {hasDocuments
              ? 'Ask anything about your uploaded documents.'
              : 'Upload a PDF above to get started.'}
          </p>
        )}
        {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '16px 16px 16px 4px', padding: '0.65rem 1rem',
              color: 'var(--text-secondary)', fontSize: '0.875rem',
            }}>
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasDocuments ? 'Ask a question about your documents…' : 'Upload a PDF first…'}
          disabled={!hasDocuments || loading}
          rows={2}
          style={{
            flex: 1,
            resize: 'none',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '0.65rem 0.9rem',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!hasDocuments || loading || !input.trim()}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0 1.25rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            opacity: (!hasDocuments || loading || !input.trim()) ? 0.45 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
