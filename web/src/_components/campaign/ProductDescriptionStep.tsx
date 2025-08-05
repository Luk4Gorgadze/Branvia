import { Type } from 'lucide-react';
import { CampaignFormData } from '@/_lib/_hooks/useCampaignForm';
import styles from '@/app/campaign/generate/generate.module.css';

interface ProductDescriptionStepProps {
    formData: CampaignFormData;
    updateFormData: (data: Partial<CampaignFormData>) => void;
}

export const ProductDescriptionStep = ({
    formData,
    updateFormData
}: ProductDescriptionStepProps) => {
    const handleInputChange = (field: string, value: string) => {
        updateFormData({ [field]: value });
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
                <Type size={32} />
                <h2>Describe Your Product</h2>
                <p>Help us understand your product to create better visuals</p>
            </div>

            <div className={styles.formGroup}>
                <label>Product Title</label>
                <input
                    type="text"
                    placeholder="e.g., Handmade Ceramic Mug"
                    value={formData.productTitle}
                    onChange={(e) => handleInputChange('productTitle', e.target.value)}
                    className={styles.textInput}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Product Description</label>
                <textarea
                    placeholder="Describe your product's features, style, use case, and what makes it special..."
                    value={formData.productDescription}
                    onChange={(e) => handleInputChange('productDescription', e.target.value)}
                    className={styles.textArea}
                    rows={4}
                />
            </div>
        </div>
    );
}; 