# Vercel Deployment Setup

## Important: Set Root Directory in Vercel Dashboard

The project is a monorepo with Next.js in `apps/chatcard-web`. You need to configure the root directory in Vercel:

1. Go to https://vercel.com/funwae/chatcard/settings
2. Under "General" → "Root Directory", set it to: `apps/chatcard-web`
3. Save the settings
4. Redeploy

## Alternative: Deploy from subdirectory

You can also deploy directly from the subdirectory:

```bash
cd apps/chatcard-web
vercel --prod --yes
```

But this won't work well with the monorepo structure since the API needs to be built too.

## Recommended: Use Root Directory Setting

The best approach is to:
1. Keep `vercel.json` in the root (as it is now)
2. Set Root Directory to `apps/chatcard-web` in Vercel dashboard
3. The build command in `vercel.json` will handle building the API and Next.js

## Current Configuration

- **Root Directory** (set in dashboard): `apps/chatcard-web`
- **Build Command**: `pnpm install && pnpm --filter @chatcard/api db:generate && pnpm --filter @chatcard/web build`
- **Output Directory**: `apps/chatcard-web/.next`
- **Framework**: Next.js

## Environment Variables

Make sure to set all required environment variables in Vercel dashboard:
- DATABASE_URL
- REDIS_URL
- SESSION_SECRET
- JWT_SECRET
- CORS_ORIGIN
- WEB_BASE_URL
- MAIL_FROM
- etc.

See `VERCEL_DEPLOYMENT.md` for full list.

