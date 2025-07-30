import styles from "./AboutSection.module.css";

const AboutSection = () => {
    return (
        < section className={styles.aboutSection} id="about" >
            <div className={styles.aboutContent}>
                <h2 className={styles.aboutHeadline}>About Branvia</h2>
                <p className={styles.aboutText}>
                    Branvia is dedicated to empowering brands with high-quality, AI-generated image prompts tailored for premium marketing. Our mission is to make luxury-level visual content accessible, creative, and effective for every business.
                </p>
            </div>
        </section >
    )
}

export default AboutSection; 