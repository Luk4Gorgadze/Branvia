import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

// Single Redis connection shared across all queues
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Shared queue instances
export const imageGenerationQueue = new Queue('image-generation', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});

export const cleanupQueue = new Queue('cleanup', {
    connection: redis,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: 'exponential',
            delay: 10000,
        },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 25 },
    },
});

export const emailQueue = new Queue('email', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});

export const discordNotificationQueue = new Queue('discord-notifications', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});

// Graceful shutdown for all queues
export async function closeAllQueues() {
    await Promise.all([
        imageGenerationQueue.close(),
        cleanupQueue.close(),
        emailQueue.close(),
        discordNotificationQueue.close(),
    ]);
    await redis.quit();
}
