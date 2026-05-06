import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Creative Board',
  description: 'Kanban board app',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
