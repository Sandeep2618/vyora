# GAP-002: Web App Parity with Mobile App & Flow Gap Roadmap

> **Document ID**: GAP-002  
> **Target Platform**: Vyora Web Frontend (`vyora-frontend`) vs Vyora Mobile (`vyora-app`)  
> **Shared Foundation**: Vyora Backend (`vyora-backend`)  
> **Status**: Approved for Implementation  
> **Inspection Date**: 2026-10-18  
> **Standard**: 100% verified against exact codebase files and line numbers. Zero speculation.

---

## Executive Overview

Vyora Mobile (`vyora-app`) and Vyora Web (`vyora-frontend`) share the same unified Node.js/MongoDB backend (`vyora-backend`). Because the backend schemas already support the mobile app, the backend data models and APIs are fully equipped.

However, a deep-dive codebase audit reveals significant **functional and flow gaps where the Web Frontend lags behind the Mobile App**. This document catalogues every missing feature, workflow friction, and architectural discrepancy in `vyora-frontend`, providing a clear blueprint to achieve **100% feature and workflow parity**.

---

## Quick Reference: Mobile vs Web Feature Parity Matrix

| Feature / Workflow | Mobile App (`vyora-app`) | Web App (`vyora-frontend`) | Parity Status in Web |
| :--- | :--- | :--- | :--- |
| **1. Store Expenses Module** | Full `ExpensesScreen` with categories, breakdowns, and `RecordExpenseModal`. | **Completely Missing**. No `/expenses` route, no sidebar link, no UI. | ❌ **0% - Missing Entire Module** |
| **2. Multi-Store Switcher** | 1-Tap `WorkspaceSwitcherModal` with store switching & "+ Create Store". | Static `div` in header. No switcher dropdown or modal. | ❌ **0% - Missing Feature** |
| **3. Customer Ledger Statement** | `PartyLedgerModal` with date-wise invoices/payments, running balance & PDF export. | No statement view. Party table only has Edit & Delete. | ❌ **0% - Missing Feature** |
| **4. 1-Tap Khata Debt Collect** | Prominent `Collect ₹` button on debtor cards opening `PaymentModal`. | Must navigate to `/payments`, open modal, and re-type customer. | ⚠️ **Flow Gap - High Friction** |
| **5. WhatsApp Payment Reminder** | 1-Tap deep link with balance reminder and dynamic merchant UPI link. | No WhatsApp reminder trigger (`https://wa.me/...`). | ❌ **0% - Missing Feature** |
| **6. Counter POS 1-Tap Cash Sale** | Instant "1-Tap Cash" button marks bill as `PAID` upon saving. | Invoices only save as `DRAFT` or `ISSUED`. Requires 2nd payment step. | ⚠️ **Flow Gap - Missing Cash Checkout** |
| **7. UPI QR Code at Counter** | `UpiQrModal` renders dynamic UPI QR for customer counter scan. | No UPI QR code generator or modal. | ❌ **0% - Missing Feature** |
| **8. Product Select in Billing** | Keypad steppers (`+`/`-`), search by SKU/name, fractional quantities. | Native `<select>` dropdown (unsearchable for 100+ items); `step="1"`. | ⚠️ **UX Bottleneck in Web** |
| **9. Invoice Table Direct Actions**| 1-Tap Print, Share PDF, and WhatsApp directly from cards. | Only has "View Details", "Finalize", and "Cancel". | ⚠️ **Flow Gap - Missing Quick Actions** |
| **10. 80mm Thermal Receipt Layout**| Dedicated 58mm/80mm ESC/POS roll format. | Only renders full A4 desktop page; no thermal print CSS. | ❌ **0% - Missing Format** |
| **11. Digital Signature Canvas** | Touch canvas drawing pad (`SignatureModal.tsx`) embedding in bills. | No signature drawing pad or upload in business settings. | ❌ **0% - Missing Feature** |
| **12. Unified Transactions Stream**| `HomeScreen` aggregates Sales, Purchases, Expenses, & Payments with 3-dot sheet.| `DashboardPage` only shows recent invoices in a table. | ⚠️ **Flow Gap in Dashboard** |
| **13. Profit & Loss Report** | Gross profit and product margins based on `purchasePrice` vs `sellingPrice`. | Only has Sales, Purchases, Stock, and Customer Dues. | ❌ **0% - Missing P&L Tab** |

---

## Detailed Code-Verified Gap Breakdown

---

### GAP-002.1: Missing Store Expenses Module (`/expenses`)
- **Mobile Implementation**:
  - [`vyora-app/src/screens/ExpensesScreen.tsx`](file:///D:/project/vyora-app/src/screens/ExpensesScreen.tsx): Category breakdown cards, dynamic category selector, petty cash expense list with delete confirmation.
  - [`vyora-app/src/components/RecordExpenseModal.tsx`](file:///D:/project/vyora-app/src/components/RecordExpenseModal.tsx): Allows recording expense number, date, category, amount, payment mode (Cash, UPI, Bank Transfer), and GST toggle.
- **Backend Readiness**:
  - Full schema [`ExpenseSchema`](file:///D:/project/vyora/vyora-backend/src/modules/expenses/model/index.ts) with `businessId`, `amountMinor`, `category`, `paymentMethod`, `isGst`, `items`.
  - Controller endpoints in [`ExpensesController`](file:///D:/project/vyora/vyora-backend/src/modules/expenses/controller/index.ts): `GET /api/v1/expenses`, `POST /api/v1/expenses`, `DELETE /api/v1/expenses/:id`, `GET /api/v1/expenses/breakdown`, `GET /api/v1/expenses/categories`.
- **Web Frontend Code Gap**:
  - [`vyora-frontend/src/App.tsx#L65-L86`](file:///D:/project/vyora/vyora-frontend/src/App.tsx#L65-L86): No `/expenses` route registered.
  - [`vyora-frontend/src/components/layout/AppLayout.tsx#L106-L115`](file:///D:/project/vyora/vyora-frontend/src/components/layout/AppLayout.tsx#L106-L115): No Expenses item in `allNavItems` sidebar.
  - No `src/pages/expenses` directory exists in `vyora-frontend`.
- **Required Web Implementation**:
  1. Create `src/pages/expenses/index.tsx` with category breakdown cards and paginated expenses table.
  2. Create `RecordExpenseModal` supporting Quick Expense entry (Category + Amount + Payment Mode).
  3. Register `/expenses` route in `App.tsx` and add `Receipt` icon link to `AppLayout.tsx`.

---

### GAP-002.2: Missing Multi-Store Branch Switcher in Web Header
- **Mobile Implementation**:
  - [`vyora-app/src/components/Header.tsx`](file:///D:/project/vyora-app/src/components/Header.tsx): Interactive store pill with chevron.
  - [`vyora-app/src/components/WorkspaceSwitcherModal.tsx`](file:///D:/project/vyora-app/src/components/WorkspaceSwitcherModal.tsx): Lists all owned stores, active store checkmark, 1-tap tenant switch, and "+ Create New Store" button.
- **Backend Readiness**:
  - Supported via `POST /api/v1/auth/switch-business` ([`AuthController.switchBusiness`](file:///D:/project/vyora/vyora-backend/src/modules/auth/controller/index.ts#L61-L85)).
- **Web Frontend Code Gap**:
  - [`vyora-frontend/src/components/layout/AppLayout.tsx#L178-L183`](file:///D:/project/vyora/vyora-frontend/src/components/layout/AppLayout.tsx#L178-L183):
    ```tsx
    <div className="h-9 flex items-center gap-1.5 px-3 bg-[#F4F8F7] ...">
      <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
      <span className="truncate max-w-[100px]">{business?.name || 'My Business'}</span>
    </div>
    ```
    The business badge is a static non-clickable element! A merchant with 2 or 3 stores cannot switch stores on the web app.
- **Required Web Implementation**:
  1. Transform business badge into a dropdown or modal trigger (`StoreSwitcherDropdown`).
  2. Display list of user's businesses fetched from `user.businesses` or `/auth/me`.
  3. Call `authApi.switchBusiness(businessId)` and reset React Query cache (`queryClient.clear()`).
  4. Include "+ Create New Store" modal button.

---

### GAP-002.3: Customer Khata Ledger Statement & 1-Tap Collection in Parties
- **Mobile Implementation**:
  - [`vyora-app/src/components/PartyLedgerModal.tsx`](file:///D:/project/vyora-app/src/components/PartyLedgerModal.tsx): Complete chronological statement showing opening balance, debit invoices, credit payments, running balance, and PDF statement generation.
  - [`vyora-app/src/screens/PartiesScreen.tsx#L456-L470`](file:///D:/project/vyora-app/src/screens/PartiesScreen.tsx#L456-L470): Direct `Collect ₹` button on debtor cards.
  - [`vyora-app/src/screens/PartiesScreen.tsx#L481-L490`](file:///D:/project/vyora-app/src/screens/PartiesScreen.tsx#L481-L490): 1-Tap WhatsApp balance reminder with pre-filled text and merchant UPI ID.
- **Web Frontend Code Gap**:
  - [`vyora-frontend/src/pages/parties/components/PartyTable/component/index.tsx#L110-L117`](file:///D:/project/vyora/vyora-frontend/src/pages/parties/components/PartyTable/component/index.tsx#L110-L117): Action column strictly renders `Edit` and `Delete`.
  - There is no way to view a customer's statement, see their transaction history, collect debt from the table, or send a WhatsApp reminder.
- **Required Web Implementation**:
  1. Add `Statement / Ledger` modal (`PartyStatementModal`) accessible from each row in `PartyTable`.
  2. Add `Collect Payment` button on debtor rows that opens `RecordVoucherModal` pre-filled with `type: 'RECEIPT'`, `partyId`, and outstanding balance.
  3. Add `WhatsApp Reminder` button generating deep link `https://wa.me/<phone>?text=...` with invoice balance and merchant UPI VPA.

---

### GAP-002.4: Counter POS Fast Cash Checkout in Invoice Creation
- **Mobile Implementation**:
  - [`vyora-app/src/screens/CreateInvoiceScreen.tsx#L670-L683`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L670-L683):
    - **"1-Tap Cash"** button (`handleQuickCashSettlement`) creates the invoice and settles it immediately with `status: 'PAID'` and `paidAmountMinor: grandTotalMinor`.
    - Payment Method pills (Cash, UPI, Credit) allow instant payment selection before saving.
- **Web Frontend Code Gap**:
  - [`vyora-frontend/src/pages/invoices/create/index.tsx#L153-L175`](file:///D:/project/vyora/vyora-frontend/src/pages/invoices/create/index.tsx#L153-L175):
    - Mutation only calls `/invoices?finalize=true` or `/invoices?finalize=false`.
    - There is **no payment method selector** and **no cash settlement trigger**.
    - Every invoice created on the web is saved as UNPAID with `paidAmountMinor: 0`. To record cash, the cashier is redirected to `/invoices/:id` and must manually click "Record Payment" in a separate step.
- **Required Web Implementation**:
  1. Add Payment Method selector (`CASH`, `UPI`, `CREDIT`) on `CreateInvoicePage`.
  2. Add primary CTA: **"1-Tap Cash Sale"** and **"Save & Finalize"**.
  3. When Cash or UPI is selected, automatically record settlement on backend or pass payment allocation in invoice creation payload.

---

### GAP-002.5: Line Items Usability & Searchable Product Autocomplete
- **Mobile Implementation**:
  - Search input with debounced catalog filtering.
  - Line items use keypad steppers (`+` and `-`) for rapid counter entry.
  - Supports decimal quantities (e.g., `2.5` KG).
- **Web Frontend Code Gap**:
  - [`vyora-frontend/src/pages/invoices/components/create/InvoiceLineItemsTable/component/index.tsx#L104-L126`](file:///D:/project/vyora/vyora-frontend/src/pages/invoices/components/create/InvoiceLineItemsTable/component/index.tsx#L104-L126):
    - Uses native `<select>` dropdown. If catalog has 500 items, the user must scroll through 500 unsearchable `<option>` tags.
    - Quantity input enforces `step="1"` ([`#L141`](file:///D:/project/vyora/vyora-frontend/src/pages/invoices/components/create/InvoiceLineItemsTable/component/index.tsx#L141)), rejecting fractional/decimal quantities.
  - [`vyora-frontend/src/pages/invoices/components/create/InvoiceCustomerHeader/component/index.tsx#L41-L58`](file:///D:/project/vyora/vyora-frontend/src/pages/invoices/components/create/InvoiceCustomerHeader/component/index.tsx#L41-L58):
    - Customer selection is also a raw `<select>` dropdown without search or balance display.
- **Required Web Implementation**:
  1. Replace native `<select>` with a searchable autocomplete Combobox for Products and Customers.
  2. Display customer's current balance and phone directly inside the customer picker.
  3. Change quantity input to `step="any"` to support fractional retail weights/lengths.

---

### GAP-002.6: Direct Actions in Invoice List Table
- **Mobile Implementation**:
  - Each invoice card in [`InvoicesScreen.tsx#L250-L280`](file:///D:/project/vyora-app/src/screens/InvoicesScreen.tsx#L250-L280) has 1-tap buttons for:
    - `Print`
    - `Share PDF`
    - `WhatsApp`
- **Web Frontend Code Gap**:
  - [`vyora-frontend/src/pages/invoices/components/list/InvoiceTable/component/index.tsx#L105-L135`](file:///D:/project/vyora/vyora-frontend/src/pages/invoices/components/list/InvoiceTable/component/index.tsx#L105-L135):
    - Table actions are restricted to: `View Details` (navigates away), `Finalize` (if draft), and `Cancel`.
    - No 1-click Print.
    - No WhatsApp Share.
    - No 1-click Record Payment for unpaid invoices.
- **Required Web Implementation**:
  1. Add `Print` icon button to table action column (triggers print preview without navigating away).
  2. Add `WhatsApp` share button opening WhatsApp Web with invoice details and balance link.
  3. Add `Record Payment` icon button on unpaid invoices to settle directly from the table.

---

### GAP-002.7: Dynamic UPI QR Code for Counter Collection
- **Mobile Implementation**:
  - [`vyora-app/src/components/UpiQrModal.tsx`](file:///D:/project/vyora-app/src/components/UpiQrModal.tsx):
    - Renders live QR code dynamically generated from `upi://pay?pa=<VPA>&pn=<StoreName>&am=<Amount>&cu=INR`.
    - Customer points phone at screen to pay via GPay, PhonePe, or Paytm.
- **Web Frontend Code Gap**:
  - No UPI QR code modal or display component exists anywhere in `vyora-frontend`.
- **Required Web Implementation**:
  1. Create `UpiQrModal` using `qrcode.react` on the web frontend.
  2. Display UPI QR button on `InvoiceViewPage` and within payment receipt vouchers.

---

### GAP-002.8: 58mm & 80mm Thermal Receipt Layout (POS Roll Printing)
- **Mobile Implementation**:
  - Formats receipts for 58mm/80mm Bluetooth thermal roll printers with compact headers, 2-column item layout, tax summary, and shop QR.
- **Web Frontend Code Gap**:
  - [`vyora-frontend/src/pages/invoices/components/view/InvoicePrintTemplate`](file:///D:/project/vyora/vyora-frontend/src/pages/invoices/components/view/InvoicePrintTemplate/component/index.tsx):
    - Locked to full A4 desktop layout (210mm &times; 297mm).
    - Printing this on a standard USB or network POS roll printer distorts the layout.
- **Required Web Implementation**:
  1. Add a layout selector in Invoice View: **"Standard A4"** vs **"80mm Thermal POS Receipt"**.
  2. Provide `@media print` CSS optimized for 80mm roll paper (80mm width, auto height, bold compact fonts).

---

### GAP-002.9: Digital Signature Canvas Pad & Store Logo Management
- **Mobile Implementation**:
  - [`vyora-app/src/components/SignatureModal.tsx`](file:///D:/project/vyora-app/src/components/SignatureModal.tsx): Canvas touch drawing pad for merchant signature.
  - Automatically renders the vector signature on thermal and PDF invoices.
- **Web Frontend Code Gap**:
  - [`vyora-frontend/src/pages/account/components/ProfileTab/component/index.tsx`](file:///D:/project/vyora/vyora-frontend/src/pages/account/components/ProfileTab/component/index.tsx):
    - Only text inputs for business details.
    - No HTML5 canvas signature pad.
    - No store logo upload or image management.
- **Required Web Implementation**:
  1. Implement HTML5 canvas signature drawing pad in `ProfileTab` allowing merchants to draw using mouse or touch stylus.
  2. Save vector/base64 signature to `business.signatureUrl` or profile settings.
  3. Embed signature dynamically in `InvoicePrintTemplate`.

---

### GAP-002.10: Gross Profit, Margins & Expense Analytics in Reports
- **Mobile Implementation**:
  - [`vyora-app/src/screens/ReportsScreen.tsx`](file:///D:/project/vyora-app/src/screens/ReportsScreen.tsx): Gross profit reporting (Revenue - Cost of Goods Sold) and item margin tracking based on `purchasePriceMinor`.
- **Web Frontend Code Gap**:
  - [`vyora-frontend/src/pages/reports/index.tsx`](file:///D:/project/vyora/vyora-frontend/src/pages/reports/index.tsx):
    - Only 4 tabs: Sales Register, Purchase Register, Stock Summary, Customer Dues.
    - Missing Gross Profit / Item Margins tab.
    - Missing Expense Register tab.
    - The "Download" button ([`#L99-L100`](file:///D:/project/vyora/vyora-frontend/src/pages/reports/index.tsx#L99-L100)) calls `window.print()` instead of exporting CSV/Excel data.
- **Required Web Implementation**:
  1. Add **"Profit & Loss / Margins"** tab calculating gross profit from sales line items and product purchase costs.
  2. Add **"Expense Summary"** tab pulling data from `/api/v1/expenses/breakdown`.
  3. Add true **CSV / Excel export** for all report registers.

---

## Phased Parity Implementation Roadmap

| Phase | Target Area | Key Additions | Estimated Effort |
| :--- | :--- | :--- | :--- |
| **Phase W1** | **Expenses & Multi-Store** | 1. Implement `/expenses` module (page, table, Quick Expense modal, sidebar link).<br>2. Implement `StoreSwitcherDropdown` in header with 1-tap switch & create store. | 1.5 Days |
| **Phase W2** | **Customer Ledger & Khata** | 1. Implement `PartyStatementModal` (date-wise ledger statement & PDF export).<br>2. Add 1-tap `Collect Payment` & `WhatsApp Reminder` buttons in `PartyTable`. | 1 Day |
| **Phase W3** | **Counter POS & Billing** | 1. Add "1-Tap Cash Sale" & payment selector to `CreateInvoicePage`.<br>2. Replace native `<select>` with searchable Combobox for items and customers.<br>3. Support fractional quantities (`step="any"`). | 1.5 Days |
| **Phase W4** | **Thermal POS & QR** | 1. Implement 80mm thermal receipt layout with `@media print` CSS.<br>2. Add `UpiQrModal` for dynamic counter payment collection.<br>3. Add 1-click Print, WhatsApp & Settle actions to `InvoiceTable`. | 1 Day |
| **Phase W5** | **Signature & Reports** | 1. HTML5 canvas signature drawing pad in `ProfileTab`.<br>2. Add Gross Profit & Expense tabs to `ReportsPage`.<br>3. Add CSV export to all reports. | 1 Day |

---

## Architectural Guardrails for Web Implementation
1. **Financial Rule**: All money fields remain strictly integer minor units (`paisa`) using `@vyora/utils` (`majorToMinor`, `minorToMajor`, `formatCurrency`).
2. **Design System**: Maintain Theme B (Teal Ledger) tokens: `#0F766E` (primary), `#123B3A` (text dark), `#D7E5E2` (border light), `#112322` (dark card), `#0A1615` (dark canvas). Zero raw arbitrary hex colors outside token palette.
3. **Component Limits**: Keep component shells under 400 lines; extract modals, tables, and toolbars into dedicated subcomponents.
4. **Git Discipline**: Uncommitted working tree. No `git commit` or `git push` without user permission.
