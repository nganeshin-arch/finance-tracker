# TransactionList Component

A modern, accessible transaction list component built with Tailwind CSS and shadcn/ui.

## Features

### 🔍 Search
- Real-time search across all transaction fields
- Case-insensitive matching
- Visual result count
- Automatic pagination reset

### 🏷️ Filter Pills
- Visual representation of active filters
- Color-coded by type (Transaction Type, Category, Account, Date Range)
- Individual removal with X button
- Bulk "Clear All" option
- Smooth animations

### 📊 Table View (Desktop)
- Clean, semantic HTML table
- Hover effects on rows
- Color-coded transaction types (green badges for income, red for expenses)
- Color-coded amounts (green for income, red for expenses)
- Hover-reveal action buttons with smooth transitions
- Truncated descriptions with tooltips

### 📱 Card View (Mobile)
- Responsive card layout for screens < 768px
- All transaction details visible
- Large, readable amounts
- Action buttons always visible
- Proper spacing and hierarchy

### ♿ Accessibility
- WCAG AA compliant
- Semantic HTML with proper ARIA attributes
- Keyboard navigation support
- Screen reader friendly
- Live regions for dynamic updates

### 🎨 Design
- Modern, clean aesthetic
- Dark mode support
- Smooth transitions and animations
- Consistent with shadcn/ui design system

## Installation

Ensure you have the required dependencies:

```bash
npm install lucide-react
```

And the following shadcn/ui components:
- Input
- Button
- Dialog
- Loading (custom component)

## Usage

### Basic Usage

```tsx
import { TransactionList } from '@/components/TransactionList.new';

function MyComponent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const handleEdit = (id: number) => {
    // Open edit form
  };

  const handleDelete = async (id: number) => {
    // Delete transaction
  };

  return (
    <TransactionList
      transactions={transactions}
      onEdit={handleEdit}
      onDelete={handleDelete}
      loading={loading}
    />
  );
}
```

### With Filter Pills

```tsx
import { TransactionList, FilterPill } from '@/components/TransactionList.new';

function MyComponent() {
  const [filters, setFilters] = useState<FilterPill[]>([
    {
      id: 'type-1',
      label: 'Type',
      value: 'Income',
      type: 'transactionType'
    }
  ]);

  const handleRemoveFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };

  const handleClearAllFilters = () => {
    setFilters([]);
  };

  return (
    <TransactionList
      transactions={transactions}
      onEdit={handleEdit}
      onDelete={handleDelete}
      loading={loading}
      filters={filters}
      onRemoveFilter={handleRemoveFilter}
      onClearAllFilters={handleClearAllFilters}
    />
  );
}
```

## Props

### TransactionListProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `transactions` | `Transaction[]` | Yes | Array of transactions to display |
| `onEdit` | `(id: number) => void` | Yes | Callback when edit button is clicked |
| `onDelete` | `(id: number) => Promise<void>` | Yes | Async callback when delete is confirmed |
| `loading` | `boolean` | No | Shows loading state (default: false) |
| `filters` | `FilterPill[]` | No | Array of active filter pills |
| `onRemoveFilter` | `(filterId: string) => void` | No | Callback when a filter is removed |
| `onClearAllFilters` | `() => void` | No | Callback when "Clear All" is clicked |

### FilterPill Interface

```typescript
interface FilterPill {
  id: string;                    // Unique identifier
  label: string;                 // Display label (e.g., "Type", "Category")
  value: string;                 // Display value (e.g., "Income", "Food")
  type: 'transactionType' | 'category' | 'account' | 'dateRange';
}
```

## Filter Pill Colors

- **Transaction Type**: Purple (`bg-purple-50`, `text-purple-700`)
- **Category**: Blue (`bg-blue-50`, `text-blue-700`)
- **Account**: Green (`bg-green-50`, `text-green-700`)
- **Date Range**: Orange (`bg-orange-50`, `text-orange-700`)

## States

### Loading
Shows a centered spinner with "Loading transactions..." message when `loading={true}` and no transactions exist.

### Empty
Shows a Receipt icon with "No transactions found" message when transactions array is empty.

### Normal
Displays the transaction list with search, filters, and pagination.

## Responsive Breakpoints

- **Mobile** (< 768px): Card-based layout
- **Desktop** (≥ 768px): Table layout

## Keyboard Navigation

- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons
- **Escape**: Close delete confirmation dialog

## Customization

### Styling
The component uses Tailwind utility classes. Customize by:
1. Modifying classes directly in the component
2. Using the `cn()` utility for conditional classes
3. Updating `tailwind.config.js` for theme changes

### Pagination
Currently fixed at 10 items per page. To change:
```tsx
const [rowsPerPage] = useState(20); // Change from 10 to 20
```

### Sorting
Currently sorts by date (most recent first). To customize:
```tsx
const sortedTransactions = useMemo(() => {
  return [...filteredTransactions].sort((a, b) => {
    // Your custom sorting logic
  });
}, [filteredTransactions]);
```

## Performance

- Uses `useMemo` for search filtering
- Uses `useMemo` for sorting
- Efficient re-renders with proper dependencies
- Pagination reduces DOM nodes

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Accessibility Features

- Semantic HTML (`<table>`, `<th>`, `<td>`)
- ARIA labels on all interactive elements
- `scope` attributes on table headers
- `role` attributes for structure
- `aria-live` for dynamic updates
- Keyboard navigation support
- Screen reader tested

## Examples

See `TransactionListExample.tsx` for comprehensive usage examples including:
- Basic usage
- With filter pills
- Empty state
- Loading state

## Migration

See `TransactionList.MIGRATION.md` for detailed migration guide from Material-UI version.

## Comparison

See `TransactionList.COMPARISON.md` for detailed comparison with the old Material-UI version.

## License

Part of the Personal Finance Tracker application.
