import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/_lib/_s3/s3Client';

export async function POST(request: NextRequest) {
    try {
        const { s3Key } = await request.json();

        if (!s3Key) {
            return NextResponse.json({ error: 'S3 key is required' }, { status: 400 });
        }

        // Download from S3
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: s3Key
        });

        const response = await s3Client.send(command);
        const imageBuffer = await response.Body?.transformToByteArray();

        if (!imageBuffer) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        // Get filename from S3 key
        const filename = s3Key.split('/').pop() || 'image.jpg';

        // Return as file download
        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': response.ContentType || 'image/jpeg',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-cache'
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Download failed' }, { status: 500 });
    }
} 