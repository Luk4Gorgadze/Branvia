// New PayPal service for API integration - commit marker
interface PayPalAccessTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export async function getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const secret = process.env.PAYPAL_CLIENT_SECRET!;
    const base = process.env.PAYPAL_BASE_URL || 'https://api-m.paypal.com'; // use sandbox in dev

    const res = await fetch(`${base}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'Authorization': 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayPal token error: ${res.status} ${text}`);
    }
    const data = (await res.json()) as PayPalAccessTokenResponse;
    return data.access_token;
}

export async function getPayPalSubscription(paypalSubscriptionId: string) {
    const base = process.env.PAYPAL_BASE_URL || 'https://api-m.paypal.com';
    const token = await getPayPalAccessToken();
    const res = await fetch(`${base}/v1/billing/subscriptions/${paypalSubscriptionId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayPal subscription fetch error: ${res.status} ${text}`);
    }
    return await res.json();
}


