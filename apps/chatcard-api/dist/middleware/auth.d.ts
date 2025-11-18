import { Request, Response, NextFunction } from 'express';
import { type AgentPayload } from './agent-jwt.js';
export interface AuthRequest extends Request {
    userId?: string;
    userDid?: string;
    isAgent?: boolean;
    agent?: AgentPayload;
}
/**
 * Require owner authentication (user session or JWT)
 */
export declare function requireOwner(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * Require either owner or agent authentication
 * Agents use Ed25519-signed JWTs
 */
export declare function requireAgentOrOwner(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.d.ts.map