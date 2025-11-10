'use client'

import { useEffect } from 'react'
import '@/lib/chatcard-sdk'

export function ChatCardSDKProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // SDK is initialized in lib/chatcard-sdk.ts
    // This component ensures it's loaded on client side
  }, [])

  return <>{children}</>
}

