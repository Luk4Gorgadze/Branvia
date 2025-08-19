// Placeholder for PayPal subscription creation - commit marker
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/_lib/_auth/auth';
import { headers } from 'next/headers';
import { getPayPalAccessToken } from '@/_lib/_services/paypalService';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 Starting subscription creation...');

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            console.log('❌ No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('✅ User authenticated:', session.user.id);

        const body = await request.json();
        const { planId } = body as { planId: string };
        console.log('📋 Received planId:', planId);

        if (!planId) {
            console.log('❌ No planId provided');
            return NextResponse.json({ error: 'planId is required' }, { status: 400 });
        }

        // Get PayPal access token
        console.log('🔑 Getting PayPal access token...');
        const accessToken = await getPayPalAccessToken();
        if (!accessToken) {
            console.log('❌ Failed to get PayPal access token');
            return NextResponse.json({ error: 'Failed to get PayPal access token' }, { status: 500 });
        }
        console.log('✅ PayPal access token obtained');

        // Create subscription via PayPal API
        const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/success`;
        const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/cancelled`;

        console.log('🌐 Using return URL:', returnUrl);
        console.log('🌐 Using cancel URL:', cancelUrl);

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
                return_url: returnUrl,
                cancel_url: cancelUrl
            }
        };

        console.log('📤 PayPal subscription data:', JSON.stringify(subscriptionData, null, 2));

        const paypalBaseUrl = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
        console.log('🔗 PayPal API URL:', paypalBaseUrl);
        console.log('🔗 Full endpoint:', `${paypalBaseUrl}/v1/billing/subscriptions`);

        const response = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(subscriptionData)
        });

        console.log('📥 PayPal response status:', response.status);
        console.log('📥 PayPal response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ PayPal subscription creation failed:', errorData);
            console.error('❌ Response status:', response.status);
            return NextResponse.json({ error: 'Failed to create PayPal subscription' }, { status: 500 });
        }

        const subscription = await response.json();
        console.log('✅ PayPal subscription created:', JSON.stringify(subscription, null, 2));

        // Find the approval link
        const approveLink = subscription.links?.find((link: { rel: string; href: string }) => link.rel === 'approve');
        console.log('🔗 Found links:', subscription.links);
        console.log('🔗 Approval link:', approveLink);

        if (!approveLink) {
            console.log('❌ No approval link found in response');
            return NextResponse.json({ error: 'No approval link found' }, { status: 500 });
        }

        const responseData = {
            success: true,
            subscriptionId: subscription.id,
            approveUrl: approveLink.href,
            status: subscription.status
        };

        console.log('🎯 Returning success response:', responseData);
        return NextResponse.json(responseData);

    } catch (error) {
        console.error('💥 Create subscription error:', error);
        console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }
}