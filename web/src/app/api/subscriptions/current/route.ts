import { NextResponse } from 'next/server';
import { auth } from '@/_lib/_auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/_lib/_db/prismaClient';

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user) {
            return NextResponse.json({ subscription: null });
        }

        const userId = session.user.id;

        // Find the user's active subscription (including cancelled ones for display purposes)
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: { in: ['ACTIVE', 'CANCELED', 'PAST_DUE', 'SUSPENDED'] }
            },
            select: {
                id: true,
                plan: true,
                status: true,
                paypalSubscriptionId: true,
                currentPeriodStart: true,
                currentPeriodEnd: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!subscription) {
            return NextResponse.json({ subscription: null });
        }

        return NextResponse.json({ subscription });
    } catch (error) {
        console.error('Error fetching current subscription:', error);
        return NextResponse.json({ subscription: null });
    }
}
