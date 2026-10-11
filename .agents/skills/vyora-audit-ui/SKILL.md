---
name: vyora-audit-ui
description: >-
  Audits Vyora frontend for Theme B (Teal Ledger), required field asterisks, modal footer architecture,
  zero-data clean slate table behavior, debounced search inputs, and pure icon-only table action columns.
  Triggered by the '/audit-ui' slash command or when asked to review or audit Vyora UI components.
---

# Vyora UI & Design System Auditor (`/audit-ui`)

Runs automated AST and regex invariant audits across all React components in `vyora-frontend/src`.

## Command Syntax
```bash
/audit-ui
# or run in terminal:
pnpm audit:ui
```

## Checks Performed
1. **Modal Architecture**: All modals must supply buttons via `footer={<Button ... />}` with zero internal `<div className="border-t">`.
2. **Table Action Columns**: Action buttons must be icon-only (`<Edit2 />`, `<Trash2 />`) with `title` and `aria-label`.
3. **Debounced Search**: Search queries must not trigger raw `onChange` API requests without a 300ms debounce.
4. **Clean Slate State**: Tables with 0 rows must suppress pagination controls and search filter bars.
5. **Zero "Archive" Terminology**: Complete ban on "archive" verbs or states; strictly "Delete" / "Remove".

Results are stored in `docs/qa-reports/UI_AUDIT_REPORT.md`.
