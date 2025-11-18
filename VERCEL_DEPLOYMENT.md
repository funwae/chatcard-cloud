# Vercel Deployment Guide

This document describes how to deploy ChatCard to Vercel.

## Architecture

- **Next.js Frontend**: Deployed as Vercel's Next.js app
- **Express API**: Wrapped in serverless functions using `serverless-http`
- **Monorepo**: Uses pnpm workspaces

## Prerequisites

1. Vercel account
2. Environment variables configured (see below)
3. Database and Redis accessible from Vercel

## Quick Deploy

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Configuration

The `vercel.json` file in the root directory configures:

- **Root Directory**: `apps/chatcard-web` (Next.js app)
- **Build Command**: Generates Prisma client, then builds Next.js
- **Rewrites**: Routes API paths to serverless functions
- **Functions**: Sets max duration for API routes (30s)

## Environment Variables

Set these in Vercel dashboard (Settings → Environment Variables):

### Required

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis
REDIS_URL=redis://host:6379

# Session
SESSION_SECRET=your-secret-key-here

# JWT
JWT_SECRET=your-jwt-secret-here

# CORS
CORS_ORIGIN=https://chatcard.cloud,https://www.chatcard.cloud

# Web Base URL
WEB_BASE_URL=https://chatcard.cloud

# Mail
MAIL_FROM=noreply@chatcard.cloud
```

### Optional

```bash
# Anchor
ANCHOR_PROVIDER=none
ANCHORS_PER_DAY=10

# Logging
LOG_LEVEL=info
NODE_ENV=production
```

## API Routes

All Express API routes are accessible via:

- `/api/*` - API endpoints
- `/p/*` - Public proof endpoints
- `/.well-known/*` - Well-known endpoints
- `/docs` - OpenAPI documentation
- `/healthz`, `/ready`, `/status`, `/metrics` - Health checks

## Build Process

1. Install dependencies: `pnpm install`
2. Generate Prisma client: `pnpm --filter @chatcard/api db:generate`
3. Build Next.js: `cd apps/chatcard-web && pnpm build`

The Express API is imported from source and bundled by Next.js during build.

## Testing Locally

```bash
# Install Vercel CLI
npm install -g vercel

# Run local dev server (mimics Vercel)
vercel dev
```

## Troubleshooting

### Build Fails

- **Prisma errors**: Ensure `DATABASE_URL` is set and Prisma client is generated
- **Import errors**: Check that `serverless-http` is installed in API package
- **Type errors**: The API uses `strict: false` to allow source imports

### API Routes Not Working

- Verify `serverless-http` is installed: `pnpm --filter @chatcard/api list serverless-http`
- Check function logs in Vercel dashboard
- Ensure API route handler is properly imported

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Ensure SSL is configured if required by your database provider

### Environment Variables Not Loading

- Variables must be set in Vercel dashboard
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

## Notes

- The Express API runs as serverless functions (not a separate service)
- Worker processes (anchor jobs) need to run separately (not on Vercel)
- Consider using Vercel Cron Jobs for scheduled tasks
- For production, consider separate API deployment for better performance
- The API is imported from source (`src/serverless.ts`), not built separately

## Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Database accessible from Vercel
- [ ] Redis accessible from Vercel
- [ ] CORS origins configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Health checks passing (`/healthz`)

## Support

For issues, check:
- Vercel deployment logs
- Function logs in Vercel dashboard
- See `SETUP.md` for local setup reference
