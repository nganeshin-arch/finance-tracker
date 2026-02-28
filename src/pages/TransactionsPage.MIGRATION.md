# TransactionsPage Migration Guide

## Overview
This document outlines the migration of the TransactionsPage from Material-UI to Tailwind CSS + shadcn/ui components.

## Changes Made

### 1. Layout Components Replaced

#### Material-UI → Tailwind
- `Container maxWidth="xl"` → `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`
- `Box sx={{ py: 4 }}` → `<div className="py-6 md:py-8">`
- `Box sx={{ display: 'flex', justifyContent: 'space-between' }}` → `<div className="flex items-center justify-between">`

### 2. Page Header with Action Buttons

**Before (Material-UI):**
```tsx
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
  <Typography variant="h4" component="h1">
    Transactions
  </Typography>
  <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDrawer}>
    Add Transaction
  </Button>
</Box>
```

**After (Tailwind + shadcn/ui):**
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
      Transactions
    </h1>
    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
      Manage your income and expenses
    </p>
  </div>
  <Button onClick={handleOpenDrawer} className="w-full sm:w-auto h-11 shadow-sm">
    <Plus className="h-5 w-5 mr-2" />
    Add Transaction
  </Button>
</div>
```

### 3. Error Alert

**Before (Material-UI):**
```tsx
<Alert severity="error" sx={{ mb: 3 }} role="alert">
  {error}
</Alert>
```

**After (Tailwind):**
```tsx
<div className="mb-6 rounded-lg bg-expense-50 dark:bg-expense-950/30 border border-expense-200 dark:border-expense-800 p-4" role="alert">
  <div className="flex">
    <div className="flex-shrink-0">
      <svg className="h-5 w-5 text-expense-600 dark:text-expense-400" viewBox="0 0 20 20" fill="currentColor">
        {/* Error icon SVG */}
      </svg>
    </div>
    <div className="ml-3">
      <h3 className="text-sm font-medium text-expense-800 dark:text-expense-200">
        Error loading transactions
      </h3>
      <div className="mt-2 text-sm text-expense-700 dark:text-expense-300">
        <p>{error}</p>
      </div>
    </div>
  </div>
</div>
```

### 4. Drawer → Sheet Component

**Before (Material-UI Drawer):**
```tsx
<Drawer
  anchor="right"
  open={drawerOpen}
  onClose={handleCloseDrawer}
  PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, p: 3 } }}
>
  <Typography variant="h5" gutterBottom>
    {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
  </Typography>
  <TransactionForm ... />
</Drawer>
```

**After (shadcn/ui Sheet):**
```tsx
<Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
  <SheetContent
    side="right"
    className="w-full sm:max-w-[540px] overflow-y-auto"
  >
    <SheetHeader>
      <SheetTitle>
        {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      </SheetTitle>
    </SheetHeader>
    <TransactionForm ... />
  </SheetContent>
</Sheet>
```

### 5. Confirm Dialog

**Before (Custom ConfirmDialog with Material-UI):**
```tsx
<ConfirmDialog
  open={confirmState.open}
  title={confirmState.title}
  message={confirmState.message}
  confirmText={confirmState.confirmText}
  cancelText={confirmState.cancelText}
  severity={confirmState.severity}
  onConfirm={confirmState.onConfirm}
  onCancel={handleCancel}
/>
```

**After (shadcn/ui Dialog):**
```tsx
<Dialog open={confirmState.open} onOpenChange={(open) => !open && handleCancel()}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        {confirmState.severity === 'error' && <WarningIcon />}
        {confirmState.title}
      </DialogTitle>
      <DialogDescription>
        {confirmState.message}
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={handleCancel}>
        {confirmState.cancelText}
      </Button>
      <Button
        variant={confirmState.severity === 'error' ? 'destructive' : 'default'}
        onClick={confirmState.onConfirm}
      >
        {confirmState.confirmText}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 6. Notifications

**Before (useNotification hook):**
```tsx
const { showSuccess, showError } = useNotification();
showSuccess('Transaction created successfully');
showError(getErrorMessage(err));
```

**After (useToast hook):**
```tsx
const { toast } = useToast();
toast({
  title: 'Success',
  description: 'Transaction created successfully',
  variant: 'default',
});
toast({
  title: 'Error',
  description: getErrorMessage(err),
  variant: 'error',
});
```

## Responsive Design Improvements

### Mobile-First Approach
- Header stacks vertically on mobile: `flex-col sm:flex-row`
- Add Transaction button is full-width on mobile: `w-full sm:w-auto`
- Proper spacing adjustments: `py-6 md:py-8`
- Touch-friendly button sizes: `h-11`

### Breakpoints Used
- `sm:` (640px) - Small devices
- `md:` (768px) - Medium devices
- `lg:` (1024px) - Large devices

## Accessibility Enhancements

1. **Semantic HTML**: Using proper heading hierarchy (`h1`, `h2`)
2. **ARIA Labels**: All interactive elements have proper labels
3. **Role Attributes**: Alert regions properly marked
4. **Focus Management**: Sheet and Dialog components handle focus automatically
5. **Screen Reader Support**: Descriptive text for all actions

## Dark Mode Support

All components now support dark mode using Tailwind's `dark:` variant:
- Background colors: `bg-gray-50 dark:bg-gray-950`
- Text colors: `text-gray-900 dark:text-white`
- Border colors: `border-gray-200 dark:border-gray-800`

## New Components Added

1. **Sheet Component** (`frontend/src/components/ui/sheet.tsx`)
   - Replaces Material-UI Drawer
   - Built with Radix UI Dialog primitive
   - Supports slide-in animations from all sides
   - Responsive width handling

## Requirements Addressed

- **4.1-4.5**: All existing functionality preserved
- **6.1-6.5**: Fully responsive design with proper breakpoints
- **7.1-7.5**: Accessibility compliance maintained

## Testing Checklist

- [ ] Page loads without errors
- [ ] Add Transaction button opens drawer
- [ ] Transaction form works in drawer
- [ ] Edit transaction opens drawer with data
- [ ] Delete confirmation dialog works
- [ ] Date range filter works
- [ ] Transaction list displays correctly
- [ ] Error messages display properly
- [ ] Toast notifications appear
- [ ] Responsive layout works on mobile
- [ ] Dark mode works correctly
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility

## Migration Steps

1. Install Sheet component dependencies (already included in @radix-ui/react-dialog)
2. Create Sheet component at `frontend/src/components/ui/sheet.tsx`
3. Create new TransactionsPage at `frontend/src/pages/TransactionsPage.new.tsx`
4. Test thoroughly
5. Replace old file: `mv TransactionsPage.new.tsx TransactionsPage.tsx`
6. Remove Material-UI imports

## Notes

- The Sheet component uses the same Radix UI Dialog primitive as the Dialog component
- Toast notifications are more flexible than the old notification system
- The page now has a proper background color for better visual hierarchy
- All spacing follows Tailwind's spacing scale for consistency
