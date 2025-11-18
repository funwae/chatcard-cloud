import { RequestHandler } from 'express';
declare module 'express-session' {
    interface SessionData {
        userId?: string;
        challenge?: string;
    }
}
export declare function createSessionMiddleware(): RequestHandler;
/**
 * Refresh token expires after 30 days
 * Stored separately from session (in database or separate cookie)
 */
export declare const REFRESH_TOKEN_MAX_AGE: number;
//# sourceMappingURL=session.d.ts.map