'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function ConnectContent() {
  const searchParams = useSearchParams()
  const [approved, setApproved] = useState(false)

  const rpId = searchParams.get('rp_id') || 'example.com'
  const scopesParam = searchParams.get('scopes') || 'read,suggest'
  const scopes = scopesParam.split(',').filter(Boolean)
  const redirectUri = searchParams.get('redirect_uri') || (typeof window !== 'undefined' ? window.location.origin : '')

  // Mock card data (in production, this would come from auth/session)
  const cardId = 'card_01HX9ZK0ABCDEF'
  const personaName = 'Hayden'
  const personaSummary = 'EN / ZH · casual tone · standard reading level · large text.'

  const scopeDetails = [
    {
      level: 'read',
      label: 'Read page content',
      description: 'Let the AI read visible content and metadata on this site.',
      color: 'sky',
    },
    {
      level: 'suggest',
      label: 'Suggest actions',
      description: 'AI can draft responses and propose changes, but you decide what to apply.',
      color: 'emerald',
    },
    {
      level: 'act_with_confirmation',
      label: 'Act with confirmation',
      description: 'AI can perform actions, but each requires your explicit confirmation.',
      color: 'amber',
    },
  ].filter(s => scopes.includes(s.level))

  const handleApprove = () => {
    setApproved(true)
    
    // Send approval message back to opener
    if (typeof window !== 'undefined' && window.opener) {
      window.opener.postMessage({
        type: 'chatcard-approved',
        rpId,
        scopes,
      }, redirectUri)
      
      // Close window after short delay
      setTimeout(() => {
        window.close()
      }, 500)
    } else if (typeof window !== 'undefined') {
      // If no opener, redirect back with token (simplified for demo)
      const params = new URLSearchParams({
        approved: 'true',
        rp_id: rpId,
      })
      window.location.href = `${redirectUri}?${params}`
    }
  }

  const handleDeny = () => {
    if (typeof window !== 'undefined' && window.opener) {
      window.opener.postMessage({
        type: 'chatcard-denied',
        rpId,
      }, redirectUri)
      window.close()
    } else if (typeof window !== 'undefined') {
      window.location.href = redirectUri
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-cc-surface">
        <div className="w-full max-w-lg rounded-3xl border border-cc-border bg-cc-surface-soft p-6 md:p-8 shadow-xl">
          <header className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cc-text-muted font-mono">
                Connect ChatCard
              </p>
              <h1 className="mt-2 text-xl font-semibold text-cc-text">
                Allow <span className="text-cc-cyan">{rpId}</span> to use your ChatCard?
              </h1>
            </div>
            <div className="text-right text-xs text-cc-text-muted">
              <p className="font-mono text-[11px]">{cardId.slice(0, 15)}…</p>
              <p>Persona: <span className="font-medium text-cc-text">{personaName}</span></p>
            </div>
          </header>

          {/* Persona summary */}
          <section className="mb-6 rounded-2xl border border-cc-border bg-cc-surface p-4 text-sm text-cc-text-muted">
            <p className="text-xs font-medium text-cc-text-muted mb-2">Your ChatCard persona</p>
            <p id="persona-summary">
              {personaSummary}
            </p>
          </section>

          {/* What will be shared */}
          <section className="mb-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-cc-text-muted font-mono">
              This site will know
            </p>
            <ul className="space-y-2 text-sm text-cc-text-muted">
              <li>• Your display name and language preferences.</li>
              <li>• Your preferred tone and accessibility settings.</li>
              <li>• The scope level you grant its AI helpers.</li>
              <li className="text-xs text-cc-text-muted mt-3">
                It will not receive your login credentials or full ChatCard history.
              </li>
            </ul>
          </section>

          {/* Requested scopes */}
          <section className="mb-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-cc-text-muted font-mono">
              Requested permissions
            </p>
            <div className="space-y-2" id="scope-list">
              {scopeDetails.map((scope) => (
                <div
                  key={scope.level}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-cc-border bg-cc-surface p-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-cc-text">{scope.label}</p>
                    <p className="text-[11px] text-cc-text-muted mt-1">
                      {scope.description}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-medium flex-shrink-0 ${
                    scope.color === 'sky' ? 'bg-sky-500/15 text-sky-300' :
                    scope.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-300' :
                    'bg-amber-500/15 text-amber-300'
                  }`}>
                    {scope.level}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[11px] text-cc-text-muted max-w-xs">
              You can revoke this site&apos;s access to your ChatCard at any time from your ChatCard settings.
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeny}
                className="cc-btn cc-btn-secondary text-sm"
              >
                Deny
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="cc-btn cc-btn-primary text-sm"
              >
                Approve &amp; continue
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function ConnectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cc-border border-t-cc-cyan" />
      </div>
    }>
      <ConnectContent />
    </Suspense>
  )
}

