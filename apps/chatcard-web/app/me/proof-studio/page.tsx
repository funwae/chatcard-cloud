'use client';

import { useState } from 'react';
import { sign, embedHtml, embedSvg } from '@chatcard/proof';
import { AnchorButton } from '@/components/AnchorButton';
import { CosignRequest } from '@/components/CosignRequest';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProofStudioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [authorship, setAuthorship] = useState<'mine' | 'collab' | 'remix' | 'inspired'>('mine');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [multihash, setMultihash] = useState<string | null>(null);

  async function handleSign() {
    if (!file) return;

    setLoading(true);
    try {
      // TODO: Get user's DID and private key from session
      const ownerDid = 'did:cc:placeholder';
      const privateKey = new Uint8Array(32); // TODO: Get from user's key

      const content = await file.arrayBuffer();
      const contentBytes = new Uint8Array(content);
      const contentType = file.type || 'application/octet-stream';
      const resourceUrl = URL.createObjectURL(file);

      const { proof, multihash } = await sign(
        resourceUrl,
        contentBytes,
        contentType,
        'cc-bytes',
        ownerDid,
        privateKey,
        authorship,
        'public'
      );

      // Generate embed code
      const proofUrl = `https://chatcard.cloud/p/${multihash}`;
      let embedCode = '';

      if (file.type.startsWith('image/svg')) {
        const svgText = await file.text();
        embedCode = embedSvg(
          svgText,
          proofUrl,
          ownerDid,
          proof.resource.hash,
          proof.signature.signature
        );
      } else {
        embedCode = embedHtml(proofUrl, proof.resource.hash);
      }

      setResult(embedCode);
      setMultihash(multihash);

      // Register proof with API
      try {
        const apiConfig = await import('@/lib/api-config');
        const apiUrl = apiConfig.API_URL || '';
        await fetch(`${apiUrl}/api/proofs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ proof, multihash }),
        });
      } catch (apiError) {
        console.error('Failed to register proof:', apiError);
        // Continue anyway - proof is created locally
      }
    } catch (error) {
      console.error('Failed to sign:', error);
      alert('Failed to create proof. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-cc-bg">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-cc-text mb-8">Proof Studio</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-cc-text mb-2">
              Upload Artifact
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-cc-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cc-violet file:text-white hover:file:brightness-110"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cc-text mb-2">
              Authorship
            </label>
            <select
              value={authorship}
              onChange={(e) => setAuthorship(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border border-cc-border bg-cc-surface text-cc-text"
            >
              <option value="mine">Mine</option>
              <option value="collab">Collaboration</option>
              <option value="remix">Remix</option>
              <option value="inspired">Inspired</option>
            </select>
          </div>

          <button
            onClick={handleSign}
            disabled={!file || loading}
            className="cc-btn cc-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing...' : 'Sign & Generate Proof'}
          </button>

          {result && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cc-text mb-2">
                  Embed Code
                </label>
                <textarea
                  value={result}
                  readOnly
                  className="w-full h-32 px-4 py-2 rounded-lg border border-cc-border bg-cc-surface text-cc-text font-mono text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="mt-2 cc-btn cc-btn-secondary"
                >
                  Copy to Clipboard
                </button>
              </div>
              {multihash && (
                <div className="pt-4 border-t border-cc-border space-y-4">
                  <div>
                    <p className="text-sm font-medium text-cc-text mb-2">Proof Actions</p>
                    <div className="flex gap-4">
                      <AnchorButton mh={multihash} />
                      <CosignRequest mh={multihash} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-cc-text-muted">
                      Proof URL: <code className="text-xs">{`/p/${multihash}`}</code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

