import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUploadUrl, generateS3Key } from '@/_lib/_s3/s3Client';
import { auth } from '@/_lib/_auth/auth';
import { headers } from 'next/headers';
import { ProductUploadService } from '@/_lib/_services/productUploadService';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        // Get user session
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { fileName, contentType, fileSize } = body;

        if (!fileName || !contentType) {
            return NextResponse.json(
                { error: 'fileName and contentType are required' },
                { status: 400 }
            );
        }

        // Generate unique S3 key
        const s3Key = generateS3Key(session.user.id, fileName);

        // Create database record for tracking
        await ProductUploadService.createProductUpload({
            userId: session.user.id,
            s3Key,
            fileName,
            fileSize: fileSize || 0,
            contentType
        });

        // Generate presigned URL
        const presignedUrl = await generatePresignedUploadUrl(s3Key, contentType);

        return NextResponse.json({
            success: true,
            presignedUrl,
            s3Key,
            expiresIn: 3600 // 1 hour
        });

    } catch (error) {
        console.error('Error generating presigned URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate presigned URL' },
            { status: 500 }
        );
    }
} 