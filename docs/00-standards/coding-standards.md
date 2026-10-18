# Vyora Coding Standards & Invariants

> **Mandatory**: Every AI agent and human engineer must adhere strictly to these rules before writing or reviewing code.

---

## 1. Monetary Values: Strict Minor Units (Paisa)

Floating-point arithmetic in JavaScript creates rounding inaccuracies (e.g. `0.1 + 0.2 === 0.30000000000000004`), which can cause GST and ledger reconciliation discrepancies.

### Invariants:
1. **Never store or calculate money as floating-point Rupees.**
2. **All monetary values are integers representing minor units (paisa)** (1 INR = 100 Paisa).
3. **Database Schema fields must end in `Minor`**:
   - `sellingPriceMinor`, `purchasePriceMinor`, `taxableMinor`, `cgstMinor`, `sgstMinor`, `igstMinor`, `totalTaxMinor`, `grandTotalMinor`, `dueMinor`, `amountMinor`.
4. **Formatting**:
   - Web: Use `@vyora/utils` or `src/utils/currency.ts`: `formatCurrency(minorAmount)` &rarr; `₹1,250.00`.
   - Mobile: Use `src/utils/currency.ts`: `formatCurrency(minorAmount)`.
   - Converting for display input: `minorToMajor(minorAmount)` (e.g. `125000` &rarr; `1250.00`).
   - Parsing from user input: `majorToMinor(rupees)` (e.g. `"1250.00"` &rarr; `125000`).

---

## 2. Multi-Tenancy & Data Isolation

Vyora is a multi-tenant platform. A tenant corresponds to a `businessId`.

### Invariants:
1. Every collection schema (Products, Invoices, Customers, Purchases, Expenses) MUST have an indexed `businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true }`.
2. Every database query in NestJS services MUST include `{ businessId }` extracted from the authenticated user (`req.user.businessId`).
3. Cross-tenant leakage is a critical P0 security failure. Never execute `.find()` or `.findById()` without verifying tenant ownership.

---

## 3. UI Component Architecture & Limits

### A. Screen & Page Length Limit
- **Max 400 lines** per Page or Screen component.
- If a screen grows beyond 400 lines:
  - Extract complex dialogs and sheets into standalone components (`ProductFormModal.tsx`, `RecordExpenseModal.tsx`).
  - Extract state, queries, and filters into a custom hook (`useProductsScreen.ts`, `useInvoiceWizard.ts`).

### B. Form Validation & Required Field Asterisks
- All required form inputs must have a red asterisk on the label:
  - Web: `<span className="text-[#B91C1C] font-bold">*</span>` or `<span className="text-red-500 font-bold">*</span>`
  - Mobile: `<Text style={{ color: theme.error, fontWeight: '700' }}>*</Text>`
- Form schemas must be validated using Zod schemas before API dispatch.

### C. Modal Footer Architecture
- Modal footers must have clear hierarchy:
  - Primary Action (Save / Submit / Confirm) on the right (Web) or top (Mobile full-width).
  - Secondary Action (Cancel / Back) on the left (Web) or bottom (Mobile full-width).
  - Web responsive rule: On small viewports, stack buttons vertically with full width (`flex flex-col-reverse sm:flex-row sm:justify-end gap-2`).

### D. Zero-Data Clean Slate (Fallback UI)
- Never show an empty blank table or an infinite spinner.
- Distinguish between:
  - **Zero data recorded**: Show `<EmptyState>` with a relevant domain icon (`Package`, `FileText`, `Users`) and a clear Call-To-Action ("Create First Product").
  - **No records match filters**: Show "No matching records found" with a "Reset Filters" action button.

### E. Debounced Search Inputs
- All search input components (`<SearchInput>` on web, `<SearchBar>` on mobile) must debounce user input by at least **300ms** before triggering query re-fetches.

---

## 4. API Response Envelope

Every backend API response must adhere to the standard JSON envelope:

```typescript
// Success Response (HTTP 200/201)
{
  "success": true,
  "data": { ... },
  "message": "Product created successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}

// Error Response (HTTP 400/401/403/404/500)
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Product SKU already exists for this business",
  "errors": [
    { "field": "sku", "message": "SKU 'PROD-001' is already in use" }
  ],
  "timestamp": "2026-10-18T00:00:00.000Z",
  "path": "/api/v1/products"
}
```

---

## 5. Mobile Dynamic Theme Invariant

- **Zero Hardcoded Colors**: In `vyora-app`, never use raw hex strings (`#0F766E`, `#FFFFFF`, `#123B3A`) in `StyleSheet.create` or inline styles.
- Always use `useTheme()` to retrieve tokens:
  ```tsx
  const { theme, isDark } = useTheme();
  // Use theme.background, theme.card, theme.text, theme.primary, theme.border
  ```
- Cross-platform check: Always import `Platform` from `'react-native'` when invoking `Platform.select(...)`.

---

## 6. Testing & Quality Gate

1. **Backend**: Endpoints must pass unit/e2e tests with mock database or isolated in-memory mongo.
2. **Web Frontend**: Must compile with `npm run build` (`tsc -b && vite build`) with zero TypeScript errors.
3. **Mobile App**: Must compile cleanly with `npx expo export --platform web` (or `npx tsc --noEmit`) with zero bundle or syntax errors.

---

## 7. Security & Vulnerability Policy (High Priority / P0 Invariant)

> **MANDATORY**: Any security vulnerability, exploit vector, or data integrity flaw discovered in Vyora code must be flagged with **HIGH / CRITICAL PRIORITY (P0)** and resolved immediately before proceeding with feature development.

### A. Immediate Action on Vulnerability Discovery
1. **Halt & Prioritize**: If an AI agent or developer identifies a security vulnerability, work on standard features is blocked until the vulnerability is addressed or formally mitigated.
2. **Immediate User Notification**: Instantly notify the user with:
   - **Severity**: Critical (P0) / High (P1)
   - **Type**: (e.g. Broken Tenant Isolation, NoSQL Injection, Secret Exposure, Auth Bypass, IDOR, XSS, SSRF, Dependency CVE)
   - **Affected Files**: Clickable links with line numbers
   - **Impact**: Real-world business risk (e.g., cross-tenant data exposure, unauthorized ledger tampering)
   - **Resolution Plan**: Drop-in fix applied or proposed.

### B. Core Vulnerability Defense Invariants
1. **Tenant Isolation (IDOR & Data Leakage)**:
   - Every database query (`find`, `findOne`, `findOneAndUpdate`, `deleteOne`, aggregation pipelines) MUST explicitly filter by `businessId`.
   - Never rely solely on an entity's `_id` supplied in request parameters without verifying `businessId: req.user.businessId`.
2. **NoSQL / Query Injection Defense**:
   - Never pass unsanitized `req.body`, `req.query`, or `req.params` directly into Mongoose filters.
   - All payloads must pass through strict Zod schemas or NestJS DTOs with `whitelist: true` and `forbidNonWhitelisted: true`.
3. **Authentication & Authorization**:
   - Never expose administrative or tenant endpoints without `JwtAuthGuard` and `TenantGuard`.
   - Refresh tokens must be hashed, rotatable, and revokable upon logout or password reset.
4. **Zero Secrets in Code or Logs**:
   - Database connection URIs, API keys, JWT secrets, and Cloudinary secrets must never be hardcoded, logged to console, or committed to git.
   - Run `node scripts/check-secrets.js` before releases.
5. **Dependency Vulnerability Scanning**:
   - Run `npm audit` across Backend, Frontend, and Mobile packages. Flag dependencies with High or Critical CVEs and update or patch them immediately.

