import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import { imageGenerationProcessor } from './processors/imageGenerationProcessor.js';

// Load environment variables
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

// Handle worker events
imageGenerationWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});

imageGenerationWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});

imageGenerationWorker.on('error', (err) => {
    console.error('Worker error:', err);
});

console.log('🚀 BullMQ Worker started successfully');
console.log('📊 Listening for image generation jobs...');

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down worker...');
    await imageGenerationWorker.close();
    await redis.quit();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Shutting down worker...');
    await imageGenerationWorker.close();
    await redis.quit();
    process.exit(0);
}); 