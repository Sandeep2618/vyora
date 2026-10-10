import { describe, it, expect, vi } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns ok status when database connection is ready', () => {
    const mockConnection: any = {
      readyState: 1, // Connected
    };

    const controller = new HealthController(mockConnection);
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.database.status).toBe('connected');
    expect(result.app).toBe('Vyora Business Billing Engine');
    expect(result.version).toBe('1.0.0');
    expect(result.timestamp).toBeDefined();
  });

  it('reports degraded status when database is disconnected', () => {
    const mockConnection: any = {
      readyState: 0, // Disconnected
    };

    const controller = new HealthController(mockConnection);
    const result = controller.check();

    expect(result.status).toBe('degraded');
    expect(result.database.status).toBe('disconnected');
  });
});
