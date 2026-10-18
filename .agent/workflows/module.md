# `/module` Autonomous Feature Development Workflow

Triggered when the user runs:
```
/module <module-name>: <idea description>
```

---

## Agent Roles
| Agent | Role & Responsibility | Output Document |
| :--- | :--- | :--- |
| **Researcher** | Researches idea, competitors, flows, risks. Appends chat follow-ups. | `01-research/research.md` |
| **Planner** | Turns approved research into scoped tasks for BE, FE, Mobile. | `02-plan/plan.md` |
| **Architect** | Designs data schema, API contract, state, Theme B & i18n impact. | `03-architecture/architecture.md`, `api-contract.md` |
| **Builders (BE, FE, Mobile)** | Implement in parallel, following API contract strictly. | Code, `04-execution/execution-log.md`, `tasks.md` |
| **Reviewer** | Audits code standards, types, tests, i18n, theme tokens; auto-fixes issues. | `05-review/code-review.md` |
| **Gap Analyst** | End-user perspective audit: lists missing states, validation, UX gaps. | `06-gaps/gaps.md` |

---

## Workflow Progression & Approval Gates

```
Your idea ──► Phase 1: Research ◄──► (Follow-up Loop) ──► [GATE 1: User approves research]
                      │
                      ▼
              Phase 2: Plan ◄──► (User edits) ──────────► [GATE 2: User approves plan]
                      │
                      ▼
              Phase 3: Architecture & API Contract
                      │
                      ▼
              Phase 4: Parallel Build (Backend ‖ Web ‖ Mobile)
                      │
                      ▼
              Phase 5: Review & Auto-fix Loop (Max 3 rounds)
                      │
                      ▼
              Phase 6: End-User Gap Analysis ──────────► User decides which gaps to build
```

---

## Detailed Step-by-Step Execution

### Phase 0: Setup
1. Scaffolding: Create directory `docs/modules/<module-name>/` copied from `docs/modules/_template/`.
2. Read all files in `docs/00-standards/` and inspect existing codebase structure.
3. Initialize `status.md` with active Phase 0.

### Phase 1: Research (STOP for User Approval — GATE 1)
1. Research the idea: problem statement, persona, user flows, Indian market competitors (Khatabook, myBillBook, Vyapar, Zoho Books), edge cases, security, performance.
2. Check existing codebase for reuse opportunities.
3. Write `01-research/research.md` (Summary, User flows, Findings, Reuse opportunities, Risks, Open questions, `## Follow-up Log`).
4. **STOP EXECUTION**. Present findings to the user.
5. In the follow-up chat, append each user question and clarification to `## Follow-up Log` with timestamp.
6. **Proceed to Phase 2 ONLY when user says "research approved"**.

### Phase 2: Plan (STOP for User Approval — GATE 2)
1. Write `02-plan/plan.md`: Scope, out-of-scope, platform tasks (BE, FE, Mobile), dependencies, acceptance criteria, i18n keys required, theme impact, test plan.
2. **STOP EXECUTION**. Present plan to user.
3. Apply user's requested edits to `02-plan/plan.md`.
4. **Proceed to Phase 3 ONLY when user says "plan approved"**.

### Phase 3: Architecture & API Contract
1. Write `03-architecture/architecture.md`: Data model with indexed `businessId`, file locations per `docs/00-standards/folder-structure.md`, state management, error handling.
2. Write `03-architecture/api-contract.md`: Endpoints, request/response JSON schemas adhering to standard response envelope, error codes.
3. Update `status.md`.

### Phase 4: Parallel Execution
Execute implementation across Backend, Web, and Mobile strictly conforming to `api-contract.md`:
- **Backend Builder** (`vyora-backend`): Schema, DTOs, Service with tenant isolation, Controller, routes, tests.
- **Web Builder** (`vyora-frontend`): Typed API service, custom hook, lightweight page (<400 lines), modals, i18n keys, debounced search, responsive table.
- **Mobile Builder** (`vyora-app`): API wrapper, screen hook, lightweight screen (<400 lines), standalone modals, dynamic `useTheme()` tokens, i18n keys.
- Record all touched files in `04-execution/execution-log.md`.
- Mark completed tasks in `04-execution/tasks.md`.

### Phase 5: Review & Auto-Fix (Max 3 Rounds)
1. **Critical Security & Vulnerability Scan (P0 / High Priority)**:
   - Verify 100% multi-tenant query coverage (`{ businessId }`).
   - Check against NoSQL injection, unescaped user inputs, and missing authentication guards.
   - Run dependency & secrets check (`node scripts/check-secrets.js`).
   - **MANDATORY**: Any discovered vulnerability must be flagged with **HIGH / CRITICAL PRIORITY (P0)**, reported immediately to the user, and resolved as the top priority.
2. Run automated compilation & build checks:
   - Backend: `npm run build` / tests
   - Web: `npm run build` (`tsc -b && vite build`)
   - Mobile: `npx expo export --platform web` (or `npx tsc --noEmit`)
3. Review against `docs/00-standards/coding-standards.md`:
   - Paisa minor units in financial fields
   - Zero hardcoded colors / Theme B tokens
   - Zero hardcoded strings / 3-locale i18n parity (`en.ts`, `hi.ts`, `gu.ts`)
   - Screen length <400 lines
   - Multi-tenant `{ businessId }` queries
4. Auto-fix any issues found, re-run builds, and document each round in `05-review/code-review.md`.
5. If a novel issue or security vulnerability is uncovered, append a rule to `docs/00-standards/lessons-learned.md`.
6. Max 3 rounds. If unresolved after 3 rounds, halt and report blockers.

### Phase 6: End-User Gap Analysis
1. **Mandatory Pre-Audit Codebase Inspection**:
   - Before listing ANY gap, search and inspect the actual codebase across Backend, Web, and Mobile.
   - Verify whether the capability, route, screen, or model already exists.
   - Never speculate or assume missing functionality without citing inspected code.
2. Act as a real merchant/cashier using the feature in a busy store.
3. Walk every screen and edge case:
   - Missing states (loading, empty, error, offline, success toast)
   - Validation & permission gaps
   - Gujarati / Hindi text wrapping or truncation
   - Dark/Light mode contrast
   - Mobile vs Web feature parity
4. Write `06-gaps/gaps.md` with: ID, Title, Area, Severity (High/Med/Low), Effort, Impact, Code Verification Evidence (files checked), Suggested Fix.
5. **DO NOT implement gaps automatically**. Present the gap report to the user to choose which ones to build.
6. Update `status.md` and provide a clean completion summary with markdown links to all module documents.
