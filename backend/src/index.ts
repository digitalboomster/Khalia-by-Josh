import 'dotenv/config';
import app from './app.js';
import database from '@config/database';
import redis from '@config/redis';
import logger from '@config/logger';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || 'localhost';

/**
 * Start server
 */
async function startServer(): Promise<void> {
  try {
    logger.info('🚀 Starting Khalia Backend Server...', {
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      host: HOST,
    });

    // Initialize database
    logger.info('📊 Initializing database connection...');
    await database.initialize();
    logger.info('✅ Database initialized');

    // Initialize Redis
    logger.info('💾 Initializing Redis cache...');
    await redis.initialize();
    logger.info('✅ Redis initialized');

    // Start HTTP server
    const server = app.listen(PORT, HOST, () => {
      logger.info('🎉 Server is running', {
        url: `http://${HOST}:${PORT}`,
        apiUrl: `http://${HOST}:${PORT}/api/v1`,
        heathCheck: `http://${HOST}:${PORT}/health`,
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await gracefulShutdown();
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await gracefulShutdown();
      });
    });

    // Unhandled promise rejection
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', { promise, reason });
    });

    // Uncaught exception
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', { error });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(): Promise<void> {
  try {
    logger.info('🛑 Shutting down gracefully...');

    // Close database
    try {
      await database.close();
      logger.info('Database closed');
    } catch (error) {
      logger.error('Error closing database', { error });
    }

    // Close Redis
    try {
      await redis.close();
      logger.info('Redis closed');
    } catch (error) {
      logger.error('Error closing Redis', { error });
    }

    logger.info('👋 Goodbye!');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
}

// Start the server
startServer();
