'use client';

import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser';

import { API_URL } from '@/lib/api-config';

export function usePasskeyRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Get registration options
      const optionsRes = await fetch(`${API_URL}/api/auth/passkey/register/options`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!optionsRes.ok) {
        throw new Error('Failed to get registration options');
      }

      const options: PublicKeyCredentialCreationOptionsJSON = await optionsRes.json();

      // Step 2: Start registration with browser
      const attestationResponse = await startRegistration(options);

      // Step 3: Verify registration
      const verifyRes = await fetch(`${API_URL}/api/auth/passkey/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(attestationResponse),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || 'Registration verification failed');
      }

      const result = await verifyRes.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}

export function usePasskeyLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (handleOrEmail: string) => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Get authentication options
      const optionsRes = await fetch(`${API_URL}/api/auth/passkey/login/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          handle: handleOrEmail.includes('@') ? undefined : handleOrEmail,
          email: handleOrEmail.includes('@') ? handleOrEmail : undefined,
        }),
      });

      if (!optionsRes.ok) {
        const errorData = await optionsRes.json();
        throw new Error(errorData.error || 'Failed to get authentication options');
      }

      const options: PublicKeyCredentialRequestOptionsJSON = await optionsRes.json();

      // Step 2: Start authentication with browser
      const assertionResponse = await startAuthentication(options);

      // Step 3: Verify authentication
      const verifyRes = await fetch(`${API_URL}/api/auth/passkey/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(assertionResponse),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || 'Authentication verification failed');
      }

      const result = await verifyRes.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

