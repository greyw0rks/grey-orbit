import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Grey Orbit - AI Orbital Conjunction Assessment',
  description: 'AI-powered orbital collision avoidance system using SGP4 propagation and IBM watsonx.ai',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
