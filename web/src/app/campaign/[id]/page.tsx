"use client"
import styles from "@/app/campaign/[id]/campaign.module.css"
import Image from "next/image";
import { Copy, Download, Palette, FileImage, Sparkles } from 'lucide-react';
import { useState } from 'react';

const CampaignPage = () => {
    const [copied, setCopied] = useState(false);

    // Mock data - in real app this would come from props or API
    const campaignData = {
        title: "Luxury Brand Photography",
        description: "Professional product photography with premium lighting and sophisticated styling for high-end marketing campaigns.",
        promptText: "Create a stunning luxury brand photography image featuring a premium product in an elegant setting. Use soft, professional lighting with a sophisticated color palette. The composition should convey exclusivity and high-end appeal, perfect for premium marketing campaigns.",
        style: "Luxury Professional",
        outputFormat: "High Resolution (4K)",
        inputImage: "/example.png",
        generatedImages: ["/example.png", "/example.png", "/example.png"]
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(campaignData.promptText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const downloadImage = async (imageUrl: string, index: number) => {
        try {
            // Option 1: Direct download (lightweight - just triggers browser download)
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `generated-image-${index + 1}.png`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading image:', error);
            // Fallback: open image in new tab for manual download
            window.open(imageUrl, '_blank');
        }
    };

    return (
        <div className={styles.campaignPage}>
            {/* Left Side - Images Column */}
            <div className={styles.imagesColumn}>
                {/* Generated Images */}
                <div className={styles.generatedImagesSection}>
                    <h3 className={styles.sectionTitle}>Generated Images</h3>
                    <div className={styles.generatedImagesGrid}>
                        {campaignData.generatedImages.map((image, index) => (
                            <div key={index} className={styles.generatedImageCard}>
                                <div className={styles.imageWrapper}>
                                    <Image
                                        src={image}
                                        alt={`Generated Image ${index + 1}`}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <button
                                    className={styles.downloadButton}
                                    onClick={() => downloadImage(image, index)}
                                >
                                    <Download size={16} />
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Input Product Image */}
                <div className={styles.inputImageSection}>
                    <h3 className={styles.sectionTitle}>Input Product Image</h3>
                    <div className={styles.inputImageContainer}>
                        <Image
                            src={campaignData.inputImage}
                            alt="Input Product Image"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Details Column */}
            <div className={styles.detailsColumn}>
                <div className={styles.detailsContent}>
                    {/* Product Title */}
                    <h1 className={styles.productTitle}>{campaignData.title}</h1>

                    {/* Product Description */}
                    <p className={styles.productDescription}>{campaignData.description}</p>

                    {/* Prompt Text */}
                    <div className={styles.promptSection}>
                        <div className={styles.promptHeader}>
                            <h3>Prompt Text</h3>
                            <button
                                onClick={copyToClipboard}
                                className={styles.copyButton}
                                title="Copy prompt to clipboard"
                            >
                                <Copy size={16} />
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p className={styles.promptText}>{campaignData.promptText}</p>
                    </div>

                    {/* Style Chosen */}
                    <div className={styles.infoRow}>
                        <div className={styles.infoIcon}>
                            <Palette size={20} />
                        </div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Style</span>
                            <span className={styles.infoValue}>{campaignData.style}</span>
                        </div>
                    </div>

                    {/* Output Format */}
                    <div className={styles.infoRow}>
                        <div className={styles.infoIcon}>
                            <FileImage size={20} />
                        </div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Output Format</span>
                            <span className={styles.infoValue}>{campaignData.outputFormat}</span>
                        </div>
                    </div>

                    {/* Generation Cost */}
                    <div className={styles.infoRow}>
                        <div className={styles.infoIcon}>
                            <Sparkles size={20} />
                        </div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Generation Cost</span>
                            <span className={styles.infoValue}>50 credits</span>
                        </div>
                    </div>

                    {/* AI Platform */}
                    {/* <div className={styles.infoRow}>
                        <div className={styles.infoIcon}>
                            <Sparkles size={20} />
                        </div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>AI Platform</span>
                            <span className={styles.infoValue}>Midjourney v6</span>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default CampaignPage;