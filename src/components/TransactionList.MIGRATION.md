# TransactionList Migration Guide

## Overview
This document describes the migration from Material-UI based TransactionList to the new Tailwind CSS + shadcn/ui implementation.

## Key Changes

### 1. Search Functionality
- **New**: Built-in search bar with Lucide Search icon
- Searches across all transaction fields (date, type, category, amount, description, etc.)
- Real-time filtering with visual feedback

### 2. Filter Pills
- **New**: Visual filter pills showing active filters
- Color-coded by filter type:
  - Purple: Transaction Type
  - Blue: Category
  - Green: Account
  - Orange: Date Range
- Removable with X button
- "Clear All" button when multiple filters active

### 3. Table Design
- Replaced Material-UI Table with custom Tailwind table
- Hover effects on rows
- Color-coded transaction amounts (green for income, red for expenses)
- Proper semantic HTML with accessibility attributes

### 4. Action Buttons
- **New**: Hover-reveal action buttons
- Buttons fade in on row hover (desktop only)
- Smooth opacity transitions
- Always visible on mobile

### 5. Responsive Design
- **Desktop**: Traditional table layout
- **Mobile**: Card-based layout with all transaction details
- Breakpoint at `md` (768px)

### 6. Empty State
- Custom empty state with Receipt icon
- Helpful message for first-time users
- Styled with Tailwind

### 7. Accessibility
- Proper ARIA labels and roles
- Semantic table structure with `scope` attributes
- Keyboard navigation support
- Screen reader friendly
- Live region for pagination updates

## Component Props

### New Props
```typescript
interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
  filters?: FilterPill[];              // NEW
  onRemoveFilter?: (filterId: string) => void;  // NEW
  onClearAllFilters?: () => void;      // NEW
}

export interface FilterPill {
  id: string;
  label: string;
  value: string;
  type: 'transactionType' | 'category' | 'account' | 'dateRange';
}
```

## Usage Example

### Basic Usage (No Filters)
```tsx
import { TransactionList } from '@/components/TransactionList.new';

<TransactionList
  transactions={transactions}
  onEdit={handleEdit}
  onDelete={handleDelete}
  loading={loading}
/>
```

### With Filter Pills
```tsx
import { TransactionList, FilterPill } from '@/components/TransactionList.new';

const [filters, setFilters] = useState<FilterPill[]>([
  {
    id: 'type-1',
    label: 'Type',
    value: 'Income',
    type: 'transactionType'
  },
  {
    id: 'date-1',
    label: 'Date Range',
    value: 'Jan 2024 - Feb 2024',
    type: 'dateRange'
  }
]);

const handleRemoveFilter = (filterId: string) => {
  setFilters(filters.filter(f => f.id !== filterId));
};

const handleClearAllFilters = () => {
  setFilters([]);
};

<TransactionList
  transactions={transactions}
  onEdit={handleEdit}
  onDelete={handleDelete}
  loading={loading}
  filters={filters}
  onRemoveFilter={handleRemoveFilter}
  onClearAllFilters={handleClearAllFilters}
/>
```

## Migration Steps

1. **Install the new component**
   - Copy `TransactionList.new.tsx` to your components directory
   - Ensure all shadcn/ui components are installed (Input, Button, Dialog, Loading)

2. **Update imports**
   ```tsx
   // Old
   import { TransactionList } from '../components/TransactionList';
   
   // New
   import { TransactionList } from '../components/TransactionList.new';
   ```

3. **Add filter state (optional)**
   ```tsx
   const [filters, setFilters] = useState<FilterPill[]>([]);
   ```

4. **Update component usage**
   - Add filter props if using filters
   - Remove any custom search/filter UI (now built-in)

5. **Test thoroughly**
   - Test search functionality
   - Test filter pills (if using)
   - Test responsive behavior on mobile
   - Test accessibility with keyboard navigation
   - Test with screen readers

## Removed Features
- **Sorting**: Column sorting removed for simplicity (transactions sorted by date descending)
- **Pagination controls**: Simplified to Previous/Next buttons
- **Rows per page selector**: Fixed at 10 rows per page

## Styling Customization

The component uses Tailwind classes and can be customized by:
1. Modifying the Tailwind classes directly in the component
2. Using the `cn()` utility for conditional classes
3. Updating your `tailwind.config.js` for global theme changes

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with responsive design

## Performance Notes
- Search uses `useMemo` for efficient filtering
- Sorting uses `useMemo` to prevent unnecessary recalculations
- Hover state managed with local state for smooth transitions
