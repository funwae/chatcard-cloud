import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

export const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export type AnchorJobData = {
  proofMh: string;
  provider: 'none' | 'opentimestamps' | 'evm-l2';
};

export const anchorQueue = new Queue<AnchorJobData>('anchor', { connection });
export const anchorEvents = new QueueEvents('anchor', { connection });

