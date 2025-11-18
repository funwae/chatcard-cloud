import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
export const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});
export const anchorQueue = new Queue('anchor', { connection });
export const anchorEvents = new QueueEvents('anchor', { connection });
//# sourceMappingURL=queues.js.map