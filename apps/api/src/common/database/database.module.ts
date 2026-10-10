import { Module, Global, OnModuleDestroy, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

let mongodInstance: any = null;

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        let uri = configService.get<string>('MONGODB_URI');

        if (!uri) {
          logger.warn('No MONGODB_URI provided in environment. Initializing local MongoDB instance for development...');
          try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            mongodInstance = await MongoMemoryServer.create({
              instance: {
                dbName: 'vyora_dev',
              },
            });
            uri = mongodInstance.getUri();
            logger.log(`Embedded MongoDB started successfully at ${uri}`);
          } catch (err: any) {
            logger.error(`Failed to start embedded MongoDB: ${err.message}. Falling back to default URI.`);
            uri = 'mongodb://localhost:27017/vyora_dev';
          }
        } else {
          logger.log(`Connecting to MongoDB at configured URI: ${uri.replace(/:[^:@]+@/, ':****@')}`);
        }

        return {
          uri,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule implements OnModuleDestroy {
  async onModuleDestroy() {
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  }
}
