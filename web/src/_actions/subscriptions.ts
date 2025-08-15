"use server";

import {
    CreateSubscriptionSchema,
    GetCurrentSubscriptionSchema,
    CancelSubscriptionSchema,
    type CreateSubscriptionData,
    type GetCurrentSubscriptionData,
    type CancelSubscriptionData
} from '@/_lib/_schemas/subscriptions';
import { createServerAction } from '@/_lib/_utils/createServerAction';
import { cancelPayPalSubscription } from '@/_lib/_services/paypalService';
import { getServerUser } from '@/_lib/_auth/auth';
import { z } from 'zod';

export const createSubscription = createServerAction(
    CreateSubscriptionSchema,
    async (data, prisma) => {
        const user = await getServerUser();
        if (!user) throw new Error('User not authenticated');

        const subscription = await prisma.subscription.create({
            data: {
                ...data,
                userId: user.id,
            },
        });

        return subscription;
    },
    { rateLimit: { maxRequests: 3, windowMs: 60 * 1000 }, requireAuth: true } // 3 subscriptions per minute
);

export const getCurrentSubscription = createServerAction(
    GetCurrentSubscriptionSchema,
    async (data, prisma) => {
        const user = await getServerUser();
        if (!user) throw new Error('User not authenticated');

        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: user.id,
            },
            orderBy: { createdAt: 'desc' },
        });

        return subscription;
    },
    { rateLimit: { maxRequests: 20, windowMs: 60 * 1000 }, requireAuth: true } // 20 requests per minute
);

export const cancelSubscription = createServerAction(
    CancelSubscriptionSchema,
    async (data, prisma) => {
        const user = await getServerUser();
        if (!user) throw new Error('User not authenticated');

        // First, get the subscription to find the PayPal subscription ID and verify ownership
        const subscription = await prisma.subscription.findUnique({
            where: { id: data.subscriptionId },
            select: { paypalSubscriptionId: true, userId: true }
        });

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        if (subscription.userId !== user.id) {
            throw new Error('Access denied');
        }

        if (!subscription.paypalSubscriptionId) {
            throw new Error('No PayPal subscription ID found');
        }

        // Cancel the subscription with PayPal first
        try {
            await cancelPayPalSubscription(subscription.paypalSubscriptionId);
        } catch (error) {
            console.error('Failed to cancel PayPal subscription:', error);
            throw new Error('Failed to cancel subscription with PayPal. Please try again or contact support.');
        }

        // Then update the database status
        const updatedSubscription = await prisma.subscription.update({
            where: { id: data.subscriptionId },
            data: {
                status: 'CANCELED',
                canceledAt: new Date()
            },
        });

        return updatedSubscription;
    },
    { rateLimit: { maxRequests: 5, windowMs: 60 * 1000 }, requireAuth: true } // 5 cancellations per minute
);

