/**
 * Serverless entry point for Vercel
 * Wraps the Express app using serverless-http
 */
import serverless from 'serverless-http';
import express from 'express';
import compression from 'compression';
import pino from 'pino';
import { corsMiddleware } from './middleware/cors.js';
import { createSecurityMiddleware } from './middleware/security.js';
import { createSessionMiddleware } from './middleware/session.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { proofsRouter } from './routes/proofs.js';
import { proofsPublicRouter } from './routes/proofs-public.js';
import { keysRouter } from './routes/keys.js';
import { proposalsRouter } from './routes/proposals.js';
import { itemsRouter } from './routes/items.js';
import { cardRouter } from './routes/card.js';
import { authRouter } from './routes/auth.js';
import { wellKnownRouter } from './routes/well-known.js';
import { jwksRouter } from './routes/jwks.js';
import { openapiRouter } from './routes/openapi.js';
import { anchorRouter } from './routes/anchor.js';
import { cosignRouter } from './routes/cosign.js';
import { healthRouter } from './routes/health.js';
import { userDataRouter } from './routes/user-data.js';
import { statusRouter } from './routes/status.js';
import { metricsMiddleware } from './middleware/metrics.js';
import { pinoRedactionPaths } from './utils/log-redaction.js';
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: {
        paths: pinoRedactionPaths,
        remove: true,
    },
});
const app = express();
// Middleware
app.use(compression());
app.use(createSecurityMiddleware());
app.use(corsMiddleware);
app.use(metricsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(createSessionMiddleware());
app.use(apiLimiter);
// Health, metrics, and status
app.use('/', healthRouter);
app.use('/', statusRouter);
// Routes
app.use('/p', proofsPublicRouter);
app.use('/api/proofs', proofsRouter);
app.use('/api/proofs', anchorRouter);
app.use('/api/proofs', cosignRouter);
app.use('/api/anchors', anchorRouter);
app.use('/.well-known', wellKnownRouter);
app.use('/.well-known/chatcard', jwksRouter);
app.use('/docs', openapiRouter);
app.use('/me', keysRouter);
app.use('/api/me/proposals', proposalsRouter);
app.use('/api/me/items', itemsRouter);
app.use('/api/me', cardRouter);
app.use('/api/me', userDataRouter);
app.use('/api/auth', authRouter);
// Error handler
app.use((err, req, res, next) => {
    logger.error({ err, req: { method: req.method, url: req.url } }, 'Request error');
    res.status(500).json({ error: 'Internal server error' });
});
// Export serverless handler
export const handler = serverless(app, {
    binary: ['image/*', 'application/pdf'],
});
//# sourceMappingURL=serverless.js.map