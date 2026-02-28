# Performance Optimizations

This document describes the performance optimizations implemented for the GitHub Design Alignment feature.

## Implemented Optimizations

### 1. Memoized Filtered Transactions (UnifiedHomePage)

**Location:** `frontend/src/pages/UnifiedHomePage.tsx`

**Implementation:**
```typescript
const filteredTransactions = useMemo(() => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const dateRange = getDateRange(viewMode, referenceDate, customStartDate, customEndDate);
  
  return transactions.filter((transaction: Transaction) => {
    return isInRange(transaction.date.toString(), dateRange.start, dateRange.end);
  });
}, [transactions, viewMode, referenceDate, customStartDate, customEndDate]);
```

**Benefits:**
- Prevents unnecessary recalculation of filtered transactions on every render
- Only recalculates when dependencies change (transactions, viewMode, dates)
- Improves performance with large transaction datasets

### 2. Memoized Calendar Month Data (CalendarView)

**Location:** `frontend/src/components/CalendarView.tsx`

**Implementation:**
```typescript
const calendarDays = useMemo(() => {
  const transformedTransactions = transactions.map(t => ({
    ...t,
    type: t.transactionType?.name || 'Unknown'
  }));
  return getCalendarMonth(referenceDate, transformedTransactions);
}, [referenceDate, transactions]);
```

**Benefits:**
- Prevents expensive calendar grid calculations on every render
- Only recalculates when reference date or transactions change
- Significantly improves calendar view performance

### 3. Debounced Search Input (TransactionTable)

**Location:** `frontend/src/components/TransactionTable.tsx`

**Implementation:**
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 300);

  return () => clearTimeout(timer);
}, [searchTerm]);

const filteredTransactions = useMemo(() => {
  // Uses debouncedSearchTerm instead of searchTerm
  if (debouncedSearchTerm.trim()) {
    // ... filtering logic
  }
}, [transactions, debouncedSearchTerm, filterType]);
```

**Benefits:**
- Reduces number of filter operations during typing
- Waits 300ms after user stops typing before filtering
- Improves responsiveness with large datasets
- Shows "Searching..." indicator during debounce period

### 4. Lazy Loading CalendarView Component

**Location:** `frontend/src/pages/UnifiedHomePage.tsx`

**Implementation:**
```typescript
import { lazy, Suspense } from 'react';

const CalendarView = lazy(() => 
  import('../components/CalendarView').then(module => ({ 
    default: module.CalendarView 
  }))
);

// In render:
{viewMode === 'calendar' ? (
  <Suspense fallback={<Loading />}>
    <CalendarView
      transactions={filteredTransactions}
      referenceDate={referenceDate}
      onDelete={handleDeleteTransaction}
    />
  </Suspense>
) : (
  <TransactionTable ... />
)}
```

**Benefits:**
- Reduces initial bundle size
- CalendarView code only loaded when needed
- Faster initial page load
- Shows loading indicator while component loads

## Performance Testing

### Test Utilities

**Location:** `frontend/src/utils/performanceTestUtils.ts`

Provides utilities for:
- Generating mock transaction datasets (100 to 10,000+ transactions)
- Measuring function execution time
- Testing filtering performance
- Running comprehensive performance test suites

### Performance Test Page

**Location:** `frontend/src/pages/PerformanceTestPage.tsx`
**Route:** `/performance-test`

Interactive page for testing performance with large datasets:
- Generate mock transactions (100 to 10,000)
- Run performance benchmarks
- Test live component behavior
- Measure filtering operations

### Running Performance Tests

1. Navigate to `/performance-test` in the application
2. Select dataset size (100, 500, 1000, 5000, or 10,000 transactions)
3. Click "Generate Test Data"
4. Click "Run Performance Tests" to see benchmark results
5. Test live search and filtering in the transaction table

### Expected Performance

With optimizations, the application should handle:
- **100 transactions:** < 5ms filtering time
- **1,000 transactions:** < 20ms filtering time
- **5,000 transactions:** < 100ms filtering time
- **10,000 transactions:** < 200ms filtering time

## Best Practices

### When to Use useMemo

Use `useMemo` for:
- Expensive calculations (filtering, sorting, transforming large arrays)
- Derived data that depends on props or state
- Data passed to child components to prevent unnecessary re-renders

Don't use `useMemo` for:
- Simple calculations (< 1ms)
- Values that change on every render
- Premature optimization

### When to Use Debouncing

Use debouncing for:
- Search inputs
- Auto-save functionality
- Resize/scroll event handlers
- API calls triggered by user input

Typical debounce delays:
- Search: 300ms
- Auto-save: 1000ms
- Resize/scroll: 150ms

### When to Use Lazy Loading

Use lazy loading for:
- Large components not needed on initial render
- Route-based code splitting
- Components behind user interactions (modals, tabs)
- Heavy third-party libraries

Don't lazy load:
- Small components
- Components needed immediately
- Critical above-the-fold content

## Monitoring Performance

### Browser DevTools

1. **Performance Tab:**
   - Record page interactions
   - Identify slow renders
   - Check for unnecessary re-renders

2. **React DevTools Profiler:**
   - Measure component render times
   - Identify performance bottlenecks
   - Analyze why components re-render

3. **Network Tab:**
   - Check bundle sizes
   - Verify lazy loading works
   - Monitor API response times

### Console Logging

The performance test utilities log timing information:
```javascript
measurePerformance(() => filterTransactions(), 'Filtering');
// Output: [Performance] Filtering: 15.23ms
```

## Future Optimizations

Potential improvements for even better performance:

1. **Virtual Scrolling:** For transaction tables with 1000+ rows
2. **Web Workers:** For heavy calculations (complex filtering, data processing)
3. **IndexedDB Caching:** For offline support and faster data access
4. **React.memo:** For expensive child components
5. **useCallback:** For callback props passed to memoized children
6. **Code Splitting:** Further split large components
7. **Service Worker:** For caching and offline functionality

## Troubleshooting

### Slow Filtering

If filtering is slow:
1. Check dataset size (use performance test page)
2. Verify useMemo dependencies are correct
3. Check for unnecessary re-renders (React DevTools)
4. Consider virtual scrolling for large lists

### Slow Initial Load

If initial load is slow:
1. Check bundle size (use `npm run build -- --analyze`)
2. Verify lazy loading is working
3. Check network tab for large assets
4. Consider code splitting

### Memory Issues

If experiencing memory issues:
1. Check for memory leaks (detached DOM nodes)
2. Verify cleanup in useEffect hooks
3. Limit dataset size in production
4. Consider pagination for large datasets

## Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [useMemo Hook](https://react.dev/reference/react/useMemo)
- [Code Splitting](https://react.dev/reference/react/lazy)
- [Web Performance](https://web.dev/performance/)
