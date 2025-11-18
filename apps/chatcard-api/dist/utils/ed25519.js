import { verify } from '@noble/ed25519';
import { base58btc } from 'multiformats/bases/base58';
/**
 * Verify Ed25519 signature
 */
export async function verifyEd25519({ message, signatureB64Url, publicKeyMultibase, }) {
    try {
        const sig = Buffer.from(signatureB64Url, 'base64url');
        const pub = decodeMultibase(publicKeyMultibase);
        const messageBytes = new TextEncoder().encode(message);
        return await verify(sig, messageBytes, pub);
    }
    catch (error) {
        console.error('Ed25519 verification error:', error);
        return false;
    }
}
/**
 * Decode multibase-encoded public key (base58btc)
 */
function decodeMultibase(mb) {
    if (!mb.startsWith('z')) {
        throw new Error('Only base58btc (z prefix) multibase supported');
    }
    const b58 = mb.slice(1);
    return base58btc.decode(b58);
}
//# sourceMappingURL=ed25519.js.map