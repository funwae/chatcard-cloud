import { verify } from '@noble/ed25519';
import type { ProofDocument, VerifyResult, ConformanceTier } from './types.js';
import { canonicalize, sha256Base64 } from './canon.js';

/**
 * Discover proof URL from HTTP headers or HTML meta tags
 */
export async function discoverProofUrl(url: string): Promise<string | null> {
  try {
    // Try fetching the resource
    const response = await fetch(url, { method: 'HEAD' });

    // Check Link header
    const linkHeader = response.headers.get('Link');
    if (linkHeader) {
      const matches = linkHeader.match(/<([^>]+)>;\s*rel=["']?cardproof["']?/i);
      if (matches?.[1]) {
        return matches[1];
      }
    }

    // Check Digest header
    const digestHeader = response.headers.get('Digest');
    if (digestHeader) {
      // Extract sha-256 digest
      const sha256Match = digestHeader.match(/sha-256=([^,;]+)/i);
      if (sha256Match?.[1]) {
        // Construct proof URL from digest
        // This is a placeholder - actual implementation would use multihash
        return null;
      }
    }

    // If HEAD doesn't work, try GET and parse HTML
    const htmlResponse = await fetch(url);
    const html = await htmlResponse.text();

    // Check for <link rel="cardproof">
    const linkMatch = html.match(/<link[^>]+rel=["']?cardproof["']?[^>]+href=["']([^"']+)["']/i);
    if (linkMatch?.[1]) {
      return linkMatch[1];
    }

    // Check for <meta name="card:digest">
    const metaMatch = html.match(/<meta[^>]+name=["']?card:digest["']?[^>]+content=["']([^"']+)["']/i);
    if (metaMatch?.[1]) {
      // Would need to construct proof URL from digest
      return null;
    }

    return null;
  } catch (error) {
    console.error('Error discovering proof URL:', error);
    return null;
  }
}

/**
 * Verify a proof document
 */
export async function verifyProof(
  proof: ProofDocument,
  resourceContent: Uint8Array | string
): Promise<VerifyResult> {
  try {
    // Step 1: Verify digest
    const canonical = await canonicalize(resourceContent, proof.resource.canonicalization);
    const computedHash = sha256Base64(canonical);

    // Extract hash from proof (format: sha256-BASE64DIGEST)
    const expectedHash = proof.resource.hash.replace(/^sha256-/, '');

    if (computedHash !== expectedHash) {
      return {
        valid: false,
        tier: 'L1',
        error: 'Hash mismatch',
      };
    }

    // Step 2: Verify signature (L2)
    const publicKeyBytes = Buffer.from(proof.signature.public_key, 'base64');
    const signatureBytes = Buffer.from(proof.signature.signature, 'base64');

    // Create message to verify (proof document without signature)
    const messageToVerify = JSON.stringify({
      type: proof.type,
      version: proof.version,
      resource: proof.resource,
      claim: proof.claim,
      anchors: proof.anchors,
    });
    const messageBytes = new TextEncoder().encode(messageToVerify);

    const signatureValid = await verify(signatureBytes, messageBytes, publicKeyBytes);

    if (!signatureValid) {
      return {
        valid: false,
        tier: 'L1',
        error: 'Invalid signature',
      };
    }

    // Determine tier
    let tier: ConformanceTier = 'L2'; // Signed
    if (proof.anchors && proof.anchors.length > 0) {
      tier = 'L3'; // Anchored
    }
    // L4 requires co-signatures
    if (proof.cosignatures && Array.isArray(proof.cosignatures) && proof.cosignatures.length > 0) {
      tier = 'L4'; // Co-signed
    }

    return {
      valid: true,
      tier,
      ownerDid: proof.claim.owner,
      authorship: proof.claim.authorship,
      anchors: proof.anchors,
    };
  } catch (error) {
    return {
      valid: false,
      tier: 'L1',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

