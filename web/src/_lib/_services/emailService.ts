// Email service for directly queuing emails via BullMQ worker
import { Queue } from 'bullmq';
import redis from '@/_lib/_db/redisClient';

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

// Create queue instance pointing to the same Redis as the worker
const emailQueue = new Queue('email', {
    connection: redis
} as any);

// Direct queue access - no API endpoint needed
export async function queueEmailJob(emailData: EmailJobData) {
    try {
        const job = await emailQueue.add('send-email', emailData);
        console.log(`📧 Email job queued successfully:`, job.id);
        return job;
    } catch (error) {
        console.error('❌ Failed to queue email:', error);
        throw error;
    }
}

// Convenience functions for common email types
export async function sendSubscriptionConfirmationEmail(
    to: string,
    userName: string,
    subscriptionId: string,
    plan: string,
    amount: number,
    nextBillingDate?: string
) {
    return queueEmailJob({
        type: 'subscription_confirmation',
        to,
        userName,
        subscriptionId,
        plan,
        amount,
        nextBillingDate,
    });
}

export async function sendWelcomeEmail(to: string, userName: string) {
    return queueEmailJob({
        type: 'welcome',
        to,
        userName,
    });
}

export async function sendCreditTopUpEmail(
    to: string,
    userName: string,
    credits: number,
    reason: string
) {
    return queueEmailJob({
        type: 'credit_topup',
        to,
        userName,
        credits,
        reason,
    });
}

export async function sendPaymentFailureEmail(
    to: string,
    userName: string,
    subscriptionId: string
) {
    return queueEmailJob({
        type: 'payment_failure',
        to,
        userName,
        subscriptionId,
    });
}

export async function sendSubscriptionSuspendedEmail(
    to: string,
    userName: string,
    subscriptionId: string
) {
    return queueEmailJob({
        type: 'subscription_suspended',
        to,
        userName,
        subscriptionId,
    });
}

// Graceful cleanup for the queue
process.on('beforeExit', async () => {
    await emailQueue.close();
});
