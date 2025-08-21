'use client'
import React, { useEffect, useState } from 'react';
import styles from './CampaignGallery.module.css';
import { CampaignDiv } from "@/_components/ui/CampaignDiv";
import { useUser } from '@/_lib/_providers';
import { getPublicCampaigns } from '@/_actions/campaigns';
import { getS3Url } from "@/_lib/_utils/s3Utils";

// Platform data
const AI_PLATFORMS = [
    'DALL·E',
    'Midjourney',
    'Stable Diffusion',
    'Adobe Firefly',
    'Leonardo AI',
    'Runway ML',
    'Canva AI',
    'Bing Image Creator',
    'Dream Studio',
    'Artbreeder',
    'NightCafe',
    'Wombo Dream'
];

const CampaignGallery = () => {
    const { user } = useUser();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const result = await getPublicCampaigns({});
                console.log('Server Action result:', result); // Debug log

                if (result.success && result.data) {
                    console.log('Campaigns fetched successfully:', result.data);
                    setCampaigns(result.data);
                } else {
                    console.warn('No campaigns returned or error:', result);
                    setCampaigns([]);
                }
            } catch (error) {
                console.error('Error fetching campaigns:', error);
                setCampaigns([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [user?.id]);

    const renderPlatformItem = (platform: string, key: string) => (
        <div key={key} className={styles.platformItem}>
            <span>{platform}</span>
        </div>
    );

    const renderCampaignCard = (campaign: any, index: number) => {
        // Only render if campaign has required fields
        if (!campaign.id || !campaign.generatedImages || !campaign.productTitle) {
            return null;
        }

        return (
            <CampaignDiv
                key={campaign.id}
                href={`/campaign/${campaign.id}`}
                imageUrl={getS3Url(campaign.generatedImages[0]) || "/example.png"}
                overlayText={campaign.productTitle}
            />
        );
    };

    return (
        <section className={styles.promptSection} id="gallery">
            {user && (
                <div className={styles.userWelcome}>
                    Welcome, {user.name}!
                </div>
            )}

            <div className={styles.platformShowcase}>
                <h2 className={styles.promptHeadline}>
                    Generate professional product images instantly, or use our prompts on your favorite AI platforms:
                </h2>

                <div className={styles.scrollingPlatforms}>
                    <div className={styles.platformTrack}>
                        {/* First set of platforms */}
                        {AI_PLATFORMS.map((platform, index) =>
                            renderPlatformItem(platform, `platform-${index}`)
                        )}
                        {/* Duplicate set for seamless loop */}
                        {AI_PLATFORMS.map((platform, index) =>
                            renderPlatformItem(platform, `platform-duplicate-${index}`)
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.campaignGrid}>
                {loading ? (
                    // Show loading state
                    Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className={styles.loadingCard}>
                            <div className={styles.loadingImage}></div>
                            <div className={styles.loadingText}></div>
                        </div>
                    ))
                ) : campaigns.length > 0 ? (
                    campaigns.map((campaign, index) => renderCampaignCard(campaign, index)).filter(Boolean)
                ) : (
                    // Show message when no campaigns available
                    <div className={styles.noCampaigns}>
                        <p>No campaigns available yet. Check back soon!</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CampaignGallery; 