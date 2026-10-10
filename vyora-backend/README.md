# Vyora Backend (`vyora-backend`)

Vyora Version 1 — Standalone Modular Monolith REST API backend engine for small-business billing, GST compliance, and traceable inventory movements.

Designed as an independent backend service that powers both **Vyora Web** (`vyora-frontend`) and future **Vyora Mobile** (React Native) clients.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
# or: npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=4000
MONGODB_URI=
JWT_SECRET=super_secret_dev_key_change_in_production_vyora_2026_jwt_token
JWT_EXPIRES_IN=7d
```
*(If `MONGODB_URI` is left blank, the backend automatically initializes an embedded MongoDB engine in-memory for instant evaluation without requiring external services).*

### 3. Run in Development
```bash
pnpm dev
# or: npm run dev
```

The API will be available at:
* **API Base**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
* **Interactive Swagger UI**: [http://localhost:4000/api/v1/docs](http://localhost:4000/api/v1/docs)

---

## 🔑 Demo Credentials (Auto-Seeded)
On fresh launch, the database automatically provisions realistic Theme B demo data:
* **Email**: `demo@vyora.com`
* **Password**: `password123`
* **Role**: `OWNER`
* **Business**: `Sharma Retail & Supplies`
* **Included Data**: 4 sample products, 2 parties (Customer & Supplier), 1 finalized invoice (`INV-0001`), and stock ledger entries.

---

## 📱 Future React Native Mobile Integration
This backend exposes standard REST API endpoints documented with OpenAPI/Swagger. A React Native or Expo mobile app can consume these endpoints directly:
1. Call `POST /api/v1/auth/login` to obtain `accessToken`.
2. Attach `Authorization: Bearer <accessToken>` header on all subsequent requests.
3. The backend automatically scopes requests to the user's active business via `TenantGuard`. You can optionally supply `x-business-id: <businessId>` header for explicit multi-business switching.

---

## 🧪 Testing & Verification
```bash
# Run unit tests
pnpm test

# Type check
pnpm typecheck

# Production build
pnpm build
```
