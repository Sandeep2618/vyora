# Vyora — Production Deployment & Disaster Recovery Runbook

This runbook documents the deployment procedures, environment configuration, database connection, and backup/restore protocols for **Vyora Version 1**.

---

## 1. Production Architecture Overview

- **Monorepo**: Turborepo + pnpm workspaces
- **Backend API (`apps/api`)**: Node.js NestJS Modular Monolith listening on port 4000 (or `PORT` environment variable), exposing REST endpoints under `/api/v1` and OpenAPI Swagger documentation under `/api/v1/docs`.
- **Frontend SPA (`apps/web`)**: React 19 + TypeScript + Vite bundled as static assets (`apps/web/dist`) served via Nginx, Cloudflare Pages, AWS S3 + CloudFront, or Vercel.
- **Database**: MongoDB Atlas Replica Set (MongoDB 6.0+ / 7.0+ / 8.0+).
- **Process Manager**: Docker, Kubernetes, PM2, or AWS ECS.

---

## 2. Environment Variables Configuration

Ensure the following environment variables are securely configured in your deployment platform:

| Variable | Description | Example / Recommendation |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | API listening port | `4000` |
| `MONGODB_URI` | MongoDB Atlas Replica Set connection string | `mongodb+srv://vyora_app:<PASSWORD>@cluster0.abcde.mongodb.net/vyora_prod?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for signing access tokens (256-bit min) | `Generate using openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | Access token duration | `1d` |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | `Generate using openssl rand -base64 48` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token duration | `7d` |
| `VITE_API_URL` | Base API URL accessible by the browser | `https://api.yourdomain.com/api/v1` |

---

## 3. Production Build & Deployment Pipeline

### Step 1: Install Dependencies
```bash
pnpm install --frozen-lockfile
```

### Step 2: Quality & Test Gates
```bash
# 1. Strict TypeScript check across all packages
pnpm typecheck

# 2. Automated test suite (must pass 100%)
pnpm test
```

### Step 3: Production Build
```bash
pnpm build
```

Build outputs:
- API Monolith: `apps/api/dist/`
- Web Frontend: `apps/web/dist/`

### Step 4: Starting the API Service
```bash
node apps/api/dist/main.js
```

---

## 4. Health Checks & Monitoring

The API provides a health endpoint:
- **URL**: `GET /api/v1/health`
- **Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-10-10T15:00:00.000Z",
  "uptimeSeconds": 86400,
  "database": {
    "status": "connected",
    "readyState": 1
  },
  "app": "Vyora Business Billing Engine",
  "version": "1.0.0"
}
```
Configure your load balancer or container orchestrator (Kubernetes liveness/readiness probe, AWS ALB health check) to query `/api/v1/health`.

---

## 5. Database Backup and Restore Runbook

### Database Backups (MongoDB Atlas)
1. **Automated Continuous Backups**: MongoDB Atlas provides automated point-in-time recovery (PITR). Verify that continuous cloud backup is enabled on your cluster.
2. **On-Demand Manual Snapshot**:
   ```bash
   mongodump --uri="mongodb+srv://vyora_app:<PASSWORD>@cluster0.abcde.mongodb.net/vyora_prod" --archive="vyora_backup_$(date +%Y%m%d_%H%M%S).gz" --gzip
   ```

### Restore Rehearsal Procedure
1. Create or select a safe non-production test database (e.g. `vyora_restore_test`).
2. Run `mongorestore` against the test target:
   ```bash
   mongorestore --uri="mongodb+srv://vyora_app:<PASSWORD>@cluster0.abcde.mongodb.net/vyora_restore_test" --archive="vyora_backup_YYYYMMDD_HHMMSS.gz" --gzip --drop
   ```
3. Verify collection document counts and indexes:
   - `users`
   - `businesses`
   - `memberships`
   - `products`
   - `parties`
   - `invoices`
   - `stockmovements`
   - `paymentrecords`
   - `auditlogs`
4. Re-run integration tests against `vyora_restore_test` to confirm integrity.
