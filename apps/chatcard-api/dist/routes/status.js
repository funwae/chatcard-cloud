import { Router } from 'express';
import { connection as redisConnection } from '../jobs/queues.js';
import { prisma } from '../db/prisma.js';
export const statusRouter = Router();
const startTime = Date.now();
// GET /status - Public status page
statusRouter.get('/status', async (req, res) => {
    const components = [];
    let overallStatus = 'operational';
    // Check API
    components.push({
        name: 'API',
        status: 'operational',
    });
    // Check Database
    try {
        await prisma.$queryRaw `SELECT 1`;
        components.push({
            name: 'Database',
            status: 'operational',
        });
    }
    catch (error) {
        components.push({
            name: 'Database',
            status: 'down',
            message: error instanceof Error ? error.message : 'Connection failed',
        });
        overallStatus = 'down';
    }
    // Check Redis
    try {
        await redisConnection.ping();
        components.push({
            name: 'Redis',
            status: 'operational',
        });
    }
    catch (error) {
        components.push({
            name: 'Redis',
            status: 'down',
            message: error instanceof Error ? error.message : 'Connection failed',
        });
        overallStatus = overallStatus === 'operational' ? 'degraded' : 'down';
    }
    // Check Worker (indirectly via queue)
    try {
        const queueInfo = await redisConnection.info('keyspace');
        // If we can get queue info, worker is likely running
        components.push({
            name: 'Anchor Worker',
            status: 'operational',
        });
    }
    catch (error) {
        components.push({
            name: 'Anchor Worker',
            status: 'degraded',
            message: 'Unable to verify worker status',
        });
        if (overallStatus === 'operational') {
            overallStatus = 'degraded';
        }
    }
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    res.json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime,
        components,
        // TODO: Add recent incidents from database/logs
        incidents: [],
    });
});
//# sourceMappingURL=status.js.map