"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/_lib/_providers';
import { CampaignForm } from '@/_components/campaign/CampaignForm';
import { ProgressBar } from '@/_components/campaign/ProgressBar';
import { CreditsDisplay } from '@/_components/campaign/CreditsDisplay';
import { useCampaignForm } from '@/_lib/_hooks/useCampaignForm';
import { useImageUpload } from '@/_lib/_hooks/useImageUpload';
import styles from './generate.module.css';

const CampaignGeneratePage = () => {
    const { user } = useUser();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { formData, updateFormData, canProceed } = useCampaignForm();
    const { uploadImage, deleteImage, isUploading } = useImageUpload();

    // Redirect if not logged in
    if (!user) {
        router.push('/');
        return null;
    }

    const handleImageUpload = async (file: File) => {
        try {
            const { s3Key, url } = await uploadImage(file);
            updateFormData({
                productImage: file,
                productImageS3Key: s3Key,
                productImageUrl: url
            });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image. Please try again.');
        }
    };

    const handleImageDelete = async () => {
        if (formData.productImageS3Key) {
            await deleteImage(formData.productImageS3Key);
        }
        updateFormData({
            productImage: null,
            productImageS3Key: null,
            productImageUrl: null
        });
    };

    const nextStep = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const generateCampaign = async () => {
        setIsGenerating(true);

        try {
            // Create campaign in database
            const campaignResponse = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productTitle: formData.productTitle,
                    productDescription: formData.productDescription,
                    selectedStyle: formData.selectedStyle,
                    customStyle: formData.customStyle,
                    outputFormat: formData.outputFormat,
                    productImageS3Key: formData.productImageS3Key,
                }),
            });

            if (!campaignResponse.ok) {
                throw new Error('Failed to create campaign');
            }

            const { campaignId } = await campaignResponse.json();

            // Start image generation job
            const generationResponse = await fetch('/api/jobs/image-generation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productImageS3Key: formData.productImageS3Key,
                    productTitle: formData.productTitle,
                    productDescription: formData.productDescription,
                    ...(formData.selectedStyle && { selectedStyle: formData.selectedStyle }),
                    ...(formData.customStyle && { customStyle: formData.customStyle }),
                    outputFormat: formData.outputFormat,
                    campaignId,
                    userId: user.id,
                }),
            });

            if (!generationResponse.ok) {
                throw new Error('Failed to start image generation');
            }

            // Mark as submitted to prevent duplicate submissions
            setIsSubmitted(true);

            // Small delay to show the submitted state before redirecting
            setTimeout(() => {
                router.push(`/campaign/${campaignId}`);
            }, 1500);
        } catch (error) {
            console.error('Campaign generation failed:', error);
            alert('Failed to generate campaign. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={styles.generatePage}>
            <div className={styles.container}>
                <CreditsDisplay />

                <ProgressBar currentStep={currentStep} />

                <CampaignForm
                    currentStep={currentStep}
                    formData={formData}
                    updateFormData={updateFormData}
                    onImageUpload={handleImageUpload}
                    onImageDelete={handleImageDelete}
                    isUploading={isUploading}
                    isGenerating={isGenerating}
                    isSubmitted={isSubmitted}
                    onGenerate={generateCampaign}
                />

                <div className={styles.navigation}>
                    {currentStep > 1 && (
                        <button className={styles.navButton} onClick={prevStep}>
                            Previous
                        </button>
                    )}

                    {currentStep < 5 && (
                        <button
                            className={`${styles.navButton} ${styles.primary}`}
                            onClick={nextStep}
                            disabled={!canProceed(currentStep)}
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignGeneratePage; 