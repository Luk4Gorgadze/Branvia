// Added subscription renewal worker initialization - commit marker
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import { imageGenerationProcessor } from './processors/imageGenerationProcessor.js';
import { cleanupProcessor } from './processors/cleanupProcessor.js';
import { processEmailJob } from './processors/emailProcessor.js';
import { discordNotificationProcessor } from './processors/discordNotificationProcessor.js';
import { imageGenerationQueue, cleanupQueue, emailQueue, discordNotificationQueue, closeAllQueues } from './queues/sharedQueues.js';

// Load environment variables
dotenv.config();

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

// Create workers for different job types
const imageGenerationWorker = new Worker('image-generation', imageGenerationProcessor, {
    connection: redis,
    concurrency: 10, // Process 5 jobs at a time (increased from 2)
    removeOnComplete: { count: 100 }, // Keep last 100 completed jobs
    removeOnFail: { count: 50 }, // Keep last 50 failed jobs
});

const cleanupWorker = new Worker('cleanup', cleanupProcessor, {
    connection: redis,
    concurrency: 1, // Process 1 cleanup job at a time
    removeOnComplete: { count: 50 }, // Keep last 50 completed jobs
    removeOnFail: { count: 25 }, // Keep last 25 failed jobs
});



const emailWorker = new Worker('email', processEmailJob, {
    connection: redis,
    concurrency: 5, // Process 5 email jobs at a time
    removeOnComplete: { count: 100 }, // Keep last 100 completed emails
    removeOnFail: { count: 50 }, // Keep last 50 failed emails
});

const discordNotificationWorker = new Worker('discord-notifications', discordNotificationProcessor, {
    connection: redis,
    concurrency: 3, // Process 3 Discord notifications at a time
    removeOnComplete: { count: 100 }, // Keep last 100 completed notifications
    removeOnFail: { count: 50 }, // Keep last 50 failed notifications
});

// Queues are now imported from sharedQueues.js

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



emailWorker.on('completed', (job) => {
    console.log(`✅ Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`❌ Email job ${job?.id} failed:`, err.message);
});

discordNotificationWorker.on('completed', (job) => {
    console.log(`✅ Discord notification job ${job.id} completed successfully`);
});

discordNotificationWorker.on('failed', (job, err) => {
    console.error(`❌ Discord notification job ${job?.id} failed:`, err.message);
});

imageGenerationWorker.on('error', (err) => {
    console.error('Image generation worker error:', err);
});

cleanupWorker.on('error', (err) => {
    console.error('Cleanup worker error:', err);
});



emailWorker.on('error', (err) => {
    console.error('Email worker error:', err);
});

discordNotificationWorker.on('error', (err) => {
    console.error('Discord notification worker error:', err);
});

console.log('🚀 BullMQ Worker started successfully');
console.log('📊 Listening for image generation and cleanup jobs...');

console.log('📧 Listening for email jobs...');
console.log('📢 Listening for Discord notification jobs...');

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
    await emailWorker.close();
    await discordNotificationWorker.close();
    await closeAllQueues();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Shutting down worker...');
    await imageGenerationWorker.close();
    await cleanupWorker.close();
    await emailWorker.close();
    await discordNotificationWorker.close();
    await closeAllQueues();
    process.exit(0);
}); 