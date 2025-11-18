'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { API_URL } from '@/lib/api-config';

interface ProofDocument {
  type: string;
  version: string;
  resource: {
    url: string;
    hash: string;
    content_type: string;
  };
  claim: {
    owner: string;
    authors: string[];
    authorship: string;
    visibility: string;
  };
  anchors?: Array<{
    chain: string;
    txid: string;
    at: string;
  }>;
  cosignatures?: Array<{
    cosignerDid: string;
    signature: string;
    algorithm: string;
    createdAt: string;
  }>;
}

export default function ProofPage() {
  const params = useParams();
  const mh = params.mh as string;
  const [proof, setProof] = useState<ProofDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mh) return;

    fetch(`${API_URL}/p/${mh}`)
      .then((r) => {
        if (!r.ok) throw new Error('Proof not found');
        return r.json();
      })
      .then((data) => {
        setProof(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [mh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cc-bg flex items-center justify-center">
        <p className="text-cc-text-muted">Loading proof...</p>
      </div>
    );
  }

  if (error || !proof) {
    return (
      <div className="min-h-screen bg-cc-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cc-text mb-2">Proof Not Found</h1>
          <p className="text-cc-text-muted">{error || 'The requested proof could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cc-bg">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-cc-text mb-4">Proof Document</h1>

          {/* Status badges */}
          <div className="flex gap-2 mb-4">
            {proof.anchors && proof.anchors.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                ✓ Anchored ({proof.anchors[0].chain})
              </span>
            )}
            {proof.cosignatures && proof.cosignatures.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                Co-signed ({proof.cosignatures.length})
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
              Tier: {proof.cosignatures?.length ? 'L4' : proof.anchors?.length ? 'L3' : 'L2'}
            </span>
          </div>
        </div>

        <div className="bg-cc-surface rounded-lg border border-cc-border p-6 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-cc-text-muted mb-1">Resource</h2>
            <p className="text-cc-text">
              <a href={proof.resource.url} target="_blank" rel="noopener noreferrer" className="text-cc-violet hover:underline">
                {proof.resource.url}
              </a>
            </p>
            <p className="text-sm text-cc-text-muted mt-1">
              Hash: <code className="text-xs">{proof.resource.hash}</code>
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-cc-text-muted mb-1">Claim</h2>
            <p className="text-cc-text">Owner: <code className="text-xs">{proof.claim.owner}</code></p>
            <p className="text-cc-text">Authorship: <span className="capitalize">{proof.claim.authorship}</span></p>
            <p className="text-cc-text">Visibility: <span className="capitalize">{proof.claim.visibility}</span></p>
          </div>

          {proof.anchors && proof.anchors.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-cc-text-muted mb-2">Anchors</h2>
              {proof.anchors.map((anchor, idx) => (
                <div key={idx} className="bg-cc-bg p-3 rounded border border-cc-border">
                  <p className="text-sm text-cc-text">Chain: {anchor.chain}</p>
                  <p className="text-sm text-cc-text">TX: <code className="text-xs">{anchor.txid}</code></p>
                  <p className="text-xs text-cc-text-muted">At: {new Date(anchor.at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {proof.cosignatures && proof.cosignatures.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-cc-text-muted mb-2">Co-signatures</h2>
              {proof.cosignatures.map((cosign, idx) => (
                <div key={idx} className="bg-cc-bg p-3 rounded border border-cc-border">
                  <p className="text-sm text-cc-text">Cosigner: <code className="text-xs">{cosign.cosignerDid}</code></p>
                  <p className="text-xs text-cc-text-muted">Algorithm: {cosign.algorithm}</p>
                  <p className="text-xs text-cc-text-muted">Signed: {new Date(cosign.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-cc-border">
            <p className="text-xs text-cc-text-muted">
              Multihash: <code>{mh}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

