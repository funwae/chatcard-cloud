'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface CosignModalProps {
  mh: string;
  ownerDid: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CosignModal({ mh, ownerDid, isOpen, onClose }: CosignModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [canonicalMessage, setCanonicalMessage] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const issuedAt = new Date().toISOString();
    const message = `cosign:v1|${mh}|${ownerDid}|${issuedAt}`;
    setCanonicalMessage(message);

    // Generate QR code
    QRCode.toDataURL(message, { width: 256, margin: 2 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [isOpen, mh, ownerDid]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(canonicalMessage);
  };

  const handleDownload = () => {
    const blob = new Blob([canonicalMessage], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosign-message-${mh.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-cc-surface rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cc-text">Request Co-signature</h2>
          <button
            onClick={onClose}
            className="text-cc-text-muted hover:text-cc-text"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-cc-text-muted mb-2">
              Share this canonical message with the cosigner. They should sign it with their Ed25519 key.
            </p>
            <div className="bg-cc-bg p-3 rounded border border-cc-border">
              <code className="text-xs text-cc-text break-all">{canonicalMessage}</code>
            </div>
          </div>

          {qrDataUrl && (
            <div className="flex justify-center">
              <img src={qrDataUrl} alt="QR code" className="border border-cc-border rounded" />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 cc-btn cc-btn-secondary"
            >
              Copy Message
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 cc-btn cc-btn-secondary"
            >
              Download .txt
            </button>
          </div>

          <div className="pt-4 border-t border-cc-border">
            <p className="text-xs text-cc-text-muted">
              The cosigner should sign this message and submit it via the API or Proof Studio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

