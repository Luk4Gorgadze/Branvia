"use server";

import {
    CreateSubscriptionSchema,
    GetCurrentSubscriptionSchema,
    CancelSubscriptionSchema,
    type CreateSubscriptionData,
    type GetCurrentSubscriptionData,
    type CancelSubscriptionData
} from '@/_lib/_schemas/subscriptions';
import { createProtectedServerAction } from '@/_lib/_utils/createServerAction';
import { cancelPayPalSubscription } from '@/_lib/_services/paypalService';
import { z } from 'zod';

export const createSubscription = createProtectedServerAction(
    CreateSubscriptionSchema,
    async (data, prisma) => {
        const subscription = await prisma.subscription.create({
            data: data,
        });

        return subscription;
    },
    { maxRequests: 3, windowMs: 60 * 1000 } // 3 subscriptions per minute
);

export const getCurrentSubscription = createProtectedServerAction(
    GetCurrentSubscriptionSchema,
    async (data, prisma) => {
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: data.userId,
            },
            orderBy: { createdAt: 'desc' },
        });

        return subscription;
    },
    { maxRequests: 20, windowMs: 60 * 1000 } // 20 requests per minute
);

export const cancelSubscription = createProtectedServerAction(
    CancelSubscriptionSchema,
    async (data, prisma) => {
        // First, get the subscription to find the PayPal subscription ID
        const subscription = await prisma.subscription.findUnique({
            where: { id: data.subscriptionId },
            select: { paypalSubscriptionId: true }
        });

        if (!subscription) {
            throw new Error('Subscription not found');
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
    { maxRequests: 5, windowMs: 60 * 1000 } // 5 cancellations per minute
);

