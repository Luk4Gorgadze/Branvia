import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Create the email queue
export const emailQueue = new Queue('email', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3, // Retry failed emails up to 3 times
        backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 second delay for emails
        },
        removeOnComplete: 100, // Keep last 100 completed emails
        removeOnFail: 50, // Keep last 50 failed emails
    },
});

// Email job types
export interface SubscriptionConfirmationEmailData {
    type: 'subscription_confirmation';
    to: string;
    userName: string;
    subscriptionId: string;
    plan: string;
    amount: number;
    nextBillingDate?: string;
}

export interface WelcomeEmailData {
    type: 'welcome';
    to: string;
    userName: string;
}

export interface CreditTopUpEmailData {
    type: 'credit_topup';
    to: string;
    userName: string;
    credits: number;
    reason: string;
}

export interface PaymentFailureEmailData {
    type: 'payment_failure';
    to: string;
    userName: string;
    subscriptionId: string;
}

export interface SubscriptionSuspendedEmailData {
    type: 'subscription_suspended';
    to: string;
    userName: string;
    subscriptionId: string;
}

export type EmailJobData = SubscriptionConfirmationEmailData | WelcomeEmailData | CreditTopUpEmailData | PaymentFailureEmailData | SubscriptionSuspendedEmailData;

// Function to add an email job
export async function addEmailJob(data: EmailJobData) {
    const job = await emailQueue.add('send-email', data, {
        priority: 2, // Medium priority for emails
        delay: 0, // Send immediately
    });

    console.log(`📧 Added email job ${job.id} to queue for ${data.to}`);
    return job;
}

// Function to get email job status
export async function getEmailJobStatus(jobId: string) {
    const job = await emailQueue.getJob(jobId);
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

// Function to get email queue statistics
export async function getEmailQueueStats() {
    const waiting = await emailQueue.getWaiting();
    const active = await emailQueue.getActive();
    const completed = await emailQueue.getCompleted();
    const failed = await emailQueue.getFailed();

    return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
    };
}
