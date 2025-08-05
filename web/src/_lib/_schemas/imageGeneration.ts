import { z } from 'zod';

// Style presets enum
export const StylePreset = z.enum([
    'clean-minimal',
    'warm-cozy',
    'bold-vibrant',
    'elegant-luxurious',
    'rustic-natural',
    'bright-playful',
    'sleek-modern',
    'soft-dreamy'
]);

// Output format enum
export const OutputFormat = z.enum([
    'instagram-post',
    'instagram-story',
    'facebook-ad',
    'pinterest-pin',
    'website-hero'
]);

// Image generation request schema
export const ImageGenerationRequestSchema = z.object({
    productImageS3Key: z.string().min(1, 'Product image S3 key is required'),
    productTitle: z.string().min(1, 'Product title is required').max(100, 'Product title too long'),
    productDescription: z.string().min(10, 'Product description must be at least 10 characters').max(500, 'Product description too long'),
    selectedStyle: StylePreset.optional(),
    customStyle: z.string().max(200, 'Custom style description too long').optional(),
    outputFormat: OutputFormat,
    userId: z.string().min(1, 'User ID is required'),
    campaignId: z.string().min(1, 'Campaign ID is required')
}).refine(
    (data: { selectedStyle?: string; customStyle?: string }) => data.selectedStyle || data.customStyle,
    {
        message: 'Either selectedStyle or customStyle must be provided',
        path: ['selectedStyle']
    }
);

// Job status response schema
export const JobStatusResponseSchema = z.object({
    id: z.string().optional(),
    status: z.enum(['waiting', 'active', 'completed', 'failed', 'not_found']),
    progress: z.number().optional(),
    data: z.any().optional(),
    result: z.any().optional(),
    failedReason: z.string().optional()
});

// API response schemas
export const ImageGenerationResponseSchema = z.object({
    success: z.boolean(),
    jobId: z.string(),
    message: z.string()
});

export const ErrorResponseSchema = z.object({
    error: z.string()
});

// Type exports
export type ImageGenerationRequest = z.infer<typeof ImageGenerationRequestSchema>;
export type JobStatusResponse = z.infer<typeof JobStatusResponseSchema>;
export type ImageGenerationResponse = z.infer<typeof ImageGenerationResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>; 