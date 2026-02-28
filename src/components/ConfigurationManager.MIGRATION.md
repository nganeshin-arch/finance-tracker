# ConfigurationManager Migration Guide

## Overview
This document outlines the migration of ConfigurationManager from Material-UI to shadcn/ui + Tailwind CSS.

## Key Changes

### 1. Component Library Migration
- **Before**: Material-UI components (Paper, List, ListItem, Dialog, etc.)
- **After**: shadcn/ui components (Card, Dialog, Button, Input, Label)

### 2. Styling Approach
- **Before**: MUI's `sx` prop and theme-based styling
- **After**: Tailwind CSS utility classes

### 3. Layout Changes
- **Before**: Material-UI List with ListItems
- **After**: Responsive grid of Cards with hover effects

### 4. Visual Enhancements
- Card-based layout with hover effects (scale and shadow)
- Hover-reveal delete buttons on each card
- Improved spacing and responsive grid (1 column mobile, 2 columns tablet, 3 columns desktop)
- Modern color scheme with red accent for delete actions

### 5. Form Validation
- Visual feedback for required fields (red asterisk)
- Error state styling with red border on invalid inputs
- Inline error messages with red background

### 6. Accessibility Improvements
- Proper ARIA labels on all interactive elements
- Required field indicators
- Keyboard navigation support (Enter key to submit)
- Screen reader friendly error messages

## Component Comparison

### Header Section
```tsx
// Before (Material-UI)
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
  <Typography variant="h6">{title}</Typography>
  <Button variant="contained" startIcon={<AddIcon />}>Add New</Button>
</Box>

// After (Tailwind + shadcn/ui)
<div className="flex justify-between items-center">
  <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
  <Button className="gap-2">
    <Plus className="h-4 w-4" />
    Add New
  </Button>
</div>
```

### Item List
```tsx
// Before (Material-UI)
<Paper>
  <List>
    {items.map((item) => (
      <ListItem
        key={item.id}
        secondaryAction={
          <IconButton onClick={() => handleOpenDeleteDialog(item)}>
            <DeleteIcon />
          </IconButton>
        }
      >
        <ListItemText primary={item.name} />
      </ListItem>
    ))}
  </List>
</Paper>

// After (Tailwind + shadcn/ui)
<div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <Card
      key={item.id}
      className="group transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
    >
      <CardContent className="p-4 flex justify-between items-center">
        <span className="font-medium text-gray-900">{item.name}</span>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  ))}
</div>
```

### Dialog
```tsx
// Before (Material-UI)
<Dialog open={addDialogOpen} onClose={handleCloseAddDialog}>
  <DialogTitle>Add New {title}</DialogTitle>
  <DialogContent>
    <TextField
      label="Name"
      value={newItemName}
      onChange={(e) => setNewItemName(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseAddDialog}>Cancel</Button>
    <Button onClick={handleAdd}>Add</Button>
  </DialogActions>
</Dialog>

// After (Tailwind + shadcn/ui)
<Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Add New {title}</DialogTitle>
      <DialogDescription>Enter a name for the new item.</DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={handleCloseAddDialog}>Cancel</Button>
      <Button onClick={handleAdd}>Add</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Responsive Behavior

### Breakpoints
- **Mobile (< 640px)**: Single column layout
- **Tablet (640px - 1024px)**: 2 column grid
- **Desktop (> 1024px)**: 3 column grid

### Dialog Responsiveness
- Dialogs are constrained to max-width of 425px
- Full-width on mobile devices
- Proper padding and spacing at all sizes

## Usage

The new component maintains the same API as the original:

```tsx
<ConfigurationManager
  title="Transaction Types"
  items={transactionTypes}
  loading={loading}
  onAdd={handleAdd}
  onDelete={handleDelete}
/>
```

## Migration Steps

1. Replace the import:
   ```tsx
   // Before
   import { ConfigurationManager } from './components/ConfigurationManager';
   
   // After
   import { ConfigurationManager } from './components/ConfigurationManager.new';
   ```

2. No changes needed to component usage - the API remains the same

3. Test all functionality:
   - Adding new items
   - Deleting items
   - Form validation
   - Responsive behavior
   - Accessibility features

## Benefits

1. **Smaller Bundle Size**: Removed Material-UI dependency
2. **Better Performance**: Lighter components with Tailwind CSS
3. **Modern Design**: Card-based layout with smooth animations
4. **Improved UX**: Hover effects and visual feedback
5. **Better Accessibility**: Enhanced ARIA labels and keyboard navigation
6. **Responsive**: Optimized for all screen sizes
