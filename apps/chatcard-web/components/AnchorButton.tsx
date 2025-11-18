'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AnchorStatus {
  state: 'QUEUED' | 'POSTED' | 'CONFIRMED' | 'FAILED';
  provider?: string;
  txid?: string;
  confirmedAt?: string;
}

export function AnchorButton({ mh }: { mh: string }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<AnchorStatus | null>(null);
  const [msg, setMsg] = useState<string | undefined>();
  const [polling, setPolling] = useState(false);

  const fetchStatus = async () => {
    try {
      const r = await fetch(`${API_URL}/api/anchors/${mh}`);
      if (r.ok) {
        const data = await r.json();
        setStatus(data);
        // Stop polling if in terminal state
        if (data.state === 'CONFIRMED' || data.state === 'FAILED') {
          setPolling(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch anchor status:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Poll every 2-3 seconds if not in terminal state
    if (polling && status && status.state !== 'CONFIRMED' && status.state !== 'FAILED') {
      const interval = setInterval(fetchStatus, 2500);
      return () => clearInterval(interval);
    }
  }, [mh, polling, status?.state]);

  const handleAnchor = async () => {
    setBusy(true);
    setMsg(undefined);

    try {
      const r = await fetch(`${API_URL}/api/proofs/${mh}/anchor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      const j = await r.json();
      if (r.ok) {
        setMsg('Anchor queued');
        setPolling(true);
        // Fetch status immediately
        setTimeout(fetchStatus, 500);
      } else {
        setMsg(j.error || 'Error');
      }
    } catch (error) {
      setMsg('Failed to queue anchor');
    } finally {
      setBusy(false);
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;

    const badges: Record<string, { label: string; className: string }> = {
      QUEUED: { label: 'Anchoring...', className: 'bg-yellow-100 text-yellow-800' },
      POSTED: { label: 'Posted', className: 'bg-blue-100 text-blue-800' },
      CONFIRMED: { label: 'Anchored', className: 'bg-green-100 text-green-800' },
      FAILED: { label: 'Failed', className: 'bg-red-100 text-red-800' },
    };

    const badge = badges[status.state];
    if (!badge) return null;

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleAnchor}
          disabled={busy || status?.state === 'CONFIRMED'}
          className="cc-btn cc-btn-secondary disabled:opacity-50"
        >
          {busy ? 'Queuing...' : status?.state === 'CONFIRMED' ? 'Anchored' : 'Anchor proof'}
        </button>
        {getStatusBadge()}
      </div>
      {status?.txid && (
        <p className="mt-2 text-xs text-cc-text-muted">
          TX: <code className="text-xs">{status.txid.slice(0, 16)}...</code>
        </p>
      )}
      {status?.state === 'FAILED' && (
        <p className="mt-2 text-xs text-red-600">Anchor failed. Please try again.</p>
      )}
      {msg && (
        <p className="mt-2 text-sm text-cc-text-muted">{msg}</p>
      )}
    </div>
  );
}

