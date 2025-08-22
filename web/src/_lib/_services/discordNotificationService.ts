// Discord notification service for queuing notifications via BullMQ worker
import { Queue } from 'bullmq';
import redis from '@/_lib/_db/redisClient';

export interface DiscordNotificationData {
    type: 'payment_success' | 'payment_failure' | 'subscription_suspended' | 'subscription_activated' | 'campaign_feedback';
    userId: string;
    userName: string;
    subscriptionId: string;
    plan?: string;
    amount?: number;
    credits?: number;
    reason?: string;
    // Campaign feedback specific
    campaignId?: string;
    message?: string;
}

// Create queue instance pointing to the same Redis as the worker
// This creates a separate instance but connects to the same Redis database
const discordQueue = new Queue('discord-notifications', {
    connection: redis
} as any);

// Direct queue access - no API endpoint needed
export async function queueDiscordNotification(notificationData: DiscordNotificationData) {
    try {
        const job = await discordQueue.add('send-discord-notification', notificationData);
        console.log(`📢 Discord notification job queued successfully:`, job.id);
        return job;
    } catch (error) {
        console.error('❌ Failed to queue Discord notification:', error);
        throw error;
    }
}

// Convenience functions for common notification types
export async function sendPaymentSuccessNotification(data: {
    userId: string;
    userName: string;
    plan: string;
    amount: number;
    subscriptionId: string;
    credits: number;
}) {
    return queueDiscordNotification({
        type: 'payment_success',
        userId: data.userId,
        userName: data.userName,
        subscriptionId: data.subscriptionId,
        plan: data.plan,
        amount: data.amount,
        credits: data.credits,
    });
}

export async function sendPaymentFailureNotification(data: {
    userId: string;
    userName: string;
    subscriptionId: string;
    reason?: string;
}) {
    return queueDiscordNotification({
        type: 'payment_failure',
        userId: data.userId,
        userName: data.userName,
        subscriptionId: data.subscriptionId,
        reason: data.reason,
    });
}

export async function sendSubscriptionSuspendedNotification(data: {
    userId: string;
    userName: string;
    subscriptionId: string;
}) {
    return queueDiscordNotification({
        type: 'subscription_suspended',
        userId: data.userId,
        userName: data.userName,
        subscriptionId: data.subscriptionId,
    });
}

export async function sendSubscriptionActivatedNotification(data: {
    userId: string;
    userName: string;
    plan: string;
    subscriptionId: string;
    credits: number;
}) {
    return queueDiscordNotification({
        type: 'subscription_activated',
        userId: data.userId,
        userName: data.userName,
        subscriptionId: data.subscriptionId,
        plan: data.plan,
        credits: data.credits,
    });
}

// Graceful cleanup for the queue
process.on('beforeExit', async () => {
    await discordQueue.close();
});
