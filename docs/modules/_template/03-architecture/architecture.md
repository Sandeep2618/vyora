# Phase 3: Architecture Blueprint — {{MODULE_NAME}}

## 1. Data Model & Schema Design

### Mongoose Collection: `{{MODULE_NAME_PLURAL}}`
```typescript
{
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  // Domain fields...
  amountMinor: { type: Number, required: true }, // Minor units (paisa)
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Database Indexes
- `{ businessId: 1, createdAt: -1 }`

---

## 2. Layer Placement & File Locations
Per `docs/00-standards/folder-structure.md`:

| Platform | Role | Target File Path |
| :--- | :--- | :--- |
| **Backend** | Schema | `vyora-backend/src/modules/{{MODULE_NAME}}/schema/` |
| **Backend** | DTO | `vyora-backend/src/modules/{{MODULE_NAME}}/dto/` |
| **Backend** | Service | `vyora-backend/src/modules/{{MODULE_NAME}}/service/` |
| **Backend** | Controller | `vyora-backend/src/modules/{{MODULE_NAME}}/controller/` |
| **Web** | API Service | `vyora-frontend/src/services/{{MODULE_NAME}}.service.ts` |
| **Web** | Page Hook | `vyora-frontend/src/pages/{{MODULE_NAME}}/hooks/` |
| **Web** | Page Shell | `vyora-frontend/src/pages/{{MODULE_NAME}}/index.tsx` |
| **Mobile** | API Wrapper | `vyora-app/src/api/{{MODULE_NAME}}.ts` |
| **Mobile** | Screen Hook | `vyora-app/src/hooks/use{{MODULE_NAME}}Screen.ts` |
| **Mobile** | Screen Shell | `vyora-app/src/screens/{{MODULE_NAME}}Screen.tsx` |

---

## 3. State Management & Data Flow
- **Web**: React Query / custom hook with optimistic updates or automatic cache invalidation.
- **Mobile**: Custom hook with local state & offline-tolerant fetch patterns.

---

## 4. Error Handling & Security
- **Multi-Tenancy Guard**: Guarantees non-leakage via `req.user.businessId`.
- **Validation Pipe**: Reject invalid inputs with structured error envelope.
- **Rate Limiting**: Protected under `/api/v1/` rate limit rules.
