import { useState } from 'react';

export interface CampaignFormData {
    productImage: File | null;
    productImageS3Key: string | null;
    productImageUrl: string | null;
    productTitle: string;
    productDescription: string;
    selectedStyle: string;
    customStyle: string;
    outputFormat: string;
    generatedImages: string[];
}

export const useCampaignForm = () => {
    const [formData, setFormData] = useState<CampaignFormData>({
        productImage: null,
        productImageS3Key: null,
        productImageUrl: null,
        productTitle: '',
        productDescription: '',
        selectedStyle: '',
        customStyle: '',
        outputFormat: '',
        generatedImages: []
    });

    const updateFormData = (data: Partial<CampaignFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const canProceed = (currentStep: number) => {
        switch (currentStep) {
            case 1: return !!formData.productImageUrl;
            case 2: return !!formData.productTitle &&
                formData.productDescription.length >= 10 &&
                formData.productDescription.length <= 500;
            case 3: return !!formData.selectedStyle || !!formData.customStyle;
            case 4: return !!formData.outputFormat;
            default: return true;
        }
    };

    return {
        formData,
        updateFormData,
        canProceed
    };
}; 