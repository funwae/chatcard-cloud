import cors from 'cors';
/**
 * CORS allowlist configuration
 * Supports multiple origins with pattern matching for staging subdomains
 */
const getAllowedOrigins = () => {
    const originsEnv = process.env.CORS_ORIGINS;
    if (originsEnv) {
        return originsEnv.split(',').map((o) => o.trim());
    }
    // Default production origins
    return [
        'https://chatcard.cloud',
        'https://www.chatcard.cloud',
        'https://zekechat.com',
        'https://www.zekechat.com',
    ];
};
const allowedOrigins = getAllowedOrigins();
/**
 * Check if origin matches allowed patterns
 * Supports exact matches and staging subdomain patterns
 */
function isOriginAllowed(origin) {
    if (!origin)
        return false;
    // Exact match
    if (allowedOrigins.includes(origin)) {
        return true;
    }
    // Staging subdomain pattern: *.staging.chatcard.cloud, *.staging.zekechat.com
    const stagingPatterns = [
        /^https:\/\/.*\.staging\.chatcard\.cloud$/,
        /^https:\/\/.*\.staging\.zekechat\.com$/,
    ];
    return stagingPatterns.some((pattern) => pattern.test(origin));
}
/**
 * CORS middleware with allowlist
 */
export const corsMiddleware = cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.) in development
        if (!origin && process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        if (isOriginAllowed(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['ETag', 'X-Request-Id'],
    maxAge: 86400, // 24 hours
});
//# sourceMappingURL=cors.js.map