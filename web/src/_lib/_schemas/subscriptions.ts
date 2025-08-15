import { z } from 'zod';

// Subscription plan enum
export const SubscriptionPlan = z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']);

// Subscription status enum
export const SubscriptionStatus = z.enum(['ACTIVE', 'CANCELED', 'PAST_DUE', 'SUSPENDED', 'EXPIRED']);

// Schema for creating subscriptions - userId comes from server-side auth
export const CreateSubscriptionSchema = z.object({
    plan: SubscriptionPlan,
    paypalSubscriptionId: z.string().min(1, 'PayPal subscription ID is required'),
    status: SubscriptionStatus.default('ACTIVE'),
});

// Schema for getting current subscription - no userId needed, comes from server-side auth
export const GetCurrentSubscriptionSchema = z.object({});

// Schema for canceling subscription
export const CancelSubscriptionSchema = z.object({
    subscriptionId: z.string().min(1, 'Subscription ID is required'),
});

// Subscription response schema
export const SubscriptionResponseSchema = z.object({
    success: z.boolean(),
    subscription: z.object({
        id: z.string(),
        userId: z.string(),
        plan: SubscriptionPlan,
        status: SubscriptionStatus,
        paypalSubscriptionId: z.string().nullable(),
        startedAt: z.date(),
        currentPeriodStart: z.date().nullable(),
        currentPeriodEnd: z.date().nullable(),
        canceledAt: z.date().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
    }).optional(),
    error: z.string().optional(),
});

// Type exports for use in components
export type CreateSubscriptionData = z.infer<typeof CreateSubscriptionSchema>;
export type GetCurrentSubscriptionData = z.infer<typeof GetCurrentSubscriptionSchema>;
export type CancelSubscriptionData = z.infer<typeof CancelSubscriptionSchema>;
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>; 