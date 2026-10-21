# GravityContext — Master Vyora Engineering & Context Log

> **Document Type**: Comprehensive Continuity & Memory Core for AI Assistants & Human Developers  
> **Last Synchronized**: October 20, 2026  
> **Repositories Covered**: Monorepo (`D:\project\vyora`), Mobile App (`D:\project\vyora-app`), Marketing Website (`D:\project\vyora-website`)  
> **Current APK Build**: `39ef7ebf-1f44-471a-9815-035a27133287` | **Expo SDK**: 57 | **React Native**: 0.86

---

## 1. Project Overview & Multi-Repo Topology

Vyora is an all-in-one Indian business billing, GST invoicing, inventory tracking, and party ledger application designed for retail shops, wholesale distributors, and SMEs.

### Repository Locations & Roles
1. **Primary Monorepo (`D:\project\vyora` & `C:\Users\sande\vyora`)**:
   - `vyora-backend/`: Express 5.3 + TypeScript + Mongoose 8 modular monolith running on `http://localhost:4000/api/v1`.
   - `vyora-frontend/`: React 19 + Vite + Tailwind CSS 4 (Theme B: Teal Ledger) web application running on `http://localhost:3000`.
   - `packages/utils/` (`@vyora/utils`): Canonical shared monetary (paisa) and GST tax engine.
   - `docs/`: Living handoff logs (`AI_HANDOFF.md`), gap blueprints (`MOBILE_ARCHITECTURE_AND_GAPS.md`), and QA reports.
2. **Mobile Application Repository (`D:\project\vyora-app`)**:
   - Standalone React Native 0.86 + Expo SDK 57 Android application.
   - Managed with EAS (Expo Application Services) with OTA update channel `preview`.
3. **Marketing & Blog Platform (`D:\project\vyora-website`)**:
   - React 19 + TypeScript + Vite + Tailwind CSS 4 website on `http://localhost:3001`.
   - Houses the direct APK download pages, QR codes, ROI calculator, and dynamic blog engine.

---

## 2. Design System: Theme B (Teal Ledger)

All platforms (Web, Mobile, Website) strictly adhere to Theme B tokens:
- **Primary Accent**: `#0F766E` (Deep Teal)
- **Deep Brand / Header**: `#123B3A` (Dark Pine)
- **Page Background**: `#F4F8F7` (Soft Mint Grey)
- **Card / Surface**: `#FFFFFF` (Pure White)
- **Border / Divider**: `#D7E5E2` (Subtle Mint Border)
- **Muted Text / Placeholder**: `#566B69` (Slate Teal)
- **Success / Paid**: `#15803D` (Forest Green)
- **Warning / Partial**: `#A16207` (Deep Amber)
- **Danger / Overdue**: `#B91C1C` (Crimson Red)
- **Typography**: Inter / System Sans-Serif

---

## 3. Technology Stack & Architecture

### 3.1 Backend Architecture (`vyora-backend`)
- **Runtime**: Express 5.3 on Node.js 20+ with TypeScript and Mongoose 8.
- **Database**: MongoDB Atlas Cloud (`cluster0.ei4by7h.mongodb.net`, database `vyora`).
- **Multitenancy Isolation**:
  - Every tenant entity has a required `businessId: ObjectId` reference.
  - Multi-business membership via `Membership` collection (`userId`, `businessId`, `role: 'OWNER' | 'STAFF' | 'MANAGER'`, `isActive: boolean`).
  - Active tenant resolved from `x-business-id` header and validated by `TenantGuard` / `authMiddleware`.
- **49 Total Endpoints across 14 Modules**:
  - `Health` (1): `GET /api/v1/health`
  - `Auth & Multitenancy` (10): `POST /register`, `POST /login`, `POST /otp/send`, `POST /otp/verify`, `GET /me`, `PATCH /profile`, `PUT /profile`, `GET /businesses`, `POST /switch-business`, `POST /logout`
  - `Business & Staff` (5): `GET /business/current`, `POST /members`, `PATCH /members/:id/role`, `PATCH /members/:id/status`, `DELETE /members/:id`
  - `Products` (5): `POST /products`, `GET /products`, `GET /products/:id`, `PUT /products/:id`, `DELETE /products/:id` (Staff mask: `purchasePriceMinor = 0`)
  - `Parties` (5): `POST /parties`, `GET /parties`, `GET /parties/:id`, `PUT /parties/:id`, `DELETE /parties/:id`
  - `Invoices` (6): `POST /invoices/preview`, `POST /invoices`, `GET /invoices`, `GET /invoices/:id`, `POST /invoices/:id/finalize`, `POST /invoices/:id/cancel`
  - `Purchases` (3): `POST /purchases`, `GET /purchases`, `GET /purchases/:id`
  - `Payments` (3): `POST /payments`, `GET /payments`, `GET /payments/:id`
  - `Inventory` (2): `GET /inventory/movements`, `POST /inventory/adjustments`
  - `Expenses` (4): `POST /expenses`, `GET /expenses`, `GET /expenses/categories`, `DELETE /expenses/:id`
  - `Reports` (5): `GET /reports/sales-register`, `GET /purchase-register`, `GET /stock-summary`, `GET /customer-dues`, `GET /expense-summary`
  - `Dashboard` (1): `GET /dashboard/metrics`
  - `Audit` (1): `GET /audit/logs`

### 3.2 Frontend Architecture (`vyora-frontend`)
- **Framework**: React 19 + Vite 6 + Tailwind CSS 4.
- **Data Layer**: TanStack React Query with centralized API services in `src/api/` and hooks in `src/hooks/`.
- **Component Folder Standard**:
  ```
  ComponentName/
  ├── component/index.tsx   # Pure JSX rendering
  ├── config/
  │   ├── constant/index.ts # Styling constants, limits
  │   ├── interface/index.ts# Props and data models
  │   └── enum/index.ts     # Action types, states
  ├── hook/index.ts         # Hook state orchestration
  ├── util/index.ts         # Formatting and styling helpers
  └── index.ts              # Barrel export
  ```
- **Edge-to-Edge Modals**: Reusable `Modal` in `src/components/ui/Modal/` with dedicated `footer?: React.ReactNode` pinned edge-to-edge.
- **Clean Slate Policy**: Search bars and filters automatically hide when tables have 0 records to avoid visual clutter.
- **Trilingual Support**: English (`en`), Hindi (`hi`), Gujarati (`gu`) via centralized `src/i18n/`.

### 3.3 Mobile Ecosystem (`vyora-app`)
- **Framework**: React Native 0.86 + Expo SDK 57 (Windows development environment).
- **EAS Build Workflow**: Production Android APK build `39ef7ebf-1f44-471a-9815-035a27133287`.
- **OTA Updates**: `npm run update:preview` (`npx eas-cli update --channel preview --platform android`).
- **In-App Highlights**: `WhatsNewModal.tsx` prompts users on version upgrade (`@vyora_last_seen_version`).
- **Bug Reporting**: Web3Forms integration uploading crash logs and screenshots to developer email and Catbox.moe.

---

## 4. Fundamental Business Logic & Accounting Invariants

1. **Paisa Accounting (Minor Currency Units)**:
   - All financial values stored and transmitted in minor units (paisa integers). ₹1,000.50 = `100050`.
   - Never store raw floats. Multiply user rupee input by 100 (`Math.round(rupees * 100)`) on mutation, divide by 100 for display.
2. **GST Taxation Rules**:
   - **Intra-State**: When customer/store state match &rarr; Split evenly into CGST (`rate / 2`) and SGST (`rate / 2`). Odd rates must avoid rounding drift (`SGST = totalTax - CGST`).
   - **Inter-State**: When customer state differs from store state &rarr; Full tax charged as IGST (`igstMinor`), with `cgstMinor: 0` and `sgstMinor: 0`.
   - **Place of Supply (PoS)**: Governed by Section 10(1)(c) of the IGST Act. Counter walk-in retail sales strictly inherit the store's state (`business?.state`).
3. **POS Retail & Counter Invoicing**:
   - Walk-in counter customers have optional phone numbers and `isWalkIn: true` flag to prevent CRM and marketing notification spam.
   - B2C sales under ₹50,000 do not require customer address or GSTIN (Rule 46 CGST).
   - Fast quick-add dialogs do not require purchase price (`purchasePriceMinor` optional, defaults to 0).
4. **Subscription Tiering**:
   - **Starter (Free)**: Up to 50 invoices/mo, 100 products, 1 owner. Purchases, Payments, Tax Reports, and Staff are hidden.
   - **Growth (₹499/mo)**: Unlimited Invoices/Inventory, Purchases, Payments, Reports, up to 3 Staff.
   - **Business Pro (₹999/mo)**: Unlimited Staff, Audited Stock Adjustments, Custom prefixes, Audit trail.

---

## 5. Critical Past Incidents, Root Causes & Fixes

1. **CastError 500 on Tenant Discovery**:
   - *Cause*: `AuthContext` saved `b.id` (undefined) to localStorage as `"undefined"`. Subsequent API calls sent `x-business-id: "undefined"`, causing Mongoose `CastError: Cast to ObjectId failed for "undefined"`.
   - *Fix*: Added DTO mapping for `id` in `BusinessService`, added string sanitization in `TenantGuard` to auto-heal, and purged invalid localStorage keys in frontend `api.ts`.
2. **Product Quick-Add Validation Failure**:
   - *Cause*: Mobile quick-add failed with naked `"Required"` because `purchasePriceMinor` was mandatory in Zod schema and `validationMiddleware` returned raw error messages.
   - *Fix*: Made `purchasePriceMinor` optional with default 0, prefixed validation error envelopes with field names (`purchasePriceMinor: Required`), and added dynamic stock input in mobile POS.
3. **Windows Hermes Bytecode Compilation Crash**:
   - *Cause*: Windows `eas update` without platform flag targeted iOS, failing on missing macOS `hermesc` binaries.
   - *Fix*: Restored 64-bit Windows Hermes binaries and updated EAS scripts with explicit `--platform android`.
4. **Expo Doctor 21/21 Checks**:
   - *Cause*: Multiple lockfiles (`pnpm-lock.yaml` vs `package-lock.json`), deprecated root splash in `app.json`, and unpinned package versions.
   - *Fix*: Standardized on `package-lock.json`, migrated splash configuration to `expo-splash-screen` plugin, and pinned SDK 57 compatible versions.

---

## 6. Mobile Target Architecture Transformation Plan

### 6.1 The User's Production Checklist
| Area | Status | To do |
| :--- | :--- | :--- |
| **Architecture** | Layer-based, large screens | Feature folders, split screens |
| **State/data** | Manual fetch | TanStack Query |
| **Navigation** | String-based | React Navigation, typed routes |
| **Theme** | Two systems | Unify, no hex in screens |
| **Money/GST** | Duplicated, inconsistent | One tested `tax.ts`, IGST support |
| **Mutations** | No idempotency | Add idempotency keys, disable on submit |
| **Offline** | None | Queue for bills in poor connectivity |
| **Errors** | `console.error` | Sentry + error boundary |
| **Tests** | None seen | Jest for tax/money, RNTL for flows |
| **Types** | Some `any` | Strict TS, remove `as any` and `err: any` |
| **Security** | Check tokens | Store in `expo-secure-store`, not AsyncStorage |
| **CI** | Unknown | ESLint, `tsc --noEmit`, tests on PR |
| **Accessibility**| Partial | `accessibilityLabel` on all icon buttons |

### 6.2 The Target Directory Structure
```
src/
├── app/                      # providers, navigation, root setup
│   ├── navigation/
│   └── providers/
├── features/
│   ├── invoices/
│   │   ├── screens/CreateInvoiceScreen.tsx      (~150 lines, composition only)
│   │   ├── components/
│   │   │   ├── CustomerPickerModal.tsx
│   │   │   ├── ProductPickerModal.tsx
│   │   │   ├── QuickAddProductForm.tsx
│   │   │   ├── InvoiceLineRow.tsx
│   │   │   ├── InvoiceSummaryCard.tsx
│   │   │   └── PaymentMethodSelector.tsx
│   │   ├── hooks/
│   │   │   ├── useInvoiceDraft.ts     (lines state + add/remove/qty)
│   │   │   ├── useCreateInvoice.ts    (mutation)
│   │   │   └── useInvoiceTotals.ts
│   │   ├── api/invoices.api.ts
│   │   └── types.ts
│   ├── purchases/            (same shape)
│   ├── parties/              (SupplierPicker/CustomerPicker shared here)
│   ├── products/
│   └── business-profile/
├── shared/
│   ├── ui/                   (Button, Input, Modal, Card, Stepper)
│   ├── hooks/
│   ├── utils/
│   │   ├── money.ts
│   │   └── tax.ts            (single source of truth for GST)
│   └── theme/                (ONE theme system)
└── services/                 (http client, storage, analytics)
```

### 6.3 The User's 7-Step Suggested Order of Work
1. **Fix correctness bugs** (state mutation, UTC date, missing cost editing, IGST, idempotency).
2. **Extract `tax.ts` and `useDraftLines`, add unit tests**.
3. **Unify the theme and strip hard-coded colors**.
4. **Split screens into components** (start with the modals, since they are the biggest chunks).
5. **Introduce TanStack Query and server-side search**.
6. **Move to React Navigation**.
7. **Add Sentry, tests, CI**.

---

## 7. The 37 Audited Technical Gaps (Permanent Catalog)

### Category A: Correctness, Math, Timezone & Mutation Bugs
- **Gap 1 (`CreatePurchaseScreen.tsx#L176` & `CreateInvoiceScreen.tsx#L302`)**: In-place object mutation after shallow `[...lines]` copy (`updated[index].quantity = newQty`), mutating original objects and breaking React re-renders.
- **Gap 2 (`CreateInvoiceScreen.tsx#L404`, `CreatePurchaseScreen.tsx#L242`, `validation.ts#L247`)**: UTC date shift bug (`new Date().toISOString().split('T')[0]`) assigning yesterday's date to transactions between 12:00 AM and 5:29 AM IST.
- **Gap 3 (`CreateInvoiceScreen.tsx#L251`)**: Hardcoded `igstMinor: 0` splits all tax into CGST/SGST, violating IGST Act for inter-state sales.
- **Gap 4 (`CreateInvoiceScreen.tsx#L616`)**: Rate column is static `<Text>`; cashiers cannot edit rate or apply line discounts during checkout.
- **Gap 5 (Financial Mutations across app)**: Zero mutation idempotency (`idempotencyKey` missing on invoice, purchase, payment creation).
- **Gap 6 (`PartiesScreen.tsx#L95, L111`)**: Hardcoded `stateName = 'Gujarat'` instead of inheriting `business?.state`.
- **Gap 7 (`CreateInvoiceScreen.tsx#L250-L253`)**: Odd-percentage tax rounding drift (`Math.round(tax / 2)` independent splits cause `CGST + SGST !== totalTax`).

### Category B: Tax & Calculation Duplication
- **Gap 8**: Mobile duplicates GST math inline instead of consuming a single tested `tax.ts` in sync with `@vyora/utils`.
- **Gap 9**: Zero automated unit tests in `vyora-app`.

### Category C: Theme, Styling & Translation Gaps
- **Gap 10**: 1,267 hardcoded hex values (680 in `screens/`, 587 in `components/`).
- **Gap 11**: Two conflicting theme systems (`theme/colors.ts` static `colors` vs dynamic `ThemeContext`).
- **Gap 12**: 62 hardcoded untranslated `Alert.alert` calls bypassing i18n.

### Category D: Screen & Modal Decomposition
- **Gap 13**: 7 god screens > 1,000 lines (`CreateInvoiceScreen.tsx` is 2,118 lines).
- **Gap 14**: Modals (CustomerPicker, ProductPicker, QuickAdd, Payment, UpiQr) trapped inside screen files.
- **Gap 15**: Duplicated party picker modals across Invoice and Purchase flows.

### Category E: State, Data Fetching & Silent Failures
- **Gap 16**: Manual imperative fetching; no caching, background refetching, or stale-while-revalidate.
- **Gap 17 (`DashboardScreen.tsx#L64-L69` & `HomeScreen.tsx#L75-L79`)**: Silent `.catch(() => ({ items: [] }))` showing misleading ₹0 metrics on network failure.
- **Gap 18 (`AccountScreen.tsx#L140-L146`)**: Phantom staff member creation (failed invites still show "Invite Sent" and inject fake synthetic ID `Date.now().toString()`).
- **Gap 19 (`CreateInvoiceScreen.tsx#L152` & `CreatePurchaseScreen.tsx#L90`)**: Silent `.catch(console.error)` on catalog load leaves pickers empty without notifying user.
- **Gap 20**: In-memory `.filter()` on large catalogs; zero offline draft auto-save.

### Category F: Navigation & Routing
- **Gap 21 (`App.tsx#L159`)**: String-based `useState<ScreenKey>('home')`; Android hardware back button exits app; untyped params.
- **Gap 22**: Deep linking and push notification routing unavailable.

### Category G: Security, Error Handling, Tests & CI
- **Gap 23**: Plaintext JWT storage in `AsyncStorage` instead of `expo-secure-store`.
- **Gap 24**: Missing global Error Boundary and Sentry crash telemetry.
- **Gap 25**: 119 `any` occurrences; missing CI workflow (`tsc --noEmit`, ESLint, tests).

### Category H: Accessibility
- **Gap 26**: 98.6% of touchable icon buttons lack `accessibilityLabel`.

### Category I: Auth, Session, Recovery & Access Control
- **Gap 27**: Phone-only accounts permanently locked out on forgot password (requires email, no self-serve recovery).
- **Gap 28**: Insecure password reset (Step 2 lacks signed JWT `resetToken`; Step 3 replays plain OTP).
- **Gap 29**: Hardcoded static password (`VyoraStaff@123`) for staff invites; no forced password set flow.
- **Gap 30**: Staff invites strictly demand email (no phone invites).
- **Gap 31**: Missing `/auth/refresh` backend endpoint and mobile silent refresh (abrupt 24h logouts mid-bill).
- **Gap 32**: Deactivated staff retain 24h access (zombie tokens; missing `Membership.isActive: true` check in `authMiddleware`).
- **Gap 33**: Stale role on workspace switch (`AuthContext` never updates `user.role` on switch).
- **Gap 34**: No session revocation (`tokenVersion`) on password change or reset.
- **Gap 35**: Phone regex bug in `api/auth.ts` (`/^[0-9]{10}$/` fails on `+91` or spaces, treating phone as invalid email).
- **Gap 36**: Silent mock return on profile update failure (`catch { return data as User; }`).
- **Gap 37**: Customer OTP login role breach in app shell (`CUSTOMER` role has no restricted view in `App.tsx`, granting access to billing and products).

### Category J: Customers, Parties & Ledger Gaps
- **Gap 38 (`PartyLedgerModal.tsx#L51-L65`)**: Client-side ledger filtering vulnerability & truncation; fetches latest 100 business purchases and filters in-memory on client; older supplier purchases disappear.
- **Gap 39 (`InvoicesScreen.tsx#L67-L81`, `PaymentModal.tsx#L98-L106`)**: Anonymous counter customer payment misallocation; settling an anonymous walk-in customer bill auto-selects `res.items[0]`, crediting the cash to a random registered customer.
- **Gap 40 (`PartiesScreen.tsx#L333-L370`)**: Incomplete party address & missing B2B billing fields; Add/Edit modal omits Street Address / Line 1, Shipping Address, and PAN.
- **Gap 41 (`CreateInvoiceScreen.tsx#L116-L140`)**: Runaway duplicate "Walk-in Customer" creation loop; if walk-in customer is not in first 100 returned items, opening the create bill screen repeatedly creates duplicate records.
- **Gap 42 (`PartiesScreen.tsx#L400-L430`, `CreateInvoiceScreen.tsx#L393-L400`)**: Missing credit limit & overdue aging enforcement; cashiers can create unlimited credit bills for defaulting customers with large unpaid balances without warning.
- **Gap 43 (`PartyLedgerModal.tsx#L140-L200`)**: Party ledger statement sharing & export gap; no PDF or CSV statement generator to send official debits/credits history to customers or suppliers.

### Category K: Invoicing, POS Counter & Payment Allocation Gaps
- **Gap 44 (`InvoicesScreen.tsx#L350-L490`, `TransactionDetailModal.tsx#L700-L755`)**: Complete absence of invoice cancellation in mobile UI; backend endpoint `POST /invoices/:id/cancel` exists, but mobile UI provides zero cancellation options for mistaken bills.
- **Gap 45 (`CreateInvoiceScreen.tsx#L411, L450`)**: Rigid "today" due date & missing credit payment terms; `dueDate: today` is hardcoded; no Net-15, Net-30, or custom credit due date picker.
- **Gap 46 (`CreateInvoiceScreen.tsx#L414`)**: Card / Bank settlement drop on fast invoice creation; submission handler only maps `isCash` and `isUpi`, mapping CARD/BANK to `undefined` and turning paid sales into unpaid credit bills.
- **Gap 47 (`CreateInvoiceScreen.tsx#L413`)**: Lack of draft bill saving / counter parking; `finalize: true` is hardcoded; cashiers cannot park a bill when a customer steps aside.
- **Gap 48 (`CreateInvoiceScreen.tsx#L415-L420`)**: Absence of line discounts & invoice-level roundoff / festive discounts; line items lack `discountPercent` and invoice totals lack flat cash roundoff.

### Category L: Profile, Settings, Staff Administration & Reporting Gaps
- **Gap 49 (`SettingsScreen.tsx#L125-L177`)**: Disconnected & ephemeral app settings; print size, tax slabs, and roundoff are stored only in device `AsyncStorage` with zero backend sync, and are ignored during billing.
- **Gap 50 (`SettingsScreen.tsx`, `EditProfileModal.tsx`)**: Missing bank account & primary UPI settlement configuration; no bank name, account number, IFSC code, or primary settlement VPA configuration for invoice payment instructions.
- **Gap 51 (`AccountScreen.tsx#L424-L439`)**: Read-only staff list with zero administration capabilities; staff accounts are rendered as an immutable static list with no role change, status toggle, or removal actions despite backend endpoints existing.
- **Gap 52 (`AuthContext.tsx#L413-L416`, `BusinessProfileScreen.tsx#L128-L135`)**: Silent swallowing & fake success on business profile update; `updateBusiness` catches errors without rethrowing; screen displays "Profile Saved" even if the server rejected the update.
- **Gap 53 (`BusinessProfileScreen.tsx`, `CreateInvoiceScreen.tsx#L89`)**: Missing default invoice terms & conditions; no customizable default terms & conditions in business profile or settings to automatically stamp invoices.
- **Gap 54 (`ReportsScreen.tsx#L47-L65`)**: Hardcoded single-day reports & missing date range filtering; Daybook only filters in-memory for `todayStr`; no yesterday, monthly, or custom date range filtering; no CA export for GSTR-1/3B.
- **Gap 55 (`App.tsx#L155-L250`)**: Absence of global Error Boundary & offline state guard; no React `<ErrorBoundary>` surrounds the main app navigation stack; unexpected runtime exceptions crash the app to the home screen.

### Category M: Profile, Identity & Media Management Gaps
- **Gap 56 (`SignatureModal.tsx#L201-L245`)**: Base64 signature DB document bloat & 413 payload explosion; gallery/camera signatures encode multi-megabyte base64 strings directly into MongoDB, triggering Express 413 errors.
- **Gap 57 (`BusinessProfileScreen.tsx#L75-L82`)**: Fallback to local device file URI on Cloudinary upload failure; errors save `file:///data/user/0/...` in MongoDB, breaking the business logo on all other devices and web dashboard.
- **Gap 58 (`EditUserProfileModal.tsx#L30-L65`)**: Immutable profile identity (phone & email lockout); modal allows editing only name and avatar, locking merchants out of updating or verifying their phone or email.

### Category N: Billing, Subscription & Multitenancy Gaps
- **Gap 59 (`AccountScreen.tsx#L586-L595`, `AuthContext.tsx#L439-L453`)**: Phantom mobile subscription upgrades & wrong API endpoint; mobile calls `PUT /business/current` instead of `PUT /business/plan`; backend never updates plan while app mutates local storage to show false active status.
- **Gap 60 (`AccountScreen.tsx#L586-L595`, `UpiQrModal.tsx`)**: Zero payment verification & free tier bypass in mobile plan checkout; tapping "I have paid" instantly activates paid tiers without UTR entry or payment gateway verification.
- **Gap 61 (`WorkspaceSwitcherModal.tsx#L77-L98`)**: Broken store switching lockout for multitenant staff; checks `isStarter && isOwner` on current store, permanently trapping owners in a free store even if invited to a paid store.

### Category O: Roles, RBAC & Missing Mobile Modules
- **Gap 62 (`App.tsx#L127-L153`, `DashboardScreen.tsx`)**: Business turnover & margin leakage to counter staff in Dashboard; `dashboard` tab is accessible to `STAFF`, exposing total gross revenue and profit margins.
- **Gap 63 (`HomeScreen.tsx#L76, L124-L136`)**: Supplier purchase data leakage to counter staff on Home Screen; fetches supplier purchases into home feed, exposing supplier names and inward costs to staff.
- **Gap 64 (`MenuScreen.tsx#L294`)**: Complete absence of Purchases Register / Bill List; tapping "Purchase Bills" in menu redirects to Dashboard because no purchase list screen exists.
- **Gap 65 (`vyora-app/src/screens`)**: Complete absence of Payments & Vouchers Ledger Screen; no screen exists to view, search, or filter customer receipts and supplier payments.
- **Gap 66 (`CreateInvoiceScreen.tsx`)**: Absence of barcode camera scanning for POS checkout; cashiers must manually type and search every single product name.
- **Gap 67 (`SettingsScreen.tsx#L105`, `invoicePdf.ts`)**: Fake thermal print setting & broken receipt layout; paper size toggle is ignored and `invoicePdf.ts` prints unreadable microscopic A4 layouts on thermal printers.
- **Gap 68 (`SettingsScreen.tsx`, `AccountScreen.tsx`)**: Missing account deletion / data erasure flow (Google Play policy blocker); no in-app account deletion mechanism, risking Play Store rejection.
- **Gap 69 (`vyora-app/src/screens`)**: Absence of stock movement / inventory audit ledger screen; no screen to inspect stock deduction history, wastage, or adjustment audits.

### Category P: Advanced Backend Architecture, Security & POS Gaps
- **Gap 70 (`InvoicesService.ts#L96-L160`, `PurchasesService.ts#L90-L150`)**: Lack of MongoDB ACID Transaction Session across invoice save, stock movement, ledger update, and payment receipt (partial commits on crash).
- **Gap 71 (`expenses/route/index.ts#L23`)**: Unprotected `DELETE /api/v1/expenses/:id` (lacks `requireRoles('OWNER', 'ADMIN')`); staff can delete company expense logs.
- **Gap 72 (`PaymentsService.ts#L125-L127`)**: Voucher numbering race condition (`countDocuments({ businessId }) + 1`) generating duplicate voucher numbers on concurrent payments.
- **Gap 73 (`purchases/model/index.ts#L18`, `PurchasesService.ts`)**: Collapse of purchase tax into single scalar `totalTaxMinor` without CGST/SGST/IGST breakdown, preventing GSTR-3B Input Tax Credit (ITC) claims.
- **Gap 74 (`reports/service/index.ts#L30-L75`)**: Lack of official GSTR-1 tables (Table 4 B2B, Table 5 B2C Large, Table 7 B2C Small, Table 12 HSN Summary).
- **Gap 75 (`CreateInvoiceScreen.tsx#L280-L310`)**: Rigid integer stepper (`+` and `-` by 1) with no numeric input; impossible to bill fractional/decimal quantities (KG, LTR, MTR) or type 50 items.
- **Gap 76 (`App.tsx#L155-L250`)**: Complete absence of Android hardware back button handling (`BackHandler` missing); pressing back kills the app.
- **Gap 77 (`App.tsx`, `client.ts`)**: Missing offline connectivity detection (`NetInfo`) and status banner; actions hang for 30s on drop.
- **Gap 78 (`App.tsx`, `SettingsScreen.tsx`)**: Missing biometric app lock (`expo-local-authentication`) for POS counter cashier security.
- **Gap 79 (`InvoicesService.ts#L96-L105`)**: Missing invoice creation idempotency check in `InvoicesService.create`, allowing rapid double-billing on network lag.

### Category Q: RBAC & Multitenant Security Inversions
- **Gap 80 (`invoices/route/index.ts#L18`, `parties/route/index.ts#L17`, `payments/route/index.ts#L17`)**: Critical RBAC inversion on counter billing operations; `POST /invoices`, `POST /parties`, `POST /payments` require `'OWNER', 'ADMIN'`, completely blocking `STAFF` cashiers from creating sales bills or registering counter walk-in customers.
- **Gap 81 (`dashboard/route/index.ts#L9`, `reports/route/index.ts#L9-L19`, `expenses/route/index.ts#L20-L23`)**: Unprotected financial metrics & complete data exfiltration exposure; any staff token can view gross margins, net profit, and download customer debt and supplier cost registers.
- **Gap 82 (`tenant/index.ts#L27-L32`)**: Cross-tenant admin impersonation & authorization bypass; `tenantMiddleware` bypasses membership checks if user holds `role: 'ADMIN'`, allowing access to any other business via `x-business-id`.
- **Gap 83 (`business/service/index.ts#L240`)**: Cross-tenant global `UserModel.role` corruption; updating staff role in Store A mutates global user account document, stripping owner permissions in Store B.
- **Gap 84 (`auth/service/index.ts#L29`)**: Ephemeral in-memory OTP store in Node.js heap; server restarts or multi-instance load balancing wipes active OTPs, causing login and reset failures.

### Category R: Core Accounting, Inventory & Return Flows
- **Gap 85 (Monorepo & Mobile Architecture)**: Complete absence of Credit Notes (Sales Return) & Debit Notes (Purchase Return); cannot legally process returns, restock returned goods, reverse GST liability, or file GSTR-1 Table 9B.
- **Gap 86 (`inventory/service/index.ts#L26-L34`)**: Inventory read-modify-write concurrency race condition; concurrent counter checkout causes lost updates and untracked stock depletion.
- **Gap 87 (`products/service/index.ts#L165`)**: Inventory loss & damage adjustments misclassified as sales; negative stock write-offs record `movementType: 'SALE'`, corrupting sales revenue and tax audits.
- **Gap 88 (`purchases/service/index.ts#L95-L106`)**: Purchase inward cost updates ignored in product master; incoming supplier bills do not update `purchasePriceMinor`, leading to stale catalog costs and skewed profit margins.
- **Gap 89 (`products/model/index.ts#L42`)**: Rigid GST tax enums excluding statutory 3% (jewellery) and 0.25% (diamonds) rates, blocking gemstone and jewellery merchants.
- **Gap 90 (`payments/service/index.ts#L49-L53`)**: Strict rejection of customer advance / overpayment in voucher allocation; payment crashing with 400 when customer pays rounded excess.

### Category S: Mobile POS, Hardware & Offline Gaps
- **Gap 91 (`UpiQrModal.tsx#L59-L63`)**: Security & privacy breach in UPI QR generation via external web service (`api.qrserver.com`); leaks invoice amounts and merchant VPAs over HTTP and fails when offline.
- **Gap 92 (`InvoicesScreen.tsx#L105-L110`, `ProductsScreen.tsx`, `PartiesScreen.tsx`)**: Missing infinite scroll & list pagination in mobile app; hardcoded limits prevent viewing bills or customers beyond 50/100 items.
- **Gap 93 (`ReportsScreen.tsx#L47-L102`)**: Incomplete Daybook reconciliation missing cash purchases and supplier payout vouchers (`PAYMENT_OUT`), misstating daily closing cash-in-hand.
- **Gap 94 (`PartyLedgerModal.tsx#L268-L330`)**: Disconnected party ledger display lacking chronological interleaving and running balances (Debit, Credit, Balance).
- **Gap 95 (`InvoicesScreen.tsx`, `ReportsScreen.tsx`)**: Missing date range filtering across mobile registers; merchants cannot audit sales for specific custom date periods.

---

## 8. Authoritative AI Invariants & Behavioral Rules

- **Rule GG: Absolute Git & Remote DB Invariant**:
  - **NEVER RUN `git commit` OR `git push`**: All code modifications must remain uncommitted in the local tree for user review.
  - **NEVER MUTATE REMOTE DATABASES**: Zero test records, seeds, or mutation requests against live production databases (Render, MongoDB Atlas).
- **Rule HH: The DRY & Centralized Single Source of Truth**:
  - Change once, reflect everywhere. All tax formulas, money math, and design tokens must be centralized into `shared/`.
- **Rule II: Zero Silent Errors & Meaningful User Messages**:
  - No empty catches (`catch (e) {}`), no silent fallback arrays (`.catch(() => ({ items: [] }))`), no fake optimistic IDs on failure. Surfaced messages must be concise, localized via `t(...)`, and actionable.
- **Rule JJ: Mobile Domain Architecture & Screen Decomposition**:
  - Screens must be lean composition coordinators targeting ~150–250 lines. Modals and complex components must be extracted into feature folders.
- **Rule DD: EAS Build & Platform Pinning**:
  - Android-only flag `--platform android` for EAS commands on Windows machines. Keep `npx expo-doctor` at 21/21 passed.

---

## 9. Continuity Protocol for Any Incoming AI Assistant

If context is ever reset, compacted, or transferred to another agent:
1. **Read this file (`gravitycontext.md`)** to understand the complete architecture, invariants, and catalog of 95 gaps.
2. **Read `docs/MOBILE_ARCHITECTURE_AND_GAPS.md`** for full code snippets and technical mechanisms of each gap.
3. **Follow the user's 7-Step Suggested Order of Work**: Never invent alternative roadmaps or skip steps.
4. **Always preserve Rule GG**: Keep all code uncommitted in the working tree. Never commit or push.
