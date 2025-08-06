import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

const cleanupQueue = new Queue('cleanup', { connection: redis });

async function cleanupOldJobs() {
    try {
        console.log('🧹 Clearing all cleanup queue jobs...');

        // Clear all jobs from the cleanup queue
        await cleanupQueue.obliterate();

        console.log('✅ All cleanup queue jobs removed');

    } catch (error) {
        console.error('❌ Error cleaning up jobs:', error);
    } finally {
        await cleanupQueue.close();
        await redis.quit();
    }
}

cleanupOldJobs(); 