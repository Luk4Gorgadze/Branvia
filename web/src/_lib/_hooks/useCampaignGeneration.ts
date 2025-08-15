import { useState } from 'react';
import { createCampaign } from '@/_actions/campaigns';
import { createImageGenerationJob } from '@/_actions/jobs';
import { StylePreset, OutputFormat } from '@/_lib/_schemas/imageGeneration';
import { z } from 'zod';

interface CampaignFormData {
    productImage: File | null;
    productImageS3Key: string | null;
    productImageUrl: string | null;
    productTitle: string;
    productDescription: string;
    selectedStyle: string;
    customStyle: string;
    outputFormat: string;
}

interface UseCampaignGenerationReturn {
    isGenerating: boolean;
    isSubmitted: boolean;
    generateCampaign: (formData: CampaignFormData) => Promise<{
        success: boolean;
        campaignId?: string;
        error?: string;
    }>;
}

export const useCampaignGeneration = (): UseCampaignGenerationReturn => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const generateCampaign = async (
        formData: CampaignFormData
    ): Promise<{ success: boolean; campaignId?: string; error?: string }> => {
        setIsGenerating(true);

        try {
            // Validate required fields before proceeding
            if (!formData.productImageS3Key) {
                throw new Error('Product image is required');
            }

            // Create campaign using Server Action
            const campaignResult = await createCampaign({
                productTitle: formData.productTitle,
                productDescription: formData.productDescription,
                selectedStyle: formData.selectedStyle as z.infer<typeof StylePreset> | undefined,
                customStyle: formData.customStyle,
                outputFormat: formData.outputFormat as z.infer<typeof OutputFormat>,
                productImageS3Key: formData.productImageS3Key,
            });

            if (!campaignResult.success) {
                throw new Error(campaignResult.error || 'Failed to create campaign');
            }

            if (!campaignResult.data) {
                throw new Error('Failed to create campaign');
            }

            const campaignId = campaignResult.data.id;

            // Start image generation job using Server Action
            const jobResult = await createImageGenerationJob({
                productImageS3Key: formData.productImageS3Key,
                productTitle: formData.productTitle,
                productDescription: formData.productDescription,
                selectedStyle: formData.selectedStyle as z.infer<typeof StylePreset> | undefined,
                customStyle: formData.customStyle,
                outputFormat: formData.outputFormat as z.infer<typeof OutputFormat>,
                campaignId,
            });

            if (!jobResult.success) {
                throw new Error(jobResult.error || 'Failed to start image generation');
            }

            if (!jobResult.data) {
                throw new Error('Failed to start image generation');
            }

            // Mark as submitted to prevent duplicate submissions
            setIsSubmitted(true);

            return {
                success: true,
                campaignId: campaignId
            };

        } catch (error) {
            console.error('Campaign generation failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate campaign'
            };
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        isGenerating,
        isSubmitted,
        generateCampaign
    };
}; 