import styles from "./AboutSection.module.css";

const AboutSection = () => {
    return (
        <section className={styles.aboutSection} id="about">
            <div className={styles.aboutContent}>
                <h2 className={styles.aboutHeadline}>About Branvia</h2>
                <div>
                    <p className={styles.aboutText}>
                        Branvia is dedicated to empowering small businesses and individuals with high-quality, AI-generated marketing visuals and prompts tailored for premium branding. Our mission is to make luxury-level visual content accessible, creative, and effective for everyone.
                    </p>
                    <p className={styles.contactText}>
                        For any questions or help, contact us at: <a href="mailto:info@branvia.art" className={styles.contactEmail}>info@branvia.art</a>
                    </p>
                </div>

            </div>
        </section>
    )
}

export default AboutSection; 