import { prisma } from '@/_lib/_db/prismaClient';

export interface CreateCampaignData {
    userId: string;
    productTitle: string;
    productDescription: string;
    selectedStyle?: string;
    customStyle?: string;
    outputFormat: string;
    productImageS3Key: string;
}

export interface UpdateCampaignData {
    generatedImages?: string[];
    status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export class CampaignService {
    static async createCampaign(data: CreateCampaignData) {
        return await prisma.campaign.create({
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
    }

    static async updateCampaign(campaignId: string, data: UpdateCampaignData) {
        return await prisma.campaign.update({
            where: { id: campaignId },
            data,
        });
    }

    static async getCampaign(campaignId: string, requestingUserId?: string) {
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!campaign) {
            return null;
        }

        // Check access control: user can access if:
        // 1. They own the campaign, OR
        // 2. The campaign is public
        if (requestingUserId && campaign.userId !== requestingUserId && !campaign.public) {
            return null; // Access denied
        }

        return campaign;
    }

    static async getUserCampaigns(userId: string) {
        return await prisma.campaign.findMany({
            where: {
                OR: [
                    { userId }, // User's own campaigns
                    { public: true } // Public campaigns
                ]
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async deleteCampaign(campaignId: string) {
        return await prisma.campaign.delete({
            where: { id: campaignId },
        });
    }

    static async getPublicCampaigns() {
        return await prisma.campaign.findMany({
            where: { public: true },
            orderBy: { createdAt: 'desc' },
            take: 10, // Limit to 10 most recent public campaigns
        });
    }
} 