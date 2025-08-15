"use server";

import {
    GetUserCreditsSchema,
    UpdateUserCreditsSchema,
    type GetUserCreditsData,
    type UpdateUserCreditsData
} from '@/_lib/_schemas/users';
import { createServerAction } from '@/_lib/_utils/createServerAction';
import { getServerUser } from '@/_lib/_auth/auth';

export const getUserCredits = createServerAction(
    GetUserCreditsSchema,
    async (data, prisma) => {
        const user = await getServerUser();
        if (!user) throw new Error('User not authenticated');

        const userRecord = await prisma.user.findUnique({
            where: { id: user.id },
            select: { availableCredits: true },
        });

        return { credits: userRecord?.availableCredits || 0 };
    },
    { rateLimit: { maxRequests: 30, windowMs: 60 * 1000 }, requireAuth: true } // 30 requests per minute
);

export const updateUserCredits = createServerAction(
    UpdateUserCreditsSchema,
    async (data, prisma) => {
        const user = await getServerUser();
        if (!user) throw new Error('User not authenticated');

        const userRecord = await prisma.user.update({
            where: { id: user.id },
            data: { availableCredits: { increment: data.change } },
        });

        return { credits: userRecord.availableCredits };
    },
    { rateLimit: { maxRequests: 10, windowMs: 60 * 1000 }, requireAuth: true } // 10 updates per minute
);

