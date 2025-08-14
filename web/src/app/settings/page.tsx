'use client'
import React from 'react';
import { useUser } from '@/_lib/_providers';
import { useRouter } from 'next/navigation';
import { Settings, CreditCard, User, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useSettings } from '@/_lib/_hooks/useSettings';
import {
    getStatusColor,
    getStatusIconName,
    getStatusExplanation,
    shouldShowCancelButton,
    shouldShowResubscribeButton
} from '@/_lib/_utils/subscriptionUtils';
import styles from './page.module.css';

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'ACTIVE': return <CheckCircle size={16} />;
        case 'PAST_DUE': return <AlertTriangle size={16} />;
        case 'SUSPENDED': return <X size={16} />;
        case 'CANCELED': return <X size={16} />;
        default: return <AlertTriangle size={16} />;
    }
};

export default function SettingsPage() {
    const { user } = useUser();
    const router = useRouter();
    const {
        subscription,
        credits,
        loading,
        cancelling,
        showCancelModal,
        setShowCancelModal,
        handleCancelSubscription
    } = useSettings(user?.id);

    if (!user) {
        router.push('/');
        return null;
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1><Settings size={24} /> Account Settings</h1>
                <p>Manage your subscription and account details</p>
            </div>

            <div className={styles.content}>
                {/* User Information */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <User size={20} />
                        <h2>Account Information</h2>
                    </div>
                    <div className={styles.sectionContent}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Name:</span>
                            <span className={styles.value}>{user?.name}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Email:</span>
                            <span className={styles.value}>{user?.email}</span>
                        </div>
                    </div>
                </div>

                {/* Credits Information */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <CreditCard size={20} />
                        <h2>Credits</h2>
                    </div>
                    <div className={styles.sectionContent}>
                        <div className={styles.creditsDisplay}>
                            <span className={styles.creditsAmount}>
                                {credits?.availableCredits || 0}
                            </span>
                            <span className={styles.creditsLabel}>Available Credits</span>
                        </div>
                        <p className={styles.creditsInfo}>
                            Credits are used for generating AI product images. Each generation costs 50 credits.
                        </p>
                    </div>
                </div>

                {/* Subscription Information */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <CreditCard size={20} />
                        <h2>Subscription</h2>
                    </div>
                    <div className={styles.sectionContent}>
                        {subscription ? (
                            <>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Plan:</span>
                                    <span className={styles.value}>{subscription.plan}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Status:</span>
                                    <span className={styles.value}>
                                        <span
                                            className={styles.statusBadge}
                                            style={{ color: getStatusColor(subscription.status) }}
                                        >
                                            {getStatusIcon(subscription.status)}
                                            {subscription.status}
                                        </span>
                                    </span>
                                </div>

                                {/* Status explanation */}
                                <div className={styles.statusExplanation}>
                                    <p>{getStatusExplanation(subscription.status)}</p>
                                </div>

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Subscription ID:</span>
                                    <span className={styles.value}>{subscription.paypalSubscriptionId || 'N/A'}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Next Billing:</span>
                                    <span className={styles.value}>
                                        {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>

                                {shouldShowCancelButton(subscription.status) && (
                                    <button
                                        className={styles.cancelButton}
                                        onClick={() => setShowCancelModal(true)}
                                    >
                                        Cancel Subscription
                                    </button>
                                )}

                                {shouldShowResubscribeButton(subscription.status) && (
                                    <div className={styles.resubscribeInfo}>
                                        <p>{getStatusExplanation(subscription.status)}</p>
                                        <button
                                            className={styles.resubscribeButton}
                                            onClick={() => router.push('/#pricing')}
                                        >
                                            {subscription.status === 'PAST_DUE' ? 'Update Payment' :
                                                subscription.status === 'SUSPENDED' ? 'Update Payment & Reactivate' : 'Resubscribe'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.noSubscription}>
                                <p>You&apos;re currently on the free plan.</p>
                                <button
                                    className={styles.subscribeButton}
                                    onClick={() => router.push('/#pricing')}
                                >
                                    Get a Subscription
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Subscription Modal */}
            {showCancelModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Cancel Subscription</h3>
                        <p>Are you sure you want to cancel your subscription? This action cannot be undone.</p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelModalButton}
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                            >
                                Keep Subscription
                            </button>
                            <button
                                className={styles.confirmCancelButton}
                                onClick={handleCancelSubscription}
                                disabled={cancelling}
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
