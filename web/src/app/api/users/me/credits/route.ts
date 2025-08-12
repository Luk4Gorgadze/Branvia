import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/_lib/_auth/auth';
import { prisma } from '@/_lib/_db/prismaClient';

export async function GET(_req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ availableCredits: null }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { availableCredits: true },
        });

        return NextResponse.json({ availableCredits: user?.availableCredits ?? 0 });
    } catch (error) {
        console.error('Error fetching user credits:', error);
        return NextResponse.json({ availableCredits: null }, { status: 500 });
    }
}


