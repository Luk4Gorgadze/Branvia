// Shared types and functions for subscription credits - commit marker
// A tiny shim because worker cannot import web code due to path alias differences.
export type SubscriptionPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export function getMonthlyCreditsForPlan(plan: SubscriptionPlan): number {
    switch (plan) {
        case 'STARTER':
            return 2000;
        case 'PROFESSIONAL':
            return 6000;
        case 'ENTERPRISE':
            return 0;
        default:
            return 0;
    }
}



