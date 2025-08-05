import { Redis } from 'ioredis';

export interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    redis: {
        status: 'connected' | 'disconnected';
        latency?: number;
    };
    uptime: number;
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
}

export async function checkHealth(redis: Redis): Promise<HealthStatus> {
    const startTime = Date.now();
    let redisLatency: number | undefined;
    let redisStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
        // Check Redis connection
        await redis.ping();
        redisStatus = 'connected';
        redisLatency = Date.now() - startTime;
    } catch (error) {
        console.error('Redis health check failed:', error);
    }

    // Get memory usage
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    return {
        status: redisStatus === 'connected' ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        redis: {
            status: redisStatus,
            latency: redisLatency,
        },
        uptime: process.uptime(),
        memory: {
            used: Math.round(usedMemory / 1024 / 1024), // MB
            total: Math.round(totalMemory / 1024 / 1024), // MB
            percentage: Math.round(memoryPercentage),
        },
    };
} 