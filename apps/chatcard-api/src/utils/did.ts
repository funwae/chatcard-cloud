/**
 * Resolve DID to public key
 * For did:cc, fetches from well-known endpoint
 */
export async function resolveDidKey(did: string): Promise<string> {
  if (!did.startsWith('did:cc:')) {
    throw new Error('Only did:cc DIDs supported');
  }

  const id = did.split(':').pop();
  if (!id) {
    throw new Error('Invalid DID format');
  }

  const webBaseUrl = process.env.WEB_BASE_URL || 'http://localhost:3002';
  const url = `${webBaseUrl}/.well-known/did-cc/${id}.json`;

  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });

    if (!r.ok) {
      throw new Error(`DID resolve failed: ${r.status}`);
    }

    const j = await r.json();
    return (j.keys?.[0]?.publicKeyMultibase || j.keys?.[0]?.publicKey) as string;
  } catch (error) {
    console.error('DID resolution error:', error);
    throw new Error('did_resolve_failed');
  }
}

