# Task 4.2: Card Focus Management Test

## Overview

This document describes the property-based test implementation for Task 4.2: Card Focus Management, which validates Requirements 5.5 and 11.2 from the premium-ui-enhancement spec.

## Property Being Tested

**Property 16: Card Focus Management**

*For any card containing interactive elements, when navigating via keyboard, the tab order should be logical and focus indicators should be visible on all focusable elements.*

**Validates: Requirements 5.5, 11.2**

## Implementation Changes

### 1. Card Component Updates (`frontend/src/components/ui/card.tsx`)

#### Added Focus Management Features:
- **`focusable` prop**: New optional prop to make cards keyboard accessible
- **`tabIndex` attribute**: Automatically set to 0 for interactive or focusable cards
- **`role` attribute**: Set to "button" for interactive cards for proper semantics
- **Focus-within styles**: Added `focus-within:ring-2` to card variants for nested focus indication
- **Interactive variant focus**: Added explicit focus ring styles to interactive cards

#### Key Changes:
```typescript
export interface CardProps {
  interactive?: boolean
  focusable?: boolean  // NEW: Enable keyboard navigation
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, focusable, ...props }, ref) => {
    const effectiveVariant = interactive ? "interactive" : variant
    const shouldBeFocusable = focusable || interactive  // NEW
    
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant: effectiveVariant, padding, className }))}
        tabIndex={shouldBeFocusable ? 0 : undefined}  // NEW
        role={interactive ? "button" : undefined}  // NEW
        {...props}
      />
    )
  }
)
```

### 2. Global CSS Updates (`frontend/src/index.css`)

#### Added Focus Indicator Styles:
```css
/* Ensure all interactive elements within cards have visible focus indicators */
.card a:focus,
.card button:focus,
.card input:focus,
.card select:focus,
.card textarea:focus,
.card [tabindex]:focus {
  @apply outline-none ring-2 ring-ring ring-offset-2;
}

/* Card focus-within state for keyboard navigation */
.card:focus-within {
  @apply ring-2 ring-ring ring-offset-2;
}

/* Interactive card focus state */
.card[tabindex]:focus {
  @apply outline-none ring-2 ring-ring ring-offset-2;
}
```

These styles ensure:
- All focusable elements within cards have visible 2px focus rings
- Cards show focus-within state when any child element is focused
- Interactive cards themselves have focus indicators when focused directly
- 2px offset for better visibility and WCAG compliance

## Test Implementation

### Test File: `frontend/tests/card-focus-management.spec.ts`

The test suite validates the following aspects of card focus management:

### Test Cases

#### 1. **Logical Tab Order**
- **Purpose**: Verify that interactive elements within cards follow a logical tab order
- **Method**: Extract all focusable elements and validate their tabIndex values are sequential
- **Validation**: Tab order should not have negative jumps (e.g., tabIndex 3 → 1)

#### 2. **Visible Focus Indicators**
- **Purpose**: Ensure all focusable elements have visible focus indicators
- **Method**: Focus each element and check for outline or box-shadow (ring)
- **Validation**: Elements must have either:
  - Non-zero outline width
  - Box-shadow with RGB values (Tailwind ring)
  - Ring classes applied

#### 3. **Interactive Card Keyboard Accessibility**
- **Purpose**: Verify interactive cards are keyboard accessible
- **Method**: Check for tabindex attribute and ability to receive focus
- **Validation**: Interactive cards should:
  - Have tabIndex >= 0
  - Be focusable via keyboard
  - Show visible focus indicator when focused

#### 4. **Focus Indicator Contrast**
- **Purpose**: Ensure focus indicators have sufficient size for visibility
- **Method**: Measure outline width and check for ring presence
- **Validation**: Focus indicators should be at least 2px wide or use ring styles

#### 5. **Focus Indicator Offset**
- **Purpose**: Verify focus indicators have proper offset from elements
- **Method**: Check outlineOffset CSS property
- **Validation**: Offset should be >= 2px or 0 (for ring styles)

#### 6. **Comprehensive Property-Based Test**
- **Purpose**: Validate focus management across all cards with interactive elements
- **Method**: 
  - Find all cards containing focusable elements
  - Test each card for proper focus management
  - Validate tab order logic
- **Validation**: All cards should have:
  - Focusable elements or be interactive themselves
  - Logical tab order (no negative jumps)

## Running the Tests

### Prerequisites
1. Ensure the development server is running:
   ```bash
   cd frontend
   npm run dev
   ```

2. Ensure the backend is running (for authentication):
   ```bash
   cd backend
   npm run dev
   ```

### Execute Tests
```bash
cd frontend
npx playwright test card-focus-management.spec.ts --headed
```

### Run with UI Mode (Recommended for Debugging)
```bash
npx playwright test card-focus-management.spec.ts --ui
```

## Expected Results

### Success Criteria
- ✅ All cards with interactive elements have logical tab order
- ✅ All focusable elements within cards have visible focus indicators
- ✅ Interactive cards are keyboard accessible (focusable)
- ✅ Focus indicators have sufficient contrast (2px minimum)
- ✅ Focus indicators have proper offset (2px or 0 for rings)
- ✅ Comprehensive property test passes for all tested cards

### Test Output Example
```
--- Testing Card Tab Order ---
✓ [class*="rounded-xl"][0]: Logical tab order (3 focusable elements)
✓ div[class*="card"][0]: Logical tab order (2 focusable elements)

Total cards with interactive elements: 15
Cards with logical tab order: 15/15

--- Testing Focus Indicators on Card Elements ---
✓ [class*="rounded-xl"][0] button: Has visible focus indicator
✓ [class*="rounded-xl"][0] a: Has visible focus indicator

Total focusable elements tested: 45
Elements with visible focus: 45/45

--- Testing Interactive Card Keyboard Accessibility ---
✓ [class*="interactive"][0]: Keyboard accessible (tabindex="0")

Total interactive cards: 8
Keyboard accessible cards: 8/8
```

## Accessibility Compliance

This implementation ensures compliance with:

### WCAG 2.1 AA Requirements
- **2.4.3 Focus Order**: Tab order is logical and follows visual order
- **2.4.7 Focus Visible**: All focusable elements have visible focus indicators
- **2.1.1 Keyboard**: All interactive cards are keyboard accessible

### Implementation Details
- **Focus Ring**: 2px solid ring with offset for visibility
- **Focus-Within**: Cards show focus state when children are focused
- **Tab Order**: Natural DOM order with optional explicit tabIndex
- **Semantic HTML**: Interactive cards use role="button" for proper semantics

## Integration with Existing Components

### Usage Examples

#### Basic Card with Focusable Content
```tsx
<Card>
  <CardHeader>
    <CardTitle>Transaction Details</CardTitle>
  </CardHeader>
  <CardContent>
    <button>Edit</button>
    <button>Delete</button>
  </CardContent>
</Card>
```
- Focus indicators automatically applied to buttons
- Card shows focus-within state when buttons are focused

#### Interactive Card
```tsx
<Card interactive onClick={handleClick}>
  <CardHeader>
    <CardTitle>Click Me</CardTitle>
  </CardHeader>
  <CardContent>
    <p>This entire card is clickable and keyboard accessible</p>
  </CardContent>
</Card>
```
- Card is focusable (tabIndex=0)
- Shows focus ring when focused
- Has role="button" for screen readers

#### Explicitly Focusable Card
```tsx
<Card focusable>
  <CardHeader>
    <CardTitle>Keyboard Navigable</CardTitle>
  </CardHeader>
  <CardContent>
    <p>This card can receive keyboard focus</p>
  </CardContent>
</Card>
```
- Card is focusable even without interactive prop
- Useful for keyboard navigation patterns

## Troubleshooting

### Common Issues

#### 1. Focus Indicators Not Visible
**Symptom**: Elements don't show focus ring when focused
**Solution**: 
- Check that global CSS is loaded
- Verify Tailwind ring utilities are available
- Ensure no conflicting outline:none styles

#### 2. Tab Order Issues
**Symptom**: Tab order jumps unexpectedly
**Solution**:
- Avoid explicit tabIndex values > 0
- Use natural DOM order
- Check for hidden elements with tabIndex

#### 3. Interactive Cards Not Focusable
**Symptom**: Interactive cards can't receive keyboard focus
**Solution**:
- Ensure `interactive` or `focusable` prop is set
- Check that tabIndex is not overridden
- Verify no pointer-events:none styles

## Next Steps

After this task is complete:
1. ✅ Card component has proper focus management
2. ✅ All focusable elements have visible indicators
3. ✅ Tab order is logical and accessible
4. → Continue to Task 5.1: Enhanced Input components
5. → Integrate focus management patterns across all components

## Related Requirements

- **Requirement 5.5**: Cards with interactive elements ensure proper focus management
- **Requirement 11.2**: Visible focus indicators on all interactive elements
- **Property 16**: Card Focus Management property validation
- **Property 35**: Focus Indicator Visibility across all interactive elements

## Notes

- Focus management is critical for keyboard-only users
- All interactive elements must be keyboard accessible
- Focus indicators must have sufficient contrast and size
- Tab order should follow visual order for intuitive navigation
- Screen readers benefit from proper semantic HTML (role attributes)
