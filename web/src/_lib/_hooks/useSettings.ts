import { useState, useEffect } from 'react';
import { getUserCredits } from '@/_actions/users';
import { getCurrentSubscription } from '@/_actions/subscriptions';
import { cancelSubscription } from '@/_actions/subscriptions';

interface Subscription {
    id: string;
    plan: string;
    status: string;
    paypalSubscriptionId: string | null;
    startedAt: Date;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    canceledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface UserCredits {
    availableCredits: number;
}

interface UseSettingsReturn {
    subscription: Subscription | null;
    credits: UserCredits | null;
    loading: boolean;
    cancelling: boolean;
    showCancelModal: boolean;
    setShowCancelModal: (show: boolean) => void;
    handleCancelSubscription: () => Promise<void>;
    refreshData: () => Promise<void>;
}

export const useSettings = (userId: string | undefined): UseSettingsReturn => {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [credits, setCredits] = useState<UserCredits | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const fetchUserData = async () => {
        if (!userId) return;

        try {
            setLoading(true);

            const [subscriptionResult, creditsResult] = await Promise.all([
                getCurrentSubscription({ userId }, userId),
                getUserCredits({ userId }, userId)
            ]);

            if (subscriptionResult.success && subscriptionResult.data) {
                setSubscription(subscriptionResult.data);
            }

            if (creditsResult.success && creditsResult.data) {
                setCredits({ availableCredits: creditsResult.data.credits });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    const handleCancelSubscription = async () => {
        if (!subscription) return;

        setCancelling(true);
        try {
            const result = await cancelSubscription({ subscriptionId: subscription.id }, userId!);

            if (result.success) {
                setSubscription(prev => prev ? { ...prev, status: 'CANCELED' } : null);
                setShowCancelModal(false);
            } else {
                throw new Error(result.error || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            alert('Failed to cancel subscription. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const refreshData = async () => {
        await fetchUserData();
    };

    return {
        subscription,
        credits,
        loading,
        cancelling,
        showCancelModal,
        setShowCancelModal,
        handleCancelSubscription,
        refreshData
    };
}; 