import { Worker, Queue } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import { imageGenerationProcessor } from './processors/imageGenerationProcessor.js';
import { cleanupProcessor } from './processors/cleanupProcessor.js';
import { subscriptionRenewalProcessor } from './processors/subscriptionRenewalProcessor.js';

// Load environment variables
dotenv.config();

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

// Create workers for different job types
const imageGenerationWorker = new Worker('image-generation', imageGenerationProcessor, {
    connection: redis,
    concurrency: 2, // Process 2 jobs at a time
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
});

const cleanupWorker = new Worker('cleanup', cleanupProcessor, {
    connection: redis,
    concurrency: 1, // Process 1 cleanup job at a time
    removeOnComplete: 50, // Keep last 50 completed jobs
    removeOnFail: 25, // Keep last 25 failed jobs
});

const subscriptionWorker = new Worker('subscription-renewal', subscriptionRenewalProcessor as any, {
    connection: redis,
    concurrency: 1,
    removeOnComplete: 50,
    removeOnFail: 25,
});

// Create queues for scheduled jobs
const cleanupQueue = new Queue('cleanup', { connection: redis });
const subscriptionRenewalQueue = new Queue('subscription-renewal', { connection: redis });

// Handle worker events
imageGenerationWorker.on('completed', (job) => {
    console.log(`✅ Image generation job ${job.id} completed successfully`);
});

imageGenerationWorker.on('failed', (job, err) => {
    console.error(`❌ Image generation job ${job?.id} failed:`, err.message);
});

cleanupWorker.on('completed', (job) => {
    console.log(`✅ Cleanup job ${job.id} completed successfully`);
});

cleanupWorker.on('failed', (job, err) => {
    console.error(`❌ Cleanup job ${job?.id} failed:`, err.message);
});

subscriptionWorker.on('completed', (job) => {
    console.log(`✅ Subscription renewal job ${job.id} completed successfully`);
});

subscriptionWorker.on('failed', (job, err) => {
    console.error(`❌ Subscription renewal job ${job?.id} failed:`, err.message);
});

imageGenerationWorker.on('error', (err) => {
    console.error('Image generation worker error:', err);
});

cleanupWorker.on('error', (err) => {
    console.error('Cleanup worker error:', err);
});

console.log('🚀 BullMQ Worker started successfully');
console.log('📊 Listening for image generation and cleanup jobs...');
console.log('📊 Listening for subscription renewal jobs...');

// Schedule cleanup job to run every 2 hours
const scheduleCleanupJob = async () => {
    try {
        await cleanupQueue.add('cleanup-orphaned-uploads',
            { hoursOld: 2 },
            {
                repeat: {
                    pattern: '0 */2 * * *' // Every 2 hours
                },
                removeOnComplete: 10,
                removeOnFail: 5
            }
        );
        console.log('⏰ Scheduled cleanup job to run every 2 hours');
    } catch (error) {
        console.error('Failed to schedule cleanup job:', error);
    }
};

// Schedule the cleanup job
scheduleCleanupJob();

// Schedule subscription renewal job to run daily at 00:10
const scheduleSubscriptionRenewalJob = async () => {
    try {
        await subscriptionRenewalQueue.add(
            'subscription-monthly-renewal',
            {},
            {
                repeat: {
                    pattern: '10 0 * * *' // 00:10 every day; job itself tops up only on the 1st
                },
                removeOnComplete: 10,
                removeOnFail: 5
            }
        );
        console.log('⏰ Scheduled subscription renewal job (daily 00:10)');
    } catch (error) {
        console.error('Failed to schedule subscription renewal job:', error);
    }
};

scheduleSubscriptionRenewalJob();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down worker...');
    await imageGenerationWorker.close();
    await cleanupWorker.close();
    await subscriptionWorker.close();
    await cleanupQueue.close();
    await subscriptionRenewalQueue.close();
    await redis.quit();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Shutting down worker...');
    await imageGenerationWorker.close();
    await cleanupWorker.close();
    await subscriptionWorker.close();
    await cleanupQueue.close();
    await subscriptionRenewalQueue.close();
    await redis.quit();
    process.exit(0);
}); 