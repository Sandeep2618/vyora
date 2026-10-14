# Vyora Unified Architecture & Engineering Standards
**Document Version:** 2.0.0  
**Stack:** Node.js + Express.js + TypeScript + MongoDB (Mongoose) | React 19 + Vite + Tailwind CSS v4  
**Scope:** Universal architectural standards, folder structures, and coding recipes for `vyora-backend`, `vyora-frontend`, and `vyora-mobile`.

---

## 1. High-Level System Architecture & Philosophy

Vyora is built as a **decoupled, modular monolith**. The backend provides high-performance REST APIs, and the frontend/mobile clients consume these endpoints through typed facades.

```
vyora/                                          # Monorepo Workspace Root
├── vyora-backend/                             # Node.js + Express.js + MongoDB REST Monolith
│   ├── src/
│   │   ├── config/                            # Global configuration & DB singleton
│   │   ├── middleware/                        # Auth, Tenancy, RBAC, Validation, Error
│   │   ├── util/                              # ApiResponse, AppError, Currency, AsyncHandler
│   │   ├── common/                            # Shared interfaces, types, base contracts
│   │   ├── modules/                           # Domain Modules (Auth, Invoices, Products, etc.)
│   │   ├── route/                             # Central API Router (/api/v1)
│   │   ├── app.ts                             # Express App Factory & Middleware Pipeline
│   │   └── server.ts                          # Server Bootstrapper & Graceful Shutdown
│   ├── tsconfig.json
│   └── package.json
│
├── vyora-frontend/                            # Web App (React 19 + Vite 6 + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/                        # Universal UI Primitives (Button, Modal, Table)
│   │   ├── pages/                             # Modular Domain Pages (Dashboard, Invoices, etc.)
│   │   ├── context/                           # Auth, Theme, Toast Context Providers
│   │   ├── hooks/                             # React Query & Custom Business Hooks
│   │   ├── lib/                               # Axios API Client & Base Utilities
│   │   ├── types/                             # Frontend Domain Shapes & DTOs
│   │   ├── locales/                           # Tri-lingual Dictionaries (en, hi, gu)
│   │   └── App.tsx                            # Root Router & App Shell
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                                      # Authoritative Architectural Briefs & QA Reports
└── structure.md                               # Master Architecture & Structure Guide (THIS FILE)
```

---

## 2. The Core Philosophy: Full Symmetry Between Frontend & Backend

To achieve zero confusion and instant cognitive familiarity across teams, **the backend directory design directly mirrors the frontend modular structure**:

| Responsibility | Frontend Standard | Backend Standard |
| :--- | :--- | :--- |
| **Execution / Presentation** | `component/index.tsx` (JSX layout) | `controller/index.ts` (HTTP input & output) |
| **Business Logic** | `hook/index.ts` (State & mutations) | `service/index.ts` (Pure business & DB queries) |
| **Persistence / Schema** | React State / Form Inputs | `model/index.ts` (Mongoose Schema & Indexes) |
| **Route / Entry** | React Router element in `App.tsx` | `route/index.ts` (Express.Router() bindings) |
| **Validation** | Zod Form Schema | `validator/index.ts` (Zod Request Schema) |
| **Data Contracts** | `config/interface/index.ts` | `config/interface/index.ts` |
| **Constants & Defaults** | `config/constant/index.ts` | `config/constant/index.ts` |
| **Domain Enums** | `config/enum/index.ts` | `config/enum/index.ts` |
| **Pure Calculations** | `util/index.ts` | `util/index.ts` |
| **Public Barrel Export** | `index.ts` | `index.ts` |

---

## 3. Backend: Standard Modular Structure (`vyora-backend/`)

### 3.1 Global Root Layout
```
vyora-backend/src/
├── config/
│   ├── constant/index.ts                      # Global constants, default page sizes, rate limits
│   ├── interface/index.ts                     # Environment config interfaces
│   ├── enum/index.ts                          # Node environments (development, production, test)
│   ├── database/index.ts                      # MongoDB (Mongoose) connection singleton & hooks
│   └── index.ts                               # Unified config export (process.env validation)
│
├── middleware/
│   ├── auth/index.ts                          # JWT authentication & session verification
│   ├── tenant/index.ts                        # Multi-tenant boundary: validates businessId
│   ├── role/index.ts                          # RBAC guard: OWNER, STAFF, CUSTOMER, ADMIN
│   ├── permission/index.ts                    # Granular staff permissions: POS, Inventory, etc.
│   ├── validation/index.ts                    # Generic Zod validation middleware for body/query/params
│   ├── rateLimiter/index.ts                   # Sliding-window rate limiting middleware
│   ├── error/index.ts                         # Centralized global error handling middleware
│   ├── notFound/index.ts                      # 404 Route handler
│   └── index.ts                               # Public middleware exports
│
├── util/
│   ├── apiResponse/index.ts                   # Standardized JSON response envelope builder
│   ├── appError/index.ts                      # Enterprise custom AppError classes
│   ├── currency/index.ts                      # Minor-unit (paise) math: majorToMinor, minorToMajor
│   ├── asyncHandler/index.ts                  # Async wrapper removing try/catch boilerplate
│   ├── logger/index.ts                        # Structured logging utility
│   └── index.ts                               # Public utility exports
│
├── common/
│   ├── interface/index.ts                     # Global pagination, sorting, search filter shapes
│   ├── enum/index.ts                          # Universal status enums (ACTIVE, INACTIVE, DRAFT, etc.)
│   └── index.ts
│
├── modules/                                   # Domain Modules (Clean Layered Pattern)
│   ├── auth/
│   ├── business/
│   ├── products/
│   ├── parties/
│   ├── invoices/
│   ├── inventory/
│   ├── purchases/
│   ├── payments/
│   ├── reports/
│   └── orders/
│
├── route/
│   └── index.ts                               # Central router aggregating all module routes under /api/v1
│
├── app.ts                                     # Express Application factory
└── server.ts                                  # Server initialization & graceful shutdown handlers
```

---

### 3.2 Standard 9-Folder Blueprint for Every Backend Module
Every module in `src/modules/<module-name>/` MUST follow this exact directory layout:

```
src/modules/<moduleName>/
├── controller/
│   └── index.ts          # Request extraction, status codes, delegates to service
├── service/
│   └── index.ts          # Pure business logic, database queries, atomic transactions
├── model/
│   └── index.ts          # Mongoose schema, document interface, indexes, virtuals
├── route/
│   └── index.ts          # Express Router instance with route-level middleware chaining
├── validator/
│   └── index.ts          # Zod request validation schemas (body, query, params)
├── config/
│   ├── constant/index.ts  # Module constants, lookup maps, default pagination
│   ├── interface/index.ts # DTOs, payload shapes, service return types
│   └── enum/index.ts      # Module-specific enums (statuses, types, categories)
├── middleware/           # (Optional) Route-specific middleware for this module
│   └── index.ts
├── util/                 # (Optional) Pure calculations or formatting for this module
│   └── index.ts
└── index.ts               # Public barrel exports (routes, services, models, interfaces)
```

> **The Contentless Submodule Pruning Rule**:  
> If a module does **not** need a custom `util/` or `middleware/`, do **not** create empty folders or dummy files. Only create submodules with real domain code.

---

## 4. Backend Coding Standards & Production Patterns

### 4.1 Strict One-Way Layer Flow
Requests must traverse through the layers strictly in one direction:
```
Client Request
      ↓
[Global Middleware] (RateLimiter → Auth → TenantContext)
      ↓
[Module Route] (Express.Router)
      ↓
[Validator Middleware] (Zod Request Parsing)
      ↓
[Controller] (Extracts validated input, invokes Service, returns ApiResponse)
      ↓
[Service] (Executes business logic, performs Mongoose queries / transactions)
      ↓
[Mongoose Model] (MongoDB Document Persistence)
      ↓
Response returned via ApiResponse.success()
```
- **Controllers** NEVER execute database queries directly (`Model.find()` in a controller is strictly forbidden).
- **Controllers** NEVER contain business math or multi-step logic.
- **Services** NEVER reference Express `req` or `res` objects (ensuring services remain testable and framework-agnostic).

---

### 4.2 Standardized JSON Response Envelope (`ApiResponse`)
Every API endpoint MUST return a consistent response envelope via `ApiResponse`:

#### Success Response
```typescript
// util/apiResponse/index.ts
export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  }

  static paginated<T>(res: Response, items: T[], total: number, page: number, limit: number, message = 'Success') {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  }
}
```

#### Standard JSON Wire Format
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Invoice retrieved successfully",
  "data": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "invoiceNumber": "INV-0042",
    "grandTotalMinor": 125000,
    "status": "PAID"
  }
}
```

---

### 4.3 Centralized Error Handling Hierarchy (`AppError`)
Throw typed domain errors in services; never manually construct error responses in controllers:

```typescript
// util/appError/index.ts
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly errorCode = 'INTERNAL_ERROR',
    public readonly details: any = null,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details: any = null) {
    super(400, message, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden: insufficient permissions') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict detected') {
    super(409, message, 'CONFLICT');
  }
}
```

---

### 4.4 Centralized `asyncHandler` Utility
Eliminates repetitive `try / catch` boilerplate from controllers:

```typescript
// util/asyncHandler/index.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

---

### 4.5 Controller Implementation Recipe
Controllers must be clean and declarative:

```typescript
// modules/products/controller/index.ts
import { Request, Response } from 'express';
import { asyncHandler, ApiResponse } from '@/util';
import { ProductService } from '../service';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId; // injected by tenant middleware
    const query = req.validatedQuery; // parsed & typed by Zod validator
    const result = await this.productService.list(businessId, query);
    return ApiResponse.paginated(res, result.items, result.total, query.page, query.limit);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId;
    const body = req.validatedBody;
    const product = await this.productService.create(businessId, body);
    return ApiResponse.success(res, product, 'Product created successfully', 201);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const businessId = req.businessId;
    const { id } = req.params;
    await this.productService.delete(businessId, id);
    return ApiResponse.success(res, { id }, 'Product deleted successfully', 200);
  });
}
```

---

### 4.6 Multi-Tenant Isolation by Design (Non-Negotiable)
- Every tenant schema **MUST** declare `businessId: { type: String, required: true, index: true }`.
- Every database query in services **MUST** include `businessId`.
- An API endpoint that queries data without checking `businessId` is considered an immediate security breach.

```typescript
// service/index.ts
async findById(businessId: string, id: string) {
  const item = await ProductModel.findOne({ _id: id, businessId });
  if (!item) {
    throw new NotFoundError('Product');
  }
  return item;
}
```

---

### 4.7 Strict Minor-Unit Currency Standard (Paisa Math)
- **NEVER** store or calculate money in floating-point rupees.
- All monetary fields in schemas, DTOs, and state are integers in **minor units** (1 INR = 100 Paisa):
  - `sellingPriceMinor`, `purchasePriceMinor`, `subtotalMinor`, `taxableMinor`, `cgstMinor`, `sgstMinor`, `igstMinor`, `grandTotalMinor`, `dueMinor`.
- Helper conversion functions:
  ```typescript
  export const minorToMajor = (minor: number): number => Number((minor / 100).toFixed(2));
  export const majorToMinor = (major: number): number => Math.round(Number(major) * 100);
  ```

---

### 4.8 Atomic Multi-Document MongoDB Transactions
Any operation updating multiple collections (such as creating an invoice that also updates stock and customer ledger) **MUST** execute within an atomic session transaction:

```typescript
// Example: Atomic Transaction in Service
async createInvoice(businessId: string, payload: CreateInvoiceDTO) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Decrement product stock
    for (const item of payload.items) {
      const product = await ProductModel.findOneAndUpdate(
        { _id: item.productId, businessId, currentStock: { $gte: item.quantity } },
        { $inc: { currentStock: -item.quantity } },
        { session, new: true }
      );
      if (!product) {
        throw new BadRequestError(`Insufficient stock for product ID ${item.productId}`);
      }
    }

    // 2. Save Invoice
    const [invoice] = await InvoiceModel.create([{ ...payload, businessId }], { session });

    // 3. Update Customer Balance
    await PartyModel.findOneAndUpdate(
      { _id: payload.customerId, businessId },
      { $inc: { currentBalanceMinor: invoice.grandTotalMinor } },
      { session }
    );

    await session.commitTransaction();
    return invoice;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## 5. Frontend & Mobile Standards (`vyora-frontend/` & `vyora-mobile`)

### 5.1 Component Directory Standard
Every complex component, modal, drawer, or domain table strictly follows this structure:

```
ComponentName/
├── component/
│   └── index.tsx          # JSX layout and pure UI logic
├── config/
│   ├── constant/index.ts  # Default values, column widths, presets
│   ├── interface/index.ts # TypeScript props and data contracts
│   └── enum/index.ts      # Component enums (sizes, variants, placements)
├── hook/index.ts          # (Optional) Reusable custom hook
├── util/index.ts          # (Optional) Pure formatting / math helpers
└── index.ts               # Public barrel exports
```

### 5.2 Mandatory Frontend Invariants
1. **Theme B — Teal Ledger Visual Palette**:
   - Primary: `#0F766E` (Deep Teal)
   - Primary Hover: `#0D665F`
   - Dark Accent / Headers: `#123B3A`
   - App Background: `#F4F8F7`
   - Card Surface: `#FFFFFF`
   - Borders & Dividers: `#D7E5E2`
   - Status Colors: Success `#15803D`, Warning `#A16207`, Danger `#B91C1C`
2. **Zero Inline Styles**:
   - `style={{ ... }}` is strictly prohibited in JSX. All styling must use Tailwind classes.
3. **Mandatory Edge-to-Edge Modal Architecture**:
   - Modals must use the `footer` prop on `<Modal>` (`<Modal footer={<>...</>}>`). Floating inner dividers are prohibited.
4. **Mandatory Client Search Debouncing**:
   - All search inputs must debounce requests by 300ms using `<SearchInput>`.
5. **Zero-Data Clean Slate**:
   - When a table has 0 records and no filters active, hide filter toolbars and pagination controls. Render a clean `<EmptyState>`.
6. **Strict 300-Line File Cap**:
   - Monolithic files are forbidden. Any screen approaching ~300 lines must decompose into child components within `components/`.

---

## 6. The Five-Layer Quality Assurance Gate

Before any branch is merged or code is released, all five layers must pass with 100% success:

| Layer | Tool | Catch Scope |
| :--- | :--- | :--- |
| **1. Formatting** | `Prettier` | Code style, indentation, single quotes, trailing commas |
| **2. Linting** | `ESLint + typescript-eslint` | Unused variables, any types, unhandled promises, invalid hook dependencies |
| **3. Typecheck** | `tsc --noEmit` (strict) | TypeScript compile errors across both backend and frontend |
| **4. Test Suites** | `Vitest + Supertest` | Unit tests, transaction rollbacks, paisa calculations |
| **5. Gatekeeper** | `ship:check` / CI | Full pre-flight release audit (zero secrets, UI invariants, 100% QA pass) |

---

## 7. Step-by-Step Checklist for Adding Any New Module

When building a new module (e.g. `quotations`, `payroll`, `expenses`), follow this exact sequence:

### Backend Step-by-Step:
- [ ] **Step 1**: Create `src/modules/<moduleName>/` with the standard subfolders:
  - `model/index.ts`: Define Mongoose schema with `businessId` index and timestamps.
  - `config/interface/index.ts`: Define TypeScript DTOs and return shapes.
  - `config/constant/index.ts`: Define defaults and limits.
  - `validator/index.ts`: Define Zod schemas for create, update, and list query.
  - `service/index.ts`: Implement business logic and database interactions.
  - `controller/index.ts`: Implement HTTP handlers using `asyncHandler` and `ApiResponse`.
  - `route/index.ts`: Declare Express router and attach validation middlewares.
  - `index.ts`: Export route, service, and interfaces.
- [ ] **Step 2**: Mount the module router in `src/route/index.ts` under `/api/v1/<moduleName>`.
- [ ] **Step 3**: Verify backend compilation: `pnpm --dir vyora-backend typecheck`.

### Frontend Step-by-Step:
- [ ] **Step 1**: Create `src/pages/<moduleName>/index.tsx`.
- [ ] **Step 2**: If the page has modals, create `src/pages/<moduleName>/modal/<ModalName>/` with edge-to-edge footer architecture.
- [ ] **Step 3**: If the page has tables, create `src/pages/<moduleName>/components/<TableName>/` with icon-only action buttons.
- [ ] **Step 4**: Add route in `src/App.tsx`.
- [ ] **Step 5**: Run full 5-layer quality checks (`pnpm run ship:check`).
