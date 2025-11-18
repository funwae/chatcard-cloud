import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireOwner } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

export const keysRouter = Router();

// GET /me/:handle/keys.json - Public key list (cache 10min)
keysRouter.get('/:handle/keys.json', async (req, res) => {
  try {
    const { handle } = req.params;
    const user = await prisma.user.findUnique({
      where: { handle },
      include: {
        keys: {
          where: { status: 'ACTIVE' },
          select: {
            publicKeyBase64: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.set({
      'Cache-Control': 'public, max-age=600', // 10 minutes
      'Content-Type': 'application/json',
    });

    res.json({
      did: user.did,
      keys: user.keys.map(k => ({
        publicKey: k.publicKeyBase64,
        createdAt: k.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/me/keys/rotate - Rotate owner key (owner only)
keysRouter.post('/keys/rotate', requireOwner, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { publicKeyBase64 } = req.body;
    if (!publicKeyBase64 || typeof publicKeyBase64 !== 'string') {
      return res.status(400).json({ error: 'Invalid public key' });
    }

    // Retire old keys
    await prisma.key.updateMany({
      where: {
        userId: req.userId,
        status: 'ACTIVE',
      },
      data: {
        status: 'RETIRED',
        retiredAt: new Date(),
      },
    });

    // Create new key
    const newKey = await prisma.key.create({
      data: {
        userId: req.userId,
        publicKeyBase64,
        status: 'ACTIVE',
      },
    });

    res.json({
      id: newKey.id,
      publicKey: newKey.publicKeyBase64,
      createdAt: newKey.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

