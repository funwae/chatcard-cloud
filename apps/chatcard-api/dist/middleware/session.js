import session from 'express-session';
export function createSessionMiddleware() {
    // Session expires after 24 hours
    const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
    return session({
        secret: process.env.SESSION_SECRET || 'change-me-in-production',
        resave: false,
        saveUninitialized: false,
        name: 'chatcard.sid', // Custom session name
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: SESSION_MAX_AGE,
            sameSite: 'lax',
        },
        // Clock skew tolerance: allow ±2 minutes
        rolling: true, // Reset expiration on activity
    });
}
/**
 * Refresh token expires after 30 days
 * Stored separately from session (in database or separate cookie)
 */
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
//# sourceMappingURL=session.js.map