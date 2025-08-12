// New PayPal webhook handler for subscription events - commit marker
import { NextRequest, NextResponse } from 'next/server';
import { activateOrUpsertSubscription, cancelSubscription, getMonthlyCreditsForPlan, mapPayPalPlanIdToInternal, topUpCredits } from '@/_lib/_services/subscriptionService';
import { sendSubscriptionConfirmationEmail, sendCreditTopUpEmail, sendPaymentFailureEmail, sendSubscriptionSuspendedEmail } from '@/_lib/_services/emailService';
import { prisma } from '@/_lib/_db/prismaClient';

// Basic webhook handler (IPN/Webhook). In production, verify signature using PayPal's Webhook verification API.
export async function POST(request: NextRequest) {
    try {
        console.log('🔔 PayPal webhook received');

        const body = await request.json();
        console.log('📦 Webhook body:', JSON.stringify(body, null, 2));

        const eventType: string | undefined = body?.event_type;
        console.log('🎯 Event type:', eventType);

        // See https://developer.paypal.com/docs/api/subscriptions/v1/#webhooks
        if (!eventType) {
            console.log('❌ Missing event_type in webhook');
            return NextResponse.json({ error: 'Missing event_type' }, { status: 400 });
        }

        if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' || eventType === 'BILLING.SUBSCRIPTION.UPDATED') {
            console.log('✅ Processing subscription activation/update');

            const resource = body.resource;
            const subscriptionId: string = resource?.id;
            const planId: string | undefined = resource?.plan_id;
            const customId: string | undefined = resource?.custom_id; // We will pass userId here when creating the subscription checkout session
            const startTime: string | undefined = resource?.start_time;
            const billingCycle: any = resource?.billing_info?.cycle_executions?.[0];
            const nextBillingTime: string | undefined = resource?.billing_info?.next_billing_time;

            console.log('📋 Resource data:', {
                subscriptionId,
                planId,
                customId,
                startTime,
                nextBillingTime
            });

            const internalPlan = planId ? mapPayPalPlanIdToInternal(planId) : null;
            console.log('🔗 Mapped internal plan:', internalPlan);

            if (!internalPlan || !customId) {
                console.log('❌ Missing internalPlan or customId, skipping');
                return NextResponse.json({ success: true });
            }

            console.log('💳 Activating/updating subscription...');
            const subscription = await activateOrUpsertSubscription({
                userId: customId,
                plan: internalPlan,
                paypalSubscriptionId: subscriptionId,
                periodStart: startTime ? new Date(startTime) : undefined,
                periodEnd: nextBillingTime ? new Date(nextBillingTime) : undefined,
            });
            console.log('✅ Subscription updated/created:', subscription.id);

            // Top up initial monthly credits on activation
            const credits = getMonthlyCreditsForPlan(internalPlan);
            console.log('💰 Adding credits:', credits);
            await topUpCredits(customId, credits, 'subscription_initial_top_up', { plan: internalPlan, subscriptionId });
            console.log('✅ Credits added successfully');

            // Send subscription confirmation email
            try {
                // Get user details for the email
                const user = await prisma.user.findUnique({
                    where: { id: customId },
                    select: { name: true, email: true }
                });

                if (user) {
                    // Get plan pricing
                    const planPricing = {
                        'STARTER': 29,
                        'PROFESSIONAL': 59,
                        'ENTERPRISE': 199
                    };

                    console.log('📧 Sending subscription confirmation email to:', user.email);

                    await sendSubscriptionConfirmationEmail(
                        user.email,
                        user.name,
                        subscriptionId,
                        internalPlan,
                        planPricing[internalPlan as keyof typeof planPricing] || 0,
                        nextBillingTime
                    );

                    console.log('✅ Subscription confirmation email sent successfully');
                } else {
                    console.log('❌ User not found for email:', customId);
                }
            } catch (emailError) {
                console.error('❌ Failed to send subscription confirmation email:', emailError);
                // Don't fail the webhook if email fails
            }

            return NextResponse.json({ success: true });
        }

        if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
            const resource = body.resource;
            const subscriptionId: string = resource?.id;
            await cancelSubscription(subscriptionId, new Date());
            return NextResponse.json({ success: true });
        }

        if (eventType === 'BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED') {
            console.log('✅ Processing subscription payment succeeded');

            const resource = body.resource;
            const subscriptionId: string = resource?.id || resource?.billing_agreement_id;
            const planId: string | undefined = resource?.plan_id;
            const userId: string | undefined = resource?.custom_id;
            const internalPlan = planId ? mapPayPalPlanIdToInternal(planId) : null;

            if (internalPlan && userId) {
                const credits = getMonthlyCreditsForPlan(internalPlan);
                console.log('💰 Adding recurring credits:', credits);
                await topUpCredits(userId, credits, 'subscription_recurring_top_up', { plan: internalPlan, subscriptionId });
                console.log('✅ Recurring credits added successfully');

                // Send credit top-up email
                try {
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { name: true, email: true }
                    });

                    if (user) {
                        console.log('📧 Sending credit top-up email to:', user.email);

                        await sendCreditTopUpEmail(
                            user.email,
                            user.name,
                            credits,
                            'Monthly subscription renewal'
                        );

                        console.log('✅ Credit top-up email sent successfully');
                    } else {
                        console.log('❌ User not found for credit top-up email:', userId);
                    }
                } catch (emailError) {
                    console.error('❌ Failed to send credit top-up email:', emailError);
                    // Don't fail the webhook if email fails
                }
            }
            return NextResponse.json({ success: true });
        }

        if (eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
            console.log('❌ Processing subscription payment failed');

            const resource = body.resource;
            const subscriptionId: string = resource?.id;
            const userId: string | undefined = resource?.custom_id;

            if (userId) {
                // Update subscription status to PAST_DUE
                await prisma.subscription.updateMany({
                    where: {
                        paypalSubscriptionId: subscriptionId,
                        userId: userId
                    },
                    data: { status: 'PAST_DUE' }
                });
                console.log('⚠️ Subscription marked as PAST_DUE for user:', userId);

                // Send payment failure notification email
                try {
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { name: true, email: true }
                    });

                    if (user) {
                        console.log('📧 Sending payment failure email to:', user.email);

                        await sendPaymentFailureEmail(
                            user.email,
                            user.name,
                            subscriptionId
                        );

                        console.log('✅ Payment failure email sent successfully');
                    } else {
                        console.log('❌ User not found for payment failure email:', userId);
                    }
                } catch (emailError) {
                    console.error('❌ Failed to send payment failure email:', emailError);
                }
            }
            return NextResponse.json({ success: true });
        }

        if (eventType === 'BILLING.SUBSCRIPTION.SUSPENDED') {
            console.log('🚫 Processing subscription suspended');

            const resource = body.resource;
            const subscriptionId: string = resource?.id;
            const userId: string | undefined = resource?.custom_id;

            if (userId) {
                // Update subscription status to SUSPENDED
                await prisma.subscription.updateMany({
                    where: {
                        paypalSubscriptionId: subscriptionId,
                        userId: userId
                    },
                    data: { status: 'SUSPENDED' }
                });
                console.log('🚫 Subscription marked as SUSPENDED for user:', userId);

                // Send subscription suspended email
                try {
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { name: true, email: true }
                    });

                    if (user) {
                        console.log('📧 Sending subscription suspended email to:', user.email);

                        await sendSubscriptionSuspendedEmail(
                            user.email,
                            user.name,
                            subscriptionId
                        );

                        console.log('✅ Subscription suspended email sent successfully');
                    } else {
                        console.log('❌ User not found for suspended email:', userId);
                    }
                } catch (emailError) {
                    console.error('❌ Failed to send subscription suspended email:', emailError);
                }
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



