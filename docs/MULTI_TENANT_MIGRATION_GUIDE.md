# Multi-Tenant Data Isolation Migration Guide

This guide provides step-by-step instructions for migrating the Personal Finance Tracker application to support multi-tenant data isolation.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Pre-Migration Checklist](#pre-migration-checklist)
- [Migration Steps](#migration-steps)
- [Data Verification](#data-verification)
- [Rollback Procedure](#rollback-procedure)
- [Post-Migration Testing](#post-migration-testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

The multi-tenant data isolation feature ensures that each user can only access their own financial data while sharing common configuration (categories, types, payment modes, accounts) managed by administrators.

### What Changes

- **Database Schema**: Adds `user_id` column to `transactions` table
- **API Behavior**: All transaction and dashboard queries automatically filter by authenticated user
- **Security**: Ownership checks on all update/delete operations
- **Admin Features**: New user management endpoints for administrators

### Migration Impact

- **Downtime**: Approximately 5-15 minutes depending on data volume
- **Data Changes**: All existing transactions will be assigned to the admin user
- **Breaking Changes**: None - API endpoints remain the same, but now require authentication

---

## Prerequisites

Before starting the migration, ensure you have:

1. **Database Backup**: Complete backup of the PostgreSQL database
2. **Admin User**: At least one user with `role = 'admin'` in the users table
3. **Application Downtime**: Scheduled maintenance window
4. **Node.js Environment**: Node.js 18+ and npm installed
5. **Database Access**: PostgreSQL connection with migration privileges

---

## Pre-Migration Checklist

### 1. Create Database Backup

```bash
# Windows (using pg_dump)
pg_dump -U postgres -d finance_tracker > backup_before_migration.sql

# Or using the provided script
.\backup-database.bat
```

### 2. Verify Admin User Exists

```sql
-- Connect to database
psql -U postgres -d finance_tracker

-- Check for admin user
SELECT id, email, role FROM users WHERE role = 'admin';
```

**Important**: If no admin user exists, create one:

```sql
-- Create admin user (password will be hashed)
INSERT INTO users (email, password_hash, role, created_at, updated_at)
VALUES (
  'admin@example.com',
  '$2b$10$...',  -- Use bcrypt to hash password
  'admin',
  NOW(),
  NOW()
);
```

### 3. Record Current Transaction Count

```sql
-- Record total transactions before migration
SELECT COUNT(*) as total_transactions FROM transactions;
```

### 4. Stop Application Services

```bash
# Stop backend server
# Press Ctrl+C in the terminal running the backend

# Or if running as a service
pm2 stop finance-tracker-backend
```

---

## Migration Steps

### Step 1: Run Database Migration

The migration adds the `user_id` column, creates indexes, and assigns existing transactions to the admin user.

```bash
# Navigate to backend directory
cd backend

# Run migration script
npm run migrate:user-id

# Or manually run the migration
node dist/migrations/010_add_user_id_to_transactions.js
```

**Migration SQL** (for reference):

```sql
-- Add user_id column (nullable initially)
ALTER TABLE transactions 
ADD COLUMN user_id INTEGER;

-- Assign existing transactions to admin user
UPDATE transactions 
SET user_id = (SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL
ALTER TABLE transactions 
ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_type_date ON transactions(user_id, transaction_type_id, date);
```

### Step 2: Verify Migration Success

```bash
# Run verification script
npm run verify:migration

# Or manually verify
node dist/scripts/verifyMigration.js
```

The verification script checks:
- ✓ `user_id` column exists
- ✓ All transactions have valid `user_id`
- ✓ Foreign key constraint is active
- ✓ Indexes are created

### Step 3: Deploy Updated Application Code

```bash
# Pull latest code
git pull origin main

# Install dependencies (if any new ones)
npm install

# Build application
npm run build

# Start backend server
npm start

# Or with PM2
pm2 restart finance-tracker-backend
```

### Step 4: Verify Application Startup

Check logs for successful startup:

```bash
# Check logs
pm2 logs finance-tracker-backend

# Or if running directly
# Look for: "Server running on port 5000"
```

---

## Data Verification

### Verify Transaction Assignment

```sql
-- Check transaction distribution by user
SELECT 
  u.id,
  u.email,
  u.role,
  COUNT(t.id) as transaction_count
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.email, u.role
ORDER BY u.id;
```

### Verify Foreign Key Constraints

```sql
-- Verify foreign key exists
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'transactions'
  AND kcu.column_name = 'user_id';
```

### Verify Indexes

```sql
-- Check indexes on transactions table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'transactions'
  AND indexname LIKE '%user%';
```

Expected indexes:
- `idx_transactions_user_id`
- `idx_transactions_user_date`
- `idx_transactions_user_type_date`

### Test API Endpoints

```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'

# Save the token from response
TOKEN="<your-jwt-token>"

# Test transaction listing (should return admin's transactions)
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN"

# Test dashboard (should return admin's data)
curl -X GET http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"
```

---

## Rollback Procedure

If issues occur during migration, follow these steps to rollback:

### Step 1: Stop Application

```bash
# Stop backend server
pm2 stop finance-tracker-backend
```

### Step 2: Restore Database Backup

```bash
# Drop current database
psql -U postgres -c "DROP DATABASE finance_tracker;"

# Recreate database
psql -U postgres -c "CREATE DATABASE finance_tracker;"

# Restore from backup
psql -U postgres -d finance_tracker < backup_before_migration.sql
```

### Step 3: Revert Application Code

```bash
# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild
npm run build

# Restart
pm2 restart finance-tracker-backend
```

### Alternative: Manual Rollback (Without Full Restore)

If you only need to remove the migration changes:

```sql
-- Remove indexes
DROP INDEX IF EXISTS idx_transactions_user_type_date;
DROP INDEX IF EXISTS idx_transactions_user_date;
DROP INDEX IF EXISTS idx_transactions_user_id;

-- Remove foreign key constraint
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS fk_transactions_user_id;

-- Remove user_id column
ALTER TABLE transactions 
DROP COLUMN IF EXISTS user_id;
```

---

## Post-Migration Testing

### Test User Isolation

1. **Create Test Users**:

```bash
# Register User A
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"usera@test.com","password":"password123"}'

# Register User B
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"userb@test.com","password":"password123"}'
```

2. **Create Transactions for Each User**:

```bash
# Login as User A
TOKEN_A=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usera@test.com","password":"password123"}' \
  | jq -r '.token')

# Create transaction for User A
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-02-28",
    "transactionTypeId": 2,
    "categoryId": 1,
    "accountId": 1,
    "paymentModeId": 1,
    "amount": 100.00,
    "description": "User A transaction"
  }'

# Repeat for User B with TOKEN_B
```

3. **Verify Isolation**:

```bash
# User A should only see their transaction
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN_A"

# User B should only see their transaction
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN_B"
```

### Test Admin Features

```bash
# Login as admin
TOKEN_ADMIN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin-password"}' \
  | jq -r '.token')

# List all users (admin only)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Get user statistics (admin only)
curl -X GET http://localhost:5000/api/users/2/stats \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

### Test Ownership Checks

```bash
# Try to access User B's transaction with User A's token (should fail)
TRANSACTION_B_ID=<user-b-transaction-id>

curl -X GET http://localhost:5000/api/transactions/$TRANSACTION_B_ID \
  -H "Authorization: Bearer $TOKEN_A"

# Expected: 404 Not Found
```

---

## Troubleshooting

### Issue: Migration Fails - No Admin User

**Error**: `Cannot assign transactions: No admin user found`

**Solution**:
```sql
-- Create admin user first
INSERT INTO users (email, password_hash, role, created_at, updated_at)
VALUES ('admin@example.com', '$2b$10$...', 'admin', NOW(), NOW());

-- Then re-run migration
```

### Issue: Foreign Key Constraint Violation

**Error**: `Foreign key constraint violation on user_id`

**Solution**:
```sql
-- Find transactions with invalid user_id
SELECT id, user_id FROM transactions 
WHERE user_id NOT IN (SELECT id FROM users);

-- Assign to admin user
UPDATE transactions 
SET user_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
WHERE user_id NOT IN (SELECT id FROM users);
```

### Issue: Slow Query Performance

**Error**: Queries taking longer than expected

**Solution**:
```sql
-- Verify indexes are being used
EXPLAIN ANALYZE 
SELECT * FROM transactions WHERE user_id = 1;

-- Should show "Index Scan using idx_transactions_user_id"

-- If not, rebuild indexes
REINDEX TABLE transactions;
```

### Issue: Users Can See Other Users' Data

**Error**: Data isolation not working

**Solution**:
1. Check middleware is applied:
```typescript
// In backend/src/index.ts
app.use('/api/transactions', authMiddleware, userContextMiddleware, transactionRoutes);
app.use('/api/dashboard', authMiddleware, userContextMiddleware, dashboardRoutes);
```

2. Verify JWT token contains user_id:
```bash
# Decode JWT token
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq
# Should contain: {"id": 1, "email": "...", "role": "..."}
```

3. Check repository queries include user_id filter

### Issue: 401 Unauthorized on All Requests

**Error**: All API requests return 401

**Solution**:
1. Verify JWT_SECRET is set in environment:
```bash
# Check .env file
cat backend/.env | grep JWT_SECRET
```

2. Verify token is being sent correctly:
```bash
# Check Authorization header
curl -v -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN"
```

3. Check token expiration:
```typescript
// Tokens expire after 24 hours by default
// Re-login to get new token
```

---

## Performance Monitoring

### Monitor Query Performance

```sql
-- Enable query logging (PostgreSQL)
ALTER DATABASE finance_tracker SET log_min_duration_statement = 100;

-- Check slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE query LIKE '%transactions%'
ORDER BY mean_time DESC
LIMIT 10;
```

### Monitor Index Usage

```sql
-- Check index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'transactions'
ORDER BY idx_scan DESC;
```

---

## Migration Checklist

Use this checklist to track migration progress:

- [ ] Create database backup
- [ ] Verify admin user exists
- [ ] Record current transaction count
- [ ] Stop application services
- [ ] Run database migration
- [ ] Verify migration success
- [ ] Deploy updated application code
- [ ] Verify application startup
- [ ] Test transaction assignment
- [ ] Test foreign key constraints
- [ ] Test indexes
- [ ] Test API endpoints with authentication
- [ ] Test user data isolation
- [ ] Test admin features
- [ ] Test ownership checks
- [ ] Monitor performance
- [ ] Update documentation
- [ ] Notify users of changes

---

## Support

If you encounter issues not covered in this guide:

1. Check application logs: `pm2 logs finance-tracker-backend`
2. Check database logs: `tail -f /var/log/postgresql/postgresql-*.log`
3. Review the requirements document: `.kiro/specs/multi-tenant-data-isolation/requirements.md`
4. Review the design document: `.kiro/specs/multi-tenant-data-isolation/design.md`

---

## Summary

This migration guide provides comprehensive instructions for:
- ✓ Pre-migration preparation and backups
- ✓ Step-by-step migration execution
- ✓ Data verification procedures
- ✓ Complete rollback procedures
- ✓ Post-migration testing
- ✓ Troubleshooting common issues

Following this guide ensures a safe and successful migration to multi-tenant data isolation.
