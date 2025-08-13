import { WebhookClient } from 'discord.js';

// Initialize Discord webhook client
const webhookClient = new WebhookClient({
    url: process.env.DISCORD_WEBHOOK_URL || ''
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
}

export async function sendDiscordNotification(data: DiscordNotificationData) {
    if (!process.env.DISCORD_WEBHOOK_URL) {
        console.log('⚠️ Discord webhook URL not configured, skipping notification');
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
                text: data.footer || 'Branvia Payment System'
            }
        };

        await webhookClient.send({
            embeds: [embed]
        });

        console.log(`✅ Discord notification sent: ${data.title}`);
    } catch (error) {
        console.error('❌ Failed to send Discord notification:', error);
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
        footer: 'Payment System'
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
        footer: 'Payment System'
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
        footer: 'Payment System'
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
        footer: 'Payment System'
    });
}
