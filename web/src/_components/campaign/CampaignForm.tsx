import { ImageUploadStep } from './ImageUploadStep';
import { ProductDescriptionStep } from './ProductDescriptionStep';
import { StyleSelectionStep } from './StyleSelectionStep';
import { OutputFormatStep } from './OutputFormatStep';
import { ReviewStep } from './ReviewStep';
import { CampaignFormData } from '@/_lib/_hooks/useCampaignForm';
import styles from '@/app/campaign/generate/generate.module.css';

interface CampaignFormProps {
    currentStep: number;
    formData: CampaignFormData;
    updateFormData: (data: Partial<CampaignFormData>) => void;
    onImageUpload: (file: File) => Promise<void>;
    onImageDelete: () => Promise<void>;
    isUploading: boolean;
    isGenerating: boolean;
    onGenerate: () => Promise<void>;
}

export const CampaignForm = ({
    currentStep,
    formData,
    updateFormData,
    onImageUpload,
    onImageDelete,
    isUploading,
    isGenerating,
    onGenerate
}: CampaignFormProps) => {
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ImageUploadStep
                        formData={formData}
                        onImageUpload={onImageUpload}
                        onImageDelete={onImageDelete}
                        isUploading={isUploading}
                    />
                );
            case 2:
                return (
                    <ProductDescriptionStep
                        formData={formData}
                        updateFormData={updateFormData}
                    />
                );
            case 3:
                return (
                    <StyleSelectionStep
                        formData={formData}
                        updateFormData={updateFormData}
                    />
                );
            case 4:
                return (
                    <OutputFormatStep
                        formData={formData}
                        updateFormData={updateFormData}
                    />
                );
            case 5:
                return (
                    <ReviewStep
                        formData={formData}
                        isGenerating={isGenerating}
                        onGenerate={onGenerate}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.content}>
            {renderStepContent()}
        </div>
    );
}; 