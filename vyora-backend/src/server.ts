import { app } from './app';
import { config, database } from './config';
import { logger } from './util';

// 1. Process Watchdog: Prevent silent crashes on unhandled errors
process.on('uncaughtException', (err: Error) => {
  logger.error('CRITICAL: Uncaught Exception caught by process watchdog:', err);
  if (config.env === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('CRITICAL: Unhandled Promise Rejection:', reason);
});

async function bootstrap() {
  try {
    // 2. Connect to Database
    logger.info(`Connecting to MongoDB...`);
    await database.connect(config.mongoUri);

    // 3. Start HTTP Server
    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.success(`Vyora API Engine running at http://localhost:${config.port}/api/v1`);
      logger.info(`Health check accessible at http://localhost:${config.port}/health`);
      logger.info(`Environment: ${config.env}`);
    });

    // 4. Graceful Shutdown
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await database.disconnect();
        logger.info('Database disconnected.');
        process.exit(0);
      });

      // Force shutdown after timeout
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (err: any) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

bootstrap();
