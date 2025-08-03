import styles from "./page.module.css";

export default function PrivacyPolicy() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Privacy Policy</h1>
                <p className={styles.lastUpdated}>Last updated: January 2024</p>

                <section className={styles.section}>
                    <h2>Data We Collect</h2>
                    <p>We collect the following types of information:</p>
                    <ul>
                        <li><strong>Email addresses</strong> - When you create an account or contact us</li>
                        <li><strong>Images</strong> - AI-generated images you create using our service</li>
                        <li><strong>IP addresses</strong> - For security and analytics purposes</li>
                        <li><strong>Usage data</strong> - How you interact with our platform</li>
                        <li><strong>Payment information</strong> - Processed securely through Stripe</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>How We Use Your Data</h2>
                    <ul>
                        <li><strong>Image Generation</strong> - To create AI-generated product images based on your prompts</li>
                        <li><strong>Account Management</strong> - To provide and maintain your account</li>
                        <li><strong>Analytics</strong> - To improve our service and understand usage patterns</li>
                        <li><strong>Communication</strong> - To respond to your inquiries and provide support</li>
                        <li><strong>Payment Processing</strong> - To process your subscription payments</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Third-Party Tools</h2>
                    <p>We use the following third-party services:</p>
                    <ul>
                        <li><strong>Google Analytics</strong> - Website analytics and performance tracking</li>
                        <li><strong>Stripe</strong> - Secure payment processing</li>
                        <li><strong>Vercel</strong> - Website hosting and performance</li>
                        <li><strong>NextAuth.js</strong> - Authentication services</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Data Deletion</h2>
                    <p>You can request deletion of your data by:</p>
                    <ul>
                        <li>Emailing us at <a href="mailto:info@branvia.art">info@branvia.art</a></li>
                        <li>Using the "Delete Account" option in your account settings</li>
                        <li>Contacting our support team through the help center</li>
                    </ul>
                    <p>We will process your deletion request within 30 days and confirm when your data has been removed.</p>
                </section>

                <section className={styles.section}>
                    <h2>Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                    <p>Email: <a href="mailto:info@branvia.art">info@branvia.art</a></p>
                </section>
            </div>
        </div>
    );
} 