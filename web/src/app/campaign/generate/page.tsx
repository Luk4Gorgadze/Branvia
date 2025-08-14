"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/_lib/_providers';
import { CampaignForm } from '@/_components/campaign/CampaignForm';
import { ProgressBar } from '@/_components/campaign/ProgressBar';
import { CreditsDisplay } from '@/_components/campaign/CreditsDisplay';
import { useCampaignForm } from '@/_lib/_hooks/useCampaignForm';
import { useImageUpload } from '@/_lib/_hooks/useImageUpload';
import { useCampaignGeneration } from '@/_lib/_hooks/useCampaignGeneration';
import styles from './generate.module.css';

const CampaignGeneratePage = () => {
    const { user } = useUser();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);

    const { formData, updateFormData, canProceed } = useCampaignForm();
    const { uploadImage, deleteImage, isUploading } = useImageUpload();
    const { generateCampaign, isGenerating, isSubmitted } = useCampaignGeneration();

    // Redirect if not logged in
    if (!user) {
        router.push('/');
        return null;
    }

    const handleImageUpload = async (file: File) => {
        try {
            const { s3Key, url } = await uploadImage(file, user.id);
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

    const handleGenerate = async () => {
        const result = await generateCampaign(formData, user.id);

        if (result.success && result.campaignId) {
            // Small delay to show the submitted state before redirecting
            setTimeout(() => {
                router.push(`/campaign/${result.campaignId}`);
            }, 1500);
        } else {
            alert(result.error || 'Failed to generate campaign. Please try again.');
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
                    onGenerate={handleGenerate}
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