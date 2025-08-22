import redis from '@/_lib/_db/redisClient';

interface CacheOptions {
    ttl?: number; // Time to live in seconds
    prefix?: string; // Cache key prefix
}

export class RedisCache {
    private prefix: string;
    private defaultTTL: number;

    constructor(options: CacheOptions = {}) {
        this.prefix = options.prefix || 'cache';
        this.defaultTTL = options.ttl || 300; // 5 minutes default
    }

    /**
     * Get cached data by key
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const fullKey = `${this.prefix}:${key}`;
            const cached = await redis.get(fullKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error(`Redis cache get error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set cached data with TTL
     */
    async set<T>(key: string, data: T, ttl?: number): Promise<void> {
        try {
            const fullKey = `${this.prefix}:${key}`;
            const cacheTTL = ttl || this.defaultTTL;
            await redis.setex(fullKey, cacheTTL, JSON.stringify(data));
        } catch (error) {
            console.error(`Redis cache set error for key ${key}:`, error);
        }
    }

    /**
     * Delete cached data
     */
    async delete(key: string): Promise<void> {
        try {
            const fullKey = `${this.prefix}:${key}`;
            await redis.del(fullKey);
        } catch (error) {
            console.error(`Redis cache delete error for key ${key}:`, error);
        }
    }

    /**
     * Clear all cached data with this prefix
     */
    async clearAll(): Promise<void> {
        try {
            const keys = await redis.keys(`${this.prefix}:*`);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.error(`Redis cache clear all error:`, error);
        }
    }
}

// Pre-configured cache instances for common use cases
export const publicDataCache = new RedisCache({
    prefix: 'public',
    ttl: 86400 // 24 hours for public data
});

export const userDataCache = new RedisCache({
    prefix: 'user',
    ttl: 60 // 1 minute for user-specific data
});

export const sessionCache = new RedisCache({
    prefix: 'session',
    ttl: 1800 // 30 minutes for session data
});
