"use client"
import styles from "@/app/campaign/[id]/campaign.module.css"
import Image from "next/image";
import { Copy, Download, Palette, FileImage, Sparkles, RefreshCw, Globe, Lock } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useUser } from '@/_lib/_providers';
import { useRouter } from 'next/navigation';
import { getOutputFormatResolution, getOutputFormatLabel } from '@/_lib/_schemas/imageGeneration';

interface Campaign {
    id: string;
    userId: string;
    productTitle: string;
    productDescription: string;
    selectedStyle?: string;
    customStyle?: string;
    outputFormat: string;
    productImageS3Key: string;
    generatedImages: string[];
    prompt?: string; // The AI-generated prompt used for image generation
    status: string;
    public: boolean;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };

}

const CampaignPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { user } = useUser();
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [inputImageAspectRatio, setInputImageAspectRatio] = useState<number>(1);

    const { id: campaignId } = use(params);

    // Generate S3 URL for a file
    const getS3Url = (s3Key: string) => {
        const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;
        const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';

        if (!bucketName) {
            console.error('NEXT_PUBLIC_AWS_S3_BUCKET_NAME is not defined');
            return '';
        }

        if (!s3Key || s3Key.trim() === '') {
            console.error('S3 key is empty or invalid:', s3Key);
            return '';
        }

        const url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
        return url;
    };

    const fetchCampaign = async () => {
        try {
            const response = await fetch(`/api/campaigns/${campaignId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch campaign');
            }
            const data = await response.json();
            setCampaign(data.campaign);

            // Calculate aspect ratio for input image
            if (data.campaign?.productImageS3Key) {
                const imageUrl = getS3Url(data.campaign.productImageS3Key);
                const img = new window.Image();
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    setInputImageAspectRatio(aspectRatio);
                };
                img.onerror = () => {
                    setInputImageAspectRatio(1); // Default to square if failed
                };
                img.src = imageUrl;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load campaign');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaign();
    }, [campaignId]);

    // Auto-refresh if status is processing
    useEffect(() => {
        if (campaign?.status === 'processing') {
            const interval = setInterval(fetchCampaign, 5000); // Check every 5 seconds
            return () => clearInterval(interval);
        }
    }, [campaign?.status]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchCampaign();
        setRefreshing(false);
    };

    if (loading) {
        return <div className={styles.loading}>Loading campaign...</div>;
    }

    if (error || !campaign) {
        return <div className={styles.error}>Error: {error || 'Campaign not found'}</div>;
    }

    // Check access control: redirect if user doesn't have access
    if (!campaign.public && (!user || campaign.userId !== user.id)) {
        router.push('/');
        return null;
    }

    const copyToClipboard = async () => {
        try {
            const promptText = campaign.prompt || `Professional product photography of ${campaign.productTitle}. ${campaign.productDescription}. Style: ${campaign.customStyle || campaign.selectedStyle}. Format: ${getOutputFormatLabel(campaign.outputFormat as any)}. High quality, commercial use.`;
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

    // Get aspect ratio for the output format
    const getAspectRatio = () => {
        const resolution = getOutputFormatResolution(campaign.outputFormat as any);
        return resolution.width / resolution.height;
    };

    // Get resolution info for display
    const getResolutionInfo = () => {
        const resolution = getOutputFormatResolution(campaign.outputFormat as any);
        return `${resolution.width}×${resolution.height}`;
    };

    return (
        <div className={styles.campaignPage}>
            {/* Left Side - Images Column */}
            <div className={styles.imagesColumn}>
                {/* Generated Images */}
                <div className={styles.generatedImagesSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Generated Images</h3>
                        <button
                            onClick={handleRefresh}
                            className={styles.refreshButton}
                            disabled={refreshing}
                        >
                            <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
                        </button>
                    </div>
                    <div className={styles.generatedImagesGrid}>
                        {campaign.generatedImages.length > 0 ? (
                            campaign.generatedImages.filter(imageUrl => imageUrl && imageUrl.trim() !== '').map((imageUrl, index) => (
                                <div key={index} className={styles.generatedImageCard}>
                                    <div
                                        className={styles.imageWrapper}
                                        style={{
                                            aspectRatio: getAspectRatio(),
                                            maxWidth: '100%'
                                        }}
                                    >
                                        {imageUrl && (
                                            <Image
                                                src={getS3Url(imageUrl)}
                                                alt={`Generated Image ${index + 1}`}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        )}
                                    </div>
                                    <button
                                        className={styles.downloadButton}
                                        onClick={() => downloadImage(getS3Url(imageUrl), index)}
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
                    <div
                        className={styles.inputImageContainer}
                        style={{
                            aspectRatio: inputImageAspectRatio,
                            width: '32%'
                        }}
                    >
                        {getS3Url(campaign.productImageS3Key) && (
                            <Image
                                src={getS3Url(campaign.productImageS3Key)}
                                alt="Input Product Image"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        )}
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
                            {campaign.prompt || `Professional product photography of ${campaign.productTitle}. ${campaign.productDescription}. Style: ${campaign.customStyle || campaign.selectedStyle}. Format: ${getOutputFormatLabel(campaign.outputFormat as any)}. High quality, commercial use.`}
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
                            <span className={styles.infoValue}>
                                {getOutputFormatLabel(campaign.outputFormat as any)} ({getResolutionInfo()})
                            </span>
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

                    {/* Campaign Visibility */}
                    <div className={styles.infoRow}>
                        <div className={styles.infoIcon}>
                            {campaign.public ? <Globe size={20} /> : <Lock size={20} />}
                        </div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>Visibility</span>
                            <span className={styles.infoValue}>
                                {campaign.public ? 'Public' : 'Private'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CampaignPage;