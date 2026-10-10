# Vyora Frontend (`vyora-frontend`)

Vyora Version 1 — Standalone Web Application built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS 4** featuring the approved **Theme B — Teal Ledger** design system.

---

## 🎨 Theme B — Teal Ledger Palette
* Primary: `#0F766E`
* Deep Navigation: `#123B3A`
* Background: `#F4F8F7`
* Surface: `#FFFFFF`
* Success: `#15803D`
* Warning: `#A16207`
* Danger: `#B91C1C`
* Borders: `#D7E5E2`
* Muted Text: `#566B69`

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
# or: npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```env
VITE_API_URL=/api/v1
```
*(By default, Vite proxies `/api` requests to `http://localhost:4000`)*.

### 3. Run Dev Server
```bash
pnpm dev
# or: npm run dev
```

Open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Login with Demo Credentials
The sign-in page is prefilled for 1-click evaluation:
* **Email**: `demo@vyora.com`
* **Password**: `password123`

---

## 🧪 Testing & Verification
```bash
# Run unit tests
pnpm test

# Type check
pnpm typecheck

# Production build
pnpm build
```
