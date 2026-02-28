# Multi-Tenant Data Isolation Testing Guide

## Prerequisites

Before testing, ensure:
1. PostgreSQL is running on localhost:5432
2. Database `finance_tracker` exists
3. Migrations have been run
4. Seed data has been loaded

## Setup Steps

### 1. Database Setup

```bash
# Run migrations
cd backend
npm run migrate

# Seed shared data (categories, payment modes, etc.)
npm run seed

# Create admin user
npm run seed:admin
```

### 2. Create Test Users

You'll need to create at least 2 regular users to test data isolation. You can do this by:

**Option A: Register via the application**
- Start the application (see below)
- Use the registration form to create users

**Option B: Use the admin panel**
- Login as admin
- Navigate to User Management
- Create new users

## Test Credentials

### Admin Account
- **Email**: admin@financetracker.com
- **Password**: Admin@123456
- **Role**: admin
- **Capabilities**: 
  - View all users
  - Manage users (create, update, delete)
  - View system-wide statistics
  - Access audit logs
  - Cannot see user transaction data

### Regular Users (Create These)
You need to create at least 2 regular users to test data isolation:

**User 1 Example**:
- **Email**: user1@test.com
- **Password**: User@123456
- **Role**: user

**User 2 Example**:
- **Email**: user2@test.com
- **Password**: User@123456
- **Role**: user

## Starting the Application

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000

## Testing Scenarios

### Test 1: Admin Login and User Management
1. Login as admin (admin@financetracker.com / Admin@123456)
2. Navigate to User Management page
3. Verify you can see:
   - List of all users
   - User statistics (total users, active users)
   - Create new user button
4. Create 2 test users (user1@test.com and user2@test.com)
5. Verify admin cannot see any user's transaction data

### Test 2: User 1 - Create Financial Data
1. Logout from admin
2. Login as User 1 (user1@test.com / User@123456)
3. Create some accounts:
   - Checking Account
   - Savings Account
4. Create some transactions:
   - Income: Salary - $5000
   - Expense: Groceries - $200
   - Expense: Rent - $1500
5. View dashboard and verify:
   - Total balance
   - Income/Expense summary
   - Recent transactions

### Test 3: User 2 - Create Different Financial Data
1. Logout from User 1
2. Login as User 2 (user2@test.com / User@123456)
3. Create different accounts:
   - Credit Card
   - Investment Account
4. Create different transactions:
   - Income: Freelance - $3000
   - Expense: Utilities - $150
   - Expense: Entertainment - $100
5. View dashboard and verify:
   - Different balance from User 1
   - Different transactions
   - No overlap with User 1's data

### Test 4: Data Isolation Verification
1. Login as User 1
2. Navigate to:
   - Accounts page - should only see User 1's accounts
   - Transactions page - should only see User 1's transactions
   - Dashboard - should only show User 1's statistics
3. Logout and login as User 2
4. Navigate to same pages:
   - Should only see User 2's data
   - No User 1 data should be visible
5. Verify in browser DevTools Network tab:
   - API responses only contain data for logged-in user
   - No data leakage in API responses

### Test 5: Admin Cannot See User Data
1. Login as admin
2. Navigate to:
   - Dashboard (if accessible) - should show system stats, not user data
   - User Management - should show user list, not their transactions
3. Verify admin has no access to:
   - User transactions
   - User accounts
   - User financial data

### Test 6: API Security Testing
Use browser DevTools or Postman to test:

1. **Test unauthorized access**:
   - Try accessing `/api/transactions` without token
   - Should return 401 Unauthorized

2. **Test cross-user access**:
   - Login as User 1, copy the JWT token
   - Try to access User 2's data by manipulating API calls
   - Should be blocked by middleware

3. **Test admin boundaries**:
   - Login as admin, copy the JWT token
   - Try to access `/api/transactions`
   - Should be blocked (admin cannot see user data)

### Test 7: Shared Data Access
Verify that shared data is accessible to all users:

1. Login as User 1
2. Create a transaction and verify:
   - Categories dropdown shows all categories
   - Payment modes dropdown shows all payment modes
   - Transaction types are available

3. Login as User 2
4. Verify same shared data is available:
   - Same categories
   - Same payment modes
   - Same transaction types

### Test 8: Audit Logging (Admin)
1. Login as admin
2. Navigate to Audit Logs page
3. Verify logs show:
   - User login events
   - User creation events
   - Failed login attempts
   - All events have user_id and timestamps

## Expected Results

### ✅ Data Isolation
- Each user sees only their own data
- No cross-user data leakage
- API responses filtered by user_id

### ✅ Admin Capabilities
- Can manage users
- Can view system statistics
- Cannot see user financial data
- Can access audit logs

### ✅ Shared Data
- Categories accessible to all users
- Payment modes accessible to all users
- Transaction types accessible to all users

### ✅ Security
- JWT authentication required
- Middleware enforces user_id filtering
- Admin role properly restricted
- Audit logging captures all events

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
# Windows:
services.msc
# Look for PostgreSQL service

# Test connection
psql -U postgres -d finance_tracker
```

### Backend Not Starting
```bash
# Check .env file exists
cd backend
type .env

# Install dependencies
npm install

# Check for port conflicts
netstat -ano | findstr :5000
```

### Frontend Not Starting
```bash
# Install dependencies
cd frontend
npm install

# Check for port conflicts
netstat -ano | findstr :3000
```

### No Admin User
```bash
# Create admin user
cd backend
npm run seed:admin
```

## Security Notes

⚠️ **IMPORTANT**: These are test credentials for development only!

- Change admin password immediately in production
- Use strong passwords for all accounts
- Never commit credentials to version control
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement rate limiting
- Add additional security headers

## Next Steps After Testing

Once manual testing is complete:
1. Run automated E2E tests: `cd frontend && npm run test:e2e`
2. Run integration tests: `cd backend && npm test`
3. Review security audit: `cd backend && npm run security:audit`
4. Check performance metrics
5. Review audit logs for any anomalies
