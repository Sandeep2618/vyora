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

---

## 4. Verification Check Before Completing Work
Before marking any task complete:
1. Run `npm run build` in `vyora-backend` &rarr; verify 0 errors.
2. Run `npm run build` in `vyora-frontend` &rarr; verify 0 errors.
3. Test backend health at `http://localhost:4000/api/v1/health`.
4. Document any new features or endpoints in `docs/AI_HANDOFF.md`.
