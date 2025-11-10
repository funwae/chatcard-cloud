'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`cc-header sticky top-0 z-50 backdrop-blur-sm border-b transition-colors ${
      scrolled ? 'bg-cc-surface/80' : 'bg-transparent'
    } border-cc-border`}>
      <div className="cc-header-inner max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="cc-logo flex items-center gap-2 text-xl font-semibold text-cc-text" aria-label="ChatCard logo">
          <Image
            src="/chatcard-logo.svg"
            alt="ChatCard"
            width={40}
            height={40}
            className="w-10 h-10"
            unoptimized
          />
          <span>ChatCard</span>
        </Link>
        <nav className="cc-nav hidden md:flex items-center gap-6">
          <a href="#why" className="text-cc-text-muted hover:text-cc-text transition-colors">
            Why ChatCard
          </a>
          <a href="#how" className="text-cc-text-muted hover:text-cc-text transition-colors">
            How it works
          </a>
          <a href="#providers" className="text-cc-text-muted hover:text-cc-text transition-colors">
            For providers
          </a>
          <a href="#builders" className="text-cc-text-muted hover:text-cc-text transition-colors">
            For builders
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="#get-card" className="cc-btn cc-btn-outline text-sm hidden sm:inline-flex">
            Get your ChatCard
          </Link>
          <button
            className="md:hidden p-2 text-cc-text-muted hover:text-cc-text"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <nav className="cc-nav-mobile md:hidden border-t border-cc-border bg-cc-surface/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
            <a href="#why" className="text-cc-text-muted hover:text-cc-text transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Why ChatCard
            </a>
            <a href="#how" className="text-cc-text-muted hover:text-cc-text transition-colors" onClick={() => setMobileMenuOpen(false)}>
              How it works
            </a>
            <a href="#providers" className="text-cc-text-muted hover:text-cc-text transition-colors" onClick={() => setMobileMenuOpen(false)}>
              For providers
            </a>
            <a href="#builders" className="text-cc-text-muted hover:text-cc-text transition-colors" onClick={() => setMobileMenuOpen(false)}>
              For builders
            </a>
            <Link href="#get-card" className="cc-btn cc-btn-outline text-sm mt-2" onClick={() => setMobileMenuOpen(false)}>
              Get your ChatCard
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
