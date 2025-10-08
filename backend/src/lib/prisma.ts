import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient Singleton
 *
 * Ensures only one instance of Prisma Client is created across the application.
 * This is especially important in development to prevent connection pool exhaustion
 * due to hot reloading creating multiple Prisma Client instances.
 */

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
