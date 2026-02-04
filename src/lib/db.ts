import { PrismaClient } from '@prisma/client';

// Declare global type for Prisma client singleton pattern
declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with proper configuration
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Use singleton pattern to prevent multiple instances in development
export const prisma: PrismaClient = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
