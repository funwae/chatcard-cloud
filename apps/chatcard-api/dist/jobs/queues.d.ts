import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
export declare const connection: IORedis;
export type AnchorJobData = {
    proofMh: string;
    provider: 'none' | 'opentimestamps' | 'evm-l2';
};
export declare const anchorQueue: Queue<AnchorJobData, any, string, AnchorJobData, any, string>;
export declare const anchorEvents: QueueEvents;
//# sourceMappingURL=queues.d.ts.map