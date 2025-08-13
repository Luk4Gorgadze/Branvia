// New PayPal service for API integration - commit marker
interface PayPalAccessTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export async function getPayPalAccessToken(): Promise<string | null> {
    try {
        const base = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'; // use sandbox in dev
        const clientId = process.env.PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error('PayPal credentials not configured');
            return null;
        }

        const response = await fetch(`${base}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            console.error('Failed to get PayPal access token');
            return null;
        }

        const data: PayPalAccessTokenResponse = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error getting PayPal access token:', error);
        return null;
    }
}

export async function getPayPalSubscriptionStatus(subscriptionId: string): Promise<{
    id: string;
    status: string;
    plan_id: string;
    custom_id: string;
    billing_info?: {
        next_billing_time?: string;
        cycle_executions?: Array<{
            cycle_start_time?: string;
        }>;
    };
    links?: Array<{
        rel: string;
        href: string;
    }>;
}> {
    try {
        const base = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'; // use sandbox in dev
        const accessToken = await getPayPalAccessToken();

        if (!accessToken) {
            throw new Error('Failed to get access token');
        }

        const response = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get subscription status');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting PayPal subscription status:', error);
        throw error;
    }
}

export async function cancelPayPalSubscription(subscriptionId: string): Promise<boolean> {
    try {
        const base = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
        const accessToken = await getPayPalAccessToken();

        if (!accessToken) {
            throw new Error('Failed to get access token');
        }

        const response = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reason: 'User upgraded to new plan'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to cancel PayPal subscription:', errorData);
            throw new Error(`Failed to cancel subscription: ${response.status}`);
        }

        console.log(`PayPal subscription ${subscriptionId} canceled successfully`);
        return true;
    } catch (error) {
        console.error('Error canceling PayPal subscription:', error);
        throw error;
    }
}


