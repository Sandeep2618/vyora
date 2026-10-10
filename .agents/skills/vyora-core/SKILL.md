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
- The application connects to **MongoDB Atlas cloud cluster**:
  `mongodb+srv://sandeep26062004_db_user:X1wUdhfTJjy35nsX@cluster0.ei4by7h.mongodb.net/vyora?retryWrites=true&w=majority`
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
   - Backend: Run `npm run build` in `vyora-backend`.
   - Frontend: Run `npm run build` in `vyora-frontend`.
   - Ensure zero TypeScript or bundling errors before declaring completion.
4. **Update Continuity Brief**:
   - Update `docs/AI_HANDOFF.md` with any new endpoints, schemas, or design changes.
