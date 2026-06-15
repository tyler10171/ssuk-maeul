import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '쑥 마을 — 놓치지 않는 육아 지원',
  description:
    '임신부터 육아까지, 받을 수 있는 정부·지자체 지원을 자동으로 찾아 알려드려요.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}
