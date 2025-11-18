'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePasskeyRegistration } from '@/hooks/usePasskey';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = usePasskeyRegistration();
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    try {
      const result = await register();
      setSuccess(true);
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/me/dashboard');
      }, 1500);
    } catch (err) {
      // Error is handled by the hook
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-cc-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-cc-text mb-4">Create your Card</h1>
        <p className="text-cc-text-muted mb-8">
          Get started with your portable AI identity using a secure passkey
        </p>
        {success ? (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
            Passkey created successfully! Redirecting...
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full cc-btn cc-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating passkey...' : 'Create with Passkey'}
            </button>
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                {error}
              </div>
            )}
            <p className="text-sm text-cc-text-muted text-center">
              A passkey uses your device&apos;s biometric authentication (Face ID, Touch ID, Windows Hello, etc.)
            </p>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-cc-text-muted">
          Already have a Card?{' '}
          <a href="/auth/login" className="text-cc-violet hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

