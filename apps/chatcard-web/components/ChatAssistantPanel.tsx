'use client'

import { useChatCard } from '@/hooks/useChatCard'
import { ChatCardBanner } from '@/components/ChatCardBanner'
import { ChatCardIndicator } from '@/components/ChatCardIndicator'
import type { ChatCardScopeLevel, ChatCardProfile as SDKProfile } from '@/types/chatcard-sdk'
import type { ChatCardProfile } from '@/types/chatcard'

interface ChatAssistantPanelProps {
  rpId: string
  requestedScopes: ChatCardScopeLevel[]
}

// Helper to convert SDK profile to component profile
function convertProfile(sdkProfile: SDKProfile): ChatCardProfile {
  return {
    id: sdkProfile.card_id,
    displayName: sdkProfile.persona.display_name,
    handle: sdkProfile.persona.handle,
    primaryLanguage: sdkProfile.persona.primary_language,
    secondaryLanguages: sdkProfile.persona.secondary_languages,
    tone: sdkProfile.persona.tone,
    readingLevel: sdkProfile.persona.reading_level,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function ChatAssistantPanel({ rpId, requestedScopes }: ChatAssistantPanelProps) {
  const { status, tokenResult, connect, disconnect } = useChatCard(rpId)

  const handleConnect = () => {
    connect({ scopes: requestedScopes })
  }

  const componentProfile: ChatCardProfile | undefined = tokenResult?.profile
    ? convertProfile(tokenResult.profile)
    : undefined

  return (
    <div className="space-y-4">
      {/* Banner */}
      <ChatCardBanner
        status={status}
        requestedScopes={requestedScopes}
        profile={componentProfile}
        rpId={rpId}
        onConnect={handleConnect}
        onDisconnect={disconnect}
      />

      {/* AI Assistant Panel */}
      <div className="cc-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-cc-text">AI Assistant</h3>
          {status === 'connected' && tokenResult && componentProfile && (
            <ChatCardIndicator
              profile={componentProfile}
              scopes={requestedScopes}
              onDisconnect={disconnect}
            />
          )}
        </div>

        {status === 'connected' && tokenResult && (
          <div className="mb-4 p-3 rounded-lg bg-cc-surface border border-cc-border">
            <p className="text-xs text-cc-text-muted mb-1">Using ChatCard persona:</p>
            <p className="text-sm text-cc-text font-semibold">
              {tokenResult.profile.persona.display_name}
            </p>
            <p className="text-xs text-cc-text-muted mt-1">
              {tokenResult.profile.persona.primary_language.toUpperCase()} · {tokenResult.profile.persona.tone} · {tokenResult.profile.scope_level}
            </p>
          </div>
        )}

        {/* Chat input area */}
        <div className="space-y-2">
          <textarea
            placeholder={status === 'connected' ? "Ask your AI assistant..." : "Connect your ChatCard to use AI assistant"}
            disabled={status !== 'connected'}
            className="w-full rounded-xl border border-cc-border bg-cc-surface-soft p-3 text-sm text-cc-text placeholder-cc-text-muted focus:outline-none focus:border-cc-cyan disabled:opacity-50"
            rows={4}
          />
          <button
            disabled={status !== 'connected'}
            className="cc-btn cc-btn-primary w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
