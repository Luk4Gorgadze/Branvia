import Image from "next/image";
import styles from "@/app/page.module.css";
import { WordsPullUp } from "@/_components/ui/WordsPullUp";

export default function Home() {
  return (
    <>
      <div className={styles.luxuryPage}>
        {/* Background Image Overlay */}
        <Image
          src="/cover.jpg"
          alt="Abstract luxury background"
          fill
          className={styles.bgImage}
          priority
        />

        {/* Hero Content */}

        {/* Top Navigation */}
        <div className={styles.heroSection}>
          < div className={styles.heroContent} >
            <WordsPullUp text="Elevate your brand’s visual identity" className={styles.heroTitle} />
          </div >
          {/* Bottom Left and Bottom Right as Flex Row */}
          <div className={styles.heroBottomRow}>
            <div className={styles.bottomLeft}>
              Luxury, high-quality AI image generation prompts tailored for premium marketing.
            </div>
            <div className={styles.bottomRight}>
              <a href="#">Discord</a>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Platforms Section - now outside the hero/cover */}
      <section className={styles.promptSection} id="prompts"  >
        <div className={styles.platformReference}>
          <h2 className={styles.promptHeadline}>
            Use our prompts to create stunning images on:
          </h2>
          <div className={styles.platformLogos}>
            <div className={styles.platformLogo}>
              <a href="https://openai.com/dall-e" target="_blank" rel="noopener noreferrer">DALL·E</a>
            </div>
            <div className={styles.platformLogo}>
              <a href="https://www.midjourney.com/" target="_blank" rel="noopener noreferrer">Midjourney</a>
            </div>
            <div className={styles.platformLogo}>
              <a href="https://stablediffusionweb.com/" target="_blank" rel="noopener noreferrer">Stable Diffusion</a>
            </div>
            <div className={styles.platformLogo}>
              <a href="https://www.adobe.com/sensei/generative-ai/firefly.html" target="_blank" rel="noopener noreferrer">Adobe Firefly</a>
            </div>
          </div>
        </div>
        <div className={styles.promptCardHolder}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={styles.promptImageCard}>
              <img src="/example.png" alt="Placeholder" />
              <div className={styles.promptOverlay}>View Prompt</div>
            </div>
          ))}
        </div>
      </section>
      {/* About Section */}
      <section className={styles.promptSection} id="about">
        <div className={styles.platformReference}>
          <h2 className={styles.promptHeadline}>About Branvia</h2>
          <p style={{ maxWidth: 600, opacity: 0.85, fontFamily: 'Arial', fontSize: '1.2rem' }}>
            Branvia is dedicated to empowering brands with high-quality, AI-generated image prompts tailored for premium marketing. Our mission is to make luxury-level visual content accessible, creative, and effective for every business.
          </p>
        </div>
      </section>

    </>
  );
}
