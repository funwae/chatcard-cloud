import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireOwner } from '../middleware/auth.js';
import { rateLimit } from 'express-rate-limit';
import type { AuthRequest } from '../middleware/auth.js';

export const userDataRouter = Router();

// Rate limit: 1 export per hour per user
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1,
  keyGenerator: (req: AuthRequest) => req.userId || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Export limit exceeded. Please try again in an hour.',
});

// GET /api/me/export - Export all user data (GDPR)
userDataRouter.get('/export', exportLimiter, requireOwner, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        keys: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            publicKeyBase64: true,
            createdAt: true,
            // Exclude private keys
          },
        },
        proofs: {
          select: {
            multihash: true,
            createdAt: true,
            // Exclude full document (can be fetched via /p/:mh)
          },
        },
        proposals: {
          select: {
            id: true,
            title: true,
            url: true,
            section: true,
            authorship: true,
            status: true,
            createdAt: true,
            expiresAt: true,
          },
        },
        items: {
          select: {
            id: true,
            section: true,
            title: true,
            url: true,
            authorship: true,
            visibility: true,
            status: true,
            tags: true,
            license: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        webauthnCredentials: {
          select: {
            id: true,
            createdAt: true,
            lastUsedAt: true,
            // Exclude publicKey for security
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Export data (exclude sensitive fields)
    const exportData = {
      profile: {
        id: user.id,
        handle: user.handle,
        did: user.did,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        tosVersion: user.tosVersion,
        tosAcceptedAt: user.tosAcceptedAt?.toISOString(),
      },
      keys: user.keys,
      proofs: user.proofs,
      proposals: user.proposals,
      items: user.items,
      webauthnCredentials: user.webauthnCredentials,
      exportedAt: new Date().toISOString(),
    };

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="chatcard-export-${user.handle}-${Date.now()}.json"`,
    });

    res.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/me/delete - Request account deletion (GDPR)
userDataRouter.post('/delete', requireOwner, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.deletedAt) {
      return res.status(400).json({ error: 'Account already marked for deletion' });
    }

    // Soft delete: mark for deletion, hard delete after 7 days
    const deletedAt = new Date();
    await prisma.user.update({
      where: { id: req.userId },
      data: { deletedAt },
    });

    // Destroy session
    req.session?.destroy(() => {
      res.json({
        ok: true,
        message: 'Account marked for deletion. Data will be permanently deleted after 7 days.',
        deletedAt: deletedAt.toISOString(),
      });
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

