// Placeholder for PayPal subscription creation - commit marker
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/_lib/_auth/auth';
import { headers } from 'next/headers';
import { getPayPalAccessToken } from '@/_lib/_services/paypalService';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { planId } = body as { planId: string };
        if (!planId) {
            return NextResponse.json({ error: 'planId is required' }, { status: 400 });
        }

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();
        if (!accessToken) {
            return NextResponse.json({ error: 'Failed to get PayPal access token' }, { status: 500 });
        }

        // Create subscription via PayPal API
        const subscriptionData = {
            plan_id: planId,
            custom_id: session.user.id, // Link to your user
            application_context: {
                brand_name: 'Branvia',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'SUBSCRIBE_NOW',
                payment_method: {
                    payer_selected: 'PAYPAL',
                    payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
                },
                return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/cancelled`
            }
        };

        const response = await fetch(`${process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'}/v1/billing/subscriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(subscriptionData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('PayPal subscription creation failed:', errorData);
            return NextResponse.json({ error: 'Failed to create PayPal subscription' }, { status: 500 });
        }

        const subscription = await response.json();

        // Find the approval link
        const approveLink = subscription.links?.find((link: any) => link.rel === 'approve');
        if (!approveLink) {
            return NextResponse.json({ error: 'No approval link found' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            subscriptionId: subscription.id,
            approveUrl: approveLink.href,
            status: subscription.status
        });

    } catch (error) {
        console.error('Create subscription error:', error);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }
}