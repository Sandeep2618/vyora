# Phase 4: Execution Task Checklist — {{MODULE_NAME}}

## Parallel Builders Checklist

### Backend Builder (`vyora-backend`)
- [ ] B-01: Create schema & indexes in `src/modules/{{MODULE_NAME}}/schema/`
- [ ] B-02: Create DTOs & validation in `src/modules/{{MODULE_NAME}}/dto/`
- [ ] B-03: Create Service with tenant isolation in `src/modules/{{MODULE_NAME}}/service/`
- [ ] B-04: Create Controller with standard envelope in `src/modules/{{MODULE_NAME}}/controller/`
- [ ] B-05: Register module in `src/app.module.ts` (or main module registry)
- [ ] B-06: Verify `npm run build` passes with zero errors

### Web Frontend Builder (`vyora-frontend`)
- [ ] W-01: Add API client functions in `src/services/{{MODULE_NAME}}.service.ts`
- [ ] W-02: Add i18n keys to `en.ts`, `hi.ts`, `gu.ts`
- [ ] W-03: Create custom hook `use{{MODULE_NAME}}.ts`
- [ ] W-04: Create page shell (<400 lines) in `src/pages/{{MODULE_NAME}}/index.tsx`
- [ ] W-05: Create modal components with required field asterisks
- [ ] W-06: Verify `npm run build` (`tsc -b && vite build`) passes with zero errors

### Mobile Builder (`vyora-app`)
- [ ] M-01: Add API wrapper in `src/api/{{MODULE_NAME}}.ts`
- [ ] M-02: Add i18n keys to `src/i18n/` (`en.ts`, `hi.ts`, `gu.ts`)
- [ ] M-03: Create screen custom hook `src/hooks/use{{MODULE_NAME}}Screen.ts`
- [ ] M-04: Extract modal component to `src/components/{{MODULE_NAME}}Modal.tsx`
- [ ] M-05: Create lightweight screen coordinator (<400 lines) with dynamic `useTheme()` tokens
- [ ] M-06: Register route in Navigation
- [ ] M-07: Verify `npx expo export --platform web` passes with zero errors
