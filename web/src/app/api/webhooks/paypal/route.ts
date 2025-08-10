import { NextRequest, NextResponse } from 'next/server';
import { activateOrUpsertSubscription, cancelSubscription, getMonthlyCreditsForPlan, mapPayPalPlanIdToInternal, topUpCredits } from '@/_lib/_services/subscriptionService';

// Basic webhook handler (IPN/Webhook). In production, verify signature using PayPal's Webhook verification API.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const eventType: string | undefined = body?.event_type;
        // See https://developer.paypal.com/docs/api/subscriptions/v1/#webhooks
        if (!eventType) {
            return NextResponse.json({ error: 'Missing event_type' }, { status: 400 });
        }

        if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' || eventType === 'BILLING.SUBSCRIPTION.UPDATED') {
            const resource = body.resource;
            const subscriptionId: string = resource?.id;
            const planId: string | undefined = resource?.plan_id;
            const customId: string | undefined = resource?.custom_id; // We will pass userId here when creating the subscription checkout session
            const startTime: string | undefined = resource?.start_time;
            const billingCycle: any = resource?.billing_info?.cycle_executions?.[0];
            const nextBillingTime: string | undefined = resource?.billing_info?.next_billing_time;

            const internalPlan = planId ? mapPayPalPlanIdToInternal(planId) : null;
            if (!internalPlan || !customId) {
                return NextResponse.json({ success: true });
            }

            await activateOrUpsertSubscription({
                userId: customId,
                plan: internalPlan,
                paypalSubscriptionId: subscriptionId,
                periodStart: startTime ? new Date(startTime) : undefined,
                periodEnd: nextBillingTime ? new Date(nextBillingTime) : undefined,
            });

            // Top up initial monthly credits on activation
            const credits = getMonthlyCreditsForPlan(internalPlan);
            await topUpCredits(customId, credits, 'subscription_initial_top_up', { plan: internalPlan, subscriptionId });

            return NextResponse.json({ success: true });
        }

        if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
            const resource = body.resource;
            const subscriptionId: string = resource?.id;
            await cancelSubscription(subscriptionId, new Date());
            return NextResponse.json({ success: true });
        }

        if (eventType === 'BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED') {
            const resource = body.resource;
            const subscriptionId: string = resource?.id || resource?.billing_agreement_id;
            const planId: string | undefined = resource?.plan_id;
            const userId: string | undefined = resource?.custom_id;
            const internalPlan = planId ? mapPayPalPlanIdToInternal(planId) : null;
            if (internalPlan && userId) {
                const credits = getMonthlyCreditsForPlan(internalPlan);
                await topUpCredits(userId, credits, 'subscription_recurring_top_up', { plan: internalPlan, subscriptionId });
            }
            return NextResponse.json({ success: true });
        }

        // For other events, just acknowledge
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PayPal webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}



