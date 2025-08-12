'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function SubscriptionCancelledPage() {
    return (
        <div className={styles.cancelledPage}>
            <div className={styles.cancelledContainer}>
                <div className={styles.cancelledIcon}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h1 className={styles.title}>
                    Subscription Cancelled
                </h1>

                <p className={styles.description}>
                    No worries! Your subscription was cancelled and no charges were made. You can try again anytime.
                </p>

                <div className={styles.buttonGroup}>
                    <Link
                        href="/#pricing"
                        className={styles.primaryButton}
                    >
                        View Plans Again
                    </Link>

                    <Link
                        href="/"
                        className={styles.secondaryButton}
                    >
                        Back to Home
                    </Link>
                </div>

                <p className={styles.footer}>
                    If you have any questions, please contact support: <a href="mailto:info@branvia.com">info@branvia.com</a>
                </p>
            </div>
        </div>
    );
}
