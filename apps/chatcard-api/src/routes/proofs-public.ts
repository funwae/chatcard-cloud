import { Router } from 'express';
import { prisma } from '../db/prisma.js';

export const proofsPublicRouter = Router();

// GET /p/:mh - Fetch proof JSON (public, immutable cache)
proofsPublicRouter.get('/:mh', async (req, res) => {
  try {
    const { mh } = req.params;
    const proof = await prisma.proof.findUnique({
      where: { multihash: mh },
      include: {
        anchor: true,
        cosignatures: true,
      },
    });

    if (!proof) {
      return res.status(404).json({ error: 'Proof not found' });
    }

    // Enhance document with anchor and cosignatures if available
    const document = proof.document as any;

    // Ensure specVersion is present (default to "1" if missing)
    if (!document.specVersion) {
      document.specVersion = '1';
    }

    if (proof.anchor && proof.anchor.state === 'CONFIRMED') {
      document.anchors = [
        {
          chain: proof.anchor.provider,
          txid: proof.anchor.txid,
          at: proof.anchor.confirmedAt?.toISOString(),
        },
      ];
    }

    if (proof.cosignatures.length > 0 && !document.cosignatures) {
      document.cosignatures = proof.cosignatures.map((cs) => ({
        cosignerDid: cs.cosignerDid,
        signature: cs.signature,
        algorithm: cs.algorithm,
        createdAt: cs.createdAt.toISOString(),
      }));
    }

    // Privacy audit: ensure no PII leakage
    // Remove any fields that might contain email, IP, or other PII
    delete document.email;
    delete document.ip;
    delete document.userAgent;

    // Set immutable cache headers
    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable',
      'ETag': `"${mh}"`,
    });

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// HEAD /p/:mh - Existence check
proofsPublicRouter.head('/:mh', async (req, res) => {
  try {
    const { mh } = req.params;
    const proof = await prisma.proof.findUnique({
      where: { multihash: mh },
      select: { multihash: true },
    });

    if (!proof) {
      return res.status(404).end();
    }

    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable',
      'ETag': `"${mh}"`,
    });
    res.status(200).end();
  } catch (error) {
    res.status(500).end();
  }
});

