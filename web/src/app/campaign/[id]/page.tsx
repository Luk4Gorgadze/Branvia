"use client"
import styles from "@/app/campaign/[id]/campaign.module.css"
import Image from "next/image";
import { Copy, Download, Palette, FileImage, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@/_lib/_providers';
import { useRouter } from 'next/navigation';

interface Campaign {
    id: string;
    productTitle: string;
    productDescription: string;
    selectedStyle?: string;
    customStyle?: string;
    outputFormat: string;
    productImageS3Key: string;
    generatedImages: string[];
    status: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

const CampaignPage = ({ params }: { params: { id: string } }) => {
    const { user } = useUser();
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await fetch(`/api/campaigns/${params.id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch campaign');
                }
                const data = await response.json();
                setCampaign(data.campaign);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load campaign');
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [params.id]);

    // Redirect if not logged in
    if (!user) {
        router.push('/');
        return null;
    }

    if (loading) {
        return <div className={styles.loading}>Loading campaign...</div>;
    }

    if (error || !campaign) {
        return <div className={styles.error}>Error: {error || 'Campaign not found'}</div>;
    }

    const copyToClipboard = async () => {
        try {
            const promptText = `Professional product photography of ${campaign.productTitle}. ${campaign.productDescription}. Style: ${campaign.customStyle || campaign.selectedStyle}. Format: ${campaign.outputFormat}. High quality, commercial use.`;
            await navigator.clipboard.writeText(promptText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const downloadImage = async (imageUrl: string, index: number) => {
        try {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `generated-image-${index + 1}.png`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading image:', error);
            window.open(imageUrl, '_blank');
        }
    };

    // Generate S3 URL for a file
    const getS3Url = (s3Key: string) => {
        return `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
    };

    return (
        <div className={styles.campaignPage}>
            {/* Left Side - Images Column */}
            <div className={styles.imagesColumn}>
                {/* Generated Images */}
                <div className={styles.generatedImagesSection}>
                    <h3 className={styles.sectionTitle}>Generated Images</h3>
                    <div className={styles.generatedImagesGrid}>
                        {campaign.generatedImages.length > 0 ? (
                            campaign.generatedImages.map((s3Key, index) => (
                                <div key={index} className={styles.generatedImageCard}>
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={getS3Url(s3Key)}
                                            alt={`Generated Image ${index + 1}`}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <button
                                        className={styles.downloadButton}
                                        onClick={() => downloadImage(getS3Url(s3Key), index)}
                                    >
                                        <Download size={16} />
                                        Download
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noImages}>
                                <Sparkles size={48} />
                                <p>Images are being generated...</p>
                                <p>Status: {campaign.status}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Product Image */}
                <div className={styles.inputImageSection}>
                    <h3 className={styles.sectionTitle}>Input Product Image</h3>
                    <div className={styles.inputImageContainer}>
                        <Image
                            src={getS3Url(campaign.productImageS3Key)}
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
                    <h1 className={styles.productTitle}>{campaign.productTitle}</h1>

                    {/* Product Description */}
                    <p className={styles.productDescription}>{campaign.productDescription}</p>

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
                        <p className={styles.promptText}>
                            Professional product photography of {campaign.productTitle}. {campaign.productDescription}. Style: {campaign.customStyle || campaign.selectedStyle}. Format: {campaign.outputFormat}. High quality, commercial use.
                        </p>
                    </div>

                    {/* Style Chosen */}
                    <div className={styles.infoRow}>
                        <div className={styles.infoIcon}>
                            <Palette size={20} />
                        </div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Style</span>
                            <span className={styles.infoValue}>{campaign.customStyle || campaign.selectedStyle}</span>
                        </div>
                    </div>

                    {/* Output Format */}
                    <div className={styles.infoRow}>
                        <div className={styles.infoIcon}>
                            <FileImage size={20} />
                        </div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Output Format</span>
                            <span className={styles.infoValue}>{campaign.outputFormat}</span>
                        </div>
                    </div>

                    {/* Generation Status */}
                    <div className={styles.infoRow}>
                        <div className={styles.infoIcon}>
                            <Sparkles size={20} />
                        </div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Status</span>
                            <span className={styles.infoValue}>{campaign.status}</span>
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
                </div>
            </div>
        </div>
    )
}

export default CampaignPage;