import { z } from 'zod';
export declare const RegisterProofSchema: z.ZodObject<{
    proof: z.ZodObject<{
        type: z.ZodLiteral<"cc-proof">;
        version: z.ZodString;
        resource: z.ZodObject<{
            url: z.ZodString;
            hash: z.ZodString;
            content_type: z.ZodString;
            canonicalization: z.ZodEnum<["cc-bytes", "cc-html-1", "cc-pdf-1", "cc-md-1"]>;
        }, "strip", z.ZodTypeAny, {
            url?: string;
            hash?: string;
            content_type?: string;
            canonicalization?: "cc-bytes" | "cc-html-1" | "cc-pdf-1" | "cc-md-1";
        }, {
            url?: string;
            hash?: string;
            content_type?: string;
            canonicalization?: "cc-bytes" | "cc-html-1" | "cc-pdf-1" | "cc-md-1";
        }>;
        claim: z.ZodObject<{
            owner: z.ZodString;
            authors: z.ZodArray<z.ZodString, "many">;
            authorship: z.ZodEnum<["mine", "collab", "remix", "inspired"]>;
            license: z.ZodOptional<z.ZodString>;
            visibility: z.ZodEnum<["public", "unlisted", "private"]>;
        }, "strip", z.ZodTypeAny, {
            owner?: string;
            authors?: string[];
            authorship?: "mine" | "collab" | "remix" | "inspired";
            license?: string;
            visibility?: "public" | "unlisted" | "private";
        }, {
            owner?: string;
            authors?: string[];
            authorship?: "mine" | "collab" | "remix" | "inspired";
            license?: string;
            visibility?: "public" | "unlisted" | "private";
        }>;
        signature: z.ZodObject<{
            alg: z.ZodLiteral<"Ed25519">;
            public_key: z.ZodString;
            signature: z.ZodString;
            signed_at: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            signature?: string;
            alg?: "Ed25519";
            public_key?: string;
            signed_at?: string;
        }, {
            signature?: string;
            alg?: "Ed25519";
            public_key?: string;
            signed_at?: string;
        }>;
        anchors: z.ZodOptional<z.ZodArray<z.ZodObject<{
            chain: z.ZodOptional<z.ZodString>;
            txid: z.ZodOptional<z.ZodString>;
            at: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            at?: string;
            chain?: string;
            txid?: string;
        }, {
            at?: string;
            chain?: string;
            txid?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type?: "cc-proof";
        version?: string;
        resource?: {
            url?: string;
            hash?: string;
            content_type?: string;
            canonicalization?: "cc-bytes" | "cc-html-1" | "cc-pdf-1" | "cc-md-1";
        };
        claim?: {
            owner?: string;
            authors?: string[];
            authorship?: "mine" | "collab" | "remix" | "inspired";
            license?: string;
            visibility?: "public" | "unlisted" | "private";
        };
        signature?: {
            signature?: string;
            alg?: "Ed25519";
            public_key?: string;
            signed_at?: string;
        };
        anchors?: {
            at?: string;
            chain?: string;
            txid?: string;
        }[];
    }, {
        type?: "cc-proof";
        version?: string;
        resource?: {
            url?: string;
            hash?: string;
            content_type?: string;
            canonicalization?: "cc-bytes" | "cc-html-1" | "cc-pdf-1" | "cc-md-1";
        };
        claim?: {
            owner?: string;
            authors?: string[];
            authorship?: "mine" | "collab" | "remix" | "inspired";
            license?: string;
            visibility?: "public" | "unlisted" | "private";
        };
        signature?: {
            signature?: string;
            alg?: "Ed25519";
            public_key?: string;
            signed_at?: string;
        };
        anchors?: {
            at?: string;
            chain?: string;
            txid?: string;
        }[];
    }>;
    multihash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    proof?: {
        type?: "cc-proof";
        version?: string;
        resource?: {
            url?: string;
            hash?: string;
            content_type?: string;
            canonicalization?: "cc-bytes" | "cc-html-1" | "cc-pdf-1" | "cc-md-1";
        };
        claim?: {
            owner?: string;
            authors?: string[];
            authorship?: "mine" | "collab" | "remix" | "inspired";
            license?: string;
            visibility?: "public" | "unlisted" | "private";
        };
        signature?: {
            signature?: string;
            alg?: "Ed25519";
            public_key?: string;
            signed_at?: string;
        };
        anchors?: {
            at?: string;
            chain?: string;
            txid?: string;
        }[];
    };
    multihash?: string;
}, {
    proof?: {
        type?: "cc-proof";
        version?: string;
        resource?: {
            url?: string;
            hash?: string;
            content_type?: string;
            canonicalization?: "cc-bytes" | "cc-html-1" | "cc-pdf-1" | "cc-md-1";
        };
        claim?: {
            owner?: string;
            authors?: string[];
            authorship?: "mine" | "collab" | "remix" | "inspired";
            license?: string;
            visibility?: "public" | "unlisted" | "private";
        };
        signature?: {
            signature?: string;
            alg?: "Ed25519";
            public_key?: string;
            signed_at?: string;
        };
        anchors?: {
            at?: string;
            chain?: string;
            txid?: string;
        }[];
    };
    multihash?: string;
}>;
export declare const CreateProposalSchema: z.ZodObject<{
    title: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    section: z.ZodEnum<["CREATIONS", "COLLABS", "INSPIRED", "CAPABILITIES", "LINKS"]>;
    authorship: z.ZodEnum<["mine", "collab", "remix", "inspired"]>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    url?: string;
    authorship?: "mine" | "collab" | "remix" | "inspired";
    title?: string;
    section?: "CREATIONS" | "COLLABS" | "INSPIRED" | "CAPABILITIES" | "LINKS";
    metadata?: Record<string, any>;
}, {
    url?: string;
    authorship?: "mine" | "collab" | "remix" | "inspired";
    title?: string;
    section?: "CREATIONS" | "COLLABS" | "INSPIRED" | "CAPABILITIES" | "LINKS";
    metadata?: Record<string, any>;
}>;
export declare const CreateItemSchema: z.ZodObject<{
    title: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    section: z.ZodEnum<["CREATIONS", "COLLABS", "INSPIRED", "CAPABILITIES", "LINKS"]>;
    authorship: z.ZodEnum<["mine", "collab", "remix", "inspired"]>;
    visibility: z.ZodDefault<z.ZodEnum<["public", "unlisted", "private"]>>;
    status: z.ZodOptional<z.ZodEnum<["SHIPPED", "WIP", "IDEA"]>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    license: z.ZodOptional<z.ZodString>;
    proofs: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    proofs?: any[];
    status?: "SHIPPED" | "WIP" | "IDEA";
    url?: string;
    authorship?: "mine" | "collab" | "remix" | "inspired";
    license?: string;
    visibility?: "public" | "unlisted" | "private";
    title?: string;
    section?: "CREATIONS" | "COLLABS" | "INSPIRED" | "CAPABILITIES" | "LINKS";
    metadata?: Record<string, any>;
    tags?: string[];
}, {
    proofs?: any[];
    status?: "SHIPPED" | "WIP" | "IDEA";
    url?: string;
    authorship?: "mine" | "collab" | "remix" | "inspired";
    license?: string;
    visibility?: "public" | "unlisted" | "private";
    title?: string;
    section?: "CREATIONS" | "COLLABS" | "INSPIRED" | "CAPABILITIES" | "LINKS";
    metadata?: Record<string, any>;
    tags?: string[];
}>;
export declare const UpdateItemSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    section: z.ZodOptional<z.ZodEnum<["CREATIONS", "COLLABS", "INSPIRED", "CAPABILITIES", "LINKS"]>>;
    authorship: z.ZodOptional<z.ZodEnum<["mine", "collab", "remix", "inspired"]>>;
    visibility: z.ZodOptional<z.ZodDefault<z.ZodEnum<["public", "unlisted", "private"]>>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<["SHIPPED", "WIP", "IDEA"]>>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    license: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    proofs: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodAny, "many">>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    proofs?: any[];
    status?: "SHIPPED" | "WIP" | "IDEA";
    url?: string;
    authorship?: "mine" | "collab" | "remix" | "inspired";
    license?: string;
    visibility?: "public" | "unlisted" | "private";
    title?: string;
    section?: "CREATIONS" | "COLLABS" | "INSPIRED" | "CAPABILITIES" | "LINKS";
    metadata?: Record<string, any>;
    tags?: string[];
}, {
    proofs?: any[];
    status?: "SHIPPED" | "WIP" | "IDEA";
    url?: string;
    authorship?: "mine" | "collab" | "remix" | "inspired";
    license?: string;
    visibility?: "public" | "unlisted" | "private";
    title?: string;
    section?: "CREATIONS" | "COLLABS" | "INSPIRED" | "CAPABILITIES" | "LINKS";
    metadata?: Record<string, any>;
    tags?: string[];
}>;
//# sourceMappingURL=schemas.d.ts.map