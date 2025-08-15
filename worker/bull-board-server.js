import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const app = express();

// Create Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    retryStrategy: (times) => Math.min(times * 50, 2000), // retries every 50ms up to 2s
    maxRetriesPerRequest: null,
});

// Create queues for monitoring (these connect to the same Redis as the worker)
const imageGenerationQueue = new Queue('image-generation', { connection: redis });
const cleanupQueue = new Queue('cleanup', { connection: redis });
const emailQueue = new Queue('email', { connection: redis });
const discordNotificationQueue = new Queue('discord-notifications', { connection: redis });

// Create Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/');

createBullBoard({
    queues: [
        new BullMQAdapter(imageGenerationQueue),
        new BullMQAdapter(cleanupQueue),
        new BullMQAdapter(emailQueue),
        new BullMQAdapter(discordNotificationQueue),
    ],
    serverAdapter,
});

// Use Bull Board routes
app.use('/', serverAdapter.getRouter());

const PORT = process.env.BULL_BOARD_PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Bull Board running on http://localhost:${PORT}`);
}); 