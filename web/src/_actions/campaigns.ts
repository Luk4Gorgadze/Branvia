"use server";

import { CreateCampaignSchema, GetUserCampaignsSchema } from '@/_lib/_schemas/campaigns';
import { createProtectedServerAction, createPublicServerAction } from '@/_lib/_utils/createServerAction';
import { z } from 'zod';

// Create campaign - requires authentication, rate limited to 5 per minute
export const createCampaign = createProtectedServerAction(
    CreateCampaignSchema,
    async (data, prisma) => {
        const campaign = await prisma.campaign.create({
            data: {
                userId: data.userId,
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
    { maxRequests: 5, windowMs: 60 * 1000 } // 5 campaigns per minute
);

// Get public campaigns - no authentication required, rate limited to 20 per minute
export const getPublicCampaigns = createPublicServerAction(
    z.object({}), // Empty schema since no input needed
    async (_, prisma) => {
        const campaigns = await prisma.campaign.findMany({
            where: { public: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        return campaigns || [];
    },
    { maxRequests: 20, windowMs: 60 * 1000 } // 20 requests per minute
);

// Get user campaigns - requires authentication, rate limited to 10 per minute
export const getUserCampaigns = createProtectedServerAction(
    GetUserCampaignsSchema,
    async (data, prisma) => {
        const campaigns = await prisma.campaign.findMany({
            where: {
                OR: [
                    { userId: data.userId },
                    { public: true }
                ]
            },
            orderBy: { createdAt: 'desc' },
        });

        return campaigns;
    },
    { maxRequests: 10, windowMs: 60 * 1000 } // 10 requests per minute
);

// Get campaign by ID - requires authentication if not public, rate limited to 20 per minute
export const getCampaignById = createProtectedServerAction(
    z.object({ campaignId: z.string() }),
    async (data, prisma) => {
        const campaign = await prisma.campaign.findUnique({
            where: { id: data.campaignId },
        });

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        return campaign;
    },
    { maxRequests: 20, windowMs: 60 * 1000 } // 20 requests per minute
);

// Update campaign - requires authentication, rate limited to 10 per minute
export const updateCampaign = createProtectedServerAction(
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
        const campaign = await prisma.campaign.update({
            where: { id: data.campaignId },
            data: data.updates,
        });

        return campaign;
    },
    { maxRequests: 10, windowMs: 60 * 1000 }
);

// Delete campaign - requires authentication, rate limited to 5 per minute
export const deleteCampaign = createProtectedServerAction(
    z.object({ campaignId: z.string() }),
    async (data, prisma) => {
        await prisma.campaign.delete({
            where: { id: data.campaignId },
        });

        return { success: true, message: 'Campaign deleted successfully' };
    },
    { maxRequests: 5, windowMs: 60 * 1000 }
);
