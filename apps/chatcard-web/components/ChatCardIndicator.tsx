'use client'

import { useState } from 'react'
import { ChatCardProfile } from '@/types/chatcard'
import type { ChatCardScopeLevel, ChatCardTokenResult } from '@/types/chatcard-sdk'

interface ChatCardIndicatorProps {
  profile: ChatCardProfile
  scopes: ChatCardScopeLevel[]
  onDisconnect?: () => void
  onManage?: () => void
}

const scopeLabels: Record<ChatCardScopeLevel, string> = {
  read: 'Read-only',
  suggest: 'Suggest',
  act_with_confirmation: 'Act w/ confirm',
  act_unconfirmed: 'Act',
}

export function ChatCardIndicator({
  profile,
  scopes,
  onDisconnect,
  onManage,
}: ChatCardIndicatorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="cc-card p-3 flex items-center gap-3 hover:border-cc-cyan/50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cc-cyan via-cc-violet to-cc-pink flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
            {profile.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-cc-text truncate">
              {profile.displayName}
            </p>
            <p className="text-[10px] text-cc-text-muted truncate">
              {profile.primaryLanguage.toUpperCase()} · {profile.tone} · {scopes.map(s => scopeLabels[s]).join(', ')}
            </p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-cc-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 z-20 w-48 cc-card p-2">
            <button
              onClick={() => {
                onManage?.()
                setDropdownOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-cc-text-muted hover:text-cc-text hover:bg-cc-surface rounded-lg transition-colors"
            >
              View what&apos;s shared
            </button>
            <button
              onClick={() => {
                onDisconnect?.()
                setDropdownOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-cc-text-muted hover:text-cc-text hover:bg-cc-surface rounded-lg transition-colors"
            >
              Disconnect ChatCard
            </button>
          </div>
        </>
      )}
    </div>
  )
}

