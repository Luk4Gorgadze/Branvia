'use client'
import { useUser } from "@/_lib/_providers";
import styles from "./CampaignGallery.module.css";
import Image from "next/image";
import Link from "next/link";
import { CampaignDiv } from "@/_components/ui/CampaignDiv";

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

    const renderPlatformItem = (platform: string, key: string) => (
        <div key={key} className={styles.platformItem}>
            <span>{platform}</span>
        </div>
    );

    const renderCampaignCard = (index: number) => (
        <CampaignDiv key={index} href={`/campaign/${index}`} imageUrl="/example.png" overlayText="See details" />
    );

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

            <div className={styles.promptCardHolder}>
                {Array.from({ length: 10 }).map((_, index) => renderCampaignCard(index))}
            </div>
        </section>
    );
};

export default CampaignGallery; 