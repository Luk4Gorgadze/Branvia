import styles from "./page.module.css";

export default function CookiePolicy() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Cookie Policy</h1>
                <p className={styles.lastUpdated}>Last updated: January 2024</p>

                <section className={styles.section}>
                    <h2>What Are Cookies</h2>
                    <p>Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience and understand how you use our service.</p>
                </section>

                <section className={styles.section}>
                    <h2>Cookies We Use</h2>

                    <h3>Essential Cookies</h3>
                    <p>These cookies are necessary for the website to function properly:</p>
                    <ul>
                        <li><strong>Authentication cookies</strong> - Keep you logged in</li>
                        <li><strong>Session cookies</strong> - Remember your preferences during your visit</li>
                        <li><strong>Security cookies</strong> - Protect against fraud and abuse</li>
                    </ul>

                    <h3>Analytics Cookies</h3>
                    <p>These cookies help us understand how visitors use our website:</p>
                    <ul>
                        <li><strong>Google Analytics</strong> - Track website usage and performance</li>
                        <li><strong>Performance cookies</strong> - Monitor page load times and errors</li>
                    </ul>

                    <h3>Preference Cookies</h3>
                    <p>These cookies remember your choices and preferences:</p>
                    <ul>
                        <li><strong>Language preferences</strong> - Remember your preferred language</li>
                        <li><strong>Theme preferences</strong> - Remember your display preferences</li>
                        <li><strong>Feature preferences</strong> - Remember your tool settings</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Why We Use Cookies</h2>
                    <ul>
                        <li>To provide and maintain our service</li>
                        <li>To improve user experience and website performance</li>
                        <li>To analyze how our service is used</li>
                        <li>To prevent fraud and ensure security</li>
                        <li>To remember your preferences and settings</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>How to Disable Cookies</h2>
                    <p>You can control and manage cookies in several ways:</p>

                    <h3>Browser Settings</h3>
                    <p>Most browsers allow you to:</p>
                    <ul>
                        <li>Delete existing cookies</li>
                        <li>Block cookies from being set</li>
                        <li>Warn you before cookies are set</li>
                    </ul>

                    <h3>Third-Party Opt-Out</h3>
                    <p>For analytics cookies:</p>
                    <ul>
                        <li><strong>Google Analytics</strong> - Use the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics Opt-out Browser Add-on</a></li>
                    </ul>

                    <p><strong>Note:</strong> Disabling cookies may affect the functionality of our website and your user experience.</p>
                </section>

                <section className={styles.section}>
                    <h2>Contact Us</h2>
                    <p>If you have any questions about our Cookie Policy, please contact us at:</p>
                    <p>Email: <a href="mailto:info@branvia.art">info@branvia.art</a></p>
                </section>
            </div>
        </div>
    );
} 