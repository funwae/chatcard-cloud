'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const demoProof = {
    multihash: 'demo-proof-123',
    resource: {
      url: 'https://example.com/my-artwork.svg',
      hash: 'sha256-demo',
    },
    claim: {
      owner: 'did:cc:demo',
      authorship: 'mine',
    },
    tier: 'L2',
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-cc-bg">
        <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cc-text mb-2">Welcome to ChatCard</h1>
          <p className="text-cc-text-muted">
            Your portable AI identity in {Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-cc-surface rounded-lg border border-cc-border p-6">
              <h2 className="text-2xl font-bold text-cc-text mb-4">What is a ChatCard?</h2>
              <p className="text-cc-text-muted mb-4">
                A ChatCard is your portable identity that travels with you across apps and sites.
                It remembers how you talk, links to your chosen AI provider, and can interact with AI-enabled content.
              </p>
              <button
                onClick={() => setStep(2)}
                className="cc-btn cc-btn-primary"
              >
                Next: See a Proof
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-cc-surface rounded-lg border border-cc-border p-6">
              <h2 className="text-2xl font-bold text-cc-text mb-4">Example: Proof Document</h2>
              <p className="text-cc-text-muted mb-4">
                Here's a read-only example of a proof document. Proofs cryptographically link you to your work.
              </p>
              <div className="bg-cc-bg p-4 rounded border border-cc-border mb-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-cc-text">Resource:</span>{' '}
                    <a href={demoProof.resource.url} className="text-cc-violet hover:underline" target="_blank" rel="noopener noreferrer">
                      {demoProof.resource.url}
                    </a>
                  </div>
                  <div>
                    <span className="font-medium text-cc-text">Hash:</span>{' '}
                    <code className="text-xs">{demoProof.resource.hash}</code>
                  </div>
                  <div>
                    <span className="font-medium text-cc-text">Authorship:</span>{' '}
                    <span className="capitalize">{demoProof.claim.authorship}</span>
                  </div>
                  <div>
                    <span className="font-medium text-cc-text">Tier:</span>{' '}
                    <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-medium">
                      {demoProof.tier}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="cc-btn cc-btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="cc-btn cc-btn-primary"
                >
                  Next: Get Started
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-cc-surface rounded-lg border border-cc-border p-6">
              <h2 className="text-2xl font-bold text-cc-text mb-4">Quick Start</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cc-violet text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-cc-text mb-1">Create your Card</h3>
                    <p className="text-cc-text-muted text-sm">
                      Sign up with a magic link or passkey to create your portable identity.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cc-violet text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-cc-text mb-1">Sign your work</h3>
                    <p className="text-cc-text-muted text-sm">
                      Use Proof Studio to create cryptographic proofs for your creations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cc-violet text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-cc-text mb-1">Share your Card</h3>
                    <p className="text-cc-text-muted text-sm">
                      Your card is available at <code className="text-xs">/me/yourhandle</code> and as machine-readable JSON.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="cc-btn cc-btn-secondary"
                >
                  Back
                </button>
                <Link
                  href="/auth/register"
                  className="cc-btn cc-btn-primary"
                >
                  Create Your Card
                </Link>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </>
  );
}

