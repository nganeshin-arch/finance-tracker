# UI Components Usage Guide

## Loading Components

### Basic Loading Spinner

```tsx
import { Loading } from '@/components/ui';

// Default loading
<Loading />

// With custom message
<Loading message="Loading data..." />

// Different sizes
<Loading size="sm" />
<Loading size="md" />
<Loading size="lg" />

// Full screen loading
<Loading fullScreen message="Initializing application..." />
```

### Skeleton Loading Components

```tsx
import { 
  Skeleton, 
  CardSkeleton, 
  TableRowSkeleton, 
  ChartSkeleton, 
  ListSkeleton 
} from '@/components/ui';

// Basic skeleton
<Skeleton className="h-4 w-32" />

// Card skeleton (for dashboard cards)
<CardSkeleton />

// Table row skeleton
<TableRowSkeleton />

// Chart skeleton
<ChartSkeleton />

// List skeleton with custom number of items
<ListSkeleton items={3} />
```

## Toast Notifications

### Setup

Add the Toaster component to your app root (usually in App.tsx):

```tsx
import { Toaster } from '@/components/ui';

function App() {
  return (
    <>
      {/* Your app content */}
      <Toaster />
    </>
  );
}
```

### Using Toast Notifications

```tsx
import { useToastNotification } from '@/hooks/useToastNotification';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToastNotification();

  const handleSuccess = () => {
    showSuccess('Transaction saved successfully!');
  };

  const handleError = () => {
    showError('Failed to save transaction. Please try again.');
  };

  const handleWarning = () => {
    showWarning('This action cannot be undone.');
  };

  const handleInfo = () => {
    showInfo('New features are available!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### Advanced Toast Usage

```tsx
import { toast } from '@/hooks/useToast';

// Custom toast with action button
toast({
  variant: 'success',
  title: 'Transaction deleted',
  description: 'The transaction has been removed.',
  action: (
    <ToastAction altText="Undo" onClick={handleUndo}>
      Undo
    </ToastAction>
  ),
});

// Programmatic dismiss
const { dismiss } = toast({
  title: 'Processing...',
  description: 'Please wait while we process your request.',
});

// Later...
dismiss();
```

## Migration from Material-UI

### Loading Component

**Before (Material-UI):**
```tsx
import { CircularProgress, Box } from '@mui/material';

<Box sx={{ display: 'flex', justifyContent: 'center' }}>
  <CircularProgress />
</Box>
```

**After (Tailwind + shadcn/ui):**
```tsx
import { Loading } from '@/components/ui';

<Loading />
```

### Notifications

**Before (notistack):**
```tsx
import { useNotification } from '@/hooks/useNotification';

const { showSuccess, showError } = useNotification();
showSuccess('Operation completed!');
```

**After (Toast):**
```tsx
import { useToastNotification } from '@/hooks/useToastNotification';

const { showSuccess, showError } = useToastNotification();
showSuccess('Operation completed!');
```

The API is identical, making migration seamless!
