import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="cc-footer border-t border-cc-border bg-white">
      <div className="cc-footer-inner max-w-5xl mx-auto px-6 md:px-8 py-10 text-center">
        <div className="cc-footer-logo flex items-center justify-center gap-2 text-2xl font-semibold text-cc-text">
          <Image
            src="/chatcard-logo.svg"
            alt="ChatCard"
            width={40}
            height={40}
            className="w-10 h-10"
            unoptimized
          />
          <span>ChatCard</span>
        </div>
        <p className="mt-3 text-cc-text-muted">
          A portable chat card that moves with you across apps and sites.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm text-cc-text-muted">
          <a href="#why" className="hover:text-cc-text transition-colors">
            Why
          </a>
          <a href="#how" className="hover:text-cc-text transition-colors">
            How
          </a>
          <a href="#vibetribe" className="hover:text-cc-text transition-colors">
            VibeTribe
          </a>
          <a href="#proofs" className="hover:text-cc-text transition-colors">
            Proofs
          </a>
          <a href="#providers" className="hover:text-cc-text transition-colors">
            Providers
          </a>
          <a href="#builders" className="hover:text-cc-text transition-colors">
            Builders
          </a>
          <Link href="/docs" className="hover:text-cc-text transition-colors">
            Docs
          </Link>
          <Link href="/vibetribe" className="hover:text-cc-text transition-colors">
            VibeTribe Designer
          </Link>
          <Link href="/onboarding" className="hover:text-cc-text transition-colors">
            Onboarding
          </Link>
          <Link href="/privacy" className="hover:text-cc-text transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-cc-text transition-colors">
            Terms
          </Link>
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-cc-text-muted">
          powered by <span className="text-cc-text">glyphd labs</span>
        </p>
        <p className="mt-2 text-sm text-cc-text-muted">© {new Date().getFullYear()} ChatCard / chatcard.cloud.</p>
      </div>
    </footer>
  )
}
