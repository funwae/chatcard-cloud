import { Router } from 'express';
import { z } from 'zod';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '../db/prisma.js';
import { magicLinkLimiter, magicLinkHourlyLimiter } from '../middleware/rateLimit.js';
import { sendMailDev } from '../utils/mail.js';
import type { AuthRequest } from '../middleware/auth.js';

export const magicRouter = Router();

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const CAPTCHA_THRESHOLD = 3; // Require CAPTCHA after 3 failures
const FAILURE_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown for failures

const emailSchema = z.object({ email: z.string().email() });
const captchaSchema = z.object({
  email: z.string().email(),
  captchaToken: z.string().optional(), // CAPTCHA verification token
});

// Helper to get client IP
function getClientIp(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

// Helper to check and increment failure count
async function checkFailureCount(email: string, ip: string): Promise<{ requiresCaptcha: boolean; cooldownUntil?: Date }> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - FAILURE_COOLDOWN_MS);

  // Clean up old failures
  await prisma.authFailure.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  // Check email-based failures
  const emailFailure = await prisma.authFailure.findFirst({
    where: {
      email,
      lastAttempt: { gte: oneHourAgo },
    },
  });

  if (emailFailure && emailFailure.count >= CAPTCHA_THRESHOLD) {
    const cooldownUntil = new Date(emailFailure.lastAttempt.getTime() + FAILURE_COOLDOWN_MS);
    if (cooldownUntil > now) {
      return { requiresCaptcha: true, cooldownUntil };
    }
  }

  // Check IP-based failures
  const ipFailure = await prisma.authFailure.findFirst({
    where: {
      ipAddress: ip,
      lastAttempt: { gte: oneHourAgo },
    },
  });

  if (ipFailure && ipFailure.count >= CAPTCHA_THRESHOLD) {
    const cooldownUntil = new Date(ipFailure.lastAttempt.getTime() + FAILURE_COOLDOWN_MS);
    if (cooldownUntil > now) {
      return { requiresCaptcha: true, cooldownUntil };
    }
  }

  return { requiresCaptcha: false };
}

// Helper to record failure
async function recordFailure(email: string, ip: string) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + FAILURE_COOLDOWN_MS);

  // Upsert email failure
  const emailFailure = await prisma.authFailure.findFirst({
    where: { email },
  });

  if (emailFailure) {
    await prisma.authFailure.update({
      where: { id: emailFailure.id },
      data: {
        count: { increment: 1 },
        lastAttempt: now,
        expiresAt,
      },
    });
  } else {
    await prisma.authFailure.create({
      data: {
        email,
        count: 1,
        lastAttempt: now,
        expiresAt,
      },
    });
  }

  // Upsert IP failure
  const ipFailure = await prisma.authFailure.findFirst({
    where: { ipAddress: ip },
  });

  if (ipFailure) {
    await prisma.authFailure.update({
      where: { id: ipFailure.id },
      data: {
        count: { increment: 1 },
        lastAttempt: now,
        expiresAt,
      },
    });
  } else {
    await prisma.authFailure.create({
      data: {
        ipAddress: ip,
        count: 1,
        lastAttempt: now,
        expiresAt,
      },
    });
  }
}

// POST /auth/magic/request
magicRouter.post('/request', magicLinkLimiter, magicLinkHourlyLimiter, async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const { email, captchaToken } = captchaSchema.parse(req.body);

    // Check failure count and CAPTCHA requirement
    const failureCheck = await checkFailureCount(email, clientIp);
    if (failureCheck.requiresCaptcha) {
      // In production, verify CAPTCHA token here
      // For now, return error indicating CAPTCHA required
      if (!captchaToken) {
        return res.status(429).json({
          error: 'captcha_required',
          message: 'Too many failed attempts. Please complete CAPTCHA.',
          cooldownUntil: failureCheck.cooldownUntil?.toISOString(),
        });
      }
      // TODO: Verify CAPTCHA token with provider (hCaptcha, reCAPTCHA, etc.)
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Create user with a temporary handle (user can change later)
      const handle = email.split('@')[0] + '_' + Date.now().toString(36);
      const did = `did:cc:${Buffer.from(handle).toString('base64url')}`;
      user = await prisma.user.create({
        data: {
          email,
          handle,
          did,
        },
      });
    }

    // Generate token
    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('base64url');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    // Store IP and user agent hash for soft validation
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipUaHash = createHash('sha256')
      .update(`${clientIp}|${userAgent}`)
      .digest('base64url')
      .slice(0, 16); // Store first 16 chars

    await prisma.magicLink.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        ipUaHash,
      },
    });

    // Send email (dev: console, prod: real email)
    const url = `${process.env.WEB_BASE_URL || 'http://localhost:3002'}/auth/magic?token=${token}`;
    await sendMailDev(email, 'Your ChatCard sign-in link', `Click to sign in: ${url}\n\nThis link expires in 15 minutes.`);

    res.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid email' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/magic/consume
magicRouter.post('/consume', async (req, res) => {
  try {
    const token = z.string().min(10).parse(req.body?.token);
    const tokenHash = createHash('sha256').update(token).digest('base64url');

    const link = await prisma.magicLink.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!link) {
      return res.status(400).json({ error: 'invalid_or_expired' });
    }

    if (link.usedAt) {
      return res.status(400).json({ error: 'token_already_used' });
    }

    const clientIp = getClientIp(req);

    if (link.expiresAt < new Date()) {
      // Record failure for expired token attempt
      await recordFailure(link.user.email || '', clientIp);
      return res.status(400).json({ error: 'token_expired' });
    }

    // Soft validation: warn if IP/UA changed (but don't block)
    const userAgent = req.headers['user-agent'] || 'unknown';
    const currentIpUaHash = createHash('sha256')
      .update(`${clientIp}|${userAgent}`)
      .digest('base64url')
      .slice(0, 16);

    if (link.ipUaHash && link.ipUaHash !== currentIpUaHash) {
      // Log warning but allow (soft check)
      console.warn('Magic link consumed from different IP/UA', {
        tokenHash: tokenHash.slice(0, 8),
        originalIpUaHash: link.ipUaHash,
        currentIpUaHash,
      });
    }

    // Mark as used
    await prisma.magicLink.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });

    // Clear failure count on successful auth
    if (link.user.email) {
      await prisma.authFailure.deleteMany({
        where: { email: link.user.email },
      });
    }

    // Create session
    if (req.session) {
      req.session.userId = link.userId;
    }

    res.json({
      ok: true,
      userId: link.userId,
      handle: link.user.handle,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

