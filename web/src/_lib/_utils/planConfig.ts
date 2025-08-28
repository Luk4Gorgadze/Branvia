export const PLAN_CONFIG = {
    FREE: {
        id: 'FREE',
        paypalPlanId: '',
        price: 0,
        features: [
            "50 credits (one-time)",
            "Standard resolution",
            "Try before subscribing"
        ]
    },
    STARTER: {
        id: 'STARTER',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_STARTER_PLAN_ID || '',
        price: 12,
        features: [
            "1000 credits/month",
            "High resolution",
            "Limited commercial use (must credit us)"
        ]
    },
    PROFESSIONAL: {
        id: 'PROFESSIONAL',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_PROFESSIONAL_PLAN_ID || '',
        price: 29,
        features: [
            "2500 credits/month",
            "High resolution",
            "Commercial usage rights",
        ]
    }
};

export const PLAN_HIERARCHY = {
    'FREE': 0,
    'STARTER': 1,
    'PROFESSIONAL': 2
} as const;

export const getPlanConfig = (planId: keyof typeof PLAN_CONFIG) => {
    return PLAN_CONFIG[planId];
};

export const getAllPlans = () => {
    return Object.values(PLAN_CONFIG);
}; 