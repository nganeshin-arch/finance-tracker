# Database Migrations

This directory contains database migration files for the Personal Finance Tracker application.

## Prerequisites

1. PostgreSQL must be installed and running
2. Database must be created (see `database/setup.sql`)
3. Environment variables must be configured in `backend/.env`

## Running Migrations

To run all pending migrations:

```bash
cd backend
npm run migrate
```

This will:
- Create a `migrations` table to track executed migrations
- Run all migrations that haven't been executed yet
- Skip migrations that have already been run

## Seeding Data

To populate the database with initial configuration data:

```bash
cd backend
npm run seed
```

This will insert:
- Transaction types (Income, Expense)
- Common categories for both income and expense
- Sub-categories for each category
- Payment modes (Cash, Credit Card, Debit Card, UPI, Bank Transfer, etc.)
- Sample accounts

## Migration Files

Migrations are executed in numerical order:

1. `001_create_tracking_cycles.ts` - Creates tracking_cycles table
2. `002_create_transaction_types.ts` - Creates transaction_types table
3. `003_create_categories.ts` - Creates categories table
4. `004_create_sub_categories.ts` - Creates sub_categories table
5. `005_create_payment_modes.ts` - Creates payment_modes table
6. `006_create_accounts.ts` - Creates accounts table
7. `007_create_transactions.ts` - Creates transactions table
8. `008_create_indexes.ts` - Creates performance indexes

## Migration Structure

Each migration file exports two functions:
- `up(pool)` - Applies the migration
- `down(pool)` - Reverts the migration (for future rollback support)

## Notes

- Migrations are idempotent - running them multiple times is safe
- The seed script uses `ON CONFLICT DO NOTHING` to prevent duplicate data
- Always run migrations before seeding data
