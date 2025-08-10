import styles from './page.module.css'

export default function DocumentationPage() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Documentation</h1>
                <p className={styles.subtitle}>A quick overview of how Branvia works and the services it uses.</p>

                <section className={styles.section}>
                    <h2>What Branvia Does</h2>
                    <p className={styles.paragraph}>
                        Branvia helps you turn your product photos into professional marketing visuals. Upload a product image,
                        choose your preferred style and format, and our system generates multiple high‑quality images for you.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Key Services We Use</h2>
                    <ul className={styles.list}>
                        <li><strong>Google Gemini</strong> – creates a refined prompt based on your product details.</li>
                        <li><strong>OpenAI (Image Generation)</strong> – generates the final images, including image‑to‑image using your uploaded product photo.</li>
                        <li><strong>Amazon S3</strong> – securely stores your uploaded and generated images.</li>
                        <li><strong>PostgreSQL</strong> – stores your campaigns and account information.</li>
                        <li><strong>Redis + Background Jobs</strong> – processes image generation and clean‑up tasks in the background so the app stays fast.</li>
                        <li><strong>Google Sign‑In</strong> – simple and secure login with your Google account.</li>
                        <li><strong>PayPal</strong> – used for payments and subscriptions.</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Your Image Options</h2>
                    <p className={styles.paragraph}>
                        You can choose from fixed output sizes to match common use cases: Square, Portrait, and Landscape. We keep
                        the aspect ratios consistent so your gallery looks clean and professional.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Privacy & Ownership</h2>
                    <p className={styles.paragraph}>
                        Your images are private by default. You
                        own the final images you generate according to your plan’s usage rights.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Need Help?</h2>
                    <p className={styles.paragraph}>
                        Visit our Help Center for common questions, or contact us at <a href="mailto:info@branvia.art">info@branvia.art</a>.
                    </p>
                </section>
            </div>
        </div>
    )
}


