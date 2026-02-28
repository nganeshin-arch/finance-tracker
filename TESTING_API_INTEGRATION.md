# Testing API Integration

This guide provides step-by-step instructions for testing the frontend-backend API integration.

## Prerequisites

1. PostgreSQL installed and running
2. Node.js and npm installed
3. Database created and migrated

## Setup Steps

### 1. Database Setup

```bash
# Create the database
psql -U postgres
CREATE DATABASE finance_tracker;
\q

# Run migrations
cd backend
npm run migrate

# Seed initial data
npm run seed
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Verify .env file exists with correct configuration
# Should contain:
# PORT=5000
# NODE_ENV=development
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=finance_tracker
# DB_USER=postgres
# DB_PASSWORD=your_password
# FRONTEND_URL=http://localhost:3000

# Start the backend server
npm run dev
```

The backend should start on `http://localhost:5000` and you should see:
```
Server is running on port 5000
Environment: development
CORS enabled for: http://localhost:3000
Database connected successfully
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Verify .env file exists with correct configuration
# Should contain:
# VITE_API_BASE_URL=http://localhost:5000/api

# Start the frontend development server
npm run dev
```

The frontend should start on `http://localhost:3000`

## Testing the Integration

### Method 1: Manual Testing via Browser

1. Open your browser and navigate to `http://localhost:3000`
2. Open the browser console (F12)
3. Run the API integration test:

```javascript
testApiIntegration()
```

This will test all API endpoints and display results in the console.

### Method 2: Test Individual Endpoints

You can test individual endpoints using the browser console:

```javascript
// Test configuration endpoints
const { configService } = await import('./services');

// Get transaction types
const types = await configService.getTransactionTypes();
console.log('Transaction Types:', types);

// Get categories
const categories = await configService.getCategories();
console.log('Categories:', categories);

// Get payment modes
const modes = await configService.getPaymentModes();
console.log('Payment Modes:', modes);

// Get accounts
const accounts = await configService.getAccounts();
console.log('Accounts:', accounts);
```

### Method 3: Test via UI

1. Navigate to the Dashboard page (`http://localhost:3000`)
   - Verify the dashboard loads without errors
   - Check that summary cards display data
   - Verify charts render correctly

2. Navigate to the Transactions page (`http://localhost:3000/transactions`)
   - Verify the transaction list loads
   - Try creating a new transaction
   - Try editing an existing transaction
   - Try deleting a transaction
   - Test the date range filter

3. Navigate to the Admin page (`http://localhost:3000/admin`)
   - Verify all configuration tabs load
   - Try adding a new category
   - Try adding a new payment mode
   - Try adding a new account
   - Test delete functionality

### Method 4: Test Backend Health Endpoint

```bash
# Using curl
curl http://localhost:5000/health

# Using PowerShell
Invoke-WebRequest -Uri http://localhost:5000/health | Select-Object -ExpandProperty Content
```

Expected response:
```json
{
  "status": "ok",
  "message": "Personal Finance Tracker API is running",
  "database": "connected"
}
```

## Verifying API Calls

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to the Network tab
3. Filter by "Fetch/XHR"
4. Perform actions in the UI
5. Verify API calls are made successfully (status 200)

### Common API Endpoints to Verify

**Configuration:**
- `GET /api/config/types` - Get transaction types
- `GET /api/config/categories` - Get categories
- `GET /api/config/subcategories` - Get sub-categories
- `GET /api/config/modes` - Get payment modes
- `GET /api/config/accounts` - Get accounts

**Tracking Cycles:**
- `GET /api/tracking-cycles` - Get all cycles
- `GET /api/tracking-cycles/active` - Get active cycle
- `POST /api/tracking-cycles` - Create new cycle

**Transactions:**
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

**Dashboard:**
- `GET /api/dashboard/summary` - Get financial summary
- `GET /api/dashboard/expenses-by-category` - Get expense breakdown
- `GET /api/dashboard/monthly-trend` - Get monthly trends

## Troubleshooting

### Backend Not Starting

**Error: "Cannot connect to database"**
- Verify PostgreSQL is running
- Check database credentials in `backend/.env`
- Ensure database exists: `psql -U postgres -l`

**Error: "Port 5000 already in use"**
- Change PORT in `backend/.env` to a different port
- Update `VITE_API_BASE_URL` in `frontend/.env` accordingly

### Frontend Not Connecting to Backend

**Error: "Network Error"**
- Verify backend is running on port 5000
- Check `VITE_API_BASE_URL` in `frontend/.env`
- Verify CORS is properly configured in backend

**Error: "CORS policy blocked"**
- Verify `FRONTEND_URL` in `backend/.env` matches frontend URL
- Restart backend server after changing CORS settings

### API Errors

**400 Bad Request**
- Check request payload format
- Verify all required fields are provided
- Check validation rules

**404 Not Found**
- Verify API endpoint URL is correct
- Check backend route registration
- Ensure backend server is running

**500 Internal Server Error**
- Check backend console for error details
- Verify database connection
- Check backend logs for stack trace

## Expected Test Results

When running `testApiIntegration()`, you should see:

```
🚀 Starting API Integration Tests...

Testing: GET /api/config/types...
  Found X transaction types
✅ GET /api/config/types - PASSED

Testing: GET /api/config/categories...
  Found X categories
✅ GET /api/config/categories - PASSED

Testing: GET /api/config/subcategories...
  Found X sub-categories
✅ GET /api/config/subcategories - PASSED

Testing: GET /api/config/modes...
  Found X payment modes
✅ GET /api/config/modes - PASSED

Testing: GET /api/config/accounts...
  Found X accounts
✅ GET /api/config/accounts - PASSED

Testing: GET /api/tracking-cycles...
  Found X tracking cycles
✅ GET /api/tracking-cycles - PASSED

Testing: GET /api/tracking-cycles/active...
  Active cycle: [cycle name or None]
✅ GET /api/tracking-cycles/active - PASSED

Testing: GET /api/transactions...
  Found X transactions
✅ GET /api/transactions - PASSED

Testing: GET /api/dashboard/summary...
  Income: X, Expenses: X, Balance: X
✅ GET /api/dashboard/summary - PASSED

Testing: GET /api/dashboard/expenses-by-category...
  Found X expense categories
✅ GET /api/dashboard/expenses-by-category - PASSED

Testing: GET /api/dashboard/monthly-trend...
  Found X months of trend data
✅ GET /api/dashboard/monthly-trend - PASSED

==================================================
📊 Test Summary:
  ✅ Passed: 11
  ❌ Failed: 0
  📈 Total: 11
==================================================
```

## Performance Considerations

- API timeout is set to 30 seconds
- All API calls are logged in development mode
- Optimistic UI updates provide immediate feedback
- Error messages are user-friendly and informative

## Security Notes

- CORS is configured to only accept requests from the frontend URL
- All API errors are logged but sensitive details are not exposed to users
- Authentication will be added in a future phase

## Next Steps

After verifying the API integration:

1. Test all CRUD operations for each entity
2. Verify error handling works correctly
3. Test edge cases (empty data, invalid inputs, etc.)
4. Verify optimistic UI updates work as expected
5. Check that loading states display correctly
6. Ensure error messages are user-friendly

## Additional Resources

- API Integration Guide: `frontend/API_INTEGRATION.md`
- Backend API Documentation: Check backend route files
- Frontend Service Documentation: Check service files in `frontend/src/services/`
