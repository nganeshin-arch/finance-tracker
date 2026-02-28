# Performance Optimization - Import Fix

## Issue

After implementing lazy loading for CalendarView, the application failed to start with the error:

```
[plugin:vite:import-analysis] Failed to resolve import "@mui/material" from "src/components/Loading.tsx". Does the file exist?
```

## Root Cause

The `UnifiedHomePage.tsx` was importing the old Material-UI based `Loading` component:

```typescript
import { Loading } from '../components/Loading';
```

However, the project has migrated to shadcn/ui components, and there's a proper Loading component at:

```typescript
import { Loading } from '../components/ui/loading';
```

## Solution

Updated the import in `UnifiedHomePage.tsx` to use the correct shadcn/ui Loading component:

```typescript
// Before
import { Loading } from '../components/Loading';

// After
import { Loading } from '../components/ui/loading';
```

## Files Modified

- `frontend/src/pages/UnifiedHomePage.tsx` - Updated Loading import

## Verification

- [x] TypeScript errors resolved
- [x] No other files importing old Loading component
- [x] Application should now start without errors

## Note

The old `frontend/src/components/Loading.tsx` file still exists but is no longer used. It can be safely removed in a future cleanup task, but leaving it for now to avoid breaking any legacy code that might still reference it.

## Status

✅ FIXED - Application should now run without import errors
