# 🌱 Seed Database - Quick Fix

## Problem
"No items found" in Transaction Types, Categories, Sub-Categories

## Solution

### Option 1: Batch Script
```cmd
seed-database.bat
```

### Option 2: Manual (Command Prompt)
```cmd
cd backend
npm run seed
```

**Important:** Use Command Prompt (cmd), NOT PowerShell!

---

## What Gets Added

- ✅ 3 Transaction Types (Income, Expense, Transfer)
- ✅ 35+ Categories (Salary, Groceries, Entertainment, etc.)
- ✅ 50+ Sub-Categories
- ✅ 7 Payment Modes (Cash, UPI, Credit Card, etc.)
- ✅ 5 Sample Accounts

---

## After Seeding

1. Refresh admin page (F5)
2. See all categories! ✅
3. Start adding transactions! ✅

---

## Troubleshooting

**Database not running?**
```cmd
start-postgres.bat
```

**Migrations not run?**
```cmd
cd backend
npm run migrate
npm run seed
```

---

**Detailed guide:** See `SEED_DATABASE_NOW.md`
