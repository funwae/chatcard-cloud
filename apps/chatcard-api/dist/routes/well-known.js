import { Router } from 'express';
import { prisma } from '../db/prisma.js';
export const wellKnownRouter = Router();
// GET /.well-known/card.json - Optional alias for primary handle
wellKnownRouter.get('/card.json', async (req, res) => {
    try {
        // TODO: Implement primary handle lookup
        // For now, return 404
        res.status(404).json({ error: 'Primary handle not configured' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /.well-known/cardproofs/:hash.json - Alternative proof hosting
wellKnownRouter.get('/cardproofs/:hash.json', async (req, res) => {
    try {
        const { hash } = req.params;
        const proof = await prisma.proof.findUnique({
            where: { multihash: hash },
        });
        if (!proof) {
            return res.status(404).json({ error: 'Proof not found' });
        }
        res.set({
            'Cache-Control': 'public, max-age=31536000, immutable',
            'ETag': `"${hash}"`,
            'Content-Type': 'application/json',
        });
        res.json(proof.document);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=well-known.js.map