import { Router } from 'express';
import { z } from 'zod';
import { anchorQueue } from '../jobs/queues.js';
import { prisma } from '../db/prisma.js';
import { requireOwner } from '../middleware/auth.js';
export const anchorRouter = Router();
const anchorSchema = z.object({
    provider: z.enum(['none', 'opentimestamps', 'evm-l2']).optional(),
});
const ANCHORS_PER_DAY = Number(process.env.ANCHORS_PER_DAY) || 10; // Default: 10 anchors per day per user
// POST /api/proofs/:mh/anchor
anchorRouter.post('/:mh/anchor', requireOwner, async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { mh } = req.params;
        const { provider } = anchorSchema.parse(req.body);
        const p = provider ?? process.env.ANCHOR_DEFAULT_PROVIDER ?? 'none';
        // Verify proof exists and belongs to user
        const proof = await prisma.proof.findUnique({
            where: { multihash: mh },
        });
        if (!proof) {
            return res.status(404).json({ error: 'Proof not found' });
        }
        // Check if proof belongs to user
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });
        if (!user || proof.ownerDid !== user.did) {
            return res.status(403).json({ error: 'Proof does not belong to user' });
        }
        // Check daily anchor quota
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayAnchors = await prisma.anchor.count({
            where: {
                proof: {
                    ownerDid: user.did,
                },
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        if (todayAnchors >= ANCHORS_PER_DAY) {
            const retryAfter = Math.ceil((tomorrow.getTime() - Date.now()) / 1000);
            return res.status(429).json({
                error: 'anchor_quota_exceeded',
                message: `Daily anchor limit of ${ANCHORS_PER_DAY} reached`,
                retryAfter,
            });
        }
        await prisma.anchor.upsert({
            where: { proofMh: mh },
            update: { provider: p, state: 'QUEUED' },
            create: { proofMh: mh, provider: p, state: 'QUEUED' },
        });
        await anchorQueue.add('anchor', { proofMh: mh, provider: p });
        res.json({ ok: true, proofMh: mh, provider: p });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return res.status(400).json({ error: 'Invalid request', details: error });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/anchors/:mh
anchorRouter.get('/:mh', async (req, res) => {
    try {
        const { mh } = req.params;
        const anchor = await prisma.anchor.findUnique({
            where: { proofMh: mh },
        });
        if (!anchor) {
            return res.status(404).json({ error: 'not_found' });
        }
        res.json(anchor);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=anchor.js.map