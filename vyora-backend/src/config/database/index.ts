import mongoose from 'mongoose';
import { logger } from '../../util';

class Database {
  private static instance: Database;
  private isConnecting = false;

  private constructor() {
    mongoose.connection.on('connected', () => {
      const host = mongoose.connection.host;
      const port = mongoose.connection.port;
      const dbName = mongoose.connection.name;
      logger.success(`MongoDB connected successfully [DB: ${dbName} | Host: ${host}:${port}]`);
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Mongoose Query Debugger (enabled via DEBUG_DB=true or in verbose dev)
    if (process.env.DEBUG_DB === 'true') {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        logger.debug(
          `Mongoose: ${collectionName}.${method}(${JSON.stringify(query)})`,
          doc ? { doc } : undefined,
        );
      });
    }
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(uri: string): Promise<typeof mongoose> {
    if (mongoose.connection.readyState === 1) {
      return mongoose;
    }

    if (this.isConnecting) {
      return mongoose;
    }

    this.isConnecting = true;
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      this.isConnecting = false;
      return conn;
    } catch (error) {
      this.isConnecting = false;
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }

  public isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export const database = Database.getInstance();
