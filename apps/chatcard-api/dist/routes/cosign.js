import { Router } from 'express';
import { z } from 'zod';
import { createHash } from 'crypto';
import { prisma } from '../db/prisma.js';
import { requireAgentOrOwner } from '../middleware/auth.js';
import { requireScope } from '../middleware/agent-jwt.js';
import { verifyEd25519 } from '../utils/ed25519.js';
import { resolveDidKey } from '../utils/did.js';
export const cosignRouter = Router();
const CosignBodySchema = z.object({
    cosignerDid: z.string().min(6),
    issuedAt: z.string().datetime(),
    publicKeyMultibase: z.string().optional(),
    signature: z.string().min(20),
    algorithm: z.enum(['Ed25519']).default('Ed25519'),
});
// Replay protection: reject issuedAt older than 10 min or future >2 min
function validateIssuedAt(issuedAt) {
    const issued = new Date(issuedAt);
    const now = new Date();
    const age = now.getTime() - issued.getTime();
    const future = issued.getTime() - now.getTime();
    if (age > 10 * 60 * 1000) {
        return { valid: false, error: 'issuedAt too old (max 10 minutes)' };
    }
    if (future > 2 * 60 * 1000) {
        return { valid: false, error: 'issuedAt too far in future (max 2 minutes)' };
    }
    return { valid: true };
}
// POST /api/proofs/:mh/cosign
cosignRouter.post('/:mh/cosign', requireAgentOrOwner, requireScope('proof:write'), async (req, res) => {
    try {
        const { mh } = req.params;
        const proof = await prisma.proof.findUnique({
            where: { multihash: mh },
        });
        if (!proof) {
            return res.status(404).json({ error: 'not_found' });
        }
        const { cosignerDid, issuedAt, publicKeyMultibase, signature } = CosignBodySchema.parse(req.body);
        // Validate timestamp (replay protection)
        const timestampCheck = validateIssuedAt(issuedAt);
        if (!timestampCheck.valid) {
            return res.status(400).json({ error: timestampCheck.error });
        }
        const ownerDid = proof.ownerDid;
        // Create canonical message
        const message = `cosign:v1|${mh}|${ownerDid}|${issuedAt}`;
        const messageHash = createHash('sha256').update(message).digest('base64url');
        // Resolve public key if not provided
        const key = publicKeyMultibase ?? (await resolveDidKey(cosignerDid));
        // Verify signature
        const ok = await verifyEd25519({
            message,
            signatureB64Url: signature,
            publicKeyMultibase: key,
        });
        if (!ok) {
            return res.status(400).json({ error: 'bad_signature' });
        }
        // Policy: cosigner must be in authors[] or be a trusted platform DID
        const document = proof.document;
        const authors = document?.claim?.authors ?? [];
        const isAuthor = authors.includes(cosignerDid);
        // TODO: Check trusted platform DIDs (create TrustedDid model if needed)
        // For now, allow if in authors list
        if (!isAuthor) {
            // In production, check: await prisma.trustedDid.findUnique({ where: { did: cosignerDid } })
            return res.status(403).json({ error: 'not_authorized_cosigner' });
        }
        // Idempotent insert (check by proofMh + cosignerDid + messageHash for replay protection)
        const exists = await prisma.cosignature.findFirst({
            where: { proofMh: mh, cosignerDid },
        });
        if (exists) {
            return res.status(409).json({ error: 'already_cosigned' });
        }
        // Additional replay check: same message hash (different timestamp = different message)
        // This is handled by the unique constraint on (proofMh, cosignerDid)
        await prisma.cosignature.create({
            data: {
                proofMh: mh,
                cosignerDid,
                signature,
                algorithm: 'Ed25519',
            },
        });
        // Update proof document to include cosignature
        const cosignatures = await prisma.cosignature.findMany({
            where: { proofMh: mh },
        });
        const updatedDocument = {
            ...document,
            cosignatures: cosignatures.map((cs) => ({
                cosignerDid: cs.cosignerDid,
                signature: cs.signature,
                algorithm: cs.algorithm,
                createdAt: cs.createdAt.toISOString(),
            })),
        };
        await prisma.proof.update({
            where: { multihash: mh },
            data: { document: updatedDocument },
        });
        res.json({ ok: true, tier: 'L4' });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return res.status(400).json({ error: 'Invalid request', details: error });
        }
        if (error instanceof Error && error.message === 'did_resolve_failed') {
            return res.status(400).json({ error: 'Failed to resolve DID' });
        }
        console.error('Co-sign error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=cosign.js.map