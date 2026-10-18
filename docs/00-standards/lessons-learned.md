# Vyora Lessons Learned & Incident Rulebook

> **Rule**: When a bug, architectural flaw, or regression is identified and fixed, add a permanent one-line entry and explanation here to ensure neither AI agents nor engineers repeat it.

---

## Log of Lessons Learned

### 1. Web Runtime `ReferenceError: Platform is not defined`
- **Context**: In React Native / Expo apps (`vyora-app`), using `...Platform.select({ web: { outlineStyle: 'none' } })` in component styles.
- **Root Cause**: Omitting `Platform` from `import { View, Text, Platform } from 'react-native';`. In native iOS/Android engines this might be tolerated or bundled differently, but Web Metro bundler fails with fatal runtime crash: `ReferenceError: Platform is not defined`.
- **Permanent Rule**: Always verify that `Platform` is explicitly imported from `'react-native'` whenever `Platform.OS` or `Platform.select()` is used.

---

### 2. Router Files Bypassing Controller Layer
- **Context**: In `modules/auth/route/index.ts`, adding a route like `authRouter.post('/welcome', async (req, res) => { ... })` where email dispatch logic was coded inline.
- **Root Cause**: Bypassing the Controller and Service architecture created hidden endpoints that escaped validation, unit testing, and standard error envelopes.
- **Permanent Rule**: Router files must ONLY register paths, middlewares, and call static Controller methods. All request processing belongs in Controller & Service layers.

---

### 3. The "God-Screen" Anti-Pattern in React Native
- **Context**: `ProductsScreen.tsx`, `CreateInvoiceScreen.tsx`, and `SettingsScreen.tsx` growing to 1,200–1,600 lines each.
- **Root Cause**: Stacking 20+ `useState` hooks, API fetch calls, Cloudinary upload handlers, multi-field form dialogs, and large style blocks in a single file.
- **Permanent Rule**: Screens must remain lightweight coordinators (<400 lines). State and API logic must be extracted into `src/hooks/use<Feature>Screen.ts` and dialogs into `src/components/<FeatureModal>.tsx`.

---

### 4. Floating Point Rounding Errors in Financial Records
- **Context**: Computing GST (CGST/SGST 9%) on fractional rupee amounts using standard float division (`total * 0.18`).
- **Root Cause**: JavaScript IEEE 754 precision issues produced decimals like `124.99999999999999` instead of `125.00`, leading to discrepancies with the tax department and party ledgers.
- **Permanent Rule**: All financial math must use integer paisa (minor units). Multiplication and division must use `Math.round()` on integer paisa values.

---

### 5. Cross-Tenant Data Leakage Risk
- **Context**: Querying subdocuments or foreign references (e.g. `Product.findById(id)`).
- **Root Cause**: `findById` without `{ businessId }` allows an authenticated user from Business A to query or mutate records belonging to Business B if an ID is guessed.
- **Permanent Rule**: Always use `findOne({ _id: id, businessId })` and update operations with `{ _id: id, businessId }`.

---

### 6. Mobile Dark Mode Legibility Regressions
- **Context**: Hardcoding `#123B3A` or `#FFFFFF` in component stylesheets.
- **Root Cause**: In Dark Mode, `#FFFFFF` text becomes invisible against white surfaces, or dark text becomes unreadable on dark backgrounds (`#0B1313`).
- **Permanent Rule**: Zero raw hex colors in mobile stylesheets. Always bind dynamically to `theme.text`, `theme.card`, `theme.background`, `theme.border` from `useTheme()`.

---

### 7. React Native Nested Modals & Vertical-Slice Schema Contract
- **Context**: Opening `<CreateStoreModal>` from `<WorkspaceSwitcherModal>` and creating a store branch with only a name and phone number.
- **Root Cause**: 
  1. React Native forbids placing a `<Modal>` inside another `<Modal>`. On Android native devices, this freezes the UI, fails to render, or traps touch events.
  2. `BusinessModel` strictly required `addressLine1`, `city`, `state`, `pincode`, causing Mongoose `ValidationError` on quick-creation.
- **Permanent Rule**: 
  1. Modals must always be rendered as top-level siblings (using React Fragments `<>` with mutually exclusive `visible` conditions).
  2. Quick-create domain schemas must provide fallback defaults for address fields so counter-speed creations never fail validation.

