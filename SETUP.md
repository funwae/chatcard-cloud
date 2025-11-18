# ChatCard Proofs Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Database

Create a PostgreSQL database and set the connection string:

```bash
# In apps/chatcard-api/.env
DATABASE_URL="postgresql://user:password@localhost:5432/chatcard?schema=public"
```

Then run migrations:

```bash
cd apps/chatcard-api
pnpm db:push  # For development (creates schema)
# or
pnpm db:migrate  # For production (creates migration files)
```

### 3. Generate Prisma Client

```bash
cd apps/chatcard-api
pnpm db:generate
```

### 4. Build SDK Package

```bash
cd packages/chatcard-proof
pnpm build
```

### 5. Start Development Servers

In separate terminals:

```bash
# Terminal 1: API Server
cd apps/chatcard-api
pnpm dev

# Terminal 2: Web App
cd apps/chatcard-web
pnpm dev:3002
```

Or use the root scripts:

```bash
pnpm dev:api  # Starts API on :3001
pnpm dev:web  # Starts web on :3002
```

## Environment Variables

### API Service (`apps/chatcard-api/.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chatcard?schema=public"
API_PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3002
SESSION_SECRET=change-me-in-production-use-random-string
JWT_SECRET=change-me-in-production-use-random-string
RP_ID=localhost
RP_ORIGIN=http://localhost:3002
LOG_LEVEL=info
```

### Web App (`apps/chatcard-web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

## Project Structure

```
chatcard/
├── packages/
│   └── chatcard-proof/          # SDK package
│       ├── src/
│       │   ├── index.ts         # Main exports
│       │   ├── types.ts         # TypeScript types
│       │   ├── canon.ts         # Canonicalization
│       │   ├── htmlCanon.ts     # HTML canonicalization
│       │   ├── verify.ts        # Verification logic
│       │   └── embed.ts         # Embed helpers
│       └── package.json
├── apps/
│   ├── chatcard-api/            # Express API service
│   │   ├── src/
│   │   │   ├── index.ts         # Express app
│   │   │   ├── routes/          # API routes
│   │   │   ├── middleware/      # Auth, rate limiting
│   │   │   └── db/              # Prisma client
│   │   └── prisma/
│   │       └── schema.prisma    # Database schema
│   └── chatcard-web/            # Next.js web app
│       ├── app/
│       │   ├── me/              # Identity pages
│       │   ├── auth/            # Authentication
│       │   └── page.tsx         # Homepage
│       └── components/          # React components
└── pnpm-workspace.yaml
```

## API Endpoints

### Public Endpoints

- `GET /p/:multihash` - Fetch proof document
- `GET /me/:handle/card.json` - Get card manifest
- `GET /me/:handle/keys.json` - Get public keys
- `GET /.well-known/cardproofs/:hash.json` - Alternative proof hosting

### Authenticated Endpoints

- `POST /api/proofs` - Register proof (requires auth)
- `POST /api/me/proposals` - Create proposal
- `GET /api/me/proposals` - List proposals
- `POST /api/me/proposals/:id/approve` - Approve proposal
- `POST /api/me/proposals/:id/reject` - Reject proposal
- `GET /api/me/items` - List card items
- `POST /api/me/sections/:section/items` - Create item
- `PATCH /api/me/items/:id` - Update item
- `DELETE /api/me/items/:id` - Delete item
- `POST /api/me/keys/rotate` - Rotate key

## SDK Usage

```typescript
import { sign, verify, embedHtml } from '@chatcard/proof';

// Sign a resource
const { proof, multihash } = await sign(
  'https://example.com/resource',
  resourceContent,
  'image/svg+xml',
  'cc-bytes',
  'did:cc:abc123',
  privateKey,
  'mine',
  'public'
);

// Verify a proof
const result = await verify('https://example.com/resource');

// Generate embed code
const embedCode = embedHtml(proofUrl, digest);
```

## Next Steps

1. **Complete Authentication**: Implement WebAuthn with @simplewebauthn/server
2. **Agent JWT**: Implement Ed25519-signed JWT verification for agents
3. **Magic Links**: Add email magic link fallback for onboarding
4. **Co-signing**: Implement collaborative proof signing
5. **Anchors**: Add L2/L3 blockchain anchor support
6. **Media Embedders**: Add XMP, ID3, MP4 metadata embedding
7. **Tests**: Add unit and integration tests
8. **Documentation**: Generate OpenAPI/Swagger docs

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists: `createdb chatcard`

### Build Errors

- Run `pnpm install` from root
- Build SDK first: `cd packages/chatcard-proof && pnpm build`
- Check TypeScript errors: `pnpm typecheck`

### Port Conflicts

- API defaults to :3001, web to :3002
- Change in `.env` files if needed

