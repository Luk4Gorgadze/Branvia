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

// Output format enum with fixed DALL·E-compatible resolutions
export const OutputFormat = z.enum([
    'square',
    'portrait',
    'landscape'
]);

// Resolution mapping for each output format (fixed sizes)
export const OUTPUT_FORMAT_RESOLUTIONS = {
    square: { width: 1024, height: 1024 }, // 1:1
    portrait: { width: 1024, height: 1536 }, // 9:16 style
    landscape: { width: 1536, height: 1024 } // 16:9 style (wide)
} as const;

// Friendly display labels for formats
export const OUTPUT_FORMAT_LABELS = {
    square: 'Instagram Square',
    portrait: 'Story / Tall',
    landscape: 'Wide Banner'
} as const;

// Type for resolution mapping
export type OutputFormatResolution = typeof OUTPUT_FORMAT_RESOLUTIONS[keyof typeof OUTPUT_FORMAT_RESOLUTIONS];

// Helper function to get resolution for an output format
export function getOutputFormatResolution(format: z.infer<typeof OutputFormat> | string): OutputFormatResolution {
    const key = format as keyof typeof OUTPUT_FORMAT_RESOLUTIONS;
    return OUTPUT_FORMAT_RESOLUTIONS[key] ?? OUTPUT_FORMAT_RESOLUTIONS.square;
}

// Helper to get a friendly label for an output format
export function getOutputFormatLabel(format: z.infer<typeof OutputFormat> | string): string {
    const key = format as keyof typeof OUTPUT_FORMAT_LABELS;
    return OUTPUT_FORMAT_LABELS[key] ?? String(format);
}

// Campaign creation request schema (for creating campaigns)
export const CampaignCreationRequestSchema = z.object({
    productImageS3Key: z.string().min(1, 'Product image S3 key is required'),
    productTitle: z.string().min(1, 'Product title is required').max(100, 'Product title too long'),
    productDescription: z.string().min(10, 'Product description must be at least 10 characters').max(500, 'Product description too long'),
    selectedStyle: z.string().optional(),
    customStyle: z.string().max(200, 'Custom style description too long').optional(),
    outputFormat: OutputFormat
}).refine(
    (data: { selectedStyle?: string; customStyle?: string }) => {
        // Either selectedStyle must be a valid preset OR customStyle must be provided
        return (data.selectedStyle && data.selectedStyle.trim() !== '') ||
            (data.customStyle && data.customStyle.trim() !== '');
    },
    {
        message: 'Either a style preset must be selected or a custom style description must be provided',
        path: ['selectedStyle']
    }
);

// Image generation request schema (for image generation jobs)
export const ImageGenerationRequestSchema = z.object({
    productImageS3Key: z.string().min(1, 'Product image S3 key is required'),
    productTitle: z.string().min(1, 'Product title is required').max(100, 'Product title too long'),
    productDescription: z.string().min(10, 'Product description must be at least 10 characters').max(500, 'Product description too long'),
    selectedStyle: z.string().optional(),
    customStyle: z.string().max(200, 'Custom style description too long').optional(),
    outputFormat: OutputFormat,
    campaignId: z.string().min(1, 'Campaign ID is required')
}).refine(
    (data: { selectedStyle?: string; customStyle?: string }) => {
        // Either selectedStyle must be a valid preset OR customStyle must be provided
        return (data.selectedStyle && data.selectedStyle.trim() !== '') ||
            (data.customStyle && data.customStyle.trim() !== '');
    },
    {
        message: 'Either a style preset must be selected or a custom style description must be provided',
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



// Campaign response schema
export const CampaignResponseSchema = z.object({
    success: z.boolean(),
    campaignId: z.string(),
    message: z.string()
});

// Campaigns list response schema
export const CampaignsListResponseSchema = z.object({
    success: z.boolean(),
    campaigns: z.array(z.any()) // You can define a more specific campaign schema if needed
});

// Type exports
export type CampaignCreationRequest = z.infer<typeof CampaignCreationRequestSchema>;
export type ImageGenerationRequest = z.infer<typeof ImageGenerationRequestSchema>;
export type JobStatusResponse = z.infer<typeof JobStatusResponseSchema>;
export type ImageGenerationResponse = z.infer<typeof ImageGenerationResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type CampaignResponse = z.infer<typeof CampaignResponseSchema>;
export type CampaignsListResponse = z.infer<typeof CampaignsListResponseSchema>; 