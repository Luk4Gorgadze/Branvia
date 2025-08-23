import styles from "./FooterSection.module.css";
import Link from "next/link";

const FooterSection = () => {
    return (
        <footer className={styles.footerSection}>
            <div className={styles.footerContent}>
                <div className={styles.footerTop}>
                    <div className={styles.footerBrand}>
                        <h3 className={styles.footerLogo}>Branvia</h3>
                        <p className={styles.footerDescription}>
                            Empowering small businesses and individuals with high-quality, AI-generated product images for premium marketing.
                        </p>
                    </div>

                    <div className={styles.footerLinks}>
                        <div className={styles.footerColumn}>
                            <h4 className={styles.footerTitle}>Product</h4>
                            <ul className={styles.footerList}>
                                <li><Link href={`${process.env.NEXT_PUBLIC_APP_URL}/#gallery`}>Examples</Link></li>
                                <li><Link href={`${process.env.NEXT_PUBLIC_APP_URL}/#pricing`}>Pricing</Link></li>
                                <li><Link href={`${process.env.NEXT_PUBLIC_APP_URL}/#about`}>About</Link></li>
                            </ul>
                        </div>

                        <div className={styles.footerColumn}>
                            <h4 className={styles.footerTitle}>Support</h4>
                            <ul className={styles.footerList}>
                                <li><Link href="/contact">Contact Us</Link></li>
                                <li><Link href="/help">Help Center</Link></li>
                                <li><Link href="/documentation">Documentation</Link></li>
                            </ul>
                        </div>

                        <div className={styles.footerColumn}>
                            <h4 className={styles.footerTitle}>Legal</h4>
                            <ul className={styles.footerList}>
                                <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                                <li><Link href="/terms-of-service">Terms of Service</Link></li>
                                <li><Link href="/cookie-policy">Cookie Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <div className={styles.footerCopyright}>
                        <p>&copy; 2025 Branvia. All rights reserved. <span className={styles.footerVersion}>v.1.0.0</span></p>
                    </div>

                    <div className={styles.footerSocial}>
                        <a href="https://www.facebook.com/people/Branvia/61579682373134/" className={styles.socialLink} target="_blank" rel="noopener noreferrer">Facebook</a>
                        <a href="https://www.instagram.com/branvia.art/" className={styles.socialLink} target="_blank" rel="noopener noreferrer">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection; 