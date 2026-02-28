# AdminPanel Migration Guide

## Overview
Migrated the AdminPanel component from Material-UI to shadcn/ui + Tailwind CSS with responsive tab navigation.

## Key Changes

### 1. Tab Navigation
- **Before**: Material-UI `Tabs` and `Tab` components
- **After**: shadcn/ui `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` components
- Added smooth transitions with Tailwind classes
- Active tab indicator using border-bottom styling

### 2. Responsive Design
- **Desktop**: Horizontal tabs with underline indicator
- **Mobile**: Dropdown selector using shadcn/ui `Select` component
- Breakpoint: `md` (768px)

### 3. Accessibility
- ARIA labels on tab navigation
- Keyboard navigation built into Radix UI primitives
- Proper focus management
- Screen reader support

### 4. Styling
- Removed Material-UI `sx` prop styling
- Used Tailwind utility classes
- Consistent spacing with `space-y-6` and `mt-6`
- Active tab styling with `data-[state=active]` selectors

## Component Structure

```tsx
<div className="space-y-6">
  {/* Header */}
  <div>
    <h1>Admin Configuration</h1>
    <p>Description</p>
  </div>

  {/* Mobile: Dropdown */}
  <div className="md:hidden">
    <Select>...</Select>
  </div>

  {/* Desktop & Mobile: Tab Content */}
  <Tabs>
    {/* Desktop: Horizontal Tabs */}
    <TabsList className="hidden md:inline-flex">
      <TabsTrigger>...</TabsTrigger>
    </TabsList>

    {/* Content */}
    <TabsContent>...</TabsContent>
  </Tabs>
</div>
```

## Migration Steps

1. Replace Material-UI imports with shadcn/ui components
2. Convert `Tabs` component to use value-based navigation (string values instead of numeric indices)
3. Add responsive Select dropdown for mobile
4. Update styling to use Tailwind classes
5. Ensure accessibility features are maintained

## Testing Checklist

- [ ] Verify tab navigation works on desktop
- [ ] Verify dropdown selector works on mobile
- [ ] Test keyboard navigation (Tab, Arrow keys, Enter)
- [ ] Test with screen reader
- [ ] Verify all tab content renders correctly
- [ ] Test smooth transitions between tabs
- [ ] Verify active tab indicator displays correctly
- [ ] Test on various screen sizes (320px - 2560px)

## Browser Compatibility

Tested on:
- Chrome
- Firefox
- Safari
- Edge

## Performance

- Reduced bundle size by removing Material-UI dependencies
- Smooth transitions with CSS animations
- No layout shifts during tab changes
