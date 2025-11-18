import { OpenAPIRegistry, OpenAPIGenerator } from 'zod-to-openapi';
import { z } from 'zod';
import {
  RegisterProofSchema,
  CreateProposalSchema,
  CreateItemSchema,
  UpdateItemSchema,
} from '../schemas.js';

const registry = new OpenAPIRegistry();

// Common schemas
const ErrorSchema = registry.register(
  'Error',
  z.object({
    error: z.string(),
    details: z.any().optional(),
  })
);

const SuccessSchema = registry.register(
  'Success',
  z.object({
    success: z.boolean(),
  })
);

// Proof schemas
const ProofResourceSchema = registry.register(
  'ProofResource',
  z.object({
    url: z.string().url(),
    hash: z.string(),
    content_type: z.string(),
    canonicalization: z.enum(['cc-bytes', 'cc-html-1', 'cc-pdf-1', 'cc-md-1']),
  })
);

const ProofClaimSchema = registry.register(
  'ProofClaim',
  z.object({
    owner: z.string(),
    authors: z.array(z.string()),
    authorship: z.enum(['mine', 'collab', 'remix', 'inspired']),
    license: z.string().optional(),
    visibility: z.enum(['public', 'unlisted', 'private']),
  })
);

const ProofSignatureSchema = registry.register(
  'ProofSignature',
  z.object({
    alg: z.literal('Ed25519'),
    public_key: z.string(),
    signature: z.string(),
    signed_at: z.string().datetime(),
  })
);

const ProofAnchorSchema = registry.register(
  'ProofAnchor',
  z.object({
    chain: z.string().optional(),
    txid: z.string().optional(),
    at: z.string().datetime().optional(),
  })
);

const ProofDocumentSchema = registry.register(
  'ProofDocument',
  z.object({
    type: z.literal('cc-proof'),
    version: z.string(),
    resource: ProofResourceSchema,
    claim: ProofClaimSchema,
    signature: ProofSignatureSchema,
    anchors: z.array(ProofAnchorSchema).optional(),
  })
);

const RegisterProofRequestSchema = registry.register(
  'RegisterProofRequest',
  RegisterProofSchema
);

const RegisterProofResponseSchema = registry.register(
  'RegisterProofResponse',
  z.object({
    multihash: z.string(),
    url: z.string(),
  })
);

// Proposal schemas
const ProposalSchema = registry.register(
  'Proposal',
  z.object({
    id: z.string(),
    title: z.string(),
    url: z.string().url().optional(),
    section: z.enum(['CREATIONS', 'COLLABS', 'INSPIRED', 'CAPABILITIES', 'LINKS']),
    authorship: z.enum(['mine', 'collab', 'remix', 'inspired']),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED']),
    metadata: z.record(z.any()).optional(),
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime().optional(),
  })
);

const CreateProposalRequestSchema = registry.register(
  'CreateProposalRequest',
  CreateProposalSchema
);

// Item schemas
const CardItemSchema = registry.register(
  'CardItem',
  z.object({
    id: z.string(),
    userId: z.string(),
    section: z.enum(['CREATIONS', 'COLLABS', 'INSPIRED', 'CAPABILITIES', 'LINKS']),
    title: z.string(),
    url: z.string().url().optional(),
    authorship: z.enum(['mine', 'collab', 'remix', 'inspired']),
    visibility: z.enum(['public', 'unlisted', 'private']),
    status: z.enum(['SHIPPED', 'WIP', 'IDEA']).optional(),
    tags: z.array(z.string()),
    license: z.string().optional(),
    proofs: z.array(z.any()),
    metadata: z.record(z.any()).optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
);

const CreateItemRequestSchema = registry.register(
  'CreateItemRequest',
  CreateItemSchema
);

const UpdateItemRequestSchema = registry.register(
  'UpdateItemRequest',
  UpdateItemSchema
);

// Card manifest schema
const CardManifestSchema = registry.register(
  'CardManifest',
  z.object({
    version: z.string(),
    card: z.object({
      handle: z.string(),
      did: z.string(),
      name: z.string().optional(),
      langs: z.array(z.string()),
      links: z.array(z.object({
        type: z.string(),
        title: z.string(),
        url: z.string().url(),
      })),
      sections: z.object({
        creations: z.array(z.any()),
        collabs: z.array(z.any()),
        inspired: z.array(z.any()),
        capabilities: z.array(z.string()),
      }),
      policies: z.object({
        allowed_uses: z.array(z.string()),
        disallowed_uses: z.array(z.string()),
        rate_limit_per_agent_per_day: z.number(),
      }),
      agent: z.object({
        inbox: z.string(),
        events: z.string().optional(),
        pubkey: z.string().optional(),
      }),
      updated_at: z.string(),
    }),
  })
);

// Security schemes
registry.registerComponent('securitySchemes', 'AgentJWT', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Agent JWT signed with Ed25519. Get keys from /.well-known/chatcard/agent-keys.json',
});

registry.registerComponent('securitySchemes', 'SessionCookie', {
  type: 'apiKey',
  in: 'cookie',
  name: 'connect.sid',
  description: 'Session cookie from passkey authentication',
});

// Routes
const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';

// Public Proof Routes
registry.registerPath({
  method: 'get',
  path: '/p/{multihash}',
  summary: 'Get proof document',
  description: 'Fetch a proof document by multihash. Public endpoint with immutable caching.',
  tags: ['Proofs'],
  request: {
    params: z.object({
      multihash: z.string().describe('Multihash of the proof document'),
    }),
  },
  responses: {
    200: {
      description: 'Proof document',
      content: {
        'application/json': {
          schema: ProofDocumentSchema,
        },
      },
    },
    404: {
      description: 'Proof not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

// Authenticated Proof Routes
registry.registerPath({
  method: 'post',
  path: '/api/proofs',
  summary: 'Register proof',
  description: 'Register a new proof document. Requires authentication (owner session or agent JWT with proof:write scope).',
  tags: ['Proofs'],
  security: [{ AgentJWT: [] }, { SessionCookie: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterProofRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Proof registered successfully',
      content: {
        'application/json': {
          schema: RegisterProofResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: 'Authentication required',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    403: {
      description: 'Missing required scope',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/proofs/{multihash}/cosign',
  summary: 'Co-sign proof',
  description: 'Add a co-signature to an existing proof. Requires authentication with proof:write scope.',
  tags: ['Proofs'],
  security: [{ AgentJWT: [] }, { SessionCookie: [] }],
  request: {
    params: z.object({
      multihash: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Co-signature added',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    501: {
      description: 'Not yet implemented',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

// Proposal Routes
registry.registerPath({
  method: 'post',
  path: '/api/me/proposals',
  summary: 'Create proposal',
  description: 'Agent proposes an identity item to be added to a user\'s card. Requires authentication with propose scope.',
  tags: ['Proposals'],
  security: [{ AgentJWT: [] }, { SessionCookie: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateProposalRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Proposal created',
      content: {
        'application/json': {
          schema: ProposalSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/me/proposals',
  summary: 'List proposals',
  description: 'Get pending proposals for the authenticated user. Owner only.',
  tags: ['Proposals'],
  security: [{ SessionCookie: [] }],
  responses: {
    200: {
      description: 'List of proposals',
      content: {
        'application/json': {
          schema: z.array(ProposalSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/me/proposals/{id}/approve',
  summary: 'Approve proposal',
  description: 'Approve a proposal and add it to the user\'s card. Owner only.',
  tags: ['Proposals'],
  security: [{ SessionCookie: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Proposal approved',
      content: {
        'application/json': {
          schema: CardItemSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/me/proposals/{id}/reject',
  summary: 'Reject proposal',
  description: 'Reject a proposal. Owner only.',
  tags: ['Proposals'],
  security: [{ SessionCookie: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Proposal rejected',
      content: {
        'application/json': {
          schema: SuccessSchema,
        },
      },
    },
  },
});

// Item Routes
registry.registerPath({
  method: 'get',
  path: '/api/me/items',
  summary: 'List card items',
  description: 'Get all card items for the authenticated user. Owner only.',
  tags: ['Items'],
  security: [{ SessionCookie: [] }],
  responses: {
    200: {
      description: 'List of card items',
      content: {
        'application/json': {
          schema: z.array(CardItemSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/me/items/sections/{section}/items',
  summary: 'Create card item',
  description: 'Directly add an item to a card section. Owner only.',
  tags: ['Items'],
  security: [{ SessionCookie: [] }],
  request: {
    params: z.object({
      section: z.enum(['CREATIONS', 'COLLABS', 'INSPIRED', 'CAPABILITIES', 'LINKS']),
    }),
    body: {
      content: {
        'application/json': {
          schema: CreateItemRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Item created',
      content: {
        'application/json': {
          schema: CardItemSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/me/items/{id}',
  summary: 'Update card item',
  description: 'Update a card item. Owner only.',
  tags: ['Items'],
  security: [{ SessionCookie: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateItemRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Item updated',
      content: {
        'application/json': {
          schema: CardItemSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/me/items/{id}',
  summary: 'Delete card item',
  description: 'Delete a card item. Owner only.',
  tags: ['Items'],
  security: [{ SessionCookie: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Item deleted',
      content: {
        'application/json': {
          schema: SuccessSchema,
        },
      },
    },
  },
});

// Card Manifest Route
registry.registerPath({
  method: 'get',
  path: '/me/{handle}/card.json',
  summary: 'Get card manifest',
  description: 'Get the machine-readable card manifest for a user. Public endpoint.',
  tags: ['Cards'],
  request: {
    params: z.object({
      handle: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Card manifest',
      content: {
        'application/json': {
          schema: CardManifestSchema,
        },
      },
    },
    404: {
      description: 'User not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

// Keys Route
registry.registerPath({
  method: 'get',
  path: '/me/{handle}/keys.json',
  summary: 'Get public keys',
  description: 'Get active public keys for a user. Public endpoint.',
  tags: ['Keys'],
  request: {
    params: z.object({
      handle: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Public keys',
      content: {
        'application/json': {
          schema: z.object({
            did: z.string(),
            keys: z.array(z.object({
              publicKey: z.string(),
              createdAt: z.string().datetime(),
            })),
          }),
        },
      },
    },
  },
});

// JWKS Route
registry.registerPath({
  method: 'get',
  path: '/.well-known/chatcard/agent-keys.json',
  summary: 'Get JWKS',
  description: 'Get JSON Web Key Set for Agent JWT verification. Public endpoint.',
  tags: ['Keys'],
  responses: {
    200: {
      description: 'JWKS',
      content: {
        'application/json': {
          schema: z.object({
            keys: z.array(z.object({
              kty: z.string(),
              crv: z.string(),
              kid: z.string(),
              x: z.string(),
              use: z.string(),
              alg: z.string(),
            })),
          }),
        },
      },
    },
  },
});

// Passkey Auth Routes
registry.registerPath({
  method: 'post',
  path: '/api/auth/passkey/register/options',
  summary: 'Get passkey registration options',
  description: 'Generate options for passkey registration. Requires authenticated session.',
  tags: ['Authentication'],
  security: [{ SessionCookie: [] }],
  responses: {
    200: {
      description: 'Registration options',
      content: {
        'application/json': {
          schema: z.object({
            rp: z.object({
              name: z.string(),
              id: z.string(),
            }),
            user: z.object({
              id: z.string(),
              name: z.string(),
              displayName: z.string(),
            }),
            challenge: z.string(),
            pubKeyCredParams: z.array(z.any()),
            timeout: z.number(),
            attestation: z.string(),
            authenticatorSelection: z.object({
              authenticatorAttachment: z.string().optional(),
              userVerification: z.string(),
              requireResidentKey: z.boolean(),
            }),
            excludeCredentials: z.array(z.any()).optional(),
          }),
        },
      },
    },
    401: {
      description: 'Authentication required',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/passkey/register/verify',
  summary: 'Verify passkey registration',
  description: 'Verify and store a passkey credential after registration.',
  tags: ['Authentication'],
  security: [{ SessionCookie: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            rawId: z.string(),
            response: z.object({
              clientDataJSON: z.string(),
              attestationObject: z.string(),
              transports: z.array(z.string()).optional(),
            }),
            type: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Registration verified',
      content: {
        'application/json': {
          schema: z.object({
            verified: z.boolean(),
            userId: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Verification failed',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/passkey/login/options',
  summary: 'Get passkey login options',
  description: 'Generate options for passkey authentication.',
  tags: ['Authentication'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            handle: z.string().optional(),
            email: z.string().email().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Authentication options',
      content: {
        'application/json': {
          schema: z.object({
            challenge: z.string(),
            timeout: z.number(),
            rpId: z.string(),
            allowCredentials: z.array(z.object({
              id: z.string(),
              type: z.string(),
              transports: z.array(z.string()).optional(),
            })),
            userVerification: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Invalid credentials',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/passkey/login/verify',
  summary: 'Verify passkey login',
  description: 'Verify passkey authentication and create session.',
  tags: ['Authentication'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            rawId: z.string(),
            response: z.object({
              clientDataJSON: z.string(),
              authenticatorData: z.string(),
              signature: z.string(),
              userHandle: z.string().optional(),
            }),
            type: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Authentication verified',
      content: {
        'application/json': {
          schema: z.object({
            verified: z.boolean(),
            userId: z.string(),
            handle: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Verification failed',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/logout',
  summary: 'Logout',
  description: 'Destroy the current session.',
  tags: ['Authentication'],
  security: [{ SessionCookie: [] }],
  responses: {
    200: {
      description: 'Logged out successfully',
      content: {
        'application/json': {
          schema: SuccessSchema,
        },
      },
    },
  },
});

// Generate OpenAPI spec
const generator = new OpenAPIGenerator(registry.definitions);

export function generateOpenAPISpec() {
  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'ChatCard API',
      version: '1.0.0',
      description: `API for ChatCard Proofs (CC-Proof v1) - Portable AI identity with cryptographic proofs.

## Authentication

### Owner Authentication (Passkeys)
Owners authenticate using WebAuthn passkeys. The flow:
1. Register: POST /api/auth/passkey/register/options → verify → POST /api/auth/passkey/register/verify
2. Login: POST /api/auth/passkey/login/options → verify → POST /api/auth/passkey/login/verify

Sessions are managed via HTTP-only cookies.

### Agent Authentication (JWT)
Agents use Ed25519-signed JWTs with scopes:
- \`proof:write\` - Register and co-sign proofs
- \`propose\` - Create proposals for user cards

Get public keys from: \`/.well-known/chatcard/agent-keys.json\`

JWT Claims:
- \`iss\`: Issuer (did:cc:registry)
- \`sub\`: Subject (did:cc:...)
- \`aud\`: Audience (chatcard-api)
- \`scope\`: Array of scopes
- \`iat\`, \`exp\`: Issued at and expiration`,
      contact: {
        email: 'hello@chatcard.cloud',
      },
      license: {
        name: 'Private',
      },
    },
    servers: [
      {
        url: baseUrl,
        description: 'API Server',
      },
    ],
    tags: [
      { name: 'Proofs', description: 'Proof document management' },
      { name: 'Proposals', description: 'Agent proposals for card items' },
      { name: 'Items', description: 'Card item management' },
      { name: 'Cards', description: 'Card manifest endpoints' },
      { name: 'Keys', description: 'Public key management' },
      { name: 'Authentication', description: 'Passkey authentication' },
    ],
  });
}

