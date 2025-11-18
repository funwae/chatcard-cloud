import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireOwner, requireAgentOrOwner } from '../middleware/auth.js';
import { requireScope } from '../middleware/agent-jwt.js';
import { CreateProposalSchema } from '../schemas.js';
import type { AuthRequest } from '../middleware/auth.js';

export const proposalsRouter = Router();

// POST /api/me/proposals - Agent proposes identity item
proposalsRouter.post('/', requireAgentOrOwner, requireScope('propose'), async (req: AuthRequest, res) => {
  try {
    if (!req.userDid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validated = CreateProposalSchema.parse(req.body);

    // Find user by DID
    const user = await prisma.user.findUnique({
      where: { did: req.userDid },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create proposal (expires in 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const proposal = await prisma.proposal.create({
      data: {
        userId: user.id,
        title: validated.title,
        url: validated.url,
        section: validated.section,
        authorship: validated.authorship,
        metadata: validated.metadata as any,
        expiresAt,
      },
    });

    res.status(201).json({
      id: proposal.id,
      title: proposal.title,
      section: proposal.section,
      status: proposal.status,
      createdAt: proposal.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request', details: error });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/me/proposals - List pending proposals (owner)
proposalsRouter.get('/', requireOwner, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const proposals = await prisma.proposal.findMany({
      where: {
        userId: req.userId,
        status: 'PENDING',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(proposals.map(p => ({
      id: p.id,
      title: p.title,
      url: p.url,
      section: p.section,
      authorship: p.authorship,
      metadata: p.metadata,
      createdAt: p.createdAt.toISOString(),
      expiresAt: p.expiresAt?.toISOString(),
    })));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/me/proposals/:id/approve - Approve & publish to card
proposalsRouter.post('/:id/approve', requireOwner, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const proposal = await prisma.proposal.findFirst({
      where: {
        id,
        userId: req.userId,
        status: 'PENDING',
      },
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Create card item
    const item = await prisma.cardItem.create({
      data: {
        userId: req.userId,
        title: proposal.title,
        url: proposal.url,
        section: proposal.section,
        authorship: proposal.authorship,
        metadata: proposal.metadata as any,
      },
    });

    // Update proposal status
    await prisma.proposal.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    res.json({
      id: item.id,
      title: item.title,
      section: item.section,
      createdAt: item.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/me/proposals/:id/reject - Reject proposal
proposalsRouter.post('/:id/reject', requireOwner, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const proposal = await prisma.proposal.findFirst({
      where: {
        id,
        userId: req.userId,
        status: 'PENDING',
      },
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    await prisma.proposal.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

