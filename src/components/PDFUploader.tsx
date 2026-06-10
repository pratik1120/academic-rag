'use client'

import { useState } from 'react'
import axios from 'axios'
import type { UploadResult } from '@/types'

interface Props {
  onFileUploaded: (filename: string) => void
}

export default function PDFUploader({ onFileUploaded }: Props) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error')
      setMessage('Only PDF files are supported')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }
    setStatus('uploading')
    setMessage(`Uploading ${file.name}...`)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await axios.post<UploadResult>('/api/upload', formData)
      if (data.success) {
        setStatus('success')
        setMessage(`✓ ${data.filename} — ${data.chunksStored} chunks indexed`)
        onFileUploaded(data.filename)
      } else {
        setStatus('error')
        setMessage(data.error ?? 'Upload failed')
      }
    } catch (err: unknown) {
      setStatus('error')
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Upload failed'
      setMessage(msg ?? 'Upload failed')
    }
    setTimeout(() => setStatus('idle'), 5000)
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{
        display: 'inline-block',
        background: 'var(--accent)',
        color: '#fff',
        padding: '0.6rem 1.4rem',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontFamily: 'inherit',
      }}>
        📂 Upload PDF
        <input
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          disabled={status === 'uploading'}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </label>

      {status !== 'idle' && (
        <span style={{
          marginLeft: '1rem',
          fontSize: '0.85rem',
          color: status === 'error' ? 'var(--danger)' : status === 'success' ? 'var(--success)' : 'var(--text-secondary)',
        }}>
          {status === 'uploading' ? '⏳ ' : status === 'error' ? '✗ ' : ''}
          {message}
        </span>
      )}
    </div>
  )
}