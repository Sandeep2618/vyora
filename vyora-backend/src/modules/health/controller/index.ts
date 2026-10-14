import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse, asyncHandler } from '../../../util';
import { config } from '../../../config';

export class HealthController {
  static check = asyncHandler(async (_req: Request, res: Response) => {
    const isDbConnected = mongoose.connection.readyState === 1;

    const healthData = {
      status: isDbConnected ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: isDbConnected ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState,
      },
      app: 'Vyora Business Billing Engine',
      version: '1.0.0',
    };

    return ApiResponse.success(res, healthData);
  });

  static diagnostics = asyncHandler(async (_req: Request, res: Response) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    const mem = process.memoryUsage();

    const diagnostics = {
      app: 'Vyora Business Billing Engine',
      version: '1.0.0',
      status: isDbConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: config.env,
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      memory: {
        rssMb: Number((mem.rss / (1024 * 1024)).toFixed(2)),
        heapTotalMb: Number((mem.heapTotal / (1024 * 1024)).toFixed(2)),
        heapUsedMb: Number((mem.heapUsed / (1024 * 1024)).toFixed(2)),
        heapUsagePercent: Number(((mem.heapUsed / mem.heapTotal) * 100).toFixed(1)),
      },
      database: {
        status: isDbConnected ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        collectionsCount: Object.keys(mongoose.connection.collections || {}).length,
      },
    };

    return ApiResponse.success(res, diagnostics);
  });
}
