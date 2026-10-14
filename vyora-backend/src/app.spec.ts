import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './app';

describe('Express Application Smoke Test', () => {
  const app = createApp();

  it('GET /health returns 200 with status ok or degraded and attaches X-Request-Id', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty('x-request-id');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('app', 'Vyora Business Billing Engine');
  });

  it('GET /api/v1/health returns 200 with status ok or degraded', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty('x-request-id');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('version', '1.0.0');
  });

  it('GET /api/v1/health/diagnostics returns detailed system diagnostics', async () => {
    const res = await request(app).get('/api/v1/health/diagnostics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('memory');
    expect(res.body).toHaveProperty('process');
    expect(res.body).toHaveProperty('database');
  });

  it('GET /unknown-route returns 404 with error payload and requestId', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
    expect(res.body).toHaveProperty('requestId');
  });
});
