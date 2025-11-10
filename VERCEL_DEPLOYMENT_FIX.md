# Vercel Auto-Deployment Fix Guide

## Common Issues and Solutions

### 1. Check GitHub Integration in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Git**
4. Verify:
   - Repository is connected: `funwae/chatcard-cloud`
   - Production Branch: `main`
   - Auto-deploy is enabled

### 2. Reconnect GitHub Repository

If auto-deploy isn't working:

1. In Vercel Dashboard → Settings → Git
2. Click **Disconnect** (if connected)
3. Click **Connect Git Repository**
4. Select `funwae/chatcard-cloud`
5. Ensure **Production Branch** is set to `main`
6. Enable **Automatic deployments from Git**

### 3. Check GitHub Webhook

1. Go to GitHub → `funwae/chatcard-cloud` → Settings → Webhooks
2. Look for a Vercel webhook (should be `https://api.vercel.com/v1/integrations/deploy/...`)
3. If missing, reconnect the repo in Vercel (step 2)

### 4. Verify Branch Settings

In Vercel Dashboard → Settings → Git:
- **Production Branch**: `main`
- **Preview Deployments**: Enabled
- **Automatic deployments from Git**: Enabled

### 5. Manual Trigger Test

After reconnecting, push a test commit:
```bash
git commit --allow-empty -m "Test Vercel deployment"
git push
```

### 6. Check Deployment Logs

If deployments aren't triggering:
1. Vercel Dashboard → Deployments
2. Check if any deployments appear after pushing
3. Look for error messages in the deployment logs

## If Still Not Working

1. **Remove and re-add the project** in Vercel
2. **Check GitHub App permissions**: GitHub → Settings → Applications → Vercel → should have repo access
3. **Verify repo is not archived** or restricted
4. **Check Vercel team/organization settings** if using a team account

