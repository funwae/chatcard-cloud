import { Router } from 'express';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  GenerateRegistrationOptionsOpts,
  VerifyRegistrationResponseOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import { prisma } from '../db/prisma.js';
import { authLimiter } from '../middleware/rateLimit.js';
import type { AuthRequest } from '../middleware/auth.js';

export const passkeyRouter = Router();

const rpName = 'ChatCard';
const rpID = process.env.PASSKEY_RP_ID || 'localhost';
const origin = process.env.PASSKEY_ORIGIN || `http://${rpID}:3002`;

// Store challenges in memory (use Redis in production)
const challenges = new Map<string, { challenge: string; userId?: string; expiresAt: number }>();

// Clean up expired challenges every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of challenges.entries()) {
    if (value.expiresAt < now) {
      challenges.delete(key);
    }
  }
}, 5 * 60 * 1000);

// POST /auth/passkey/register/options
passkeyRouter.post('/register/options', authLimiter, async (req: AuthRequest, res) => {
  try {
    // User must be authenticated (via session or temporary token)
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { webauthnCredentials: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const opts: GenerateRegistrationOptionsOpts = {
      rpName,
      rpID,
      userID: user.id,
      userName: user.handle,
      userDisplayName: user.name || user.handle,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: user.webauthnCredentials.map((cred) => ({
        id: cred.id,
        transports: cred.transports as AuthenticatorTransport[],
      })),
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        requireResidentKey: false,
      },
    };

    const options = await generateRegistrationOptions(opts);

    // Store challenge with userId
    challenges.set(options.challenge, {
      challenge: options.challenge,
      userId: user.id,
      expiresAt: Date.now() + 60000, // 1 minute
    });

    res.json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/passkey/register/verify
passkeyRouter.post('/register/verify', authLimiter, async (req: AuthRequest, res) => {
  try {
    const { body } = req;
    const challengeData = challenges.get(body.response.challenge);

    if (!challengeData || !challengeData.userId) {
      return res.status(400).json({ error: 'Invalid or expired challenge' });
    }

    if (challengeData.expiresAt < Date.now()) {
      challenges.delete(body.response.challenge);
      return res.status(400).json({ error: 'Challenge expired' });
    }

    const user = await prisma.user.findUnique({
      where: { id: challengeData.userId },
      include: { webauthnCredentials: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const expectedChallenge = challengeData.challenge;

    const opts: VerifyRegistrationResponseOpts = {
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    };

    const verification = await verifyRegistrationResponse(opts);

    if (!verification.verified || !verification.registrationInfo) {
      challenges.delete(body.response.challenge);
      return res.status(400).json({ error: 'Verification failed' });
    }

    const { credentialID, credentialPublicKey, counter, aaguid } = verification.registrationInfo;

    // Store credential
    await prisma.webAuthnCredential.create({
      data: {
        id: Buffer.from(credentialID).toString('base64url'),
        userId: user.id,
        publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
        counter,
        transports: body.response.transports || [],
        aaguid: aaguid ? Buffer.from(aaguid).toString('base64url') : null,
      },
    });

    challenges.delete(body.response.challenge);

    // Create session
    if (req.session) {
      req.session.userId = user.id;
    }

    res.json({ verified: true, userId: user.id });
  } catch (error) {
    console.error('Error verifying registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/passkey/login/options
passkeyRouter.post('/login/options', authLimiter, async (req, res) => {
  try {
    const { handle, email } = req.body;

    if (!handle && !email) {
      return res.status(400).json({ error: 'handle or email required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ handle }, { email }],
      },
      include: { webauthnCredentials: true },
    });

    if (!user || user.webauthnCredentials.length === 0) {
      // Don't reveal if user exists
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const opts: GenerateAuthenticationOptionsOpts = {
      timeout: 60000,
      allowCredentials: user.webauthnCredentials.map((cred) => ({
        id: cred.id,
        transports: cred.transports as AuthenticatorTransport[],
      })),
      userVerification: 'preferred',
      rpID,
    };

    const options = await generateAuthenticationOptions(opts);

    // Store challenge with userId
    challenges.set(options.challenge, {
      challenge: options.challenge,
      userId: user.id,
      expiresAt: Date.now() + 60000, // 1 minute
    });

    res.json(options);
  } catch (error) {
    console.error('Error generating authentication options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/passkey/login/verify
passkeyRouter.post('/login/verify', authLimiter, async (req, res) => {
  try {
    const { body } = req;
    const challengeData = challenges.get(body.response.challenge);

    if (!challengeData || !challengeData.userId) {
      return res.status(400).json({ error: 'Invalid or expired challenge' });
    }

    if (challengeData.expiresAt < Date.now()) {
      challenges.delete(body.response.challenge);
      return res.status(400).json({ error: 'Challenge expired' });
    }

    const user = await prisma.user.findUnique({
      where: { id: challengeData.userId },
      include: { webauthnCredentials: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const credential = user.webauthnCredentials.find(
      (cred) => cred.id === body.response.id
    );

    if (!credential) {
      challenges.delete(body.response.challenge);
      return res.status(400).json({ error: 'Credential not found' });
    }

    const expectedChallenge = challengeData.challenge;

    const opts: VerifyAuthenticationResponseOpts = {
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credential.id,
        publicKey: Buffer.from(credential.publicKey, 'base64url'),
        counter: credential.counter,
      },
      requireUserVerification: true,
    };

    const verification = await verifyAuthenticationResponse(opts);

    if (!verification.verified) {
      challenges.delete(body.response.challenge);
      return res.status(400).json({ error: 'Verification failed' });
    }

    // Update counter and lastUsedAt
    await prisma.webAuthnCredential.update({
      where: { id: credential.id },
      data: {
        counter: verification.authenticationInfo.newCounter,
        lastUsedAt: new Date(),
      },
    });

    challenges.delete(body.response.challenge);

    // Create session
    if (req.session) {
      req.session.userId = user.id;
    }

    res.json({
      verified: true,
      userId: user.id,
      handle: user.handle,
    });
  } catch (error) {
    console.error('Error verifying authentication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

