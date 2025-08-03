'use client'
import { useUser } from "@/_lib/_providers";
import styles from "./CampaignGallery.module.css";
import Image from "next/image";
import Link from "next/link";

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
        <Link key={index} href={`/campaign/${index}`} className={styles.promptImageCard}>
            <Image
                src="/example.png"
                alt="AI Generated Image"
                fill
                sizes="(max-width: 400px) 50vw, (max-width: 900px) 33vw, 20vw"
                className={styles.promptImage}
            />
            <div className={styles.promptOverlay}>View Prompt</div>
        </Link>
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