import { useState, useEffect } from 'react';
import { getCurrentSubscription } from '@/_actions/subscriptions';
import { z } from 'zod';
import { SubscriptionPlan, SubscriptionStatus } from '@/_lib/_schemas/subscriptions';

interface Subscription {
    id: string;
    plan: z.infer<typeof SubscriptionPlan>;
    status: z.infer<typeof SubscriptionStatus>;
    paypalSubscriptionId: string | null;
    startedAt: Date;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    canceledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface UsePricingReturn {
    currentSubscription: Subscription | null;
    loading: string | null;
    error: string | null;
    checkCurrentSubscription: () => Promise<void>;
    handleSubscribe: (planId: string, paypalPlanId: string) => Promise<void>;
    getSubscriptionStatus: (planId: string) => 'current' | 'upgrade' | 'downgrade' | null;
}

export const usePricing = (userId: string | undefined): UsePricingReturn => {
    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkCurrentSubscription = async () => {
        if (!userId) return;

        try {
            const result = await getCurrentSubscription({});
            if (result.success && result.data) {
                setCurrentSubscription(result.data);
                console.log('Current subscription:', result.data);
            }
        } catch (error) {
            console.log('No subscription found');
        }
    };

    useEffect(() => {
        if (userId) {
            checkCurrentSubscription();
        }
    }, [userId]);

    const getSubscriptionStatus = (planId: string) => {
        if (!currentSubscription || currentSubscription.status !== 'ACTIVE') return null;

        if (currentSubscription.plan === planId) {
            return 'current';
        }

        // Determine if it's an upgrade or downgrade based on plan hierarchy
        const planOrder = { 'STARTER': 1, 'PROFESSIONAL': 2, 'ENTERPRISE': 3 };
        const currentPlanOrder = planOrder[currentSubscription.plan as keyof typeof planOrder] || 0;
        const newPlanOrder = planOrder[planId as keyof typeof planOrder] || 0;

        if (newPlanOrder > currentPlanOrder) {
            return 'upgrade';
        } else if (newPlanOrder < currentPlanOrder) {
            return 'downgrade';
        }

        return null;
    };

    const handleSubscribe = async (planId: string, paypalPlanId: string) => {
        if (!paypalPlanId) {
            setError('Plan not configured');
            return;
        }

        setLoading(planId);
        setError(null);

        try {
            // TODO: Replace with Server Action when available
            const response = await fetch('/api/subscriptions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planId: paypalPlanId
                })
            });

            const data = await response.json();

            if (data.success && data.approveUrl) {
                // Redirect to PayPal approval
                if (typeof window !== 'undefined') {
                    window.location.href = data.approveUrl;
                }
            } else {
                setError(data.error || 'Failed to create subscription');
            }
        } catch {
            setError('Network error occurred');
        } finally {
            setLoading(null);
        }
    };

    return {
        currentSubscription,
        loading,
        error,
        checkCurrentSubscription,
        handleSubscribe,
        getSubscriptionStatus
    };
}; 