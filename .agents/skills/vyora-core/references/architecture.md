# Vyora Architecture & Domain Model Reference

## 1. Domain Entities & Schemas

### Multi-Tenancy & Authorization
- **`User`**: Account owner or invited staff (`email`, `passwordHash`, `name`, `phone`).
- **`Business`**: Legal entity (`legalName`, `tradeName`, `gstin`, `stateCode`, `address`, `invoicePrefix`, `nextInvoiceNumber`).
- **`Membership`**: Relates `User` to `Business` with roles: `OWNER` or `STAFF`.
- **Tenant Isolation**: Backend enforces multi-tenancy via `TenantGuard` and `TenantInterceptor`. Every query is scoped by `businessId`.

### Commercial Operations
- **`Product`**:
  - `sku`: Unique uppercase product identifier per business.
  - `unit`: PCS, BOX, KG, LTR, MTR, SET, UNT, PKT.
  - `sellingPriceMinor`, `purchasePriceMinor`: Monetary amounts in integer paisa.
  - `taxRatePercent`: Standard GST slab (0, 5, 12, 18, 28).
  - `currentStock`, `reorderLevel`: Real-time stock levels.
- **`Party`**:
  - `type`: `CUSTOMER` or `SUPPLIER`.
  - `name`, `phone`, `email`, `gstin`.
  - `billingAddress`: Street, city, state, pincode.
  - `currentBalanceMinor`: Running ledger balance.
- **`Invoice`**:
  - `invoiceNumber`: Formatted sequence (e.g. `INV-0001`).
  - `status`: `DRAFT`, `UNPAID`, `PARTIAL`, `PAID`, `CANCELLED`.
  - `items`: Snapshot of sold products, quantities, rates, and tax calculations.
  - Finalized invoices are immutable.
- **`PurchaseBill`**:
  - Traceable purchase entry from a supplier party. Increases stock and adds to supplier payable balance.
- **`PaymentRecord`**:
  - Voucher (`RECEIPT` from customer or `PAYMENT` to supplier).
  - Tracks `paymentMethod` (`CASH`, `UPI`, `BANK_TRANSFER`, `CHEQUE`, `CARD`).
  - Contains `idempotencyKey` to prevent duplicate voucher creation.
- **`StockMovement`**:
  - Immutable audit trail of every stock change (`PURCHASE`, `SALE`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `SALE_CANCEL`, `OPENING`).

---

## 2. Decoupled Communication & API Layer

- **RESTful Endpoints**:
  - `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `GET /api/v1/auth/me`
  - `GET/PUT /api/v1/business/current`, `GET/POST /api/v1/business/staff`
  - `GET/POST /api/v1/products`, `GET/PUT/DELETE /api/v1/products/:id`
  - `GET/POST /api/v1/parties`, `GET/PUT /api/v1/parties/:id`
  - `GET/POST /api/v1/invoices`, `POST /api/v1/invoices/preview`, `POST /api/v1/invoices/:id/finalize`, `POST /api/v1/invoices/:id/cancel`
  - `GET/POST /api/v1/purchases`, `GET /api/v1/purchases/:id`
  - `GET/POST /api/v1/payments`, `GET /api/v1/payments/:id`
  - `GET /api/v1/inventory/movements`, `POST /api/v1/inventory/adjustments`
  - `GET /api/v1/dashboard/metrics`
  - `GET /api/v1/reports/sales-register`, `/reports/purchase-register`, `/reports/stock-summary`, `/reports/customer-dues`
  - `GET /api/v1/audit/logs`

- **Frontend HTTP Client (`vyora-frontend/src/lib/api.ts`)**:
  - Attaches `Authorization: Bearer <token>` and `x-business-id` automatically.
  - Automatically redirects to `/login` upon 401 Unauthorized responses.
