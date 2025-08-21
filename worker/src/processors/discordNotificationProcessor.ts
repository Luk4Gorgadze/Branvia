import { Job } from 'bullmq';
import { sendPaymentSuccessNotification, sendPaymentFailureNotification, sendSubscriptionSuspendedNotification, sendSubscriptionActivatedNotification, sendCampaignFeedbackNotification } from '../_lib/discordService.js';

// Define DiscordNotificationJobData interface here since we removed the separate queue file
export interface DiscordNotificationJobData {
    type: 'payment_success' | 'payment_failure' | 'subscription_suspended' | 'subscription_activated' | 'campaign_feedback';
    userId: string;
    userName: string;
    subscriptionId: string;
    plan?: string;
    amount?: number;
    credits?: number;
    reason?: string;
    campaignId?: string;
    message?: string;
}

export async function discordNotificationProcessor(job: Job<DiscordNotificationJobData>) {
    const { data } = job;

    try {
        console.log(`📢 Processing Discord notification job for ${data.userName}, type: ${data.type}`);

        switch (data.type) {
            case 'payment_success':
                await sendPaymentSuccessNotification({
                    userId: data.userId,
                    userName: data.userName,
                    plan: data.plan || 'Unknown',
                    amount: data.amount || 0,
                    subscriptionId: data.subscriptionId,
                    credits: data.credits || 0
                });
                break;
            case 'campaign_feedback':
                await sendCampaignFeedbackNotification({
                    userId: data.userId,
                    userName: data.userName,
                    campaignId: data.campaignId || 'unknown',
                    message: data.message || 'No message provided',
                });
                break;
            case 'payment_failure':
                await sendPaymentFailureNotification({
                    userId: data.userId,
                    userName: data.userName,
                    subscriptionId: data.subscriptionId,
                    reason: data.reason
                });
                break;
            case 'subscription_suspended':
                await sendSubscriptionSuspendedNotification({
                    userId: data.userId,
                    userName: data.userName,
                    subscriptionId: data.subscriptionId
                });
                break;
            case 'subscription_activated':
                await sendSubscriptionActivatedNotification({
                    userId: data.userId,
                    userName: data.userName,
                    plan: data.plan || 'Unknown',
                    subscriptionId: data.subscriptionId,
                    credits: data.credits || 0
                });
                break;
            default:
                throw new Error(`Unknown Discord notification type: ${(data as any).type}`);
        }

        console.log(`✅ Discord notification sent successfully for ${data.userName}`);
        return { success: true, notificationType: data.type };

    } catch (error) {
        console.error(`❌ Failed to send Discord notification for ${data.userName}:`, error);
        throw error; // This will trigger retry logic
    }
}
