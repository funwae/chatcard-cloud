import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { verifyAgentJWT, type AgentPayload } from './agent-jwt.js';

export interface AuthRequest extends Request {
  userId?: string;
  userDid?: string;
  isAgent?: boolean;
  agent?: AgentPayload;
}

/**
 * Require owner authentication (user session or JWT)
 */
export async function requireOwner(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check for session-based auth (from WebAuthn)
    if (req.session?.userId) {
      req.userId = req.session.userId;
      const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
      });
      if (user) {
        req.userDid = user.did;
        return next();
      }
    }

    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // TODO: Verify JWT and extract userId
      // For now, return 401
    }

    res.status(401).json({ error: 'Authentication required' });
  } catch (error) {
    next(error);
  }
}

/**
 * Require either owner or agent authentication
 * Agents use Ed25519-signed JWTs
 */
export async function requireAgentOrOwner(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // First try owner auth
    if (req.session?.userId) {
      req.userId = req.session.userId;
      const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
      });
      if (user) {
        req.userDid = user.did;
        return next();
      }
    }

    // Then try agent JWT
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const verified = await verifyAgentJWT(token);
      if (verified) {
        req.userDid = verified.sub; // sub is the DID
        req.isAgent = true;
        req.agent = verified;
        return next();
      }
    }

    res.status(401).json({ error: 'Authentication required' });
  } catch (error) {
    next(error);
  }
}

