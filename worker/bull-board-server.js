import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const app = express();

// Create Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Create queues
const imageGenerationQueue = new Queue('image-generation', { connection: redis });
const cleanupQueue = new Queue('cleanup', { connection: redis });

// Create Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/');

createBullBoard({
    queues: [
        new BullMQAdapter(imageGenerationQueue),
        new BullMQAdapter(cleanupQueue),
    ],
    serverAdapter,
});

// Use Bull Board routes
app.use('/', serverAdapter.getRouter());

const PORT = process.env.BULL_BOARD_PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Bull Board running on http://localhost:${PORT}`);
}); 