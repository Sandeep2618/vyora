# Vyora Folder Structure Standards

> **Rule**: Never invent a new folder structure. Follow this specification across Backend, Web Frontend, and Mobile.

---

## 1. Backend (`vyora-backend/`)

Vyora Backend is a modular monolith built with NestJS 11 and Mongoose 8. Every business domain is an isolated feature module under `src/modules/<domain>/`.

```
vyora-backend/
├── src/
│   ├── config/                     # Global configs (database, jwt, cloud, env)
│   ├── common/                     # Cross-cutting framework code
│   │   ├── decorators/             # @CurrentUser, @Roles, @Tenant
│   │   ├── filters/                # Global exception filter (HttpExceptionFilter)
│   │   ├── guards/                 # JwtAuthGuard, RolesGuard, TenantGuard
│   │   ├── interceptors/           # ResponseEnvelopeInterceptor, LoggingInterceptor
│   │   ├── middleware/             # RateLimiter, RequestId, TenantMiddleware
│   │   └── utils/                  # Currency, minor unit, date helpers
│   ├── modules/                    # Domain Feature Modules
│   │   ├── auth/                   # Authentication & Session
│   │   ├── business/               # Multi-tenant business management
│   │   ├── products/               # Products, categories, units, inventory
│   │   ├── parties/                # Customers & Suppliers
│   │   ├── invoices/               # Sales invoices, GST calculation
│   │   ├── purchases/              # Purchase bills & vendor payments
│   │   ├── payments/               # Payment-in, payment-out, ledger entries
│   │   ├── expenses/               # Operating expense tracking
│   │   ├── reports/                # Profit & Loss, GST, Stock, Sales analytics
│   │   └── <feature>/              # Domain Module Anatomy (Strict):
│   │       ├── controller/         # REST endpoints (HTTP handling only, NO inline queries)
│   │       ├── service/            # Business logic, tenant isolation, DB queries
│   │       ├── schema/             # Mongoose schemas & indexes
│   │       ├── dto/                # Request/response DTOs with class-validator
│   │       ├── interface/          # TypeScript domain interfaces
│   │       ├── route/              # Route definitions & guards
│   │       └── index.ts            # Public module export
│   └── main.ts                     # Application bootstrap & Swagger configuration
└── test/                           # Automated E2E test suites
```

### Backend Invariants:
1. **Controllers are thin**: Route handlers validate input, delegate immediately to the Service layer, and return data. Never write Mongoose queries directly in a controller or route closure.
2. **Strict Multi-Tenancy**: Every schema and query MUST enforce `{ businessId: req.user.businessId }`. Never execute tenant-less queries.
3. **No circular dependencies**: Use `forwardRef` only when strictly required; prefer domain events or shared services.

---

## 2. Web Frontend (`vyora-frontend/`)

Vyora Web is built with React 19, Vite 6, and Tailwind CSS 4. It follows a Feature-Sliced Page pattern with atomic design for shared components.

```
vyora-frontend/
├── src/
│   ├── assets/                     # Static icons, logos, brand illustrations
│   ├── components/                 # Global UI atoms, molecules, organisms
│   │   ├── ui/                     # Universal primitives (Button, Input, Modal, Badge, Dropdown, Table)
│   │   ├── layout/                 # Sidebar, Topbar, BottomNav (mobile), AppLayout
│   │   └── common/                 # EmptyState, SearchInput, StatusBadge, ConfirmDialog
│   ├── context/                    # React Contexts (AuthContext, ThemeContext, TenantContext)
│   ├── hooks/                      # Global custom hooks (useDebounce, useCurrency, useLocalStorage)
│   ├── i18n/                       # Internationalization dictionaries
│   │   ├── en.ts                   # English (authoritative master)
│   │   ├── hi.ts                   # Hindi (हिंदी)
│   │   ├── gu.ts                   # Gujarati (ગુજરાતી)
│   │   └── index.ts                # i18n provider & formatters
│   ├── pages/                      # Feature-Sliced Page Modules
│   │   ├── auth/                   # Login, Register, Forgot Password
│   │   ├── dashboard/              # Metrics, charts, quick actions
│   │   ├── products/               # Product catalog, stock alerts, category management
│   │   │   ├── components/         # Product-specific components (ProductTable, BarcodeModal)
│   │   │   ├── hooks/              # useProductsData, useProductFilters
│   │   │   └── index.tsx           # Page coordinator (Max 400 lines)
│   │   ├── invoices/               # Invoice list, creation wizard, PDF view
│   │   ├── parties/                # Customers & Suppliers lists, statement modals
│   │   ├── purchases/              # Purchase order & bills
│   │   ├── expenses/               # Expense log, category breakdowns
│   │   └── reports/                # Financial and inventory reporting
│   ├── services/                   # API client layer (Axios / Fetch instances with interceptors)
│   │   ├── api.ts                  # Axios base client with auth token interceptor
│   │   └── <feature>.service.ts    # Typed service endpoints matching backend contracts
│   ├── types/                      # Shared frontend TypeScript interfaces
│   └── App.tsx                     # Routing & global providers
```

### Web Frontend Invariants:
1. **Max 400 lines per page shell**: Any page component exceeding 400 lines MUST extract UI modals into `components/` and state/fetch logic into a custom hook `hooks/use<Feature>.ts`.
2. **Debounced Search**: Every search bar MUST use debounced inputs (minimum 300ms) to prevent server hammering.
3. **Responsive overflow**: Every data table MUST be wrapped in an overflow container (`overflow-x-auto`) with minimum table width (`min-w-[600px]`) to ensure clean rendering on tablet and mobile viewports.

---

## 3. Mobile App (`vyora-app/`)

Vyora Mobile is built with React Native and Expo. It enforces clean separation between high-level Screen coordinators, domain hooks, and isolated UI components.

```
vyora-app/
├── src/
│   ├── api/                        # Typed REST API wrappers (axios client)
│   │   ├── client.ts               # Axios instance with auth interceptors & offline queues
│   │   └── <domain>.ts             # products.ts, invoices.ts, expenses.ts, parties.ts
│   ├── components/                 # Reusable UI & Extracted Domain Modals
│   │   ├── ui/                     # Atomic primitives (Button, Input, Card, Badge, Header)
│   │   ├── common/                 # EmptyState, SearchBar, StatusPill, CurrencyText
│   │   ├── <DomainModals>/         # ProductFormModal, InvoiceSuccessModal, RecordExpenseModal
│   │   └── index.ts                # Central barrel export
│   ├── context/                    # AuthContext, ThemeContext, NetworkContext
│   ├── hooks/                      # Domain & UI Custom Hooks
│   │   ├── useTheme.ts             # Theme B dynamic tokens (isDark, theme)
│   │   ├── use<Feature>Screen.ts   # Screen state, search debounce, API queries & mutations
│   │   └── useOfflineSync.ts       # Offline data cache & syncing
│   ├── i18n/                       # Localization bundles (en.ts, hi.ts, gu.ts)
│   ├── navigation/                 # React Navigation stacks & bottom tabs
│   │   ├── AppNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── screens/                    # Lightweight Screen Coordinators (Max 400 lines)
│   │   ├── auth/                   # LoginScreen, RegisterScreen
│   │   ├── products/               # ProductsScreen (Uses useProductsScreen & ProductFormModal)
│   │   ├── invoices/               # InvoicesScreen, CreateInvoiceScreen
│   │   ├── parties/                # PartiesScreen, PartyDetailScreen
│   │   ├── expenses/               # ExpensesScreen, ExpenseCategoryScreen
│   │   ├── settings/               # SettingsScreen, BusinessProfileScreen
│   │   └── index.ts                # Screen barrel export
│   └── utils/                      # Currency formatting, minor-units conversion, date utils
```

### Mobile Invariants:
1. **No God-Screens**: Screens are layout coordinators only (Max 400 lines). State and side-effects must reside in `src/hooks/use<Feature>Screen.ts`.
2. **Zero Hardcoded Colors**: Stylesheets MUST consume `useTheme()` tokens dynamically. Never write raw `#hex` in `StyleSheet.create`.
3. **Cross-Platform Safety**: Always import `Platform` from `'react-native'` when using `Platform.select(...)` to prevent web bundle `ReferenceError`.
