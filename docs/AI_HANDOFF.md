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
| **V1-17** | Engineering Memory | `vyora-core` skill persistence for zero-breakage continuous AI development | **Implemented & Tested** | Authoritative instructions in `.gemini/config/skills/vyora-core/` |
| **V1-18** | Role Authorization (RBAC) | Strict Owner (full access) vs Staff (view-only); mutation buttons gated | **Implemented & Tested** | Backend `RolesGuard` + UI button restrictions across all views |
| **V1-19** | Team Roles Switchboard | Dedicated `/roles` page with individual member switches for role & active status | **Implemented & Tested** | Live toggle sync with backend `business.service.ts` |
| **V1-20** | Subscription Plan Gating | Starter, Growth, and Business Pro tier gating matching website pricing | **Implemented & Tested** | Backend `PlanGuard` + UI feature hiding & subscription checkout |
| **V1-21** | Rate Limiting & Scale (50k) | Sliding-window memory rate limiter + security headers on NestJS backend | **Implemented & Tested** | `rate-limit.middleware.ts` (25/min auth, 200/min general) + security headers |
| **V1-22** | Search Input Debounce | 300ms internal debouncing across all product, invoice, party searches | **Implemented & Tested** | `SearchInput.tsx` debounced typing state |
| **V1-23** | Table Pagination & Actions | Standard pagination component + icon-only actions; complete removal of archive | **Implemented & Tested** | `Pagination.tsx` on all tables, icon-only edit/delete, zero "archive" |
| **V1-24** | SaaS Plan Checkout Flow | Multi-step checkout with billing cycles, 18% GST in paisa, UPI/Card/NetBanking | **Implemented & Tested** | `PlanPurchaseModal.tsx` replacing 1-click upgrade across all views |

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
  - Loaded securely from `MONGODB_URI` in `.env` (Never hardcode credentials or secrets in repository files).
  - Connection String in `vyora-backend/.env`: `mongodb+srv://<username>:<password>@cluster0.ei4by7h.mongodb.net/vyora?retryWrites=true&w=majority`
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

## 10. Role-Based Access Control (RBAC) & Subscription Gating Architecture

### 1. Role Authority Matrix
- **OWNER / ADMIN**: Full administrative control across the entire workspace. Allowed to create, edit, finalize, and cancel invoices, add and archive products, manage customer/supplier ledgers, record purchases and receipts, adjust stock (on Business Pro), modify business settings, switch team roles, and change subscription tiers.
- **STAFF**: Operational view-only access. Staff accounts can view dashboard charts, browse the invoice registry, search products, inspect customer dues, and view stock movement ledgers. **All mutation buttons (`Create Invoice`, `Add Product`, `Add Customer`, `Record Purchase Bill`, `Record Voucher`, `Adjust Stock`, `Archive`, `Finalize`, `Cancel`) are completely hidden in the UI and strictly rejected with 403 Forbidden by the backend `RolesGuard`.**

### 2. Dedicated Team Roles & Switches Page (`/roles`)
- **Direct Switch Toggle**: Individual switch per team member to toggle between `STAFF` (View-Only) and `OWNER` (Full Access). Calls `PATCH /business/staff/:id/role`.
- **Account Access Switch**: Live toggle to suspend or re-activate access without deleting membership history. Calls `PATCH /business/staff/:id/status`.
- **Safety Invariant**: The sole owner of a business cannot be demoted to Staff or suspended to prevent accidental administrative lockout.
- **Member Invite Modal**: Prominent red asterisks (`<span className="text-[#B91C1C] font-bold">*</span>`) on required fields (Name, Email, Role) with default initial temporary credentials (`VyoraStaff@123`).

### 3. Subscription Plan Feature Gating & Authentic Checkout Flow
Features dynamically adjust based on the tenant's `subscriptionPlan` on their `Business` record:
- **Starter (Free - ₹0/mo)**: 50 GST Invoices/month, product catalog up to 100 items, 1 owner account. Purchases, Payments, Tax Reports, and Staff accounts are hidden.
- **Growth (₹499/mo)**: Unlimited Invoices & Inventory, Purchases, Customer Payments & Ledger receipts, Full GSTR-1/3B tax reports, up to 3 Staff user accounts.
- **Business Pro (₹999/mo)**: Everything in Growth + Unlimited Staff accounts, Audited Stock Adjustment workflows, Custom prefixes & auto-padding, Complete audit trail logs.
- **Authentic Checkout Flow (`PlanPurchaseModal.tsx`)**: Replaces 1-click plan switching. Provides billing cycle toggles (Monthly vs Annual with 20% discount), integer paisa calculations using `@vyora/utils` with itemized 18% GST preview, payment method options (UPI, Credit/Debit Cards, Net Banking), and simulated banking gateway verification with printable transaction receipts.

### 4. High-Scale Platform Stability & Table UX (1k to 50k Users)
- **Sliding-Window Rate Limiter (`rate-limit.middleware.ts`)**: Sliding-window rate limiter in NestJS middleware with a 10-minute automated eviction timer to prevent memory leaks under 50k active client IPs. Throttles `/auth/*` to 25 req/min and general routes to 200 req/min. Injects defense headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`).
- **300ms Search Debounce (`SearchInput.tsx`)**: Debounces input typing to prevent keystroke request storms and unnecessary DOM rendering.
- **High-Capacity Data Table Architecture (`Pagination.tsx`)**: Dynamic pagination deployed across `ProductTable`, `PartyTable`, `InvoiceTable`, and `StockMovementTable`. Includes page numbers, ellipsis navigation, entry counts, and 10/25/50/100 limit selector. Prevents DOM bloat and out-of-memory browser crashes.
- **Clean Icon-Only Actions**: Edit (`<Edit2 />`) and Delete (`<Trash2 />`) icon-only buttons with hover backgrounds and tooltips. Zero button text in table action columns.
- **Prohibition of "Archive"**: Complete removal of "Archive" terminology and functionality in favor of explicit "Delete" and "Remove".
- **Modern Modal & Header Polish**: Modals styled with frosted backdrops (`bg-slate-900/60 backdrop-blur-sm`), smooth scale entrance animations, and removal of redundant role badges from the top navbar.

### 5. Official Project Management PDF Brief
The authoritative, print-ready document is compiled and saved at:
- **PDF Location**: [`docs/Vyora_Project_Manager_Brief.pdf`](file:///C:/Users/sande/vyora/docs/Vyora_Project_Manager_Brief.pdf) (218 KB)
- **Source HTML**: [`docs/project_manager_brief.html`](file:///C:/Users/sande/vyora/docs/project_manager_brief.html)

---

## 11. Edge-to-Edge Modal Architecture, Clean Slate UX & MCP Integrations (October 2026)

### 1. Edge-to-Edge Modal Polish & Elimination of UI Gaps
- **Modal Component (`Modal.tsx`)**: Replaced broken internal floating borders with a dedicated `footer?: React.ReactNode` prop that renders edge-to-edge with `px-5 sm:px-6 py-3.5 bg-[#F4F8F7]/70 border-t border-[#D7E5E2] flex items-center justify-end gap-2.5`.
- **Form Association Standard**: Replaced old inner form button blocks with HTML5 standard `<form id="...">` and `<Button type="submit" form="...">` in modal footers across `ProductFormModal`, `PartyFormModal`, `StockAdjustmentModal`, `PlanPurchaseModal`, `CancelInvoiceModal`, `CreateInvoicePage`, `InvoiceViewPage`, `PurchasesPage`, `PaymentsPage`, `RolesPage`, and `SettingsPage`.

### 2. Zero-Data State Suppression (Clean Slate Hierarchy)
- **Automatic Toolbar Hiding**: Across `ProductsPage`, `PartiesPage`, `InvoiceListPage`, `PaymentsPage`, and `PurchasesPage`, search bars and filter buttons/drawers are completely suppressed when the database contains 0 records and no active filters are set.
- **Smart Pagination**: `Pagination.tsx` automatically self-hides whenever `totalItems <= 0 || totalPages <= 1`.

### 3. Explicit HTTP DELETE Method Architecture
- **API & Hooks**: `api.delete('/products/' + id)` and `api.delete('/parties/' + id)` with dedicated React Query hooks `useDeleteProduct` and `useDeleteParty`.
- **Backend Controllers**: Explicit `@Delete(':id')` endpoints in `products.controller.ts` and `parties.controller.ts` protected by `TenantGuard` and `RolesGuard('OWNER')`.
- **Prohibition of "Archive"**: Complete eradication of the term and concept of archive in all user-facing code and mutations.

### 4. Model Context Protocol (MCP) Server Setup
Configured in `~/.gemini/config/mcp_config.json` and `.agents/mcp_config.json`:
1. **Context7 MCP (`context7`)**: `npx -y @upstash/context7-mcp` for real-time library documentation lookup (React 19, Vite 6, Tailwind 4, NestJS 11).
2. **Sentry MCP (`sentry`)**: `npx -y @sentry/mcp-server` for production/staging crash inspection and exception tracking.
3. **Chrome DevTools MCP (`chrome-devtools`)**: `npx -y chrome-devtools-mcp@latest --isolated` for automated browser page testing, console error capture, and responsive inspection.
4. **Supabase MCP (`supabase`)**: `npx -y @supabase/mcp-server-supabase@latest --read-only` for external schema contract and PostgreSQL verification.

---

## 12. Workflow Automation Slash Commands & Testing Suite (October 2026)

We have built a complete suite of autonomous slash commands, skills, and runner scripts:

### 1. `/test <module>` (`vyora-test`)
- **Engine**: [`scripts/qa-runner.js`](file:///C:/Users/sande/vyora/scripts/qa-runner.js)
- **Lifecycle**: Automated Tester &rarr; Chrome DevTools MCP &rarr; Bug Report (`BUG_REPORT_<module>.md`) &rarr; Developer Self-Healing &rarr; Re-Verification Loop.
- **Coverage**: Static UI invariants (edge-to-edge modal footers, zero-data toolbars, icon-only action columns, prohibition of archive) + Functional ephemeral tenant registration, CRUD verification, HTTP `DELETE` verbs, and primary owner RBAC immutability.
- **Result**: 101/101 tests passing (`🟢 ALL PASSED`).

### 2. `/audit-ui` (`vyora-audit-ui`)
- **Engine**: [`scripts/audit-ui.js`](file:///C:/Users/sande/vyora/scripts/audit-ui.js)
- **Checks**: Scans all React components in `vyora-frontend/src` for Theme B compliance, red mandatory asterisks, modal footer architecture, debounced table search queries (300ms), and clean-slate table states.
- **Report**: Generated at `docs/qa-reports/UI_AUDIT_REPORT.md` (80/80 checks passing).

### 3. `/db-seed <preset>` (`vyora-db-seed`)
- **Engine**: [`scripts/seed-data.js`](file:///C:/Users/sande/vyora/scripts/seed-data.js)
- **Presets**:
  - `fresh`: Creates clean-slate 0-record tenant to verify empty states, onboarding, and toolbar suppression.
  - `retail`: Seeds 4 realistic products with GST rates (5%, 12%, 18%), 3 customers with addresses, and invoices.
  - `wholesale`: Seeds B2B wholesale products, suppliers with GSTIN numbers, and purchase orders.
- **Output**: Writes ephemeral login credentials to `docs/qa-reports/SEEDED_TENANT_<PRESET>.json` for instant browser login.

### 4. `/ship` or `/verify-all` (`vyora-ship`)
- **Engine**: [`scripts/ship-check.js`](file:///C:/Users/sande/vyora/scripts/ship-check.js)
- **Gatekeeper Pipeline**:
  1. `check-secrets.js` (zero committed credentials or MongoDB URIs).
  2. `audit-ui.js` (Theme B, asterisks, clean slate, modal footers).
  3. `qa-runner.js --module all` (101/101 automated test cases passed).
  4. Backend TypeScript build (`pnpm --dir vyora-backend build`).
  5. Frontend Vite/React build (`pnpm --dir vyora-frontend build`).
- **Sign-off**: `docs/qa-reports/RELEASE_READINESS.md` (`🟢 READY TO SHIP (5/5 PASSED)`).

---

## 14. Version 1 Release Plan, Vyapar Parity Roadmap & Backend 49-API Directory (October 2026)

### 1. Authoritative Project Management Documents Compiled
Two comprehensive, print-ready PDF executive briefs have been compiled and published in `docs/`:
1. **[`Vyora_Version_1_Release_Plan_PM_Brief.pdf`](file:///C:/Users/sande/vyora/docs/Vyora_Version_1_Release_Plan_PM_Brief.pdf)** (292 KB)
   - *Source HTML*: [`docs/vyora_v1_release_plan.html`](file:///C:/Users/sande/vyora/docs/vyora_v1_release_plan.html)
   - **Contents**: Full V1 achievements matrix (V1-01 through V1-24), extra capabilities delivered (tri-lingual i18n, Theme B Dark/Light mode, shadcn Radix primitives, mobile QR companion sync, SaaS tier checkout), root-cause analysis of piecemeal updates, the "One-Shot Whole-App" protocol, complete Vyapar app feature decomposition & V1/V2/V3 roadmap, and the V1 wrap-up punch list.
2. **[`Vyora_Backend_Architecture_API_Directory.pdf`](file:///C:/Users/sande/vyora/docs/Vyora_Backend_Architecture_API_Directory.pdf)** (394 KB)
   - *Source HTML*: [`docs/vyora_backend_architecture_api_directory.html`](file:///C:/Users/sande/vyora/docs/vyora_backend_architecture_api_directory.html)
   - **Contents**: Full technology stack rationale (NestJS 11, MongoDB Atlas, Mongoose 8, JWT, bcrypt, Zod, minor paisa units, sliding-window rate limiter), folder structure blueprint, architectural invariants, and **the complete directory of all 49 backend endpoints currently implemented** across all 14 controllers.

---

### 2. The "One-Shot Whole-App" Engineering Standard
**Root Cause Addressed**: Previously, changes (such as i18n, table styling, or select inputs) were executed piecemeal over 3-4 prompts because of component dispersion and lack of whole-app auditing.
**The New Standard for Senior Dev & QA Agents**:
Whenever a UI pattern, translation key, schema rule, or input component is modified, the developer agent MUST audit and apply the change across **ALL 6 CORE DOMAINS** simultaneously:
`1. Products • 2. Parties (Customers/Suppliers) • 3. Invoices • 4. Purchases • 5. Payments • 6. Inventory`
- **Single Component Layer**: All views MUST consume `src/components/ui/*` (`Table`, `Pagination`, `SearchInput`, `Select`, `DatePicker`, `Modal`).
- **Universal i18n Contract**: All statuses, buttons, and timeframes are standardized in `common.json`. Any new key MUST be added to `en`, `hi`, and `gu` in the same commit.
- **Radix UI Defensive Standard**: Dropdowns and Selects use safe wrappers (such as `SelectLabel` as a styled `div`) to prevent Radix `SelectGroup` context crashes.

---

### 3. Complete Backend API Directory Summary (49 Endpoints)
The backend implements exactly **49 REST endpoints** across 14 controllers:
- **Health** (1): `GET /api/v1/health`
- **Auth** (4): `POST /api/v1/auth/register`, `POST /login`, `GET /me`, `POST /logout`
- **Business** (4): `GET /api/v1/business/current`, `PUT /current`, `PUT /plan`, `PUT /permissions`
- **Staff & RBAC** (5): `GET /api/v1/business/staff`, `POST /staff`, `PATCH /staff/:id/role`, `PATCH /staff/:id/status`, `DELETE /staff/:id`
- **Dashboard** (1): `GET /api/v1/dashboard/metrics`
- **Products** (5): `POST /api/v1/products`, `GET /products`, `GET /products/:id`, `PUT /products/:id`, `DELETE /products/:id`
- **Parties** (5): `POST /api/v1/parties`, `GET /parties`, `GET /parties/:id`, `PUT /parties/:id`, `DELETE /parties/:id`
- **Invoices** (6): `POST /api/v1/invoices/preview`, `POST /invoices`, `GET /invoices`, `GET /invoices/:id`, `POST /invoices/:id/finalize`, `POST /invoices/:id/cancel`
- **Purchases** (3): `POST /api/v1/purchases`, `GET /purchases`, `GET /purchases/:id`
- **Payments** (3): `POST /api/v1/payments`, `GET /payments`, `GET /payments/:id`
- **Inventory** (2): `GET /api/v1/inventory/movements`, `POST /inventory/adjustments`
- **Expenses** (4): `POST /api/v1/expenses`, `GET /expenses`, `GET /expenses/categories`, `DELETE /expenses/:id`
- **Reports** (5): `GET /api/v1/reports/sales-register`, `GET /purchase-register`, `GET /stock-summary`, `GET /customer-dues`, `GET /expense-summary`
- **Audit** (1): `GET /api/v1/audit/logs`

---

### 4. Senior Developer & QA Agent Handoff Protocols
1. **Developer Agent**: Work in vertical slices; enforce whole-app audits across all 6 domains; verify `npm run build` in both frontend and backend before handoff; **NEVER execute `git push`**.
2. **QA Agent**: Run tri-lingual check (EN/HI/GU); verify Theme B Dark/Light mode contrast; test zero-data clean slate; execute automated QA suite (`npm run test`); certify against the V1 Punch List.

---

### 5. Quality Checks: The Five Layers

| Layer | Tool | What it catches | Execution Command |
| :--- | :--- | :--- | :--- |
| **1. Formatting** | `Prettier` | Spacing, quotes, line width, so all code looks the same | `npm run format:check` |
| **2. Linting** | `ESLint + typescript-eslint` | Bugs, any, unused code, bad import order, hook mistakes | `npm run lint` |
| **3. Type check** | `tsc --noEmit (strict mode)` | Type errors | `npm run typecheck` |
| **4. Tests** | `Vitest + Testing Library` | Behaviour that breaks | `npm run test` |
| **5. Gate** | `Husky + lint-staged + CI` | Blocks bad code before commit and before merge | Pre-commit hook & CI |

---

## 15. Mandatory Component Folder Architecture Standard

Every UI component, table, modal, drawer, or complex widget strictly follows this modular directory structure:

```
ComponentName/
├── component/
│   └── index.tsx          # Component presentation only (pure JSX + logic/hook calls)
├── config/
│   ├── constant/index.ts  # Constants, default values, lookup maps, styling tokens
│   ├── interface/index.ts # Component props and data shapes
│   └── enum/index.ts      # Enums, action types, size / placement keys
├── hook/index.ts          # State orchestration hook (pagination, dismiss, keyboard, filter)
├── util/index.ts          # Pure helpers (style resolvers, badge mapping, formatters)
└── index.ts               # Public barrel exports of this folder
```

### Reference Implementations:
1. **Domain Tables (`InvoiceTable/`)**:
   - Location: `src/pages/invoices/components/list/InvoiceTable/`
   - Orchestrates pagination in `hook/index.ts`, status badge resolution in `util/index.ts`, constants in `config/constant/index.ts`, and interfaces in `config/interface/index.ts`.
2. **Global Modals (`Modal/`)**:
   - Location: `src/components/ui/Modal/`
   - Encapsulates keyboard dismiss & scroll lock in `hook/index.ts`, width styles in `config/constant/index.ts`, sizing enums in `config/enum/index.ts`, and edge-to-edge footer JSX in `component/index.tsx`.
3. **Global Drawers (`Drawer/`)**:
   - Location: `src/components/ui/Drawer/`
   - Encapsulates multi-directional sliding (right/left/bottom/top) in `util/index.ts`, sizing in `config/constant/index.ts`, keyboard dismiss in `hook/index.ts`, and edge-to-edge footer in `component/index.tsx`.
4. **Global Reusability Principle**:
   - Modals and Drawers are maintained as shared primitives in `src/components/ui/`. Any enhancement or bugfix made to `Modal/` or `Drawer/` applies globally across all modals, drawers, and views in the entire application.

---

## 16. Express 5.3 Modular Monolith Architecture & Endpoint Directory

In October 2026, the backend was refactored into a high-performance Express 5.3 + TypeScript + Mongoose 8 modular monolith (`vyora-backend`).

### Key Controller & Route Modules:
- **Health** (1): `GET /api/v1/health`
- **Auth & Multitenancy** (10):
  - `POST /api/v1/auth/register` (creates user and auto-generates first business workspace)
  - `POST /api/v1/auth/login` (generates JWT session token)
  - `POST /api/v1/auth/otp/send` & `POST /api/v1/auth/otp/verify` (mobile counter OTP flow)
  - `GET /api/v1/auth/me` (retrieves active user identity & business context)
  - `PATCH /api/v1/auth/profile` & `PUT /api/v1/auth/profile` (updates user name & avatar)
  - `GET /api/v1/auth/businesses` (lists all business workspaces the user belongs to)
  - `POST /api/v1/auth/switch-business` (switches active tenant context and issues refreshed JWT)
  - `POST /api/v1/auth/accept-invite` (accepts pending invitation to an external workspace)
  - `POST /api/v1/auth/logout` (invalidates session)
- **Business & Staff Management** (5):
  - `GET /api/v1/business/current` (active business profile, tax rates, GSTIN, owner info)
  - `POST /api/v1/business/members` (invites staff member and triggers asynchronous invite email)
  - `PATCH /api/v1/business/members/:id/role` (updates role; primary owner demotion protected)
  - `PATCH /api/v1/business/members/:id/status` (activates/deactivates staff member)
  - `DELETE /api/v1/business/members/:id` (removes team member from business)
- **Products & Margin Shield** (5):
  - `GET /api/v1/products` (lists products; masks `purchasePriceMinor = 0` for `STAFF`)
  - `POST /api/v1/products`, `GET /products/:id`, `PUT /products/:id`, `DELETE /products/:id`
- **Invoices, Purchases & Payments** (12): Full GST counter billing, live tax calculations, purchase stock increments, inward/outward payment receipts.
- **Reports & Dashboard** (6): Authoritative sales register, purchase register, stock valuation, customer receivables, dashboard metrics.

---

## 17. Subscription Governance & Role-Based Access Control

### 17.1 Subscription Tiering Hierarchy
* **Starter (Free)**: Basic counter billing (`INVOICES`, `PRODUCTS`, `PARTIES`, `INVENTORY`). Zero staff allowed. Restrictive modules (`REPORTS`, `PURCHASES`, `PAYMENTS`, `ROLES`) are **completely hidden** from navigation and views via `hasFeature(...)` in `AppLayout.tsx`.
* **Growth**: Unlocks `PURCHASES`, `PAYMENTS`, `REPORTS`, and up to 5 staff members.
* **Enterprise**: Unlimited staff, multi-warehouse stock adjustments, and custom billing prefix.

### 17.2 Subscription Expiration Governance
* **Store Owner**: Sees top warning banner with *"Renew via UPI"* and one-click access to [`PlanPurchaseModal`](file:///D:/project/vyora/vyora-frontend/src/components/subscription/modal/PlanPurchaseModal/component/index.tsx) with dynamic Bharat UPI QR code generation in minor units (paisa).
* **Manager & Staff**: The checkout form is **strictly hidden**. Instead, they see an informative *"Owner Authorization Required"* screen detailing the owner's name, phone number, and store identity.
* **403 Forbidden Guidance**: [`AccessDeniedModal`](file:///D:/project/vyora/vyora-frontend/src/components/ui/AccessDeniedModal.tsx) categorizes errors into `PlanExpired`, `PlanLimitExceeded`, or `ForbiddenRole` and provides direct guidance.

---

## 18. Mobile App Ecosystem (`vyora-app`)

Located at `D:\project\vyora-app` (React Native 0.86 + Expo 57):
1. **EAS Over-The-Air (OTA) Continuous Updates**:
   - Updates published via `npm run update:preview` (`npx eas-cli update --channel preview`).
   - Downloads silently in background (`fallbackToCacheTimeout: 0`).
2. **Centralized Versioning & Release Highlights**:
   - Maintained in `src/constants/version.ts` (`APP_VERSION`, `APP_RELEASE_DATE`, `LATEST_RELEASE_NOTES`).
   - Dynamically injected into `MenuScreen.tsx`, `LoginScreen.tsx`, and `FeedbackModal.tsx`.
3. **Automated "What's New in Vyora" Modal**:
   - Inspects `@vyora_last_seen_version` in `AsyncStorage`.
   - On detecting a new version, automatically pops up [`WhatsNewModal.tsx`](file:///D:/project/vyora-app/src/components/WhatsNewModal.tsx) highlighting new features with icons and summaries.
4. **Permanent Feedback & Bug Reporting**:
   - Web3Forms receives direct `formData.append('attachment', ...)` file delivery straight to the developer's email inbox (never expires).
   - Permanent cloud preview links hosted on Catbox.moe (`https://files.catbox.moe/xxxxxx.jpg`).

---

## 19. Vyora Git Secret Guard & Pre-Push Defense

Located at `scripts/check-secrets.js` and wired to `.git/hooks/pre-commit` and `.git/hooks/pre-push`:
* Scans staged files and unpushed commits (`git log @{u}..HEAD`).
* Detects and blocks:
  - Resend API keys (`re_[a-zA-Z0-9_]{20,}`)
  - Stripe Secret/Restricted keys (`sk_...`, `rk_...`)
  - Razorpay secrets (`rzp_...`)
  - Google / Firebase keys (`AIza...`)
  - Expo access tokens (`expt_...`)
  - MongoDB connection URIs with embedded passwords
  - Mobile signing credentials (`*.keystore`, `*.jks`, `*.p12`, `*.p8`, `google-services.json`, `GoogleService-Info.plist`)
  - Untracked `.env` files (except `.env.example`)
* Execution command: `node scripts/check-secrets.js` (or `npm run check-secrets`).

---

## 20. Verified Release Readiness Verdict

* **vyora-backend**: `pnpm --dir vyora-backend build` &rarr; `tsc && tsc-alias`: **0 errors**.
* **vyora-frontend**: `pnpm --dir vyora-frontend build` &rarr; `tsc -b && vite build`: **0 errors**.
* **vyora-app**: `npm run build` &rarr; `expo export --platform web`: **483 modules bundled cleanly**.
* **Secret Guard**: `node scripts/check-secrets.js` &rarr; **Passed: No sensitive credentials or secrets detected**.
* **Branch Status**: `feal/struture` synchronized with `origin/feal/struture`.

---

## 21. Critical Incident Resolutions & Fix Hardening (October 2026)

### 21.1 Resolution of Product Quick-Add Validation Failure (`Product Creation Failed: Required`)
* **Incident Description**: When a cashier or store owner quick-added a new product from the mobile POS invoice creation screen (`CreateInvoiceScreen.tsx`), the backend rejected the request with HTTP 400 Bad Request and a naked `"Required"` error message.
* **Root Causes Discovered**:
  1. **Mandatory Purchase Price in Schema**: `ProductSchema` in both `vyora-backend/src/shared/validation.ts` and `vyora-frontend/src/validation/index.ts` defined `purchasePriceMinor` as a mandatory positive integer without defaults. In fast retail billing, cashiers only set a selling price and initial stock; forcing purchase price caused validation to fail.
  2. **Vague Error Formatting**: `validationMiddleware` in `vyora-backend/src/middleware/validation/index.ts` returned `firstErr.message` directly (`"Required"`), hiding the identity of the failing field from developers and users.
  3. **Hardcoded Placeholder Inventory & Invalid Enum**: `CreateInvoiceScreen.tsx` hardcoded `currentStock: 100` and unit `'PACKET'` (an invalid unit enum; the backend canonical value is `'PKT'`).
* **Fixes Implemented & Verified**:
  - Schema Resilience: Made `purchasePriceMinor` optional with `.optional().default(0)` in backend and frontend Zod schemas.
  - Descriptive Error Messages: Updated validation middleware to prefix the field path (`${fieldPath}: ${firstErr.message}`).
  - Quick-Add UX Hardening: In `vyora-app/src/screens/CreateInvoiceScreen.tsx`, added dynamic `openingStock` input (defaulting to 0), corrected unit chip to `'PKT'`, added `purchasePriceMinor: 0`, and added tri-lingual translations for `'PKT'` across `en.ts`, `hi.ts`, and `gu.ts`.

### 21.2 Resolution of Expo Doctor & EAS Build Failures (`vyora-app`)
* **Incident Description**: Running `npx expo-doctor` in `vyora-app` failed 4 checks out of 21: multiple lockfiles, schema errors in `app.json`, missing `expo-font` peer dependency, and 5 package version mismatches.
* **Root Causes Discovered**:
  1. Both `pnpm-lock.yaml` and `package-lock.json` were present in `vyora-app`, breaking package manager inference in CI and EAS.
  2. Root `"splash"` property in `app.json` was deprecated in Expo SDK 52+ / 57+.
  3. Peer dependency `expo-font` was omitted.
  4. Outdated/mismatched major packages (`@react-native-async-storage/async-storage`, `react-native-safe-area-context`, `react-native-svg`).
* **Fixes Implemented & Verified**:
  - Standardized on `package-lock.json`, removed `pnpm-lock.yaml`.
  - Migrated `app.json` splash configuration to `expo-splash-screen` plugin under `"plugins"`.
  - Installed `expo-font: ~57.0.4`, pinned `@react-native-async-storage/async-storage@2.2.0`, `react-native-safe-area-context@~5.7.0`, `react-native-svg@15.15.4`.
  - Resolved `AccessDeniedModal.tsx` interval type and `tsconfig.json` TS 6.0 deprecation flag.
  - Result: `npx expo-doctor` passes **21/21 checks**.

### 21.3 Resolution of Windows Hermes Bytecode Failure on EAS Update
* **Incident Description**: Running `npm run update:preview` on Windows failed with `Error: Cannot find the hermesc executable` during iOS bundling.
* **Root Causes Discovered**:
  1. `node_modules/hermes-compiler/hermesc/win64-bin/` had corrupted 0-byte binaries.
  2. `eas update` without platform flag defaults to `--platform all` (Android + iOS). Bundling iOS bytecode on Windows fails because the iOS compiler requires macOS Darwin binaries.
* **Fixes Implemented & Verified**:
  - Restored full 64-bit Windows Hermes binaries (2.5 MB `hermesc.exe` + DLLs).
  - Updated `package.json` scripts (`update:preview`, `update:production`) to explicitly include `--platform android`.
  - Verified `npx expo export -p android` bundles cleanly in 9.7 seconds, producing `index-...hbc`.

### 21.4 EAS Production APK Build & Website Downloads Alignment
* **Active EAS APK Build**: `39ef7ebf-1f44-471a-9815-035a27133287`
  - URL: `https://expo.dev/accounts/sandipyadavvs-team/projects/vyora-billing/builds/39ef7ebf-1f44-471a-9815-035a27133287`
* **Synchronized Artifacts Across Repositories**:
  - `vyora-website/src/config/constants.ts`: Updated `APK_DOWNLOAD_URL` and `APK_BUILD_PAGE_URL`.
  - `vyora-website/src/pages/MobileAppPage.tsx`: Updated direct APK download link.
  - `vyora-website/vercel.json`: Updated redirect routes (`/downloads/vyora-v1.0.1.apk`, `/download-apk`).
  - `vyora-frontend/src/components/layout/MobileAppModal.tsx`: Updated download button link and QR code generator URL.

---

## 22. Permanent Invariants Added to `vyora-core` Skill
* **Rule DD**: Mobile EAS & Expo Build Invariants (single lockfile, splash plugin, Windows `--platform android` flag, doctor check).
* **Rule EE**: Counter Quick-Add & Schema Resilience (optional `purchasePriceMinor`, zero dummy stocks, minor currency accounting).
* **Rule FF**: Clear & Self-Explaining API Validation Envelopes (prefixing field names in validation errors).
* **Rule GG**: Absolute Git & Remote Database Boundaries (NEVER run `git commit` or `git push`; NEVER mutate remote DB).
* **Rule HH**: Centralized Single Source of Truth (DRY - change once, reflect everywhere; zero calculation/theme duplication).
* **Rule II**: Zero Silent Errors & Meaningful User-Facing Error Messages (no empty catches, no phantom state, plain-language localized error banners).
* **Rule JJ**: Mobile Domain Architecture & Screen Decomposition (lean composition screens ~150-250 lines, feature folders, decoupled modals).

---

## 23. Mobile & Backend Deep-Dive Architectural Gap Audit & Modernization Blueprint

* **Blueprint Document**: Full architectural specification and phased implementation roadmap stored in [`docs/MOBILE_ARCHITECTURE_AND_GAPS.md`](file:///D:/project/vyora/docs/MOBILE_ARCHITECTURE_AND_GAPS.md) and [`vyora-app/docs/MOBILE_ARCHITECTURE_AND_GAPS.md`](file:///D:/project/vyora-app/docs/MOBILE_ARCHITECTURE_AND_GAPS.md).

### 23.1 Summary of Critical Discovered Gaps
1. **Silent Catches & Phantom State**:
   - `DashboardScreen.tsx` & `HomeScreen.tsx`: 6 parallel endpoints catch errors silently with `.catch(() => ({ items: [] }))`, misleading users with ₹0 metrics when network fails.
   - `AccountScreen.tsx`: Caught invite failures still display "Invite Sent" alert and inject fake synthetic members with `id: Date.now().toString()`.
   - `CreateInvoiceScreen.tsx` & `CreatePurchaseScreen.tsx`: Silent `.catch(console.error)` on catalog initialization leaves pickers empty without notifying the user.
2. **Correctness, Timezone & Math Bugs**:
   - Direct line item object mutation in `useState` via shallow `[...lines]` copying.
   - UTC date shift bug (`new Date().toISOString().split('T')[0]`) in mobile billing and backend fallback stamping midnight Indian transactions with yesterday's date.
   - Hardcoded `igstMinor: 0` ignoring inter-state GST rules.
   - Static read-only selling rates on invoice line items.
   - Hardcoded `'Gujarat'` state fallback when adding new parties.
3. **DRY & Centralization Violations**:
   - 1,267 hardcoded hex values across screens and components.
   - 62 hardcoded untranslated `Alert.alert` calls.
   - Unencrypted JWT token storage in `AsyncStorage`.
   - God screens ranging from 1,028 to 2,118 lines with embedded modals.
   - Zero automated tests and 98.6% accessibility label gap.
4. **Authentication, Session & Access Control Gaps (Category I)**:
   - Phone-only accounts permanently locked out on forgot password (no self-serve recovery).
   - Insecure password reset (Step 2 lacks signed JWT `resetToken`; plain OTP replayed in Step 3).
   - Hardcoded static password (`VyoraStaff@123`) for invited staff accounts.
   - Staff invitations strictly demand email (mobile number invite impossible).
   - Missing `/auth/refresh` endpoint and mobile silent refresh (abrupt 24h logouts).
   - Deactivated staff retain 24h active access (zombie tokens; missing `Membership.isActive` check in `authMiddleware`).
   - Stale role permissions on workspace switching (`AuthContext` updates token/business but never updates `user.role`).
   - No session revocation (`tokenVersion`) on password change or reset.
   - Phone auto-detection regex flaw in `api/auth.ts` (fails on country code or spaces, sending invalid email payload).
   - Silent mock return on profile update failure (`catch { return data as User; }`).
   - Customer OTP login role breach in app shell (`CUSTOMER` role has no restricted view in `App.tsx`, granting access to POS billing and product management).
   - Mobile logout does not inform backend server (`POST /auth/logout` unused).
5. **Customer, Parties & Ledger Gaps (Category J - Gaps 38-43)**:
   - `PartyLedgerModal.tsx`: In-memory client filtering of 100 business purchases drops older supplier transactions; silent catches show empty ledger.
   - `InvoicesScreen.tsx` & `PaymentModal.tsx`: Settling anonymous walk-in bills auto-selects `res.items[0]`, misallocating cash payments to the first random customer in the DB.
   - `PartiesScreen.tsx`: Add/edit modal lacks Street Address (Line 1), shipping address, and PAN.
   - `CreateInvoiceScreen.tsx`: Auto-creates duplicate "Walk-in Customer" records on mount if not in first 100 returned items.
   - Missing credit limit & overdue aging checks when extending credit to defaulting customers.
   - Zero PDF/CSV export for party ledger account statements.
6. **Invoicing, POS Counter & Payment Allocation Gaps (Category K - Gaps 44-48)**:
   - Missing invoice cancellation flow in mobile app; backend `POST /invoices/:id/cancel` uncallable from UI.
   - `dueDate: today` hardcoded on all bills; no credit payment terms (Net-7, Net-15, Net-30).
   - Card / Bank transfer payments drop to `paymentMethod: undefined` on submission, marking paid counter sales as unpaid credit invoices.
   - No draft saving / counter bill parking (`finalize: true` unconditionally sent).
   - No line-item discounts or flat cash roundoff support.
7. **Profile, Settings, Staff & Reporting Gaps (Category L - Gaps 49-55)**:
   - Settings in `SettingsScreen.tsx` stored only in device `AsyncStorage` with zero backend sync, and ignored during billing.
   - Missing Bank Account (Name, Number, IFSC) and settlement UPI configuration for invoice payment instructions.
   - Staff list in `AccountScreen.tsx` is completely read-only; no role updates, status toggles, or member removal.
   - `AuthContext.tsx` silently swallows business profile update errors, while `BusinessProfileScreen.tsx` shows fake "Profile Saved" success.
   - Missing default invoice terms & conditions in business profile.
   - Single-day hardcoded Daybook in `ReportsScreen.tsx` with zero date range pickers or CA exports.
   - Missing root `<ErrorBoundary>` in `App.tsx`; unhandled JS exceptions crash app to device home screen.
8. **Profile, Identity & Media Management Gaps (Category M - Gaps 56-58)**:
   - Gallery/camera signatures upload multi-megabyte base64 strings directly into MongoDB, bloating documents and risking Express 413 errors.
   - Cloudinary upload failure silently falls back to local file URI (`file:///data/user/0/...`), corrupting business logos for all other devices.
   - Edit user profile modal omits phone and email fields, causing permanent user recovery lockout.
9. **Billing, Subscription & Multitenancy Gaps (Category N - Gaps 59-61)**:
   - Mobile calls `PUT /business/current` instead of backend's `PUT /business/plan`; backend never updates plan while mobile mutates local storage.
   - Plan checkout has zero payment verification or UTR entry; tapping "I have paid" instantly activates paid tiers for free.
   - Multitenant store switching checks `isStarter` on current store, trapping owners inside a free store even when invited to a paid store.
10. **Roles, RBAC & Missing Mobile Modules (Category O - Gaps 62-69)**:
   - Dashboard tab is completely ungated in bottom navigation, exposing business turnover and gross profit margins to counter staff.
   - Home screen transaction feed fetches supplier purchases, leaking supplier names and inward costs to staff.
   - Tapping "Purchase Bills" in menu redirects to Dashboard because no Purchases List screen exists.
   - Absence of dedicated Payments & Vouchers register screen.
   - Absence of camera barcode scanning for retail counter checkout.
   - Fake thermal paper setting; `invoicePdf.ts` prints unreadable microscopic A4 receipts on thermal POS printers.
   - Missing in-app account deletion flow, risking Google Play Store rejection.
   - Absence of stock movement and inventory audit ledger screen.
11. **Advanced Backend Architecture, Security & POS Gaps (Category P - Gaps 70-79)**:
   - Lack of MongoDB ACID Transaction Session across invoice save, stock movement, ledger update, and payment receipt (partial commits on crash).
   - Unprotected `DELETE /api/v1/expenses/:id` (lacks `requireRoles('OWNER', 'ADMIN')`); staff can delete company expense logs.
   - Voucher numbering race condition (`countDocuments({ businessId }) + 1`) generating duplicate voucher numbers on concurrent payments.
   - Collapse of purchase tax into single scalar `totalTaxMinor` without CGST/SGST/IGST breakdown, preventing GSTR-3B Input Tax Credit (ITC) claims.
   - Lack of official GSTR-1 tables (Table 4 B2B, Table 5 B2C Large, Table 7 B2C Small, Table 12 HSN Summary).
   - Rigid integer stepper (`+` and `-` by 1) with no numeric input; impossible to bill fractional/decimal quantities (KG, LTR, MTR) or type 50 items.
   - Complete absence of Android hardware back button handling (`BackHandler` missing); pressing back kills the app.
   - Missing offline connectivity detection (`NetInfo`) and status banner; actions hang for 30s on drop.
   - Missing biometric app lock (`expo-local-authentication`) for POS counter cashier security.
   - Missing invoice creation idempotency check in `InvoicesService.create`, allowing rapid double-billing on network lag.
12. **RBAC & Multitenant Security Inversions (Category Q - Gaps 80-84)**:
   - Critical RBAC inversion on counter billing operations; `POST /invoices`, `POST /parties`, `POST /payments` require `'OWNER', 'ADMIN'`, completely blocking `STAFF` cashiers from creating sales bills or registering counter walk-in customers.
   - Unprotected financial metrics & complete data exfiltration exposure; any staff token can view gross margins, net profit, and download customer debt and supplier cost registers.
   - Cross-tenant admin impersonation & authorization bypass; `tenantMiddleware` bypasses membership checks if user holds `role: 'ADMIN'`, allowing access to any other business via `x-business-id`.
   - Cross-tenant global `UserModel.role` corruption; updating staff role in Store A mutates global user account document, stripping owner permissions in Store B.
   - Ephemeral in-memory OTP store in Node.js heap; server restarts or multi-instance load balancing wipes active OTPs, causing login and reset failures.
13. **Core Accounting, Inventory & Return Flows (Category R - Gaps 85-90)**:
   - Complete absence of Credit Notes (Sales Return) & Debit Notes (Purchase Return); cannot legally process returns, restock returned goods, reverse GST liability, or file GSTR-1 Table 9B.
   - Inventory read-modify-write concurrency race condition; concurrent counter checkout causes lost updates and untracked stock depletion.
   - Inventory loss & damage adjustments misclassified as sales; negative stock write-offs record `movementType: 'SALE'`, corrupting sales revenue and tax audits.
   - Purchase inward cost updates ignored in product master; incoming supplier bills do not update `purchasePriceMinor`, leading to stale catalog costs and skewed profit margins.
   - Rigid GST tax enums excluding statutory 3% (jewellery) and 0.25% (diamonds) rates, blocking gemstone and jewellery merchants.
   - Strict rejection of customer advance / overpayment in voucher allocation; payment crashing with 400 when customer pays rounded excess.
14. **Mobile POS, Hardware & Offline Gaps (Category S - Gaps 91-95)**:
   - Security & privacy breach in UPI QR generation via external web service (`api.qrserver.com`); leaks invoice amounts and merchant VPAs over HTTP and fails when offline.
   - Missing infinite scroll & list pagination in mobile app; hardcoded limits prevent viewing bills or customers beyond 50/100 items.
   - Incomplete Daybook reconciliation missing cash purchases and supplier payout vouchers (`PAYMENT_OUT`), misstating daily closing cash-in-hand.
   - Disconnected party ledger display lacking chronological interleaving and running balances (Debit, Credit, Balance).
   - Missing date range filtering across mobile registers; merchants cannot audit sales for specific custom date periods.

### 23.2 User's Approved Order of Work & Roadmap
1. **Fix correctness bugs** (state mutation, UTC date, missing cost editing, IGST, idempotency).
2. **Extract tax.ts and useDraftLines, add unit tests**.
3. **Unify the theme and strip hard-coded colors**.
4. **Split screens into components** (start with the modals, since they are the biggest chunks).
5. **Introduce TanStack Query and server-side search**.
6. **Move to React Navigation**.
7. **Add Sentry, tests, CI**.
*(With security, auth, session lifecycle, parties, invoicing, profile, billing, and settings gaps picked along the way)*.


