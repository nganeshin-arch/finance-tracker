# 🌱 Seed Database - Add Initial Data

## 🎯 Problem

You're seeing "No items found" for:
- Transaction Types
- Categories  
- Sub-Categories

This is because the database is empty and needs to be seeded with initial data.

---

## ✅ Quick Fix (One Command)

### Option 1: Using Batch Script
```cmd
seed-database.bat
```

### Option 2: Manual Command
Open a **Command Prompt** (not PowerShell) and run:

```cmd
cd backend
npm run seed
```

---

## 🔍 What Gets Added

The seed script will populate your database with:

### Transaction Types (3):
- Income
- Expense
- Transfer

### Income Categories (8):
- Salary
- Salary_BetterHalf
- Business/Profession
- Investments
- Rental
- Pension & Benefits
- Financial Transfers
- Other Income

### Expense Categories (22):
- Clothing
- Education
- Entertainment
- Family_Social
- Financial
- Food_Dining
- Groceries
- Healthcare
- Household
- Housing
- Insurance
- Investments
- Loan
- Miscellaneous
- ParentsExpenses
- PersonalCare
- PersonalDevelopment
- Savings
- Tax
- Transportation
- Travel
- Utilities

### Transfer Categories (5):
- Account Transfer
- Savings Transfer
- Investment Transfer
- Loan Payment
- Credit Card Payment

### Sub-Categories:
- Multiple sub-categories for each main category
- Examples: Groceries, Restaurants, Fuel, Public Transport, etc.

### Payment Modes (7):
- Cash
- Credit Card
- Debit Card
- UPI
- Bank Transfer
- Digital Wallet
- Check

### Sample Accounts (5):
- Primary Checking
- Savings Account
- Credit Card - Main
- Cash Wallet
- Investment Account

---

## 📋 Step-by-Step Instructions

### Step 1: Open Command Prompt

**Important:** Use Command Prompt, NOT PowerShell!

1. Press `Win + R`
2. Type `cmd`
3. Press Enter

### Step 2: Navigate to Backend

```cmd
cd "E:\Ganesan Nagarajan\00-Learning\Kiro\projects\PersonalFinanceMgmtApp\backend"
```

(Adjust the path to match your project location)

### Step 3: Run Seed Command

```cmd
npm run seed
```

### Step 4: Wait for Completion

You should see:
```
Starting database seeding...

▶️  Seeding transaction types...
✅ Transaction types seeded

▶️  Seeding income categories...
✅ Income categories seeded

▶️  Seeding expense categories...
✅ Expense categories seeded

▶️  Seeding transfer categories...
✅ Transfer categories seeded

▶️  Seeding sub-categories...
✅ Sub-categories seeded

▶️  Seeding payment modes...
✅ Payment modes seeded

▶️  Seeding sample accounts...
✅ Sample accounts seeded

All seed data inserted successfully!
```

### Step 5: Refresh Admin Page

1. Go back to your browser
2. Refresh the admin page (F5)
3. You should now see all the categories and transaction types! ✅

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"

**Cause:** PostgreSQL is not running

**Fix:**
```cmd
start-postgres.bat
```

Or manually start PostgreSQL service:
1. Press `Win + R`
2. Type `services.msc`
3. Find "PostgreSQL"
4. Right-click → Start

### Error: "relation does not exist"

**Cause:** Database migrations haven't been run

**Fix:**
```cmd
cd backend
npm run migrate
npm run seed
```

### Error: "PowerShell execution policy"

**Cause:** Using PowerShell instead of Command Prompt

**Fix:** Use Command Prompt (cmd) instead of PowerShell

### Error: "npm: command not found"

**Cause:** Node.js not installed or not in PATH

**Fix:**
1. Install Node.js from https://nodejs.org
2. Restart terminal
3. Try again

---

## ✅ Verification

After seeding, verify the data:

### Check in Admin Panel:
1. Go to http://localhost:5173
2. Login as admin
3. Go to Admin section
4. Check:
   - Transaction Types tab → Should show 3 types
   - Categories tab → Should show 35+ categories
   - Sub-Categories tab → Should show 50+ sub-categories

### Check in Database:
```cmd
cd backend
npm run verify
```

Or manually:
```sql
psql -U postgres -d finance_tracker

SELECT COUNT(*) FROM transaction_types;  -- Should be 3
SELECT COUNT(*) FROM categories;         -- Should be 35+
SELECT COUNT(*) FROM sub_categories;     -- Should be 50+
SELECT COUNT(*) FROM payment_modes;      -- Should be 7
SELECT COUNT(*) FROM accounts;           -- Should be 5
```

---

## 🔄 Re-seed Database

If you need to re-seed (won't duplicate data):

```cmd
cd backend
npm run seed
```

The seed script uses `ON CONFLICT DO NOTHING`, so it's safe to run multiple times.

---

## 💡 Pro Tips

### Seed Only Once
You only need to seed the database once after initial setup.

### Custom Data
After seeding, you can:
- Add more categories
- Add more sub-categories
- Modify existing ones
- Delete unused ones

### Backup Before Changes
Before making major changes:
```cmd
pg_dump -U postgres finance_tracker > backup.sql
```

---

## 🚀 Quick Commands Reference

```cmd
# Seed database
cd backend
npm run seed

# Run migrations first (if needed)
npm run migrate

# Verify data
npm run verify

# Start PostgreSQL
start-postgres.bat

# Restart app
restart-app.bat
```

---

## ✅ After Seeding

1. ✅ Refresh admin page
2. ✅ See all categories and types
3. ✅ Start adding transactions
4. ✅ Use the app normally!

---

**Ready to seed?** Run: `seed-database.bat` or manually run `npm run seed` in Command Prompt!
