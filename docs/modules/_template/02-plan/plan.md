# Phase 2: Implementation Plan — {{MODULE_NAME}}

## 1. Scope Definition
- **In-Scope**:
  - 
- **Out-of-Scope**:
  - 

---

## 2. Platform Task Breakdown

### A. Backend (`vyora-backend`)
- [ ] Task B1: Schema definition & MongoDB indexes
- [ ] Task B2: DTOs & validation logic (paisa minor units)
- [ ] Task B3: Service business logic with `{ businessId }` multi-tenancy
- [ ] Task B4: Controller REST endpoints adhering to standard response envelope
- [ ] Task B5: Automated unit & integration tests

### B. Web Frontend (`vyora-frontend`)
- [ ] Task W1: API service methods & TypeScript types
- [ ] Task W2: Page shell & custom hook extraction (<400 lines)
- [ ] Task W3: UI modals and forms with required field asterisks
- [ ] Task W4: Empty state, debounced search, responsive table overflow
- [ ] Task W5: i18n keys and Theme B light/dark tokens

### C. Mobile App (`vyora-app`)
- [ ] Task M1: API wrapper in `src/api/`
- [ ] Task M2: Screen hook in `src/hooks/use{{MODULE_NAME}}Screen.ts`
- [ ] Task M3: Standalone modal component in `src/components/`
- [ ] Task M4: Screen coordinator (<400 lines) with dynamic `useTheme()` tokens
- [ ] Task M5: i18n localization in `en.ts`, `hi.ts`, `gu.ts`

---

## 3. i18n Requirements
New translation keys to add across `en.ts`, `hi.ts`, and `gu.ts`:
- `{{MODULE_NAME}}.title`
- `{{MODULE_NAME}}.form.*`
- `{{MODULE_NAME}}.status.*`

---

## 4. Theme & Design Tokens Impact
- **Web**: Confirm proper use of Tailwind `dark:` variants.
- **Mobile**: Verify 0 raw hex codes. Dynamic binding to `theme.card`, `theme.background`, `theme.border`, `theme.text`.

---

## 5. Acceptance Criteria
- [ ] Criteria 1:
- [ ] Criteria 2:
- [ ] Multi-tenant isolation verified with isolated tenant test.
- [ ] All monetary fields stored in minor units (paisa).
- [ ] Automated lint and build clean across Backend, Web, and Mobile.

---

## 6. Test Plan
- **Unit Tests**:
- **DevTools / Browser Inspection**:
- **Mobile Web Bundle Verification**: `npx expo export --platform web`
