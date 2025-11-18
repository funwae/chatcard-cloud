# ChatCard Monorepo

Monorepo for ChatCard Proofs (CC-Proof v1) implementation.

## Structure

- `packages/chatcard-proof` - TypeScript SDK for signing/verifying/embedding proofs
- `apps/chatcard-api` - Express API service (proof registry, proposals, keys)
- `apps/chatcard-web` - Next.js web app (existing site + /me pages + Proof Studio)

## Setup

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 14+

### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
cd apps/chatcard-api
pnpm db:generate
```

### Environment Variables

Create `.env` files in each app:

**apps/chatcard-api/.env:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/chatcard?schema=public"
API_PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3002
SESSION_SECRET=change-me-in-production
JWT_SECRET=change-me-in-production
RP_ID=localhost
RP_ORIGIN=http://localhost:3002
```

**apps/chatcard-web/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### Database Setup

```bash
cd apps/chatcard-api
pnpm db:push  # For development
# or
pnpm db:migrate  # For production migrations
```

## Development

```bash
# Run all apps in development
pnpm dev:web  # Web app on :3002
pnpm dev:api  # API on :3001

# Or run individually
cd apps/chatcard-web && pnpm dev:3002
cd apps/chatcard-api && pnpm dev
```

## Building

```bash
# Build all packages
pnpm build

# Build individual packages
pnpm build:web
pnpm build:api
pnpm build:proof
```

## Quick Start (90 seconds)

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up database:**
   ```bash
   cd apps/chatcard-api
   pnpm db:generate
   pnpm db:push
   ```

3. **Start services:**
   ```bash
   # Terminal 1: API
   pnpm dev:api

   # Terminal 2: Worker
   cd apps/chatcard-api && pnpm dev:worker

   # Terminal 3: Web
   pnpm dev:web
   ```

4. **Visit:** http://localhost:3002

See [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md) for production deployment checklist.

## Project Status

**Completed:**
- ✅ WebAuthn passkey authentication
- ✅ Magic link fallback
- ✅ Agent JWT signing and verification
- ✅ Co-signing support for proofs
- ✅ Anchor provider system (BullMQ)
- ✅ OpenAPI documentation
- ✅ Security hardening (CORS, CSP, rate limiting)
- ✅ User data export/delete (GDPR)

**In Progress:**
- 🔄 L2/L3 anchor provider implementations (stubs ready)
- 🔄 PDF and Markdown canonicalization
- 🔄 XMP, ID3, MP4 embedders
- 🔄 Full test coverage

## Documentation

- [Go-Live Checklist](./GO_LIVE_CHECKLIST.md) - Production readiness checklist
- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Abuse & Support](./docs/ABUSE_AND_SUPPORT.md) - Reporting and support channels
- [Backup & Restore](./docs/BACKUP_RESTORE.md) - Backup procedures and restore testing
- [Grafana Setup](./docs/GRAFANA_SETUP.md) - Monitoring dashboard setup
- [VibeTribe Integration](./docs/vibetribe/README.md) - VibeTribe module documentation
- [API Documentation](./apps/chatcard-api/README.md) - API endpoint reference (TODO)
- [SDK Documentation](./packages/chatcard-proof/README.md) - SDK usage guide (TODO)

## License

Private - All rights reserved
