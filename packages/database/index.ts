import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: process.env.POSTGRES_URL
        }
    }
});

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
}); 