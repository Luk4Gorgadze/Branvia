import { WordsPullUp } from "@/_components/ui/WordsPullUp";
import styles from "./HeroSection.module.css";
import Image from "next/image";

const HeroSection = () => {
    return (
        <div className={styles.luxuryPage}>
            <Image
                src="/cover.jpg"
                alt="Abstract luxury background"
                fill
                className={styles.bgImage}
                priority
            />

            <div className={styles.heroSection}>
                < div className={styles.heroContent} >
                    <WordsPullUp text="Elevate your brand's visual identity" className={styles.heroTitle} />
                </div >
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
    )
}

export default HeroSection; 