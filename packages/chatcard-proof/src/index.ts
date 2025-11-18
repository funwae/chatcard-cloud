import { sign as ed25519Sign, getPublicKey } from '@noble/ed25519';
import { sha256 } from 'multiformats/hashes/sha2';
import type { ProofDocument, ResourceDescriptor, Claim, Authorship, Visibility } from './types.js';
import { canonicalize, sha256Base64 } from './canon.js';
import { discoverProofUrl, verifyProof } from './verify.js';
import * as embed from './embed.js';

export * from './types.js';
export * from './embed.js';
export { discoverProofUrl, verifyProof } from './verify.js';

/**
 * Sign a resource and create a proof document
 */
export async function sign(
  resourceUrl: string,
  resourceContent: Uint8Array | string,
  contentType: string,
  canonicalization: 'cc-bytes' | 'cc-html-1' | 'cc-pdf-1' | 'cc-md-1',
  ownerDid: string,
  privateKey: Uint8Array,
  authorship: Authorship,
  visibility: Visibility = 'public',
  license?: string,
  authors?: string[]
): Promise<{ proof: ProofDocument; multihash: string }> {
  // Canonicalize and hash
  const canonical = await canonicalize(resourceContent, canonicalization);
  const hash = sha256Base64(canonical);
  const hashWithPrefix = `sha256-${hash}`;

  // Create resource descriptor
  const resource: ResourceDescriptor = {
    url: resourceUrl,
    hash: hashWithPrefix,
    content_type: contentType,
    canonicalization,
  };

  // Create claim
  const claim: Claim = {
    owner: ownerDid,
    authors: authors || [ownerDid],
    authorship,
    license,
    visibility,
  };

  // Create proof document (without signature)
  const proofDoc: Omit<ProofDocument, 'signature'> = {
    type: 'cc-proof',
    version: '1',
    resource,
    claim,
  };

  // Sign the proof document
  const messageToSign = JSON.stringify(proofDoc);
  const messageBytes = new TextEncoder().encode(messageToSign);
  const signatureBytes = await ed25519Sign(messageBytes, privateKey);
  const publicKeyBytes = getPublicKey(privateKey);

  // Create signature block
  const signature = {
    alg: 'Ed25519' as const,
    public_key: Buffer.from(publicKeyBytes).toString('base64'),
    signature: Buffer.from(signatureBytes).toString('base64'),
    signed_at: new Date().toISOString(),
  };

  // Complete proof document
  const proof: ProofDocument = {
    ...proofDoc,
    signature,
  };

  // Generate multihash of the proof document
  const proofBytes = new TextEncoder().encode(JSON.stringify(proof));
  const hashDigest = await sha256.digest(proofBytes);
  // Create multihash bytes: code (1 byte) + length (1 byte) + digest
  const multihashBytes = new Uint8Array(2 + hashDigest.digest.length);
  multihashBytes[0] = hashDigest.code;
  multihashBytes[1] = hashDigest.digest.length;
  multihashBytes.set(hashDigest.digest, 2);
  const multihash = Buffer.from(multihashBytes).toString('base64url');

  return { proof, multihash };
}

/**
 * Verify a proof by URL or content
 */
export async function verify(
  resourceUrl: string,
  resourceContent?: Uint8Array | string
): Promise<{ valid: boolean; tier: string; ownerDid?: string; authorship?: string; error?: string }> {
  // Discover proof URL
  const proofUrl = await discoverProofUrl(resourceUrl);
  if (!proofUrl) {
    return {
      valid: false,
      tier: 'L1',
      error: 'Proof URL not found',
    };
  }

  // Fetch proof document
  const proofResponse = await fetch(proofUrl);
  if (!proofResponse.ok) {
    return {
      valid: false,
      tier: 'L1',
      error: `Failed to fetch proof: ${proofResponse.statusText}`,
    };
  }

  const proofData = await proofResponse.json();
  const proof: ProofDocument = proofData as ProofDocument;

    // If content not provided, fetch it
    if (!resourceContent) {
      const contentResponse = await fetch(resourceUrl);
      if (!contentResponse.ok) {
        return {
          valid: false,
          tier: 'L1',
          error: `Failed to fetch resource: ${contentResponse.statusText}`,
        };
      }
      const arrayBuffer = await contentResponse.arrayBuffer();
      resourceContent = new Uint8Array(arrayBuffer);
    }

  // Verify proof
  return verifyProof(proof, resourceContent);
}

// Re-export embed functions
export const embedHtml = embed.embedHtml;
export const embedSvg = embed.embedSvg;

