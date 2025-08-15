import { z } from 'zod';

// Schema for getting user credits - no userId needed, comes from server-side auth
export const GetUserCreditsSchema = z.object({});

// Schema for updating user credits - no userId needed, comes from server-side auth
export const UpdateUserCreditsSchema = z.object({
    change: z.number().int('Credit change must be an integer'),
});

// User credits response schema
export const UserCreditsResponseSchema = z.object({
    success: z.boolean(),
    credits: z.number().optional(),
    error: z.string().optional(),
});

// Type exports for use in components
export type GetUserCreditsData = z.infer<typeof GetUserCreditsSchema>;
export type UpdateUserCreditsData = z.infer<typeof UpdateUserCreditsSchema>;
export type UserCreditsResponse = z.infer<typeof UserCreditsResponseSchema>; 