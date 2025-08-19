export const PLAN_CONFIG = {
    STARTER: {
        id: 'STARTER',
        paypalPlanId: 'P-294586120M852722PNCSLONI' || process.env.NEXT_PUBLIC_PAYPAL_STARTER_PLAN_ID || '',
        price: 29,
        features: [
            "2000 credits/month",
            "Standard resolution",
            "Limited commercial use (must credit us)"
        ]
    },
    PROFESSIONAL: {
        id: 'PROFESSIONAL',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_PROFESSIONAL_PLAN_ID || '',
        price: 59,
        features: [
            "5000 credits/month",
            "High resolution",
            "Commercial usage rights",
        ]
    },
    ENTERPRISE: {
        id: 'ENTERPRISE',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_ENTERPRISE_PLAN_ID || '',
        price: 199,
        features: [
            "Custom credits",
            "Customization features",
            "Priority support",
            "API access",
            "White-label options"
        ]
    }
};

export const PLAN_HIERARCHY = {
    'STARTER': 1,
    'PROFESSIONAL': 2,
    'ENTERPRISE': 3
} as const;

export const getPlanConfig = (planId: keyof typeof PLAN_CONFIG) => {
    return PLAN_CONFIG[planId];
};

export const getAllPlans = () => {
    return Object.values(PLAN_CONFIG);
}; 