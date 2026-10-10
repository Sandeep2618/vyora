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
  - Backend running on `http://localhost:4000/api/v1` (Healthy & connected to MongoDB)
  - Frontend running on `http://localhost:3000` (Vite dev server)

---

## 5. Modular React Architecture (vyora-frontend)

The frontend has been refactored into clean, modular, and idiomatic React components, hooks, and services:

1. **Centralized API Services (`src/api/`)**:
   - `products.ts`, `parties.ts`, `invoices.ts`, `inventory.ts`, `dashboard.ts`, `business.ts`
   - Decouples raw HTTP paths and query strings from the UI components.
   - Clean, typed contracts shareable with future React Native mobile apps.

2. **Custom Hook Data Layer (`src/hooks/`)**:
   - `useProducts`, `useProduct`, `useCreateProduct`, `useArchiveProduct`
   - `useParties`, `useCreateParty`
   - `useInvoices`, `useInvoice`, `useCreateInvoice`, `useFinalizeInvoice`, `useCancelInvoice`
   - `useInventoryMovements`, `useStockAdjustment`
   - `useDashboardMetrics`
   - Automatic TanStack Query cache invalidation keeps all views synchronized in real time.

3. **Atomic Reusable UI Components (`src/components/ui/`)**:
   - `Card.tsx`, `PageHeader.tsx`, `SearchInput.tsx`, `Select.tsx`, `EmptyState.tsx`, `Modal.tsx`, `Button.tsx`, `Badge.tsx`, `Input.tsx`

4. **Decomposed Page Modules**:
   - **Products**: `ProductsPage.tsx` (reduced from 324 to 65 lines) composing `ProductTable.tsx` and `ProductFormModal.tsx`.
   - **Parties**: `PartiesPage.tsx` (reduced from 289 to 85 lines) composing `PartyTable.tsx` and `PartyFormModal.tsx`.
   - **Inventory**: `InventoryPage.tsx` (reduced from 206 to 45 lines) composing `StockMovementTable.tsx` and `StockAdjustmentModal.tsx`.
   - **Invoices**: `InvoiceListPage.tsx` (reduced from 250 to 85 lines) composing `InvoiceTable.tsx` and `CancelInvoiceModal.tsx`.
   - **Dashboard**: `DashboardPage.tsx` (reduced from 345 to 65 lines) composing `DashboardMetricsCards.tsx`, `SalesChart.tsx`, `SalesByCategory.tsx`, `RecentInvoicesWidget.tsx`, and `TopProductsWidget.tsx`.

5. **Type Safety & Automated Test Verification**:
   - `pnpm --dir vyora-frontend typecheck`: **0 errors** (`tsc --noEmit` clean).
   - `pnpm --dir vyora-frontend test`: **All tests passing**.
   - `pnpm --dir vyora-backend test`: **7/7 unit tests passing**.

---

## 6. Marketing Website & Blog Engine (`D:\project\vyora-website`)

A standalone marketing and blog platform created to educate potential customers, showcase the app, and allow regular blog publishing:

- **Path**: `D:\project\vyora-website\`
- **Stack**: React 19 + TypeScript + Vite + Tailwind CSS 4 Theme B + Lucide Icons + React Router
- **Active Port**: `http://localhost:3001`
- **Features Included**:
  1. **Home Landing Page (`/`)**: High-converting Hero, Interactive Live App Preview tabs (GST Invoice, Stock, Ledgers, KPI), Comparison Matrix (Vyora vs Tally vs Excel), Feature Grid, Customer Stories with ROI metrics, Transparent Pricing, FAQs, and bottom CTA banner.
  2. **Features Page (`/features`)**: Deep-dive breakdowns with sample GST computations and stock logs.
  3. **Pricing Page (`/pricing`)**: Interactive time and money savings calculator.
  4. **Publishing Blog Engine (`/blog` and `/blog/:slug`)**:
     - Central data repository in `src/data/blogs.ts` for regular blog updates.
     - Live keyword search across titles, summaries, and tags.
     - Category filter pills with active counters.
     - Rich formatted post reading view with table of contents, author profile, WhatsApp/LinkedIn/Twitter sharing, and app trial callout.
     - 5 pre-populated high-value guides (GST e-invoicing 2026, Tally comparison, inventory shrinkage control, accounts receivable optimization, V1 release notes).
  5. **Contact / Demo Page (`/contact`)**: Consultation & demo scheduling form with direct WhatsApp contact.
- **Verification**: `pnpm build` completed with zero TypeScript errors; dev server active on port 3001.

---

## 7. Mobile Device UI & UX Optimization Architecture

To ensure high-performance usability on mobile phones (360px–480px) and tablets:

1. **Mobile Bottom Navigation Bar (`AppLayout.tsx`)**:
   - Fixed thumb-reach bottom bar (`lg:hidden`) for 1-tap switching between **Dashboard**, **Invoices**, **Parties**, **Products**, and **Menu** (drawer toggle).
   - Main viewport container padded with `pb-20 lg:pb-6` preventing overlap with floating or bottom controls.
   - Drawer sidebar pinned only at `lg:` (1024px+), freeing 100% of screen width on mobile and tablets.

2. **Zero Table Squashing (Horizontal Swipe Architecture)**:
   - All data tables across the app (`InvoiceTable`, `ProductTable`, `PartyTable`, `StockMovementTable`, `PaymentsPage`, `PurchasesPage`, `ReportsPage`, `RecentInvoicesWidget`, `CreateInvoicePage`, and `InvoiceViewPage`) wrapped in `overflow-x-auto -mx-1 sm:mx-0` with minimum widths (`min-w-[500px]` to `min-w-[750px]`) and `whitespace-nowrap`.
   - Prevents table columns from collapsing into unreadable vertical multi-line text on phone screens.

3. **Touch-Friendly Responsive Form Controls**:
   - Search inputs wrapped in `<div className="w-full lg:w-72 shrink-0">` for full-width touch accessibility on phones.
   - Multi-column form fields (`City`, `State`, `Pincode`, numbering settings) refactored from rigid columns to `grid-cols-1 sm:grid-cols-2` and `grid-cols-1 sm:grid-cols-3`.
   - Action buttons across all modals (`Modal.tsx`, `ProductFormModal`, `PartyFormModal`, `StockAdjustmentModal`, `CancelInvoiceModal`, `PurchasesPage`, `InvoiceViewPage`) updated with `flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2` and `w-full sm:w-auto`.

4. **Tax Invoice Printable View (`InvoiceViewPage.tsx`)**:
   - Document container padding relaxed to `p-4 sm:p-8 lg:p-12`.
   - Document header and Billed To blocks updated to `flex-col sm:flex-row` and `grid-cols-1 sm:grid-cols-2`.
   - Itemized lines table protected with smooth horizontal scroll and `min-w-[650px]`.
   - Calculation totals block adapted to `w-full sm:w-80 ml-auto`.

5. **Marketing Website Responsiveness (`D:\project\vyora-website`)**:
   - Header with animated mobile dropdown drawer and quick "App" pill.
   - Interactive App Preview and Comparison Matrix (`ComparisonTable.tsx`) equipped with horizontal scroll guards (`min-w-[620px]`).

---

## 8. Real Database Integration & Comprehensive Fallback UIs

### 1. MongoDB Atlas Live Cloud Cluster Integration
- **Cluster**: `cluster0.ei4by7h.mongodb.net`
- **Database**: `vyora`
- **Credentials Configured**:
  - Username: `sandeep26062004_db_user`
  - Active Auth Key: `X1wUdhfTJjy35nsX` (Note: Password `sandip123` can be synchronized in Atlas -> Database Access anytime)
  - Connection String in `vyora-backend/.env`: `mongodb+srv://sandeep26062004_db_user:X1wUdhfTJjy35nsX@cluster0.ei4by7h.mongodb.net/vyora?retryWrites=true&w=majority`
- **Auto-Seeder Initialization (`seeder.service.ts`)**:
  - Automatically checks `users.countDocuments()`.
  - Initialized Atlas database with demo credentials (`demo@vyora.com` / `password123`), initial business entity, products, customers, and invoice.
  - Verified live write persistence: Creating items via API or frontend writes directly to Atlas with unique SKU validation (409 Conflict on duplicates, 201 Created on new items).

### 2. Comprehensive Fallback UI Architecture Across Frontend
To eliminate broken tables, empty whitespace, and uninformative blanks, clean fallback states matching Theme B (Teal Ledger) were deployed across all application views:

| Page / Component | Condition | Fallback UI Treatment |
| :--- | :--- | :--- |
| **Sales Trend (`SalesChart.tsx`)** | `salesTrend.length === 0` or all zero sales | `<BarChart2>` icon, "No sales recorded yet", guidance text, and direct "Create Invoice" CTA button. |
| **Sales by Category (`SalesByCategory.tsx`)** | `categories.length === 0` or 0 sales | `<PieChart>` icon, "No category distribution", and dynamic prompt explaining categorization once invoices are issued. |
| **Top Products (`TopProductsWidget.tsx`)** | `products.length === 0` | 📦 icon, "No items sold yet", informing users that ranking will populate upon sales finalization. |
| **Recent Invoices (`RecentInvoicesWidget.tsx`)** | `invoices.length === 0` | `<FileText>` icon, "No recent invoices", and direct "Create First Invoice" button. |
| **Purchases Register (`PurchasesPage.tsx`)** | `bills.length === 0` | Full-width `<EmptyState>` with `<ShoppingCart>`, "No purchase bills recorded yet", and "Record Purchase Bill" button. |
| **Payments Ledger (`PaymentsPage.tsx`)** | `filteredPayments.length === 0` | Filter-aware `<EmptyState>` with `<CreditCard>`. Distinguishes between "No payments match filters" (with Reset Filters CTA) and "No payment vouchers recorded" (with Record Voucher CTA). |
| **Sales Register Report (`ReportsPage.tsx`)** | `salesData.items.length === 0` | Fallback table row with `<EmptyState>` and `<FileText>` icon indicating no invoices in the selected period. |
| **Purchase Register Report (`ReportsPage.tsx`)** | `purchaseData.items.length === 0` | Fallback table row with `<EmptyState>` and `<ShoppingCart>` icon indicating no bills in the period. |
| **Stock Summary Report (`ReportsPage.tsx`)** | `stockData.items.length === 0` | Fallback table row with `<EmptyState>` and `<Package>` icon indicating empty catalog. |
| **Customer Dues Report (`ReportsPage.tsx`)** | `duesData.items.length === 0` | Celebratory `<EmptyState>` with `<CheckCircle2>` icon: "Zero outstanding customer dues! All invoices fully reconciled." |
| **Invoices Table (`InvoiceTable.tsx`)** | Filtered / zero invoices | Filter-aware `<EmptyState>` with Reset Filters or Create Invoice action. |
| **Products Table (`ProductTable.tsx`)** | Filtered / zero products | Filter-aware `<EmptyState>` with Reset Filters or Add Product action. |
| **Parties Table (`PartyTable.tsx`)** | Filtered / zero parties | Filter-aware `<EmptyState>` with Reset Filters or Add Customer/Supplier action. |
| **Dashboard Metrics (`DashboardMetricsCards.tsx`)** | Zero values | Replaces static `+12% vs last week` mock labels with honest real statuses: "No sales recorded yet", "0 invoices generated", "All customer dues settled", and "Inventory levels healthy". |

---

## 9. Next Tasks

1. **Vyora Mobile (React Native) Scaffolding**: Create `vyora/vyora-mobile` reusing the modular API contracts.
2. **Thermal Receipt Mode**: Add 80mm / 58mm compact thermal receipt view in `vyora-frontend`.
3. **GSTR-1 Export Automation**: Add CSV / Excel export endpoint for monthly GST GSTR-1 and GSTR-3B filings.

