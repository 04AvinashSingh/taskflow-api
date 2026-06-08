// ═══════════════════════════════════════════
// Database Configuration — Prisma Client
// ═══════════════════════════════════════════

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

prisma.$on('error', (e) => {
  logger.error('Prisma error:', e.message);
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma warning:', e.message);
});

/**
 * Connect to the database with retry logic.
 */
export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Connected to PostgreSQL database');
  } catch (error) {
    logger.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  }
}

/**
 * Gracefully disconnect from the database.
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('🔌 Disconnected from database');
}

export default prisma;
