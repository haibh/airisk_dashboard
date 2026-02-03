// Prisma client singleton
// Note: Run `npx prisma generate` after setting up DATABASE_URL in .env

let prisma: any;

try {
  const { PrismaClient } = require('@prisma/client');

  const globalForPrisma = globalThis as unknown as {
    prisma: typeof PrismaClient | undefined;
  };

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch {
  // Prisma client not generated yet - this is expected before running `prisma generate`
  console.warn('Prisma client not available. Run `npx prisma generate` to generate it.');
  prisma = null;
}

export { prisma };
export default prisma;
