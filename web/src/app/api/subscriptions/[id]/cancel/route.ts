import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/_lib/_auth/auth';
import { prisma } from '@/_lib/_db/prismaClient';
import { cancelPayPalSubscription } from '@/_lib/_services/paypalService';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Get the authenticated user
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const params = await context.params;
        const subscriptionId = params.id;

        // Get the subscription and verify ownership
        const subscription = await prisma.subscription.findFirst({
            where: {
                id: subscriptionId,
                userId: session.user.id
            }
        });

        if (!subscription) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        // Cancel the subscription in PayPal (only if it has a PayPal ID)
        if (subscription.paypalSubscriptionId) {
            try {
                await cancelPayPalSubscription(subscription.paypalSubscriptionId);
                console.log('✅ PayPal subscription cancelled successfully:', subscription.paypalSubscriptionId);
            } catch (paypalError) {
                console.error('❌ Failed to cancel PayPal subscription:', paypalError);
                // Continue with database update even if PayPal fails
            }
        } else {
            console.log('⚠️ No PayPal subscription ID found, skipping PayPal cancellation');
        }

        // Update the subscription status in the database
        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'CANCELED',
                canceledAt: new Date()
            }
        });

        console.log('✅ Subscription cancelled in database:', subscriptionId);

        return NextResponse.json({
            success: true,
            message: 'Subscription cancelled successfully'
        });

    } catch (error) {
        console.error('❌ Error cancelling subscription:', error);
        return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}
