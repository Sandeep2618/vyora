---
name: vyora-ship
description: >-
  Pre-flight release gatekeeper for Vyora.
  Triggered by '/ship', '/verify-all', or when the user asks if the app is ready to deploy or merge.
  Executes secrets checks, UI audits, 100% automated QA suite, backend & frontend TypeScript compilation builds,
  and outputs a certified release readiness verdict.
---

# Vyora Release Readiness Gatekeeper (`/ship` or `/verify-all`)

Automates complete pre-flight release checks across security, design integrity, API contracts, and compilation.

## Command Syntax
```bash
/ship
# or
/verify-all
# or in terminal:
pnpm ship:check
```

## Gatekeeper Verifications
1. **Zero-Secrets & Credentials Audit**: Confirms no MongoDB URIs or credentials in code (`node scripts/check-secrets.js`).
2. **UI & Modal Invariant Audit**: Validates Theme B, modal footer props, clean slate zero-data tables (`node scripts/audit-ui.js`).
3. **Multi-Module Functional QA Suite**: 101+ automated assertions across CRUD, HTTP DELETE verbs, RBAC (`node scripts/qa-runner.js --module all`).
4. **Backend TypeScript Build**: NestJS compilation check (`pnpm --dir vyora-backend build`).
5. **Frontend Vite/React Build**: Production bundle check (`pnpm --dir vyora-frontend build`).

## Sign-Off Artifact
Certified release verdict generated at:
`docs/qa-reports/RELEASE_READINESS.md`

> [!NOTE]
> Git push is never executed automatically. Review the green release verdict and push manually.
