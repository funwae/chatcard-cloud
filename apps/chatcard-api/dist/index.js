import 'dotenv/config';
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
// Worker runs in separate process (see src/worker.ts)
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: {
        paths: pinoRedactionPaths,
        remove: true,
    },
    transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    } : undefined,
});
const app = express();
const PORT = process.env.API_PORT || 3001;
// Middleware
app.use(compression());
app.use(createSecurityMiddleware());
app.use(corsMiddleware);
app.use(metricsMiddleware); // Track HTTP metrics
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(createSessionMiddleware());
app.use(apiLimiter);
// Health, metrics, and status
app.use('/', healthRouter);
app.use('/', statusRouter);
// Routes
app.use('/p', proofsPublicRouter); // Public proof access (no auth)
app.use('/api/proofs', proofsRouter); // Proof registration (requires auth)
app.use('/api/proofs', anchorRouter); // Anchor routes (POST /api/proofs/:mh/anchor)
app.use('/api/proofs', cosignRouter); // Co-sign routes (POST /api/proofs/:mh/cosign)
app.use('/api/anchors', anchorRouter); // Anchor status (GET /api/anchors/:mh)
app.use('/.well-known', wellKnownRouter); // Well-known endpoints
app.use('/.well-known/chatcard', jwksRouter); // JWKS for Agent JWT
app.use('/docs', openapiRouter); // OpenAPI documentation
app.use('/me', keysRouter);
app.use('/api/me/proposals', proposalsRouter);
app.use('/api/me/items', itemsRouter);
app.use('/api/me', cardRouter);
app.use('/api/me', userDataRouter); // User data export/delete
app.use('/api/auth', authRouter);
// Error handler
app.use((err, req, res, next) => {
    logger.error({ err, req: { method: req.method, url: req.url } }, 'Request error');
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, () => {
    logger.info({ port: PORT }, 'API server started');
});
//# sourceMappingURL=index.js.map