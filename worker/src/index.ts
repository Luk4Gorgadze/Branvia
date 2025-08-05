import { Worker, Queue } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import { imageGenerationProcessor } from './processors/imageGenerationProcessor.js';
import { cleanupProcessor } from './processors/cleanupProcessor.js';

// Load environment variables from root directory
dotenv.config({ path: '../.env' });

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

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

// Create queue for scheduled cleanup jobs
const cleanupQueue = new Queue('cleanup', { connection: redis });

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

imageGenerationWorker.on('error', (err) => {
    console.error('Image generation worker error:', err);
});

cleanupWorker.on('error', (err) => {
    console.error('Cleanup worker error:', err);
});

console.log('🚀 BullMQ Worker started successfully');
console.log('📊 Listening for image generation and cleanup jobs...');

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

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down worker...');
    await imageGenerationWorker.close();
    await cleanupWorker.close();
    await cleanupQueue.close();
    await redis.quit();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Shutting down worker...');
    await imageGenerationWorker.close();
    await cleanupWorker.close();
    await cleanupQueue.close();
    await redis.quit();
    process.exit(0);
}); 