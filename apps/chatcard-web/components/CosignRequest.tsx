'use client';

import { useState } from 'react';
import { CosignModal } from './CosignModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface CosignRequestProps {
  mh: string;
  ownerDid?: string;
}

export function CosignRequest({ mh, ownerDid = 'did:cc:placeholder' }: CosignRequestProps) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const handleRequestCosign = () => {
    setShowModal(true);
  };

  const handleSubmitCosign = async () => {
    const cosignerDid = prompt('Cosigner DID?');
    if (!cosignerDid) return;

    const issuedAt = new Date().toISOString();
    const signature = prompt('Signature (base64url)?');
    if (!signature) return;

    const publicKeyMultibase = prompt('Public Key (multibase, optional)?') || undefined;

    setBusy(true);
    setStatus('');

    try {
      const payload: any = {
        cosignerDid,
        issuedAt,
        signature,
      };
      if (publicKeyMultibase) {
        payload.publicKeyMultibase = publicKeyMultibase;
      }

      const r = await fetch(`${API_URL}/api/proofs/${mh}/cosign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const j = await r.json();
      if (r.ok) {
        setStatus('Co-signed! Tier: L4');
        setShowSubmitForm(false);
      } else {
        setStatus(j.error || 'Failed');
      }
    } catch (error) {
      setStatus('Failed to co-sign');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <button
          onClick={handleRequestCosign}
          className="cc-btn cc-btn-secondary"
        >
          Request Co-sign
        </button>
        <button
          onClick={() => setShowSubmitForm(!showSubmitForm)}
          className="cc-btn cc-btn-secondary"
        >
          Submit Co-sign
        </button>
      </div>

      {showSubmitForm && (
        <div className="mt-4 p-4 bg-cc-bg rounded border border-cc-border">
          <button
            onClick={handleSubmitCosign}
            disabled={busy}
            className="cc-btn cc-btn-primary disabled:opacity-50"
          >
            {busy ? 'Processing...' : 'Submit Co-signature'}
          </button>
        </div>
      )}

      {status && (
        <p className="mt-2 text-sm text-cc-text-muted">{status}</p>
      )}

      <CosignModal
        mh={mh}
        ownerDid={ownerDid}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

