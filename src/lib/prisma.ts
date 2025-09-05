import { PrismaClient } from '@prisma/client';
// Import environment validation to throw early if critical variables are missing.
import '@/lib/env';

// Maintain a single PrismaClient instance across the module to prevent
// exhausting database connections during development. In production
// environments a new client can safely be created for each invocation.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;