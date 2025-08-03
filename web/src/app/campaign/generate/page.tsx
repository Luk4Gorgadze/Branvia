"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/_lib/_providers';
import Image from 'next/image';
import { Upload, ArrowRight, ArrowLeft, Sparkles, Palette, FileImage, Type, Camera } from 'lucide-react';
import styles from './generate.module.css';

// Style presets with visual representations
const stylePresets = [
    {
        id: 'clean-minimal',
        name: 'Clean & Minimal',
        description: 'Simple, uncluttered backgrounds with focus on product',
        preview: '/example.png' // You'll need actual style preview images
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

const outputFormats = [
    { id: 'instagram-post', name: 'Instagram Post', dimensions: '1080x1080 px' },
    { id: 'instagram-story', name: 'Instagram Story', dimensions: '1080x1920 px' },
    { id: 'facebook-ad', name: 'Facebook Ad Banner', dimensions: '1200x628 px' },
    { id: 'pinterest-pin', name: 'Pinterest Pin', dimensions: '1000x1500 px' },
    { id: 'website-hero', name: 'Website Hero Image', dimensions: '1920x600 px' }
];

const CampaignGeneratePage = () => {
    const { user } = useUser();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        productImage: null as File | null,
        productTitle: '',
        productDescription: '',
        selectedStyle: '',
        customStyle: '',
        outputFormat: '',
        generatedImages: [] as string[]
    });

    // Redirect if not logged in
    if (!user) {
        router.push('/');
        return null;
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, productImage: file }));
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.productImage;
            case 2: return formData.productTitle && formData.productDescription;
            case 3: return formData.selectedStyle || formData.customStyle;
            case 4: return formData.outputFormat;
            default: return true;
        }
    };

    const generateCampaign = async () => {
        setIsGenerating(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mock generated images
        const mockImages = ['/example.png', '/example.png', '/example.png'];
        setFormData(prev => ({ ...prev, generatedImages: mockImages }));

        setIsGenerating(false);

        // Navigate to campaign view page
        router.push('/campaign/123'); // You'll need to get the actual campaign ID from your API
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className={styles.stepContent}>
                        <div className={styles.stepHeader}>
                            <Camera size={32} />
                            <h2>Upload Product Image</h2>
                            <p>Upload a clear, high-quality photo of your product</p>
                        </div>

                        <div className={styles.uploadArea}>
                            {formData.productImage ? (
                                <div className={styles.imagePreview}>
                                    <Image
                                        src={URL.createObjectURL(formData.productImage)}
                                        alt="Product preview"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <button
                                        className={styles.changeImage}
                                        onClick={() => setFormData(prev => ({ ...prev, productImage: null }))}
                                    >
                                        Change Image
                                    </button>
                                </div>
                            ) : (
                                <label className={styles.uploadLabel}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className={styles.fileInput}
                                    />
                                    <Upload size={48} />
                                    <span>Click to upload or drag and drop</span>
                                    <span className={styles.fileTypes}>JPEG, PNG up to 10MB</span>
                                </label>
                            )}
                        </div>
                    </div>
                );

            case 2:
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

            case 3:
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
                                    onClick={() => handleInputChange('selectedStyle', style.id)}
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
                                onChange={(e) => handleInputChange('customStyle', e.target.value)}
                                className={styles.textArea}
                                rows={3}
                            />
                        </div>
                    </div>
                );

            case 4:
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
                                    onClick={() => handleInputChange('outputFormat', format.id)}
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

            case 5:
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
                                <p>{formData.selectedStyle ? stylePresets.find(s => s.id === formData.selectedStyle)?.name : formData.customStyle}</p>
                            </div>

                            <div className={styles.reviewItem}>
                                <h3>Format</h3>
                                <p>{outputFormats.find(f => f.id === formData.outputFormat)?.name}</p>
                            </div>
                        </div>

                        <button
                            className={styles.generateButton}
                            onClick={generateCampaign}
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

            default:
                return null;
        }
    };

    return (
        <div className={styles.generatePage}>
            <div className={styles.container}>
                {/* Credits Display */}
                <div className={styles.creditsDisplay}>
                    <div className={styles.creditsInfo}>
                        <span className={styles.creditsLabel}>Your Credits:</span>
                        <span className={styles.creditsAmount}>150</span>
                    </div>
                    <div className={styles.generationCost}>
                        <span className={styles.costLabel}>Generation Cost:</span>
                        <span className={styles.costAmount}>50 credits</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className={styles.progressBar}>
                    {[1, 2, 3, 4, 5].map((step) => (
                        <div
                            key={step}
                            className={`${styles.progressStep} ${step <= currentStep ? styles.active : ''}`}
                        >
                            <div className={styles.stepNumber}>{step}</div>
                            <span className={styles.stepLabel}>
                                {step === 1 && 'Upload'}
                                {step === 2 && 'Describe'}
                                {step === 3 && 'Style'}
                                {step === 4 && 'Format'}
                                {step === 5 && 'Generate'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className={styles.content}>
                    {renderStepContent()}
                </div>

                {/* Navigation */}
                <div className={styles.navigation}>
                    {currentStep > 1 && (
                        <button className={styles.navButton} onClick={prevStep}>
                            <ArrowLeft size={20} />
                            Previous
                        </button>
                    )}

                    {currentStep < 5 && (
                        <button
                            className={`${styles.navButton} ${styles.primary}`}
                            onClick={nextStep}
                            disabled={!canProceed()}
                        >
                            Next
                            <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignGeneratePage; 