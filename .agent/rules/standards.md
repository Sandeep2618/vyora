# Project Standards Rule

> These standards apply to all code generated or modified in Vyora.

1. **Read Standards First**: Before writing any code, read all files in `docs/00-standards/`.
2. **Fixed Folder Structure**: Never invent a new folder structure. Strictly follow `docs/00-standards/folder-structure.md`.
3. **No Hardcoded Strings**: No hardcoded user-facing strings anywhere in UI. Always use i18n keys and maintain parity across `en.ts`, `hi.ts`, and `gu.ts` (see `docs/00-standards/i18n.md`).
4. **No Hardcoded Theme Tokens**: No hardcoded hex colors, arbitrary spacing, or font sizes in mobile or web. Always use Theme B (Teal Ledger) tokens (see `docs/00-standards/theme.md`).
5. **Strict Minor Units (Paisa)**: Never store or calculate money in floating-point rupees. All monetary values are integer minor units (paisa).
6. **Strict Multi-Tenancy**: Every MongoDB schema and query must enforce `{ businessId }` isolation.
7. **Single Source API Contract**: Backend, web, and mobile must follow the same API contract in `docs/modules/<module>/03-architecture/api-contract.md`.
8. **Scope Containment**: Do not change files outside the module's scope without noting it in `execution-log.md`.
9. **Lessons Learned**: When a mistake is discovered that could repeat, append a rule to `docs/00-standards/lessons-learned.md`.
10. **Git Safety**: NEVER execute `git commit` or `git push` without the user's explicit permission.
11. **Vulnerability Identification (High Priority / P0)**: Any security vulnerability, cross-tenant leak, injection flaw, unvalidated input, or dependency CVE discovered MUST be flagged with **CRITICAL / HIGH PRIORITY (P0)**, reported immediately to the user with severity and impact, and remediated before continuing feature development.
12. **Zero-Assumption Gap Analysis (Mandatory Code Verification)**: Never speculate, guess, or assume a gap exists. Before claiming ANY feature is missing or flawed, the agent MUST search and inspect the actual code across Backend, Web, and Mobile, cite exact file paths and line numbers, and verify whether the capability or part of it is already implemented.


