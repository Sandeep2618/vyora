import { Environment } from '../enum';

export interface AppConfig {
  env: Environment;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  frontendUrl: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}
