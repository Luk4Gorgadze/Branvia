import { WebhookClient } from 'discord.js';

// Initialize Discord webhook clients once at startup
const paymentsWebhookClient = new WebhookClient({
    url: process.env.DISCORD_PAYMENTS_WEBHOOK_URL || ''
});

const feedbackWebhookClient = new WebhookClient({
    url: process.env.DISCORD_FEEDBACK_WEBHOOK_URL || ''
});

// Discord embed colors
const COLORS = {
    SUCCESS: 0x28a745, // Green
    ERROR: 0xdc3545,   // Red
    WARNING: 0xffc107,  // Yellow
    INFO: 0x17a2b8,    // Blue
    NEUTRAL: 0x6c757d   // Gray
};

export interface DiscordNotificationData {
    title: string;
    description: string;
    color: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp?: Date;
    footer?: string;
    webhookType: 'payments' | 'feedback';
}

export async function sendDiscordNotification(data: DiscordNotificationData) {
    let webhookClient: WebhookClient | null = null;

    switch (data.webhookType) {
        case 'payments':
            webhookClient = paymentsWebhookClient;
            break;
        case 'feedback':
            webhookClient = feedbackWebhookClient;
            break;
        default:
            console.error(`❌ Unknown webhook type: ${data.webhookType}`);
            return;
    }

    if (!webhookClient.url) {
        console.log(`⚠️ Discord ${data.webhookType} webhook URL not configured, skipping notification`);
        return;
    }

    try {
        const embed = {
            title: data.title,
            description: data.description,
            color: data.color,
            fields: data.fields || [],
            timestamp: data.timestamp?.toISOString() || new Date().toISOString(),
            footer: {
                text: data.footer || (data.webhookType === 'payments' ? 'Payment System' : 'Feedback')
            }
        };

        await webhookClient.send({
            embeds: [embed]
        });

        console.log(`✅ Discord ${data.webhookType} notification sent: ${data.title}`);
    } catch (error) {
        console.error(`❌ Failed to send Discord ${data.webhookType} notification:`, error);
        // Don't throw - Discord failures shouldn't break the main flow
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
    await sendDiscordNotification({
        title: '💰 Payment Successful',
        description: 'A subscription payment has been processed successfully',
        color: COLORS.SUCCESS,
        fields: [
            { name: 'User', value: `${data.userName} (${data.userId})`, inline: true },
            { name: 'Plan', value: data.plan, inline: true },
            { name: 'Amount', value: `$${data.amount}`, inline: true },
            { name: 'Subscription ID', value: data.subscriptionId, inline: false },
            { name: 'Credits Added', value: `${data.credits} credits`, inline: true }
        ],
        timestamp: new Date(),
        webhookType: 'payments'
    });
}

export async function sendPaymentFailureNotification(data: {
    userId: string;
    userName: string;
    subscriptionId: string;
    reason?: string;
}) {
    await sendDiscordNotification({
        title: '❌ Payment Failed',
        description: 'A subscription payment has failed',
        color: COLORS.ERROR,
        fields: [
            { name: 'User', value: `${data.userName} (${data.userId})`, inline: true },
            { name: 'Subscription ID', value: data.subscriptionId, inline: true },
            { name: 'Status', value: 'PAST_DUE', inline: true },
            ...(data.reason ? [{ name: 'Reason', value: data.reason, inline: false }] : [])
        ],
        timestamp: new Date(),
        webhookType: 'payments'
    });
}

export async function sendSubscriptionSuspendedNotification(data: {
    userId: string;
    userName: string;
    subscriptionId: string;
}) {
    await sendDiscordNotification({
        title: '🚫 Subscription Suspended',
        description: 'A subscription has been suspended due to payment failures',
        color: COLORS.WARNING,
        fields: [
            { name: 'User', value: `${data.userName} (${data.userId})`, inline: true },
            { name: 'Subscription ID', value: data.subscriptionId, inline: true },
            { name: 'Status', value: 'SUSPENDED', inline: true },
            { name: 'Action Required', value: 'User needs to resolve payment issue', inline: false }
        ],
        timestamp: new Date(),
        webhookType: 'payments'
    });
}

export async function sendSubscriptionActivatedNotification(data: {
    userId: string;
    userName: string;
    plan: string;
    subscriptionId: string;
    credits: number;
}) {
    await sendDiscordNotification({
        title: '🎉 Subscription Activated',
        description: 'A new subscription has been activated',
        color: COLORS.INFO,
        fields: [
            { name: 'User', value: `${data.userName} (${data.userId})`, inline: true },
            { name: 'Plan', value: data.plan, inline: true },
            { name: 'Subscription ID', value: data.subscriptionId, inline: false },
            { name: 'Initial Credits', value: `${data.credits} credits`, inline: true }
        ],
        timestamp: new Date(),
        webhookType: 'payments'
    });
}

export async function sendCampaignFeedbackNotification(data: {
    userId: string;
    userName: string;
    campaignId: string;
    message: string;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://branvia.art';
    const campaignUrl = `${baseUrl}/campaign/${data.campaignId}`;
    const raw = (data.message || '').trim();
    const truncated = raw.length > 1000 ? `${raw.slice(0, 1000)}…` : raw;
    const formattedMessage = `>>> ${truncated}`; // Discord block quote style

    await sendDiscordNotification({
        title: '📝 Campaign Feedback',
        description: `Campaign: ${campaignUrl}`,
        color: 0x17a2b8,
        fields: [
            { name: 'User', value: `${data.userName} (${data.userId})`, inline: true },
            { name: 'Campaign ID', value: data.campaignId, inline: true },
            { name: 'Feedback', value: formattedMessage, inline: false },
        ],
        timestamp: new Date(),
        webhookType: 'feedback'
    });
}