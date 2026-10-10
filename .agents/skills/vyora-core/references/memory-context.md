# Vyora Memory & Historical Context

This document captures historical decisions, critical debugging resolutions, and developer context so that any AI working on Vyora immediately understands the project evolution.

---

## 1. Project Decisions & History

### Separation of Concerns (Frontend & Backend Decoupling)
- **Decision**: Backend and frontend were split into two completely independent projects (`vyora-backend` and `vyora-frontend`) directly in `C:\Users\sande\vyora\`.
- **Reason**: Allows independent deployment, clear developer boundaries, and seamless addition of `vyora-mobile` (React Native) consuming the backend API.

### Theme B — Teal Ledger Selection
- **Decision**: The user selected Theme B — Teal Ledger.
- **Tokens**: Deep teal (`#0F766E`), Dark slate (`#123B3A`), Light mint tint (`#E6F4F2`), Page background (`#F4F8F7`), Border (`#D7E5E2`), Muted text (`#566B69`).
- **Constraint**: All new views and components must strictly respect Theme B tokens.

### Resolution of 500 Internal Server Error
- **Root Cause**: During initial development, the frontend `AuthContext` called `GET /business/current` and accessed `b.id` instead of `b._id || b.id`. In MongoDB, documents have `_id`. This caused `undefined` business ID to be sent in headers (`x-business-id: undefined`), causing 500 errors in backend tenant guards.
- **Fix**: Added normalization in `AuthContext` to handle `b.id || b._id`, added tenant fallback, and standardized JSON serializers.

### Database Credentials & Atlas Cloud Cluster
- **Cluster**: `cluster0.ei4by7h.mongodb.net`
- **Active Auth Key**: `X1wUdhfTJjy35nsX` (Configured in `.env`)
- **Username**: `sandeep26062004_db_user`
- **Database**: `vyora`
- **Seeder**: Automatic seeder initializes demo account `demo@vyora.com` / `password123`.

### Mobile UX & Responsiveness
- **Thumb Navigation**: Fixed bottom navigation bar for phones.
- **Horizontal Swipe Protection**: All data tables wrapped with `overflow-x-auto min-w-[500px..750px] whitespace-nowrap` to prevent column squashing.
- **Filter Bar**: Mobile collapsible drawer filter toggles with reset pills.

### Mandatory Fallback UIs
- Every view and widget must have empty state handling with informative icons and action buttons.
