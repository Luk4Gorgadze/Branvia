import Image from 'next/image';
import { Camera, Upload } from 'lucide-react';
import { CampaignFormData } from '@/_lib/_hooks/useCampaignForm';
import styles from '../../app/campaign/generate/generate.module.css';

interface ImageUploadStepProps {
    formData: CampaignFormData;
    onImageUpload: (file: File) => Promise<void>;
    onImageDelete: () => Promise<void>;
    isUploading: boolean;
}

export const ImageUploadStep = ({
    formData,
    onImageUpload,
    onImageDelete,
    isUploading
}: ImageUploadStepProps) => {
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        await onImageUpload(file);
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
                <Camera size={32} />
                <h2>Upload Product Image</h2>
                <p>Upload a clear, high-quality photo of your product</p>
            </div>

            <div className={styles.uploadArea}>
                {formData.productImageUrl ? (
                    <div className={styles.imagePreview}>
                        <Image
                            src={formData.productImageUrl}
                            alt="Product preview"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                        <button
                            className={styles.changeImage}
                            onClick={onImageDelete}
                        >
                            Change Image
                        </button>
                    </div>
                ) : (
                    <label className={styles.uploadLabel}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={styles.fileInput}
                            disabled={isUploading}
                        />
                        <Upload size={48} />
                        <span>{isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}</span>
                        <span className={styles.fileTypes}>JPEG, PNG up to 10MB</span>
                    </label>
                )}
            </div>
        </div>
    );
}; 