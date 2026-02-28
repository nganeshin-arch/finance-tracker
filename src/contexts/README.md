# Frontend State Management

This directory contains React Context providers for global state management in the Personal Finance Tracker application.

## Overview

The application uses React Context API for state management, providing a centralized way to manage and share data across components without prop drilling.

## Context Providers

### ConfigContext

Manages all configuration data including transaction types, categories, sub-categories, payment modes, and accounts.

**Usage:**
```typescript
import { useConfigContext } from '../contexts';

function MyComponent() {
  const {
    transactionTypes,
    categories,
    subCategories,
    paymentModes,
    accounts,
    loading,
    error,
    fetchAllConfig,
    addCategory,
    deleteCategory,
    // ... other methods
  } = useConfigContext();

  // Use the data and methods
}
```

**Available Methods:**
- `fetchAllConfig()` - Fetch all configuration data
- `fetchCategories(transactionTypeId?)` - Fetch categories, optionally filtered by type
- `fetchSubCategories(categoryId?)` - Fetch sub-categories, optionally filtered by category
- `addTransactionType(name)` - Create a new transaction type
- `deleteTransactionType(id)` - Delete a transaction type
- `addCategory(name, transactionTypeId)` - Create a new category
- `updateCategory(id, name)` - Update a category
- `deleteCategory(id)` - Delete a category
- `addSubCategory(name, categoryId)` - Create a new sub-category
- `updateSubCategory(id, name)` - Update a sub-category
- `deleteSubCategory(id)` - Delete a sub-category
- `addPaymentMode(name)` - Create a new payment mode
- `deletePaymentMode(id)` - Delete a payment mode
- `addAccount(name)` - Create a new account
- `deleteAccount(id)` - Delete an account

### TrackingCycleContext

Manages tracking cycles including the active cycle.

**Usage:**
```typescript
import { useTrackingCycleContext } from '../contexts';

function MyComponent() {
  const {
    trackingCycles,
    activeTrackingCycle,
    loading,
    error,
    fetchTrackingCycles,
    createTrackingCycle,
    updateTrackingCycle,
    deleteTrackingCycle,
  } = useTrackingCycleContext();

  // Use the data and methods
}
```

**Available Methods:**
- `fetchTrackingCycles()` - Fetch all tracking cycles
- `fetchActiveTrackingCycle()` - Fetch the currently active tracking cycle
- `createTrackingCycle(data)` - Create a new tracking cycle
- `updateTrackingCycle(id, data)` - Update a tracking cycle
- `deleteTrackingCycle(id)` - Delete a tracking cycle

## AppProvider

The `AppProvider` component wraps all context providers together, making it easy to provide all contexts to the application.

**Usage in App.tsx:**
```typescript
import { AppProvider } from './contexts';

function App() {
  return (
    <AppProvider>
      {/* Your app components */}
    </AppProvider>
  );
}
```

## Error Handling

All context providers include built-in error handling:
- Errors are captured and stored in the `error` state
- Error messages are user-friendly
- Detailed errors are logged to the console for debugging
- Loading states are managed automatically

## Loading States

Each context provides a `loading` boolean that indicates when async operations are in progress. Use this to show loading indicators in your UI:

```typescript
const { loading, transactionTypes } = useConfigContext();

if (loading) {
  return <CircularProgress />;
}

return <div>{/* Render your content */}</div>;
```

## Best Practices

1. **Use contexts at the appropriate level**: Only wrap components that need the context data
2. **Handle errors gracefully**: Always check the `error` state and display user-friendly messages
3. **Show loading states**: Use the `loading` state to provide feedback during async operations
4. **Avoid unnecessary re-renders**: Context consumers only re-render when the context value changes
5. **Use custom hooks**: Always use the provided custom hooks (`useConfigContext`, `useTrackingCycleContext`) instead of `useContext` directly

## Architecture

```
AppProvider
├── ConfigProvider
│   └── Manages configuration data
└── TrackingCycleProvider
    └── Manages tracking cycles
```

All providers automatically fetch their data on mount, ensuring the application always has the latest data available.
