# GAP-001: Mobile App Production Readiness & Feature Gap Roadmap

> **Document ID**: GAP-001  
> **Target Platform**: Vyora Mobile (`vyora-app`) & Backend Integration (`vyora-backend`)  
> **Status**: Approved for Phased Implementation  
> **Last Updated**: 2026-10-18 (Codebase Deep-Dive Audit Complete)  
> **Inspection Standard**: 100% verified against exact file paths and line numbers. Zero speculation.

---

## Executive Overview
This roadmap organizes the real-world operational gaps and UX friction points identified in the Vyora mobile counter billing and inventory ecosystem. It breaks down technical, domain, and flow improvements into **6 logical execution phases**, ranked from immediate counter-billing speedups and click reductions to full offline resilience.

---

## Click-Reduction UX Optimization Matrix

| Workflow / Task | Current Behavior & Friction (Code Verified) | Improved Proposed Flow | Tap Reduction |
| :--- | :--- | :--- | :--- |
| **Record Cash Payment from Home** | Party card on `HomeScreen` only has WhatsApp. User must tap card &rarr; wait for `PartyLedgerModal` &rarr; tap `+ Pay In` &rarr; opens `PaymentModal` ([`HomeScreen.tsx#L403-L439`](file:///D:/project/vyora-app/src/screens/HomeScreen.tsx#L403-L439)). | Direct 1-tap `Collect ₹` quick button on `HomeScreen` party cards (matching `PartiesScreen.tsx`). | **4 Taps &rarr; 1 Tap** (75% faster) |
| **Add Party from Home Parties Tab** | FAB is hardcoded to "Add New Sale". User must tap Menu &rarr; Parties &rarr; Add Party &rarr; fill &rarr; back to Home ([`HomeScreen.tsx#L480-L484`](file:///D:/project/vyora-app/src/screens/HomeScreen.tsx#L480-L484)). | Dynamic FAB on `HomeScreen`: When on Parties tab, FAB changes to "Add New Party" and opens modal directly. | **5 Taps &rarr; 1 Tap** (80% faster) |
| **Adding Multiple Items to Cart** | Adding a product immediately calls `setProductModalVisible(false)` ([`CreateInvoiceScreen.tsx#L250`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L250)). Adding 5 items requires 5 full modal open/close cycles. | Multi-item continuous select modal with inline `+`/`-` quantity steppers and sticky "Add X Items to Bill" bar. | **15 Taps &rarr; 5 Taps** (66% faster) |
| **Adding Uncataloged Item During Bill** | Empty state directs user to `onNavigate('items')` ([`CreateInvoiceScreen.tsx#L954`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L954)), destroying customer & cart draft! | Inline "Quick Add Product" sheet (Name + Price + Tax). Saves SKU and appends to cart in 1 tap without navigation. | **Cart Discarded &rarr; 1-Tap Save** (Zero data loss) |
| **Cash Settlement for Unpaid Invoice** | Invoice card and modal only offer Print/PDF/WhatsApp or UPI QR ([`InvoicesScreen.tsx#L250-L280`](file:///D:/project/vyora-app/src/screens/InvoicesScreen.tsx#L250-L280)). Cannot record cash. Must switch to Parties. | Direct 1-tap "Settle Cash" button on invoice card and in detail modal, pre-filling customer and amount. | **5 Taps &rarr; 1 Tap** (80% faster) |
| **Recording Routine Petty Cash Expense** | Enforces 4-column accounting table (`Item Name`, `Qty`, `Rate`, `Amount`) for simple ₹20 Chai ([`RecordExpenseModal.tsx#L345-L420`](file:///D:/project/vyora-app/src/components/RecordExpenseModal.tsx#L345-L420)). | 2-field "Quick Expense" default view (`Category` + `Amount`), keeping itemized table as an optional toggle. | **8 Inputs &rarr; 2 Inputs** (75% faster) |

---

## Implementation Phase Roadmap

```
Phase 1: Counter Billing Speed, Click Reduction & Cash Handling (Immediate)
   │
   ▼
Phase 2: Hardware Peripherals (Barcode Scanner & Thermal Printing)
   │
   ▼
Phase 3: Merchant Onboarding & Phone OTP Authentication
   │
   ▼
Phase 4: Udhaar Recovery Engine & Customer Relationship
   │
   ▼
Phase 5: Offline-First Architecture & Sync Queue
   │
   ▼
Phase 6: Stock Inward Linkage & Inventory Audit Ledger
```

---

## Phase 1: Counter Billing Speed & Cash Handling (Critical / Immediate)

> **Objective**: Enable sub-20-second checkout at physical retail counters with minimum clicks and zero data contamination.

### GAP-001.1: Permanent "Walk-in / Cash Customer" Default
- **Area**: Mobile ([`CreateInvoiceScreen.tsx#L111-L113`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L111-L113))
- **Severity**: Critical (P0)
- **Problem**: `CreateInvoiceScreen.tsx` executes `if (list.length > 0) setSelectedCustomer(list[0]);`. Anonymous cash counter sales are silently booked against whichever customer is first in the database, contaminating their Khata and credit balance.
- **Solution**:
  - Provide a permanent, pre-selected **"Walk-in / Cash Customer"** option at index 0.
  - Selecting "Walk-in Customer" bypasses party creation, disables credit/udhaar mode, and defaults to Cash/UPI payment.
- **Acceptance Criteria**:
  - Cashier opens Create Invoice &rarr; adds items &rarr; taps 1-Tap Cash in under 10 seconds with zero typing.

### GAP-001.2: Multi-Item Continuous Selection in Billing Modal
- **Area**: Mobile ([`CreateInvoiceScreen.tsx#L231-L251`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L231-L251))
- **Severity**: High (P1)
- **Problem**: The product picker closes immediately upon selecting a single item (`setProductModalVisible(false)`). Adding 5 grocery items requires 5 modal transitions.
- **Solution**:
  - Keep product modal open for multi-item selection.
  - Show inline `+`/`-` quantity steppers next to each product.
  - Sticky bottom sheet displays: "Add X Items to Bill (₹Total)".
- **Acceptance Criteria**:
  - Cashier adds 5 distinct items to cart in a single modal session.

### GAP-001.3: Inline Quick Product Creation in Billing
- **Area**: Mobile ([`CreateInvoiceScreen.tsx#L944-L960`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L944-L960))
- **Severity**: High (P1)
- **Problem**: When a searched product does not exist, the button navigates to `items` (`ProductsScreen`), abandoning the active invoice draft and customer selection.
- **Solution**:
  - Provide an inline "Quick Add Item" form directly inside the product modal (Name + Price + Tax Rate).
  - Automatically saves the item and appends it to the active bill without screen navigation.
- **Acceptance Criteria**:
  - Adding an uncataloged item preserves the invoice draft and finishes in 2 taps.

### GAP-001.4: Automatic Cash Round-Off Calculation
- **Area**: Mobile & Backend GST Engine
- **Severity**: Medium (P2)
- **Problem**: GST percentages (e.g. 18%) result in fractional totals like ₹342.67. Handling loose paisa at Indian retail counters causes cashier delays.
- **Solution**:
  - Calculate `roundOffMinor = Math.round(grandTotalMinor / 100) * 100 - grandTotalMinor`.
  - Display itemized: `Subtotal`, `Total Tax`, `Round Off (+₹0.33 / -₹0.67)`, `Net Payable (₹343.00)`.
- **Acceptance Criteria**:
  - Net payable total is always an even rupee integer when cash round-off is active.

### GAP-001.5: Split & Partial Payment Modes
- **Area**: Mobile ([`CreateInvoiceScreen.tsx#L587-L666`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L587-L666))
- **Severity**: High (P1)
- **Problem**: Real customers often pay part cash, part UPI, and leave the remainder on credit (Udhaar). The app currently only supports 100% Cash, 100% UPI, or 100% Credit.
- **Solution**:
  - Add multi-payment breakdown modal: `Cash Amount`, `UPI / Online Amount`, `Credit / Due Balance`.
  - Store payment allocations in `invoice.payments` array and automatically compute `dueMinor`.
- **Acceptance Criteria**:
  - An invoice with grand total ₹1,000 can record ₹400 Cash + ₹400 UPI + ₹200 Due, automatically marking status as `PARTIALLY_PAID`.

---

## Phase 2: Hardware Peripherals & Counter Automation

> **Objective**: Equip merchants with barcode scanning and thermal receipt printing for high-volume store counters.

### GAP-001.6: Camera Barcode Scanner Integration
- **Area**: Mobile (`expo-camera` / `@zxing/library`)
- **Severity**: High (P1)
- **Problem**: Typing product names in a 5,000-SKU catalog during rush hour creates store bottlenecks.
- **Solution**:
  - Add a dedicated Barcode Scanner icon inside product search bars and the invoice creation screen.
  - Instant camera viewfinder overlay scans EAN-13, EAN-8, UPC, and Code-128 barcodes.
  - If scanned SKU exists in catalog, auto-increment line item quantity by 1 with subtle haptic feedback.
- **Acceptance Criteria**:
  - Barcode scan resolves item and adds to cart in <500ms.

### GAP-001.7: 58mm & 80mm Bluetooth Thermal POS Printing
- **Area**: Mobile (`react-native-bluetooth-escpos-printer`)
- **Severity**: High (P1)
- **Problem**: Sharing PDF on WhatsApp or printing A4 on inkjet is too slow and costly for grocery and retail counters.
- **Solution**:
  - Integrate Bluetooth ESC/POS printer discovery and pairing in Mobile Settings.
  - Generate formatted thermal receipt layout: Store Name, GSTIN, Date, Itemized 2-column list, Tax summary, UPI QR code for shop.
- **Acceptance Criteria**:
  - 1-tap "Print Thermal Receipt" sends ESC/POS byte stream to paired Bluetooth thermal printer in <2 seconds.

---

## Phase 3: Merchant Onboarding & Phone OTP Authentication

> **Objective**: Remove password friction and make onboarding frictionless for non-tech-savvy traders.

### GAP-001.8: Phone Number + SMS/WhatsApp OTP Login
- **Area**: Mobile & Backend (`auth` module)
- **Severity**: Critical (P0)
- **Problem**: Small business owners frequently forget passwords and rarely check emails for login links.
- **Solution**:
  - Implement phone-first authentication: User enters 10-digit mobile number &rarr; Receives 6-digit OTP via SMS / WhatsApp.
  - Auto-read SMS OTP on Android via Google SMS Retriever API.
- **Acceptance Criteria**:
  - Login or registration completes in 2 taps without password creation.

### GAP-001.9: Post-Signup Invoice Customization (Zero Redundancy)
- **Area**: Mobile Onboarding Flow
- **Severity**: High (P1)
- **Problem**: Registration already captures `businessName` and the backend auto-creates the `Business` model with default prefix `INV-`. Asking for Business Name a second time creates friction.
- **Solution**:
  - Carry forward registered `businessName` without ever re-asking.
  - Offer an optional, skippable 1-screen **"Quick Invoice Setup"** prompt:
    1. **Business State** (Required for GST: decides CGST/SGST 9%+9% vs IGST 18%).
    2. **GSTIN (Optional)**: If entered, auto-populates legal trade details.
    3. **Invoice Prefix**: Pre-filled as `INV-`.
    4. Primary CTA: **"Start Billing Now"**.
- **Acceptance Criteria**:
  - Zero duplicate prompts: Business Name is never asked twice. Merchant can begin billing immediately.

### GAP-001.10: Quick Multi-Store Tenant Switcher [STATUS: ALREADY IMPLEMENTED & FIXED]
- **Area**: Mobile Navigation Header (`Header.tsx`, `WorkspaceSwitcherModal.tsx`, `AuthContext.tsx`)
- **Status**: **Completed & Verified in Production Codebase**
- **Existing Implementation**:
  - `Header.tsx` includes `styles.switchStorePill` triggering `<WorkspaceSwitcherModal>`.
  - `AuthContext.tsx` implements `switchBusiness(businessId)` which calls `authApi.switchBusiness(businessId)` and backend `AuthController.switchBusiness`.
  - Multi-store creation bug fixed by removing blocking mandatory address validation on backend and nested modal conflict on mobile.

---

## Phase 4: Udhaar Recovery Engine & Customer Relationship

> **Objective**: Help merchants collect pending customer balances faster via automated reminders and ledger exports.

### GAP-001.11: Party Ledger Query Parameter Mismatch Fix
- **Area**: Mobile ([`PartyLedgerModal.tsx#L48-L60`](file:///D:/project/vyora-app/src/components/PartyLedgerModal.tsx#L48-L60)) & API Client ([`invoices.ts#L26-L35`](file:///D:/project/vyora-app/src/api/invoices.ts#L26-L35))
- **Severity**: Critical (P0)
- **Problem**: `PartyLedgerModal` calls `invoicesApi.list({ limit: 50 })` without passing `customerId: party.id`, filtering client-side on the first 50 global store invoices. Once a store passes 50 bills, customer bills vanish from their ledger.
- **Solution**:
  - Add `customerId?: string` to `invoicesApi.list`.
  - Query `{ customerId: party.id }` directly so MongoDB filters server-side.
- **Acceptance Criteria**:
  - 100% of customer invoices load correctly regardless of store invoice count.

### GAP-001.12: 1-Tap Cash Settle from Invoices Screen & Detail Modal
- **Area**: Mobile ([`InvoicesScreen.tsx#L250-L280`](file:///D:/project/vyora-app/src/screens/InvoicesScreen.tsx#L250-L280), [`#L525-L541`](file:///D:/project/vyora-app/src/screens/InvoicesScreen.tsx#L525-L541))
- **Severity**: High (P1)
- **Problem**: Unpaid invoice cards only offer Print/PDF/WhatsApp or UPI QR. When customer pays in cash, cashier must exit Invoices, open Menu, open Parties, and search customer.
- **Solution**:
  - Add direct "Settle Cash" button on invoice card and in detail modal.
  - Opens `PaymentModal` with customer and due amount pre-filled.
- **Acceptance Criteria**:
  - Settle cash against an unpaid invoice in 1 tap from Invoices screen.

### GAP-001.13: WhatsApp Payment Reminder with Dynamic UPI Intent
- **Area**: Mobile (`src/utils/whatsapp.ts`)
- **Severity**: Critical (P0)
- **Problem**: Generic balance reminders without a payment link get ignored or postponed.
- **Solution**:
  - Construct deep-linked WhatsApp message containing:
    1. Friendly balance reminder with business name.
    2. Itemized overdue invoice list.
    3. Dynamic UPI Payment Link: `upi://pay?pa=<MerchantVPA>&pn=<StoreName>&am=<DueAmount>&cu=INR`.
- **Acceptance Criteria**:
  - Customer tapping UPI link on WhatsApp directly opens GPay/PhonePe/Paytm with exact due amount pre-filled.

### GAP-001.14: Party Statement (Khata Ledger) PDF Export
- **Area**: Mobile & Backend Reports
- **Severity**: Medium (P2)
- **Problem**: When customers question their outstanding balance, merchants need a date-range chronological statement.
- **Solution**:
  - Export Party Ledger PDF showing: Opening Balance, Date-wise Invoices (+Debit), Payments (-Credit), and Running Balance.
- **Acceptance Criteria**:
  - 1-tap "Share Statement" generates and shares a PDF covering selected date range.

---

## Phase 5: Offline-First Architecture & Sync Engine

> **Objective**: Ensure 100% billing continuity even during internet outages or inside basement retail shops.

### GAP-001.15: Offline Invoice Creation & Local Cache
- **Area**: Mobile Architecture (`WatermelonDB` / `SQLite` / `AsyncStorage`)
- **Severity**: Critical (P0)
- **Problem**: Network latency or cellular drops cause billing failure at the physical counter.
- **Solution**:
  - Cache products, categories, and customers locally on device.
  - When offline, invoices are saved to a local pending queue (`isSynced: false`) with a locally generated temporary UUID.
  - UI displays an unobtrusive "Offline Billing Active" banner.
- **Acceptance Criteria**:
  - Cashier can create invoices without an internet connection and print thermal receipts immediately.

### GAP-001.16: Background Sync & Conflict Resolution Engine
- **Area**: Mobile Network Interceptor & Backend Batch API
- **Severity**: High (P1)
- **Problem**: Offline invoices must upload to MongoDB Atlas cleanly when internet reconnects.
- **Solution**:
  - Listen to `NetInfo` connectivity events.
  - On network reconnection, drain pending invoice queue using a backend batch ingestion endpoint (`POST /api/v1/invoices/batch-sync`).
  - Update local temporary UUIDs with authoritative database ObjectIds.
- **Acceptance Criteria**:
  - 10 offline invoices sync to server within 5 seconds of reconnecting without duplicate creation or sequence gaps.

---

## Phase 6: Inventory Ledger, Purchases & Stock Movement Audit

> **Objective**: Transform inventory from a static number into an auditable, tax-compliant stock engine.

### GAP-001.17: Product Form: Purchase Price & HSN Code Fields
- **Area**: Mobile ([`ProductFormModal.tsx#L250-L362`](file:///D:/project/vyora-app/src/components/ProductFormModal.tsx#L250-L362))
- **Severity**: High (P1)
- **Problem**: `ProductFormModal.tsx` omits `purchasePriceMinor` and `hsnCode`. Prevents gross profit tracking and GSTR-1 compliance.
- **Solution**: Add `Purchase Price (₹)` and `HSN/SAC Code` fields with validations.

### GAP-001.18: Direct Purchases-to-Stock Inward Linkage
- **Area**: Backend (`purchases` & `products` modules)
- **Severity**: Critical (P0)
- **Problem**: Purchasing goods from suppliers does not automatically increment warehouse product stock.
- **Solution**:
  - In `PurchasesService.create()`, execute an atomic MongoDB transaction that:
    1. Records the Purchase Bill.
    2. Increments `product.currentStock` by the purchased quantity for each line item.
    3. Updates supplier payable ledger.
- **Acceptance Criteria**:
  - Saving a purchase bill for 20 units of Item A instantly increases Item A's catalog stock from 5 to 25.

### GAP-001.19: Create Purchase Screen: Deliberate Supplier Selection & Quick Add
- **Area**: Mobile ([`CreatePurchaseScreen.tsx#L83-L85`](file:///D:/project/vyora-app/src/screens/CreatePurchaseScreen.tsx#L83-L85), [`#L444-L470`](file:///D:/project/vyora-app/src/screens/CreatePurchaseScreen.tsx#L444-L470))
- **Severity**: Medium (P2)
- **Problem**: Auto-selects `suppliers[0]` by default, and supplier picker has no "+ Add Supplier" action for new delivery vendors.
- **Solution**: Require intentional supplier selection and add inline "+ Quick Add Supplier" modal.

### GAP-001.20: Simplified Petty Expense Recording (Quick Mode)
- **Area**: Mobile ([`RecordExpenseModal.tsx#L345-L420`](file:///D:/project/vyora-app/src/components/RecordExpenseModal.tsx#L345-L420))
- **Severity**: Medium (P2)
- **Problem**: Forces 4-column itemized table for everyday ₹20 chai / ₹100 petrol expenses.
- **Solution**: Provide a 2-field "Quick Expense" tab (`Category` + `Amount`) as default, keeping itemized table as optional toggle.

---

## Priority & Sequencing Matrix

| Phase | Phase Name | Focus | Key Gaps | Estimated Effort |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Counter Billing Speed | Walk-in default, multi-item continuous add, inline quick product, cash round-off, split payment | GAP-001.1 to GAP-001.5 | 3 Days |
| **Phase 2** | Hardware Peripherals | Barcode scanning & Thermal POS printing | GAP-001.6 to GAP-001.7 | 3 Days |
| **Phase 3** | Merchant Onboarding | Phone OTP & Guided invoice setup | GAP-001.8 to GAP-001.10 | 3 Days |
| **Phase 4** | Udhaar Recovery | Ledger customerId fix, 1-tap cash settle, WhatsApp UPI reminders, PDF ledger | GAP-001.11 to GAP-001.14 | 2 Days |
| **Phase 5** | Offline-First Engine | SQLite / Local queue & background sync | GAP-001.15 to GAP-001.16 | 4 Days |
| **Phase 6** | Inventory & Stock Audit | Purchase price/HSN, purchases-to-stock linkage, quick expense modal | GAP-001.17 to GAP-001.20 | 3 Days |
