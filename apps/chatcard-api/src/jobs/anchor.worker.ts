import { Worker } from 'bullmq';
import pino from 'pino';
import { connection } from './queues.js';
import { getAnchorProvider } from '../anchors/index.js';
import { prisma } from '../db/prisma.js';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true },
  } : undefined,
});

export const anchorWorker = new Worker(
  'anchor',
  async (job) => {
    const startTime = Date.now();
    const { proofMh, provider } = job.data;
    logger.info({ proofMh, provider, jobId: job.id }, 'Processing anchor job');

    try {
      const p = getAnchorProvider(provider);
      const handle = await p.queue(proofMh);

    await prisma.anchor
      .update({
        where: { proofMh },
        data: { jobId: handle, state: 'POSTED', postedAt: new Date() },
      })
      .catch(async () => {
        await prisma.anchor.create({
          data: {
            proofMh,
            provider,
            jobId: handle,
            state: 'POSTED',
            postedAt: new Date(),
          },
        });
      });

    const start = Date.now();
    const max = Number(process.env.ANCHOR_POLL_MAX_MS ?? 600000);
    const step = Number(process.env.ANCHOR_POLL_MS ?? 1500);

    let status;
    do {
      status = await p.status(handle);
      if (status.state === 'confirmed') {
        await prisma.anchor.update({
          where: { proofMh },
          data: {
            state: 'CONFIRMED',
            txid: status.txid,
            confirmedAt: new Date(),
          },
        });
        const duration = Date.now() - startTime;
        logger.info({ proofMh, provider, duration, txid: status.txid }, 'Anchor confirmed');
        return;
      }
      await new Promise((r) => setTimeout(r, step));
    } while (Date.now() - start < max);

      await prisma.anchor.update({
        where: { proofMh },
        data: { state: 'FAILED' },
      });
      const duration = Date.now() - startTime;
      logger.warn({ proofMh, provider, duration }, 'Anchor job failed (timeout)');
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error({ err: error, proofMh, provider, duration }, 'Anchor job error');
      await prisma.anchor.update({
        where: { proofMh },
        data: { state: 'FAILED' },
      });
      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

// Log worker events
anchorWorker.on('completed', (job) => {
  logger.info({ jobId: job.id, proofMh: job.data.proofMh }, 'Anchor job completed');
});

anchorWorker.on('failed', (job, err) => {
  logger.error({ err, jobId: job?.id, proofMh: job?.data?.proofMh }, 'Anchor job failed');
});

anchorWorker.on('error', (err) => {
  logger.error({ err }, 'Anchor worker error');
});

