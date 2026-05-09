/**
 * Prisma Client
 * Singleton instance for database operations
 */

import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

// Prevent multiple Prisma Client instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Log connection
prisma.$connect()
  .then(() => {
    logger.info('✅ Prisma connected to database');
  })
  .catch((err) => {
    logger.error('❌ Prisma connection failed:', err);
    process.exit(1);
  });

export default prisma;
