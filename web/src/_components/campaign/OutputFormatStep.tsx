import { FileImage } from 'lucide-react';
import { CampaignFormData } from '@/_lib/_hooks/useCampaignForm';
import styles from '@/app/campaign/generate/generate.module.css';

const outputFormats = [
    { id: 'square', name: 'Instagram Square', dimensions: '1024x1024 px' },
    { id: 'portrait', name: 'Story / Tall', dimensions: '1024x1536 px' },
    { id: 'landscape', name: 'Wide Banner', dimensions: '1536x1024 px' }
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