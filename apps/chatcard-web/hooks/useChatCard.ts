'use client'

import { useEffect, useState } from 'react'
import type {
  ChatCardStatus,
  ChatCardTokenResult,
  RequestConnectionOptions,
} from '@/types/chatcard-sdk'

export function useChatCard(rpId: string) {
  const [status, setStatus] = useState<ChatCardStatus>('unavailable')
  const [tokenResult, setTokenResult] = useState<ChatCardTokenResult | null>(null)

  useEffect(() => {
    if (!window.chatcard) {
      setStatus('unavailable')
      return
    }

    setStatus(window.chatcard.getStatus())
    const unsubscribe = window.chatcard.onStatusChange(setStatus)

    return unsubscribe
  }, [])

  const connect = async (options: Omit<RequestConnectionOptions, 'rpId'>) => {
    if (!window.chatcard) return null

    setStatus('connecting')
    
    try {
      const result = await window.chatcard.requestConnection({
        ...options,
        rpId,
      })

      if (result) {
        setTokenResult(result)
        setStatus('connected')
      } else {
        setStatus('disconnected')
      }

      return result
    } catch (error) {
      setStatus('error')
      return null
    }
  }

  const disconnect = async () => {
    if (!window.chatcard) return

    try {
      await window.chatcard.disconnect()
      setTokenResult(null)
      setStatus('disconnected')
    } catch (error) {
      setStatus('error')
    }
  }

  return { status, tokenResult, connect, disconnect }
}

