import { z } from 'zod';
import { StylePreset, OutputFormat } from './imageGeneration';

// Create campaign schema - userId comes from server-side auth
export const CreateCampaignSchema = z.object({
    productImageS3Key: z.string().min(1, 'Product image S3 key is required'),
    productTitle: z.string().min(1, 'Product title is required').max(100, 'Product title too long'),
    productDescription: z.string().min(10, 'Product description must be at least 10 characters').max(500, 'Product description too long'),
    selectedStyle: StylePreset.optional(),
    customStyle: z.string().max(200, 'Custom style description too long').optional(),
    outputFormat: OutputFormat
}).refine(
    (data: { selectedStyle?: string; customStyle?: string }) => data.selectedStyle || data.customStyle,
    {
        message: 'Either selectedStyle or customStyle must be provided',
        path: ['selectedStyle']
    }
);

// Get user campaigns schema - no userId needed, comes from server-side auth
export const GetUserCampaignsSchema = z.object({});

// Campaign response schema
export const CampaignResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    productTitle: z.string(),
    productDescription: z.string(),
    selectedStyle: z.string().nullable(),
    customStyle: z.string().nullable(),
    outputFormat: z.string(),
    productImageS3Key: z.string(),
    status: z.string(),
    public: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Type exports for use in components
export type CreateCampaignData = z.infer<typeof CreateCampaignSchema>;
export type GetUserCampaignsData = z.infer<typeof GetUserCampaignsSchema>;
export type CampaignResponse = z.infer<typeof CampaignResponseSchema>; 