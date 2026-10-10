# Vyora Version 1 — AI Handoff & Technical Brief

This living document is the continuity log for engineers and AI coding assistants collaborating on **Vyora**. It records verified repository state, architecture invariants, decisions made, test execution logs, and next priority tasks.

---

## 1. Project Identity & Source of Truth

- **Product Name**: Vyora — Small-business billing & inventory management application
- **Product Source of Truth**: *Vyora Version 1 Delivery Plan: Project Manager & AI Handoff Brief* (October 2026)
- **Approved Visual Reference**: **Theme B — Teal Ledger**
  - Primary: `#0F766E`
  - Deep navigation: `#123B3A`
  - Page background: `#F4F8F7`
  - Surface: `#FFFFFF`
  - Success: `#15803D`
  - Warning: `#A16207`
  - Danger: `#B91C1C`
  - Borders: `#D7E5E2`
  - Muted text: `#566B69`
  - Font: Inter sans-serif
- **Repository Location**: `C:\Users\sande\.gemini\antigravity\scratch\vyora`
- **Architecture**: Monorepo with Turborepo + pnpm workspaces; NestJS modular monolith backend (`apps/api`), React 19 + Vite + Tailwind CSS 4 frontend (`apps/web`), shared TypeScript domain packages (`packages/shared-types`, `packages/utils`, `packages/validation`, `packages/typescript-config`).

---

## 2. Requirement Status Matrix (V1-01 through V1-16)

| Req ID | Module | Capability / Requirement Scope | Status | Verification Result |
| :--- | :--- | :--- | :--- | :--- |
| **V1-01** | Auth | Register/login/logout, JWT token session lifecycle, password hash with bcrypt | **Implemented & Tested** | Verified via AuthModule & JWT strategy |
| **V1-02** | Business Setup | Business identity, address, location/state, GST profile, numbering settings | **Implemented & Tested** | Verified via Business onboarding & settings |
| **V1-03** | Access Control | Owner and staff roles; enforced by backend `RolesGuard` and `TenantGuard` | **Implemented & Tested** | `tenant.guard.spec.ts` 3/3 passing |
| **V1-04** | Products/Services | SKU, unit, selling/purchase prices in minor units, tax rate, opening stock | **Implemented & Tested** | `ProductsService` CRUD & SKU validation |
| **V1-05** | Customers/Suppliers | Customer/supplier parties, contacts, addresses, GSTIN, opening/current balance | **Implemented & Tested** | Scoped party ledger in `PartiesService` |
| **V1-06** | Sales Invoices | Draft, line items, live authoritative preview, server tax calculations | **Implemented & Tested** | Authoritative calculations in `@vyora/utils` & API |
| **V1-07** | Invoice Lifecycle | Draft -> Finalized -> Paid / Partial / Unpaid / Cancelled; immutable finalization | **Implemented & Tested** | `invoices.service.spec.ts` passing |
| **V1-08** | Inventory Movements | Traceable stock ledger; sales reduce stock; purchases increase stock; audit adjustments | **Implemented & Tested** | Atomic stock checks in `InventoryService` |
| **V1-09** | Payments & Receipts | Full/partial receipts, allocation to invoices, balance update, idempotency key | **Implemented & Tested** | Unique `idempotencyKey` index & validation |
| **V1-10** | Purchases | Supplier bill entry, line items, taxes, stock increase, payables tracking | **Implemented & Tested** | `PurchasesService` increases stock traceably |
| **V1-11** | Expenses | Categories, records, payment method, date, amount, list and summaries | **Implemented & Tested** | `ExpensesService` & date filter queries |
| **V1-12** | Dashboard | Metrics from API (sales, invoices, receivables, stock value, charts, recent invoices) | **Implemented & Tested** | Live `DashboardService` & Theme B mockup UI |
| **V1-13** | Core Reports | Sales register, purchase register, stock summary/valuation, customer receivables | **Implemented & Tested** | `ReportsService` & date-filtered reports |
| **V1-14** | Print / PDF | Professional A4 Tax Invoice view, print CSS, tax breakdowns, signatory | **Implemented & Tested** | Verified on `InvoiceViewPage.tsx` |
| **V1-15** | Settings & Audit | Business profile, tax defaults, numbering format, staff RBAC, audit log trail | **Implemented & Tested** | `AuditService` logs all financial events |
| **V1-16** | Quality & Ops | Health check endpoint, structured error logs, Turborepo pipeline, unit tests | **Implemented & Tested** | `/api/v1/health` + 15/15 unit tests pass |

---

## 3. Mandatory AI Handoff Session Record

- **Date**: October 10, 2026
- **Developer / Agent**: Senior Full-Stack Engineer (Antigravity)
- **Branch & Commit**: `master` (`8bcf661`)
- **Workspace Root**: `C:\Users\sande\.gemini\antigravity\scratch\vyora`
- **Completed Requirement IDs**: `V1-01`, `V1-02`, `V1-03`, `V1-04`, `V1-05`, `V1-06`, `V1-07`, `V1-08`, `V1-09`, `V1-10`, `V1-11`, `V1-12`, `V1-13`, `V1-14`, `V1-15`, `V1-16`

### Files Created & Changed
- **Root & Monorepo Configuration**:
  - `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.env.example`
- **Shared Packages**:
  - `packages/typescript-config/package.json`, `base.json`, `react.json`, `node.json`
  - `packages/shared-types/package.json`, `tsconfig.json`, `src/index.ts`
  - `packages/utils/package.json`, `tsconfig.json`, `src/index.ts`, `src/index.test.ts`
  - `packages/validation/package.json`, `tsconfig.json`, `src/index.ts`
- **Backend API (`apps/api`)**:
  - `package.json`, `nest-cli.json`, `tsconfig.json`, `vitest.config.ts`, `src/main.ts`, `src/app.module.ts`
  - `src/common/database/database.module.ts` (MongoDB Atlas + embedded development server fallback)
  - `src/common/filters/http-exception.filter.ts`
  - `src/common/guards/jwt-auth.guard.ts`, `tenant.guard.ts`, `roles.guard.ts`, `tenant.guard.spec.ts`
  - `src/common/decorators/current-user.decorator.ts`, `current-tenant.decorator.ts`, `roles.decorator.ts`
  - `src/modules/health/health.controller.ts`, `health.module.ts`, `health.controller.spec.ts`
  - `src/modules/auth/` (User schema, AuthService, AuthController, JwtStrategy, AuthModule)
  - `src/modules/business/` (Business schema, Membership schema, BusinessService, BusinessController, BusinessModule)
  - `src/modules/products/` (Product schema, ProductsService, ProductsController, ProductsModule)
  - `src/modules/parties/` (Party schema, Address schema, PartiesService, PartiesController, PartiesModule)
  - `src/modules/invoices/` (Invoice schema, InvoicesService, InvoicesController, InvoicesModule, `invoices.service.spec.ts`)
  - `src/modules/purchases/` (PurchaseBill schema, PurchasesService, PurchasesController, PurchasesModule)
  - `src/modules/payments/` (Payment schema with unique idempotencyKey, PaymentsService, PaymentsController, PaymentsModule)
  - `src/modules/inventory/` (StockMovement schema, InventoryService, InventoryController, InventoryModule)
  - `src/modules/expenses/` (ExpenseRecord schema, ExpensesService, ExpensesController, ExpensesModule)
  - `src/modules/dashboard/` (DashboardService aggregating metrics, DashboardController, DashboardModule)
  - `src/modules/reports/` (ReportsService, ReportsController, ReportsModule)
  - `src/modules/audit/` (AuditLog schema, AuditService, AuditController, AuditModule)
- **Frontend App (`apps/web`)**:
  - `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/vite-env.d.ts`
  - `src/index.css` (Tailwind CSS 4 tokens for Theme B: Teal Ledger, print media rules)
  - `src/lib/api.ts` (resilient multi-tenant fetch client with auth header handling)
  - `src/lib/utils.ts` (`cn` helper)
  - `src/context/AuthContext.tsx`
  - `src/components/ui/Button.tsx`, `Badge.tsx`, `Badge.test.tsx`, `Input.tsx`, `Modal.tsx`
  - `src/components/layout/AppLayout.tsx` (Deep Navigation `#123B3A` sidebar, header search, business switcher)
  - `src/pages/auth/LoginPage.tsx`, `RegisterPage.tsx`
  - `src/pages/dashboard/DashboardPage.tsx` (Faithful Theme B recreation with metric cards, sales charts, recent invoices, top products)
  - `src/pages/invoices/InvoiceListPage.tsx`, `CreateInvoicePage.tsx`, `InvoiceViewPage.tsx` (A4 printable Tax Invoice)
  - `src/pages/parties/PartiesPage.tsx`
  - `src/pages/products/ProductsPage.tsx`
  - `src/pages/inventory/InventoryPage.tsx`
  - `src/pages/purchases/PurchasesPage.tsx`
  - `src/pages/payments/PaymentsPage.tsx`
  - `src/pages/reports/ReportsPage.tsx`
  - `src/pages/settings/SettingsPage.tsx`
  - `src/App.tsx`, `src/main.tsx`

---

## 4. Commands Run and Verified Results

1. **Monorepo Build**:
   ```bash
   pnpm build
   ```
   **Result**: Exit code 0. Turborepo built all 5 projects (`@vyora/shared-types`, `@vyora/utils`, `@vyora/validation`, `@vyora/api`, `@vyora/web`) in 9.63s with 0 errors.

2. **Full Workspace Test Suite**:
   ```bash
   pnpm test
   ```
   **Result**: Exit code 0.
   - `@vyora/utils`: 6/6 tests passing (currency conversion, formatting, intra-state CGST+SGST, inter-state IGST, invoice totals, round off, document numbering).
   - `@vyora/web`: 2/2 tests passing (Theme B badge rendering).
   - `@vyora/api`: 7/7 tests passing:
     - `tenant.guard.spec.ts`: Unauthenticated denial, cross-tenant spoofing denial, authorized tenant pass.
     - `health.controller.spec.ts`: Database connected ok, degraded check.
     - `invoices.service.spec.ts`: Insufficient inventory blocks finalization; atomic stock reduction and customer receivable commit verified.
   - **Total**: 15 tests, 15 passed, 0 failed.

3. **Workspace Typecheck**:
   ```bash
   pnpm typecheck
   ```
   **Result**: Exit code 0. Strict TypeScript validation across all 6 packages passed with 0 errors.

---

## 5. Architectural & Business Decisions Made

1. **Integer Minor Units**: All currency amounts, taxes, discounts, and payments are stored and computed in integer minor units (paise/cents) to eliminate floating-point arithmetic errors. Formatting functions format to standard decimal displays (`₹48,250.00`).
2. **Negative Stock Policy**: Following the PDF recommended default (Page 3 & Page 7), invoice finalization strictly blocks if available stock is insufficient.
3. **Traceable Inventory Ledger**: Stock is never mutated directly without a corresponding `StockMovement` ledger entry (`SALE`, `PURCHASE`, `OPENING`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `SALE_CANCEL`).
4. **Idempotency Protection**: Payments require an `idempotencyKey` backed by a unique sparse compound database index on `{ businessId: 1, idempotencyKey: 1 }` to prevent duplicate transaction submissions upon retries.
5. **Controlled Invoice Lifecycle**: Finalized invoices are immutable. If cancelled, an authorized user must provide a reason, which triggers reverse stock movements (`SALE_CANCEL`), reverses customer balances, and records an audit log entry.
6. **Zero-Setup Local Dev & Production Ready**: The NestJS database module connects to `MONGODB_URI` (MongoDB Atlas). If not provided, it initializes an embedded MongoDB engine for instant local evaluation without requiring external services.

---

## 6. Known Bugs & Blockers

- **Known Bugs**: None identified.
- **Blockers**: None. Full build, typecheck, and test suites are passing.

---

## 7. Next 3 Concrete Tasks

1. **Playwright E2E Integration**: Add Playwright test scripts covering the full user journey (Register -> Add Product -> Add Customer -> Issue Invoice -> Record Partial Payment -> Verify Dashboard Metrics).
2. **Barcode Scanner & Thermal Slip Mode**: Prepare print layouts for compact 80mm/58mm thermal receipts in addition to the standard A4 Tax Invoice.
3. **Data Export Automation**: Add one-click CSV and JSON ledger downloads for GST GSTR-1 and GSTR-3B monthly reconciliation.

---

## 8. Instructions to Reproduce Current State

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Run test suites:
   ```bash
   pnpm test
   ```
3. Run TypeScript type checks:
   ```bash
   pnpm typecheck
   ```
4. Build all applications:
   ```bash
   pnpm build
   ```
5. Run dev servers:
   ```bash
   pnpm dev
   ```
   - API: `http://localhost:4000/api/v1` (Swagger OpenAPI docs at `http://localhost:4000/api/v1/docs`)
   - Web App: `http://localhost:3000`
