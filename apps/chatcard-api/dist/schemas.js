import { z } from 'zod';
export const RegisterProofSchema = z.object({
    proof: z.object({
        type: z.literal('cc-proof'),
        version: z.string(),
        resource: z.object({
            url: z.string().url(),
            hash: z.string(),
            content_type: z.string(),
            canonicalization: z.enum(['cc-bytes', 'cc-html-1', 'cc-pdf-1', 'cc-md-1']),
        }),
        claim: z.object({
            owner: z.string(),
            authors: z.array(z.string()),
            authorship: z.enum(['mine', 'collab', 'remix', 'inspired']),
            license: z.string().optional(),
            visibility: z.enum(['public', 'unlisted', 'private']),
        }),
        signature: z.object({
            alg: z.literal('Ed25519'),
            public_key: z.string(),
            signature: z.string(),
            signed_at: z.string().datetime(),
        }),
        anchors: z.array(z.object({
            chain: z.string().optional(),
            txid: z.string().optional(),
            at: z.string().datetime().optional(),
        })).optional(),
    }),
    multihash: z.string(),
});
export const CreateProposalSchema = z.object({
    title: z.string().min(1),
    url: z.string().url().optional(),
    section: z.enum(['CREATIONS', 'COLLABS', 'INSPIRED', 'CAPABILITIES', 'LINKS']),
    authorship: z.enum(['mine', 'collab', 'remix', 'inspired']),
    metadata: z.record(z.any()).optional(),
});
export const CreateItemSchema = z.object({
    title: z.string().min(1),
    url: z.string().url().optional(),
    section: z.enum(['CREATIONS', 'COLLABS', 'INSPIRED', 'CAPABILITIES', 'LINKS']),
    authorship: z.enum(['mine', 'collab', 'remix', 'inspired']),
    visibility: z.enum(['public', 'unlisted', 'private']).default('public'),
    status: z.enum(['SHIPPED', 'WIP', 'IDEA']).optional(),
    tags: z.array(z.string()).default([]),
    license: z.string().optional(),
    proofs: z.array(z.any()).default([]),
    metadata: z.record(z.any()).optional(),
});
export const UpdateItemSchema = CreateItemSchema.partial();
//# sourceMappingURL=schemas.js.map