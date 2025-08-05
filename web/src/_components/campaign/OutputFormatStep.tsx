import { FileImage } from 'lucide-react';
import { CampaignFormData } from '@/_lib/_hooks/useCampaignForm';
import styles from '@/app/campaign/generate/generate.module.css';

const outputFormats = [
    { id: 'instagram-post', name: 'Instagram Post', dimensions: '1080x1080 px' },
    { id: 'instagram-story', name: 'Instagram Story', dimensions: '1080x1920 px' },
    { id: 'facebook-ad', name: 'Facebook Ad Banner', dimensions: '1200x628 px' },
    { id: 'pinterest-pin', name: 'Pinterest Pin', dimensions: '1000x1500 px' },
    { id: 'website-hero', name: 'Website Hero Image', dimensions: '1920x600 px' }
];

interface OutputFormatStepProps {
    formData: CampaignFormData;
    updateFormData: (data: Partial<CampaignFormData>) => void;
}

export const OutputFormatStep = ({
    formData,
    updateFormData
}: OutputFormatStepProps) => {
    const handleFormatSelect = (formatId: string) => {
        updateFormData({ outputFormat: formatId });
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
                <FileImage size={32} />
                <h2>Select Output Format</h2>
                <p>Choose the format that best fits your marketing needs</p>
            </div>

            <div className={styles.formatGrid}>
                {outputFormats.map((format) => (
                    <div
                        key={format.id}
                        className={`${styles.formatCard} ${formData.outputFormat === format.id ? styles.selected : ''}`}
                        onClick={() => handleFormatSelect(format.id)}
                    >
                        <div className={styles.formatIcon}>
                            <FileImage size={24} />
                        </div>
                        <div className={styles.formatInfo}>
                            <h3>{format.name}</h3>
                            <p>{format.dimensions}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 