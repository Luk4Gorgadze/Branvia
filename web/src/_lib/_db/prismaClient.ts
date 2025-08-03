// src/_lib/_db/prismaClient.ts
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from root .env file if not already loaded
if (!process.env.DATABASE_URL) {
    config({ path: path.resolve(process.cwd(), '../.env') });
}

// If still no DATABASE_URL, construct it from individual variables
if (!process.env.DATABASE_URL && process.env.POSTGRES_USER) {
    process.env.DATABASE_URL = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5433/${process.env.POSTGRES_DB}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
    globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;