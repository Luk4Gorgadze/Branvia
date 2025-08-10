import styles from "./page.module.css";

export default function HelpCenter() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Help Center</h1>
                <p className={styles.subtitle}>Find answers to common questions and get support</p>

                <section className={styles.section}>
                    <h2>Getting Started</h2>

                    <div className={styles.faqItem}>
                        <h3>How do I create my first AI image?</h3>
                        <p>1. Sign up for an account using your Google account<br />
                            2. Choose a pricing plan, subscribe<br />
                            3. Navigate to the Generate page<br />
                            4. Generate images by uploading input image and filling details</p>
                    </div>

                    <div className={styles.faqItem}>
                        <h3>What image formats are supported?</h3>
                        <p>Our AI-generated images are available in high-quality formats including PNG, JPG.</p>
                    </div>

                    <div className={styles.faqItem}>
                        <h3>How do credits work?</h3>
                        <p>Credits are used to generate AI images. Each product campaign generation costs 50 credits. Your monthly subscription includes a set number of credits that refresh each billing cycle.</p>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>Frequently Asked Questions</h2>

                    <div className={styles.faqItem}>
                        <h3>Can I use the generated images commercially?</h3>
                        <p>Yes! Professional and Enterprise plans include full commercial usage rights. Starter plan users must credit Branvia when using images commercially.</p>
                    </div>

                    <div className={styles.faqItem}>
                        <h3>What if I run out of credits?</h3>
                        <p>You can upgrade your plan at any time to get more credits, or wait until your next billing cycle when credits refresh automatically.</p>
                    </div>

                    <div className={styles.faqItem}>
                        <h3>How do I cancel my subscription?</h3>
                        <p>You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.</p>
                    </div>

                    <div className={styles.faqItem}>
                        <h3>Refunds</h3>
                        <p>We generally do not offer refunds. However, if a technical issue on our side prevents you from using the service as intended, we will review and may issue a refund.</p>
                        <ul>
                            <li>Submit a request within 7 days of the incident</li>
                            <li>Provide proof (screenshots, error messages or IDs, timestamps, affected campaign/job IDs, and your order email)</li>
                            <li>Once confirmed as our fault, refunds are processed to your original payment method (via PayPal)</li>
                        </ul>
                        <p>If you believe you qualify, contact us at <a href="mailto:info@branvia.art">info@branvia.art</a>.</p>

                    </div>

                    <div className={styles.faqItem}>
                        <h3>What AI platforms do you support?</h3>
                        <p>Our prompts are compatible with popular AI image generation platforms including DALL·E, Midjourney, Stable Diffusion, Adobe Firefly, and many others.</p>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>Contact Support</h2>
                    <p>Can't find what you're looking for? Our support team is here to help!</p>

                    <div className={styles.contactMethods}>
                        <div className={styles.contactMethod}>
                            <h3>Email Support</h3>
                            <p>Get help via email at <a href="mailto:info@branvia.art">info@branvia.art</a></p>
                            <p>We typically respond within 24 hours</p>
                        </div>

                        <div className={styles.contactMethod}>
                            <h3>Response Time</h3>
                            <p>• General inquiries: 24 hours<br />
                                • Technical issues: 12 hours<br />
                                • Billing questions: 6 hours</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
} 