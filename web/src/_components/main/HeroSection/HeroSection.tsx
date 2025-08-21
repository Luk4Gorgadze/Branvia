import React from 'react';
import { Sparkles, Zap, Eye } from 'lucide-react';
import styles from './HeroSection.module.css';
import Image from "next/image";
import Link from "next/link";
import { WordsPullUp } from '@/_components/ui/WordsPullUp';
const HeroSection = () => {
    return (
        <div className={styles.luxuryPage} id="hero">
            <Image
                src="/cover.jpg"
                alt="Abstract luxury background"
                fill
                className={styles.bgImage}
                priority
            />

            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.badgeContainer}>
                        <div className={styles.aiBadge}>
                            <Sparkles size={16} />
                            <span>AI-Powered</span>
                        </div>
                    </div>

                    <WordsPullUp text="Elevate your brand's visual identity" className={styles.heroTitle} />

                    <p className={styles.heroSubtitle}>
                        Premium AI visuals and prompts to create refined, high-impact results for individuals and small brands.
                    </p>

                    <div className={styles.ctaSection}>
                        <button className={styles.primaryCta}>
                            <Zap size={20} />
                            Start Creating
                        </button>
                        <Link href="#gallery" className={styles.secondaryCta}>
                            <Eye size={20} />
                            See Examples
                        </Link>
                    </div>

                    <div className={styles.statsContainer}>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>1K+</span>
                            <span className={styles.statLabel}>Images Generated</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>8+</span>
                            <span className={styles.statLabel}>Brand Styles</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>24/7</span>
                            <span className={styles.statLabel}>AI Available</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroSection; 