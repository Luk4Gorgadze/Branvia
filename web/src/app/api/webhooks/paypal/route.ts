// New PayPal webhook handler for subscription events - commit marker
import { NextRequest, NextResponse } from 'next/server';
import { activateOrUpsertSubscription, cancelSubscription, getMonthlyCreditsForPlan, mapPayPalPlanIdToInternal, topUpCredits } from '@/_lib/_services/subscriptionService';
import { sendSubscriptionConfirmationEmail, sendCreditTopUpEmail, sendPaymentFailureEmail, sendSubscriptionSuspendedEmail } from '@/_lib/_services/emailService';
import { sendPaymentSuccessNotification, sendPaymentFailureNotification, sendSubscriptionSuspendedNotification, sendSubscriptionActivatedNotification } from '@/_lib/_services/discordNotificationService';
import { prisma } from '@/_lib/_db/prismaClient';

export const dynamic = "force-dynamic";

// Basic webhook handler (IPN/Webhook). In production, verify signature using PayPal's Webhook verification API.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const eventType: string | undefined = body?.event_type;
        console.log('🔔 PayPal webhook:', eventType);

        // See https://developer.paypal.com/docs/api/subscriptions/v1/#webhooks
        if (!eventType) {
            console.log('❌ Missing event_type in webhook');
            return NextResponse.json({ error: 'Missing event_type' }, { status: 400 });
        }

        if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' || eventType === 'BILLING.SUBSCRIPTION.UPDATED') {
            const resource = body.resource;
            const subscriptionId: string = resource?.id;
            const planId: string | undefined = resource?.plan_id;
            const customId: string | undefined = resource?.custom_id;
            const startTime: string | undefined = resource?.start_time;
            const nextBillingTime: string | undefined = resource?.billing_info?.next_billing_time;

            const internalPlan = planId ? mapPayPalPlanIdToInternal(planId) : null;

            if (!internalPlan || !customId) {
                console.log('❌ Missing internalPlan or customId, skipping');
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
                        'STARTER': 12,
                        'PROFESSIONAL': 29,
                        'ENTERPRISE': 199
                    };

                    await sendSubscriptionConfirmationEmail(
                        user.email,
                        user.name,
                        subscriptionId,
                        internalPlan,
                        planPricing[internalPlan as keyof typeof planPricing] || 0,
                        nextBillingTime
                    );

                    // Send Discord notification for subscription activation
                    try {
                        await sendSubscriptionActivatedNotification({
                            userId: customId,
                            userName: user.name,
                            plan: internalPlan,
                            subscriptionId: subscriptionId,
                            credits: credits
                        });
                    } catch (discordError) {
                        console.error('❌ Failed to send Discord notification:', discordError);
                        // Don't fail the webhook if Discord fails
                    }
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
            const resource = body.resource;
            const subscriptionId: string = resource?.id || resource?.billing_agreement_id;
            const planId: string | undefined = resource?.plan_id;
            const userId: string | undefined = resource?.custom_id;
            const internalPlan = planId ? mapPayPalPlanIdToInternal(planId) : null;

            if (internalPlan && userId) {
                // Get billing cycle information from the webhook
                const nextBillingTime = resource?.billing_info?.next_billing_time;
                const currentBillingTime = resource?.billing_info?.cycle_executions?.[0]?.cycle_start_time;

                // Update subscription billing dates and ensure status is ACTIVE
                if (nextBillingTime) {
                    try {
                        await prisma.subscription.updateMany({
                            where: {
                                paypalSubscriptionId: subscriptionId,
                                userId: userId
                            },
                            data: {
                                status: 'ACTIVE', // Ensure subscription is active after successful payment
                                currentPeriodStart: currentBillingTime ? new Date(currentBillingTime) : undefined,
                                currentPeriodEnd: new Date(nextBillingTime)
                            }
                        });
                    } catch (updateError) {
                        console.error('❌ Failed to update billing dates:', updateError);
                        // Continue with credit top-up even if date update fails
                    }
                }

                const credits = getMonthlyCreditsForPlan(internalPlan);
                await topUpCredits(userId, credits, 'subscription_recurring_top_up', { plan: internalPlan, subscriptionId });

                // Send credit top-up email
                try {
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { name: true, email: true }
                    });

                    if (user) {
                        await sendCreditTopUpEmail(
                            user.email,
                            user.name,
                            credits,
                            'Monthly subscription renewal'
                        );

                        // Send Discord notification for successful payment
                        try {
                            await sendPaymentSuccessNotification({
                                userId: userId,
                                userName: user.name,
                                plan: internalPlan,
                                amount: 0, // We don't have amount in this webhook, but we can get it from plan pricing
                                subscriptionId: subscriptionId,
                                credits: credits
                            });
                        } catch (discordError) {
                            console.error('❌ Failed to send Discord notification:', discordError);
                            // Don't fail the webhook if Discord fails
                        }
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

                        // Send Discord notification for payment failure
                        try {
                            await sendPaymentFailureNotification({
                                userId: userId,
                                userName: user.name,
                                subscriptionId: subscriptionId
                            });
                        } catch (discordError) {
                            console.error('❌ Failed to send Discord notification:', discordError);
                            // Don't fail the webhook if Discord fails
                        }
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

                        // Send Discord notification for subscription suspended
                        try {
                            await sendSubscriptionSuspendedNotification({
                                userId: userId,
                                userName: user.name,
                                subscriptionId: subscriptionId
                            });
                        } catch (discordError) {
                            console.error('❌ Failed to send Discord notification:', discordError);
                            // Don't fail the webhook if Discord fails
                        }
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



