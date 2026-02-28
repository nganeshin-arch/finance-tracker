# DateRangeFilter Visual Design Guide

## Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Filter by Date Range                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Start Date                    End Date                     │
│  ┌──────────────────────┐     ┌──────────────────────┐     │
│  │ 📅 Pick a date       │     │ 📅 Pick a date       │     │
│  └──────────────────────┘     └──────────────────────┘     │
│                                                              │
│  ┌────────┐  ┌────────┐                                    │
│  │ Apply  │  │ Clear  │                                    │
│  └────────┘  └────────┘                                    │
│                                                              │
│  Quick Select:                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │This Month│ │Last Month│ │Last 3 Mo.│ │Last 6 Mo.│     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│  ┌──────────┐                                              │
│  │This Year │                                              │
│  └──────────┘                                              │
└─────────────────────────────────────────────────────────────┘
```

## Calendar Popup

When clicking on a date picker button:

```
┌──────────────────────────┐
│    January 2024          │
│  ◀                    ▶  │
├──────────────────────────┤
│ Su Mo Tu We Th Fr Sa     │
│     1  2  3  4  5  6     │
│  7  8  9 10 11 12 13     │
│ 14 15 [16]17 18 19 20    │  ← Selected date
│ 21 22 23 24 25 26 27     │
│ 28 29 30 31              │
└──────────────────────────┘
```

## Color Scheme

### Light Mode
- **Background**: White (`bg-white`)
- **Border**: Light gray (`border-gray-200`)
- **Text**: Dark gray (`text-gray-900`)
- **Primary Accent**: Blue (`text-blue-600`)
- **Error**: Red (`bg-red-50`, `text-red-800`)
- **Hover**: Light blue (`hover:bg-blue-50`)

### Dark Mode
- **Background**: Dark gray (`dark:bg-gray-800`)
- **Border**: Dark gray (`dark:border-gray-700`)
- **Text**: Light gray (`dark:text-gray-100`)
- **Primary Accent**: Light blue (`dark:text-blue-400`)
- **Error**: Dark red (`dark:bg-red-900/20`, `dark:text-red-200`)
- **Hover**: Dark blue (`dark:hover:bg-blue-900/20`)

## Interactive States

### Date Picker Button States

**Default (No date selected)**
```
┌──────────────────────┐
│ 📅 Pick a date       │  ← Muted text color
└──────────────────────┘
```

**With Date Selected**
```
┌──────────────────────┐
│ 📅 January 16, 2024  │  ← Normal text color
└──────────────────────┘
```

**Hover**
```
┌──────────────────────┐
│ 📅 January 16, 2024  │  ← Light background
└──────────────────────┘
```

### Apply Button States

**Disabled (No dates selected)**
```
┌────────┐
│ Apply  │  ← Grayed out, not clickable
└────────┘
```

**Enabled**
```
┌────────┐
│ Apply  │  ← Blue background, white text
└────────┘
```

**Hover**
```
┌────────┐
│ Apply  │  ← Darker blue background
└────────┘
```

### Quick Filter Button States

**Default**
```
┌──────────┐
│This Month│  ← White background, border
└──────────┘
```

**Hover**
```
┌──────────┐
│This Month│  ← Light blue background
└──────────┘
```

## Error State

When validation fails:

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Filter by Date Range                                    │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ⚠ End date must be on or after start date            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Start Date                    End Date                     │
│  ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Layouts

### Mobile (< 640px)

```
┌─────────────────────────┐
│  🔍 Filter by Date Range│
├─────────────────────────┤
│  Start Date             │
│  ┌───────────────────┐  │
│  │ 📅 Pick a date    │  │
│  └───────────────────┘  │
│                         │
│  End Date               │
│  ┌───────────────────┐  │
│  │ 📅 Pick a date    │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │      Apply        │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │      Clear        │  │
│  └───────────────────┘  │
│                         │
│  Quick Select:          │
│  ┌─────────┐           │
│  │This Mo. │           │
│  └─────────┘           │
│  ┌─────────┐           │
│  │Last Mo. │           │
│  └─────────┘           │
│  ...                   │
└─────────────────────────┘
```

### Tablet/Desktop (≥ 640px)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Filter by Date Range                                    │
├─────────────────────────────────────────────────────────────┤
│  Start Date          End Date                               │
│  ┌────────────┐     ┌────────────┐  ┌──────┐  ┌──────┐   │
│  │📅 Pick date│     │📅 Pick date│  │Apply │  │Clear │   │
│  └────────────┘     └────────────┘  └──────┘  └──────┘   │
│                                                              │
│  Quick Select:                                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                      │
│  │This│ │Last│ │L3M │ │L6M │ │Year│                      │
│  └────┘ └────┘ └────┘ └────┘ └────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Spacing and Sizing

### Container
- **Padding**: 16px on mobile (`p-4`), 24px on desktop (`md:p-6`)
- **Margin Bottom**: 24px (`mb-6`)
- **Border Radius**: 8px (`rounded-lg`)

### Elements
- **Gap between date pickers**: 12px (`gap-3`)
- **Gap between buttons**: 8px (`gap-2`)
- **Icon size**: 16px × 16px (`h-4 w-4`)
- **Header icon size**: 20px × 20px (`h-5 w-5`)

### Typography
- **Header**: 18px, semibold (`text-lg font-semibold`)
- **Labels**: 14px, medium (`text-sm font-medium`)
- **Error text**: 14px (`text-sm`)
- **Quick select label**: 14px (`text-sm`)

## Accessibility Features

### Visual Indicators
- **Focus Ring**: Blue outline on focused elements
- **Hover State**: Background color change
- **Disabled State**: Reduced opacity and cursor change

### Screen Reader Support
- Labels properly associated with inputs
- ARIA labels on calendar navigation
- Error messages announced to screen readers

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys in calendar
- Escape to close popovers

## Animation and Transitions

### Popover Animation
- **Open**: Fade in + zoom in (200ms)
- **Close**: Fade out + zoom out (200ms)

### Button Hover
- **Transition**: All properties (150ms)
- **Effect**: Background color change

### Quick Filter Buttons
- **Transition**: Colors (150ms)
- **Effect**: Background and border color change

## Design Tokens

### Colors
```css
Primary Blue:
- Light: #3B82F6 (blue-600)
- Hover: #EFF6FF (blue-50)
- Dark: #60A5FA (blue-400)

Error Red:
- Light: #FEF2F2 (red-50)
- Text: #991B1B (red-800)
- Dark: #7F1D1D (red-900/20)

Neutral Gray:
- Border: #E5E7EB (gray-200)
- Text: #111827 (gray-900)
- Muted: #6B7280 (gray-600)
```

### Shadows
```css
Card Shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)
```

### Border Radius
```css
Container: 8px (rounded-lg)
Buttons: 6px (rounded-md)
```

## Best Practices

1. **Always provide labels** for date pickers
2. **Show clear error messages** when validation fails
3. **Disable Apply button** when dates are not selected
4. **Provide quick filters** for common use cases
5. **Make touch targets** at least 44px × 44px on mobile
6. **Support keyboard navigation** throughout
7. **Test with screen readers** to ensure accessibility
8. **Provide visual feedback** for all interactions

## Common Use Cases

### Use Case 1: Quick Monthly Filter
1. User clicks "This Month" button
2. Dates are automatically set and applied
3. Filter is immediately active

### Use Case 2: Custom Date Range
1. User clicks "Pick a date" for start date
2. Calendar opens, user selects date
3. User clicks "Pick a date" for end date
4. Calendar opens, user selects date
5. User clicks "Apply" button
6. Filter is applied

### Use Case 3: Clear Filter
1. User clicks "Clear" button
2. All dates are reset
3. Filter is removed
4. All transactions are shown

## Integration Example

```tsx
// In TransactionsPage.tsx
<DateRangeFilter
  onFilterChange={(start, end) => {
    setFilters({ startDate: start, endDate: end });
  }}
  onClear={() => {
    setFilters({});
  }}
/>
```

## Testing Checklist

Visual Testing:
- [ ] Component renders correctly in light mode
- [ ] Component renders correctly in dark mode
- [ ] Calendar popup appears correctly
- [ ] Error messages display correctly
- [ ] All buttons have proper hover states
- [ ] Layout is responsive on mobile
- [ ] Layout is responsive on tablet
- [ ] Layout is responsive on desktop

Functional Testing:
- [ ] Quick filters set correct date ranges
- [ ] Manual date selection works
- [ ] Validation prevents invalid date ranges
- [ ] Apply button is disabled when appropriate
- [ ] Clear button resets all state
- [ ] Callbacks are called with correct parameters

Accessibility Testing:
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Screen reader announces changes
- [ ] ARIA labels are present
- [ ] Color contrast meets WCAG AA standards
