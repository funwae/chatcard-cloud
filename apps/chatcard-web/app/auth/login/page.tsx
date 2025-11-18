'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePasskeyLogin } from '@/hooks/usePasskey';

import { API_URL } from '@/lib/api-config';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = usePasskeyLogin();
  const [handleOrEmail, setHandleOrEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [magicError, setMagicError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleOrEmail.trim()) return;

    try {
      const result = await login(handleOrEmail);
      // Redirect to dashboard
      router.push('/me/dashboard');
    } catch (err) {
      // Error is handled by the hook
      console.error('Login failed:', err);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleOrEmail.trim() || !handleOrEmail.includes('@')) {
      setMagicError('Please enter a valid email address');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/magic/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: handleOrEmail }),
      });

      if (res.ok) {
        setMagicSent(true);
      } else {
        const data = await res.json();
        setMagicError(data.error || 'Failed to send magic link');
      }
    } catch (err) {
      setMagicError('Failed to send magic link');
    }
  };

  return (
    <div className="min-h-screen bg-cc-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-cc-text mb-4">Sign in</h1>
        <p className="text-cc-text-muted mb-8">
          Sign in with your passkey or magic link
        </p>
        {magicSent ? (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
            Check your email for a sign-in link. It will expire in 15 minutes.
          </div>
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-4 mb-4">
              <div>
                <label htmlFor="handleOrEmail" className="block text-sm font-medium text-cc-text mb-2">
                  Handle or Email
                </label>
                <input
                  id="handleOrEmail"
                  type="text"
                  value={handleOrEmail}
                  onChange={(e) => setHandleOrEmail(e.target.value)}
                  placeholder="yourhandle or you@example.com"
                  className="w-full px-4 py-2 rounded-lg border border-cc-border bg-cc-surface text-cc-text focus:outline-none focus:ring-2 focus:ring-cc-violet"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !handleOrEmail.trim()}
                className="w-full cc-btn cc-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in with Passkey'}
              </button>
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                  {error}
                </div>
              )}
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cc-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-cc-bg text-cc-text-muted">Or</span>
              </div>
            </div>
            <form onSubmit={handleMagicLink} className="space-y-4">
              <button
                type="submit"
                disabled={!handleOrEmail.trim() || !handleOrEmail.includes('@')}
                className="w-full cc-btn cc-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Magic Link
              </button>
              {magicError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                  {magicError}
                </div>
              )}
            </form>
          </>
        )}
        <p className="mt-6 text-center text-sm text-cc-text-muted">
          Don&apos;t have a Card?{' '}
          <a href="/auth/register" className="text-cc-violet hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}

