import { prisma } from '@/_lib/_db/prismaClient';

export type SubscriptionPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export function getMonthlyCreditsForPlan(plan: SubscriptionPlan): number {
    switch (plan) {
        case 'STARTER':
            return 2000;
        case 'PROFESSIONAL':
            return 5000; // Adjust per pricing once finalized
        case 'ENTERPRISE':
            return 0; // Placeholder; Enterprise not yet available
        default:
            return 0;
    }
}

export async function spendCredits(userId: string, amount: number, reason: string, metadata?: Record<string, unknown>) {
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId }, select: { availableCredits: true } });
        if (!user) throw new Error('User not found');
        if (user.availableCredits < amount) {
            throw Object.assign(new Error('Insufficient credits'), { code: 'INSUFFICIENT_CREDITS' });
        }
        await tx.user.update({ where: { id: userId }, data: { availableCredits: { decrement: amount } } });
        await tx.creditTransaction.create({
            data: {
                userId,
                change: -amount,
                reason,
                metadata: metadata as any,
            }
        });
    });
}

export async function topUpCredits(userId: string, amount: number, reason: string, metadata?: Record<string, unknown>) {
    return await prisma.$transaction(async (tx) => {
        await tx.user.update({ where: { id: userId }, data: { availableCredits: { increment: amount }, lastCreditTopUpAt: new Date() } });
        await tx.creditTransaction.create({
            data: {
                userId,
                change: amount,
                reason,
                metadata: metadata as any,
            }
        });
    });
}

export async function activateOrUpsertSubscription(params: {
    userId: string;
    plan: SubscriptionPlan;
    paypalSubscriptionId?: string;
    periodStart?: Date | null;
    periodEnd?: Date | null;
}) {
    const { userId, plan, paypalSubscriptionId, periodStart, periodEnd } = params;
    const subscription = await prisma.subscription.upsert({
        where: { paypalSubscriptionId: paypalSubscriptionId ?? 'noop_' + userId },
        update: {
            plan,
            status: 'ACTIVE',
            currentPeriodStart: periodStart ?? undefined,
            currentPeriodEnd: periodEnd ?? undefined,
        },
        create: {
            userId,
            plan,
            status: 'ACTIVE',
            paypalSubscriptionId: paypalSubscriptionId,
            currentPeriodStart: periodStart ?? new Date(),
            currentPeriodEnd: periodEnd ?? new Date(new Date().setMonth(new Date().getMonth() + 1)),
        }
    });
    return subscription;
}

export async function cancelSubscription(paypalSubscriptionId: string, canceledAt?: Date) {
    return await prisma.subscription.update({
        where: { paypalSubscriptionId },
        data: {
            status: 'CANCELED',
            canceledAt: canceledAt ?? new Date(),
        }
    });
}

export function mapPayPalPlanIdToInternal(planId: string): SubscriptionPlan | null {
    const starter = process.env.PAYPAL_PLAN_STARTER_ID;
    const professional = process.env.PAYPAL_PLAN_PROFESSIONAL_ID;
    const enterprise = process.env.PAYPAL_PLAN_ENTERPRISE_ID;
    if (starter && planId === starter) return 'STARTER';
    if (professional && planId === professional) return 'PROFESSIONAL';
    if (enterprise && planId === enterprise) return 'ENTERPRISE';
    return null;
}


