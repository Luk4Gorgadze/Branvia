import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/_lib/_auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/_lib/_db/prismaClient';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user) {
            return NextResponse.json({ subscription: null });
        }

        const userId = session.user.id;

        // Find the user's active subscription
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: 'ACTIVE'
            },
            select: {
                id: true,
                plan: true,
                status: true,
                currentPeriodStart: true,
                currentPeriodEnd: true
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
