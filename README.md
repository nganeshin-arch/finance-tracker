# Personal Finance Tracker - Frontend

React-based frontend application for the Personal Finance Tracker.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Forms**: React Hook Form with Yup validation
- **Charts**: Recharts
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/       # Reusable UI components (to be added in future tasks)
├── pages/           # Page components (to be added in future tasks)
├── services/        # API service layer
│   ├── api.ts                    # Axios instance with interceptors
│   ├── transactionService.ts     # Transaction API calls
│   ├── trackingCycleService.ts   # Tracking cycle API calls
│   ├── dashboardService.ts       # Dashboard API calls
│   ├── configService.ts          # Configuration API calls
│   └── index.ts                  # Service exports
├── hooks/           # Custom React hooks
│   ├── useTransactions.ts        # Transaction state management
│   ├── useTrackingCycles.ts      # Tracking cycle state management
│   ├── useConfig.ts              # Configuration state management
│   └── index.ts                  # Hook exports
├── types/           # TypeScript type definitions
│   ├── models.ts                 # Core data models
│   ├── dtos.ts                   # API DTOs
│   └── index.ts                  # Type exports
├── utils/           # Utility functions
│   ├── dateUtils.ts              # Date formatting and parsing
│   ├── formatUtils.ts            # Number and currency formatting
│   └── index.ts                  # Utility exports
├── App.tsx          # Root component with theme and routing
├── main.tsx         # Application entry point
└── vite-env.d.ts    # Vite environment type definitions
```

## Environment Variables

Create a `.env` file in the frontend directory (use `.env.example` as template):

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Services

All API services are configured with:
- Base URL from environment variables
- Request/response interceptors
- Error handling
- Authentication token support (for future use)

### Service Methods

**Transaction Service**
- `getTransactions(filters?)` - Get all transactions with optional filters
- `getTransactionById(id)` - Get single transaction
- `createTransaction(data)` - Create new transaction
- `updateTransaction(id, data)` - Update transaction
- `deleteTransaction(id)` - Delete transaction

**Tracking Cycle Service**
- `getTrackingCycles()` - Get all tracking cycles
- `getActiveTrackingCycle()` - Get current active cycle
- `getTrackingCycleById(id)` - Get single cycle
- `createTrackingCycle(data)` - Create new cycle
- `updateTrackingCycle(id, data)` - Update cycle
- `deleteTrackingCycle(id)` - Delete cycle

**Dashboard Service**
- `getSummary(trackingCycleId?)` - Get financial summary
- `getExpensesByCategory(trackingCycleId?)` - Get expense breakdown
- `getMonthlyTrend()` - Get monthly trend data

**Config Service**
- Transaction Types: `getTransactionTypes()`, `createTransactionType()`, `deleteTransactionType()`
- Categories: `getCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()`
- Sub-Categories: `getSubCategories()`, `createSubCategory()`, `updateSubCategory()`, `deleteSubCategory()`
- Payment Modes: `getPaymentModes()`, `createPaymentMode()`, `deletePaymentMode()`
- Accounts: `getAccounts()`, `createAccount()`, `deleteAccount()`

## Custom Hooks

**useTransactions**
- Manages transaction state and operations
- Provides: `transactions`, `loading`, `error`, `fetchTransactions()`, `createTransaction()`, `updateTransaction()`, `deleteTransaction()`

**useTrackingCycles**
- Manages tracking cycle state and operations
- Provides: `trackingCycles`, `activeTrackingCycle`, `loading`, `error`, and CRUD methods

**useConfig**
- Manages configuration data (types, categories, modes, accounts)
- Provides: All config arrays, `loading`, `error`, and fetch methods

## Utilities

**Date Utils**
- `formatDateForAPI(date)` - Format date as YYYY-MM-DD
- `formatDateForDisplay(date)` - Format date for UI display
- `formatDateForInput(date)` - Format date for input fields
- `parseDate(dateString)` - Parse ISO date string
- `isValidDate(dateString)` - Validate date string
- `getCurrentDate()` - Get current date as string

**Format Utils**
- `formatCurrency(amount)` - Format number as currency
- `formatNumber(num)` - Format number with commas
- `formatPercentage(value)` - Format as percentage
- `truncateText(text, maxLength)` - Truncate with ellipsis

## Next Steps

The following will be implemented in subsequent tasks:
- UI components (forms, lists, charts)
- Page components (Dashboard, Transactions, Admin)
- Navigation and routing setup
- State management context
- Form validation schemas
