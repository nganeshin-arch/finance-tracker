# DateRangeFilter Component

## Overview

The DateRangeFilter component provides a user-friendly interface for filtering transactions by date range. It includes both manual date selection via calendar popovers and quick filter buttons for common date ranges.

## Features

- **Calendar Date Picker**: Visual date selection using shadcn/ui Calendar component
- **Quick Filter Buttons**: Pre-defined date ranges (This Month, Last Month, etc.)
- **Validation**: Ensures end date is not before start date
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Dark Mode Support**: Built-in dark mode styling
- **Accessibility**: Keyboard navigation and screen reader support

## Props

```tsx
interface DateRangeFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void;
  onClear: () => void;
}
```

### `onFilterChange`
- **Type**: `(startDate: string, endDate: string) => void`
- **Description**: Callback function called when a date range is selected and applied
- **Parameters**:
  - `startDate`: ISO date string in format `yyyy-MM-dd` (e.g., "2024-01-01")
  - `endDate`: ISO date string in format `yyyy-MM-dd` (e.g., "2024-01-31")

### `onClear`
- **Type**: `() => void`
- **Description**: Callback function called when the clear button is clicked

## Usage

### Basic Usage

```tsx
import { DateRangeFilter } from '@/components/DateRangeFilter';

function TransactionsPage() {
  const handleFilterChange = (startDate: string, endDate: string) => {
    console.log('Filter applied:', startDate, endDate);
    // Apply filter to your data
  };

  const handleClear = () => {
    console.log('Filter cleared');
    // Clear filter from your data
  };

  return (
    <DateRangeFilter
      onFilterChange={handleFilterChange}
      onClear={handleClear}
    />
  );
}
```

### With State Management

```tsx
import { useState } from 'react';
import { DateRangeFilter } from '@/components/DateRangeFilter';

function TransactionsPage() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (startDate: string, endDate: string) => {
    setFilters({ startDate, endDate });
    // Fetch filtered data
    fetchTransactions({ startDate, endDate });
  };

  const handleClear = () => {
    setFilters({ startDate: '', endDate: '' });
    // Fetch all data
    fetchTransactions();
  };

  return (
    <div>
      <DateRangeFilter
        onFilterChange={handleFilterChange}
        onClear={handleClear}
      />
      {/* Your transaction list */}
    </div>
  );
}
```

## Quick Filter Options

The component provides the following quick filter buttons:

| Button | Date Range |
|--------|------------|
| This Month | First day to last day of current month |
| Last Month | First day to last day of previous month |
| Last 3 Months | First day of 2 months ago to last day of current month |
| Last 6 Months | First day of 5 months ago to last day of current month |
| This Year | January 1 to December 31 of current year |

## Validation

The component validates the following:

1. **Both dates required**: Both start and end dates must be selected before applying
2. **Date order**: End date must be on or after start date

Error messages are displayed in a red alert box above the date pickers.

## Responsive Behavior

### Mobile (< 640px)
- Date pickers stack vertically
- Action buttons take full width
- Quick filter buttons wrap to multiple rows

### Tablet (640px - 1024px)
- Date pickers display horizontally
- Action buttons display inline
- Quick filter buttons wrap as needed

### Desktop (> 1024px)
- Optimized horizontal layout
- All elements display in a single row where possible
- Quick filter buttons display in a single row

## Styling

The component uses Tailwind CSS utility classes for styling:

- **Container**: White background with border and shadow
- **Primary Color**: Blue (`text-blue-600`, `hover:bg-blue-50`)
- **Error Color**: Red (`bg-red-50`, `text-red-800`)
- **Dark Mode**: Automatic dark mode support with `dark:` variants

## Accessibility

The component follows accessibility best practices:

- **Keyboard Navigation**: Full keyboard support in calendar
- **ARIA Labels**: Proper labels on interactive elements
- **Focus Management**: Clear focus indicators
- **Screen Readers**: Compatible with screen readers

### Keyboard Shortcuts

When calendar is open:
- **Arrow Keys**: Navigate between dates
- **Enter/Space**: Select date
- **Escape**: Close calendar
- **Tab**: Navigate between elements

## Dependencies

The component requires the following packages:

- `react-day-picker`: Calendar component
- `@radix-ui/react-popover`: Popover primitive
- `date-fns`: Date manipulation and formatting
- `lucide-react`: Icons

All dependencies are included in the project's package.json.

## Examples

See `frontend/src/examples/DateRangeFilterExample.tsx` for a complete working example.

## Migration from Material-UI

If you're migrating from the Material-UI version:

1. The component API remains unchanged
2. Visual appearance is modernized
3. Date picker is now a calendar popup instead of HTML5 input
4. See `DateRangeFilter.MIGRATION.md` for detailed migration guide

## Troubleshooting

### Calendar not opening
- Ensure `@radix-ui/react-popover` is installed
- Check for z-index conflicts with other components

### Dates not formatting correctly
- Verify `date-fns` is installed
- Check that dates are valid Date objects

### Styling issues
- Ensure Tailwind CSS is properly configured
- Verify `@/lib/utils` path is correct in your project

## Related Components

- **Calendar**: `@/components/ui/calendar`
- **Popover**: `@/components/ui/popover`
- **Button**: `@/components/ui/button`

## Support

For issues or questions:
1. Check the COMPARISON.md for implementation details
2. Review the MIGRATION.md for migration guidance
3. See the example file for usage patterns
