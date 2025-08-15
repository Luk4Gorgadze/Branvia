// New subscription service for managing user subscriptions and credits - commit marker
import { prisma } from '@/_lib/_db/prismaClient';
import { cancelPayPalSubscription } from './paypalService';
// import dotenv from 'dotenv';
// dotenv.config();
// console.log('🚀 PayPal env:', process.env.PAYPAL_MODE);
// console.log('🚀 Plans IDs:', process.env.PAYPAL_STARTER_PLAN_ID, process.env.PAYPAL_PROFESSIONAL_PLAN_ID, process.env.PAYPAL_ENTERPRISE_PLAN_ID);

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
    return await prisma.$transaction(async (tx: any) => {
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
    return await prisma.$transaction(async (tx: any) => {
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

    // First, find and cancel any existing active subscription for this user
    const existingActiveSubscription = await prisma.subscription.findFirst({
        where: {
            userId,
            status: 'ACTIVE'
        }
    });

    if (existingActiveSubscription) {
        console.log(`🔄 Canceling existing active subscription: ${existingActiveSubscription.id}`);

        // Cancel the existing subscription in PayPal if it has a PayPal ID
        if (existingActiveSubscription.paypalSubscriptionId) {
            try {
                await cancelPayPalSubscription(existingActiveSubscription.paypalSubscriptionId);
                console.log(`✅ PayPal subscription ${existingActiveSubscription.paypalSubscriptionId} canceled successfully`);
            } catch (error) {
                console.error(`❌ Failed to cancel PayPal subscription ${existingActiveSubscription.paypalSubscriptionId}:`, error);
                // Continue with local cancellation even if PayPal fails
            }
        }

        // Mark the existing subscription as canceled in our database
        await prisma.subscription.update({
            where: { id: existingActiveSubscription.id },
            data: {
                status: 'CANCELED',
                canceledAt: new Date(),
            }
        });
        console.log(`✅ Local subscription ${existingActiveSubscription.id} marked as canceled`);
    }

    // If we have a PayPal subscription ID, try to find existing subscription first
    if (paypalSubscriptionId) {
        const existingSubscription = await prisma.subscription.findUnique({
            where: { paypalSubscriptionId }
        });

        if (existingSubscription) {
            // Update existing subscription
            console.log(`🔄 Updating existing subscription: ${existingSubscription.id}`);
            return await prisma.subscription.update({
                where: { paypalSubscriptionId },
                data: {
                    plan,
                    status: 'ACTIVE',
                    currentPeriodStart: periodStart ?? undefined,
                    currentPeriodEnd: periodEnd ?? undefined,
                }
            });
        }
    }

    // Create new subscription
    console.log(`🆕 Creating new subscription for user: ${userId}, plan: ${plan}`);
    return await prisma.subscription.create({
        data: {
            userId,
            plan,
            status: 'ACTIVE',
            paypalSubscriptionId: paypalSubscriptionId,
            currentPeriodStart: periodStart ?? new Date(),
            currentPeriodEnd: periodEnd ?? new Date(new Date().setMonth(new Date().getMonth() + 1)),
        }
    });
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
    const starter = process.env.PAYPAL_STARTER_PLAN_ID;
    const professional = process.env.PAYPAL_PROFESSIONAL_PLAN_ID;
    const enterprise = process.env.PAYPAL_ENTERPRISE_PLAN_ID;
    if (starter && planId === starter) return 'STARTER';
    if (professional && planId === professional) return 'PROFESSIONAL';
    if (enterprise && planId === enterprise) return 'ENTERPRISE';
    return null;
}


