"use server";

import {
    GetUserCreditsSchema,
    UpdateUserCreditsSchema,
    type GetUserCreditsData,
    type UpdateUserCreditsData
} from '@/_lib/_schemas/users';
import { createProtectedServerAction } from '@/_lib/_utils/createServerAction';

export const getUserCredits = createProtectedServerAction(
    GetUserCreditsSchema,
    async (data, prisma) => {
        const user = await prisma.user.findUnique({
            where: { id: data.userId },
            select: { availableCredits: true },
        });

        return { credits: user?.availableCredits || 0 };
    },
    { maxRequests: 30, windowMs: 60 * 1000 } // 30 requests per minute
);

export const updateUserCredits = createProtectedServerAction(
    UpdateUserCreditsSchema,
    async (data, prisma) => {
        const user = await prisma.user.update({
            where: { id: data.userId },
            data: { availableCredits: { increment: data.change } },
        });

        return { credits: user.availableCredits };
    },
    { maxRequests: 10, windowMs: 60 * 1000 } // 10 updates per minute
);

