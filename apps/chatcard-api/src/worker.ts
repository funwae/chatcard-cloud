#!/usr/bin/env node
/**
 * Anchor worker entry point
 * Run separately from API server: node dist/worker.js
 */
import 'dotenv/config';
import pino from 'pino';
import IORedis from 'ioredis';
import { anchorWorker } from './jobs/anchor.worker.js';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true },
  } : undefined,
});

// Test Redis connection
const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
  process.exit(1);
});

// Worker is already started by import
logger.info('Anchor worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down worker');
  await anchorWorker.close();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down worker');
  await anchorWorker.close();
  await redis.quit();
  process.exit(0);
});

