# Phase 5: Code Review & Auto-Fix Log — {{MODULE_NAME}}

> Standard checklist: Lint, Types, Tests, Security & Vulnerabilities (High Priority / P0), Folder structure, Minor units (paisa), i18n 3-locale parity, Theme tokens (0 hardcoded hex), Error handling. Maximum 3 rounds.

---

## Round 1 Review
- **Date**: `YYYY-MM-DD`
- **Checker**: Reviewer Agent

### Critical / High-Priority Security & Vulnerability Audit:
- [ ] Multi-tenant isolation verified: No queries missing `{ businessId }`
- [ ] NoSQL / Parameter Injection check: Payloads sanitized via Zod/DTOs
- [ ] Authentication & Route Guards: All endpoints guarded
- [ ] Zero secrets in code, logs, or commits
- **Security Findings (High Priority)**: None / [Detail vulnerabilities]

### Issues Found:
1. **[Backend]**: 
2. **[Web]**: 
3. **[Mobile]**: 

### Auto-Fixes Applied:
- [x] Fix 1: 
- [x] Fix 2: 

### Build Status Post-Fix:
- Backend: Pass / Fail
- Web: Pass / Fail
- Mobile: Pass / Fail

---

## Round 2 Review (If Needed)
- **Date**: 
- **Issues Found**: 
- **Auto-Fixes Applied**: 

---

## Round 3 Review (Final)
- **Date**: 
- **Final Result**: PASS / FAIL

---

## Lessons Learned Additions
> If any repeating mistake was uncovered during review, document the new rule added to `docs/00-standards/lessons-learned.md`.

- **New Rule**: 
