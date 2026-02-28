# TransactionForm Component

## Overview

The TransactionForm component is a modern, accessible form for creating and editing financial transactions. It has been migrated from Material-UI to shadcn/ui + Tailwind CSS as part of the UI modernization effort.

## Features

### 🎨 Visual Design
- **Pill-Style Transaction Type Selector**: Color-coded buttons (Income=Green, Expense=Red, Neutral=Blue)
- **Calendar Date Picker**: Visual calendar with popover for intuitive date selection
- **Responsive Layout**: 2-column grid on desktop, single column on mobile
- **Modern Styling**: Tailwind CSS with consistent spacing and typography
- **Smooth Animations**: Transitions on hover, focus, and state changes

### ♿ Accessibility
- **WCAG AA Compliant**: Color contrast ratios meet accessibility standards
- **ARIA Labels**: All inputs have descriptive labels and roles
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Reader Support**: Error messages announced with role="alert"
- **Touch Targets**: Minimum 44x44px for mobile accessibility
- **Required Field Indicators**: Visual asterisks for required fields

### 🔧 Functionality
- **Form Validation**: Yup schema validation with clear error messages
- **Dependent Selects**: Category filtered by transaction type, sub-category by category
- **Loading States**: Animated spinner during form submission
- **Error Handling**: Comprehensive error display with red color scheme
- **Edit Mode**: Pre-fills form when editing existing transactions
- **Cancel Support**: Allows users to cancel form submission

## Usage

### Basic Usage

```tsx
import { TransactionForm } from './components/TransactionForm.new';
import { CreateTransactionDTO } from './types';

function MyComponent() {
  const handleSubmit = async (data: CreateTransactionDTO) => {
    // Save transaction
    await transactionService.create(data);
  };

  const handleCancel = () => {
    // Handle cancel
    navigate('/transactions');
  };

  return (
    <TransactionForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
```

### Edit Mode

```tsx
import { TransactionForm } from './components/TransactionForm.new';
import { Transaction, CreateTransactionDTO } from './types';

function EditTransaction({ transaction }: { transaction: Transaction }) {
  const handleSubmit = async (data: CreateTransactionDTO) => {
    // Update transaction
    await transactionService.update(transaction.id, data);
  };

  const handleCancel = () => {
    navigate('/transactions');
  };

  return (
    <TransactionForm
      transaction={transaction}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
```

## Props

```typescript
interface TransactionFormProps {
  transaction?: Transaction;           // Optional: For edit mode
  onSubmit: (data: CreateTransactionDTO) => Promise<void>;  // Required: Submit handler
  onCancel: () => void;                // Required: Cancel handler
}
```

### transaction (optional)
- **Type**: `Transaction`
- **Description**: Existing transaction to edit. If provided, form will pre-fill with transaction data.
- **Default**: `undefined` (create mode)

### onSubmit (required)
- **Type**: `(data: CreateTransactionDTO) => Promise<void>`
- **Description**: Async function called when form is submitted. Receives validated form data.
- **Parameters**:
  - `data`: Validated transaction data matching CreateTransactionDTO schema

### onCancel (required)
- **Type**: `() => void`
- **Description**: Function called when user clicks cancel button.

## Form Fields

### Transaction Type (Required)
- **Type**: Pill-style button group
- **Options**: Loaded from ConfigContext (transactionTypes)
- **Validation**: Must select a type
- **Color Coding**:
  - Income: Green (bg-income-500)
  - Expense: Red (bg-expense-500)
  - Neutral: Blue (bg-neutral-500)

### Transaction Date (Required)
- **Type**: Calendar picker with popover
- **Format**: 'PPP' (e.g., "January 1, 2024")
- **Default**: Today's date
- **Validation**: Must select a date

### Amount (Required)
- **Type**: Number input
- **Format**: Decimal with 2 places (0.01 step)
- **Validation**: Must be positive number
- **Placeholder**: "0.00"

### Category (Required)
- **Type**: Select dropdown
- **Options**: Filtered by selected transaction type
- **Validation**: Must select a category
- **Behavior**: Resets when transaction type changes

### Sub-Category (Required)
- **Type**: Select dropdown
- **Options**: Filtered by selected category
- **Validation**: Must select a sub-category
- **Behavior**: Resets when category changes

### Payment Mode (Required)
- **Type**: Select dropdown
- **Options**: Loaded from ConfigContext (paymentModes)
- **Validation**: Must select a payment mode

### Account (Required)
- **Type**: Select dropdown
- **Options**: Loaded from ConfigContext (accounts)
- **Validation**: Must select an account

### Description (Optional)
- **Type**: Textarea
- **Rows**: 3
- **Validation**: None (optional field)
- **Placeholder**: "Add a description..."

## Validation

The form uses Yup schema validation:

```typescript
const transactionSchema = yup.object({
  date: yup.string().required('Date is required'),
  transactionTypeId: yup.number().required('Transaction type is required').positive(),
  categoryId: yup.number().required('Category is required').positive(),
  subCategoryId: yup.number().required('Sub-category is required').positive(),
  paymentModeId: yup.number().required('Payment mode is required').positive(),
  accountId: yup.number().required('Account is required').positive(),
  amount: yup.number()
    .required('Amount is required')
    .positive('Amount must be a positive number')
    .typeError('Amount must be a valid number'),
  description: yup.string().optional(),
});
```

## Error Handling

### Field Errors
- **Visual**: Red border on input (border-expense-500)
- **Focus**: Red focus ring (focus-visible:ring-expense-500)
- **Message**: Red text below field (text-expense-600)
- **Accessibility**: role="alert" on error messages

### Submit Errors
- **Visual**: Alert box at top of form
- **Background**: Light red (bg-expense-50)
- **Border**: Red (border-expense-200)
- **Text**: Dark red (text-expense-800)
- **Accessibility**: role="alert"

### Required Fields
- **Visual**: Red asterisk (*) after label
- **Color**: text-expense-500
- **Accessibility**: aria-required="true"

## Loading States

### During Submission
- **Button**: Shows spinning Loader2 icon
- **Text**: Changes to "Saving..."
- **State**: All interactive elements disabled
- **Accessibility**: aria-label updated

### During Config Load
- **Display**: Loading component with message
- **Message**: "Loading form data..."
- **Behavior**: Form hidden until config loaded

## Responsive Design

### Mobile (< 768px)
- Single column layout (grid-cols-1)
- Full-width fields
- Stacked buttons (flex-col)
- Touch-friendly targets (min-h-[44px])

### Desktop (≥ 768px)
- Two-column grid (md:grid-cols-2)
- Side-by-side fields
- Horizontal buttons (sm:flex-row)
- Optimized spacing

### All Screens
- Description field spans full width
- Transaction type pills wrap as needed
- Consistent gap-4 spacing
- Proper padding and margins

## Dependencies

### Required Packages
```json
{
  "react-hook-form": "^7.49.2",
  "@hookform/resolvers": "^3.3.2",
  "yup": "^1.3.3",
  "date-fns": "^3.0.6",
  "react-day-picker": "^latest",
  "@radix-ui/react-popover": "^latest",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-label": "^2.1.8",
  "lucide-react": "^0.575.0"
}
```

### UI Components Used
- Button (shadcn/ui)
- Input (shadcn/ui)
- Label (shadcn/ui)
- Select (shadcn/ui)
- Calendar (shadcn/ui)
- Popover (shadcn/ui)
- Loading (custom)

### Contexts Used
- ConfigContext: For transaction types, categories, sub-categories, payment modes, accounts

## Styling

### Color Palette
```css
/* Income */
--income-500: #22c55e;
--income-600: #16a34a;

/* Expense */
--expense-50: #fef2f2;
--expense-200: #fecaca;
--expense-500: #ef4444;
--expense-600: #dc2626;
--expense-800: #991b1b;

/* Neutral */
--neutral-500: #3b82f6;
--neutral-600: #2563eb;
```

### Spacing
- Form container: `mt-4 space-y-6`
- Field groups: `space-y-2`
- Grid gap: `gap-4`
- Button gap: `gap-3`

### Typography
- Labels: `text-sm font-medium`
- Inputs: `text-sm`
- Errors: `text-sm`
- Placeholders: `text-muted-foreground`

## Performance

### Bundle Size
- Material-UI version: ~380KB
- New version: ~70KB
- **Savings: ~310KB (82% reduction)**

### Optimizations
- Tailwind CSS (build-time, purged)
- Radix UI primitives (tree-shakeable)
- No runtime CSS-in-JS
- Efficient re-renders with React Hook Form

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing

See `TransactionForm.MIGRATION.md` for testing checklist.

## Migration Notes

See `TransactionForm.COMPARISON.md` for detailed before/after comparison.

## Example

See `frontend/src/examples/TransactionFormExample.tsx` for a complete working example.

## Support

For issues or questions, refer to:
- `TransactionForm.MIGRATION.md` - Migration guide
- `TransactionForm.COMPARISON.md` - Before/after comparison
- `TransactionForm.SUMMARY.md` - Implementation summary
- `frontend/src/examples/TransactionFormExample.tsx` - Working example
