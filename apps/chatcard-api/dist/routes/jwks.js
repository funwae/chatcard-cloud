import { Router } from 'express';
import { prisma } from '../db/prisma.js';
export const jwksRouter = Router();
/**
 * GET /.well-known/chatcard/agent-keys.json
 * JWKS endpoint for Agent JWT verification
 * Returns active Ed25519 public keys in JWK format
 */
jwksRouter.get('/agent-keys.json', async (req, res) => {
    try {
        // Get all active keys from users (for now, we'll use user keys as agent keys)
        // In production, you might have a separate AgentKey model
        const activeKeys = await prisma.key.findMany({
            where: { status: 'ACTIVE' },
            include: { user: true },
            take: 100, // Limit to prevent huge responses
        });
        const keys = activeKeys.map((key, index) => {
            // Convert base64 public key to JWK format
            // Ed25519 public keys are 32 bytes
            const publicKeyBytes = Buffer.from(key.publicKeyBase64, 'base64');
            // Ed25519 JWK format
            // For Ed25519, we need to convert the raw public key to JWK
            // The public key is the x coordinate (32 bytes) in base64url
            const x = publicKeyBytes.toString('base64url');
            return {
                kty: 'OKP', // Octet Key Pair
                crv: 'Ed25519',
                kid: `${key.user.did}-${key.id.slice(0, 8)}`, // Key ID from DID + key ID
                x, // Public key (base64url)
                use: 'sig',
                alg: 'EdDSA',
            };
        });
        const jwks = {
            keys,
        };
        res.set({
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        });
        res.json(jwks);
    }
    catch (error) {
        console.error('Error generating JWKS:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=jwks.js.map