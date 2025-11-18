'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { API_URL } from '@/lib/api-config';

export default function MagicConsumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('Missing token');
      return;
    }

    fetch(`${API_URL}/api/auth/magic/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then(() => {
        setStatus('Signed in! Redirecting...');
        setTimeout(() => {
          router.push('/me/dashboard');
        }, 1000);
      })
      .catch(() => {
        setStatus('Invalid or expired token');
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-cc-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-cc-text mb-4">Signing in...</h1>
        <p className="text-cc-text-muted">{status}</p>
      </div>
    </div>
  );
}

