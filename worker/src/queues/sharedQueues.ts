import { Queue } from 'bullmq';
import redis from '../_lib/redisClient.js';

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
