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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/chatcard-logo-white.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
      </head>
      <body>
        <ChatCardSDKProvider>{children}</ChatCardSDKProvider>
      </body>
    </html>
  )
}
