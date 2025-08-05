import { prisma } from '@/_lib/_db/prismaClient';

export interface CreateProductUploadData {
    userId: string;
    s3Key: string;
    fileName: string;
    fileSize: number;
    contentType: string;
}

export interface UpdateProductUploadData {
    status?: string;
    campaignId?: string;
}

export class ProductUploadService {
    static async createProductUpload(data: CreateProductUploadData) {
        return await prisma.productUpload.create({
            data: {
                userId: data.userId,
                s3Key: data.s3Key,
                fileName: data.fileName,
                fileSize: data.fileSize,
                contentType: data.contentType,
                status: 'uploaded'
            }
        });
    }

    static async updateProductUpload(id: string, data: UpdateProductUploadData) {
        return await prisma.productUpload.update({
            where: { id },
            data
        });
    }

    static async getProductUpload(id: string) {
        return await prisma.productUpload.findUnique({
            where: { id },
            include: { campaign: true }
        });
    }

    static async getProductUploadByS3Key(s3Key: string) {
        return await prisma.productUpload.findUnique({
            where: { s3Key },
            include: { campaign: true }
        });
    }

    static async getUserProductUploads(userId: string) {
        return await prisma.productUpload.findMany({
            where: { userId },
            include: { campaign: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async deleteProductUpload(id: string) {
        return await prisma.productUpload.delete({
            where: { id }
        });
    }

    static async deleteProductUploadByS3Key(s3Key: string) {
        return await prisma.productUpload.delete({
            where: { s3Key }
        });
    }

    // Find orphaned uploads (not linked to any campaign and older than specified hours)
    static async findOrphanedUploads(hoursOld: number = 2) {
        const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

        return await prisma.productUpload.findMany({
            where: {
                status: 'uploaded',
                campaignId: null,
                createdAt: {
                    lt: cutoffTime
                }
            }
        });
    }

    // Mark upload as linked to a campaign
    static async linkToCampaign(s3Key: string, campaignId: string) {
        return await prisma.productUpload.update({
            where: { s3Key },
            data: {
                status: 'linked',
                campaignId
            }
        });
    }

    // Mark upload as deleted
    static async markAsDeleted(s3Key: string) {
        return await prisma.productUpload.update({
            where: { s3Key },
            data: {
                status: 'deleted'
            }
        });
    }
} 