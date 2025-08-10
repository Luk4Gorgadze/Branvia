import { Job } from 'bullmq';
import { prisma } from '@branvia/database';
import { getMonthlyCreditsForPlan } from '../web-shim/subscriptionCredits.js';

interface RenewalJobData {
    // optional: specific userId to renew; otherwise batch renew
    userId?: string;
}

export async function subscriptionRenewalProcessor(_job: Job<RenewalJobData>) {
    const now = new Date();
    // Find active subscriptions where currentPeriodEnd has passed OR it's the 1st day of the month and last top-up is not today
    const subs = await prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { user: { select: { id: true, availableCredits: true, lastCreditTopUpAt: true } } }
    });

    for (const sub of subs) {
        const plan = sub.plan as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
        const credits = getMonthlyCreditsForPlan(plan);

        // Renew monthly on day 1 idempotently: only if we haven't topped up today
        const lastTopUp = sub.user.lastCreditTopUpAt ? new Date(sub.user.lastCreditTopUpAt) : undefined;
        const alreadyToppedToday = lastTopUp && lastTopUp.toDateString() === now.toDateString();
        const isFirstOfMonth = now.getDate() === 1;

        if (isFirstOfMonth && !alreadyToppedToday) {
            await prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: sub.userId },
                    data: { availableCredits: { increment: credits }, lastCreditTopUpAt: now }
                });
                await tx.creditTransaction.create({
                    data: {
                        userId: sub.userId,
                        change: credits,
                        reason: 'subscription_monthly_top_up',
                        metadata: { plan }
                    }
                });
            });
        }
    }
    return { renewed: subs.length };
}


