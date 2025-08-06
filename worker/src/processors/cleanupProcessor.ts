import { Job } from 'bullmq';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { prisma } from '@branvia/database';

// Load environment variables from local .env file
dotenv.config();

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export interface CleanupJobData {
    hoursOld?: number;
}

export interface CleanupResult {
    deletedFiles: string[];
    deletedRecords: number;
    errors: string[];
}

export async function cleanupProcessor(job: Job<CleanupJobData>): Promise<CleanupResult> {
    const { hoursOld = 2 } = job.data;

    console.log(`🧹 Starting cleanup job ${job.id} for uploads older than ${hoursOld} hours`);

    const result: CleanupResult = {
        deletedFiles: [],
        deletedRecords: 0,
        errors: []
    };

    try {
        // Find orphaned uploads
        const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

        const orphanedUploads = await prisma.productUpload.findMany({
            where: {
                status: 'uploaded',
                campaignId: null,
                createdAt: {
                    lt: cutoffTime
                }
            }
        });

        console.log(`📁 Found ${orphanedUploads.length} orphaned uploads to clean up`);

        // Process each orphaned upload
        for (const upload of orphanedUploads) {
            try {
                // Delete from S3
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: upload.s3Key,
                });

                await s3Client.send(deleteCommand);
                console.log(`🗑️ Deleted file from S3: ${upload.s3Key}`);

                // Mark as deleted in database
                await prisma.productUpload.update({
                    where: { id: upload.id },
                    data: { status: 'deleted' }
                });

                result.deletedFiles.push(upload.s3Key);
                result.deletedRecords++;

            } catch (error) {
                const errorMessage = `Failed to delete ${upload.s3Key}: ${error}`;
                console.error(errorMessage);
                result.errors.push(errorMessage);
            }
        }

        console.log(`✅ Cleanup completed: ${result.deletedFiles.length} files deleted, ${result.errors.length} errors`);

    } catch (error) {
        console.error('❌ Cleanup job failed:', error);
        throw error;
    }

    return result;
} 