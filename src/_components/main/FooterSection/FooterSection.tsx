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
                            Empowering small businesses with high-quality, AI-generated product images for premium marketing.
                        </p>
                    </div>

                    <div className={styles.footerLinks}>
                        <div className={styles.footerColumn}>
                            <h4 className={styles.footerTitle}>Product</h4>
                            <ul className={styles.footerList}>
                                <li><a href="#gallery">Gallery</a></li>
                                <li><a href="#pricing">Pricing</a></li>
                                <li><a href="#about">About</a></li>
                            </ul>
                        </div>

                        <div className={styles.footerColumn}>
                            <h4 className={styles.footerTitle}>Support</h4>
                            <ul className={styles.footerList}>
                                <li><Link href="/contact">Contact Us</Link></li>
                                <li><Link href="/help">Help Center</Link></li>
                                <li><a href="#docs">Documentation</a></li>
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
                        <p>&copy; 2025 Branvia. All rights reserved.</p>
                    </div>

                    <div className={styles.footerSocial}>
                        <a href="#twitter" className={styles.socialLink}>Twitter</a>
                        <a href="#linkedin" className={styles.socialLink}>LinkedIn</a>
                        <a href="#instagram" className={styles.socialLink}>Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection; 