import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Login - Modern Authentication',
  description: 'Modern login page with smooth animations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
