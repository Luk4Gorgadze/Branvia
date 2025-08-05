import Image from 'next/image';
import { Palette } from 'lucide-react';
import { CampaignFormData } from '@/_lib/_hooks/useCampaignForm';
import styles from '@/app/campaign/generate/generate.module.css';

// Style presets with visual representations
const stylePresets = [
    {
        id: 'clean-minimal',
        name: 'Clean & Minimal',
        description: 'Simple, uncluttered backgrounds with focus on product',
        preview: '/example.png'
    },
    {
        id: 'warm-cozy',
        name: 'Warm & Cozy',
        description: 'Soft lighting, warm tones, comfortable atmosphere',
        preview: '/example.png'
    },
    {
        id: 'bold-vibrant',
        name: 'Bold & Vibrant',
        description: 'High contrast, bright colors, energetic feel',
        preview: '/example.png'
    },
    {
        id: 'elegant-luxurious',
        name: 'Elegant & Luxurious',
        description: 'Sophisticated lighting, premium materials, upscale feel',
        preview: '/example.png'
    },
    {
        id: 'rustic-natural',
        name: 'Rustic & Natural',
        description: 'Organic textures, earthy tones, handmade feel',
        preview: '/example.png'
    },
    {
        id: 'bright-playful',
        name: 'Bright & Playful',
        description: 'Fun colors, dynamic compositions, cheerful mood',
        preview: '/example.png'
    },
    {
        id: 'sleek-modern',
        name: 'Sleek & Modern',
        description: 'Clean lines, contemporary design, tech-forward',
        preview: '/example.png'
    },
    {
        id: 'soft-dreamy',
        name: 'Soft & Dreamy',
        description: 'Gentle lighting, pastel colors, ethereal quality',
        preview: '/example.png'
    }
];

interface StyleSelectionStepProps {
    formData: CampaignFormData;
    updateFormData: (data: Partial<CampaignFormData>) => void;
}

export const StyleSelectionStep = ({
    formData,
    updateFormData
}: StyleSelectionStepProps) => {
    const handleStyleSelect = (styleId: string) => {
        updateFormData({ selectedStyle: styleId, customStyle: '' });
    };

    const handleCustomStyleChange = (value: string) => {
        updateFormData({ customStyle: value, selectedStyle: '' });
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
                <Palette size={32} />
                <h2>Choose Your Style</h2>
                <p>Select a visual style that matches your brand</p>
            </div>

            <div className={styles.styleGrid}>
                {stylePresets.map((style) => (
                    <div
                        key={style.id}
                        className={`${styles.styleCard} ${formData.selectedStyle === style.id ? styles.selected : ''}`}
                        onClick={() => handleStyleSelect(style.id)}
                    >
                        <div className={styles.stylePreview}>
                            <Image
                                src={style.preview}
                                alt={style.name}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <h3>{style.name}</h3>
                        <p>{style.description}</p>
                    </div>
                ))}
            </div>

            <div className={styles.customStyleSection}>
                <h3>Or describe your custom style:</h3>
                <textarea
                    placeholder="Describe your desired visual style..."
                    value={formData.customStyle}
                    onChange={(e) => handleCustomStyleChange(e.target.value)}
                    className={styles.textArea}
                    rows={3}
                />
            </div>
        </div>
    );
}; 