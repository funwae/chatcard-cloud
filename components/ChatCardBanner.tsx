'use client'

import { useState, useEffect } from 'react'
import { ChatCard } from '@/components/ChatCard'
import { ChatCardProfile, ChatCardScope, ChatCardStatus } from '@/types/chatcard'
import type { ChatCardScopeLevel, ChatCardStatus as SDKStatus, ChatCardTokenResult } from '@/types/chatcard-sdk'

interface ChatCardBannerProps {
  status: SDKStatus
  requestedScopes: ChatCardScopeLevel[]
  profile?: ChatCardProfile
  rpId: string
  onConnect?: () => void
  onDisconnect?: () => void
}

const scopeLabels: Record<ChatCardScopeLevel, string> = {
  read: 'Read-only',
  suggest: 'Suggest',
  act_with_confirmation: 'Act with confirmation',
  act_unconfirmed: 'Act',
}

export function ChatCardBanner({
  status,
  requestedScopes,
  profile,
  rpId,
  onConnect,
  onDisconnect,
}: ChatCardBannerProps) {
  const [showCard, setShowCard] = useState(false)

  // Convert SDK status to component status
  const cardStatus: ChatCardStatus = 
    status === 'connected' ? 'connected' :
    status === 'connecting' ? 'connecting' :
    'idle'

  // Convert scopes to ChatCardScope format
  const scopes: ChatCardScope[] = requestedScopes.map((level, idx) => ({
    id: `scope_${idx}`,
    label: scopeLabels[level],
    level: level as ChatCardScope['level'],
    description: `Allow AI to ${level === 'read' ? 'read content' : level === 'suggest' ? 'suggest actions' : level === 'act_with_confirmation' ? 'act with your confirmation' : 'act automatically'}`,
    required: level === 'read',
  }))

  // Convert SDK profile to component profile if needed
  const displayProfile: ChatCardProfile = profile || {
    id: 'card_01HX9ZK0ABCDEF',
    displayName: 'You',
    primaryLanguage: 'en',
    tone: 'casual',
    readingLevel: 'standard',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (status === 'unavailable') {
    return null
  }

  return (
    <div className="cc-card p-4 md:p-6">
      {status === 'disconnected' && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-cc-text-muted mb-2">
              This site supports ChatCard. Connect your ChatCard to bring your AI persona and permissions.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {requestedScopes.map((scope) => (
                <span
                  key={scope}
                  className="px-2 py-1 rounded-full text-xs font-mono bg-cc-surface border border-cc-border text-cc-text-muted"
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {showCard && (
              <div className="hidden md:block w-64">
                <ChatCard
                  profile={displayProfile}
                  scopes={scopes}
                  status="idle"
                  variant="dark"
                  compact
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowCard(!showCard)}
                className="text-xs text-cc-text-muted hover:text-cc-text transition-colors"
              >
                {showCard ? 'Hide' : 'Preview'} card
              </button>
              <button onClick={onConnect} className="cc-btn cc-btn-primary text-sm">
                Connect ChatCard
              </button>
            </div>
          </div>
        </div>
      )}

      {status === 'connecting' && (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-cc-text-muted">Waiting for ChatCard…</p>
            <div className="flex flex-wrap gap-2 mt-2 opacity-50">
              {requestedScopes.map((scope) => (
                <span
                  key={scope}
                  className="px-2 py-1 rounded-full text-xs font-mono bg-cc-surface border border-cc-border text-cc-text-muted"
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-cc-border border-t-cc-cyan" />
        </div>
      )}

      {status === 'connected' && profile && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-cc-text-muted mb-1">
              Using: <span className="text-cc-text font-semibold">{profile.displayName}</span>
              {' · '}
              {profile.primaryLanguage.toUpperCase()}
              {profile.secondaryLanguages && profile.secondaryLanguages.length > 0 && (
                <> / {profile.secondaryLanguages.map(l => l.toUpperCase()).join(' / ')}</>
              )}
              {' · '}
              {profile.tone}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Scope: {requestedScopes.map(s => scopeLabels[s]).join(' · ')}
              </span>
            </div>
          </div>
          <button onClick={onDisconnect} className="cc-btn cc-btn-secondary text-sm">
            Disconnect ChatCard
          </button>
        </div>
      )}
    </div>
  )
}

