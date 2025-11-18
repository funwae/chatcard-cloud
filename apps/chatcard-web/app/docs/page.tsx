import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ChatCard Docs – Portable AI Identity Standard',
  description: 'Developer documentation for the ChatCard portable AI identity standard: concepts, data model, scopes, and handshake flows.',
}

export default function DocsPage() {
  return (
    <>
      <Header />
      <main className="cc-main">
        {/* Intro */}
        <section className="cc-section bg-cc-surface">
          <div className="cc-section-inner">
            <p className="text-xs uppercase tracking-wider text-cc-text-muted mb-4 font-mono">
              DOCS · DRAFT SPEC v0.1
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-cc-text">ChatCard developer docs</h1>
            <p className="text-lg md:text-xl text-cc-text-muted mb-8 max-w-3xl">
              ChatCard is a portable chat card you can carry across apps and sites. This page describes how to integrate Carditecture into your site or app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a href="#concepts" className="cc-btn cc-btn-primary">
                Read the concepts
              </a>
              <a href="#handshake" className="cc-btn cc-btn-secondary">
                Jump to handshake flow
              </a>
            </div>
            <div className="cc-card p-6 bg-cc-surface-soft border-cc-border">
              <p className="text-sm text-cc-text-muted mb-2">
                <strong className="text-cc-text">New:</strong> See the complete <a href="/CHATCARD_PROTOCOL.md" className="text-cc-cyan hover:underline">ChatCard Protocol v0 Technical Spec</a> for the full protocol definition.
              </p>
              <p className="text-sm text-cc-text-muted">
                For partner integration guidance, see the <a href="/PARTNER_GUIDE.md" className="text-cc-cyan hover:underline">Partner Guide</a>.
              </p>
            </div>
          </div>
        </section>

        {/* Concepts */}
        <section id="concepts" className="cc-section">
          <div className="cc-section-inner">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-cc-text">Core concepts</h2>
            <p className="text-lg text-cc-text-muted mb-8 max-w-3xl">
              ChatCard doesn&apos;t replace your login or your auth provider. It runs <em>next to</em> those systems as a way for users to
              bring their own AI preferences and permissions into any compatible site or app.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-3 text-cc-text">Card</h3>
                <p className="text-cc-text-muted">
                  A <strong className="text-cc-text">ChatCard</strong> is a portable profile that lives under the user&apos;s control. It carries AI persona,
                  preferences, and a record of permissions granted to sites.
                </p>
              </article>
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-3 text-cc-text">Holder</h3>
                <p className="text-cc-text-muted">
                  The <strong className="text-cc-text">holder</strong> is the person + client (browser extension, app, OS assistant) that stores the card and
                  mediates consent when a site requests access.
                </p>
              </article>
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-3 text-cc-text">Relying party (RP)</h3>
                <p className="text-cc-text-muted">
                  A <strong className="text-cc-text">relying party</strong> (RP) is an AI-enabled site or app that wants to read the card and/or ask the
                  user&apos;s AI to act on their behalf, within agreed scopes.
                </p>
              </article>
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-3 text-cc-text">Agent</h3>
                <p className="text-cc-text-muted">
                  An <strong className="text-cc-text">agent</strong> is the AI system actually doing work (summarizing pages, filling forms, calling actions).
                  It could run client-side, server-side, or on a third-party provider.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Data model */}
        <section id="data-model" className="cc-section">
          <div className="cc-section-inner">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-cc-text">Data model</h2>
            <p className="text-lg text-cc-text-muted mb-8 max-w-3xl">
              ChatCard profiles are represented as signed JSON objects (often inside a JWT). The exact cryptographic format is out of
              scope for this draft; the payload shape is not.
            </p>
            <h3 className="text-2xl font-semibold mb-4 text-cc-text">Minimal payload</h3>
            <pre className="cc-code-block"><code>{`{
  "card_id": "card_01HX9ZK0ABCDEF",
  "sub": "user_pseudonymous_id",
  "iss": "https://chatcard.cloud",      // or another issuer
  "iat": 1731091200,
  "exp": 1733696800,
  "persona": {
    "display_name": "Hayden",
    "handle": "@hayden",
    "primary_language": "en",
    "secondary_languages": ["zh"],
    "tone": "casual",                   // neutral | casual | formal | playful | direct
    "reading_level": "standard",        // basic | standard | expert
    "accessibility": {
      "high_contrast": false,
      "large_text": true,
      "prefers_audio": false
    }
  },
  "ai_preferences": {
    "provider_hint": "openai",
    "model_hint": "gpt-5-thinking"
  },
  "permissions": {
    "default_scope_level": "suggest",   // read | suggest | act_with_confirmation | act_unconfirmed
    "site_grants": {
      "https://example.com": ["read_page", "suggest_actions"],
      "https://app.example.cn": ["read_page", "suggest_actions", "act_with_confirmation"]
    }
  },
  "privacy": {
    "log_depth": "minimal",             // minimal | standard | extended
    "allow_training": false,
    "share_trails_with_user_ai_only": true
  }
}`}</code></pre>
            <h3 className="text-2xl font-semibold mb-4 mt-8 text-cc-text">Key fields</h3>
            <ul className="space-y-3 text-cc-text-muted max-w-3xl">
              <li><code className="cc-code-inline">card_id</code>: Stable identifier for this card instance.</li>
              <li><code className="cc-code-inline">sub</code>: Pseudonymous subject identifier (not necessarily your login ID).</li>
              <li><code className="cc-code-inline">persona</code>: How the user prefers to be addressed and what they need to use AI comfortably.</li>
              <li><code className="cc-code-inline">ai_preferences</code>: Hints for model/provider selection; RPs may respect or ignore these.</li>
              <li><code className="cc-code-inline">permissions</code>: High-level scope defaults and per-site grants.</li>
              <li><code className="cc-code-inline">privacy</code>: User&apos;s declared preferences for logging and training.</li>
            </ul>
          </div>
        </section>

        {/* Scopes */}
        <section id="scopes" className="cc-section">
          <div className="cc-section-inner">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-cc-text">Scope levels</h2>
            <p className="text-lg text-cc-text-muted mb-8 max-w-3xl">
              ChatCard doesn&apos;t micromanage every possible action. Instead, it defines a small set of <strong className="text-cc-text">scope levels</strong>
              that RPs can interpret consistently.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-3 text-cc-text"><code className="cc-code-inline">read</code></h3>
                <p className="text-cc-text-muted mb-3">
                  The agent may read visible content and metadata from the page or app but may not draft or perform actions.
                </p>
                <p className="text-cc-text-muted"><strong className="text-cc-text">Example:</strong> Summarizing a document, explaining a UI, highlighting key sections.</p>
              </article>
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-3 text-cc-text"><code className="cc-code-inline">suggest</code></h3>
                <p className="text-cc-text-muted mb-3">
                  The agent may suggest actions (e.g., form fills, replies, commands) but cannot execute them without an explicit user
                  click in the RP UI.
                </p>
                <p className="text-cc-text-muted"><strong className="text-cc-text">Example:</strong> Drafting an email or filling a form with a &ldquo;Use suggestion&rdquo; button.</p>
              </article>
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-3 text-cc-text"><code className="cc-code-inline">act_with_confirmation</code></h3>
                <p className="text-cc-text-muted mb-3">
                  The agent may initiate actions, but each action requires a clear confirmation step in the RP&apos;s UI.
                </p>
                <p className="text-cc-text-muted"><strong className="text-cc-text">Example:</strong> &ldquo;Your AI wants to schedule this meeting — confirm?&rdquo;</p>
              </article>
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-3 text-cc-text"><code className="cc-code-inline">act_unconfirmed</code></h3>
                <p className="text-cc-text-muted mb-3">
                  The agent may perform actions without per-action confirmation, bounded by the RP&apos;s own safety constraints.
                </p>
                <p className="text-cc-text-muted"><strong className="text-cc-text">Example:</strong> Power-user automation in a trusted admin dashboard.</p>
              </article>
            </div>
            <p className="text-lg text-cc-text-muted mt-8 max-w-3xl">
              Individual RPs can define their own fine-grained scopes (e.g., <code className="cc-code-inline">&quot;read_page&quot;</code>, <code className="cc-code-inline">&quot;comment&quot;</code>,
              <code className="cc-code-inline">&quot;checkout&quot;</code>) but should map them to one of the levels above.
            </p>
          </div>
        </section>

        {/* Handshake flow */}
        <section id="handshake" className="cc-section">
          <div className="cc-section-inner">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-cc-text">Handshake flow (high level)</h2>
            <p className="text-lg text-cc-text-muted mb-8 max-w-3xl">
              ChatCard can reuse OAuth/OIDC-style flows, but conceptually the handshake is simple: a site asks, the holder mediates,
              the site gets a scoped token.
            </p>
            <ol className="space-y-8 max-w-3xl">
              <li>
                <h3 className="text-xl font-semibold mb-3 text-cc-text">1. RP advertises ChatCard support</h3>
                <p className="text-cc-text-muted">
                  The site exposes a header or meta tag (e.g. <code className="cc-code-inline">X-ChatCard-Support: 1</code>) and an endpoint for authorization
                  (e.g. <code className="cc-code-inline">/.well-known/chatcard-configuration</code>).
                </p>
              </li>
              <li>
                <h3 className="text-xl font-semibold mb-3 text-cc-text">2. Holder offers connection</h3>
                <p className="text-cc-text-muted">
                  A browser extension or system agent detects support and prompts the user: &ldquo;Connect your ChatCard to example.com?&rdquo;
                </p>
              </li>
              <li>
                <h3 className="text-xl font-semibold mb-3 text-cc-text">3. User reviews scopes</h3>
                <p className="text-cc-text-muted">
                  The holder shows requested scopes and the RP&apos;s identity. The user approves, edits, or rejects.
                </p>
              </li>
              <li>
                <h3 className="text-xl font-semibold mb-3 text-cc-text">4. RP receives a scoped token</h3>
                <p className="text-cc-text-muted mb-3">
                  On approval, the RP receives a signed token containing:
                </p>
                <ul className="list-disc list-inside space-y-2 text-cc-text-muted ml-4">
                  <li>Card ID and pseudonymous subject.</li>
                  <li>Persona fields relevant for this RP.</li>
                  <li>Authorized scopes for this RP.</li>
                  <li>Expiry and issuer info.</li>
                </ul>
              </li>
              <li>
                <h3 className="text-xl font-semibold mb-3 text-cc-text">5. RP uses the token to drive AI behavior</h3>
                <p className="text-cc-text-muted">
                  The RP configures its own agents/tools using the token info and keeps logs that respect the user&apos;s
                  <code className="cc-code-inline">privacy</code> preferences.
                </p>
              </li>
            </ol>
            <h3 className="text-2xl font-semibold mb-4 mt-12 text-cc-text">Configuration example</h3>
            <pre className="cc-code-block"><code>{`{
  "issuer": "https://chatcard.cloud",
  "authorization_endpoint": "https://chatcard.cloud/authorize",
  "token_endpoint": "https://chatcard.cloud/token",
  "jwks_uri": "https://chatcard.cloud/.well-known/jwks.json",
  "scopes_supported": ["read", "suggest", "act_with_confirmation"],
  "response_types_supported": ["code"]
}`}</code></pre>
          </div>
        </section>

        {/* Spec status & roadmap */}
        <section id="spec-status" className="cc-section">
          <div className="cc-section-inner">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-cc-text">Spec status &amp; roadmap</h2>
            <p className="text-lg text-cc-text-muted mb-6 max-w-3xl">
              ChatCard is currently a <strong className="text-cc-text">draft standard</strong> under active design. The goals for v0.1 are:
            </p>
            <ul className="space-y-3 text-cc-text-muted mb-8 max-w-3xl list-disc list-inside">
              <li>Lock the core data model (persona, preferences, permissions, privacy).</li>
              <li>Lock the basic handshake flow and configuration endpoints.</li>
              <li>Publish a minimal compliance checklist for RPs and holders.</li>
            </ul>
            <p className="text-lg text-cc-text-muted mb-6 max-w-3xl">
              Future revisions will add:
            </p>
            <ul className="space-y-3 text-cc-text-muted mb-8 max-w-3xl list-disc list-inside">
              <li>Formal JSON Schemas.</li>
              <li>Reference implementations (browser extension, server library).</li>
              <li>Deeper integration guidance for EarthCloud-style trails and AI-enabled content metadata.</li>
            </ul>
            <p className="text-lg text-cc-text-muted">
              If you&apos;re interested in shaping the spec, get in touch at <strong className="text-cc-text">[your contact details]</strong>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

