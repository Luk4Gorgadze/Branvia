'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function SubscriptionSuccessPage() {
    const searchParams = useSearchParams();
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get subscription ID from URL params
        const subId = searchParams.get('subscription_id');
        setSubscriptionId(subId);
        setLoading(false);
    }, [searchParams]);

    if (loading) {
        return (
            <div className={styles.successPage}>
                <div className={styles.successContainer}>
                    <div className={styles.successIcon}>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                    <p>Processing your subscription...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.successPage}>
            <div className={styles.successContainer}>
                <div className={styles.successIcon}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className={styles.title}>
                    Subscription Successful!
                </h1>

                <p className={styles.description}>
                    Thank you for subscribing to Branvia! Your credits have been added to your account.
                </p>

                {subscriptionId && (
                    <div className={styles.subscriptionId}>
                        <p className={styles.subscriptionIdLabel}>Subscription ID:</p>
                        <p className={styles.subscriptionIdValue}>{subscriptionId}</p>
                    </div>
                )}

                <div className={styles.buttonGroup}>
                    <Link
                        href="/campaign/generate"
                        className={styles.primaryButton}
                    >
                        Create Your First Campaign
                    </Link>

                    <Link
                        href="/"
                        className={styles.secondaryButton}
                    >
                        Back to Home
                    </Link>
                </div>

                <p className={styles.footer}>
                    If you have any questions, please contact support: <a href="mailto:info@branvia.art">info@branvia.art</a>
                </p>
            </div>
        </div>
    );
}
