import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Client configuration for backend operations
export const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// Generate presigned URL for secure uploads
export async function generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600 // 1 hour default
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
}

// Generate unique S3 key for uploaded files
export function generateS3Key(userId: string, fileName: string): string {
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop();
    return `uploads/${userId}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
}

// Delete file from S3 (for cleanup operations)
export async function deleteFileFromS3(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await s3Client.send(command);
    console.log(`🗑️ Deleted file from S3: ${key}`);
}

// Get S3 URL for a file (backend version)
export function getS3Url(key: string): string {
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
} 