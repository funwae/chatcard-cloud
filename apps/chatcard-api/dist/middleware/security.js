import helmet from 'helmet';
/**
 * Security headers middleware using Helmet
 * Configures CSP, X-Frame-Options, and other security headers
 */
export function createSecurityMiddleware() {
    const webBaseUrl = process.env.WEB_BASE_URL || 'https://chatcard.cloud';
    const apiBaseUrl = process.env.API_BASE_URL || 'https://api.chatcard.cloud';
    return helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'", // Required for Next.js
                    webBaseUrl,
                    'https://unpkg.com', // For Swagger UI
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'", // Required for Next.js
                    'https://fonts.googleapis.com',
                    'https://unpkg.com',
                ],
                fontSrc: [
                    "'self'",
                    'https://fonts.gstatic.com',
                ],
                imgSrc: [
                    "'self'",
                    'data:',
                    'https:',
                ],
                connectSrc: [
                    "'self'",
                    webBaseUrl,
                    apiBaseUrl,
                    'wss:', // WebSocket connections
                    'ws:', // WebSocket connections (non-secure for dev)
                ],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
            },
        },
        crossOriginEmbedderPolicy: false, // Allow embedding for iframes if needed
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
        },
    });
}
//# sourceMappingURL=security.js.map