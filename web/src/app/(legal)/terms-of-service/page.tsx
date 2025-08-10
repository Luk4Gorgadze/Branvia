import styles from "./page.module.css";

export default function TermsOfService() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Terms of Service</h1>
                <p className={styles.lastUpdated}>Last updated: August 2025</p>

                <section className={styles.section}>
                    <h2>User Responsibilities</h2>
                    <p>By using our service, you agree to:</p>
                    <ul>
                        <li>Use the service only for legal purposes</li>
                        <li>Respect intellectual property rights and copyright laws</li>
                        <li>Not upload or generate content that is harmful, offensive, or violates others' rights</li>
                        <li>Not attempt to reverse engineer or hack our platform</li>
                        <li>Not share your account credentials with others</li>
                        <li>Credit Branvia when using generated images commercially (Starter plan)</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Our Rights</h2>
                    <p>We reserve the right to:</p>
                    <ul>
                        <li>Terminate accounts that violate our terms</li>
                        <li>Modify or discontinue features at any time</li>
                        <li>Update these terms with 30 days notice</li>
                        <li>Monitor usage to prevent abuse</li>
                        <li>Use anonymized data for service improvement</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Liability Disclaimer</h2>
                    <p>Branvia provides this service "as is" and makes no warranties about:</p>
                    <ul>
                        <li>The accuracy or quality of generated images</li>
                        <li>Service availability or uptime</li>
                        <li>Compatibility with all devices or browsers</li>
                        <li>Results from using our service</li>
                    </ul>
                    <p>We are not liable for any damages arising from use of our service, including but not limited to lost profits, data, or business opportunities.</p>
                </section>

                <section className={styles.section}>
                    <h2>Refunds</h2>
                    <p>We generally do not offer refunds. However, if a technical issue on our side prevents you from using the service as intended, we will review and may issue a refund.</p>
                    <ul>
                        <li>Submit a request within 7 days of the incident</li>
                        <li>Provide proof (screenshots, error messages or IDs, timestamps, affected campaign/job IDs, and your order email)</li>
                        <li>Once confirmed as our fault, refunds are processed to your original payment method (via PayPal)</li>
                    </ul>
                    <p>If you believe you qualify, contact us at <a href="mailto:info@branvia.art">info@branvia.art</a>.</p>
                </section>

                <section className={styles.section}>
                    <h2>Contact Us</h2>
                    <p>If you have any questions about these Terms of Service, please contact us at:</p>
                    <p>Email: <a href="mailto:info@branvia.art">info@branvia.art</a></p>
                </section>
            </div>
        </div>
    );
} 