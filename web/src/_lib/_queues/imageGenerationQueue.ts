import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

// Redis connection for web app
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Create the image generation queue
export const imageGenerationQueue = new Queue('image-generation', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
    },
});

// Function to add an image generation job
export async function addImageGenerationJob(data: {
    productImage: string;
    productTitle: string;
    productDescription: string;
    selectedStyle: string;
    customStyle?: string;
    outputFormat: string;
    userId: string;
    campaignId: string;
}) {
    const job = await imageGenerationQueue.add('generate-images', data, {
        priority: 1,
        delay: 0,
    });

    console.log(`📝 Added image generation job ${job.id} to queue`);
    return job;
}

// Function to get job status
export async function getJobStatus(jobId: string) {
    const job = await imageGenerationQueue.getJob(jobId);
    if (!job) {
        return { status: 'not_found' };
    }

    const state = await job.getState();
    const progress = await job.progress();

    return {
        id: job.id,
        status: state,
        progress,
        data: job.data,
        result: job.returnvalue,
        failedReason: job.failedReason,
    };
}

// Function to get queue statistics
export async function getQueueStats() {
    const waiting = await imageGenerationQueue.getWaiting();
    const active = await imageGenerationQueue.getActive();
    const completed = await imageGenerationQueue.getCompleted();
    const failed = await imageGenerationQueue.getFailed();

    return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
    };
} 