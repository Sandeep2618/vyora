# Vyora Version 1 — AI Handoff & Technical Brief

This living document is the continuity log for engineers and AI coding assistants collaborating on **Vyora**. It records verified repository state, architecture invariants, decisions made, test execution logs, and next priority tasks.

---

## 1. Project Identity & Architecture Evolution

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
- **Folder Structure**:
  - Direct root junction: `C:\Users\sande\vyora\` (and `C:\Users\sande\.gemini\antigravity\scratch\vyora\`)
  - **Backend API**: `vyora/vyora-backend` (Standalone NestJS + MongoDB modular monolith)
  - **Frontend Web App**: `vyora/vyora-frontend` (Standalone React 19 + Vite + Tailwind CSS 4)
  - **Future Mobile App**: Prepared for `vyora/vyora-mobile` (React Native / Expo) consuming `vyora-backend` REST endpoints.

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
| **V1-16** | Quality & Ops | Health check endpoint, structured error logs, unit tests, auto-seeding | **Implemented & Tested** | `/api/v1/health` + 9/9 unit tests pass |

---

## 3. Investigation & Resolution: 500 Internal Server Errors

### Exact Root Cause Found
In the frontend's [`AuthContext.tsx`](file:///C:/Users/sande/vyora/vyora-frontend/src/context/AuthContext.tsx), after login it called:
```typescript
const b = await api.get('/business/current');
localStorage.setItem('vyora_business_id', b.id);
```
However, the backend's `BusinessService.getBusinessById` returned the raw Mongoose document which only contained `_id` and did not map `id`. In JavaScript, `b.id` evaluated to `undefined`. When saving to localStorage, the browser stringified `undefined` into the literal string `"undefined"`.

On every subsequent request (such as `/inventory/movements`, `/products`, `/parties`, `/invoices` in the DevTools Network panel):
1. `api.ts` saw `businessId = "undefined"` (a truthy non-empty string) and attached `x-business-id: "undefined"`.
2. `TenantGuard` received the string `"undefined"`, bypassed its emptiness check, and executed:
   ```typescript
   this.businessModel.findOne({ _id: "undefined" })
   ```
3. Mongoose threw a fatal query error:
   ```
   CastError: Cast to ObjectId failed for value "undefined" (type string) at path "_id" for model "Business"
   ```
4. NestJS's `AllExceptionsFilter` caught the unhandled `CastError` and returned **HTTP 500 Internal Server Error** on every request.

### Fixes Implemented
1. **Explicit DTO Mapping in `BusinessService`**:
   `getBusinessById` now maps both `id: business._id.toString()` and `_id: business._id.toString()`.
2. **Robust Sanitization in `TenantGuard`**:
   `TenantGuard` strips any literal `"undefined"`, `"null"`, or non-ObjectId values and safely falls back to auto-discovering the user's business from database memberships.
3. **Frontend Storage Sanitization in `api.ts` and `AuthContext.tsx`**:
   `api.ts` explicitly verifies `businessId !== 'undefined' && businessId !== 'null'` before setting `x-business-id`. Any invalid string in `localStorage` is automatically purged.

---

## 4. Commands Run and Verified Results

- **Automated Probe with Bad Header**:
  Sending `x-business-id: "undefined"` now succeeds with `200 OK` (auto-healing the active business instead of throwing a 500 error).
- **All Endpoints Verified Live**:
  - `GET /api/v1/business/current`: Returns `Business ID: 6aca2919f9333bcaaa1f29b2`
  - `GET /api/v1/invoices`: Returns `total: 1` (200 OK)
  - `GET /api/v1/parties?type=CUSTOMER`: Returns `total: 1` (200 OK)
  - `GET /api/v1/products`: Returns `total: 4` (200 OK)
  - `GET /api/v1/inventory/movements`: Returns `total: 6` (200 OK)
- **Active Processes**:
  - Backend running on `http://localhost:4000/api/v1`
  - Frontend running on `http://localhost:3000`

---

## 5. Next Tasks

1. **Vyora Mobile (React Native) Scaffolding**: Create `vyora/vyora-mobile` connecting to `vyora-backend`.
2. **Thermal Receipt Mode**: Add 80mm / 58mm compact thermal receipt view in `vyora-frontend`.
3. **GSTR-1 Export Automation**: Add CSV / Excel export endpoint for monthly GST GSTR-1 and GSTR-3B filings.
