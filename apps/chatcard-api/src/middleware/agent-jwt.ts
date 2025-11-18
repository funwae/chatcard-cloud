import { Request, Response, NextFunction } from 'express';
import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';
import { prisma } from '../db/prisma.js';
import type { AuthRequest } from './auth.js';

const JWKS_URL = process.env.AGENT_JWT_JWKS_URL || 'http://localhost:3001/.well-known/chatcard/agent-keys.json';
const JWT_ISS = process.env.AGENT_JWT_ISS || 'did:cc:registry';
const JWT_AUD = 'chatcard-api';

// Cache JWKS for 1 hour
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksCacheExpiry = 0;

function getJWKS() {
  const now = Date.now();
  if (!jwksCache || jwksCacheExpiry < now) {
    jwksCache = createRemoteJWKSet(new URL(JWKS_URL));
    jwksCacheExpiry = now + 60 * 60 * 1000; // 1 hour
  }
  return jwksCache;
}

export interface AgentPayload extends JWTPayload {
  sub: string; // did:cc:...
  scope: string[];
}

/**
 * Verify Agent JWT and attach agent info to request
 */
export async function verifyAgentJWT(token: string): Promise<AgentPayload | null> {
  try {
    const jwks = getJWKS();
    const { payload } = await jwtVerify(token, jwks, {
      issuer: JWT_ISS,
      audience: JWT_AUD,
      clockTolerance: '2m', // Allow ±2 minutes clock skew
    });

    // Additional validation: ensure required claims
    if (!payload.sub || !payload.scope) {
      console.error('Agent JWT missing required claims');
      return null;
    }

    return payload as AgentPayload;
  } catch (error) {
    console.error('Agent JWT verification failed:', error);
    return null;
  }
}

/**
 * Check if agent has required scope
 */
export function hasScope(agent: AgentPayload, requiredScope: string): boolean {
  return agent.scope.includes(requiredScope) || agent.scope.includes('*');
}

/**
 * Middleware to require specific scope (only for agents, owners bypass)
 */
export function requireScope(scope: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Owners (session-based) bypass scope checks
    if (req.userId && !req.isAgent) {
      return next();
    }

    // Agents must have the required scope
    if (!req.agent) {
      return res.status(403).json({ error: 'Agent authentication required' });
    }

    if (!hasScope(req.agent, scope)) {
      return res.status(403).json({ error: `Missing required scope: ${scope}` });
    }

    next();
  };
}

