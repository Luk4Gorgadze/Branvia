export const getS3Url = (s3Key: string): string => {
    const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';

    if (!bucketName || !s3Key) return '';

    return `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
}; 