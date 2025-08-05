import { Sparkles } from 'lucide-react';
import { CampaignFormData } from '@/_lib/_hooks/useCampaignForm';
import styles from '@/app/campaign/generate/generate.module.css';

// Style presets for display
const stylePresets = [
    { id: 'clean-minimal', name: 'Clean & Minimal' },
    { id: 'warm-cozy', name: 'Warm & Cozy' },
    { id: 'bold-vibrant', name: 'Bold & Vibrant' },
    { id: 'elegant-luxurious', name: 'Elegant & Luxurious' },
    { id: 'rustic-natural', name: 'Rustic & Natural' },
    { id: 'bright-playful', name: 'Bright & Playful' },
    { id: 'sleek-modern', name: 'Sleek & Modern' },
    { id: 'soft-dreamy', name: 'Soft & Dreamy' }
];

const outputFormats = [
    { id: 'instagram-post', name: 'Instagram Post' },
    { id: 'instagram-story', name: 'Instagram Story' },
    { id: 'facebook-ad', name: 'Facebook Ad Banner' },
    { id: 'pinterest-pin', name: 'Pinterest Pin' },
    { id: 'website-hero', name: 'Website Hero Image' }
];

interface ReviewStepProps {
    formData: CampaignFormData;
    isGenerating: boolean;
    onGenerate: () => Promise<void>;
}

export const ReviewStep = ({
    formData,
    isGenerating,
    onGenerate
}: ReviewStepProps) => {
    const selectedStyleName = formData.selectedStyle
        ? stylePresets.find(s => s.id === formData.selectedStyle)?.name
        : formData.customStyle;

    const selectedFormatName = outputFormats.find(f => f.id === formData.outputFormat)?.name;

    return (
        <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
                <Sparkles size={32} />
                <h2>Generate Your Campaign</h2>
                <p>Review your selections and generate your product visuals</p>
            </div>

            <div className={styles.reviewSection}>
                <div className={styles.reviewItem}>
                    <h3>Product</h3>
                    <p>{formData.productTitle}</p>
                    <p>{formData.productDescription}</p>
                </div>

                <div className={styles.reviewItem}>
                    <h3>Style</h3>
                    <p>{selectedStyleName}</p>
                </div>

                <div className={styles.reviewItem}>
                    <h3>Format</h3>
                    <p>{selectedFormatName}</p>
                </div>
            </div>

            <button
                className={styles.generateButton}
                onClick={onGenerate}
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <>
                        <div className={styles.spinner}></div>
                        Generating...
                    </>
                ) : (
                    <>
                        <Sparkles size={20} />
                        Generate Campaign
                    </>
                )}
            </button>
        </div>
    );
}; 