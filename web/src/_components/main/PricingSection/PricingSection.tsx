'use client'
import { useUser } from '@/_lib/_providers';
import { usePricing } from '@/_lib/_hooks/usePricing';
import { PLAN_CONFIG, PLAN_HIERARCHY } from '@/_lib/_utils/planConfig';
import styles from './PricingSection.module.css';
import PriceCard from "./PriceCard";

const PricingSection = () => {
    const { user } = useUser();
    const {
        currentSubscription,
        loading,
        error,
        handleSubscribe,
        getSubscriptionStatus
    } = usePricing(user?.id);

    const handleGetStarted = (planId: keyof typeof PLAN_CONFIG) => {
        console.log('🎯 handleGetStarted called with planId:', planId);
        const planConfig = PLAN_CONFIG[planId];
        console.log('🎯 Plan config:', planConfig);

        if (planConfig.paypalPlanId) {
            console.log('🎯 Calling handleSubscribe with:', planId, planConfig.paypalPlanId);
            handleSubscribe(planId, planConfig.paypalPlanId);
        } else {
            console.log('❌ No paypalPlanId found for plan:', planId);
        }
    };

    return (
        <section className={styles.pricingSection} id="pricing">
            <div className={styles.pricingHeadline}>Pricing</div>
            <div className={styles.pricingContent}>
                <div className={styles.pricingCards}>
                    <PriceCard
                        title="Starter"
                        price={PLAN_CONFIG.STARTER.price}
                        features={PLAN_CONFIG.STARTER.features}
                        onButtonClick={() => handleGetStarted('STARTER')}
                        disabled={loading === 'STARTER'}
                        hasActiveSubscription={currentSubscription?.plan === 'STARTER' && currentSubscription?.status === 'ACTIVE'}
                        subscriptionStatus={getSubscriptionStatus('STARTER')}
                    />

                    <PriceCard
                        title="Professional"
                        price={PLAN_CONFIG.PROFESSIONAL.price}
                        features={PLAN_CONFIG.PROFESSIONAL.features}
                        isFeatured={true}
                        onButtonClick={() => handleGetStarted('PROFESSIONAL')}
                        disabled={loading === 'PROFESSIONAL'}
                        hasActiveSubscription={currentSubscription?.plan === 'PROFESSIONAL' && currentSubscription?.status === 'ACTIVE'}
                        subscriptionStatus={getSubscriptionStatus('PROFESSIONAL')}
                    />

                    <PriceCard
                        title="Enterprise"
                        price={PLAN_CONFIG.ENTERPRISE.price}
                        features={PLAN_CONFIG.ENTERPRISE.features}
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