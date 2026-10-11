# VYORA PROJECT INSTRUCTIONS & PERMANENT AI MEMORY

> [!IMPORTANT]
> **MANDATORY INSTRUCTION FOR ALL AI AGENTS**:
> You are working on the **Vyora** codebase. You MUST NOT bypass this file or deviate from the established project memory and coding standards. Before proposing or executing any changes, review `.agents/skills/vyora-core/SKILL.md`.

---

## 1. Project Identity & Architecture
- **Product**: Vyora — Small business billing, invoicing, multi-party ledger, and inventory tracking platform.
- **Repository Structure**:
  - `vyora-backend/`: Standalone modular monolith in NestJS 11 + Mongoose 8 + JWT. Runs on port 4000 (`http://localhost:4000/api/v1`).
  - `vyora-frontend/`: Standalone React 19 + Vite 6 + Tailwind CSS 4 web app. Runs on port 3000 (`http://localhost:3000`).
  - `vyora-mobile`: Upcoming React Native / Expo app that will consume the same `vyora-backend` REST API.
  - Public marketing website & blog: Located at `D:\project\vyora-website` running on port 3001.
- **Decoupling Invariant**: Keep `vyora-backend` and `vyora-frontend` completely decoupled in their separate folders. Never mix build pipelines or bundle them together.

---

## 2. Real Cloud Database (MongoDB Atlas)
- **Active Cluster**: `cluster0.ei4by7h.mongodb.net`, Database: `vyora`
- **Configured Connection**: In `vyora-backend/.env` via `MONGODB_URI`.
- **Active User**: `sandeep26062004_db_user`
- **Demo Seed Credentials**: `demo@vyora.com` / `password123`
- **NEVER use mock data**: All reads and writes must persist directly into MongoDB Atlas. The application must display real server data across all views.

---

## 3. Strict Coding Invariants (DO NOT BREAK)

### 1. The Minor Unit Currency Rule (Paisa)
- Money is NEVER calculated or stored in floating-point numbers.
- All monetary fields (`sellingPriceMinor`, `purchasePriceMinor`, `subtotalMinor`, `totalTaxMinor`, `grandTotalMinor`, `dueMinor`, etc.) are integers in paisa (minor units).
- Use `@vyora/utils` helpers: `formatCurrency(minor)`, `minorToMajor(minor)`, `majorToMinor(major)`.

### 2. Design System: Theme B — Teal Ledger
All UI elements must strictly preserve Theme B:
- Primary Deep Teal: `#0F766E` (hover: `#0D665F`)
- Deep Navigation & Dark Text: `#123B3A`
- App Background: `#F4F8F7`
- Surface/Card: `#FFFFFF`
- Teal Accent Tint: `#E6F4F2`
- Borders: `#D7E5E2`
- Muted Slate: `#566B69`
- Status: Success `#15803D`, Warning `#A16207`, Danger `#B91C1C`

### 3. Mandatory Fallback UIs (Empty States)
- Every table, widget, and metric MUST have a clean fallback state when there is no data.
- Table empty states must use `<EmptyState>` with a contextual icon, title, description, and action button.
- Tables with filter bars must distinguish between "no records in database" and "no records match active filters" (with a "Reset Filters" action).
- No hanging spinners or blank white rectangles.

### 4. Form Validation & Required Astersiks
- Every required input field across all pages and modals MUST display a bold red asterisk:
  `<span className="text-[#B91C1C] font-bold">*</span>`
- Client forms validate using Zod schemas matching backend class-validator DTOs.

### 5. Mobile-First Responsiveness
- Fixed bottom navigation bar for mobile viewports (`lg:hidden`).
- All data tables must be wrapped in `overflow-x-auto min-w-[500px..750px] whitespace-nowrap` to prevent column squashing.
- Action buttons in modals and forms must adapt to full width on mobile devices (`flex-col-reverse sm:flex-row`).

### 6. Immutability of Finalized Invoices & Traceable Stock
- Invoices with status other than `DRAFT` cannot be edited in place; they must be cancelled with audit logs.
- Stock quantities must change traceably through `StockMovement` records.

### 7. Zero Secrets in Commits / Manual Push Only (STRICT SECURITY RULE)
- **NEVER hardcode, log, or commit sensitive credentials**: MongoDB URIs (`mongodb+srv://...`), passwords, private keys, or `.env` files.
- All secrets MUST remain strictly in local `.env` files, which are permanently ignored in `.gitignore`.
- **MANUAL PUSH ONLY**: AI agents must NEVER automatically execute `git push`. All git pushes must be executed manually by the user after reviewing commits.
- Run `npm run check-secrets` before staging or committing any files to ensure zero credential leaks.

### 8. High-Concurrency Stability & Rate Limiting (1,000 to 50,000+ Scale)
- The NestJS backend enforces sliding-window in-memory rate limiting (`rate-limit.middleware.ts`) with a 10-minute periodic sweep to prevent memory leaks under 50k unique client IPs.
- Throttles `/auth/*` routes to 25 req/min (brute-force defense) and general routes to 200 req/min.
- Automatically injects security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`).

### 9. Client Search Debouncing
- Every text search bar (`<SearchInput>`) MUST enforce an internal 300ms debounce before notifying parent components or triggering queries.
- Prevents keystroke request storms and excessive DOM re-renders under heavy usage.

### 10. Data Table Standards, Pagination & Icon-Only Actions
- **Mandatory Pagination**: All tables (`ProductTable`, `PartyTable`, `InvoiceTable`, `StockMovementTable`, etc.) MUST use `<Pagination>` (10, 25, 50, 100 rows per page). NEVER render unbounded lists into the DOM.
- **Icon-Only Actions**: Action buttons in table rows for Edit and Delete MUST be icon-only (`<Edit2 className="w-4 h-4" />` and `<Trash2 className="w-4 h-4" />`) with subtle rounded hover backgrounds and descriptive `title` / `aria-label` attributes. No button text is allowed in table action columns.
- **Strict Prohibition of "Archive"**: The term and concept of "Archive" is completely forbidden. Any item removal action MUST be explicitly named "Delete" or "Remove".

### 11. Subscription Plan Purchase & Checkout Flow
- Paid tiers (`Growth` @ ₹499/mo and `Business Pro` @ ₹999/mo) can NEVER be switched with a 1-click bypass.
- Any upgrade action MUST trigger `<PlanPurchaseModal>` providing:
  - Plan selection & benefits breakdown.
  - Billing cycle toggle (Monthly vs Annual with 20% discount).
  - Minor-unit paisa calculation with itemized 18% GST preview.
  - Payment method options (UPI, Credit/Debit Cards, Net Banking).
  - Simulated banking gateway authorization with printable transaction receipts.

### 12. Edge-to-Edge Modal UI Standard
- All modals across the application MUST use the dedicated `footer` prop on `<Modal>` component (`<Modal footer={<>...</>}>`).
- Floating inner divider lines (`border-t`) that stop short of card borders are strictly forbidden. The modal footer renders full-bleed with `bg-[#F4F8F7]/70 border-t border-[#D7E5E2] px-5 sm:px-6 py-3.5` and action buttons aligned to the right.
- Form modals must assign an ID to the form (`<form id="my-form">`) and link submit buttons in the footer via `form="my-form"` for native validation and accessibility.

### 13. Zero-Data State Suppression (Clean Slate Hierarchy)
- When a data table has zero records in the database and no active filters are set, search input bars, filter buttons, filter drawers, and pagination controls MUST NOT be displayed.
- The view must render a clean, high-clarity `<EmptyState>` with a contextual icon, title, description, and primary creation CTA button.
- Only show filter bars and pagination when actual data exists (`data.items.length > 0`) OR when active filters are set (with a "Reset Filters" action).

### 14. Primary Owner Immutability & RBAC Protection
- Only users with role `OWNER` have permission to create, edit, or delete catalog products, parties, transactions, and manage team roles.
- Staff accounts (`STAFF`) are strictly view-only for records and cannot add, edit, or delete items. Action buttons must be hidden for staff.
- Under NO circumstances can any owner demote or modify the permissions of the primary/original business owner. The backend rejects attempts to demote the primary owner with HTTP 403 Forbidden.

### 15. Automated QA, Tester Agent Protocol & MCP Tool Integrations
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

## 4. Verification Check Before Completing Work
Before marking any task complete:
1. Run `pnpm --filter vyora-backend build` &rarr; verify 0 errors.
2. Run `pnpm --filter vyora-frontend build` &rarr; verify 0 errors.
3. Run `pnpm -r test` &rarr; verify all unit test suites pass.
4. Verify all modals utilize the edge-to-edge `footer` prop.
5. Verify zero-data toolbars are suppressed and pagination auto-hides.
6. Verify secrets check passes (`node scripts/check-secrets.js`).
7. Run `vyora_tester_agent` to audit end-to-end functionality across multiple cases.
8. Document any new features or endpoints in `docs/AI_HANDOFF.md`.

---

## 5. Workflow Automation Slash Commands & Skills

| Command | Skill Name | Scope & Behavior |
| :--- | :--- | :--- |
| `/test <module>` | `vyora-test` | Runs automated QA suite for module or `all`, inspects live DOM via Chrome DevTools MCP, logs bug reports, hands off to developer agent, and re-tests until 100% pass. |
| `/audit-ui` | `vyora-audit-ui` | Automated AST/regex scanner across all React pages for Theme B teal styling, red asterisks, edge-to-edge modal footers, debounced search (300ms), and clean-slate table states. |
| `/db-seed <preset>` | `vyora-db-seed` | Instantly seeds isolated demo accounts with realistic business datasets (`fresh`, `retail`, `wholesale`). Outputs login credentials for instant browser verification. |
| `/ship` or `/verify-all` | `vyora-ship` | Complete pre-flight release gate: executes secrets check, UI audit, 100% QA suite, backend & frontend TypeScript compilation builds. Outputs certified sign-off. |
