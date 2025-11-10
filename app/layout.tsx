import type { Metadata } from 'next'
import './globals.css'
import { ChatCardSDKProvider } from '@/components/ChatCardSDKProvider'

export const metadata: Metadata = {
  title: 'ChatCard – Portable Chat Card',
  description: 'ChatCard is a portable chat card you can carry across apps and sites. It remembers how you talk, links to the AI provider you trust, and can click into AI-enabled content on the web.',
  openGraph: {
    title: 'ChatCard – Portable Chat Card',
    description: 'ChatCard is a portable chat card you can carry across apps and sites. It remembers how you talk, links to the AI provider you trust, and can click into AI-enabled content on the web.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ChatCardSDKProvider>{children}</ChatCardSDKProvider>
      </body>
    </html>
  )
}
