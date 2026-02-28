# Income Categories Update

## Current Income Categories in Database

The following income categories are now available in the system:

1. **Asset Sale** (ID: 20)
2. **Business/Profession** (ID: 2)
3. **Financial Transfers** (ID: 19)
4. **Investments** (ID: 3)
5. **Other Income** (ID: 5)
6. **Pension & Benefits** (ID: 22)
7. **Rental** (ID: 21)
8. **Salary** (ID: 1)
9. **Salary_BetterHalf** (ID: 18)

**Total: 10 Income Categories**

## Categories Added

The seed file has been updated to include:
- ✅ Salary
- ✅ Salary_BetterHalf (for spouse/partner income)
- ✅ Business/Profession
- ✅ Investments
- ✅ Rental
- ✅ Pension & Benefits
- ✅ Financial Transfers
- ✅ Other Income
- ✅ Asset Sale (from previous seed)

## How to Use

### For Regular Users:
1. Login to the application at http://localhost:3000
2. Navigate to "Add Transaction"
3. Select "Income" as transaction type
4. Choose from the available income categories in the dropdown

### For Admins:
Admins can add more income categories through:
- POST `/api/config/categories`
- Body: `{ "name": "Category Name", "transaction_type_id": 1 }`

## Database Changes

The seed file (`backend/src/migrations/seed.ts`) has been updated to include all required income categories. The categories use the `ON CONFLICT DO NOTHING` clause, so running the seed script multiple times is safe and won't create duplicates.

## Verification

To verify the categories in your database, run:
```bash
cd backend
npm exec ts-node src/scripts/listCategories.ts
```

Or use the provided batch file:
```bash
list-categories.bat
```

## Notes

- All income categories are **shared data** - available to all users
- Only admins can create/modify/delete categories
- Regular users can read and use categories in their transactions
- Categories are cached for 10 minutes for better performance
