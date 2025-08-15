"use server";

import { ImageGenerationRequestSchema } from '@/_lib/_schemas/imageGeneration';
import { createServerAction } from '@/_lib/_utils/createServerAction';
import { addImageGenerationJob } from '@/_lib/_queues/imageGenerationQueue';
import { getServerUser } from '@/_lib/_auth/auth';
import { z } from 'zod';

export const createImageGenerationJob = createServerAction(
    ImageGenerationRequestSchema,
    async (data, prisma) => {
        // First, get the campaign to access its data
        const campaign = await prisma.campaign.findUnique({
            where: { id: data.campaignId },
            select: {
                productImageS3Key: true,
                productTitle: true,
                productDescription: true,
                selectedStyle: true,
                customStyle: true,
                outputFormat: true,
                userId: true,
            }
        });

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        // Add the job to the BullMQ queue
        const job = await addImageGenerationJob({
            productImageS3Key: campaign.productImageS3Key || '',
            productTitle: campaign.productTitle,
            productDescription: campaign.productDescription,
            selectedStyle: campaign.selectedStyle || '',
            customStyle: campaign.customStyle || undefined,
            outputFormat: campaign.outputFormat,
            userId: campaign.userId,
            campaignId: data.campaignId,
        });

        // Update campaign status to processing
        await prisma.campaign.update({
            where: { id: data.campaignId },
            data: { status: 'processing' },
        });

        console.log(`📝 Added image generation job ${job.id} to queue for campaign ${data.campaignId}`);

        return {
            campaignId: data.campaignId,
            jobId: job.id
        };
    },
    { rateLimit: { maxRequests: 10, windowMs: 60 * 1000 }, requireAuth: true } // 10 jobs per minute
);

export const getImageGenerationJobs = createServerAction(
    z.object({}), // No userId needed, comes from server-side auth
    async (data, prisma) => {
        const user = await getServerUser();
        if (!user) throw new Error('User not authenticated');

        // Get campaigns that are processing or completed
        const campaigns = await prisma.campaign.findMany({
            where: {
                userId: user.id,
                status: { in: ['pending', 'processing', 'completed', 'failed'] },
            },
            orderBy: { createdAt: 'desc' },
        });

        return campaigns;
    },
    { rateLimit: { maxRequests: 20, windowMs: 60 * 1000 }, requireAuth: true } // 20 requests per minute
);
