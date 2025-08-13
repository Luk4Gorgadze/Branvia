'use client'
import { useState, useEffect } from 'react';
import { useUser } from '@/_lib/_providers';
import styles from "./PricingSection.module.css";
import PriceCard from "./PriceCard";

const PricingSection = () => {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentSubscription, setCurrentSubscription] = useState<{ plan: string; status: string } | null>(null);
    const { user } = useUser();

    useEffect(() => {
        // Check if user has an active subscription
        if (user) {
            checkCurrentSubscription();
        }
    }, [user]);

    const checkCurrentSubscription = async () => {
        try {
            const response = await fetch('/api/subscriptions/current');
            if (response.ok) {
                const data = await response.json();
                if (data.subscription) {
                    setCurrentSubscription(data.subscription);
                    console.log('Current subscription:', data.subscription);
                }
            }
        } catch (error) {
            console.log('No subscription found');
        }
    };

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
                window.location.href = data.approveUrl;
            } else {
                setError(data.error || 'Failed to create subscription');
            }
        } catch {
            setError('Network error occurred');
        } finally {
            setLoading(null);
        }
    };

    const handleGetStarted = (planId: string) => {
        // Map plan IDs to PayPal plan IDs
        const paypalPlanIds: Record<string, string> = {
            'STARTER': process.env.NEXT_PUBLIC_PAYPAL_STARTER_PLAN_ID || '',
            'PROFESSIONAL': process.env.NEXT_PUBLIC_PAYPAL_PROFESSIONAL_PLAN_ID || '',
            'ENTERPRISE': process.env.NEXT_PUBLIC_PAYPAL_ENTERPRISE_PLAN_ID || ''
        };

        const paypalPlanId = paypalPlanIds[planId];
        if (paypalPlanId) {
            handleSubscribe(planId, paypalPlanId);
        } else {
            setError('Plan not configured');
        }
    };

    // const handleContactSales = () => {
    //     // Handle contact sales action
    //     console.log("Contact Sales clicked");
    // };

    return (
        <section className={styles.pricingSection} id="pricing">
            <div className={styles.pricingHeadline}>Pricing</div>
            <div className={styles.pricingContent}>
                <div className={styles.pricingCards}>
                    <PriceCard
                        title="Starter"
                        price={29}
                        features={[
                            "2000 credits/month",
                            "Standard resolution",
                            "Limited commercial use (must credit us)"
                        ]}
                        onButtonClick={() => handleGetStarted('STARTER')}
                        disabled={loading === 'STARTER'}
                        hasActiveSubscription={currentSubscription?.plan === 'STARTER' && currentSubscription?.status === 'ACTIVE'}
                        subscriptionStatus={getSubscriptionStatus('STARTER')}
                    />

                    <PriceCard
                        title="Professional"
                        price={59}
                        features={[
                            "5000 credits/month",
                            "High resolution",
                            "Commercial usage rights",
                        ]}
                        isFeatured={true}
                        onButtonClick={() => handleGetStarted('PROFESSIONAL')}
                        disabled={loading === 'PROFESSIONAL'}
                        hasActiveSubscription={currentSubscription?.plan === 'PROFESSIONAL' && currentSubscription?.status === 'ACTIVE'}
                        subscriptionStatus={getSubscriptionStatus('PROFESSIONAL')}
                    />

                    <PriceCard
                        title="Enterprise"
                        price={199}
                        features={[
                            "Custom credits",
                            "Customization features",
                            "Priority support",
                            "API access",
                            "White-label options"
                        ]}
                        onButtonClick={() => console.log("Enterprise coming soon")}
                        disabled={true}
                        hasActiveSubscription={currentSubscription?.plan === 'ENTERPRISE' && currentSubscription?.status === 'ACTIVE'}
                        subscriptionStatus={getSubscriptionStatus('ENTERPRISE')}
                    />
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PricingSection; 