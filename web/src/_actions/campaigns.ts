"use server";

import { CreateCampaignSchema, GetUserCampaignsSchema, SubmitCampaignFeedbackSchema } from '@/_lib/_schemas/campaigns';
import { createServerAction } from '@/_lib/_utils/createServerAction';
import { getServerUser } from '@/_lib/_auth/auth';
import { z } from 'zod';
import { queueDiscordNotification } from '@/_lib/_services/discordNotificationService';
import { publicDataCache } from '@/_lib/_utils/redisCache';
// Import Prisma types directly to ensure type compatibility
import { prisma } from '@/_lib/_db/prismaClient';
type Campaign = NonNullable<Awaited<ReturnType<typeof prisma.campaign.findFirst>>>;

// Create campaign - requires authentication, rate limited to 5 per minute
export const createCampaign = createServerAction(
    CreateCampaignSchema,
    async (data, prisma) => {
        const user = await getServerUser();
        if (!user) throw new Error('User not authenticated');

        const campaign = await prisma.campaign.create({
            data: {
                userId: user.id,
                productTitle: data.productTitle,
                productDescription: data.productDescription,
                selectedStyle: data.selectedStyle,
                customStyle: data.customStyle,
                outputFormat: data.outputFormat,
                productImageS3Key: data.productImageS3Key,
                status: 'processing',
            },
        });

        return campaign;
    },
    { rateLimit: { maxRequests: 5, windowMs: 60 * 1000 }, requireAuth: true } // 5 campaigns per minute
);

// Get public campaigns - cached in Redis for performance
export const getPublicCampaigns = createServerAction(
    z.object({}), // Empty schema since no input needed
    async (_, prisma): Promise<Campaign[]> => {
        // Try to get from cache first
        const cached = await publicDataCache.get<Campaign[]>('campaigns');
        if (cached) {
            return cached;
        }

        // If not in cache, fetch from database
        const campaigns = await prisma.campaign.findMany({
            where: { public: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        // Cache the result
        await publicDataCache.set('campaigns', campaigns);

        return campaigns;
    },
    { rateLimit: { maxRequests: 1000, windowMs: 60 * 1000 } } // 1000 requests per minute
);

// Get user campaigns - requires authentication, rate limited to 10 per minute
export const getUserCampaigns = createServerAction(
    GetUserCampaignsSchema,
    async (data, prisma) => {
        const user = await getServerUser();
        if (!user) throw new Error('User not authenticated');

        const campaigns = await prisma.campaign.findMany({
            where: {
                OR: [
                    { userId: user.id },
                    { public: true }
                ]
            },
            orderBy: { createdAt: 'desc' },
        });

        return campaigns;
    },
    { rateLimit: { maxRequests: 100, windowMs: 60 * 1000 }, requireAuth: true } // 10 requests per minute
);

// Get campaign by ID - requires authentication if not public, rate limited to 20 per minute
export const getCampaignById = createServerAction(
    z.object({ campaignId: z.string() }),
    async (data, prisma) => {
        const user = await getServerUser();
        if (!user) throw new Error('User not authenticated');

        const campaign = await prisma.campaign.findUnique({
            where: { id: data.campaignId },
        });

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        // Ensure user can only access their own campaigns or public ones
        if (!campaign.public && campaign.userId !== user.id) {
            throw new Error('Access denied');
        }

        return campaign;
    },
    { rateLimit: { maxRequests: 2000, windowMs: 60 * 1000 }, requireAuth: false } // 2000 requests per minute
);

// Update campaign - requires authentication, rate limited to 10 per minute
export const updateCampaign = createServerAction(
    z.object({
        campaignId: z.string(),
        updates: z.object({
            productTitle: z.string().min(1, 'Product title is required').max(100, 'Product title too long').optional(),
            productDescription: z.string().min(10, 'Product description must be at least 10 characters').max(500, 'Product description too long').optional(),
            selectedStyle: z.string().optional(),
            customStyle: z.string().max(200, 'Custom style description too long').optional(),
            outputFormat: z.string().optional(),
            public: z.boolean().optional(),
        })
    }),
    async (data, prisma) => {
        const user = await getServerUser();
        if (!user) throw new Error('User not authenticated');

        // Verify ownership before updating
        const existingCampaign = await prisma.campaign.findUnique({
            where: { id: data.campaignId },
            select: { userId: true }
        });

        if (!existingCampaign || existingCampaign.userId !== user.id) {
            throw new Error('Access denied');
        }

        const campaign = await prisma.campaign.update({
            where: { id: data.campaignId },
            data: data.updates,
        });

        return campaign;
    },
    { rateLimit: { maxRequests: 10, windowMs: 60 * 1000 }, requireAuth: true }
);

// Delete campaign - requires authentication, rate limited to 5 per minute
export const deleteCampaign = createServerAction(
    z.object({ campaignId: z.string() }),
    async (data, prisma) => {
        const user = await getServerUser();
        if (!user) throw new Error('User not authenticated');

        // Verify ownership before deleting
        const existingCampaign = await prisma.campaign.findUnique({
            where: { id: data.campaignId },
            select: { userId: true }
        });

        if (!existingCampaign || existingCampaign.userId !== user.id) {
            throw new Error('Access denied');
        }

        await prisma.campaign.delete({
            where: { id: data.campaignId },
        });

        return { success: true, message: 'Campaign deleted successfully' };
    },
    { rateLimit: { maxRequests: 5, windowMs: 60 * 1000 }, requireAuth: true }
);

// Submit one-time campaign feedback (owner-only). Sends to Discord via queue.
export const submitCampaignFeedback = createServerAction(
    SubmitCampaignFeedbackSchema,
    async (data, prisma) => {
        const user = await getServerUser();
        if (!user) throw new Error('User not authenticated');

        const campaign = await prisma.campaign.findUnique({ where: { id: data.campaignId } });
        if (!campaign) throw new Error('Campaign not found');
        if (campaign.userId !== user.id) throw new Error('Access denied');
        if (campaign.feedbackSubmitted) throw new Error('Feedback already submitted');

        // Resolve user's subscription to include with feedback
        const latestSubscription = await prisma.subscription.findFirst({
            where: { userId: user.id, status: 'ACTIVE' },
            orderBy: { startedAt: 'desc' },
            select: { id: true, paypalSubscriptionId: true },
        });
        const subscriptionId = latestSubscription?.paypalSubscriptionId || latestSubscription?.id || 'unknown';

        // Update campaign to mark feedback submitted
        await prisma.campaign.update({
            where: { id: data.campaignId },
            data: {
                feedbackSubmitted: true,
                feedbackMessage: data.message,
                feedbackAt: new Date(),
            },
        });

        // Enqueue Discord notification
        await queueDiscordNotification({
            type: 'campaign_feedback',
            userId: user.id,
            userName: user.name || user.email || 'Unknown',
            campaignId: data.campaignId,
            message: data.message,
            subscriptionId,
        });

        return { success: true };
    },
    { rateLimit: { maxRequests: 5, windowMs: 60 * 1000 }, requireAuth: true }
);
