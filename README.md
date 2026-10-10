# Vyora — Business Billing, Inventory & Ledger Platform

![Vyora Banner](https://img.shields.io/badge/Vyora-Version%201.0.0-0F766E?style=for-the-badge)
![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-Cloud-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**Vyora** is an enterprise-grade small and medium business billing, GST invoicing, inventory management, and multi-party financial ledger platform. It features strict multi-tenant isolation, server-authoritative tax calculations, real-time cloud data persistence with MongoDB Atlas, and a responsive **Theme B — Teal Ledger** interface.

---

## 🌟 Key Features

### 1. Invoicing & GST Tax Engine
- **Draft & Finalize Workflows**: Real-time server tax calculation preview, sequential automated numbering (`INV-0001`), and immutable finalized invoices.
- **GST Compliance**: Automated CGST/SGST (intra-state) and IGST (inter-state) tax engine with HSN code validation and standard tax slabs (0%, 5%, 12%, 18%, 28%).
- **Printable Tax Invoices**: Professional A4 printable tax invoice format with business header, customer details, tax breakups, bank details, and authorized signatory.

### 2. Traceable Inventory Ledger
- **Audit-Proof Stock Ledger**: Traceable movements (`SALE`, `PURCHASE`, `OPENING`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `SALE_CANCEL`).
- **Real-Time Stock Alerts**: Visual low-stock badges and reorder level indicators.
- **Atomic Stock Checks**: Automatically validates available stock before finalizing sales.

### 3. Customer & Supplier Ledger (Parties)
- **Unified Directory**: Manage customer and supplier contacts, GSTIN numbers, billing/shipping addresses, and opening balances.
- **Running Ledger Balances**: Automatic reconciliation of dues upon invoice finalization and payment voucher recording.

### 4. Purchases & Payments
- **Supplier Bills**: Log inbound inventory additions with vendor payables tracking.
- **Payment Vouchers**: Record customer receipts and supplier payouts via UPI, Bank Transfer (NEFT/RTGS/IMPS), Cash, Cheque, or Card.
- **Idempotency Protection**: Unique transaction keys protect against accidental duplicate payment submissions.

### 5. Real-Time Dashboard & Financial Reports
- **Executive Metrics**: Authoritative revenue, outstanding receivables, stock valuation, and low stock counts.
- **7-Day Trend & Category Split**: Dynamic sales chart and product category distribution.
- **Comprehensive Reports**: Sales Tax Register, Purchase Register, Stock Valuation Summary, and Customer Receivables Aging.

### 6. Fallback UI System (Empty States)
- Every table, widget, and metric includes a visual `<EmptyState>` with contextual icons, clear explanations, and quick call-to-action buttons.
- Smart filter-aware states distinguish between *"no items recorded yet"* (CTA: Add/Create) and *"no items match filters"* (CTA: Reset Filters).

### 7. Mobile-First Responsive Design
- **Thumb Navigation**: Fixed bottom navigation bar for mobile devices (`lg:hidden`).
- **Horizontal Table Scroll**: All data tables wrapped in `overflow-x-auto min-w-[500px..750px] whitespace-nowrap` to prevent column squashing on small screens.
- **Adaptive Forms**: Responsive form grids that collapse smoothly from desktop multi-column to touch-friendly mobile layouts.

---

## 🏗️ Repository Architecture

The repository is organized into decoupled, independent projects:

```text
vyora/
├── vyora-backend/               # Standalone NestJS 11 REST API Monolith
│   ├── src/
│   │   ├── common/              # Guards (TenantGuard, RolesGuard), Database Module, Seeder
│   │   └── modules/             # Auth, Business, Products, Parties, Invoices, Purchases,
│   │                            # Payments, Inventory, Expenses, Dashboard, Reports, Audit
│   ├── .env                     # MongoDB Atlas URI, JWT configuration
│   └── package.json
│
├── vyora-frontend/              # Standalone React 19 + Vite 6 + Tailwind CSS 4 Web App
│   ├── src/
│   │   ├── api/                 # Strongly-typed HTTP API clients
│   │   ├── components/          # Theme B UI atoms (Button, Card, EmptyState, Modal, Input)
│   │   ├── context/             # AuthContext (JWT session & tenant handling)
│   │   ├── hooks/               # React Query custom hooks (useInvoices, useProducts, etc.)
│   │   └── pages/               # Auth, Dashboard, Invoices, Parties, Products,
│   │                            # Inventory, Purchases, Payments, Reports, Settings
│   ├── vite.config.ts
│   └── package.json
│
├── vyora-website/               # Public Marketing & Blog Website (Port 3001)
├── vyora-mobile/                # (Planned) React Native / Expo Mobile App
│
├── .agents/skills/vyora-core/   # Permanent AI Skill & Architecture Runbooks
├── GEMINI.md / AGENTS.md        # Always-On Memory Rules for AI Pair Programmers
└── docs/
    └── AI_HANDOFF.md            # Living technical brief & verification logs
```

---

## 🎨 Design System: Theme B — Teal Ledger

The UI adheres strictly to the **Theme B — Teal Ledger** tokens:

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Primary Teal** | `#0F766E` | Main branding, primary buttons, active tabs, links |
| **Primary Hover** | `#0D665F` | Button hover states |
| **Dark Slate** | `#123B3A` | Navigation drawer, modal headers, primary text |
| **App Background** | `#F4F8F7` | Neutral page backdrop |
| **Surface Card** | `#FFFFFF` | Content panels, metric tiles, table containers |
| **Teal Tint** | `#E6F4F2` | Icon badges, subtle highlight borders |
| **Border Slate** | `#D7E5E2` | Dividers, table row borders, card outlines |
| **Muted Text** | `#566B69` | Secondary labels, descriptions, timestamps |
| **Success** | `#15803D` | Paid badges, positive stock increments |
| **Warning** | `#A16207` | Partial payment badges, low-stock warnings |
| **Danger** | `#B91C1C` | Overdue amounts, cancellation notices, required asterisks |

---

## 💰 The Minor Unit Rule (Paisa Precision)

To prevent floating-point rounding errors common in JavaScript finance applications:
- **All monetary values are integers in minor units** (1 INR = 100 Paisa).
- Fields ending in `Minor`: `sellingPriceMinor`, `purchasePriceMinor`, `subtotalMinor`, `totalTaxMinor`, `grandTotalMinor`, `dueMinor`, `amountMinor`.
- Managed through `@vyora/utils`:
  ```typescript
  import { formatCurrency, minorToMajor, majorToMinor } from '@vyora/utils';

  formatCurrency(7137800); // "₹71,378.00"
  minorToMajor(7137800);   // 71378
  majorToMinor(71378);     // 7137800
  ```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v20.0.0+`
- **npm** or **pnpm**
- **MongoDB Atlas** account (or local MongoDB)

### 1. Backend Setup
```bash
cd vyora-backend
npm install
```

Configure `vyora-backend/.env`:
```env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/vyora?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

Start the backend:
```bash
npm run dev
```
- API Base: `http://localhost:4000/api/v1`
- Health Check: `http://localhost:4000/api/v1/health`
- Interactive Swagger Docs: `http://localhost:4000/api/v1/docs`

> *Note: On first run against an empty database, `DatabaseSeederService` automatically seeds demo credentials:*
> - **Email**: `demo@vyora.com`
> - **Password**: `password123`

### 2. Frontend Setup
```bash
cd vyora-frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 🤖 AI Guidelines & Skill System

To ensure all future AI models (Antigravity, Gemini, Claude, Cursor) preserve the coding style, memory, and architecture without breaking existing flows:

- **Always-On Rules**: Consult [`GEMINI.md`](./GEMINI.md) and [`AGENTS.md`](./AGENTS.md) at the root of the project.
- **Permanent Skill**: Refer to [`.agents/skills/vyora-core/SKILL.md`](./.agents/skills/vyora-core/SKILL.md).
- **Continuity Log**: Refer to [`docs/AI_HANDOFF.md`](./docs/AI_HANDOFF.md).

---

## 📜 License

Private & Proprietary. All rights reserved.
