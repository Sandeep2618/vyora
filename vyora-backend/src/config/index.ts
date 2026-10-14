import dotenv from 'dotenv';
import path from 'path';
import { AppConfig } from './interface';
import { Environment } from './enum';

// Load .env from root and backend directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
let env = Environment.DEVELOPMENT;
if (nodeEnv === 'production') env = Environment.PRODUCTION;
if (nodeEnv === 'test') env = Environment.TEST;

export const config: AppConfig = {
  env,
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vyora',
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-here',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX || '500', 10),
};

export * from './enum';
export * from './interface';
export * from './constant';
export { database } from './database';
