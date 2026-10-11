---
name: vyora-db-seed
description: >-
  Seeds isolated test business tenants with realistic sample data (products, customers, suppliers, invoices, payments).
  Triggered by '/db-seed' or '/db-seed <preset>' (presets: fresh, retail, wholesale).
  Provides ready-to-test credentials for instant browser verification without manual data entry.
---

# Vyora Test Data Seeder (`/db-seed`)

Populates isolated test environments with rich synthetic data for functional, visual, and performance testing.

## Command Syntax
```bash
/db-seed [preset]
# Examples:
/db-seed retail      # Seeds 4 retail products with GST rates, 3 customers, addresses
/db-seed wholesale   # Seeds bulk products, B2B GSTIN suppliers, purchase records
/db-seed fresh       # Creates clean 0-record tenant to test onboarding & empty states

# Or in terminal:
node scripts/seed-data.js --preset retail
```

## Generated Artifacts
Credentials and tenant tokens are saved to:
`docs/qa-reports/SEEDED_TENANT_<PRESET>.json`

Includes login email, password, and stats for immediate testing on `http://localhost:3000/login`.
