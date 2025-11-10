// lib/chatcard-sdk.ts
// Stubbed SDK implementation for development

import type {
  ChatCardSDK,
  ChatCardStatus,
  RequestConnectionOptions,
  ChatCardTokenResult,
} from '@/types/chatcard-sdk'

// Mock profile for demo
const mockProfile = {
  card_id: 'card_01HX9ZK0ABCDEF',
  sub: 'user_pseudonymous_id',
  persona: {
    display_name: 'Alex',
    handle: '@alex',
    primary_language: 'en',
    secondary_languages: ['es', 'fr'],
    tone: 'casual' as const,
    reading_level: 'standard' as const,
  },
  ai_preferences: {
    provider_hint: 'openai',
    model_hint: 'gpt-5-thinking',
  },
  scope_level: 'suggest' as const,
}

class ChatCardSDKImpl implements ChatCardSDK {
  private status: ChatCardStatus = 'disconnected'
  private listeners: Set<(status: ChatCardStatus) => void> = new Set()

  getStatus(): ChatCardStatus {
    return this.status
  }

  onStatusChange(cb: (status: ChatCardStatus) => void): () => void {
    this.listeners.add(cb)
    return () => {
      this.listeners.delete(cb)
    }
  }

  isAvailable(): boolean {
    return true // Always available in demo
  }

  async requestConnection(
    options: RequestConnectionOptions
  ): Promise<ChatCardTokenResult | null> {
    // In real implementation, this would:
    // 1. Open chatcard.cloud/connect with params
    // 2. Wait for user consent
    // 3. Receive token via callback/postMessage
    // For now, simulate the flow
    
    this.setStatus('connecting')

    // Simulate redirect to consent page
    const params = new URLSearchParams({
      scopes: options.scopes.join(','),
      rp_id: options.rpId,
      redirect_uri: window.location.href,
    })

    // In production, this would redirect to chatcard.cloud/connect
    // For demo, we'll simulate approval after a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if user approved (in real flow, this comes from consent page callback)
        const approved = sessionStorage.getItem(`chatcard_approved_${options.rpId}`)
        
        if (approved === 'true') {
          const result: ChatCardTokenResult = {
            token: `mock_token_${Date.now()}`,
            profile: {
              ...mockProfile,
              scope_level: options.scopes[0] || 'read',
            },
            expires_at: Date.now() + 3600000, // 1 hour
          }
          
          this.setStatus('connected')
          resolve(result)
        } else {
          // Simulate opening consent page
          // In production: window.location.href = `https://chatcard.cloud/connect?${params}`
          // For demo, we'll auto-approve after showing consent UI
          const consentUrl = `/connect?${params}`
          window.open(consentUrl, 'chatcard-consent', 'width=600,height=700')
          
          // Listen for approval message
          const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'chatcard-approved' && event.data.rpId === options.rpId) {
              window.removeEventListener('message', handleMessage)
              sessionStorage.setItem(`chatcard_approved_${options.rpId}`, 'true')
              
              const result: ChatCardTokenResult = {
                token: `mock_token_${Date.now()}`,
                profile: {
                  ...mockProfile,
                  scope_level: options.scopes[0] || 'read',
                },
                expires_at: Date.now() + 3600000,
              }
              
              this.setStatus('connected')
              resolve(result)
            }
          }
          
          window.addEventListener('message', handleMessage)
          
          // Fallback: auto-approve after 2 seconds for demo
          setTimeout(() => {
            window.removeEventListener('message', handleMessage)
            sessionStorage.setItem(`chatcard_approved_${options.rpId}`, 'true')
            
            const result: ChatCardTokenResult = {
              token: `mock_token_${Date.now()}`,
              profile: {
                ...mockProfile,
                scope_level: options.scopes[0] || 'read',
              },
              expires_at: Date.now() + 3600000,
            }
            
            this.setStatus('connected')
            resolve(result)
          }, 2000)
        }
      }, 500)
    })
  }

  async disconnect(): Promise<void> {
    this.setStatus('disconnected')
    // Clear approval
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('chatcard_approved_')) {
        sessionStorage.removeItem(key)
      }
    })
  }

  private setStatus(newStatus: ChatCardStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus
      this.listeners.forEach(cb => cb(newStatus))
    }
  }
}

// Initialize SDK
if (typeof window !== 'undefined') {
  window.chatcard = new ChatCardSDKImpl()
}

export const chatcardSDK = typeof window !== 'undefined' ? window.chatcard : null

