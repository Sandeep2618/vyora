# Vyora — Business Billing & Management Application

**Vyora** is a business billing, inventory management, and financial ledger web application engineered for small and medium businesses. Built as a high-performance modular monolith with strict tenant isolation, server-authoritative calculations, traceable inventory movements, and the approved **Theme B — Teal Ledger** design system.

---

## 🌟 Key Features (Version 1)

- **Authentication & RBAC**: JWT access/refresh token authentication, owner/staff role-based access control, strict backend tenant isolation (`TenantGuard`).
- **Theme B — Teal Ledger**: Deep navigation (`#123B3A`), Teal primary (`#0F766E`), calm background (`#F4F8F7`), clean white surface cards, legible typography with Inter.
- **Authoritative Calculations**: Server-authoritative integer minor-unit math (paise/cents) for all line items, CGST/SGST/IGST tax splits, discounts, and round-offs.
- **Sales Invoices**: Draft & finalization workflows, sequential invoice numbering (`INV-0001`), atomic stock deductions, and professional A4 printable tax invoice.
- **Traceable Inventory**: Chronological movement ledger (`SALE`, `PURCHASE`, `OPENING`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`), mandatory reasons for manual stock adjustments, low-stock threshold badges.
- **Purchases (Supplier Bills)**: Inbound stock replenishment, supplier payable ledger.
- **Payments & Receipts**: Full/partial payment receipts, allocation against invoices, idempotency keys preventing duplicate transactions.
- **Dashboard & Core Reports**: Real-time sales metrics, recent invoices, top products, sales overview trend chart, sales register, purchase register, stock valuation, and customer receivables aging.
- **Audit History**: Structured audit logging capturing actor, timestamp, and entity parameters for all financial events.

---

## 🏗️ Repository Architecture

```text
vyora/
├── apps/
│   ├── api/                     # NestJS modular monolith
│   │   ├── src/
│   │   │   ├── common/          # TenantGuard, JwtAuthGuard, RolesGuard, AllExceptionsFilter, DatabaseModule
│   │   │   └── modules/         # auth, business, products, parties, invoices, purchases, payments, inventory, expenses, dashboard, reports, audit, health
│   └── web/                     # React 19 + TypeScript + Vite + Tailwind CSS 4
│       ├── src/
│       │   ├── components/      # AppLayout, UI Primitives (Button, Input, Badge, Modal)
│       │   ├── context/         # AuthContext
│       │   ├── lib/             # api client, utils
│       │   └── pages/           # auth, dashboard, invoices, parties, products, inventory, purchases, payments, reports, settings
├── packages/
│   ├── shared-types/            # Canonical domain types & interfaces
│   ├── utils/                   # Minor-unit currency math, GST tax calculators, formatters
│   ├── validation/              # Shared Zod validation schemas
│   └── typescript-config/       # Base, node, and react tsconfigs
├── docs/
│   ├── AI_HANDOFF.md            # Living continuity log for developers & AI assistants
│   └── DEPLOYMENT.md            # Production deployment & backup runbook
├── package.json                 # Turborepo & pnpm workspace root
├── pnpm-workspace.yaml
├── turbo.json
└── .env.example
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `^20.0.0` or `^24.0.0`
- pnpm `^10.0.0` or `^12.0.0`

### 1. Installation
```bash
pnpm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: If no `MONGODB_URI` is provided, the API automatically initializes an embedded local development database engine).*

### 3. Run Dev Server
```bash
pnpm dev
```
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **API Monolith**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Interactive Swagger Docs**: [http://localhost:4000/api/v1/docs](http://localhost:4000/api/v1/docs)

### 4. Run Test Suite
```bash
pnpm test
```

### 5. Production Build
```bash
pnpm build
```

---

## 📜 Specifications & AI Continuity

Refer to `docs/AI_HANDOFF.md` for the status matrix, verified test results, and next steps for continuing development.
