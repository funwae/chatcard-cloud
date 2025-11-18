'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MePage() {
  const router = useRouter();

  // TODO: Check if user is authenticated
  // If authenticated, redirect to their handle
  // If not, show "Get your Card" CTA

  return (
    <div className="min-h-screen bg-cc-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-cc-text mb-4">
          Get your ChatCard
        </h1>
        <p className="text-cc-text-muted mb-8">
          Create your portable AI identity and start carrying your persona, preferences, and permissions across AI-enabled apps.
        </p>
        <div className="space-y-4">
          <Link
            href="/auth/register"
            className="block w-full cc-btn cc-btn-primary"
          >
            Create your Card
          </Link>
          <Link
            href="/auth/login"
            className="block w-full cc-btn cc-btn-secondary"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

