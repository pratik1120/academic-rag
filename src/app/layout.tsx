import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AcademicRAG — Chat with your PDFs',
  description: 'Upload academic PDFs and ask questions using RAG-powered AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
