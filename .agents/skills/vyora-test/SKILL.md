---
name: vyora-test
description: >-
  Autonomous multi-agent testing and auto-fixing workflow for Vyora.
  Triggered by the '/test <module>' command or whenever the user asks to test, audit, or verify a module
  (e.g., /test products, /test parties, /test invoices, /test payments, /test purchases, /test roles, or /test all).
  Executes automated QA runs, performs Chrome DevTools MCP browser inspections, generates structured bug reports,
  hands off issues to the developer agent to fix, and re-verifies until 100% pass rate is achieved.
---

# Vyora Autonomous QA Testing & Healing Skill (`/test`)

This skill defines the autonomous multi-agent testing, auditing, and self-healing lifecycle for the Vyora platform.

```
                      ┌───────────────────────────────────────┐
                      │ User runs /test <module> (or /test all)│
                      └──────────────────┬────────────────────┘
                                         ▼
                      ┌───────────────────────────────────────┐
                      │ Phase 1: Automated QA Runner + MCP    │
                      │  • Isolated tenant registration       │
                      │  • Clean slate & boundary tests       │
                      │  • Edge-to-edge modal footer audit    │
                      │  • Pure HTTP DELETE verb verification │
                      │  • Staff vs Owner RBAC protection     │
                      │  • Chrome DevTools MCP console checks │
                      └──────────────────┬────────────────────┘
                                         ▼
                                   Any Failures?
                                  /            \
                             No  /              \ Yes
                                ▼                ▼
       ┌────────────────────────────┐    ┌───────────────────────────────────┐
       │ 🟢 100% Pass Sign-Off       │    │ Phase 2: Structured Bug Report    │
       │ Output report & metrics     │    │ docs/qa-reports/BUG_REPORT_*.md   │
       └────────────────────────────┘    └─────────────────┬─────────────────┘
                                                           ▼
                                         ┌───────────────────────────────────┐
                                         │ Phase 3: Developer Remediation    │
                                         │  • Surgical code edits            │
                                         │  • TypeScript compilation checks  │
                                         └─────────────────┬─────────────────┘
                                                           ▼
                                         ┌───────────────────────────────────┐
                                         │ Phase 4: Re-verification Loop     │
                                         │ Re-run until 0 failures remaining │
                                         └───────────────────────────────────┘
```

---

## Supported Commands & Syntax

| Command | Target Scope | Description |
| :--- | :--- | :--- |
| `/test all` | Entire System | Runs complete static, API, UI, and security tests across all modules. |
| `/test products` | Products Module | Tests inventory catalog, units, GST rates, stock alerts, modal footers. |
| `/test parties` | Parties Module | Tests customers, suppliers, GSTIN format validation, address structures. |
| `/test invoices` | Invoices Module | Tests tax calculations, line items, status transitions, print/PDF previews. |
| `/test payments` | Payments Module | Tests payment allocations, ledger records, receipts, and balance sync. |
| `/test purchases` | Purchases Module | Tests purchase order creation, inventory stock increments, supplier bills. |
| `/test roles` | RBAC & Security | Tests primary owner immutability, staff view-only restrictions, token auth. |

---

## Phase-by-Phase Execution Instructions

### Phase 1: Automated Test & MCP Chrome DevTools Audit

1. **Execute Automated QA Runner**:
   Run the test runner from project root (`C:\Users\sande\vyora\`):
   ```bash
   node scripts/qa-runner.js --module <module_name>
   ```
   This runs:
   - **Static Architecture Invariants**:
     - All modals implement dedicated `footer={<Button ... />}` with zero floating `<div className="border-t">` inside modal body.
     - Zero occurrences of forbidden `"archive"` terminology in endpoints, hooks, or buttons.
     - Table action buttons are pure icons (`<Edit2 />`, `<Trash2 />`) with accessible tooltips/aria-labels.
     - Clean Slate Zero-data: Table pagination and filters are suppressed when total items is 0.
   - **Functional Tenant & API Tests**:
     - Registers an isolated ephemeral tenant: `qa_test_<timestamp>@vyora.internal`.
     - Tests module-specific CRUD flows.
     - Verifies explicit HTTP `DELETE` verb (never `GET` or `PUT` for deletions).
     - Confirms monetary values use integer minor units (paise / cents).
   - **RBAC & Security Guard**:
     - Confirms primary owner cannot be demoted or role-altered (403 Forbidden).
     - Confirms staff users have strictly view-only access without delete permissions.

2. **Live Browser Audit via Chrome DevTools MCP (If Frontend is Running)**:
   When frontend is accessible at `http://localhost:3000`:
   - Call `mcp_chrome-devtools_navigate_page` to `http://localhost:3000/<module>`.
   - Call `mcp_chrome-devtools_list_console_messages` to ensure zero uncaught errors or failed network requests.
   - Call `mcp_chrome-devtools_evaluate_script` to verify DOM invariants:
     - Check mandatory form inputs have red asterisks `<span class="text-red-500">*</span>`.
     - Check search input has debounce delay (300ms).
     - Check mobile viewport layout has bottom navigation bar.

---

### Phase 2: Structured Bug Report Generation

If any test asserts fail or UI gaps are caught:
1. Generate or update `docs/qa-reports/BUG_REPORT_<module>.md` with clear reproduction details:
   ```markdown
   # Bug Report: <Module>
   **Timestamp**: <ISO Date>
   **Failing Asserts**: <Count>

   ### Bug 1: [<Severity>] <Summary>
   - **File**: `vyora-frontend/src/...` or `vyora-backend/src/...`
   - **Expected**: <What should happen>
   - **Actual**: <What occurred>
   - **Reproduction**: <Steps or API payload>
   - **Remediation**: <Concrete fix instructions>
   ```

---

### Phase 3: Autonomous Developer Remediation

1. Read the flagged files and understand the root cause.
2. Apply surgical fixes using `replace_file_content`:
   - Never replace entire files when modifying specific logic.
   - Adhere strictly to **Theme B (Teal Ledger)** styles.
   - Use integer minor units for monetary logic.
   - Keep actions strictly icon-only with `title` and `aria-label`.
   - Ensure modals pass action buttons via `footer={...}`.
3. Verify compilation after changes:
   ```bash
   pnpm --filter vyora-backend build
   pnpm --filter vyora-frontend build
   ```

---

### Phase 4: Re-Verification & Sign-Off

1. Re-run the automated QA suite:
   ```bash
   node scripts/qa-runner.js --module <module_name>
   ```
2. Verify that **Failed** count is **0**.
3. Confirm `docs/qa-reports/QA_REPORT_<module>.md` indicates `🟢 ALL PASSED`.
4. Present a concise, professional summary to the user highlighting:
   - Module tested.
   - Total assertions verified.
   - Issues fixed (if any).
   - Current health status (`🟢 100% PASS`).
