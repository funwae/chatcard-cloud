import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireAgentOrOwner } from '../middleware/auth.js';
import { requireScope } from '../middleware/agent-jwt.js';
import { proofLimiter } from '../middleware/rateLimit.js';
import { RegisterProofSchema } from '../schemas.js';
import type { AuthRequest } from '../middleware/auth.js';

export const proofsRouter = Router();

// POST /api/proofs - Register proof (agent/owner)
proofsRouter.post('/', proofLimiter, requireAgentOrOwner, requireScope('proof:write'), async (req: AuthRequest, res) => {
  try {
    const validated = RegisterProofSchema.parse(req.body);
    const { proof, multihash } = validated;

    // Verify the proof signature (basic check)
    // TODO: Full signature verification

    // Ensure specVersion is set (default to "1")
    const proofDoc = proof as any;
    if (!proofDoc.specVersion) {
      proofDoc.specVersion = '1';
    }

    // Store proof
    await prisma.proof.upsert({
      where: { multihash },
      create: {
        multihash,
        ownerDid: proof.claim.owner,
        document: proofDoc,
      },
      update: {
        document: proofDoc,
      },
    });

    res.status(201).json({ multihash, url: `/p/${multihash}` });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request', details: error });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Co-signing is handled by cosignRouter (mounted separately)
