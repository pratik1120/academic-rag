import ReactMarkdown from 'react-markdown'
import type { Message } from '@/types'

interface Props {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '0.75rem',
    }}>
      <div style={{
        maxWidth: '78%',
        background: isUser ? 'var(--accent)' : 'var(--bg-card)',
        border: isUser ? 'none' : '1px solid var(--border)',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        padding: '0.65rem 1rem',
        fontSize: '0.9rem',
        lineHeight: 1.65,
        color: isUser ? '#fff' : 'var(--text-primary)',
      }}>
        <ReactMarkdown>{message.content}</ReactMarkdown>

        {message.sources && message.sources.length > 0 && (
          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Sources: {message.sources.join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
