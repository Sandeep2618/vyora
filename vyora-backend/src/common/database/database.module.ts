import { Module, Global, OnModuleDestroy, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseSeederService } from './seeder.service';

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

        const isAtlasOrRemote = uri && (uri.startsWith('mongodb+srv://') || (!uri.includes('localhost') && !uri.includes('127.0.0.1')));

        if (!isAtlasOrRemote) {
          try {
            const net = await import('net');
            const isLocalPortOpen = await new Promise<boolean>((resolve) => {
              const socket = new net.Socket();
              socket.setTimeout(1200);
              socket.on('connect', () => {
                socket.destroy();
                resolve(true);
              });
              socket.on('error', () => {
                socket.destroy();
                resolve(false);
              });
              socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
              });
              socket.connect(27017, '127.0.0.1');
            });

            if (!isLocalPortOpen) {
              logger.warn('Local MongoDB service on port 27017 not detected. Launching embedded MongoDB engine...');
              const { MongoMemoryServer } = await import('mongodb-memory-server');
              mongodInstance = await MongoMemoryServer.create({
                instance: {
                  dbName: 'vyora_dev',
                },
              });
              uri = mongodInstance.getUri();
              logger.log(`Embedded MongoDB engine ready at ${uri}`);
            } else {
              logger.log(`Connected to active local MongoDB at ${uri}`);
            }
          } catch (err: any) {
            logger.error(`Error during MongoDB discovery: ${err.message}`);
          }
        } else {
          logger.log(`Connecting to MongoDB at configured remote URI: ${uri?.replace(/:[^:@]+@/, ':****@')}`);
        }

        return {
          uri,
        };
      },
    }),
  ],
  providers: [DatabaseSeederService],
  exports: [MongooseModule, DatabaseSeederService],
})
export class DatabaseModule implements OnModuleDestroy {
  async onModuleDestroy() {
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  }
}
