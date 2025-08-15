import { useState } from 'react';
import { getUserCredits } from '@/_actions/users';

export const useImageUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadImage = async (file: File, userId: string): Promise<{ s3Key: string; url: string }> => {
        setIsUploading(true);

        try {
            // Check user credits before allowing upload (requires 50)
            try {
                const result = await getUserCredits({});
                if (result.success && result.data) {
                    const { credits } = result.data;
                    if (credits < 50) {
                        throw new Error('INSUFFICIENT_CREDITS');
                    }
                } else {
                    throw new Error('CREDIT_CHECK_FAILED');
                }
            } catch (checkErr) {
                if ((checkErr as Error).message === 'INSUFFICIENT_CREDITS') {
                    alert('You need at least 50 credits to start a generation. Please top up your credits.');
                    throw checkErr;
                }
                // If credit check fails for other reasons, surface it to the user but proceed
                console.warn('Credit check failed, proceeding with caution:', checkErr);
                const message = (checkErr as Error)?.message || String(checkErr);
                alert(`We couldn't verify your credits right now. Proceeding, but generation may fail.\nDetails: ${message}`);
            }

            console.log('Starting upload process...');

            // Get presigned URL from backend
            const presignedResponse = await fetch('/api/s3/presigned-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type,
                    fileSize: file.size,
                }),
            });

            console.log('Presigned URL response status:', presignedResponse.status);

            if (!presignedResponse.ok) {
                const errorText = await presignedResponse.text();
                console.error('Presigned URL error:', errorText);
                throw new Error(`Failed to get presigned URL: ${presignedResponse.status} ${errorText}`);
            }

            const { presignedUrl, s3Key } = await presignedResponse.json();
            console.log('Got presigned URL, uploading to S3...');

            // Upload file directly to S3
            const uploadResponse = await fetch(presignedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            console.log('S3 upload response status:', uploadResponse.status);

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('S3 upload error:', errorText);
                throw new Error(`Failed to upload to S3: ${uploadResponse.status} ${errorText}`);
            }

            // Get the public URL
            const url = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
            console.log('Upload successful!');

            return { s3Key, url };
        } catch (error) {
            console.error('Upload failed with error:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const deleteImage = async (s3Key: string) => {
        if (!s3Key) return;

        try {
            await fetch(`/api/s3/cleanup?s3Key=${encodeURIComponent(s3Key)}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Failed to delete old image:', error);
        }
    };

    return {
        uploadImage,
        deleteImage,
        isUploading
    };
}; 