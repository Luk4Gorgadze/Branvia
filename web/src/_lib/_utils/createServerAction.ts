import { z } from 'zod';
import { prisma } from '@/_lib/_db/prismaClient';
import { getServerUser } from '@/_lib/_auth/auth';

// Rate limiting configuration
interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

// Default rate limit: 10 requests per minute
const DEFAULT_RATE_LIMIT: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
};

// In-memory rate limiting store (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function checkRateLimit(userId: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const key = `rate_limit:${userId}`;
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
        // Reset or create new rate limit window
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return true;
    }

    if (record.count >= config.maxRequests) {
        return false; // Rate limit exceeded
    }

    // Increment count
    record.count++;
    return true;
}

// Clean up expired rate limit records
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Server Action wrapper function
export function createServerAction<TInput, TOutput>(
    schema: z.ZodSchema<TInput>,
    handler: (data: TInput, prismaClient: typeof prisma) => Promise<TOutput>,
    options: {
        rateLimit?: RateLimitConfig;
        requireAuth?: boolean; // Optional: for rate limiting with user ID
    } = {}
) {
    return async (data: TInput): Promise<{
        success: boolean;
        data?: TOutput;
        error?: string;
        rateLimited?: boolean;
    }> => {
        try {
            // Validate input data
            const validatedData = schema.parse(data);

            // Check rate limiting if configured
            if (options.rateLimit) {
                let userIdentifier: string;

                if (options.requireAuth) {
                    // If auth is required, get user for rate limiting
                    try {
                        const user = await getServerUser();
                        if (!user) {
                            return {
                                success: false,
                                error: 'Authentication required for rate limiting',
                            };
                        }
                        userIdentifier = user.id;
                    } catch (error) {
                        return {
                            success: false,
                            error: 'Authentication failed',
                        };
                    }
                } else {
                    // For public actions, use a generic identifier
                    userIdentifier = 'public';
                }

                if (!checkRateLimit(userIdentifier, options.rateLimit)) {
                    return {
                        success: false,
                        error: `Rate limit exceeded. Maximum ${options.rateLimit.maxRequests} requests per ${options.rateLimit.windowMs / 1000} seconds.`,
                        rateLimited: true,
                    };
                }
            }

            // Execute the handler with validated data and Prisma client
            const result = await handler(validatedData, prisma);

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error('Server Action error:', error);

            // Handle Zod validation errors
            if (error instanceof z.ZodError) {
                const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
                return {
                    success: false,
                    error: `Validation error: ${errorMessage}`,
                };
            }

            // Handle other errors
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            };
        }
    };
}

// You can use createServerAction directly with options:
// - For public actions: createServerAction(schema, handler)
// - For rate-limited public actions: createServerAction(schema, handler, { rateLimit })
// - For rate-limited authenticated actions: createServerAction(schema, handler, { rateLimit, requireAuth: true })
// - Authentication is handled directly in your handlers using getServerUser() 