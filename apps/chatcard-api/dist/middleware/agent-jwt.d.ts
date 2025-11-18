import { Response, NextFunction } from 'express';
import { JWTPayload } from 'jose';
import type { AuthRequest } from './auth.js';
export interface AgentPayload extends JWTPayload {
    sub: string;
    scope: string[];
}
/**
 * Verify Agent JWT and attach agent info to request
 */
export declare function verifyAgentJWT(token: string): Promise<AgentPayload | null>;
/**
 * Check if agent has required scope
 */
export declare function hasScope(agent: AgentPayload, requiredScope: string): boolean;
/**
 * Middleware to require specific scope (only for agents, owners bypass)
 */
export declare function requireScope(scope: string): (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=agent-jwt.d.ts.map