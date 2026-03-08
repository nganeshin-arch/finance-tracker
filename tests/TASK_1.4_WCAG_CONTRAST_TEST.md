# Task 1.4: WCAG Contrast Compliance Property Test

## Overview

This document describes the property-based test implementation for WCAG 2.1 AA contrast compliance (Property 5).

## Property Definition

**Property 5: WCAG Contrast Compliance**

For any text element and its background, the contrast ratio should be at least 4.5:1 for normal text and at least 3:1 for large text (18pt+) or UI components, in both light and dark modes.

**Validates:** Requirements 2.5, 2.6, 4.6, 11.1

## Implementation

### Test File

`frontend/tests/wcag-contrast-compliance.spec.ts`

### Test Structure

The test implements comprehensive WCAG 2.1 AA contrast validation with the following components:

#### 1. Contrast Calculation Functions

- `getLuminance(r, g, b)`: Calculates relative luminance using WCAG 2.1 formula
- `getContrastRatio(rgb1, rgb2)`: Calculates contrast ratio between two colors
- `parseRgb(rgbString)`: Parses RGB color strings to RGB objects
- `isLargeText(fontSize, fontWeight)`: Determines if text qualifies as "large text" per WCAG

#### 2. WCAG Standards

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
  - Large text defined as: 18pt (24px) or larger, OR 14pt (18.67px) bold or larger
- **UI components**: Minimum 3:1 contrast ratio (buttons, form controls)

#### 3. Test Cases

##### Test 1: Heading Elements (Light Mode)
- Tests all heading elements (h1-h6)
- Verifies contrast ratios meet WCAG AA requirements
- Accounts for large text threshold

##### Test 2: Body Text Elements (Light Mode)
- Tests common body text elements (p, span, div, label, td, li)
- Tests first 5 instances of each element type
- Verifies appropriate contrast ratios based on font size

##### Test 3: Button Elements (Light Mode)
- Tests up to 10 button elements
- Applies UI component standard (3:1 minimum)
- Validates interactive element contrast

##### Test 4: Financial Statistics (Light Mode)
- Tests financial statistic displays
- Validates bold, large text elements
- Ensures key metrics are readable

##### Test 5: Dark Mode Validation
- Enables dark mode via class and data-theme attribute
- Tests all element types in dark mode
- Verifies dark mode color adjustments maintain contrast

##### Test 6: Property-Based Test - Page States
- Tests contrast across different page states:
  - Initial page load
  - After scrolling
  - Dark mode enabled
- Validates universal property across state changes

##### Test 7: Property-Based Test - Comprehensive Validation
- Tests up to 10 instances of each element type
- Covers all text-containing elements on the page
- Provides detailed pass/fail statistics
- Lists all contrast failures with specific details

### Key Features

1. **Universal Property Validation**: Tests the property that ALL text elements should meet contrast requirements
2. **Both Themes**: Validates contrast in both light and dark modes
3. **Element Classification**: Correctly classifies elements as normal text, large text, or UI components
4. **Detailed Reporting**: Provides contrast ratios, font sizes, and text samples in output
5. **Comprehensive Coverage**: Tests headings, body text, buttons, statistics, and more
6. **Background Detection**: Walks up DOM tree to find actual background color (handles transparent backgrounds)

## Running the Test

### Option 1: Using Batch File
```bash
cd frontend
run-contrast-test.bat
```

### Option 2: Using npm
```bash
cd frontend
npm run test:e2e -- wcag-contrast-compliance.spec.ts
```

### Option 3: Using npx
```bash
cd frontend
npx playwright test wcag-contrast-compliance.spec.ts
```

## Expected Results

When the test runs successfully:

1. All heading elements should pass with contrast ratios >= 4.5:1 (or >= 3:1 if large)
2. All body text should pass with contrast ratios >= 4.5:1
3. All buttons should pass with contrast ratios >= 3:1
4. All financial statistics should pass with appropriate ratios
5. Dark mode elements should maintain proper contrast
6. Comprehensive validation should show 100% pass rate

## Test Output Example

```
✓ h1: 7.23:1 (>= 4.5:1) - "Personal Finance Dashboard"
✓ h2: 8.15:1 (>= 4.5:1) - "Recent Transactions"
✓ p[0]: 5.67:1 (>= 4.5:1)
✓ button[0]: 4.89:1 (>= 3.0:1) - "Add Transaction"
✓ [DARK MODE] h1: 12.34:1 (>= 4.5:1)

Tested 127 text elements
Passed: 127/127 (100.0%)
```

## Troubleshooting

### Module Not Found Error

If you encounter `Cannot find package '@playwright/test'` error:

1. Ensure Playwright is installed:
   ```bash
   npm install --save-dev @playwright/test
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Verify the app is running (Playwright will auto-start it if configured)

### Test Failures

If tests fail with contrast violations:

1. Check the console output for specific elements and their contrast ratios
2. Review the color definitions in `frontend/src/index.css`
3. Verify Tailwind color configuration in `frontend/tailwind.config.js`
4. Use browser DevTools to inspect computed colors
5. Consider adjusting colors to meet WCAG AA standards

## Integration with Spec

This test validates:
- **Requirement 2.5**: WCAG 2.1 AA contrast ratios of at least 4.5:1 for normal text
- **Requirement 2.6**: WCAG 2.1 AA contrast ratios of at least 3:1 for large text and UI components
- **Requirement 4.6**: Button states meet WCAG 2.1 AA contrast requirements
- **Requirement 11.1**: Design system maintains WCAG 2.1 AA contrast ratios for all text and interactive elements

## Next Steps

After this test passes:
1. Proceed to Task 1.5: Extend Tailwind configuration with animation system
2. Continue with remaining tasks in the premium UI enhancement spec
3. Use this test as a regression test to ensure future changes maintain accessibility

## Notes

- The test uses Playwright's browser automation to test real rendered elements
- Contrast calculations follow WCAG 2.1 specifications exactly
- The test accounts for transparent backgrounds by walking up the DOM tree
- Both light and dark modes are tested to ensure theme switching maintains accessibility
- The test is designed to be run as part of the CI/CD pipeline
