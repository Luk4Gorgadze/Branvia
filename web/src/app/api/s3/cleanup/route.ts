import { NextRequest, NextResponse } from 'next/server';
import { deleteFileFromS3 } from '@/_lib/_s3/s3Client';
import { auth } from '@/_lib/_auth/auth';
import { headers } from 'next/headers';
import { ProductUploadService } from '@/_lib/_services/productUploadService';

export async function DELETE(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const s3Key = searchParams.get('s3Key');

        if (!s3Key) {
            return NextResponse.json(
                { error: 's3Key parameter is required' },
                { status: 400 }
            );
        }

        // Verify the upload belongs to the user
        const uploadRecord = await ProductUploadService.getProductUploadByS3Key(s3Key);
        if (!uploadRecord || uploadRecord.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized to delete this file' },
                { status: 403 }
            );
        }

        // Delete file from S3
        await deleteFileFromS3(s3Key);

        // Mark as deleted in database
        await ProductUploadService.deleteProductUploadByS3Key(s3Key);

        return NextResponse.json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting file from S3:', error);
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        );
    }
} 