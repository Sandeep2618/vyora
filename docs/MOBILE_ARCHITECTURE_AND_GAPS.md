# Mobile Production Checklist & Architecture Plan

## 1. Production Checklist

| Area | Status | To do |
| :--- | :--- | :--- |
| **Architecture** | Layer-based, large screens | Feature folders, split screens |
| **State/data** | Manual fetch | TanStack Query |
| **Navigation** | String-based | React Navigation, typed routes |
| **Theme** | Two systems | Unify, no hex in screens |
| **Money/GST** | Duplicated, inconsistent | One tested tax.ts, IGST support |
| **Mutations** | No idempotency | Add idempotency keys, disable on submit |
| **Offline** | None | Important for shops with poor connectivity; consider a queue for bills |
| **Errors** | console.error | Sentry + error boundary |
| **Tests** | None seen | Jest for tax/money, RNTL for flows |
| **Types** | Some any | Strict TS, remove as any and err: any |
| **Security** | Check tokens | Store in expo-secure-store, not AsyncStorage |
| **CI** | Unknown | ESLint, tsc --noEmit, tests on PR |
| **Accessibility** | Partial | accessibilityLabel on all icon buttons |

---

## 2. Suggested Order of Work

1. **Fix correctness bugs** (state mutation, UTC date, missing cost editing, IGST, idempotency).
2. **Extract tax.ts and useDraftLines, add unit tests**.
3. **Unify the theme and strip hard-coded colors**.
4. **Split screens into components** (start with the modals, since they are the biggest chunks).
5. **Introduce TanStack Query and server-side search**.
6. **Move to React Navigation**.
7. **Add Sentry, tests, CI**.

---

## 3. Target Architecture

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

---

## 4. Full Gap Inventory & Root-Cause Technical Analysis

*(Every gap is detailed with exact file paths, line numbers, code snippets, root-cause mechanisms, and operational impact so we fix the underlying architecture rather than applying surface patches).*

---

### Step 1 Gaps: Correctness, Timezone, Math & Mutation Bugs

#### 1. In-Place Object Mutation Bug (React Shallow Comparison Failure)
* **Exact Locations**:
  - [`CreatePurchaseScreen.tsx#L176-L183`](file:///D:/project/vyora-app/src/screens/CreatePurchaseScreen.tsx#L176-L183)
  - [`CreateInvoiceScreen.tsx#L302-L309`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L302-L309)
* **Code Snippet**:
  ```typescript
  const updateQuantity = (index: number, delta: number) => {
    const updated = [...lines];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty; // In-place mutation of existing object reference!
    }
    setLines(updated);
  };
  ```
* **Root Cause**: `[...lines]` creates a new array wrapper, but the object references inside the array remain identical. Mutating `updated[index].quantity = newQty` directly modifies the existing object in memory.
* **Impact**: React components relying on memoization (`React.memo`, `useMemo`), PureComponents, or shallow prop equality checks do not detect that the line item changed. This causes skipped re-renders, stale child row displays, and missed total recalculations during fast billing.
* **Fix**: Deep clone or map immutably:
  ```typescript
  setLines(prev => prev.map((l, i) => i === index ? { ...l, quantity: newQty } : l));
  ```

---

#### 2. UTC Midnight Date-Shift Bug (Indian Standard Time Drift)
* **Exact Locations**:
  - Mobile: [`CreateInvoiceScreen.tsx#L404`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L404)
  - Mobile: [`CreatePurchaseScreen.tsx#L242`](file:///D:/project/vyora-app/src/screens/CreatePurchaseScreen.tsx#L242)
  - Backend: [`vyora-backend/src/shared/validation.ts#L247`](file:///D:/project/vyora/vyora-backend/src/shared/validation.ts#L247)
* **Code Snippet**:
  ```typescript
  const today = new Date().toISOString().split('T')[0];
  ```
* **Root Cause**: `.toISOString()` formats the timestamp in **UTC (Greenwich Mean Time)**. India Standard Time (IST) is **UTC+5:30**. Between 12:00 AM midnight and 5:29 AM morning IST, UTC is still on the previous calendar day.
* **Impact**: Night-shift shopkeepers, 24/7 pharmacies, bakeries, or late counter cashiers generating invoices between 12:00 AM and 5:30 AM IST have their bills stamped with **yesterday's date**. This corrupts daily daybook accounting, GST filing chronology, and audit trails.
* **Fix**: Create a centralized `shared/utils/date.ts` that formats date using the store's local timezone (IST):
  ```typescript
  export const getStoreDate = (date: Date = new Date()): string => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
  };
  ```

---

#### 3. Hardcoded Zero IGST (Missing Inter-State GST Calculation)
* **Exact Location**:
  - [`CreateInvoiceScreen.tsx#L248-L252`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L248-L252)
* **Code Snippet**:
  ```typescript
  cgstMinor: Math.round(((l.quantity * l.unitPriceMinor) * (l.taxRatePercent / 2)) / 100),
  sgstMinor: Math.round(((l.quantity * l.unitPriceMinor) * (l.taxRatePercent / 2)) / 100),
  igstMinor: 0, // Hardcoded to 0!
  totalMinor: Math.round((l.quantity * l.unitPriceMinor) * (1 + l.taxRatePercent / 100)),
  ```
* **Root Cause**: The mobile screen assumes every sale is intra-state and splits the tax rate equally between CGST and SGST, hardcoding `igstMinor: 0`.
* **Impact**: Under Section 7 of the IGST Act, if the buyer's place of supply is outside the store's state, **100% of the tax must be levied as IGST**, and CGST + SGST must be zero. Charging CGST/SGST on an inter-state sale produces an illegal tax invoice that will be rejected during GST return filing (GSTR-1).
* **Fix**: Dynamically compare buyer state code with store state code; assign 100% to IGST when inter-state, or 50/50 to CGST/SGST when intra-state.

---

#### 4. Odd-Percentage Tax Rounding Discrepancy
* **Root Cause**:
  ```typescript
  cgstMinor: Math.round((taxable * (rate / 2)) / 100)
  sgstMinor: Math.round((taxable * (rate / 2)) / 100)
  ```
  If total tax on a line item is an odd paisa number (e.g. ₹15.25 tax = 1525 paise), independently rounding `1525 / 2 = 762.5` results in `cgstMinor = 763` and `sgstMinor = 763`. Sum = `1526 paise` (1 paisa higher than total tax).
* **Impact**: Line item tax breakdown does not sum to total tax, causing ledger reconciliation errors.
* **Fix**: Authoritative single formula:
  ```typescript
  const totalTaxMinor = Math.round((taxableAmountMinor * taxRatePercent) / 100);
  const cgstMinor = Math.round(totalTaxMinor / 2);
  const sgstMinor = totalTaxMinor - cgstMinor; // Guarantees cgst + sgst === totalTax
  ```

---

#### 5. Missing Selling Rate & Line Discount Editing on Invoice Items
* **Exact Location**:
  - [`CreateInvoiceScreen.tsx#L616-L618`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L616-L618)
* **Code Snippet**:
  ```tsx
  {/* Rate */}
  <Text style={[styles.rateText, { color: theme.textSecondary }]}>
    {(line.unitPriceMinor / 100).toFixed(0)}
  </Text>
  ```
* **Root Cause**: The selling rate column is rendered as static, unpressable `<Text>`.
* **Impact**: In retail and wholesale counters, cashiers frequently negotiate rates or offer line-level discounts (e.g., selling an item for ₹95 instead of ₹100, or giving 5% off on damaged packaging). Cashiers are blocked from modifying rate or adding discounts without changing the entire catalog product price.
* **Fix**: Allow tapping the rate to open an inline rate/discount edit popover.

---

#### 6. Zero Mutation Idempotency & Double-Submit Vulnerability
* **Exact Locations**:
  - `invoicesApi.create`, `purchasesApi.create`, `paymentsApi.create`
* **Root Cause**: Requests are sent over HTTP without client-generated UUID `idempotencyKey` headers.
* **Impact**: If network latency occurs on mobile (2G/3G in rural shops) and the cashier taps "Create Bill" or "Collect Cash" twice, two identical invoices or two payment ledger entries are created in the database, double-deducting stock and double-crediting balances.
* **Fix**: Generate `idempotencyKey: uuidv4()` on form initialization and attach `x-idempotency-key` in headers. Disable submit button with a loading spinner while mutation is in flight.

---

#### 7. Hardcoded State Fallback ('Gujarat')
* **Exact Location**:
  - [`PartiesScreen.tsx#L95, L111`](file:///D:/project/vyora-app/src/screens/PartiesScreen.tsx#L95)
* **Code Snippet**:
  ```typescript
  const [stateName, setStateName] = useState('Gujarat');
  ```
* **Root Cause**: Hardcoded string `'Gujarat'` inside modal state initialization.
* **Impact**: For any merchant operating in Maharashtra, Delhi, Karnataka, or Rajasthan, every newly added customer or supplier defaults to Gujarat unless manually changed, distorting the Place of Supply and triggering incorrect IGST calculations.
* **Fix**: Default to `business?.state || ''`.

---

### Step 2 Gaps: Shared Tax, Money & Math Parity

#### 8. Duplicated Math Formulas vs Backend `@vyora/utils`
* **Root Cause**: Mobile screens implement their own inline math instead of consuming a single, tested `shared/utils/tax.ts` that has exact 1:1 mathematical parity with `vyora-backend/src/shared/utils.ts`.
* **Impact**: Rounding rules, discounts, and inter-state tax logic drift between mobile and backend. An invoice that previews for ₹1,180.00 on mobile might calculate to ₹1,180.05 on the backend when saved.
* **Fix**: Extract `shared/utils/tax.ts` and `shared/utils/money.ts` mirroring backend calculations.

#### 9. Zero Automated Unit Tests
* **Root Cause**: No test runner or test files exist in `vyora-app`.
* **Impact**: Refactoring financial math or tax rates risks silent regression in production.
* **Fix**: Set up Jest with test suites verifying all 5 Indian GST slabs (0%, 5%, 12%, 18%, 28%), intra-state vs inter-state splits, and boundary round-offs.

---

### Step 3 Gaps: Theme & Color Unification

#### 10. 1,267 Hardcoded Hex Colors
* **Locations**:
  - 680 hex instances in `screens/*.tsx`
  - 587 hex instances in `components/*.tsx`
* **Root Cause**: Developers hardcoded color literals (e.g. `'#0F766E'`, `'#123B3A'`, `'#F4F8F7'`, `'#E5EFEB'`) directly into `StyleSheet.create` objects.
* **Impact**: Dark mode is broken across many views (white cards on dark backgrounds, unreadable black text on dark surfaces). Brand color adjustments require editing hundreds of files.
* **Fix**: Purge all raw hex codes and replace with semantic tokens from a single unified theme hook `useAppTheme()`.

#### 11. Two Conflicting Theme Systems
* **Exact Location**:
  - [`theme/colors.ts#L152`](file:///D:/project/vyora-app/src/theme/colors.ts#L152)
* **Code Snippet**:
  ```typescript
  export const colors = lightColors; // Backward compatible export
  ```
* **Root Cause**: Components import static `colors` directly instead of using the reactive `useTheme()` hook.
* **Impact**: Static `colors` never react to system theme changes or user dark mode toggles.
* **Fix**: Deprecate static `colors` export; enforce `const { theme } = useAppTheme()` everywhere.

#### 12. 62 Hardcoded Untranslated `Alert.alert` Calls
* **Root Cause**: Error dialogs, confirmation modals, and input validation alerts are written in plain English strings without `t(...)` keys.
* **Impact**: Hindi and Gujarati users receive critical error dialogs in English.
* **Fix**: Centralize all alert strings into `en.ts`, `hi.ts`, and `gu.ts`.

---

### Step 4 Gaps: Screen & Modal Decomposition

#### 13. Monolithic God Screens (1,000 to 2,118 Lines)
* **Line Counts**:
  - `CreateInvoiceScreen.tsx`: **2,118 lines**
  - `PartiesScreen.tsx`: **1,384 lines**
  - `SettingsScreen.tsx`: **1,253 lines**
  - `InvoicesScreen.tsx`: **1,237 lines**
  - `AccountScreen.tsx`: **1,070 lines**
  - `HomeScreen.tsx`: **1,037 lines**
  - `CreatePurchaseScreen.tsx`: **1,028 lines**
* **Root Cause**: Layer-based screen architecture where UI layout, modal dialogs, data fetching, validation, PDF generation, and state manipulation are crammed into single files.
* **Impact**: Extreme code complexity, high cognitive load, frequent merge conflicts, and accidental regressions during bug fixes.
* **Fix**: Decompose into domain feature folders (`src/features/<module>/`), extracting modals into distinct components and business logic into hooks (`useInvoiceDraft.ts`). Target ~150 lines per screen.

#### 14. Embedded Modals Trapped Inside Screens
* **Root Cause**: `CustomerPickerModal`, `ProductPickerModal`, `QuickAddProductForm`, `PaymentModal`, and `UpiQrModal` are written directly inside `CreateInvoiceScreen.tsx`.
* **Impact**: Modals cannot be reused in Purchases, Quotations, or Customer Ledger views.
* **Fix**: Extract each modal into standalone feature components with clean prop interfaces.

---

### Step 5 Gaps: State, TanStack Query & Resiliency

#### 15. Silent Catches & Misleading ₹0 States on Dashboard & Home
* **Exact Locations**:
  - [`DashboardScreen.tsx#L64-L69`](file:///D:/project/vyora-app/src/screens/DashboardScreen.tsx#L64-L69)
  - [`HomeScreen.tsx#L75-L79`](file:///D:/project/vyora-app/src/screens/HomeScreen.tsx#L75-L79)
* **Code Snippet**:
  ```typescript
  const [invRes, purRes, payRes, expRes, partyRes] = await Promise.all([
    invoicesApi.list({ limit: 40 }).catch(() => ({ items: [] })),
    purchasesApi.list({ limit: 40 }).catch(() => ({ items: [] })),
    paymentsApi.list({ limit: 40 }).catch(() => ({ items: [] })),
    expensesApi.list({ limit: 40 }).catch(() => ({ items: [] })),
    partiesApi.list({ limit: 100 }).catch(() => ({ items: [] })),
  ]);
  ```
* **Root Cause**: Empty catch blocks return `{ items: [] }` on network failure.
* **Impact**: If Render spins down, backend times out, or network drops, the dashboard renders ₹0 sales, ₹0 receivables, and empty charts without any error indication. The merchant believes they have 0 sales today instead of knowing their network failed.
* **Fix**: Remove silent empty fallback; render an explicit error banner with a "Tap to Retry" button.

#### 16. Phantom Staff Member Creation on Network Error
* **Exact Location**:
  - [`AccountScreen.tsx#L140-L146`](file:///D:/project/vyora-app/src/screens/AccountScreen.tsx#L140-L146)
* **Code Snippet**:
  ```typescript
  try {
    await apiClient.post('/business/staff', { name, email, role: backendRole });
    await loadStaff();
    Alert.alert('Invite Sent', `An invitation has been sent to ${email} as ${formattedRole}.`);
  } catch (err: any) {
    setStaffMembers((prev) => [
      ...prev,
      { id: Date.now().toString(), name, email, role: formattedRole },
    ]);
    Alert.alert('Invite Sent', `An invitation has been sent to ${email} as ${formattedRole}.`); // Fake success alert!
  }
  ```
* **Root Cause**: The catch block executes fake optimistic state insertion with `id: Date.now().toString()` and displays a false success message.
* **Impact**: When adding a staff member fails on the server, the owner is told the invite was sent and sees the staff member on their screen, but the backend never received it.
* **Fix**: Show a genuine error alert: `"Unable to send invite: [Reason]"`; do not insert phantom local records.

#### 17. Silent Catalog Initialization Failures
* **Exact Locations**:
  - [`CreateInvoiceScreen.tsx#L152, L161`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L152)
  - [`CreatePurchaseScreen.tsx#L90, L94`](file:///D:/project/vyora-app/src/screens/CreatePurchaseScreen.tsx#L90)
* **Code Snippet**: `.catch(console.error);`
* **Root Cause**: Network errors during initial product/customer list fetching are discarded into `console.error`.
* **Impact**: The user taps the product picker and sees an empty list, assuming they have zero products cataloged.
* **Fix**: Surface a retry banner: `"Unable to load catalog. [Retry]"`.

#### 18. Client-Side Heavy Array Filtering
* **Root Cause**: The app fetches up to 100-200 items into a local state array and filters with `array.filter()` on every keystroke.
* **Impact**: If a store has 2,000 products, mobile memory spikes and UI typing stutters.
* **Fix**: Use TanStack Query with debounced server-side search (`/products?search=...`).

#### 19. Zero Offline Draft Safety
* **Root Cause**: Line item state exists solely in volatile component memory (`useState<InvoiceLine[]>([])`).
* **Impact**: If a phone call interrupts a cashier midway through entering a 20-item bill and Android kills the app in the background, all entered items are lost.
* **Fix**: Auto-save draft lines to `AsyncStorage` / SQLite on change.

---

### Step 6 Gaps: Navigation & Routing

#### 20. String-Based `useState` Navigation
* **Exact Location**:
  - [`App.tsx#L159`](file:///D:/project/vyora-app/App.tsx#L159): `const [currentScreen, setCurrentScreen] = useState<ScreenKey>('home');`
* **Root Cause**: App uses custom string switches instead of a native navigation library.
* **Impact**:
  1. No native back-stack history: Pressing the Android hardware back button exits the app instead of popping back to the previous screen.
  2. Screen params are untyped (`Record<string, any> | null`).
  3. No deep-link routing into specific invoice details or customer ledgers.
* **Fix**: Migrate to React Navigation (Native Stack + Bottom Tabs) with strict `RootStackParamList`.

---

### Step 7 Gaps: Security, Error Handling, Types & CI

#### 21. Unencrypted JWT Token Storage
* **Exact Location**:
  - [`AuthContext.tsx#L158-L162`](file:///D:/project/vyora-app/src/context/AuthContext.tsx#L158-L162)
* **Code Snippet**: `await AsyncStorage.setItem('vyora_token', data.accessToken);`
* **Root Cause**: Tokens are stored in plaintext `AsyncStorage` (unencrypted SQLite/XML on Android).
* **Impact**: On rooted devices or via Android backup exploits, unencrypted auth tokens can be extracted.
* **Fix**: Store auth tokens in hardware-backed `expo-secure-store` (Android KeyStore / iOS Keychain).

#### 22. Missing Error Boundary & Telemetry
* **Root Cause**: No Sentry integration or top-level React Error Boundary.
* **Impact**: Unhandled JS exceptions cause a hard crash to the Android home screen with zero crash reports sent to developers.
* **Fix**: Wrap root in a React Error Boundary and initialize Sentry.

#### 23. 119 Occurrences of `any` / `as any` / `err: any`
* **Root Cause**: Loose typing in catch blocks and API unwrapping (`(res.data as any)?.data`).
* **Impact**: Hidden runtime bugs bypass the TypeScript compiler.
* **Fix**: Define strict DTO interfaces and use `unknown` with error guards (`err instanceof Error`).

#### 24. 98.6% Accessibility Gap
* **Root Cause**: Out of 837 touch targets, only 12 declare `accessibilityLabel`.
* **Impact**: Android TalkBack and iOS VoiceOver read "unlabeled button" to visually impaired users.
* **Fix**: Add meaningful `accessibilityLabel` to all interactive buttons and icons.

#### 25. Missing CI Pipeline
* **Root Cause**: No GitHub Actions workflow running automated checks.
* **Impact**: Broken builds or TypeScript errors can be merged unnoticed.
* **Fix**: Add a GitHub Actions workflow running `tsc --noEmit`, ESLint, and Jest unit tests on PR.

---

### Authentication, Session & Access Control Gaps (To Address During Flow/Security Work)

#### 26. Phone-Only Accounts Permanently Locked Out of Password Reset
* **Exact Locations**:
  - Mobile: [`ForgotPasswordModal.tsx#L90-L98`](file:///D:/project/vyora-app/src/components/ForgotPasswordModal.tsx#L90-L98)
  - Backend: [`AuthService.ts#L638-L641`](file:///D:/project/vyora/vyora-backend/src/modules/auth/service/index.ts#L638-L641)
* **Code Snippet**:
  ```typescript
  // Mobile check
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    Alert.alert('Invalid Email', 'Please enter a valid email address.');
    return;
  }
  // Backend check
  if (hasValidEmail) { ... }
  return {
    success: false,
    message: 'No registered recovery email found for this account. Please update your profile email or contact support.',
  };
  ```
* **Root Cause**: Registration allows mobile-only accounts without email. But password reset strictly demands email.
* **Impact**: A phone-only user who forgets their password cannot reset it. Because they cannot log in, they cannot update their profile email. They are permanently locked out of their business data.
* **Fix**: Allow password reset via mobile number (SMS OTP or mandatory verified email during onboarding).

---

#### 27. Insecure Password Reset (Missing Cryptographic Reset Token)
* **Exact Location**:
  - [`AuthService.ts#L648-L735`](file:///D:/project/vyora/vyora-backend/src/modules/auth/service/index.ts#L648-L735)
* **Root Cause**: Step 2 (`/verify-reset-code`) does not return a signed `resetToken` JWT. Step 3 (`/reset-password`) requires resending `{ identifier, code, newPassword }`.
* **Impact**: Violates Rule CC. The client has to keep plain OTP in local memory; if the component unmounts, the code is lost.
* **Fix**: Step 2 returns a short-lived (15-min) signed JWT `resetToken`. Step 3 requires this `resetToken` alongside the new password.

---

#### 28. Hardcoded Static Password for Invited Staff (`VyoraStaff@123`)
* **Exact Location**:
  - [`BusinessService.ts#L146-L156`](file:///D:/project/vyora/vyora-backend/src/modules/business/service/index.ts#L146-L156)
* **Code Snippet**:
  ```typescript
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('VyoraStaff@123', salt);
  user = new UserModel({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash, // Static hardcoded password!
    role: data.role,
    defaultBusinessId: businessId,
    isInvited: true,
  });
  ```
* **Root Cause**: Pre-creates user accounts with a hardcoded static password string without forcing a password change on first login.
* **Impact**: Anyone knowing an email was invited to Vyora can log in as that staff member using `'VyoraStaff@123'` before the staff member registers.
* **Fix**: Generate a one-time crypto activation token (`crypto.randomBytes(32)`). Email the invitee a link requiring them to set their own password upon first access.

---

#### 29. Staff Invites Exclude Mobile Numbers (Email Only)
* **Exact Location**:
  - [`AccountScreen.tsx#L133-L145`](file:///D:/project/vyora-app/src/screens/AccountScreen.tsx#L133-L145) & [`BusinessService.ts#L143`](file:///D:/project/vyora/vyora-backend/src/modules/business/service/index.ts#L143)
* **Root Cause**: `inviteStaff` strictly requires `email: data.email.toLowerCase()`.
* **Impact**: Counter cashiers and helpers in Indian retail stores often lack email. Merchants cannot invite team members via mobile number.
* **Fix**: Support inviting staff via 10-digit mobile number with WhatsApp/SMS notification.

---

#### 30. Missing Refresh Token Endpoint & Abrupt 24-Hour Logouts
* **Exact Locations**:
  - Backend: [`AuthService.ts#L794-L796`](file:///D:/project/vyora/vyora-backend/src/modules/auth/service/index.ts#L794-L796) & [`auth/route/index.ts`](file:///D:/project/vyora/vyora-backend/src/modules/auth/route/index.ts)
  - Mobile: [`api/client.ts#L77-L95`](file:///D:/project/vyora-app/src/api/client.ts#L77-L95)
* **Root Cause**: Backend generates a 7-day `refreshToken` at login, but has **no `/auth/refresh` route**. The mobile app never saves or uses the refresh token.
* **Impact**: When the 24-hour `accessToken` expires, `apiClient` auto-logs out, kicking cashiers to the login screen mid-transaction.
* **Fix**: Implement `POST /api/v1/auth/refresh`. Add an Axios response interceptor on mobile for automatic silent token refresh.

---

#### 31. Deactivated Staff Retaining 24-Hour Active Access (Zombie Tokens)
* **Exact Locations**:
  - [`authMiddleware.ts#L22-L26`](file:///D:/project/vyora/vyora-backend/src/middleware/auth/index.ts#L22-L26)
  - [`BusinessService.ts#L292`](file:///D:/project/vyora/vyora-backend/src/modules/business/service/index.ts#L292)
* **Root Cause**: `authMiddleware` checks `UserModel.exists({ _id: payload.sub })`, but never checks if `MembershipModel.findOne({ userId, businessId, isActive: true })` is still valid.
* **Impact**: When an owner deactivates an employee (`membership.isActive = false`), the employee's existing JWT remains fully authorized for up to 24 hours. Terminated employees can view customer data and record false entries.
* **Fix**: Verify active membership in `authMiddleware`: `{ userId: payload.sub, businessId: req.businessId, isActive: { $ne: false } }`.

---

#### 32. Stale Role Permissions on Workspace Switching
* **Exact Location**:
  - [`AuthContext.tsx#L294-L325`](file:///D:/project/vyora-app/src/context/AuthContext.tsx#L294-L325)
* **Root Cause**: In `switchBusiness` and `acceptInvite`, `setToken` and `setBusiness` are called, but **`setUser` is never called**.
* **Impact**: If a user is `OWNER` of Store 1 and switches to Store 2 where they are `STAFF`, `user.role` remains `'OWNER'` in React state. The UI continues to show owner buttons until the app is restarted.
* **Fix**: Call `setUser({ ...user, role: switchedBiz.role, businessId })` on switch.

---

#### 33. No Session Revocation on Password Change / Reset
* **Exact Location**:
  - [`AuthService.ts#L778-L782`](file:///D:/project/vyora/vyora-backend/src/modules/auth/service/index.ts#L778-L782)
* **Root Cause**: When a password is changed or reset, `UserModel` does not increment a `tokenVersion`.
* **Impact**: Active JWT tokens on other devices remain valid. An attacker holding a stolen token retains access even after the owner changes the password.
* **Fix**: Add `tokenVersion: number` to `UserModel`. Increment on password change/reset, and verify `payload.tokenVersion === user.tokenVersion` in `authMiddleware`.

---

#### 34. Phone Number Auto-Detection Regex Bug in `api/auth.ts`
* **Exact Location**:
  - [`api/auth.ts#L28-L36`](file:///D:/project/vyora-app/src/api/auth.ts#L28-L36)
* **Code Snippet**:
  ```typescript
  const isNumeric = /^[0-9]{10}$/.test(emailOrPhone.trim());
  ```
* **Root Cause**: Strict regex fails if user types with country code (`+919876543210`) or spaces (`98765 43210`).
* **Impact**: The function incorrectly assumes the input is an email, sending `{ email: "+91 9876543210" }` which fails on the backend.
* **Fix**: Strip non-digits (`val.replace(/[^0-9]/g, '').slice(-10)`) before checking length.

---

#### 35. Silent Mock Return on Profile Update Failure
* **Exact Location**:
  - [`api/auth.ts#L56-L63`](file:///D:/project/vyora-app/src/api/auth.ts#L56-L63)
* **Code Snippet**:
  ```typescript
  updateProfile: async (data: ...): Promise<User> => {
    try {
      const res = await apiClient.patch<User>('/auth/profile', data);
      return (res.data as any)?.data || res.data;
    } catch {
      return data as User; // Fake return on error!
    }
  }
  ```
* **Root Cause**: Catch block swallows network/server errors and returns the unpersisted data.
* **Impact**: The user receives no error notice, leaving the modal believing their new avatar/signature was saved, but the backend never stored it.
* **Fix**: Throw the error so the UI can display a clear, localized alert.

---

#### 36. Retail Customer OTP Login Role Breach in App Shell
* **Exact Locations**:
  - [`AuthService.ts#L380-L384`](file:///D:/project/vyora/vyora-backend/src/modules/auth/service/index.ts#L380-L384)
  - [`App.tsx#L403-L438`](file:///D:/project/vyora-app/App.tsx#L403-L438)
* **Root Cause**: Backend assigns `role: 'CUSTOMER'` on OTP login. `App.tsx` only restricts `if (user?.role === 'STAFF')`, with no restriction for `CUSTOMER`.
* **Impact**: A retail customer logging in via OTP gets access to merchant counter screens to create sales bills and view products.
* **Fix**: Restrict `vyora-app` strictly to merchant roles (`OWNER`, `ADMIN`, `STAFF`); reject or quarantine `CUSTOMER` logins.

---

#### 37. Mobile Logout Does Not Call Backend Server
* **Exact Location**:
  - [`AuthContext.tsx#L253-L269`](file:///D:/project/vyora-app/src/context/AuthContext.tsx#L253-L269)
* **Root Cause**: `logout()` clears local storage only; never calls `POST /auth/logout`.
* **Impact**: JWT tokens remain valid on the server until natural 24h expiration.
* **Fix**: Dispatch `authApi.logout()` before clearing local storage.

---

### Category J: Customers, Parties & Ledger Gaps

#### 38. Client-Side Ledger Filtering Vulnerability & Truncation
* **Exact Location**:
  - [`PartyLedgerModal.tsx#L51-L65`](file:///D:/project/vyora-app/src/components/PartyLedgerModal.tsx#L51-L65)
* **Code Snippet**:
  ```typescript
  const [purRes, payRes] = await Promise.all([
    purchasesApi.list({ limit: 100 }).catch(() => ({ items: [] })),
    paymentsApi.list({ partyId: party.id, limit: 100 }).catch(() => ({ items: [] })),
  ]);

  const partyPurchases = (purRes.items || []).filter(
    (pur: any) =>
      pur.supplierId === party.id ||
      pur.supplierSnapshot?.name?.toLowerCase().includes(party.name.toLowerCase()) ||
      party.name.toLowerCase().includes(pur.supplierSnapshot?.name?.toLowerCase() || '')
  );
  ```
* **Root Cause**: Purchases for a specific supplier are not filtered server-side (`supplierId` omitted from query). Instead, the app fetches the 100 most recent purchases across the entire business and filters in-memory on the client.
* **Impact**: For stores with >100 purchase bills, older purchase transactions for a supplier vanish from their ledger. Additionally, silent catch swallows network failures, displaying an empty ledger rather than an error banner.
* **Fix**: Add `supplierId` query parameter to backend `PurchasesService` and pass `{ supplierId: party.id }` in `purchasesApi.list`. Replace silent catch with explicit retryable error state.

---

#### 39. Anonymous Counter Customer Payment Misallocation
* **Exact Locations**:
  - [`InvoicesScreen.tsx#L67-L81`](file:///D:/project/vyora-app/src/screens/InvoicesScreen.tsx#L67-L81)
  - [`PaymentModal.tsx#L98-L106`](file:///D:/project/vyora-app/src/components/PaymentModal.tsx#L98-L106)
* **Code Snippet**:
  ```typescript
  // InvoicesScreen.tsx
  if (targetInv.customerId) {
    // party found...
  } // if not present, settlingParty is null

  // PaymentModal.tsx
  partiesApi.list({ type: targetType, limit: 100 }).then((res) => {
    setParties(res.items || []);
    if (!initialParty && res.items && res.items.length > 0) {
      setParty(res.items[0]); // Auto-selects first random customer!
    }
  });
  ```
* **Root Cause**: Invoices for walk-in counter customers have no registered `customerId`. When settling payment from the invoices list, `PaymentModal` defaults `party` to `res.items[0]` (the first registered customer in the database).
* **Impact**: Cash/UPI collected from an anonymous counter sale is erroneously credited to the ledger of a random customer in the business catalog, corrupting customer balances.
* **Fix**: When `initialInvoiceId` is present without a registered party, keep the voucher tagged to the invoice as counter receipt (`isWalkIn: true`) or prompt to register customer, never arbitrarily re-assigning to `res.items[0]`.

---

#### 40. Incomplete Party Address & Missing B2B Billing Fields
* **Exact Location**:
  - [`PartiesScreen.tsx#L333-L338, L365-L370`](file:///D:/project/vyora-app/src/screens/PartiesScreen.tsx#L333-L370)
* **Code Snippet**:
  ```typescript
  billingAddress: {
    line1: editingParty?.billingAddress?.line1 || business?.addressLine1 || '',
    city: city.trim() || business?.city || '',
    state: stateName.trim() || business?.state?.trim() || '',
    pincode: pincode.trim() || business?.pincode || '',
  }
  ```
* **Root Cause**: The Add/Edit Party Modal has form fields for `City`, `State`, and `Pincode`, but omits `Street Address / Line 1`, `Shipping Address`, and `PAN`. When editing, `line1` falls back to the shop's own address (`business?.addressLine1`).
* **Impact**: Indian GST compliance requires full street addresses for inter-state B2B invoicing. Invoices generated for customers have the store's own address stamped as the customer's billing address.
* **Fix**: Add `Address Line 1 / Street` input to Add/Edit Party modal; support PAN input and separate delivery/shipping address toggle.

---

#### 41. Runaway Duplicate "Walk-in Customer" Creation Loop
* **Exact Location**:
  - [`CreateInvoiceScreen.tsx#L116-L140`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L116-L140)
* **Code Snippet**:
  ```typescript
  partiesApi.list({ type: 'CUSTOMER', limit: 100 }).then(async (res) => {
    let list = res.items || [];
    let walkIn = list.find((c) => c.name.toLowerCase().includes('walk-in') || ...);
    if (!walkIn) {
      walkIn = await partiesApi.create({ name: 'Walk-in Customer', type: 'CUSTOMER', isWalkIn: true, ... });
    }
  });
  ```
* **Root Cause**: If a business has more than 100 customers, the walk-in customer may not be in the first 100 items returned. The hook assumes it is missing and fires `partiesApi.create`, creating an endless stream of duplicate "Walk-in Customer" records.
* **Impact**: Database pollution with dozens of duplicate walk-in customer entries; slow customer lookups.
* **Fix**: Query explicitly with `partiesApi.list({ type: 'CUSTOMER', search: 'Walk-in', limit: 1 })` before attempting creation, or rely on a dedicated system walk-in customer tenant flag.

---

#### 42. Missing Credit Limit & Overdue Aging Enforcement
* **Exact Locations**:
  - [`PartiesScreen.tsx#L400-L430`](file:///D:/project/vyora-app/src/screens/PartiesScreen.tsx#L400-L430)
  - [`CreateInvoiceScreen.tsx#L393-L400`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L393-L400)
* **Root Cause**: Party schema on mobile lacks `creditLimitMinor` and `creditPeriodDays`. `CreateInvoiceScreen.tsx` never checks whether a customer has overdue unpaid bills or has exceeded their authorized credit limit before generating a credit bill.
* **Impact**: Cashiers unintentionally extend credit to defaulting customers with large unpaid balances without warning or supervisor approval.
* **Fix**: Add `creditLimitMinor` to Party model; display a warning badge / credit alert in `CreateInvoiceScreen.tsx` when `party.currentBalanceMinor + billTotalMinor > party.creditLimitMinor`.

---

#### 43. Party Ledger Statement Sharing & Export Gap
* **Exact Location**:
  - [`PartyLedgerModal.tsx#L140-L200`](file:///D:/project/vyora-app/src/components/PartyLedgerModal.tsx#L140-L200)
* **Root Cause**: `PartyLedgerModal` provides only raw screen viewing and a plain-text WhatsApp reminder. There is no PDF generator or CSV export for the party ledger statement.
* **Impact**: Business owners cannot send an official, itemized account statement (debits, credits, running balance) to customers or suppliers disputing balance amounts.
* **Fix**: Implement `generatePartyLedgerPdf` using `expo-print` and `expo-sharing` to generate and share professional statements.

---

### Category K: Invoicing, POS Counter & Payment Allocation Gaps

#### 44. Complete Absence of Invoice Cancellation in Mobile UI
* **Exact Locations**:
  - [`InvoicesScreen.tsx#L350-L490`](file:///D:/project/vyora-app/src/screens/InvoicesScreen.tsx#L350-L490)
  - [`TransactionDetailModal.tsx#L700-L755`](file:///D:/project/vyora-app/src/components/TransactionDetailModal.tsx#L700-L755)
* **Root Cause**: The backend implements `POST /api/v1/invoices/:id/cancel` and the web frontend implements `CancelInvoiceModal.tsx`. In the mobile app, there is no button, dialog, or method to cancel a finalized invoice.
* **Impact**: If a cashier generates a bill with wrong items, quantities, or taxes, they cannot cancel it from the mobile app, forcing corrupt inventory and tax records to persist unless accessed from a web browser.
* **Fix**: Add a "Cancel Invoice" button in `TransactionDetailModal` and `InvoicesScreen` card actions, prompting for cancellation reason and calling `invoicesApi.cancel(id, reason)`.

---

#### 45. Rigid "Today" Due Date & Missing Credit Payment Terms
* **Exact Location**:
  - [`CreateInvoiceScreen.tsx#L411, L450`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L411)
* **Code Snippet**:
  ```typescript
  const today = new Date().toISOString().split('T')[0];
  const newInv = await invoicesApi.create({
    customerId: selectedCustomer.id,
    issueDate: today,
    dueDate: today, // Hardcoded to today!
    ...
  });
  ```
* **Root Cause**: `dueDate` is hardcoded to `today`. There is no date picker or payment terms dropdown (e.g. "Immediate", "Net 7", "Net 15", "Net 30", or "Custom Date").
* **Impact**: All credit invoices instantly become overdue on day one, skewing aging receivables and sending confusing reminders to credit customers.
* **Fix**: Introduce a Due Date / Payment Terms selector in `CreateInvoiceScreen.tsx` with presets (+7, +15, +30 days) and custom date picker.

---

#### 46. Card / Bank Settlement Drop on Fast Invoice Creation
* **Exact Location**:
  - [`CreateInvoiceScreen.tsx#L414`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L414)
* **Code Snippet**:
  ```typescript
  paymentMethod: isCash ? 'CASH' : (isUpi ? 'UPI' : undefined),
  ```
* **Root Cause**: The screen lets the user select payment methods `['CASH', 'UPI', 'CARD', 'BANK']`, but the submission handler only maps `isCash` and `isUpi`. Selecting `CARD` or `BANK` results in `paymentMethod: undefined`.
* **Impact**: Invoices settled at the counter via Card or Bank Transfer are created as unpaid credit invoices, causing customer dues to increase incorrectly.
* **Fix**: Map `paymentMethod: paymentMethod` directly to backend payload.

---

#### 47. Lack of Draft Bill Saving / Counter Parking
* **Exact Location**:
  - [`CreateInvoiceScreen.tsx#L413`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L413)
* **Root Cause**: `finalize: true` is unconditionally sent on submission. There is no "Save as Draft" or "Park Bill" button.
* **Impact**: If a counter customer steps away to pick up another item, the cashier cannot save the draft to ring up the next customer, leading to lost time or discarded drafts.
* **Fix**: Add "Save as Draft" action button that submits with `finalize: false` and lists drafts in `InvoicesScreen` with 1-tap resume.

---

#### 48. Absence of Line Discounts & Invoice-Level Roundoff / Festive Discounts
* **Exact Location**:
  - [`CreateInvoiceScreen.tsx#L415-L420`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L415-L420)
* **Root Cause**: The line item schema only accepts `unitPriceMinor`, `quantity`, and `taxRatePercent`. There is no `discountPercent` or `discountMinor` at line item or invoice header level.
* **Impact**: Retail stores offering festive discounts, clearance reductions, or flat cash roundoffs (e.g. rounding ₹503.40 to ₹500) have no way to record legal discounts on the invoice.
* **Fix**: Support `discountPercent` and `discountMinor` on lines and invoice summary.

---

### Category L: Profile, Settings, Staff Administration & Reporting Gaps

#### 49. Disconnected & Ephemeral App Settings
* **Exact Location**:
  - [`SettingsScreen.tsx#L125-L177`](file:///D:/project/vyora-app/src/screens/SettingsScreen.tsx#L125-L177)
* **Root Cause**: Settings (print size, default GST rates, mandatory HSN, sound effects, auto roundoff) are saved exclusively to device `AsyncStorage ('vyora_app_settings')`. Zero API calls exist in `SettingsScreen.tsx`.
* **Impact**: Settings are lost if the app cache is cleared or if the merchant switches phones; settings are never synced to the backend `Business` profile; `CreateInvoiceScreen.tsx` ignores these settings during billing.
* **Fix**: Sync settings with backend `PUT /api/v1/business/current` and consume them reactively via `useSettings()` hook.

---

#### 50. Missing Bank Account & Primary UPI Settlement Configuration
* **Exact Locations**:
  - [`SettingsScreen.tsx`](file:///D:/project/vyora-app/src/screens/SettingsScreen.tsx)
  - [`EditProfileModal.tsx`](file:///D:/project/vyora-app/src/components/EditProfileModal.tsx)
* **Root Cause**: The app allows configuring a UPI ID, but has no fields for Bank Name, Account Holder Name, Account Number, or IFSC Code.
* **Impact**: Printed/shared A4 invoices omit mandatory banking details needed for B2B NEFT/RTGS payments.
* **Fix**: Add Bank Account configuration fields (`bankName`, `accountNumber`, `ifscCode`, `accountHolderName`) to business profile.

---

#### 51. Read-Only Staff List with Zero Administration Capabilities
* **Exact Location**:
  - [`AccountScreen.tsx#L424-L439`](file:///D:/project/vyora-app/src/screens/AccountScreen.tsx#L424-L439)
* **Root Cause**: While the backend exposes `PATCH /staff/:id/role`, `PATCH /staff/:id/status`, and `DELETE /staff/:id`, `AccountScreen.tsx` renders staff accounts as an immutable static list.
* **Impact**: Business owners cannot change a staff member's role, deactivate access for a departing cashier, or delete a staff member from the mobile app.
* **Fix**: Add action menu/toggles on staff items to change role, toggle active/inactive status, and remove member.

---

#### 52. Silent Swallowing & Fake Success on Business Profile Update
* **Exact Locations**:
  - [`AuthContext.tsx#L413-L416`](file:///D:/project/vyora-app/src/context/AuthContext.tsx#L413-L416)
  - [`BusinessProfileScreen.tsx#L128-L135`](file:///D:/project/vyora-app/src/screens/BusinessProfileScreen.tsx#L128-L135)
* **Code Snippet**:
  ```typescript
  // AuthContext.tsx
  try {
    await authApi.updateBusiness(payload);
  } catch (err) {
    console.warn('Backend business update sync failed, saved locally:', err);
  } // No rethrow!

  // BusinessProfileScreen.tsx
  await updateBusiness(updated);
  Alert.alert('Profile Saved', 'Your business profile... have been updated.');
  ```
* **Root Cause**: `updateBusiness` catches errors without rethrowing. `BusinessProfileScreen` displays "Profile Saved" even if the server rejected the update due to validation error or network failure.
* **Impact**: Users are falsely assured their GSTIN or business details were updated on the cloud when they were not.
* **Fix**: Rethrow errors in `updateBusiness` and show an honest, actionable error alert if the cloud sync fails.

---

#### 53. Missing Default Invoice Terms & Conditions
* **Exact Locations**:
  - [`BusinessProfileScreen.tsx`](file:///D:/project/vyora-app/src/screens/BusinessProfileScreen.tsx)
  - [`CreateInvoiceScreen.tsx#L89`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L89)
* **Root Cause**: No configuration field exists for business-level default invoice terms (e.g. "Goods once sold will not be returned"). `notes` in `CreateInvoiceScreen` defaults to blank.
* **Impact**: Store owners must re-type legal disclaimers on every single invoice or leave bills legally vulnerable.
* **Fix**: Add `defaultInvoiceTerms` to `Business` profile and auto-populate `notes` on new invoices.

---

#### 54. Hardcoded Single-Day Reports & Missing Date Range Filtering
* **Exact Location**:
  - [`ReportsScreen.tsx#L47-L65`](file:///D:/project/vyora-app/src/screens/ReportsScreen.tsx#L47-L65)
* **Root Cause**: Daybook only filters transactions for hardcoded `todayStr`. There are no filters for Yesterday, This Week, This Month, or Custom Date Range.
* **Impact**: Merchants cannot view sales or cash flow for past dates, calculate weekly tax liabilities, or generate period-end summaries.
* **Fix**: Implement server-side date-filtered queries (`startDate`, `endDate`) and quick filter chips (Today, Yesterday, Last 7 Days, This Month, Custom).

---

#### 55. Absence of Global Error Boundary & Offline State Guard
* **Exact Location**:
  - [`App.tsx#L155-L250`](file:///D:/project/vyora-app/App.tsx#L155-L250)
* **Root Cause**: No React `<ErrorBoundary>` surrounds the main app navigation stack. Uncaught JS exceptions crash the entire application to the phone home screen.
* **Impact**: Unhandled runtime exceptions or malformed data records cause unrecoverable crashes with zero user guidance or recovery option.
* **Fix**: Wrap the root app in an Error Boundary with a user-friendly recovery screen ("Something went wrong") and a restart button.

---

### Category M: Profile, Identity & Media Management Gaps

#### 56. Base64 Signature DB Document Bloat & 413 Payload Explosion
* **Exact Location**:
  - [`SignatureModal.tsx#L201-L245`](file:///D:/project/vyora-app/src/components/SignatureModal.tsx#L201-L245)
* **Code Snippet**:
  ```typescript
  const finalUri = asset.base64
    ? `data:${asset.mimeType || 'image/png'};base64,${asset.base64}`
    : asset.uri;
  setUploadedImageUri(finalUri);

  // ...
  await Promise.all([
    updateBusiness({ signatureUrl: signaturePayload }),
    updateUser({ signatureUrl: signaturePayload }),
  ]);
  ```
* **Root Cause**: Gallery/camera signature uploads encode multi-megabyte base64 strings directly into MongoDB via `signatureUrl`. Unlike business logos, signatures bypass Cloudinary CDN compression.
* **Impact**: Storing multi-megabyte base64 strings directly in MongoDB documents bloats document sizes, triggers HTTP 413 Payload Too Large on Express, and slows down all `GET /auth/me` and `GET /business/current` responses.
* **Fix**: Upload signature bitmaps to Cloudinary first; save only the lightweight secure HTTPS CDN URL in MongoDB.

---

#### 57. Fallback to Local Device File URI on Cloudinary Upload Failure
* **Exact Location**:
  - [`BusinessProfileScreen.tsx#L75-L82`](file:///D:/project/vyora-app/src/screens/BusinessProfileScreen.tsx#L75-L82)
* **Code Snippet**:
  ```typescript
  if (imageUri && (imageUri.startsWith('data:') || imageUri.startsWith('file:'))) {
    try {
      finalUrl = await uploadToCloudinary(imageUri);
    } catch (uploadErr) {
      console.warn('Cloudinary upload warning:', uploadErr);
    }
  }
  if (imagePickerTarget === 'BUSINESS') {
    await updateBusiness({ logoUrl: finalUrl }); // finalUrl still local file://!
  }
  ```
* **Root Cause**: When `uploadToCloudinary` fails due to network outage or quota limits, the catch block swallows the error and proceeds to save `finalUrl` (the local device path `file:///data/user/0/...`) into MongoDB Atlas.
* **Impact**: The business logo is permanently broken for every other user, device, web dashboard, and PDF printout because it points to an unresolvable local sandbox path on a single phone.
* **Fix**: Block database update if Cloudinary fails; show an actionable alert: "Image upload failed. Please check internet connection."

---

#### 58. Immutable Profile Identity (Phone & Email Lockout)
* **Exact Location**:
  - [`EditUserProfileModal.tsx#L30-L65`](file:///D:/project/vyora-app/src/components/EditUserProfileModal.tsx#L30-L65)
* **Root Cause**: The user profile edit modal allows editing only `name` and `avatarUrl`. Phone number and email cannot be viewed, updated, or verified.
* **Impact**: If a store owner changes their telephone number or wishes to link an email to a phone-only account, there is no self-serve mechanism in the mobile app, causing permanent recovery lockout.
* **Fix**: Add Phone and Email update fields with OTP verification before committing changes to backend.

---

### Category N: Billing, Subscription & Multitenancy Gaps

#### 59. Phantom Mobile Subscription Upgrades & Wrong API Endpoint
* **Exact Locations**:
  - [`AccountScreen.tsx#L586-L595`](file:///D:/project/vyora-app/src/screens/AccountScreen.tsx#L586-L595)
  - [`AuthContext.tsx#L439-L453`](file:///D:/project/vyora-app/src/context/AuthContext.tsx#L439-L453)
* **Code Snippet**:
  ```typescript
  // AuthContext.tsx
  const upgradePlan = async (plan: 'starter' | 'growth' | 'enterprise') => {
    await authApi.updateBusiness({ subscriptionPlan: plan } as any);
    setBusiness((prev) => ({ ...prev, subscriptionPlan: plan })); // Mutates local storage!
  };
  ```
* **Root Cause**: Mobile calls `PUT /api/v1/business/current` (`authApi.updateBusiness`). The backend controller validates with `BusinessProfileSchema`, which does not accept `subscriptionPlan` and silently ignores it. The actual backend endpoint for plan upgrades is `PUT /api/v1/business/plan`.
* **Impact**: The backend database never upgrades the tenant plan, but the mobile app mutates local storage to display "Growth/Enterprise Active". The moment a protected action is performed, the server returns 403 Forbidden.
* **Fix**: Call `PUT /api/v1/business/plan` (`authApi.updatePlan`) and verify response before updating local state.

---

#### 60. Zero Payment Verification & Free Tier Bypass in Mobile Plan Checkout
* **Exact Locations**:
  - [`AccountScreen.tsx#L586-L595`](file:///D:/project/vyora-app/src/screens/AccountScreen.tsx#L586-L595)
  - [`UpiQrModal.tsx`](file:///D:/project/vyora-app/src/components/UpiQrModal.tsx)
* **Root Cause**: When `UpiQrModal` is opened from Account, tapping "I have paid" immediately calls `upgradePlan(...)` without requiring a transaction reference (UTR), payment gateway verification, or webhook confirmation.
* **Impact**: Any user can instantly unlock paid Growth or Enterprise tiers for free without transferring funds; zero SaaS invoice/tax receipt is generated.
* **Fix**: Implement the authentic checkout flow from web (`PlanPurchaseModal.tsx`) with UTR entry, server-side payment receipt verification, and GST invoice generation.

---

#### 61. Broken Store Switching Lockout for Multitenant Staff
* **Exact Location**:
  - [`WorkspaceSwitcherModal.tsx#L77-L98`](file:///D:/project/vyora-app/src/components/WorkspaceSwitcherModal.tsx#L77-L98)
* **Code Snippet**:
  ```typescript
  if (isStarter && isOwner) {
    Alert.alert(t('mobile.workspace.switchingRestrictedTitle', 'Multi-Store (Paid Feature)'), ...);
    return;
  }
  ```
* **Root Cause**: `isStarter && isOwner` checks the *currently active store's* subscription plan rather than the target store or membership rights.
* **Impact**: If an owner owns Store A (Starter plan) and is invited as a staff member or co-owner to Store B (Growth plan), they are permanently trapped in Store A and cannot switch workspaces.
* **Fix**: Remove the artificial client-side block on workspace switching; let the backend authorize tenant switching based on valid user memberships.

---

### Category O: Roles, RBAC & Missing Mobile Modules

#### 62. Business Turnover & Margin Leakage to Counter Staff in Dashboard
* **Exact Locations**:
  - [`App.tsx#L127-L153, L384-L442`](file:///D:/project/vyora-app/App.tsx#L127-L153)
  - [`DashboardScreen.tsx`](file:///D:/project/vyora-app/src/screens/DashboardScreen.tsx)
* **Root Cause**: `dashboard` is accessible as tab 2 in `BOTTOM_TABS` for all users, including `STAFF`. `handleNavigate` contains no role check for `dashboard`.
* **Impact**: Cashiers and counter staff can view total gross revenue, profit margins, sales trends, and cash flow metrics, compromising financial privacy.
* **Fix**: Hide the `dashboard` tab for `STAFF` or restrict metric cards to show only counter-level statistics.

---

#### 63. Supplier Purchase Data Leakage to Counter Staff on Home Screen
* **Exact Location**:
  - [`HomeScreen.tsx#L76, L124-L136`](file:///D:/project/vyora-app/src/screens/HomeScreen.tsx#L76)
* **Root Cause**: `HomeScreen` unconditionally executes `purchasesApi.list({ limit: 40 })` and merges supplier purchase bills into the unified transaction feed.
* **Impact**: Staff accounts can view supplier names, purchase bill numbers, and total inward costs, circumventing the staff margin shield.
* **Fix**: Omit purchase queries on `HomeScreen` when `user.role === 'STAFF'`.

---

#### 64. Complete Absence of Purchases Register / Bill List
* **Exact Location**:
  - [`MenuScreen.tsx#L294`](file:///D:/project/vyora-app/src/screens/MenuScreen.tsx#L294)
* **Root Cause**: In `MenuScreen.tsx`, tapping "Purchase Bills" navigates to `'dashboard'` because no purchase list screen exists in the app.
* **Impact**: Store owners have no way to view, search, filter, or review past supplier purchase bills from their phone.
* **Fix**: Create `PurchasesScreen.tsx` with date filters, search, supplier tags, and bill detail modal.

---

#### 65. Complete Absence of Payments & Vouchers Ledger Screen
* **Exact Location**:
  - [`vyora-app/src/screens`](file:///D:/project/vyora-app/src/screens)
* **Root Cause**: There is no dedicated Payments Screen in `vyora-app`.
* **Impact**: Merchants cannot view a chronological register of all inward receipts and outward payments across payment modes (UPI, Cash, Bank Transfer, Cheque).
* **Fix**: Create `PaymentsScreen.tsx` (mirroring web `/payments`) with filtering by mode, date, and party type.

---

#### 66. Absence of Barcode Camera Scanning for POS Checkout
* **Exact Location**:
  - [`CreateInvoiceScreen.tsx`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx)
* **Root Cause**: No camera barcode scanning integration (`expo-barcode-scanner` / `expo-camera`).
* **Impact**: Cashiers must manually search every product by typing its name in a picker modal, causing severe bottlenecking at checkout counters.
* **Fix**: Integrate camera barcode scanner in `CreateInvoiceScreen.tsx` and `ProductsScreen.tsx` for instant barcode-to-cart additions.

---

#### 67. Fake Thermal Print Setting & Broken Receipt Layout
* **Exact Locations**:
  - [`SettingsScreen.tsx#L105`](file:///D:/project/vyora-app/src/screens/SettingsScreen.tsx#L105)
  - [`invoicePdf.ts`](file:///D:/project/vyora-app/src/utils/invoicePdf.ts)
* **Root Cause**: `invoicePdf.ts` contains only standard A4 print templates. The "Thermal 80mm/58mm" toggle in Settings is ignored.
* **Impact**: Printing to Bluetooth or ESC/POS thermal receipt printers outputs unreadable, microscopic multi-column A4 text.
* **Fix**: Implement dedicated 58mm/80mm thermal receipt HTML layout (`generateThermalReceiptHtml`) optimized for thermal POS printers.

---

#### 68. Missing Account Deletion / Data Erasure Flow (Google Play Policy Blocker)
* **Exact Locations**:
  - [`SettingsScreen.tsx`](file:///D:/project/vyora-app/src/screens/SettingsScreen.tsx)
  - [`AccountScreen.tsx`](file:///D:/project/vyora-app/src/screens/AccountScreen.tsx)
* **Root Cause**: No in-app account deletion or data erasure request exists in the app.
* **Impact**: Direct violation of Google Play Store user data policy (mandatory account deletion requirement), risking rejection or suspension during store review.
* **Fix**: Add "Delete Account & Data" action in Settings/Account with confirmation dialog calling `DELETE /auth/me`.

---

#### 69. Absence of Stock Movement / Inventory Audit Ledger Screen
* **Exact Location**:
  - [`vyora-app/src/screens`](file:///D:/project/vyora-app/src/screens)
* **Root Cause**: No inventory movements screen exists in `vyora-app`.
* **Impact**: Store owners cannot audit stock change history (sales deductions, purchase increments, manual adjustments, shrinkage logs).
* **Fix**: Create `InventoryMovementsScreen.tsx` to trace stock adjustments and audit history.

---

### Category P: Advanced Backend Architecture, Security & POS Gaps

#### 70. Lack of MongoDB ACID Transaction Session Across Multi-Entity Mutations
* **Exact Locations**:
  - [`InvoicesService.ts#L172-L215`](file:///D:/project/vyora/vyora-backend/src/modules/invoices/service/index.ts#L172-L215)
  - [`PurchasesService.ts#L92-L137`](file:///D:/project/vyora/vyora-backend/src/modules/purchases/service/index.ts#L92-L137)
  - [`PaymentsService.ts#L55-L125`](file:///D:/project/vyora/vyora-backend/src/modules/payments/service/index.ts#L55-L125)
* **Code Snippet**:
  ```typescript
  // InvoicesService.ts
  await invoice.save(); // 1. Invoice saved

  for (const line of calculatedLines) {
    await InventoryService.recordMovement(...); // 2. Can fail on product 3!
  }

  await PartiesService.updateBalance(...); // 3. Can fail!
  await payment.save(); // 4. Can fail!
  ```
* **Root Cause**: Multi-entity financial mutations execute sequentially without a MongoDB replica set session (`startSession()` / `withTransaction()`).
* **Impact**: If a server terminates, network times out, or any sub-step in the loop throws an error, the database is left in a partially committed, corrupt state (e.g. invoice exists, but inventory for item 2 was never decremented, ledger was not updated, and payment voucher was never created).
* **Fix**: Wrap all multi-entity financial updates in `mongoose.startSession()` using `session.withTransaction()`.

---

#### 71. Unprotected Expense Deletion & Zero RBAC Guard
* **Exact Locations**:
  - [`expenses/route/index.ts#L23`](file:///D:/project/vyora/vyora-backend/src/modules/expenses/route/index.ts#L23)
  - [`ExpensesScreen.tsx#L93-L114`](file:///D:/project/vyora-app/src/screens/ExpensesScreen.tsx#L93-L114)
  - [`TransactionDetailModal.tsx#L80-L100`](file:///D:/project/vyora-app/src/components/TransactionDetailModal.tsx#L80-L100)
* **Code Snippet**:
  ```typescript
  // expenses/route/index.ts
  router.delete('/:id', ExpensesController.remove); // Zero role guard!
  ```
* **Root Cause**: `DELETE /api/v1/expenses/:id` lacks `requireRoles('OWNER', 'ADMIN')`. On mobile, `handleDeleteExpense` has no role check.
* **Impact**: Any counter billing staff member can delete historical business expenses, cash spending logs, or payroll records without authorization or audit trail.
* **Fix**: Protect route with `requireRoles('OWNER', 'ADMIN')`; hide delete buttons on mobile if `user.role === 'STAFF'`.

---

#### 72. Missing Unique Multi-Tenant Compound Indexes & Sequence Race Conditions
* **Exact Locations**:
  - [`PaymentsService.ts#L125-L127`](file:///D:/project/vyora/vyora-backend/src/modules/payments/service/index.ts#L125-L127)
  - [`PurchasesService.ts#L119-L120`](file:///D:/project/vyora/vyora-backend/src/modules/purchases/service/index.ts#L119-L120)
* **Code Snippet**:
  ```typescript
  const count = await PaymentModel.countDocuments({ businessId });
  const paymentNumber = formatDocumentNumber(prefix, count + 1, 4);
  ```
* **Root Cause**: Voucher numbers (`RCPT-0001`, `PAY-0001`) are calculated using `countDocuments({ businessId }) + 1`. If two cashiers collect payment at the same second, both count the same number and generate duplicate voucher numbers.
* **Impact**: Colliding voucher numbers in accounting records, breaking GST audits and ledger reconciliation.
* **Fix**: Use atomic sequence acquisition (`findOneAndUpdate` with `$inc`) and enforce compound unique index `{ businessId: 1, paymentNumber: 1 }`.

---

#### 73. Collapse of Purchase Tax Breakdown & Inability to Claim GSTR-3B ITC
* **Exact Locations**:
  - [`PurchasesService.ts#L38-L59`](file:///D:/project/vyora/vyora-backend/src/modules/purchases/service/index.ts#L38-L59)
  - [`reports/service/index.ts#L83-L102`](file:///D:/project/vyora/vyora-backend/src/modules/reports/service/index.ts#L83-L102)
  - [`CreatePurchaseScreen.tsx#L38-L50`](file:///D:/project/vyora-app/src/screens/CreatePurchaseScreen.tsx#L38-L50)
* **Root Cause**: `PurchasesService` collapses all tax on purchase bills into a single scalar `totalTaxMinor`. It fails to compute or store `cgstMinor`, `sgstMinor`, or `igstMinor` based on the supplier's state.
* **Impact**: Indian businesses filing monthly GSTR-3B cannot claim Input Tax Credit (ITC) because tax claims must be separated into CGST, SGST, and IGST.
* **Fix**: Calculate and store `cgstMinor`, `sgstMinor`, and `igstMinor` on `PurchaseBillModel` using `@vyora/utils`.

---

#### 74. Lack of Official GSTR-1 Tables & HSN Code Aggregation
* **Exact Location**:
  - [`reports/service/index.ts#L8-L65`](file:///D:/project/vyora/vyora-backend/src/modules/reports/service/index.ts#L8-L65)
* **Root Cause**: `getSalesRegister` returns an unsegmented flat list of invoices. It lacks Table 4 (B2B), Table 5 (B2C Large), Table 7 (B2C Small), Table 12 (HSN Summary), and Table 13 (Document Summary).
* **Impact**: Store owners cannot file GST returns without paying an accountant to manually reconstruct the summaries in Excel.
* **Fix**: Add dedicated `/reports/gstr-1` endpoint aggregating invoices into official GSTN filing tables.

---

#### 75. Rigid Integer Stepper & Absence of Decimal Quantities
* **Exact Location**:
  - [`CreateInvoiceScreen.tsx#L280-L310`](file:///D:/project/vyora-app/src/screens/CreateInvoiceScreen.tsx#L280-L310)
* **Root Cause**: Line items only support clicking `+` and `-` buttons that increment/decrement by integer `1`. There is no numeric text input to type quantities.
* **Impact**: Grocery, dairy, textile, and hardware stores cannot bill fractional quantities (e.g. 1.5 KG, 0.75 LTR, 2.25 MTR). Cashiers selling 50 items must tap the screen 50 times.
* **Fix**: Add a numeric quantity input allowing decimal values up to 3 decimal places (`parseFloat(qty)`).

---

#### 76. Complete Absence of Android Hardware Back Button Handling
* **Exact Location**:
  - [`App.tsx#L155-L250`](file:///D:/project/vyora-app/App.tsx#L155-L250)
* **Root Cause**: `App.tsx` lacks `BackHandler.addEventListener('hardwareBackPress', ...)`.
* **Impact**: Pressing the physical or gesture Android Back button on sub-screens (`create_bill`, `business_profile`, `reports`, `expenses`) immediately kills and exits the entire application rather than navigating back to the home screen.
* **Fix**: Implement a stack history in navigation state and handle `hardwareBackPress` to pop screens.

---

#### 77. Missing Offline Connectivity Detection & Network Status Banner
* **Exact Locations**:
  - [`App.tsx`](file:///D:/project/vyora-app/App.tsx)
  - [`client.ts`](file:///D:/project/vyora-app/src/api/client.ts)
* **Root Cause**: The app lacks a network listener (`NetInfo`). It has no awareness of whether the device is online or offline.
* **Impact**: When network drops in rural or basement retail counters, user actions hang for 30 seconds before failing with naked alerts; cashiers have no indication of connection health.
* **Fix**: Add NetInfo listener with an ambient "Offline - Offline Billing Mode" banner and auto-retry on reconnect.

---

#### 78. Missing Biometric App Lock for POS Cashier Security
* **Exact Locations**:
  - [`App.tsx`](file:///D:/project/vyora-app/App.tsx)
  - [`SettingsScreen.tsx`](file:///D:/project/vyora-app/src/screens/SettingsScreen.tsx)
* **Root Cause**: No `expo-local-authentication` integration for fingerprint or face unlock.
* **Impact**: Counter POS devices left on shop counters can be accessed by unauthorized individuals to view sales, modify prices, or delete records.
* **Fix**: Add optional Biometric / PIN Lock in Settings that prompts on app resume.

---

#### 79. Missing Backend Invoice Creation Idempotency Guard
* **Exact Location**:
  - [`InvoicesService.ts#L96-L105`](file:///D:/project/vyora-app/src/modules/invoices/service/index.ts#L96-L105)
* **Root Cause**: While `PaymentsService` supports `dto.idempotencyKey`, `InvoicesService.create` has no idempotency check.
* **Impact**: Rapid double-taps by cashiers or network retry storms create duplicate sales invoices and double-deduct inventory.
* **Fix**: Add unique `idempotencyKey` check in `InvoicesService.create` matching payment voucher logic.


---

### Category Q: RBAC & Multitenant Security Inversions (Gaps 80–84)

#### 80. Critical RBAC Inversion on Core Counter Billing Operations (Staff Blocked from Invoicing)
* **Exact Locations**:
  - [`invoices/route/index.ts#L18`](file:///D:/project/vyora/vyora-backend/src/modules/invoices/route/index.ts#L18)
  - [`parties/route/index.ts#L17`](file:///D:/project/vyora/vyora-backend/src/modules/parties/route/index.ts#L17)
  - [`payments/route/index.ts#L17`](file:///D:/project/vyora/vyora-backend/src/modules/payments/route/index.ts#L17)
* **Root Cause**: `POST /api/v1/invoices`, `POST /api/v1/invoices/:id/finalize`, `POST /api/v1/parties`, and `POST /api/v1/payments` are strictly gated with `requireRoles('OWNER', 'ADMIN')`. The default `STAFF` role given to hired cashiers and sales clerks is omitted.
* **Impact**: Hired counter cashiers cannot create sales bills, register walk-in customers, or accept payments. Every billing attempt fails with `403 Forbidden: Access denied. This action requires OWNER or ADMIN permission, but your role is STAFF.`
* **Fix**: Update permission middleware on these routes to `requireRoles('OWNER', 'ADMIN', 'STAFF')` while preserving audit logging of `performedByUserId`.

---

#### 81. Unprotected Financial Metrics & Complete Data Exfiltration Exposure
* **Exact Locations**:
  - [`dashboard/route/index.ts#L9`](file:///D:/project/vyora/vyora-backend/src/modules/dashboard/route/index.ts#L9)
  - [`reports/route/index.ts#L9-L19`](file:///D:/project/vyora/vyora-backend/src/modules/reports/route/index.ts#L9-L19)
  - [`expenses/route/index.ts#L20-L23`](file:///D:/project/vyora/vyora-backend/src/modules/expenses/route/index.ts#L20-L23)
* **Root Cause**: Complete absence of `requireRoles('OWNER', 'ADMIN')` on `GET /api/v1/dashboard/metrics`, all `/reports/*` endpoints and CSV exports, and `DELETE /api/v1/expenses/:id`.
* **Impact**: Any junior counter clerk with a mobile auth token can inspect gross margins, net company profit, download entire customer debt ledgers and supplier inward cost registers, and delete company expense vouchers.
* **Fix**: Enforce `requireRoles('OWNER', 'ADMIN')` across all reporting, financial metrics, and expense deletion routes.

---

#### 82. Cross-Tenant Admin Impersonation & Authorization Bypass
* **Exact Location**:
  - [`tenant/index.ts#L27-L32`](file:///D:/project/vyora/vyora-backend/src/middleware/tenant/index.ts#L27-L32)
* **Root Cause**: `let effectiveRole = req.user.role === 'ADMIN' ? 'ADMIN' : undefined; if (req.user.role !== 'ADMIN') { ...Membership check... }`. If a user holds `role: 'ADMIN'` in their JWT or user model, `tenantMiddleware` completely bypasses tenant membership validation for the requested `x-business-id`.
* **Impact**: Any user who is an admin of Store A can specify Store B's ID in the `x-business-id` header and immediately gain unrestricted administrative access to Store B's customers, sales, stock, and finances.
* **Fix**: Strictly validate `MembershipModel.findOne({ userId, businessId, isActive: true })` for ALL roles, without exception, ensuring tenant boundaries cannot be breached.

---

#### 83. Cross-Tenant Global UserModel.role Corruption
* **Exact Location**:
  - [`business/service/index.ts#L240`](file:///D:/project/vyora/vyora-backend/src/modules/business/service/index.ts#L240)
* **Root Cause**: `await UserModel.findByIdAndUpdate(membership.userId, { role: newRole });` directly mutates the global user account document when updating a membership role in a single store.
* **Impact**: If a user is an `OWNER` of Store 1 and is invited as `STAFF` to Store 2, changing their role in Store 2 overwrites their global user record, stripping their ownership status or corrupting their privileges across all stores.
* **Fix**: Remove `UserModel.role` mutation. Role and permissions must be scoped exclusively to `MembershipModel` per `businessId`.

---

#### 84. Ephemeral In-Memory OTP Store Causing Login & Reset Failures
* **Exact Location**:
  - [`auth/service/index.ts#L29`](file:///D:/project/vyora/vyora-backend/src/modules/auth/service/index.ts#L29)
* **Root Cause**: `private static otpStore = new Map<string, { otp: string; expiresAt: number }>();` stores OTPs inside Node.js volatile process heap.
* **Impact**: Server restarts, container deployments, or multi-instance load balancing immediately wipe all active OTPs. Cashiers and owners submitting valid OTPs receive "Invalid or expired OTP" errors.
* **Fix**: Migrate OTP storage to Redis with TTL or a dedicated MongoDB `Otp` collection with auto-expiring TTL index.

---

### Category R: Core Accounting, Inventory & Return Flows (Gaps 85–90)

#### 85. Complete Absence of Credit Notes (Sales Return) & Debit Notes (Purchase Return)
* **Exact Locations**:
  - Monorepo backend & mobile architecture
* **Root Cause**: Zero schema, routes, or screens exist for Credit Notes and Debit Notes.
* **Impact**: Under Indian GST Section 34, returns, rate differences, and post-sale discounts must be recorded via statutory Credit Notes and Debit Notes. Merchants cannot process customer returns, restock returned inventory traceably, reverse GST output liability, or claim Input Tax Credit adjustments in GSTR-1 Table 9B.
* **Fix**: Implement `CreditNote` and `DebitNote` models, services with stock restoration and ledger debit/credit reversal, and dedicated return screens in mobile app.

---

#### 86. Inventory Read-Modify-Write Concurrency Race Condition
* **Exact Location**:
  - [`inventory/service/index.ts#L26-L34`](file:///D:/project/vyora/vyora-backend/src/modules/inventory/service/index.ts#L26-L34)
* **Root Cause**: Uses non-atomic `product.currentStock = nextStock; await product.save();` instead of database-level atomic operations.
* **Impact**: Simultaneous sales across multiple counter cashiers or concurrent web/mobile checkouts result in lost updates, untracked inventory depletion, and phantom negative stock.
* **Fix**: Use atomic MongoDB updates: `ProductModel.findOneAndUpdate({ _id: productId, businessId, currentStock: { $gte: -delta } }, { $inc: { currentStock: delta } }, { new: true })`.

---

#### 87. Inventory Loss & Damage Adjustments Misclassified as Sales
* **Exact Location**:
  - [`products/service/index.ts#L165`](file:///D:/project/vyora/vyora-backend/src/modules/products/service/index.ts#L165)
* **Root Cause**: `movementType: quantityDelta >= 0 ? 'PURCHASE' : 'SALE'` sets negative stock write-offs as a `'SALE'`.
* **Impact**: Damaged, expired, stolen, or broken inventory items written off by store owners are reported as sales revenue, corrupting turnover statistics, gross margin reports, and tax audits.
* **Fix**: Map adjustments to dedicated movement types: `ADJUSTMENT_DAMAGE`, `ADJUSTMENT_EXPIRED`, `ADJUSTMENT_LOSS`, or `ADJUSTMENT_CORRECTION`.

---

#### 88. Purchase Inward Cost Updates Ignored in Product Catalog Master
* **Exact Location**:
  - [`purchases/service/index.ts#L95-L106`](file:///D:/project/vyora/vyora-backend/src/modules/purchases/service/index.ts#L95-L106)
* **Root Cause**: Recording a supplier purchase bill increments physical stock quantities but never updates `ProductModel.purchasePriceMinor`.
* **Impact**: When suppliers increase wholesale prices, the product catalog retains outdated acquisition costs, causing inaccurate gross margin analysis, false profit metrics, and underpriced sales bills.
* **Fix**: Add configurable option to auto-update latest purchase cost (`purchasePriceMinor`) on the product master upon purchase bill confirmation.

---

#### 89. Rigid GST Tax Enums Excluding Statutory 3% & 0.25% Rates
* **Exact Location**:
  - [`products/model/index.ts#L42`](file:///D:/project/vyora/vyora-backend/src/modules/products/model/index.ts#L42)
* **Root Cause**: Mongoose schema strictly limits `taxRatePercent` enum to `[0, 5, 12, 18, 28]`.
* **Impact**: Jewellery and precious metal stores (subject to 3% GST) and rough gemstone/diamond merchants (subject to 0.25% GST) are completely unable to add items or bill sales in Vyora.
* **Fix**: Expand tax rate enum to `[0, 0.25, 3, 5, 12, 18, 28]` across backend schemas, validation libraries, and mobile tax pickers.

---

#### 90. Rejection of Customer Advance & Overpayment in Voucher Allocation
* **Exact Location**:
  - [`payments/service/index.ts#L49-L53`](file:///D:/project/vyora/vyora-backend/src/modules/payments/service/index.ts#L49-L53)
* **Root Cause**: `if (dto.amountMinor > invoice.dueAmountMinor) throw new BadRequestError(...)` crashes when payment exceeds outstanding invoice balance.
* **Impact**: When a customer rounds up payment (e.g. paying ₹1,000 for a ₹950 bill and requesting the ₹50 change be kept as credit), the payment fails with an ugly error.
* **Fix**: Automatically settle the invoice to ₹0 and allocate the remaining unallocated balance to the customer's advance ledger credit (`currentBalanceMinor`).

---

### Category S: Mobile POS, Hardware & Offline Gaps (Gaps 91–95)

#### 91. Security & Privacy Breach in UPI QR Code Generation via Third-Party Web Service
* **Exact Location**:
  - [`UpiQrModal.tsx#L59-L63`](file:///D:/project/vyora-app/src/components/UpiQrModal.tsx#L59-L63)
* **Root Cause**: Generates QR images via an external HTTP GET request to `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=...`.
* **Impact**: Leaks merchant UPI VPA, customer invoice number, and transaction amounts to a public third-party web service. Fails completely when internet connectivity drops or when `qrserver.com` experiences latency or rate limiting.
* **Fix**: Generate vector QR codes locally on-device using `react-native-qrcode-svg` with zero network dependency.

---

#### 92. Missing Infinite Scroll & List Pagination in Mobile App
* **Exact Locations**:
  - [`InvoicesScreen.tsx#L105-L110`](file:///D:/project/vyora-app/src/screens/InvoicesScreen.tsx#L105-L110)
  - [`ProductsScreen.tsx`](file:///D:/project/vyora-app/src/screens/ProductsScreen.tsx)
  - [`PartiesScreen.tsx`](file:///D:/project/vyora-app/src/screens/PartiesScreen.tsx)
* **Root Cause**: `FlatList` queries hardcode `limit: 50` or `limit: 100` and lack `onEndReached` handlers, cursor state, or pagination controls.
* **Impact**: Stores with more than 50 bills or 100 items cannot view, search, or audit older records on mobile.
* **Fix**: Implement cursor-based infinite scrolling with `onEndReached` and `ListFooterComponent` loading indicators.

---

#### 93. Incomplete Daybook Reconciliation Missing Cash Purchases & Supplier Payables
* **Exact Location**:
  - [`ReportsScreen.tsx#L47-L102`](file:///D:/project/vyora-app/src/screens/ReportsScreen.tsx#L47-L102)
* **Root Cause**: Daybook calculation aggregates sales invoices, customer receipts, and expense items, but completely omits inward cash purchases and supplier payments (`PAYMENT_OUT`).
* **Impact**: The reported closing cash-in-hand is grossly overstated whenever cash was paid to suppliers or vendors, causing daily cash drawer reconciliation errors.
* **Fix**: Include inward cash purchases and supplier payout vouchers in daily cash inflow/outflow calculations.

---

#### 94. Disconnected Party Ledger Display Lacking Chronological Interleaving & Running Balances
* **Exact Location**:
  - [`PartyLedgerModal.tsx#L268-L330`](file:///D:/project/vyora-app/src/components/PartyLedgerModal.tsx#L268-L330)
* **Root Cause**: Invoices and payments are rendered in disconnected segmented blocks rather than merged into a single chronological timeline with Running Balance.
* **Impact**: Customers and suppliers cannot track balance changes over time or reconcile individual transactions against statements.
* **Fix**: Interleave invoices, purchases, and payments chronologically by date and compute a real-time running balance column (Debit, Credit, Balance).

---

#### 95. Missing Date Range Filtering Across Mobile Registers
* **Exact Locations**:
  - [`InvoicesScreen.tsx`](file:///D:/project/vyora-app/src/screens/InvoicesScreen.tsx)
  - [`ReportsScreen.tsx`](file:///D:/project/vyora-app/src/screens/ReportsScreen.tsx)
* **Root Cause**: Absence of date range filter components (Today, Yesterday, This Week, This Month, Custom Date Range).
* **Impact**: Merchants cannot look up or audit invoices created during specific billing periods, previous weeks, or historical months.
* **Fix**: Add a unified Date Range Filter picker with standard business presets (Today, Yesterday, This Week, This Month, Custom).
