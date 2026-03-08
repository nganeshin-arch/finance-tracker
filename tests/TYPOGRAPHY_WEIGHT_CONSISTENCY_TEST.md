# Typography Weight Consistency Property Test

## Overview

This document describes the property-based test for **Property 1: Typography Weight Consistency** from the premium-ui-enhancement spec.

**Validates: Requirements 1.3, 1.4, 7.1**

## Property Definition

For any text element in the application:
- **IF** it is a heading element (h1-h6), **THEN** its computed font-weight should be 700 or higher
- **IF** it is body text, **THEN** its computed font-weight should be between 400 and 600
- **IF** it is a financial statistic value, **THEN** its computed font-weight should be 700 or higher

## Test Implementation

The test is implemented in `typography-weight-consistency.spec.ts` using Playwright for E2E testing.

### Test Structure

The test suite includes 5 test cases:

1. **Heading elements (h1-h6) should have font-weight 700 or higher**
   - Tests all heading levels (h1-h6)
   - Verifies each heading has font-weight >= 700
   - Skips headings not present on the page

2. **Body text elements should have font-weight between 400 and 600**
   - Tests common body text elements (p, span, div, label, td)
   - Verifies font-weight is in the range 400-600
   - Excludes elements with bold classes

3. **Financial statistic values should have font-weight 700 or higher**
   - Tests financial statistics in SummaryCards
   - Verifies bold typography for numerical values
   - Tests custom stat classes

4. **Property-based test: Random element sampling across multiple page states**
   - Tests typography consistency across different page states
   - Includes: initial load, after scrolling, after view mode change
   - Verifies headings, statistics, and body text in each state

5. **Property-based test: Typography consistency across all text elements**
   - Samples up to 50 text elements from the page
   - Classifies each element (heading, body, stat)
   - Verifies appropriate font-weight for each classification

### Property-Based Testing Approach

The test uses a property-based testing approach by:
- Testing across multiple page states (100+ iterations conceptually)
- Sampling random elements from the DOM
- Verifying universal properties hold for all elements
- Testing different viewport sizes and interactions

## Running the Test

### Prerequisites

1. Ensure the backend server is running on `http://localhost:5000`
2. Ensure the frontend dev server is running on `http://localhost:5173`
3. Ensure test user credentials are available:
   - Admin: `admin@example.com` / `admin123`

### Run Command

```bash
# Run the typography test specifically
npx playwright test typography-weight-consistency.spec.ts --reporter=list

# Run with UI mode for debugging
npx playwright test typography-weight-consistency.spec.ts --ui

# Run with headed browser to see the test in action
npx playwright test typography-weight-consistency.spec.ts --headed
```

### Using the Batch File

A convenience batch file is provided:

```bash
cd frontend
run-typography-test.bat
```

## Expected Results

All tests should pass with output similar to:

```
✓ h1: font-weight = 700 (>= 700)
✓ h2: font-weight = 700 (>= 700)
✓ p: font-weight = 400 (400-600)
✓ Financial stat: font-weight = 700 (>= 700)
✓ Verified 6 headings (all >= 700)
✓ Verified 15 bold/stat elements (all >= 700)
✓ Verified 42 body text elements (all 400-600)
```

## CSS Implementation Verified

The test verifies the following CSS rules from `index.css`:

```css
/* Headings - bold weights */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
}

/* Body text - normal weights */
body, p, span, div {
  line-height: 1.5;
}

/* Premium statistic text (bold, for dashboard numbers) */
.stat-premium {
  font-weight: var(--font-weight-bold); /* 700 */
}
```

## Component Implementation Verified

The test verifies typography in key components:

### SummaryCards Component
```tsx
<p className={cn('text-xl sm:text-2xl font-bold', card.textClass)}>
  {formatCurrency(card.value)}
</p>
```
- Uses `font-bold` class (font-weight: 700)
- Applied to financial statistics

### UnifiedHomePage Component
```tsx
<h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
<h2 className="text-2xl font-bold text-foreground">Transactions</h2>
```
- Uses `font-bold` class for headings
- Ensures font-weight: 700

## Troubleshooting

### Test Fails: "Cannot find package '@playwright/test'"

**Solution**: Install Playwright dependencies
```bash
cd frontend
npm install
npx playwright install
```

### Test Fails: "page.goto: net::ERR_CONNECTION_REFUSED"

**Solution**: Ensure both servers are running
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Test Fails: Login credentials invalid

**Solution**: Ensure admin user exists in database
```bash
cd backend
npm run seed
```

## Test Maintenance

### Adding New Typography Elements

When adding new components with typography:

1. Add appropriate selectors to the test
2. Classify the element type (heading, body, stat)
3. Verify the test passes with the new element

### Updating Font Weights

If font weights are changed in the design system:

1. Update the CSS custom properties in `index.css`
2. Update the test expectations accordingly
3. Re-run the test to verify consistency

## Related Files

- Test Implementation: `frontend/tests/typography-weight-consistency.spec.ts`
- CSS Implementation: `frontend/src/index.css`
- Component: `frontend/src/components/SummaryCards.tsx`
- Component: `frontend/src/pages/UnifiedHomePage.tsx`
- Design Document: `.kiro/specs/premium-ui-enhancement/design.md`
- Requirements: `.kiro/specs/premium-ui-enhancement/requirements.md`
