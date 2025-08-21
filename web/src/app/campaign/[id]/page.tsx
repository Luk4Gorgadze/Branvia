"use client"
import styles from "@/app/campaign/[id]/campaign.module.css"
import Image from "next/image";
import { Skeleton, SkeletonText } from "@/_components/ui/Skeleton";
import { Copy, Download, Palette, FileImage, Sparkles, RefreshCw, Globe, Lock } from 'lucide-react';
import { useState, useEffect, use, useCallback } from 'react';
import { useUser } from '@/_lib/_providers';
import { useRouter } from 'next/navigation';
import { getOutputFormatResolution, getOutputFormatLabel } from '@/_lib/_schemas/imageGeneration';
import { getCampaignById, submitCampaignFeedback } from '@/_actions/campaigns';

interface Campaign {
    id: string;
    userId: string;
    productTitle: string;
    productDescription: string;
    selectedStyle: string | null;
    customStyle: string | null;
    outputFormat: string;
    productImageS3Key: string | null;
    generatedImages: string[];
    prompt: string | null;
    status: string;
    public: boolean;
    createdAt: Date;
    updatedAt: Date;
    feedbackSubmitted?: boolean;
    feedbackMessage?: string | null;
    feedbackAt?: Date | null;
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
    const [feedback, setFeedback] = useState('');
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const [feedbackError, setFeedbackError] = useState<string | null>(null);
    const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

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

    const fetchCampaign = useCallback(async () => {
        try {
            const result = await getCampaignById({ campaignId });
            if (result.success && result.data) {
                setCampaign(result.data);

                // Calculate aspect ratio for input image
                if (result.data?.productImageS3Key) {
                    const imageUrl = getS3Url(result.data.productImageS3Key);
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
            } else {
                throw new Error(result.error || 'Failed to fetch campaign');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load campaign');
        } finally {
            setLoading(false);
        }
    }, [campaignId, user?.id]);

    useEffect(() => {
        fetchCampaign();
    }, [campaignId, fetchCampaign]);

    // Auto-refresh if status is processing
    useEffect(() => {
        if (campaign?.status === 'processing') {
            const interval = setInterval(fetchCampaign, 5000); // Check every 5 seconds
            return () => clearInterval(interval);
        }
    }, [campaign?.status, fetchCampaign]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchCampaign();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <div className={styles.campaignPage}>
                <div className={styles.imagesColumn}>
                    <div className={styles.generatedImagesSection}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}>Generated Images</h3>
                        </div>
                        <div className={styles.generatedImagesGrid}>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className={styles.generatedImageCard}>
                                    <div className={styles.imageWrapper} style={{ aspectRatio: 1 }}>
                                        <Skeleton />
                                    </div>
                                    <div>
                                        <Skeleton style={{ height: 36 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.inputImageSection}>
                        <h3 className={styles.sectionTitle}>Input Product Image</h3>
                        <div className={styles.inputAndFeedbackRow}>
                            <div className={styles.inputImageContainer} style={{ aspectRatio: 1, width: '32%' }}>
                                <Skeleton />
                            </div>
                            <div className={styles.feedbackCard}>
                                <div className={styles.feedbackHeader}>
                                    <h3 className={styles.sectionTitle}>Send Feedback</h3>
                                </div>
                                <p className={styles.feedbackHelper}>Tell us how we can improve this result. This can be submitted once.</p>
                                <Skeleton style={{ height: 120 }} />
                                <div>
                                    <Skeleton style={{ height: 38, width: 140 }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.detailsColumn}>
                    <div className={styles.detailsContent}>
                        <div className={styles.promptSection}>
                            <div className={styles.promptHeader}>
                                <h3>Prompt Text</h3>
                            </div>
                            <SkeletonText lines={4} />
                        </div>
                    </div>
                </div>
            </div>
        );
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
            const promptText = campaign.prompt || `Professional product photography of ${campaign.productTitle}. ${campaign.productDescription}. Style: ${campaign.customStyle || campaign.selectedStyle}. Format: ${getOutputFormatLabel(campaign.outputFormat as string)}. High quality, commercial use.`;
            await navigator.clipboard.writeText(promptText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const downloadImage = async (s3Key: string, index: number) => {
        try {
            // Download through our secure API endpoint
            const response = await fetch('/api/images/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ s3Key })
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = `${campaign.productTitle.replace(/[^a-zA-Z0-9]/g, '-')}-generated-${index + 1}.jpg`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Failed to download image. Please try again.');
        }
    };

    // Get aspect ratio for the output format
    const getAspectRatio = () => {
        const resolution = getOutputFormatResolution(campaign.outputFormat as string);
        return resolution.width / resolution.height;
    };

    // Get resolution info for display
    const getResolutionInfo = () => {
        const resolution = getOutputFormatResolution(campaign.outputFormat as string);
        return `${resolution.width}×${resolution.height}`;
    };

    const isOwner = !!user && campaign.userId === user.id;
    const canShowFeedback = isOwner && !campaign.feedbackSubmitted;

    const handleSubmitFeedback = async () => {
        if (!campaign) return;
        setFeedbackSubmitting(true);
        setFeedbackError(null);
        setFeedbackSuccess(null);
        try {
            const result = await submitCampaignFeedback({ campaignId: campaign.id, message: feedback.trim() });
            if (result.success) {
                setFeedbackSuccess('Feedback sent successfully. Thank you!');
                setCampaign({ ...campaign, feedbackSubmitted: true, feedbackMessage: feedback, feedbackAt: new Date() as any });
                setFeedback('');
            } else {
                setFeedbackError(result.error || 'Failed to submit feedback');
            }
        } catch (e: any) {
            setFeedbackError(e?.message || 'Failed to submit feedback');
        } finally {
            setFeedbackSubmitting(false);
        }
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
                                        onClick={() => downloadImage(imageUrl, index)}
                                    >
                                        <Download size={16} />
                                        Download
                                    </button>
                                </div>
                            ))
                        ) : (
                            // Skeletons while processing
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className={styles.generatedImageCard}>
                                    <div
                                        className={styles.imageWrapper}
                                        style={{ aspectRatio: getAspectRatio(), maxWidth: '100%' }}
                                    >
                                        <Skeleton />
                                    </div>
                                    <div>
                                        <Skeleton style={{ height: 36 }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Input Product Image + Feedback (owner only) */}
                <div className={styles.inputImageSection}>
                    <h3 className={styles.sectionTitle}>Input Product Image</h3>
                    <div className={styles.inputAndFeedbackRow}>
                        <div
                            className={styles.inputImageContainer}
                            style={{
                                aspectRatio: inputImageAspectRatio,
                                width: '32%'
                            }}
                        >
                            {campaign.productImageS3Key && getS3Url(campaign.productImageS3Key) && (
                                <Image
                                    src={getS3Url(campaign.productImageS3Key)}
                                    alt="Input Product Image"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            )}
                        </div>

                        {canShowFeedback ? (
                            <div className={styles.feedbackCard}>
                                <div className={styles.feedbackHeader}>
                                    <h3 className={styles.sectionTitle}>Send Feedback</h3>
                                </div>
                                <p className={styles.feedbackHelper}>Tell us how we can improve this result. This can be submitted once.</p>
                                {feedbackError && <div className={styles.error} style={{ marginBottom: 8 }}>{feedbackError}</div>}
                                {feedbackSuccess && <div className={styles.success} style={{ marginBottom: 8 }}>{feedbackSuccess}</div>}
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className={styles.feedbackTextarea}
                                    placeholder="Your feedback..."
                                    maxLength={1000}
                                    rows={4}
                                />
                                <button
                                    onClick={handleSubmitFeedback}
                                    className={styles.feedbackButton}
                                    disabled={feedbackSubmitting || feedback.trim().length < 5}
                                >
                                    {feedbackSubmitting ? 'Sending...' : 'Send to Branvia'}
                                </button>
                            </div>
                        ) : (
                            isOwner && campaign.feedbackSubmitted && (
                                <div className={styles.feedbackCard}>
                                    <div className={styles.feedbackHeader}>
                                        <h3 className={styles.sectionTitle}>Feedback</h3>
                                    </div>
                                    <p className={styles.feedbackHelper}>
                                        Feedback already sent{campaign.feedbackAt ? ` on ${new Date(campaign.feedbackAt as any).toLocaleString()}` : ''}.
                                    </p>
                                    {campaign.feedbackMessage && (
                                        <div className={styles.promptSection}>
                                            <div className={styles.promptHeader}><h4>Your message</h4></div>
                                            <p className={styles.promptText}>{campaign.feedbackMessage}</p>
                                        </div>
                                    )}
                                </div>
                            )
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
                        {campaign.prompt ? (
                            <p className={styles.promptText}>{campaign.prompt}</p>
                        ) : (
                            <div className={styles.promptText}>
                                <SkeletonText lines={4} />
                            </div>
                        )}
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
                                {getOutputFormatLabel(campaign.outputFormat as string)} ({getResolutionInfo()})
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