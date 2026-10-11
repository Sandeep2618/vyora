---
name: vyora-core
description: >-
  Essential architecture, design standards, database rules, and coding flow for the Vyora billing and inventory platform.
  Activate this skill whenever any AI agent is asked to write, modify, debug, refactor, or test code in vyora-backend,
  vyora-frontend, or the upcoming vyora-mobile project.
---

# Vyora Core Engineering & Memory Skill

This skill defines the authoritative architectural blueprints, coding conventions, domain invariants, and operational memory for **Vyora**. Every AI pair programmer must follow these instructions strictly to ensure continuous, zero-breakage feature development.

---

## 1. Project Overview & Memory Context

- **Product**: Vyora — Multi-tenant small business billing, GST invoicing, and inventory management application.
- **Root Directory**: `C:\Users\sande\vyora\`
- **Decoupled Architecture**:
  1. [`vyora-backend`](file:///C:/Users/sande/vyora/vyora-backend): Standalone modular monolith in NestJS 11 + Mongoose 8.
  2. [`vyora-frontend`](file:///C:/Users/sande/vyora/vyora-frontend): Standalone React 19 + Vite 6 + Tailwind CSS 4 web app.
  3. [`vyora-website`](file:///D:/project/vyora-website): Independent public marketing website & SEO blog at `D:\project\vyora-website`.
  4. `vyora-mobile`: Upcoming React Native / Expo application consuming `vyora-backend` REST endpoints.
- **Active Ports**:
  - Backend API: `http://localhost:4000/api/v1` (Swagger docs: `/api/v1/docs`)
  - Frontend App: `http://localhost:3000`
  - Marketing Website: `http://localhost:3001`

---

## 2. Invariant Rules (DO NOT BREAK)

### Rule A: Strict Money Calculation in Minor Units (Paisa)
- **NEVER** store or calculate money in floating-point rupees.
- All monetary fields in schemas, DTOs, and state are integers in **minor units** (1 INR = 100 Paisa):
  - `sellingPriceMinor`, `purchasePriceMinor`, `subtotalMinor`, `taxableMinor`, `cgstMinor`, `sgstMinor`, `igstMinor`, `totalTaxMinor`, `grandTotalMinor`, `dueMinor`, `amountMinor`.
- Use helpers from `@vyora/utils`:
  - `formatCurrency(minorAmount)` &rarr; `₹1,250.00`
  - `minorToMajor(minorAmount)` &rarr; number in rupees
  - `majorToMinor(majorAmount)` &rarr; integer in paisa

### Rule B: Real Database Persistence (MongoDB Atlas)
- The application connects to **MongoDB Atlas cloud cluster** via `MONGODB_URI` environment variable.
- **NEVER** hardcode or log database connection credentials in code, documentation, or git commits. Always load via `process.env.MONGODB_URI` or `ConfigService`.
- **NEVER** introduce static/mock fallback data into services or API controllers. All queries and mutations must hit the database.
- Automatic seeder (`DatabaseSeederService` in `seeder.service.ts`) ensures fresh databases are initialized with demo account `demo@vyora.com` / `password123`.

### Rule C: Mandatory Fallback UI (Empty States)
- Every table, widget, and chart must have a high-quality fallback UI when empty:
  - Table empty states must use `<EmptyState>` with a contextual icon (`Inbox`, `FileText`, `Package`, `ShoppingCart`, `CreditCard`, `BarChart2`, etc.).
  - Distinguish between **no data recorded** (primary CTA: Create/Record) and **no records match filters** (primary CTA: Reset Filters).
  - No blank empty tables or hanging spinners.

### Rule D: Form Controls & Validation
- **Required Fields**: All required input labels must render a prominent red asterisk:
  `<span className="text-[#B91C1C] font-bold">*</span>`
- All client-side forms must validate against Zod schemas from `@vyora/validation`.

### Rule E: Theme B — Teal Ledger Visual Palette
All UI components in `vyora-frontend` and future `vyora-mobile` must use the approved palette:
- Primary: `#0F766E` (Deep Teal)
- Primary Hover / Focused: `#0D665F`
- Dark Accents & Navigation: `#123B3A`
- App Background: `#F4F8F7`
- Card / Panel Surface: `#FFFFFF`
- Light Teal Tint / Badges: `#E6F4F2`
- Borders & Dividers: `#D7E5E2`
- Muted Slate Text: `#566B69`
- Status Colors: Success `#15803D`, Warning `#A16207`, Danger `#B91C1C`

### Rule F: Mobile-First Responsive Design
- The app layout uses a fixed bottom navigation bar (`AppLayout.tsx`) on screens `< 1024px` (`lg:hidden`).
- All data tables must be wrapped in `overflow-x-auto -mx-1 sm:mx-0` with explicit `min-w-[500px]` to `min-w-[750px]` and `whitespace-nowrap` to prevent column squashing on phones.
- Modals must use full-width action buttons on mobile (`flex-col-reverse sm:flex-row`).

### Rule G: Zero Secrets in Commits / Manual Push Only (Strict Git Safety)
- **NEVER** hardcode, log, or commit database connection strings (`mongodb+srv://...`), passwords, private keys, or `.env` files.
- All secrets must remain strictly in local `.env` files, which are permanently ignored in `.gitignore`.
- **Manual Push Only**: AI agents must NEVER execute `git push` automatically. The user pushes code manually after reviewing changes.
- Pre-commit & pre-push hooks (`scripts/check-secrets.js`) strictly block commits/pushes if any credentials or secret files are detected.

### Rule H: High-Concurrency Platform Stability (1,000 to 50,000+ Scale)
- The NestJS backend enforces sliding-window in-memory rate limiting (`rate-limit.middleware.ts`) with a 10-minute periodic sweep to prevent memory leaks under 50k unique client IPs.
- Throttles `/auth/*` routes to 25 req/min (brute-force defense) and general routes to 200 req/min.
- Automatically injects security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`).

### Rule I: Client Search Debouncing
- Every search bar (`<SearchInput>`) MUST enforce an internal 300ms debounce before notifying parent components or triggering queries.
- Prevents keystroke request storms and excessive DOM re-renders under heavy usage.

### Rule J: Data Table Standards, Pagination & Icon-Only Actions
- **Mandatory Pagination**: All tables (`ProductTable`, `PartyTable`, `InvoiceTable`, `StockMovementTable`, etc.) MUST implement `<Pagination>` (10, 25, 50, 100 rows per page). NEVER render unbounded lists into the DOM.
- **Icon-Only Actions**: Action buttons in table rows for Edit and Delete MUST be icon-only (`<Edit2 className="w-4 h-4" />` and `<Trash2 className="w-4 h-4" />`) with subtle rounded hover backgrounds and descriptive `title` / `aria-label` attributes. No button text is allowed in table action columns.
- **Strict Prohibition of "Archive"**: The term and concept of "Archive" is completely forbidden. Any item removal action MUST be explicitly named "Delete" or "Remove".

### Rule K: Subscription Plan Purchase & Checkout Flow
- Paid tiers (`Growth` @ ₹499/mo and `Business Pro` @ ₹999/mo) can NEVER be switched with a 1-click bypass.
- Any upgrade action MUST trigger `<PlanPurchaseModal>` providing:
  - Plan selection & benefits breakdown.
  - Billing cycle toggle (Monthly vs Annual with 20% discount).
  - Minor-unit paisa calculation with itemized 18% GST preview.
  - Payment method options (UPI, Credit/Debit Cards, Net Banking).
  - Simulated banking gateway authorization with printable transaction receipts.

### Rule L: Edge-to-Edge Modal UI Standard
- All modals across the application MUST use the dedicated `footer` prop on `<Modal>` component (`<Modal footer={<>...</>}>`).
- Floating inner divider lines (`border-t`) that stop short of card borders are strictly forbidden. The modal footer renders full-bleed with `bg-[#F4F8F7]/70 border-t border-[#D7E5E2] px-5 sm:px-6 py-3.5` and action buttons aligned to the right.
- Form modals must assign an ID to the form (`<form id="my-form">`) and link submit buttons in the footer via `form="my-form"` for native validation and accessibility.

### Rule M: Zero-Data State Suppression (Clean Slate Hierarchy)
- When a data table has zero records in the database and no active filters are set, search input bars, filter buttons, filter drawers, and pagination controls MUST NOT be displayed.
- The view must render a clean, high-clarity `<EmptyState>` with a contextual icon, title, description, and primary creation CTA button.
- Only show filter bars and pagination when actual data exists (`data.items.length > 0`) OR when active filters are set (with a "Reset Filters" action).

### Rule N: Primary Owner Immutability & RBAC Protection
- Only users with role `OWNER` have permission to create, edit, or delete catalog products, parties, transactions, and manage team roles.
- Staff accounts (`STAFF`) are strictly view-only for records and cannot add, edit, or delete items. Action buttons must be hidden for staff.
- Under NO circumstances can any owner demote or modify the permissions of the primary/original business owner. The backend rejects attempts to demote the primary owner with HTTP 403 Forbidden.

### Rule O: Automated QA, Tester Agent Protocol & MCP Tool Integrations
Antigravity and the dedicated tester agent (`vyora_tester_agent`) utilize 4 configured Model Context Protocol (MCP) servers (`mcp_config.json`):
1. **Chrome DevTools MCP (`chrome-devtools`)**:
   - Executes automated browser sessions to test client views, forms, modals, and responsive states.
   - Detects uncaught JavaScript exceptions, unhandled promise rejections, network failures, and layout regressions.
   - Validates that table search/filter controls hide properly on zero-data state and that delete buttons trigger HTTP `DELETE` requests.
2. **Context7 MCP (`context7`)**:
   - Fetches official, version-accurate documentation for React 19, Vite 6, Tailwind CSS 4, NestJS 11, and Mongoose 8.
   - Prevents AI hallucinations, deprecated lifecycle usages, and obsolete syntax.
3. **Sentry MCP (`sentry`)**:
   - Monitors runtime exception tracking, 500 server errors, and client-side unhandled errors.
   - Validates that API exception filters return structured error envelopes without leaking database credentials or internal stack traces.
4. **Supabase MCP (`supabase`)**:
   - Conducts schema inspection, relational integrity checks, and read-only contract tests against external databases.

---

## 3. Step-by-Step AI Workflow for Any Task

When given a prompt to develop, fix, or expand Vyora, follow this procedure:

1. **Read References**:
   - For architecture & models: [references/architecture.md](./references/architecture.md)
   - For code guidelines: [references/coding-standards.md](./references/coding-standards.md)
   - For historical context: [references/memory-context.md](./references/memory-context.md)
2. **Preserve Decoupling**:
   - If adding an endpoint, implement it cleanly in `vyora-backend/src/modules/<module>`.
   - If adding frontend consumption, add the typed API client method in `vyora-frontend/src/api/<module>.ts` and React Query hook in `vyora-frontend/src/hooks/<hook>.ts`.
3. **Verify Build & Types**:
   - Backend: Run `pnpm --filter vyora-backend build` &rarr; verify 0 errors.
   - Frontend: Run `pnpm --filter vyora-frontend build` &rarr; verify 0 errors.
   - Unit Tests: Run `pnpm -r test` &rarr; verify all tests pass.
   - Run secrets verification: `node scripts/check-secrets.js`.
4. **Run Tester Subagent Verification**:
   - Launch `vyora_tester_agent` to audit end-to-end multi-case functionality and layout integrity.
5. **Update Continuity Brief**:
   - Update `docs/AI_HANDOFF.md` with any new endpoints, schemas, or design changes.
