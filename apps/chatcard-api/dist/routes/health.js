import { Router } from 'express';
import { connection as redisConnection } from '../jobs/queues.js';
import { prisma } from '../db/prisma.js';
import { register } from '../middleware/metrics.js';
export const healthRouter = Router();
const startTime = Date.now();
// GET /healthz - Health check for API (liveness)
healthRouter.get('/healthz', async (req, res) => {
    try {
        // Check database
        await prisma.$queryRaw `SELECT 1`;
        // Check Redis
        await redisConnection.ping();
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - startTime) / 1000), // seconds
            services: {
                database: 'ok',
                redis: 'ok',
            },
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// GET /ready - Readiness check (includes version info)
healthRouter.get('/ready', async (req, res) => {
    try {
        // Check database with version
        const dbResult = await prisma.$queryRaw `SELECT version() as version`;
        const dbVersion = dbResult[0]?.version || 'unknown';
        // Check Redis with info
        const redisInfo = await redisConnection.info('server');
        const redisVersionMatch = redisInfo.match(/redis_version:([^\r\n]+)/);
        const redisVersion = redisVersionMatch ? redisVersionMatch[1] : 'unknown';
        res.json({
            status: 'ready',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - startTime) / 1000),
            services: {
                database: {
                    status: 'ok',
                    version: dbVersion.split(' ')[0], // Extract version number
                },
                redis: {
                    status: 'ok',
                    version: redisVersion,
                },
            },
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'not_ready',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// GET /metrics - Prometheus metrics
healthRouter.get('/metrics', async (req, res) => {
    try {
        // Get Prometheus metrics from registry
        const prometheusMetrics = await register.metrics();
        // Additional custom metrics from database
        const customMetrics = [];
        // Anchor job metrics
        const anchorCounts = await prisma.anchor.groupBy({
            by: ['state'],
            _count: true,
        });
        for (const { state, _count } of anchorCounts) {
            customMetrics.push(`anchor_jobs_total{state="${state.toLowerCase()}"} ${_count}`);
        }
        // Magic link metrics
        const magicLinkTotal = await prisma.magicLink.count();
        const magicLinkUsed = await prisma.magicLink.count({
            where: { usedAt: { not: null } },
        });
        const magicLinkExpired = await prisma.magicLink.count({
            where: {
                expiresAt: { lt: new Date() },
                usedAt: null,
            },
        });
        customMetrics.push(`magiclink_requests_total ${magicLinkTotal}`);
        customMetrics.push(`magiclink_used_total ${magicLinkUsed}`);
        customMetrics.push(`magiclink_expired_total ${magicLinkExpired}`);
        // Co-signature metrics
        const cosignTotal = await prisma.cosignature.count();
        customMetrics.push(`cosign_requests_total ${cosignTotal}`);
        // Proof metrics
        const proofTotal = await prisma.proof.count();
        customMetrics.push(`proofs_total ${proofTotal}`);
        // Service status metrics
        try {
            await redisConnection.ping();
            customMetrics.push('redis_up 1');
        }
        catch {
            customMetrics.push('redis_up 0');
        }
        try {
            await prisma.$queryRaw `SELECT 1`;
            customMetrics.push('postgres_up 1');
        }
        catch {
            customMetrics.push('postgres_up 0');
        }
        res.set('Content-Type', 'text/plain');
        res.send(prometheusMetrics + '\n' + customMetrics.join('\n') + '\n');
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate metrics' });
    }
});
//# sourceMappingURL=health.js.map