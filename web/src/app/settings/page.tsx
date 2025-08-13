'use client'
import React, { useState, useEffect } from 'react';
import { useUser } from '@/_lib/_providers';
import { useRouter } from 'next/navigation';
import { Settings, CreditCard, User, AlertTriangle, CheckCircle, X } from 'lucide-react';
import styles from './page.module.css';

interface Subscription {
    id: string;
    plan: string;
    status: string;
    paypalSubscriptionId: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
}

interface UserCredits {
    availableCredits: number;
}

export default function SettingsPage() {
    const { user } = useUser();
    const router = useRouter();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [credits, setCredits] = useState<UserCredits | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/');
            return;
        }

        const fetchUserData = async () => {
            try {
                const [subscriptionRes, creditsRes] = await Promise.all([
                    fetch('/api/subscriptions/current'),
                    fetch('/api/users/me/credits')
                ]);

                if (subscriptionRes.ok) {
                    const subscriptionData = await subscriptionRes.json();
                    setSubscription(subscriptionData.subscription);
                }

                if (creditsRes.ok) {
                    const creditsData = await creditsRes.json();
                    setCredits(creditsData);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user, router]);

    const handleCancelSubscription = async () => {
        if (!subscription) return;

        setCancelling(true);
        try {
            const response = await fetch(`/api/subscriptions/${subscription.id}/cancel`, {
                method: 'POST'
            });

            if (response.ok) {
                setSubscription(prev => prev ? { ...prev, status: 'CANCELED' } : null);
                setShowCancelModal(false);
            } else {
                throw new Error('Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            alert('Failed to cancel subscription. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return '#10b981';
            case 'PAST_DUE': return '#f59e0b';
            case 'SUSPENDED': return '#ef4444';
            case 'CANCELED': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <CheckCircle size={16} />;
            case 'PAST_DUE': return <AlertTriangle size={16} />;
            case 'SUSPENDED': return <X size={16} />;
            case 'CANCELED': return <X size={16} />;
            default: return <AlertTriangle size={16} />;
        }
    };

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
                                    {subscription.status === 'ACTIVE' && (
                                        <p>✅ Your subscription is active and billing normally.</p>
                                    )}
                                    {subscription.status === 'PAST_DUE' && (
                                        <p>⚠️ Your payment is overdue. Please update your payment method to avoid suspension.</p>
                                    )}
                                    {subscription.status === 'SUSPENDED' && (
                                        <p>❌ Your subscription is suspended due to payment issues. Please update your payment method to reactivate.</p>
                                    )}
                                    {subscription.status === 'CANCELED' && (
                                        <p>⏹️ Your subscription has been cancelled. You can still use your remaining credits.</p>
                                    )}
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

                                {subscription.status === 'ACTIVE' && (
                                    <button
                                        className={styles.cancelButton}
                                        onClick={() => setShowCancelModal(true)}
                                    >
                                        Cancel Subscription
                                    </button>
                                )}

                                {subscription.status === 'CANCELED' && (
                                    <div className={styles.cancelledInfo}>
                                        <p>Your subscription has been cancelled. You can still use your remaining credits.</p>
                                        <button
                                            className={styles.resubscribeButton}
                                            onClick={() => router.push('/#pricing')}
                                        >
                                            Resubscribe
                                        </button>
                                    </div>
                                )}

                                {subscription.status === 'SUSPENDED' && (
                                    <div className={styles.suspendedInfo}>
                                        <p>Your subscription has been suspended due to payment issues. Please update your payment method to reactivate.</p>
                                        <button
                                            className={styles.resubscribeButton}
                                            onClick={() => router.push('/#pricing')}
                                        >
                                            Update Payment & Reactivate
                                        </button>
                                    </div>
                                )}

                                {subscription.status === 'PAST_DUE' && (
                                    <div className={styles.pastDueInfo}>
                                        <p>Your subscription payment is past due. Please update your payment method to avoid suspension.</p>
                                        <button
                                            className={styles.resubscribeButton}
                                            onClick={() => router.push('/#pricing')}
                                        >
                                            Update Payment
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
