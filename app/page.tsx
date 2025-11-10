'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChatCard } from '@/components/ChatCard'
import { ChatCardProfile, ChatCardScope, ChatCardStatus } from '@/types/chatcard'

const heroHighlights = [
  {
    title: 'Carry your tone',
    description: 'Languages, tone, and reading preferences stay on the card.',
  },
  {
    title: 'Bring your provider',
    description: 'Link the AI you trust once and let apps plug into it.',
  },
  {
    title: 'See clear actions',
    description: 'Pages declare the exact actions they want your card to run.',
  },
]

const whyPoints = [
  {
    title: 'One card, many apps',
    description: 'Every product is shipping its own chat box. ChatCard gives you one portable identity you can carry across them all.',
  },
  {
    title: 'Remembers how you talk',
    description: 'Your languages, tone, accessibility settings, and reading level travel with you so new apps start on the right foot.',
  },
  {
    title: 'Your provider, your choice',
    description: 'Link the AI provider you trust. Carditecture routes actions to that provider without locking you into anyone&apos;s UI.',
  },
  {
    title: 'You own your card, you control consent',
    description: 'Your ChatCard is yours. You decide which apps can use it, what actions they can request, and what permissions you grant. Every connection requires your explicit consent, and you can revoke access anytime.',
  },
]

const howSteps = [
  {
    title: 'The Card',
    summary: 'You carry a ChatCard with your name, avatar, languages, tone, and permissions.',
    bullets: [
      'Link it to the AI provider you trust.',
      'You choose what actions the card can take, app by app.',
      'Every permission requires your explicit consent.',
    ],
  },
  {
    title: 'Pages & Apps',
    summary: 'Web pages or native apps declare simple "do this with your card" actions.',
    bullets: [
      'Cards discover those actions automatically when you visit.',
      'Pages share just enough context for the action you pick.',
    ],
  },
  {
    title: 'Providers',
    summary: 'Providers receive a clean stream of usage events via Carditecture.',
    bullets: [
      'They see which card acted, on what surface, and why.',
      'They plug into Carditecture once instead of rebuilding UI.',
    ],
  },
]

const providerPoints = [
  'Plug into Carditecture once and appear anywhere a ChatCard does.',
  'Receive structured, user-consented events that keep context clean.',
  'Users own their cards and grant explicit permissions--you just receive clean, consented usage data.',
]

const builderPoints = [
  'Add a tiny JSON snippet to declare what your surface can do with a ChatCard.',
  'Optionally expose a lightweight context endpoint--no heavy SDKs required.',
  'Let the user&apos;s card decide permissions, providers, and presentation.',
]

const demoProfile: ChatCardProfile = {
  id: 'card_01HX9ZK0ABCDEF',
  displayName: 'Alex',
  handle: '@alex',
  primaryLanguage: 'en',
  secondaryLanguages: ['es', 'fr'],
  tone: 'calm',
  readingLevel: 'standard',
  accessibility: { largeText: true, highContrast: false },
  modelPreferences: { provider: 'open', model: 'balanced' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const demoScopes: ChatCardScope[] = [
  {
    id: 'read_page',
    label: 'Read page content',
    level: 'read',
    description: 'Let your AI read visible content on this page.',
    required: true,
  },
  {
    id: 'suggest_actions',
    label: 'Suggest actions',
    level: 'suggest',
    description: 'Let your AI suggest actions but not click or submit on its own.',
  },
  {
    id: 'act_with_confirmation',
    label: 'Act with confirmation',
    level: 'act_with_confirmation',
    description: 'Your AI can perform actions only after you confirm each one.',
  },
]

function HeroCardDemo() {
  const [status, setStatus] = useState<ChatCardStatus>('idle')

  const connect = () => {
    setStatus('connecting')
    setTimeout(() => {
      setStatus('connected')
    }, 1200)
  }

  const disconnect = () => {
    setStatus('revoked')
    setTimeout(() => setStatus('idle'), 800)
  }

  return (
    <div className="relative rounded-[32px] border border-cc-border bg-white/80 px-6 py-8 shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
      <div
        className="absolute inset-0 rounded-[32px] opacity-50 blur-3xl"
        style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.45), rgba(79,70,229,0.35), rgba(236,72,153,0.35))' }}
        aria-hidden="true"
      />
      <div className="relative">
        <ChatCard
          profile={demoProfile}
          scopes={demoScopes}
          status={status}
          variant="dark"
          onConnect={connect}
          onDisconnect={disconnect}
        />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section id="hero" className="cc-section">
          <div className="cc-section-inner grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="space-y-6">
              <p className="text-xs font-semibold tracking-[0.3em] text-cc-text-muted">
                CHATCARD · CARDITECTURE
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-cc-text sm:text-5xl">
                Your chat, on a card.
              </h1>
              <p className="text-lg text-cc-text-muted">
                ChatCard is a portable chat card you can carry across apps and sites. It remembers how you talk, links to the AI you
                trust, and clicks into AI-enabled content through Carditecture.
              </p>
              <p className="text-base font-semibold text-cc-text">
                You choose what actions the card can take, app by app.
              </p>
              <p className="text-base text-cc-text-muted">
                Instead of starting over in every product, you bring one card--with your name, tone, and history--and let apps plug into it.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <a href="#get-card" className="cc-btn cc-btn-primary">
                  Get your ChatCard
                </a>
                <a href="#how" className="cc-btn cc-btn-secondary">
                  See how Carditecture works
                </a>
              </div>
              <div className="grid gap-4 pt-2 sm:grid-cols-2">
                {heroHighlights.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-cc-border bg-white/70 p-4">
                    <p className="text-sm font-semibold text-cc-text">{item.title}</p>
                    <p className="text-sm text-cc-text-muted">{item.description}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-cc-text-muted">
                powered by <span className="text-cc-text">glyphd labs</span>
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-cc-cyan/30 via-cc-violet/20 to-cc-pink/20 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <HeroCardDemo />
              </div>
            </div>
          </div>
        </section>

        <section id="why" className="cc-section">
          <div className="cc-section-inner space-y-10">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cc-text-muted">WHY A CHATCARD</p>
              <h2 className="text-3xl font-semibold text-cc-text sm:text-4xl">Why a ChatCard?</h2>
              <p className="text-lg text-cc-text-muted">
                People teach every new app how they talk. ChatCard gives them one portable card, while Carditecture gives builders a simple
                way to plug into it.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {whyPoints.map((point) => (
                <article key={point.title} className="cc-card p-6">
                  <h3 className="text-xl font-semibold text-cc-text">{point.title}</h3>
                  <p className="mt-3 text-base text-cc-text-muted">{point.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="cc-section bg-white/60">
          <div className="cc-section-inner space-y-10">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cc-text-muted">HOW CARDITECTURE WORKS</p>
              <h2 className="text-3xl font-semibold text-cc-text sm:text-4xl">How Carditecture works</h2>
              <p className="text-lg text-cc-text-muted">
                Carditecture is the system that lets cards, pages, and providers stay in sync. Three pieces, one shared contract.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {howSteps.map((step) => (
                <article key={step.title} className="cc-card h-full p-6">
                  <div className="text-sm font-semibold uppercase tracking-wide text-cc-text-muted">{step.title}</div>
                  <p className="mt-3 text-lg font-semibold text-cc-text">{step.summary}</p>
                  <ul className="mt-4 space-y-2 text-sm text-cc-text-muted">
                    {step.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cc-cyan" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="providers" className="cc-section bg-[#eef2ff]">
          <div className="cc-section-inner grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cc-text-muted">FOR PROVIDERS</p>
              <h2 className="text-3xl font-semibold text-cc-text sm:text-4xl">Routes your models everywhere</h2>
              <p className="text-lg text-cc-text-muted">
                Carditecture lets one integration surface your models anywhere a ChatCard appears. The card carries consent and context so
                you can focus on intelligence, not UI plumbing.
              </p>
              <ul className="space-y-3 text-base text-cc-text">
                {providerPoints.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="text-cc-cyan" aria-hidden="true">•</span>
                    <span className="text-cc-text-muted">{point}</span>
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@chatcard.cloud?subject=Provider Early Access" className="cc-btn cc-btn-secondary w-fit">
                Provider docs (join early list)
              </a>
            </div>
            <div className="cc-card space-y-4 p-6">
              <h3 className="text-2xl font-semibold text-cc-text">What you receive</h3>
              <p className="text-base text-cc-text-muted">
                Structured events describing which ChatCard acted, which surface requested the action, and what scope was granted. No
                scraping, no mystery sessions.
              </p>
              <div className="rounded-2xl border border-dashed border-cc-border p-4 text-sm text-cc-text-muted">
                <p className="font-mono text-xs text-cc-text">event.card</p>
                <p>→ id, languages, tone (user-owned)</p>
                <p className="font-mono text-xs text-cc-text mt-3">event.surface</p>
                <p>→ action id, scopes, context summary</p>
                <p className="font-mono text-xs text-cc-text mt-3">event.provider</p>
                <p>→ provider id, model hint, result status</p>
              </div>
            </div>
          </div>
        </section>

        <section id="builders" className="cc-section">
          <div className="cc-section-inner grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
            <div className="cc-card p-6">
              <h3 className="text-2xl font-semibold text-cc-text">Drop-in actions for builders</h3>
              <p className="mt-4 text-base text-cc-text-muted">
                Declare actions like &quot;summarize this report&quot; or &quot;explain this chart.&quot; The ChatCard discovers them, fetches the right
                context, and talks to the user&apos;s provider.
              </p>
              <pre className="mt-6 rounded-2xl border border-cc-border bg-cc-surface p-4 text-xs text-cc-text-muted overflow-x-auto">
{`{
  "cardActions": [
    {
      "id": "summarize",
      "label": "Summarize this page",
      "scopes": ["read_page"],
      "context": "https://yoursite.com/context"
    }
  ]
}`}
              </pre>
            </div>
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cc-text-muted">FOR BUILDERS</p>
              <h2 className="text-3xl font-semibold text-cc-text sm:text-4xl">Add Carditecture in hours, not weeks</h2>
              <ul className="space-y-3 text-base text-cc-text-muted">
                {builderPoints.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="text-cc-cyan" aria-hidden="true">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <a href="#get-card" className="cc-btn cc-btn-primary w-fit">
                Join early builders
              </a>
            </div>
          </div>
        </section>

        <section id="nerd-note" className="cc-section">
          <div className="cc-section-inner">
            <div className="cc-card p-8 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cc-text-muted">NERD NOTE</p>
              <h3 className="mt-3 text-2xl font-semibold text-cc-text">If you&apos;re curious how it works</h3>
              <p className="mt-4 text-base text-cc-text-muted">
                Under the hood, Carditecture leans on internal Glyphd components like GlyphdIR and Tongbuku to keep cross-language memory in
                sync. They stay behind the scenes so all you see is one calm card that remembers you.
              </p>
            </div>
          </div>
        </section>

        <section id="get-card" className="cc-section">
          <div className="cc-section-inner max-w-3xl">
            <div className="cc-card p-8 md:p-10">
              <h2 className="text-3xl font-semibold text-cc-text">Get your ChatCard</h2>
              <p className="mt-4 text-lg text-cc-text-muted">
                Early cards are rolling out to a small waitlist. Tell us how you plan to use your card--personal research, professional
                workflows, or cross-org collab--and we&apos;ll send setup details as soon as they&apos;re ready.
              </p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <a href="mailto:hello@chatcard.cloud" className="cc-btn cc-btn-primary">
                  Email hello@chatcard.cloud
                </a>
                <a href="#providers" className="cc-btn cc-btn-secondary">
                  See integration paths
                </a>
              </div>
              <p className="mt-4 text-sm text-cc-text-muted">We reply with next steps, timelines, and how Carditecture fits your stack.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
