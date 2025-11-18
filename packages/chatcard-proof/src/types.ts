import { z } from 'zod';

export type Canonicalization = 'cc-bytes' | 'cc-html-1' | 'cc-pdf-1' | 'cc-md-1';
export type Authorship = 'mine' | 'collab' | 'remix' | 'inspired';
export type Visibility = 'public' | 'unlisted' | 'private';
export type ConformanceTier = 'L1' | 'L2' | 'L3' | 'L4';

export const ResourceDescriptorSchema = z.object({
  url: z.string().url(),
  hash: z.string(), // sha256-BASE64DIGEST
  content_type: z.string(),
  canonicalization: z.enum(['cc-bytes', 'cc-html-1', 'cc-pdf-1', 'cc-md-1']),
});

export type ResourceDescriptor = z.infer<typeof ResourceDescriptorSchema>;

export const ClaimSchema = z.object({
  owner: z.string(), // did:cc:...
  authors: z.array(z.string()),
  authorship: z.enum(['mine', 'collab', 'remix', 'inspired']),
  license: z.string().optional(),
  visibility: z.enum(['public', 'unlisted', 'private']),
});

export type Claim = z.infer<typeof ClaimSchema>;

export const SignatureBlockSchema = z.object({
  alg: z.literal('Ed25519'),
  public_key: z.string(), // base64
  signature: z.string(), // base64
  signed_at: z.string().datetime(),
});

export type SignatureBlock = z.infer<typeof SignatureBlockSchema>;

export const AnchorSchema = z.object({
  chain: z.string().optional(),
  txid: z.string().optional(),
  at: z.string().datetime().optional(),
});

export type Anchor = z.infer<typeof AnchorSchema>;

export const ProofDocumentSchema = z.object({
  type: z.literal('cc-proof'),
  version: z.string(),
  resource: ResourceDescriptorSchema,
  claim: ClaimSchema,
  signature: SignatureBlockSchema,
  anchors: z.array(AnchorSchema).optional(),
});

export type ProofDocument = z.infer<typeof ProofDocumentSchema>;

export const VerifyResultSchema = z.object({
  valid: z.boolean(),
  tier: z.enum(['L1', 'L2', 'L3', 'L4']),
  ownerDid: z.string().optional(),
  authorship: z.enum(['mine', 'collab', 'remix', 'inspired']).optional(),
  anchors: z.array(AnchorSchema).optional(),
  error: z.string().optional(),
});

export type VerifyResult = z.infer<typeof VerifyResultSchema>;

