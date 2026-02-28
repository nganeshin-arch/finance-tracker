# CategoryManager Migration Guide

## Overview
This guide explains how to migrate from the Material-UI CategoryManager to the new shadcn/ui + Tailwind CSS version.

## Migration Steps

### Step 1: Update Import
Replace the old import with the new one:

```tsx
// Before
import { CategoryManager } from './components/CategoryManager';

// After
import { CategoryManager } from './components/CategoryManager.new';
```

### Step 2: Verify Props
The component props interface remains the same, so no changes are needed:

```tsx
interface CategoryManagerProps {
  transactionTypes: TransactionType[];
  categories: Category[];
  subCategories: SubCategory[];
  loading?: boolean;
  onAddCategory: (name: string, transactionTypeId: number) => Promise<void>;
  onUpdateCategory: (id: number, name: string) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
  onAddSubCategory: (name: string, categoryId: number) => Promise<void>;
  onUpdateSubCategory: (id: number, name: string) => Promise<void>;
  onDeleteSubCategory: (id: number) => Promise<void>;
}
```

### Step 3: Update AdminPanel
The AdminPanel.new.tsx already uses the new CategoryManager:

```tsx
import { CategoryManager } from './CategoryManager.new';

// Usage remains the same
<CategoryManager
  transactionTypes={transactionTypes}
  categories={categories}
  subCategories={subCategories}
  loading={loading}
  onAddCategory={addCategory}
  onUpdateCategory={updateCategory}
  onDeleteCategory={deleteCategory}
  onAddSubCategory={addSubCategory}
  onUpdateSubCategory={updateSubCategory}
  onDeleteSubCategory={deleteSubCategory}
/>
```

### Step 4: Test Functionality
Verify the following features work correctly:

1. **Category Management**
   - [ ] Add new category
   - [ ] Edit existing category
   - [ ] Delete category
   - [ ] Filter by transaction type

2. **Sub-Category Management**
   - [ ] Expand/collapse categories
   - [ ] Add sub-category to a category
   - [ ] Edit sub-category
   - [ ] Delete sub-category

3. **Visual Features**
   - [ ] Parent-child relationship is clearly visible
   - [ ] Hover effects work on action buttons
   - [ ] Expand/collapse animations are smooth
   - [ ] Cards have hover effects

4. **Responsive Design**
   - [ ] Layout adapts on mobile devices
   - [ ] Buttons are appropriately sized
   - [ ] Touch targets are adequate (44x44px minimum)

5. **Error Handling**
   - [ ] Validation errors display correctly
   - [ ] API errors are shown to users
   - [ ] Loading states work properly

6. **Accessibility**
   - [ ] Keyboard navigation works
   - [ ] Screen reader announcements are correct
   - [ ] Focus indicators are visible
   - [ ] ARIA labels are present

## Key Features

### Visual Hierarchy
The new component uses visual cues to show parent-child relationships:
- Left border on sub-category section
- Indentation for sub-categories
- Chevron icons for expand/collapse
- Different text sizes and weights

### Hover-Reveal Actions
Sub-category action buttons appear only on hover to reduce visual clutter:
```tsx
<div className="opacity-0 group-hover:opacity-100 transition-opacity">
  <Button>Edit</Button>
  <Button>Delete</Button>
</div>
```

### Responsive Layout
The component adapts to different screen sizes:
- Mobile: Stacked layout, full-width buttons
- Desktop: Horizontal layout, auto-width buttons

### Color-Coded Actions
- Blue: Edit actions
- Red: Delete actions
- Gray: Neutral elements

## Common Issues and Solutions

### Issue 1: Icons Not Displaying
**Problem**: Lucide icons not showing up
**Solution**: Ensure lucide-react is installed:
```bash
npm install lucide-react
```

### Issue 2: Styles Not Applied
**Problem**: Tailwind classes not working
**Solution**: Verify Tailwind is configured and the component path is in the content array:
```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // ...
}
```

### Issue 3: Dialog Not Opening
**Problem**: Dialog doesn't open when clicking buttons
**Solution**: Ensure shadcn/ui Dialog component is properly installed:
```bash
npx shadcn-ui@latest add dialog
```

### Issue 4: Select Dropdown Issues
**Problem**: Select dropdown not working properly
**Solution**: Verify Select component is installed:
```bash
npx shadcn-ui@latest add select
```

## Performance Considerations

The new component offers better performance:
1. **Smaller Bundle**: No Material-UI dependency (~300KB savings)
2. **Faster Rendering**: Lighter components
3. **Optimized Animations**: CSS transitions instead of JS animations
4. **Better Tree-Shaking**: Tailwind purges unused styles

## Rollback Plan

If issues arise, you can quickly rollback:

1. Revert the import in AdminPanel:
```tsx
import { CategoryManager } from './CategoryManager';
```

2. Keep both files until migration is verified:
- `CategoryManager.tsx` (old)
- `CategoryManager.new.tsx` (new)

3. Once verified, remove the old file:
```bash
rm frontend/src/components/CategoryManager.tsx
mv frontend/src/components/CategoryManager.new.tsx frontend/src/components/CategoryManager.tsx
```

## Next Steps

After successful migration:
1. Update any other components that import CategoryManager
2. Remove Material-UI dependencies if no longer needed
3. Update documentation
4. Train team on new component patterns
