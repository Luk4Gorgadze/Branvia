'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Zap, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './HeroSection.module.css';
import Image from "next/image";
import Link from "next/link";
import { WordsPullUp } from '@/_components/ui/WordsPullUp';
import { useUser } from '@/_lib/_providers/UserProvider';
import { signInGoogle } from '@/_lib/_auth/authClient';
import { useUmami } from '@/_lib/_hooks/useUmami';

const BeforeAfterSlider = () => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { trackUserAction } = useUmami();

    const handleMouseDown = () => {
        setIsDragging(true);
        trackUserAction('slider interaction', 'before after slider', { action: 'start_drag' });
    };
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSliderPosition(Math.max(0, Math.min(100, percentage)));
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSliderPosition(Math.max(0, Math.min(100, percentage)));
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    return (
        <div className={styles.beforeAfterContainer}>
            <div className={styles.beforeAfterLabel}>
                <span className={styles.beforeLabel}>Before</span>
                <span className={styles.afterLabel}>After</span>
            </div>

            <div
                ref={containerRef}
                className={styles.sliderContainer}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => setIsDragging(false)}
            >
                {/* After Image (Background) */}
                <div className={styles.beforeImage}>
                    <Image
                        src="/hero_example/Bracelet-result.jpg"
                        alt="Original product image"
                        fill
                        className={styles.sliderImage}
                    />
                </div>

                {/* Before Image (Clipped) */}
                <div
                    className={styles.afterImage}
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <Image
                        src="/hero_example/Bracelet-input.jpg"
                        alt="AI-generated result"
                        fill
                        className={styles.sliderImage}
                    />
                </div>

                {/* Slider Handle */}
                <div
                    className={styles.sliderHandle}
                    style={{ left: `${sliderPosition}%` }}
                >
                    <div className={styles.sliderLine} />
                    <div className={styles.sliderCircle}>
                        <ArrowLeft size={12} />
                        <ArrowRight size={12} />
                    </div>
                </div>

                {/* Slider Track */}
                <div className={styles.sliderTrack} />
            </div>

            <div className={styles.sliderCaption}>
                <span>Drag to see the transformation</span>
            </div>
        </div>
    );
};

const HeroSection = () => {
    const { user } = useUser();
    const { trackPageView, trackButtonClick } = useUmami();

    // Track when hero section comes into view
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        trackPageView('hero section', {
                            user_status: user ? 'logged_in' : 'logged_out',
                            timestamp: new Date().toISOString()
                        });
                        observer.disconnect(); // Only track once
                    }
                });
            },
            { threshold: 0.5 }
        );

        const heroElement = document.getElementById('hero');
        if (heroElement) {
            observer.observe(heroElement);
        }

        return () => observer.disconnect();
    }, [trackPageView, user]);

    const handleStartCreating = async () => {
        trackButtonClick('start creating', 'hero section', {
            user_status: user ? 'logged_in' : 'logged_out',
            location: 'primary_cta'
        });

        if (user) {
            // User is logged in, redirect to generate page
            window.location.href = '/campaign/generate';
        } else {
            // User is not logged in, start BetterAuth Google sign-in
            await signInGoogle();
        }
    };

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
                        Premium AI visuals for individuals and small brands.
                    </p>
                    <p className={styles.heroSubtitle}>
                        No prompts to write - just describe your product. Fast, budget‑friendly alternative to costly photoshoots.
                    </p>

                    <div className={styles.ctaSection}>
                        <button className={styles.primaryCta} onClick={handleStartCreating}>
                            <Zap size={20} />
                            Start Creating
                        </button>
                        <Link
                            href="#gallery"
                            className={styles.secondaryCta}
                            onClick={() => trackButtonClick('see examples', 'hero section', { location: 'secondary_cta' })}
                        >
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

                {/* Before/After Slider */}
                <div className={styles.heroRightPanel}>
                    <BeforeAfterSlider />
                </div>
            </div>
        </div>
    )
}

export default HeroSection; 