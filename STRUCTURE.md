# Vyora Architecture & Codebase Structure Guide

> **Scope of this Specification**:
> 1. **Frontend Architecture**: Web application (`vyora-frontend/`) and Mobile application (`vyora-app/`) module structure, component hierarchy, coding recipe, strict Tailwind CSS rules (Theme B Teal Ledger), Dark & Light Mode system, and Internationalization (i18n).
> 2. **Backend Architecture**: REST API monolith (`vyora-backend/`) domain structure, strict one-way layered modules, atomic transactions, multi-tenant isolation, and validation contracts.
> 3. **The Nesting & Stability Rules**: Mandatory blueprint for all new modules, re-rendering prevention, optional chaining defense, rate limiting, and debouncing.

---

## 1. High-Level System Overview & Tech Stack

```
vyora/                                  # Monorepo Root
├── vyora-frontend/                     # Web App (React 19 + Vite + Tailwind v4 + React Router v7)
├── vyora-backend/                      # REST API (NestJS / Express + MongoDB / Mongoose + Zod / Class-Validator)
├── docs/                               # Architecture docs, QA reports, handoffs
└── STRUCTURE.md                        # Master Architecture & Structure Guide (THIS FILE)

(Adjacent Ecosystem):
d:/project/vyora-app/                   # Mobile App (Expo SDK 57 + React Native + expo-updates OTA)
d:/project/vyora-website/               # Public Landing & Showcase (Vite + React + Tailwind v4)
```

| Area | Technologies | Port / Target |
| :--- | :--- | :--- |
| **Frontend Web** | React 19, Vite, Tailwind CSS v4 (Theme B Teal Ledger), React Router v7, `@tanstack/react-query`, Radix UI, React Hook Form + Zod, i18next | Port 5173 |
| **Backend API** | NestJS / Express, MongoDB 8, Mongoose, Passport JWT, Zod / Class-Validator, Vitest | Port 4000 |
| **Mobile App** | Expo SDK 57, React Native 0.86, Expo Updates (OTA Channels: preview / production) | Android APK / Web |

> **IMPORTANT ARCHITECTURAL DECISION: NO CORE LIBRARY / NO EXTERNAL PACKAGES**
> We do **NOT** create or maintain separate core packages (such as `@vyora/core`, `@vyora/shared`, or `packages/schema`). 
> - Every app/service (`vyora-frontend`, `vyora-backend`, `vyora-app`) is completely **self-contained**.
> - Code shared across multiple modules within an app lives directly in that app's `src/common/` (or `common/`).
> - This keeps build pipelines fast and straightforward with zero package-linking, publishing, or monorepo dependency overhead.

---

## 2. Frontend: Web & Mobile Codebase Standards

### 2.1 Core Rules

1. **Pure Tailwind CSS — ZERO Inline CSS**:
   - `style={{ ... }}` is strictly prohibited in JSX (except dynamically calculated canvas coordinates or third-party chart library inputs where classes are unsupported).
   - All styling uses Tailwind classes and semantic design tokens:
     - Primary Theme: `#0F766E` (`bg-[#0F766E]`, `text-[#0F766E]`, `border-[#0F766E]`).
     - Deep Accent / Slate: `#123B3A` (`text-[#123B3A]`, `bg-[#123B3A]`).
     - Neutral surfaces: `#F4F8F7`, borders `#D7E5E2`, `#E2E8F0`.
   - Never use raw arbitrary color hexes scattered randomly; reference Theme B tokens consistently.

2. **Dark & Light Mode Ready**:
   - Every UI element must support both Light and Dark mode using Tailwind's `.dark` variant classes or semantic tokens.
   - Persist theme state in `localStorage` (`'light' | 'dark' | 'system'`).

3. **Internationalization (i18n) Ready**:
   - Hardcoded user-facing strings are strictly prohibited in core components.
   - All text rendered on screen must pass through `t('module.key', { defaultValue: 'Default Text' })`.
   - Locale dictionary directory: `src/locales/{en,hi,gu}/`.
   - Date, currency, and number formatting must use centralized utility facades (`DateUtil`, `CurrencyUtil`).

4. **Defensive Programming & Optional Chaining**:
   - Safe property access: Always use optional chaining `obj?.property?.subproperty ?? fallback`.
   - Nullish coalescing `??` is mandatory over `||` to prevent falsy bugs with numerical `0` or empty strings.
   - Array defense: Always verify `Array.isArray(items) && items.length > 0` before rendering lists.

5. **Re-Rendering Prevention & Performance Hygiene**:
   - Heavy computations and filtered lists must be wrapped in `useMemo`.
   - Callbacks passed to children must be wrapped in `useCallback`.
   - Never pass inline anonymous object or function literals into JSX loops.
   - List rows and repeated cards must be wrapped in `React.memo`.

6. **Strict TypeScript Compliance**:
   - `strict: true`, `noUncheckedIndexedAccess: true`.
   - Zero `any`. Zero non-null assertions (`!`).
   - Nullable API fields must be explicitly typed as `T | null` or `T | undefined`.

7. **Zero Mock Data in Production Code**:
   - No hardcoded customer names, test totals, or mock bills in pages or components.
   - When data is loading or empty, render dedicated `<Skeleton>` or clean-slate fallback UI.

8. **Strict File Size Cap (300 to 400 Lines Maximum)**:
   - **No single file may exceed 300 to 400 lines**. Monolithic "all-in-one" files are strictly prohibited.
   - Any screen, page, or container approaching ~300 lines **MUST be decomposed into focused, single-responsibility nested components**.
   - **Colocated Nested Component Architecture**:
     - Child components that are specific to a page live in a dedicated `component/` subfolder adjacent to that page.
     - Each nested component manages its own `config/` (`interface/`, `constant/`, `enum/`) and `util/`.
     - The parent `page.tsx` acts solely as an **orchestrator** (loading data, orchestrating mutations, and rendering the high-level layout of child components).

### 2.1.1 Mandatory Component Folder Architecture Standard

Every complex component, table, modal, drawer, or domain widget across the frontend **MUST** strictly adhere to this standardized modular directory structure:

```
ComponentName/
├── component/
│   └── index.tsx          # Component code only (pure JSX + logic/hook calls)
├── config/
│   ├── constant/index.ts  # Constants, default values, lookup maps, styling presets
│   ├── interface/index.ts # Props and data shapes
│   └── enum/index.ts      # Enums, action types, placement / size keys
├── hook/index.ts          # Only if the component needs a hook (state orchestration, handlers)
├── util/index.ts          # Only if pure helpers are needed (styling/variant resolvers)
└── index.ts               # Public barrel exports of this folder
```

#### Key Rules:
1. **Separation of Presentation and Data Shapes**:
   - `component/index.tsx` contains JSX presentation and calls custom hooks/utilities. It must not define inline prop types, raw styling constants, or unrelated business algorithms.
   - `config/interface/index.ts` houses all component props and nested child item interfaces.
   - `config/constant/index.ts` contains fallback values, default pagination limits, animation keys, and style mapping tables.
   - `config/enum/index.ts` contains action types, sizing enums, and placement enums.
2. **Optional Lifecycle Elements**:
   - `hook/index.ts` is created if the component maintains local orchestration (e.g., keyboard listeners, pagination slicing, debounce filters).
   - `util/index.ts` is created if pure data transformations or class resolvers are required.
3. **Public API Contract (`index.ts`)**:
   - The root `index.ts` re-exports the main component, interfaces, constants, and enums so external modules import cleanly via `import { ComponentName } from './components/.../ComponentName'`.
4. **Global Reusability & Single Source of Truth**:
   - Global UI primitives (such as `Modal/`, `Drawer/`, `Table/`, `Badge/`) live in `src/components/ui/` using this exact structure.
   - When global primitives (e.g. `Modal` edge-to-edge footer or `Drawer` slide-over mechanism) are modified, improvements propagate globally across all modules in the application.

---

### 2.2 Dark & Light Mode Theme Tokens (Theme B: Teal Ledger)

All UI elements must utilize these standardized tokens:

| Element | Light Mode Token | Dark Mode Token (`dark:`) | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `bg-[#F4F8F7]` | `dark:bg-[#0A1615]` | App main background |
| **Card / Surface** | `bg-white` | `dark:bg-[#112322]` | Cards, modals, drawers |
| **Elevated Surface** | `bg-[#EDF5F3]` | `dark:bg-[#162E2D]` | Table headers, chip backgrounds |
| **Primary Brand** | `bg-[#0F766E] text-white` | `dark:bg-[#14B8A6] dark:text-[#0A1615]` | Primary buttons, active tabs |
| **Primary Hover** | `hover:bg-[#0D665F]` | `dark:hover:bg-[#0D9488]` | Button hover state |
| **Heading / Primary Text** | `text-[#123B3A]` | `dark:text-[#E6F4F1]` | Page titles, invoice totals |
| **Body Text** | `text-[#334E4D]` | `dark:text-[#B2D1CE]` | Descriptions, body copy |
| **Muted Text** | `text-gray-500` | `dark:text-slate-400` | Timestamps, subtitles |
| **Border / Divider** | `border-[#D7E5E2]` | `dark:border-[#1E3B38]` | Card borders, table grid lines |
| **Input Background** | `bg-white` | `dark:bg-[#0D1C1B]` | Text boxes, dropdowns |
| **Input Focus Ring** | `focus:border-[#0F766E]` | `dark:focus:border-[#14B8A6]` | Focus rings |

#### Standard `ThemeProvider` Blueprint (`src/common/context/ThemeContext.tsx`)
```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('vyora-theme') as Theme) || 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const activeIsDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      setIsDark(activeIsDark);
      root.classList.toggle('dark', activeIsDark);
    };

    applyTheme();
    localStorage.setItem('vyora-theme', theme);

    const listener = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

---

### 2.3 Common Components Catalog (`src/common/component/`)

To ensure stability and zero UI divergence, every feature module **must** use the centralized components in `src/common/component/`:

| Component | Responsibility | Standard Props Contract |
| :--- | :--- | :--- |
| `<Button>` | Primary, secondary, outline, ghost, danger buttons with loading spinner & disabled lock. | `{ variant?, size?, isLoading?, disabled?, icon?, children, onClick }` |
| `<Input>` | Form input with error text, left/right icons, required red asterisk, and clear action. | `{ label?, error?, isRequired?, leftIcon?, rightIcon?, ...inputProps }` |
| `<DebouncedSearchInput>` | Search input with 350ms debounce and instant clear `(X)` button. | `{ value, onChange, placeholder?, delay?: 350 }` |
| `<Table<T>>` | Self-contained data table with API caller, column configs, sort, pagination, `<Skeleton>`, and clean-slate fallback. | `{ api, columns, rowKey, emptyTitle?, emptyAction?, onRowClick? }` |
| `<Modal>` | Accessible dialog with backdrop blur, focus trap, and standardized header & footer buttons. | `{ isOpen, onClose, title, children, footerAction? }` |
| `<Drawer>` | Slide-over panel for quick previews and filters. | `{ isOpen, onClose, title, position?: 'right', children }` |
| `<Badge>` | Status chips (Paid, Unpaid, Partial, Overdue, Active) with theme-aligned light/dark colors. | `{ variant: 'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral', label }` |
| `<Skeleton>` | Smooth pulsing loading placeholders for rows, text blocks, and KPI cards. | `{ className, variant?: 'rect' \| 'circle' \| 'text' }` |
| `<ConfirmDialog>` | Standard modal for destructive actions (Delete Invoice, Cancel Order). | `{ isOpen, onConfirm, onCancel, title, description, isDanger?: true }` |
| `<Card>` | Standard border & surface container with optional header & action slot. | `{ title?, action?, children, className? }` |
| `<Select>` | Accessible dropdown using Radix UI primitives. | `{ options, value, onChange, placeholder?, label?, error? }` |

---

### 2.4 Frontend Top-Level Directory Layout (`vyora-frontend/src/`)

```
src/
├── app/                        # Root application wrappers, providers, Router configuration
│   ├── App.tsx
│   ├── router.tsx              # Centralized route definitions & guards
│   └── provider/               # AuthProvider, QueryClientProvider, ThemeProvider, I18nProvider
├── common/                     # Code shared across 2 or more distinct modules
│   ├── component/              # Button, Input, DebouncedSearchInput, Modal, Table, Drawer, Badge, Skeleton
│   ├── layout/                 # AppLayout (Sidebar, Topbar, TenantSwitcher, ThemeToggle), AuthLayout
│   ├── hook/                   # useAuth, useDebounce, useTheme, usePermission, useNetworkStatus
│   ├── util/                   # DateUtil, CurrencyUtil, StorageUtil, FormatUtil, ValidationUtil
│   └── api/                    # Centralized Axios client instance, interceptors, error handling
├── config/                     # App-wide environment constants, theme tokens, route permissions
│   ├── env.config.ts
│   ├── routes.config.ts
│   └── permissions.config.ts
├── locales/                    # Centralized i18n translation bundles
│   ├── en/                     # English (default)
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── invoices.json
│   │   ├── parties.json
│   │   └── products.json
│   ├── hi/                     # Hindi (हिन्दी)
│   └── gu/                     # Gujarati (ગુજરાતી)
├── modules/                    # Self-contained feature modules (Colocated)
│   ├── auth/                   # login, register, forgot-password
│   ├── dashboard/              # kpi-metrics, live-sales-feed, low-stock-alerts
│   ├── invoices/               # invoices list, create-invoice, invoice-detail
│   ├── parties/                # customer & supplier lists, party-ledger, party-detail
│   ├── products/               # product inventory, add-product, stock-adjustments
│   ├── purchases/              # purchase bills, record-purchase, purchase-detail
│   ├── payments/               # customer receipts, supplier payments, payment-history
│   ├── reports/                # sales report, gstr-1, gstr-3b, party-statement
│   └── settings/               # business profile, tax settings, staff roles, billing
└── assets/                     # Logos, branding icons, illustrations
```

---

### 2.5 The Nesting Rule: Where Component, Config, and Util Live

> **The Core Rule**: *Put a file at the LOWEST level that still reaches ALL its consumers.*

| Who uses the file | Where it lives | Example |
| :--- | :--- | :--- |
| **ONE component only** | Inside that component's own folder: `<component>/config/` or `<component>/util/` | `invoice-table/config/columns.ts` used only by `InvoiceTable` |
| **2–3 components of ONE page** | Sibling of the page: `<page>/config/` and `<page>/util/` | `create-invoice/config/initial-values.ts` |
| **Several pages of ONE module** | At module root: `modules/<module>/config/`, `util/`, `component/` | `modules/invoices/config/constants.ts` (status enums, API hooks) |
| **Entire app (2+ modules)** | `src/common/` (no external package needed) | `src/common/util/FormatUtil.ts`, `src/common/component/Table/` |

> *Reminder: No external core libraries or packages are used. Everything reusable lives directly inside `src/common/`.*

#### Standard 4 Folders Pattern (Repeated at Every Level)
At any level, components and modules organize into the exact same 4 folders:
1. `component/`: Sub-components, cards, headers, modals, drawers.
2. `config/`: Configuration barrels (`constant/`, `interface/`, `enum/`). Always exported via `index.ts`.
3. `util/`: Pure helper functions and API client facades.
4. `skeleton/`: Loading skeleton placeholders.

---

### 2.6 Mandatory Blueprint for Every New Module

Whenever creating any new module (e.g. `expenses`, `payroll`, `quotations`, etc.), developers and AI agents **MUST** execute these exact 5 steps:

#### Step 1: Create the Standard Directory Tree
```
modules/<module-name>/
├── page.tsx                           # Main list or overview screen
├── loading.tsx                        # Suspense / router fallback
├── skeleton/                          # Pulsing skeleton placeholders
│   └── <ModuleName>Skeleton.tsx
├── config/                            # Module-wide types, enums, constants
│   ├── index.ts                       # Barrel: export * from './constant'; export * from './interface'; ...
│   ├── constant/index.ts              # Column definitions, filter options, default values
│   ├── interface/index.ts             # TypeScript entity interfaces & DTOs
│   └── enum/index.ts                  # Status enums, event types
├── util/                              # API facade & pure domain math
│   └── index.ts                       # <module>Api methods & calculations
├── component/                         # Parts used across multiple pages of this module
│   ├── modal/                         # Modals named by role only (NO "-modal" suffix!)
│   │   ├── create/                    # component/modal/create/index.tsx
│   │   └── delete/                    # component/modal/delete/index.tsx
│   └── drawer/                        # Drawers named by role only (NO "-drawer" suffix!)
│       └── detail/                    # component/drawer/detail/index.tsx
└── (sub-pages)/                       # Nested routes (e.g. create, [id])
    └── create/
        ├── page.tsx
        ├── config/
        └── component/
```

#### Step 2: Strict Naming Conventions
- **Folders**: Singular kebab-case (`create/`, `delete/`, `line-item-grid/`).
- **Never repeat parent names**:
  - `modules/invoices/component/modal/delete/` ✅
  - `modules/invoices/component/modal/delete-invoice-modal/` ❌
- **Barrels**: Every `config/` folder must contain an `index.ts` re-exporting subfolders.

#### Step 3: Standard File Import Order
```typescript
// 1. React & framework hooks
import React, { useState, useMemo, useCallback } from 'react';
// 2. i18n & external libraries
import { useTranslation } from 'react-i18next';
import { Plus, Search, Trash2 } from 'lucide-react';
// 3. Centralized common components & hooks (@/common/*)
import { Table } from '@/common/component/Table';
import { Button } from '@/common/component/Button';
import { useDebounce } from '@/common/hook/useDebounce';
// 4. Module-local utilities, configs, enums
import { expensesApi } from './util';
import { EXPENSE_STATUS, EXPENSE_EVENT } from './config';
import type { ExpenseItem, ExpenseFilters } from './config';
```

#### Step 4: Component Body Sequence
Every `.tsx` component body must strictly follow this lifecycle sequence:
1. **Header comment**: 1–2 lines defining what the screen does.
2. **Translation & context hooks**: `useTranslation()`, `useAuth()`, `useTheme()`.
3. **Local state**: `useState()`.
4. **Refs & framework hooks**: `useRef()`, `useNavigate()`, `useParams()`.
5. **Debounce & derived values**: `useDebounce()`, `useMemo()`.
6. **Event handlers**: `useCallback()`.
7. **Effects**: `useEffect()` (placed last before return).
8. **JSX return**: Semantic HTML, pure Tailwind with dark mode classes, zero inline styles.

#### Step 5: Localization & Translation Keys
Add the corresponding module file in `src/locales/en/<module-name>.json` and `src/locales/hi/<module-name>.json` with complete keys for `title`, `subtitle`, `button`, `table`, and `empty`.

---

### 2.7 Performance & Anti-Lag Architecture

#### 1. Re-render Prevention
- **Heavy Derived Computations**: Filter operations, totals, and mapped arrays must be memoized:
  ```tsx
  const filteredInvoices = useMemo(() => {
    if (!invoices?.length) return [];
    return invoices.filter(inv => inv?.customerName?.toLowerCase().includes(debouncedQuery.toLowerCase()));
  }, [invoices, debouncedQuery]);
  ```
- **Stable Callback References**: Every handler passed as a prop must be wrapped in `useCallback` to avoid breaking child `React.memo`:
  ```tsx
  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);
  ```
- **Memoized Row Items**: Components rendered inside `.map()` loops must be wrapped in `React.memo`:
  ```tsx
  export const InvoiceRow = React.memo<InvoiceRowProps>(({ invoice, onSelect }) => { ... });
  ```

#### 2. Defensive Optional Chaining
- Never assume an API field is non-null:
  ```tsx
  // BAD ❌
  const tax = invoice.taxDetails.amount;
  // GOOD ✅
  const tax = invoice?.taxDetails?.amount ?? 0;
  ```
- Guard arrays before iteration:
  ```tsx
  {Array.isArray(invoice?.items) && invoice.items.length > 0 ? (
    invoice.items.map(item => <ItemRow key={item?.id} item={item} />)
  ) : (
    <EmptyLineItems />
  )}
  ```

#### 3. Debounce & Rate Limiting (Frontend & Backend)
- **Frontend Search Debounce**: All search bars and filter inputs must debounce backend calls by 300–400ms:
  ```tsx
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);

  useEffect(() => {
    fetchResults(debouncedSearch);
  }, [debouncedSearch]);
  ```
- **Action Button Lock**: Submit buttons must be locked while a mutation is in flight to prevent duplicate submissions:
  ```tsx
  <Button
    isLoading={isSubmitting}
    disabled={isSubmitting || !isValid}
    onClick={handleSubmit(onSubmit)}
  >
    Record Invoice
  </Button>
  ```
- **Backend Rate Limiting (`@nestjs/throttler`)**:
  - Auth routes (`/auth/login`, `/auth/register`): **Max 5 requests per minute per IP**.
  - General API endpoints: **Max 150 requests per minute per tenant**.

---

## 3. Backend: Clean Layered Architecture (`vyora-backend/`)

### 3.1 Core Rules

1. **Strict One-Way Dependency Flow**:
   ```
   Route -> Validator (Zod/DTO) -> Controller (Thin) -> Service (Business Logic) -> (Handler / Mapper / Transaction / Schema)
   ```
   - Controllers **never** perform database operations directly.
   - Controllers **never** contain business calculations.
   - Services **never** interact directly with `req` or `res` objects.
2. **Multi-Tenant Isolation by Design**:
   - Every database query and write **MUST** be scoped by `businessId` (extracted from the authenticated JWT session context).
   - An endpoint without `businessId` filtering is considered an immediate security violation.
3. **Atomic Multi-Document MongoDB Transactions**:
   - Any flow that updates more than one document (e.g., creating an invoice that adjusts stock inventory and customer ledger) **MUST** execute inside an atomic MongoDB session transaction (`withTransaction`).
   - If any step fails, the entire transaction rolls back automatically.

---

### 3.2 Backend Module Directory Layout (Example: `invoices/`)

Every module in `vyora-backend/src/modules/` adheres to this exact 9-layer shape:

```
modules/invoices/
├── invoices.module.ts                 # NestJS Module configuration & dependency injection
├── index.ts                           # Module entry & exports
├── route/                             # URL route declarations and middleware pipeline
│   └── invoices.routes.ts
├── validator/                         # Zod / Class-Validator request schemas & DTOs
│   ├── create-invoice.dto.ts
│   ├── update-invoice.dto.ts
│   └── query-invoices.dto.ts
├── controller/                        # Thin controllers: input extraction & HTTP responses
│   └── invoices.controller.ts
├── service/                           # Pure business logic & ledger math
│   ├── invoices.service.ts
│   └── invoices.service.spec.ts       # Vitest unit test suite
├── transaction/                       # Multi-document atomic database transactions
│   └── create-invoice.transaction.ts  # (Saves invoice + updates product stock + creates ledger entry)
├── mapper/                            # Request/Response transformation helpers
│   └── invoice.mapper.ts              # (Transforms DB schema to clean client DTO)
├── handler/                           # External integrations & side-effects
│   ├── invoice-pdf.handler.ts         # Generates PDF binary
│   └── invoice-whatsapp.handler.ts    # Dispatches WhatsApp notification
├── schemas/                           # Mongoose database models & indexes
│   └── invoice.schema.ts
└── interface/                         # Internal TypeScript interfaces
    └── invoice.types.ts
```

---

### 3.3 The Middleware Chain in Routes

Every protected route executes this explicit sequence:

```
[Rate Limiter (Throttler)]
      ↓
[Passport JWT Authentication] (extracts user identity)
      ↓
[Tenant Session Context] (verifies businessId & tenancy)
      ↓
[RBAC Permission Guard] (verifies user role e.g. 'invoices:create')
      ↓
[Zod Request Validation] (validates body, params, query)
      ↓
[Controller Execution]
```

---

### 3.4 Atomic Transaction Recipe (The Vyora Standard)

When creating or cancelling invoices, stock and balances must stay 100% consistent:

```typescript
// transaction/create-invoice.transaction.ts
import { ClientSession, Connection } from 'mongoose';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InvoiceModel } from '../schemas/invoice.schema';
import { ProductModel } from '../../products/schemas/product.schema';
import { PartyLedgerModel } from '../../parties/schemas/party-ledger.schema';

@Injectable()
export class CreateInvoiceTransaction {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async execute(businessId: string, invoiceData: any): Promise<any> {
    const session: ClientSession = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Validate & reduce stock for all items
      for (const item of invoiceData.items) {
        const product = await ProductModel.findOne({
          _id: item.productId,
          businessId,
        }).session(session);

        if (!product) {
          throw new BadRequestException(`Product ${item.productName} not found.`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
        }

        product.stockQuantity -= item.quantity;
        await product.save({ session });
      }

      // 2. Save Invoice
      const [invoice] = await InvoiceModel.create([{ ...invoiceData, businessId }], { session });

      // 3. Record Party Ledger Entry
      await PartyLedgerModel.create([{
        businessId,
        partyId: invoiceData.partyId,
        invoiceId: invoice._id,
        type: 'DEBIT',
        amountMinor: invoiceData.grandTotalMinor,
        description: `Sales Invoice #${invoice.invoiceNumber}`,
      }], { session });

      // Commit transaction
      await session.commitTransaction();
      return invoice;
    } catch (error) {
      // Rollback on any failure
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
```

---

## 4. How Frontend & Backend Meet

| Frontend Screen / Action | Frontend Facade | Backend REST Endpoint | Backend Module Layer | Required Permission |
| :--- | :--- | :--- | :--- | :--- |
| **Sales Invoices List** | `invoicesApi.list(params)` | `GET /api/v1/invoices` | `invoices.controller.ts` | `invoices:view` |
| **Create Sales Bill** | `invoicesApi.create(payload)` | `POST /api/v1/invoices` | `create-invoice.transaction.ts` | `invoices:create` |
| **Customer Ledger** | `partiesApi.getLedger(partyId)` | `GET /api/v1/parties/:id/ledger` | `parties.controller.ts` | `parties:view` |
| **Stock Inventory** | `productsApi.list(params)` | `GET /api/v1/products` | `products.controller.ts` | `products:view` |
| **Record Payment** | `paymentsApi.record(payload)` | `POST /api/v1/payments` | `payments.transaction.ts` | `payments:create` |
| **Business Settings** | `businessApi.getProfile()` | `GET /api/v1/business/profile` | `business.controller.ts` | `business:manage` |

---

## 5. Quality Checks: The Five Layers & Stability Gates

To guarantee enterprise code health, prevent regressions, and ensure all AI agents and engineers deliver consistent, zero-defect code, Vyora enforces five defensive quality layers:

### 5.1 Quality Checks: The Five Layers

| Layer | Tool | What it catches |
| :--- | :--- | :--- |
| **Formatting** | Prettier | Spacing, quotes, line width, so all code looks the same |
| **Linting** | ESLint + typescript-eslint | Bugs, any, unused code, bad import order, hook mistakes |
| **Type check** | tsc --noEmit (strict mode) | Type errors |
| **Tests** | Vitest + Testing Library | Behaviour that breaks |
| **Gate** | Husky + lint-staged + CI | Blocks bad code before commit and before merge |

---

### 5.2 Architectural Stability & Anti-Drift Gates

To prevent code degradation, performance leaks, and regressions, every commit must satisfy these four gates:

### Gate 1: Zero Inline CSS & Theme Token Enforcement
- Any occurrence of `style={{` in components (outside Canvas/Chart dynamic points) fails review.
- All colors must use Theme B Teal Ledger (`#0F766E` / `#123B3A`) with full `dark:` mode compatibility.

### Gate 2: Debounce & Search Rate Limiting
- Every user-facing search field or filter input **must** use a 300–400ms debounce hook (`useDebounce`).
- Rapid typing must never spam the backend with 1 request per keystroke.

### Gate 3: Fallback & Zero-Data Clean Slate
- Every table and list **must** handle 3 states cleanly:
  1. **Loading**: Dedicated `<Skeleton>` matching the exact row height and column width.
  2. **Empty Data**: Clean fallback card with an intuitive illustration/icon, explanatory text, and a primary action button ("+ Add Your First Customer").
  3. **Populated**: Real data bound to API entities.

### Gate 4: TypeScript Strict & Build Verification
- `npx tsc --noEmit` must pass with **0 errors**.
- Build scripts (`vite build`, `nest build`, `npx eas-cli`) must compile cleanly.

---

## 6. Implementation & Refactoring Roadmap

This guide serves as our single source of truth. The upcoming transition will proceed in the following ordered phases:

```
[Phase 1: Architecture Documentation (COMPLETE)]
  ├── STRUCTURE.md finalized and committed to repository root.
  └── Team & AI Agents align on file placement and coding rules.
        ↓
[Phase 2: Frontend Common & Theme Refactor]
  ├── Set up ThemeProvider (Dark & Light mode with Theme B Teal Ledger).
  ├── Set up i18n infrastructure (i18next + locales/en, locales/hi, locales/gu).
  ├── Standardize Common Components (Button, Input, DebouncedSearchInput, Table, Modal).
  └── Restructure pages and components to follow the standard 4-folder nesting rule.
        ↓
[Phase 3: Backend Layering]
  ├── Separate fat controllers into thin controllers, services, and transactions.
  ├── Audit all multi-document writes to ensure atomic MongoDB transactions.
  └── Standardize Zod validation schemas across all API endpoints.
        ↓
[Phase 4: Mobile App & Shared Contracts Alignment]
  ├── Align vyora-app screens and validation with the shared structure.
  └── Continuous deployment via Over-The-Air (OTA) EAS updates.
```
