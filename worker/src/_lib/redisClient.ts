import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    retryStrategy: (times) => Math.min(times * 50, 2000), // retries every 50ms up to 2s
    maxRetriesPerRequest: null,
});

export default redis; 