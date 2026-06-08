// ═══════════════════════════════════════════
// Server Entry Point — TaskFlow API
// ═══════════════════════════════════════════

import 'dotenv/config';
import app from './src/app.js';
import { connectDatabase, disconnectDatabase } from './src/config/db.js';
import { logger } from './src/utils/logger.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Connect to PostgreSQL via Prisma
  await connectDatabase();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 TaskFlow API running on http://localhost:${PORT}`);
    logger.info(`📖 Swagger docs at http://localhost:${PORT}/api/v1/docs`);
    logger.info(`🌐 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Server closed.');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled errors
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

startServer();
