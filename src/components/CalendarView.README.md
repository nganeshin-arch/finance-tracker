# CalendarView Component

## Overview

The `CalendarView` component displays transactions in a month-grid calendar format, allowing users to see their financial activity organized by date. It provides an intuitive way to visualize spending patterns and income across a month.

## Features

- **Month Grid Layout**: 7-column grid (Sunday-Saturday) showing all days of the month
- **Transaction Totals**: Each day displays income (green), expense (red), and transfer (blue) totals
- **Day Details**: Click on any day to view detailed transaction list
- **Color Coding**: Visual distinction between transaction types
- **Empty State Handling**: Gracefully handles days without transactions
- **Responsive Design**: Works on mobile and desktop screens
- **Month Navigation**: Integrates with ViewModeSelector for month navigation

## Usage

```tsx
import { CalendarView } from '@/components/CalendarView';
import { useTransactions } from '@/hooks/useTransactions';

function MyComponent() {
  const { transactions, deleteTransaction } = useTransactions();
  const [referenceDate, setReferenceDate] = useState(new Date());

  return (
    <CalendarView
      transactions={transactions}
      referenceDate={referenceDate}
      onDelete={deleteTransaction}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `transactions` | `Transaction[]` | Yes | Array of transactions to display |
| `referenceDate` | `Date` | Yes | The month to display (any date within the month) |
| `onDelete` | `(id: number) => void` | Yes | Callback when user deletes a transaction |

## Transaction Data Structure

The component expects transactions with the following structure:

```typescript
interface Transaction {
  id: number;
  date: Date;
  amount: number;
  description?: string;
  transactionType: {
    name: 'Income' | 'Expense' | 'Transfer';
  };
  category: {
    name: string;
  };
  subCategory?: {
    name: string;
  };
  // ... other fields
}
```

## Visual Design

### Calendar Grid
- Days from the current month: Normal background
- Days from previous/next months: Muted background and text
- Days with transactions: Clickable with hover effect
- Selected day: Highlighted with primary color border

### Transaction Display
- **Income**: Green text with "+" prefix
- **Expense**: Red text with "-" prefix
- **Transfer**: Blue text with "↔" prefix

### Day Details Panel
- Shows all transactions for the selected day
- Each transaction displays:
  - Type badge (color-coded)
  - Category and subcategory
  - Description (if available)
  - Amount (formatted as currency)
  - Delete button (visible on hover)

## Integration with ViewModeSelector

The CalendarView works seamlessly with the ViewModeSelector component for month navigation:

```tsx
<ViewModeSelector
  viewMode="calendar"
  referenceDate={referenceDate}
  onDateChange={setReferenceDate}
  // ... other props
/>

<CalendarView
  transactions={transactions}
  referenceDate={referenceDate}
  onDelete={handleDelete}
/>
```

## Accessibility

- Keyboard navigation support
- Semantic HTML structure
- ARIA labels for interactive elements
- Focus indicators on all clickable elements
- Screen reader friendly transaction details

## Performance

- Uses `useMemo` to cache calendar calculations
- Only re-renders when transactions or referenceDate changes
- Efficient day data generation using date-fns utilities

## Dependencies

- `date-fns`: Date manipulation and formatting
- `lucide-react`: Icons (Trash2)
- `@/components/ui`: shadcn/ui components (Button, Card)
- `@/utils/dateUtils`: Calendar data generation utilities
- `@/utils/formatUtils`: Currency formatting

## Related Components

- `ViewModeSelector`: Provides month navigation controls
- `TransactionTable`: Alternative list view for transactions
- `TransactionForm`: For adding new transactions

## Example

See `frontend/src/examples/CalendarViewExample.tsx` for a complete working example.
