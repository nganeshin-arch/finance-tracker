# API Integration Guide

This document describes how the frontend connects to the backend API and how to test the integration.

## Configuration

### Environment Variables

The frontend uses environment variables to configure the API connection:

**File: `frontend/.env`**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend Configuration

The backend CORS is configured to accept requests from the frontend:

**File: `backend/.env`**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## API Client

The API client is implemented in `frontend/src/services/api.ts` using Axios with the following features:

### Features

1. **Base URL Configuration**: Automatically uses `VITE_API_BASE_URL` from environment variables
2. **Request Interceptors**: 
   - Adds authentication token (for future use)
   - Logs requests in development mode
3. **Response Interceptors**:
   - Standardized error handling
   - Automatic error logging
   - User-friendly error messages
4. **Timeout**: 30 seconds default timeout
5. **Error Handling**: Comprehensive error handling for all HTTP status codes

### Error Handling

The API client provides standardized error handling:

```typescript
interface ApiError {
  message: string;
  status?: number;
  details?: any;
  error?: string;
}
```

Use the `getApiErrorMessage()` helper to extract user-friendly error messages:

```typescript
import { getApiErrorMessage } from '../services/api';

try {
  await transactionService.createTransaction(data);
} catch (error) {
  const message = getApiErrorMessage(error);
  console.error(message);
}
```

## Service Layer

All API calls are organized into service modules:

### Transaction Service (`transactionService.ts`)
- `getTransactions(filters?)` - Get all transactions with optional filters
- `getTransactionById(id)` - Get single transaction
- `createTransaction(data)` - Create new transaction
- `updateTransaction(id, data)` - Update transaction
- `deleteTransaction(id)` - Delete transaction

### Tracking Cycle Service (`trackingCycleService.ts`)
- `getTrackingCycles()` - Get all tracking cycles
- `getActiveTrackingCycle()` - Get current active cycle
- `getTrackingCycleById(id)` - Get single cycle
- `createTrackingCycle(data)` - Create new cycle
- `updateTrackingCycle(id, data)` - Update cycle
- `deleteTrackingCycle(id)` - Delete cycle

### Configuration Service (`configService.ts`)
- Transaction Types: `getTransactionTypes()`, `createTransactionType()`, `deleteTransactionType()`
- Categories: `getCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()`
- Sub-Categories: `getSubCategories()`, `createSubCategory()`, `updateSubCategory()`, `deleteSubCategory()`
- Payment Modes: `getPaymentModes()`, `createPaymentMode()`, `deletePaymentMode()`
- Accounts: `getAccounts()`, `createAccount()`, `deleteAccount()`

### Dashboard Service (`dashboardService.ts`)
- `getSummary(trackingCycleId?)` - Get financial summary
- `getExpensesByCategory(trackingCycleId?)` - Get expense breakdown
- `getMonthlyTrend()` - Get monthly trend data

## Custom Hooks

React hooks provide state management and API integration:

### useTransactions
```typescript
const {
  transactions,
  loading,
  error,
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = useTransactions(filters);
```

### useTrackingCycles
```typescript
const {
  trackingCycles,
  activeTrackingCycle,
  loading,
  error,
  fetchTrackingCycles,
  createTrackingCycle,
  updateTrackingCycle,
  deleteTrackingCycle,
} = useTrackingCycles();
```

### useConfig
```typescript
const {
  transactionTypes,
  categories,
  subCategories,
  paymentModes,
  accounts,
  loading,
  error,
  fetchAllConfig,
  fetchCategories,
  fetchSubCategories,
} = useConfig();
```

## Optimistic UI Updates

The hooks implement optimistic UI updates for better user experience:

- **Create**: New items are immediately added to the local state
- **Update**: Items are immediately updated in the local state
- **Delete**: Items are immediately removed from the local state

If the API call fails, the error is captured and can be displayed to the user.

## Testing API Integration

### Manual Testing

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open the browser console and run:
```javascript
testApiIntegration()
```

This will test all API endpoints and display the results.

### Automated Testing

The `apiTest.ts` utility provides comprehensive API testing:

```typescript
import { testApiIntegration } from './utils/apiTest';

const results = await testApiIntegration();
console.log(results);
```

## CORS Configuration

The backend is configured to accept requests from the frontend:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## Troubleshooting

### Connection Refused
- Ensure backend server is running on port 5000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Check `PORT` in backend `.env`

### CORS Errors
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check browser console for specific CORS error messages
- Ensure backend CORS middleware is properly configured

### 404 Errors
- Verify API endpoint paths match between frontend services and backend routes
- Check backend route registration in `backend/src/index.ts`

### Network Timeout
- Default timeout is 30 seconds
- Check network connectivity
- Verify backend server is responding

### Authentication Errors (Future)
- Check if auth token is present in localStorage
- Verify token is valid and not expired
- Check Authorization header in request

## Development Tips

1. **Enable Request Logging**: Set `NODE_ENV=development` to see all API requests in console
2. **Use Browser DevTools**: Network tab shows all API calls with request/response details
3. **Check Backend Logs**: Backend logs all requests in development mode
4. **Test Endpoints Individually**: Use the service methods directly in console for debugging
5. **Monitor Error Messages**: All errors are logged to console with detailed information

## Production Considerations

1. **Environment Variables**: Update `VITE_API_BASE_URL` to production API URL
2. **CORS**: Update `FRONTEND_URL` in backend to production frontend URL
3. **HTTPS**: Use HTTPS for all API calls in production
4. **Error Handling**: Ensure sensitive error details are not exposed to users
5. **Timeout**: Consider adjusting timeout based on network conditions
6. **Rate Limiting**: Implement rate limiting on backend to prevent abuse
