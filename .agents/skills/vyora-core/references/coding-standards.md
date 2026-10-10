# Vyora Coding Standards & Conventions

## 1. Frontend Development (React 19 + TypeScript + Vite)

### Component Conventions
- Every page is placed in `src/pages/<domain>/<PageName>.tsx`.
- Modal forms must follow the pattern `src/pages/<domain>/<Entity>FormModal.tsx` and accept `isOpen: boolean` and `onClose: () => void`.
- Common UI atoms (`Button`, `Card`, `Badge`, `EmptyState`, `Input`, `Select`, `Modal`, `PageHeader`, `SearchInput`) live in `src/components/ui/`.
- Use `lucide-react` for all icons. Do not import random external icon libraries.
- Use `cn(...)` from `src/lib/utils.ts` for conditional Tailwind class combining.

### State & Data Fetching
- Use `@tanstack/react-query` (`useQuery`, `useMutation`).
- Maintain custom hooks in `src/hooks/use<Feature>.ts` (e.g. `useInvoices.ts`, `useProducts.ts`, `useParties.ts`, `useInventory.ts`, `useDashboard.ts`).
- On successful mutation, always invalidate relevant query keys (`queryClient.invalidateQueries(...)`).

### Visual Rules
- **Required Asterisk**: Every required field label must include:
  ```tsx
  <label className="block text-xs font-semibold text-[#123B3A] mb-1">
    Field Name <span className="text-[#B91C1C] font-bold">*</span>
  </label>
  ```
- **Filter-Aware Empty States**:
  Every table component must handle:
  ```tsx
  if (items.length === 0) {
    return (
      <EmptyState
        title={hasActiveFilters ? "No items match filters" : "No items found"}
        description={hasActiveFilters ? "Try clearing search or filters." : "Create your first record."}
        actionLabel={hasActiveFilters ? "Reset Filters" : "Create Item"}
        onAction={hasActiveFilters ? onResetFilters : onCreateClick}
      />
    );
  }
  ```

---

## 2. Backend Development (NestJS 11 + Mongoose 8)

### Service & Controller Patterns
- Use class-based NestJS services with constructor dependency injection.
- Validate incoming DTOs using `class-validator` and `class-transformer`.
- All database schemas live in `src/modules/<module>/schemas/<entity>.schema.ts`.
- Every controller must enforce tenant isolation through `TenantGuard` and extract `businessId` from the active JWT user membership.
- Use Mongoose `.lean()` for read queries to maximize throughput.

### Error Handling
- Never throw raw errors to the client. Throw standard NestJS exceptions:
  - `NotFoundException` (404)
  - `BadRequestException` (400)
  - `ConflictException` (409)
  - `ForbiddenException` (403)
- Use standard HTTP status codes: 201 for Created, 200 for OK, 204 for No Content.

---

## 3. Financial Precision
- **Never do floating point math with money**:
  - `lineTotal = quantity * unitPriceMinor`
  - `tax = Math.round((lineTotal * taxRatePercent) / 100)`
- All currency display must pass through `formatCurrency(minorAmount)`.
