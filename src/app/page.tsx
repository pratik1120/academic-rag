'use client'

import { useState } from 'react'
import axios from 'axios'
import ChatWindow from '@/components/ChatWindow'
import type { Message, UploadResult } from '@/types'

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [uploadStatus, setUploadStatus] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadStatus('⏳ Uploading...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await axios.post<UploadResult>('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data.success) {
        setUploadedFiles((prev) => [...prev, data.filename])
        setUploadStatus(`✓ ${data.filename} — ${data.chunksStored} chunks indexed`)
      } else {
        setUploadStatus(`✗ ${data.error}`)
      }
    } catch (err) {
      console.error(err)
      setUploadStatus('✗ Upload failed — check console')
    }

    e.target.value = ''
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 600 }}>AcademicRAG</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Upload academic PDFs and ask questions
        </p>
      </header>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="file"
          accept=".pdf"
          id="pdf-input"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <label
          htmlFor="pdf-input"
          style={{
            display: 'inline-block',
            background: 'var(--accent)',
            color: '#fff',
            padding: '0.6rem 1.4rem',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          📂 Upload PDF
        </label>
        {uploadStatus && (
          <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {uploadStatus}
          </span>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div style={{ marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {uploadedFiles.map((f) => (
            <span key={f} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '2px 10px', fontSize: '0.8rem', color: 'var(--success)',
            }}>
              ✓ {f}
            </span>
          ))}
        </div>
      )}

      <ChatWindow messages={messages} setMessages={setMessages} hasDocuments={uploadedFiles.length > 0} />
    </main>
  )
}