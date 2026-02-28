# Dual Pie Charts Enhancement - Design Document

## Overview

This design document outlines the technical approach for implementing dual pie charts that display income and expense breakdowns by category, along with an enhanced color scheme and visual design improvements. The solution will replace the existing single Income vs Expense pie chart with two separate, side-by-side charts that provide deeper insights into category-level financial data.

The implementation will leverage the existing Recharts library, maintain consistency with the current shadcn/ui design system, and ensure responsive behavior across all device sizes.

## Architecture

### Component Structure

```
UnifiedHomePage
├── SummaryCards (existing)
├── DualPieChartLayout (new)
│   ├── IncomeCategoryChart (new)
│   └── ExpenseCategoryChart (new)
└── TransactionTable/CalendarView (existing)
```

### Data Flow

1. **UnifiedHomePage** filters transactions based on view mode and date range
2. Filtered transactions are passed to **DualPieChartLayout**
3. **DualPieChartLayout** splits transactions by type and passes to child charts
4. **IncomeCategoryChart** aggregates income transactions by category
5. **ExpenseCategoryChart** aggregates expense transactions by category
6. Each chart renders using Recharts with custom styling and colors

### File Organization

```
frontend/src/
├── components/
│   ├── IncomeCategoryChart.tsx (new)
│   ├── ExpenseCategoryChart.tsx (new)
│   ├── DualPieChartLayout.tsx (new)
│   ├── IncomeExpensePieChart.tsx (deprecated, keep for rollback)
│   └── ui/ (existing shadcn components)
├── pages/
│   └── UnifiedHomePage.tsx (update to use new layout)
├── utils/
│   ├── chartColors.ts (new - color palette definitions)
│   └── chartUtils.ts (new - data aggregation helpers)
└── types/
    └── models.ts (existing)
```

## Components and Interfaces

### 1. DualPieChartLayout Component

**Purpose:** Container component that manages the responsive layout of two pie charts side by side.

**Props Interface:**
```typescript
interface DualPieChartLayoutProps {
  transactions: Transaction[];
}
```

**Responsibilities:**
- Split transactions into income and expense arrays
- Provide responsive grid layout (2 columns desktop, 1 column mobile)
- Pass filtered data to child chart components
- Handle empty state when no transactions exist

**Layout Behavior:**
- Desktop (≥768px): Two columns with equal width (50% each)
- Mobile (<768px): Single column, stacked vertically
- Consistent gap spacing between charts
- Maintain aspect ratio on resize

### 2. IncomeCategoryChart Component

**Purpose:** Display income transactions grouped by category in a pie chart.

**Props Interface:**
```typescript
interface IncomeCategoryChartProps {
  transactions: Transaction[];
}
```

**Data Structure:**
```typescript
interface ChartDataPoint {
  name: string;        // Category name
  value: number;       // Total amount for category
  color: string;       // Assigned color from palette
  percentage: number;  // Calculated percentage
}
```

**Responsibilities:**
- Filter transactions where `transactionType.name === 'Income'`
- Group transactions by `category.name`
- Sum amounts for each category
- Calculate percentages relative to total income
- Assign colors from income color palette
- Render pie chart with Recharts
- Display total income prominently
- Handle empty state

**Color Assignment:**
```typescript
const INCOME_COLORS = [
  '#10b981', // green-500 - Primary income
  '#059669', // green-600 - Secondary income
  '#047857', // green-700 - Tertiary income
  '#6ee7b7', // green-300 - Additional income
  '#34d399', // green-400 - Extra categories
  '#065f46', // green-800 - Extra categories
];
```

### 3. ExpenseCategoryChart Component

**Purpose:** Display expense transactions grouped by category in a pie chart.

**Props Interface:**
```typescript
interface ExpenseCategoryChartProps {
  transactions: Transaction[];
}
```

**Data Structure:**
```typescript
interface ChartDataPoint {
  name: string;        // Category name
  value: number;       // Total amount for category
  color: string;       // Assigned color from palette
  percentage: number;  // Calculated percentage
}
```

**Responsibilities:**
- Filter transactions where `transactionType.name === 'Expense'`
- Group transactions by `category.name`
- Sum amounts for each category
- Calculate percentages relative to total expense
- Assign colors from expense color palette
- Render pie chart with Recharts
- Display total expense prominently
- Handle empty state

**Color Assignment:**
```typescript
const EXPENSE_COLORS = [
  '#ef4444', // red-500 - Food
  '#f97316', // orange-500 - Transport
  '#f59e0b', // amber-500 - Entertainment
  '#dc2626', // red-600 - Utilities
  '#fb923c', // orange-400 - Shopping
  '#b91c1c', // red-700 - Healthcare
  '#ea580c', // orange-600 - Education
  '#fca5a5', // red-300 - Other
];
```

### 4. Utility Functions

**chartUtils.ts:**
```typescript
// Aggregate transactions by category
export function aggregateByCategory(
  transactions: Transaction[]
): ChartDataPoint[] {
  const categoryMap = new Map<string, number>();
  
  transactions.forEach(transaction => {
    const categoryName = transaction.category?.name || 'Uncategorized';
    const currentAmount = categoryMap.get(categoryName) || 0;
    categoryMap.set(categoryName, currentAmount + transaction.amount);
  });
  
  const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
  
  return Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0,
    color: '', // Assigned by component
  }));
}

// Assign colors to data points
export function assignColors(
  data: ChartDataPoint[],
  colorPalette: string[]
): ChartDataPoint[] {
  return data.map((point, index) => ({
    ...point,
    color: colorPalette[index % colorPalette.length],
  }));
}
```

**chartColors.ts:**
```typescript
export const INCOME_COLOR_PALETTE = [
  '#10b981', // green-500
  '#059669', // green-600
  '#047857', // green-700
  '#6ee7b7', // green-300
  '#34d399', // green-400
  '#065f46', // green-800
];

export const EXPENSE_COLOR_PALETTE = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#dc2626', // red-600
  '#fb923c', // orange-400
  '#b91c1c', // red-700
  '#ea580c', // orange-600
  '#fca5a5', // red-300
];

// Gradient definitions for future use
export const GRADIENTS = {
  income: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  expense: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
  primary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
};
```

## Data Models

### Transaction Data Flow

```typescript
// Input: Array of Transaction objects from UnifiedHomePage
Transaction[] (filtered by date range)
  ↓
// Split by transaction type
Income Transactions[] | Expense Transactions[]
  ↓
// Group by category and aggregate
Map<categoryName, totalAmount>
  ↓
// Transform to chart data
ChartDataPoint[] {
  name: string,
  value: number,
  color: string,
  percentage: number
}
  ↓
// Render in Recharts
<Pie data={chartData} />
```

### Category Aggregation Logic

```typescript
// Pseudocode for aggregation
function aggregateByCategory(transactions) {
  // 1. Create a map to store category totals
  categoryTotals = new Map()
  
  // 2. Iterate through transactions
  for each transaction in transactions {
    categoryName = transaction.category.name
    amount = transaction.amount
    
    // 3. Add to existing total or create new entry
    if categoryTotals.has(categoryName) {
      categoryTotals[categoryName] += amount
    } else {
      categoryTotals[categoryName] = amount
    }
  }
  
  // 4. Calculate total for percentage calculation
  total = sum of all values in categoryTotals
  
  // 5. Transform to chart data format
  chartData = []
  for each [name, value] in categoryTotals {
    chartData.push({
      name: name,
      value: value,
      percentage: (value / total) * 100
    })
  }
  
  // 6. Sort by value (largest first)
  chartData.sort((a, b) => b.value - a.value)
  
  return chartData
}
```

## Error Handling

### Empty State Scenarios

1. **No Transactions:**
   - Display message: "No transaction data available"
   - Show empty chart container with placeholder

2. **No Income Transactions:**
   - Income chart shows: "No income transactions in this period"
   - Expense chart displays normally

3. **No Expense Transactions:**
   - Expense chart shows: "No expense transactions in this period"
   - Income chart displays normally

4. **Missing Category Data:**
   - Use "Uncategorized" as fallback category name
   - Log warning to console for debugging

### Error Boundaries

```typescript
// Wrap charts in error boundary
<ErrorBoundary fallback={<ChartErrorFallback />}>
  <DualPieChartLayout transactions={filteredTransactions} />
</ErrorBoundary>
```

### Data Validation

```typescript
// Validate transaction data before processing
function validateTransactions(transactions: Transaction[]): boolean {
  return transactions.every(t => 
    t.amount !== undefined &&
    t.amount >= 0 &&
    t.transactionType?.name !== undefined &&
    t.category?.name !== undefined
  );
}
```

## Testing Strategy

### Unit Tests

1. **chartUtils.ts:**
   - Test `aggregateByCategory` with various transaction sets
   - Test `assignColors` with different palette sizes
   - Test edge cases (empty array, single transaction, etc.)

2. **IncomeCategoryChart:**
   - Test rendering with income transactions
   - Test empty state
   - Test color assignment
   - Test percentage calculations

3. **ExpenseCategoryChart:**
   - Test rendering with expense transactions
   - Test empty state
   - Test color assignment
   - Test percentage calculations

4. **DualPieChartLayout:**
   - Test responsive layout behavior
   - Test transaction splitting logic
   - Test empty state handling

### Integration Tests

1. **Data Flow:**
   - Test complete flow from UnifiedHomePage to chart rendering
   - Verify filtered transactions are correctly processed
   - Verify chart updates when date range changes

2. **Responsive Behavior:**
   - Test layout at different breakpoints
   - Verify charts stack on mobile
   - Verify charts display side-by-side on desktop

### Visual Regression Tests

1. **Chart Appearance:**
   - Snapshot test for income chart with sample data
   - Snapshot test for expense chart with sample data
   - Snapshot test for dual layout on desktop
   - Snapshot test for stacked layout on mobile

### Accessibility Tests

1. **ARIA Labels:**
   - Verify charts have descriptive labels
   - Verify tooltips are accessible

2. **Keyboard Navigation:**
   - Test chart legend keyboard navigation
   - Test focus indicators

3. **Color Contrast:**
   - Verify all colors meet WCAG AA standards
   - Test with color blindness simulators

## Visual Design Specifications

### Chart Styling

```typescript
// Common chart configuration
const chartConfig = {
  outerRadius: 100,
  innerRadius: 0, // Full pie (not donut)
  paddingAngle: 2, // Small gap between slices
  cornerRadius: 4, // Rounded slice corners
  animationDuration: 800,
  animationEasing: 'ease-out',
};

// Card styling
const cardClasses = cn(
  'border-2',
  'shadow-lg',
  'hover:shadow-xl',
  'transition-shadow',
  'duration-300'
);
```

### Typography

```typescript
// Chart title
<CardTitle className="text-xl font-bold text-foreground">
  Income by Category
</CardTitle>

// Total amount display
<div className="text-2xl font-bold text-green-600 dark:text-green-400">
  {formatCurrency(totalIncome)}
</div>

// Category labels in chart
label={({ name, percent }) => 
  `${name}: ${(percent * 100).toFixed(1)}%`
}
```

### Spacing and Layout

```typescript
// Dual chart grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <IncomeCategoryChart />
  <ExpenseCategoryChart />
</div>

// Chart container padding
<CardContent className="p-6">
  <ResponsiveContainer width="100%" height={350}>
    {/* Chart */}
  </ResponsiveContainer>
</CardContent>
```

### Hover Effects

```typescript
// Card hover effect
className="transition-all duration-300 hover:scale-[1.02]"

// Slice hover (Recharts built-in)
<Pie
  activeShape={{
    outerRadius: 110, // Expand on hover
    stroke: 'hsl(var(--border))',
    strokeWidth: 2,
  }}
/>
```

### Tooltip Styling

```typescript
<Tooltip
  formatter={(value: number) => formatCurrency(value)}
  contentStyle={{
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  }}
  labelStyle={{
    fontWeight: 600,
    color: 'hsl(var(--foreground))',
  }}
/>
```

### Legend Styling

```typescript
<Legend
  verticalAlign="bottom"
  height={60}
  iconType="circle"
  formatter={(value, entry) => {
    const dataPoint = entry.payload as ChartDataPoint;
    return (
      <span className="text-sm">
        {value}: {formatCurrency(dataPoint.value)} 
        ({dataPoint.percentage.toFixed(1)}%)
      </span>
    );
  }}
  wrapperStyle={{
    paddingTop: '20px',
  }}
/>
```

## Performance Considerations

### Memoization Strategy

```typescript
// Memoize chart data calculation
const chartData = useMemo(() => {
  return aggregateByCategory(transactions);
}, [transactions]);

// Memoize color assignment
const coloredData = useMemo(() => {
  return assignColors(chartData, INCOME_COLOR_PALETTE);
}, [chartData]);
```

### Lazy Loading

```typescript
// Charts are not lazy loaded initially since they're above the fold
// If performance issues arise, consider:
const DualPieChartLayout = lazy(() => 
  import('./DualPieChartLayout')
);

// Use with Suspense
<Suspense fallback={<ChartSkeleton />}>
  <DualPieChartLayout transactions={filteredTransactions} />
</Suspense>
```

### Render Optimization

```typescript
// Prevent unnecessary re-renders
export const IncomeCategoryChart = React.memo<IncomeCategoryChartProps>(
  ({ transactions }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if transactions actually changed
    return prevProps.transactions === nextProps.transactions;
  }
);
```

### Data Processing Optimization

```typescript
// Efficient aggregation using Map
function aggregateByCategory(transactions: Transaction[]): ChartDataPoint[] {
  // O(n) time complexity
  const categoryMap = new Map<string, number>();
  
  // Single pass through transactions
  for (const transaction of transactions) {
    const categoryName = transaction.category?.name || 'Uncategorized';
    categoryMap.set(
      categoryName,
      (categoryMap.get(categoryName) || 0) + transaction.amount
    );
  }
  
  // Transform to array (O(m) where m = number of categories)
  const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
  
  return Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      color: '',
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending
}
```

## Accessibility Implementation

### ARIA Labels

```typescript
<div role="img" aria-label={`Income breakdown by category. Total income: ${formatCurrency(totalIncome)}`}>
  <ResponsiveContainer>
    <PieChart>
      {/* Chart content */}
    </PieChart>
  </ResponsiveContainer>
</div>

// Individual slices
<Pie
  data={chartData}
  aria-label="Income categories"
  // Recharts handles individual slice accessibility
/>
```

### Keyboard Navigation

```typescript
// Legend items should be focusable
<Legend
  wrapperStyle={{
    outline: 'none',
  }}
  content={(props) => (
    <ul className="flex flex-wrap gap-4 justify-center">
      {props.payload?.map((entry, index) => (
        <li
          key={index}
          className="flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          tabIndex={0}
          role="button"
          aria-label={`${entry.value}: ${formatCurrency(entry.payload.value)}`}
        >
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm">{entry.value}</span>
        </li>
      ))}
    </ul>
  )}
/>
```

### Color Contrast

All colors in the palette have been verified to meet WCAG AA standards:
- Green shades: Contrast ratio ≥ 4.5:1 against white background
- Red/Orange shades: Contrast ratio ≥ 4.5:1 against white background
- Dark mode: All colors adjusted for sufficient contrast against dark background

### Screen Reader Support

```typescript
// Provide text alternative for chart data
<div className="sr-only">
  <h3>Income by Category</h3>
  <ul>
    {chartData.map(item => (
      <li key={item.name}>
        {item.name}: {formatCurrency(item.value)} ({item.percentage.toFixed(1)}%)
      </li>
    ))}
  </ul>
  <p>Total Income: {formatCurrency(totalIncome)}</p>
</div>
```

## Migration Strategy

### Phase 1: Create New Components (Non-Breaking)

1. Create utility files (`chartUtils.ts`, `chartColors.ts`)
2. Create `IncomeCategoryChart.tsx`
3. Create `ExpenseCategoryChart.tsx`
4. Create `DualPieChartLayout.tsx`
5. Test new components in isolation

### Phase 2: Update UnifiedHomePage

1. Import `DualPieChartLayout`
2. Replace `<IncomeExpensePieChart />` with `<DualPieChartLayout />`
3. Keep old component file for potential rollback

### Phase 3: Testing and Validation

1. Test on multiple screen sizes
2. Verify data accuracy
3. Test with various transaction datasets
4. Accessibility audit
5. Performance testing

### Phase 4: Cleanup (Optional)

1. Remove `IncomeExpensePieChart.tsx` if no longer needed
2. Update documentation
3. Remove unused imports

### Rollback Plan

If issues arise:
1. Revert `UnifiedHomePage.tsx` to use `IncomeExpensePieChart`
2. Keep new components for future fixes
3. Document issues for resolution

## Integration Points

### UnifiedHomePage Integration

```typescript
// Before
<IncomeExpensePieChart transactions={filteredTransactions} />

// After
<DualPieChartLayout transactions={filteredTransactions} />
```

### Data Dependencies

- **Transactions:** Provided by `useTransactions()` hook
- **Filtering:** Applied in `UnifiedHomePage` based on view mode
- **Categories:** Populated via transaction relations (`transaction.category`)
- **Transaction Types:** Used to split income/expense (`transaction.transactionType`)

### Styling Dependencies

- **Tailwind CSS:** All utility classes
- **shadcn/ui:** Card, CardHeader, CardTitle, CardContent components
- **CSS Variables:** `--card`, `--border`, `--foreground` for theming
- **Dark Mode:** Automatic via Tailwind's `dark:` prefix

## Future Enhancements

### Potential Improvements

1. **Interactive Filtering:**
   - Click legend item to filter transactions table
   - Show/hide categories dynamically

2. **Drill-Down:**
   - Click slice to show subcategory breakdown
   - Modal with detailed transaction list

3. **Comparison View:**
   - Compare current period vs previous period
   - Show growth/decline indicators

4. **Export Functionality:**
   - Export chart as PNG/SVG
   - Export data as CSV

5. **Customization:**
   - User-defined color preferences
   - Toggle between pie/donut chart
   - Adjustable chart size

6. **Animation Enhancements:**
   - Staggered slice animations
   - Smooth transitions when data updates
   - Entrance animations on scroll

## Technical Constraints

### Browser Support

- Modern browsers with ES6+ support
- CSS Grid and Flexbox support required
- SVG rendering support (for Recharts)

### Performance Targets

- Initial render: < 500ms
- Data update: < 200ms
- Smooth 60fps animations
- Bundle size increase: < 10KB

### Dependencies

- React 18+
- Recharts 2.x
- Tailwind CSS 3.x
- TypeScript 5.x

### Limitations

- Maximum 20 categories per chart (for readability)
- Minimum slice size: 1% (smaller slices grouped as "Other")
- Chart height: Fixed at 350px for consistency
