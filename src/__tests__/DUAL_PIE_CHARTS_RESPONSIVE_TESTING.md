# Dual Pie Charts - Responsive Behavior Testing Guide

This document provides comprehensive testing instructions for validating the responsive behavior of the dual pie charts feature across different screen sizes and data volumes.

## Test Coverage

The responsive testing suite validates the following requirements:

- **Requirement 7.1**: Charts display side-by-side on desktop (≥768px)
- **Requirement 7.2**: Charts stack vertically on mobile (<768px)
- **Requirement 7.3**: Chart readability at various screen sizes
- **Requirement 7.4**: Touch interactions work on mobile devices
- **Requirement 7.5**: Layout with different transaction data volumes

## Testing Approaches

### 1. Manual Browser Testing

#### Setup
1. Navigate to the application homepage or the dedicated test page at `/test/dual-pie-charts`
2. Open browser DevTools (F12)
3. Enable device toolbar (Ctrl+Shift+M or Cmd+Shift+M)

#### Test Cases

##### Test 1: Desktop Side-by-Side Layout (≥768px)
**Viewport Sizes to Test:**
- Tablet: 768x1024
- Desktop Small: 1280x720
- Desktop Medium: 1440x900
- Desktop Large: 1920x1080

**Expected Behavior:**
- ✓ Income chart appears on the left
- ✓ Expense chart appears on the right
- ✓ Charts have equal width
- ✓ Charts are horizontally aligned
- ✓ Gap spacing between charts is consistent (24px)

**How to Verify:**
1. Set viewport to 768px or wider
2. Observe chart layout
3. Verify charts are side-by-side
4. Check that both charts are fully visible

##### Test 2: Mobile Stacked Layout (<768px)
**Viewport Sizes to Test:**
- Mobile Small: 320x568
- Mobile Medium: 375x667
- Mobile Large: 414x896

**Expected Behavior:**
- ✓ Income chart appears on top
- ✓ Expense chart appears below
- ✓ Charts stack vertically
- ✓ Charts take full width
- ✓ Gap spacing between charts is consistent (24px)

**How to Verify:**
1. Set viewport to less than 768px
2. Observe chart layout
3. Verify charts are stacked vertically
4. Check that income chart is above expense chart

##### Test 3: Chart Readability
**Test at All Viewport Sizes**

**Expected Behavior:**
- ✓ Chart width is at least 280px
- ✓ Font sizes are at least 12px
- ✓ Labels don't overlap
- ✓ Percentages are readable
- ✓ Legend items are clearly visible
- ✓ Total amounts are prominently displayed
- ✓ No horizontal scrolling required

**How to Verify:**
1. Test at each breakpoint
2. Check text readability
3. Verify no content is cut off
4. Ensure charts fit within viewport

##### Test 4: Touch Interactions (Mobile Devices)
**Test on Actual Mobile Devices or Touch Simulators**

**Expected Behavior:**
- ✓ Legend items are at least 44x44px
- ✓ Adequate spacing between touch targets (8px minimum)
- ✓ Tapping legend items works smoothly
- ✓ Hovering/tapping chart slices shows tooltip
- ✓ No accidental taps on adjacent elements

**How to Verify:**
1. Use touch device or enable touch simulation
2. Tap legend items
3. Tap chart slices
4. Verify tooltips appear
5. Check spacing between interactive elements

##### Test 5: Data Volume Handling
**Test with Different Transaction Counts**

**Data Volumes to Test:**
- Empty: 0 transactions
- Small: 5 transactions
- Medium: 20 transactions
- Large: 50+ transactions

**Expected Behavior:**
- ✓ Empty state shows appropriate message
- ✓ Small datasets render correctly
- ✓ Medium datasets display all categories
- ✓ Large datasets don't cause performance issues
- ✓ Legend doesn't overflow
- ✓ Charts maintain aspect ratio

**How to Verify:**
1. Test with each data volume
2. Verify empty state message
3. Check chart rendering
4. Ensure no layout breaks
5. Verify performance remains smooth

### 2. Automated Testing with Browser Console

#### Running Tests in Browser Console

1. Navigate to the application homepage
2. Open browser DevTools console (F12)
3. Run the following command:

```javascript
// Run all responsive tests
window.dualPieChartsResponsiveTests.runAllTests();

// Or run individual tests
window.dualPieChartsResponsiveTests.testDesktopLayout();
window.dualPieChartsResponsiveTests.testMobileLayout();
window.dualPieChartsResponsiveTests.testReadability();
window.dualPieChartsResponsiveTests.testTouchInteractions();
window.dualPieChartsResponsiveTests.testDataVolume();
```

#### Interpreting Results

The console will display:
- ✅ **PASSED**: Test passed successfully
- ❌ **FAILED**: Test failed with issues listed
- ⏭️ **SKIPPED**: Test skipped (e.g., desktop test on mobile viewport)

Example output:
```
🧪 Dual Pie Charts - Responsive Behavior Tests

📊 Test 1: Desktop Side-by-Side Layout (≥768px)
✅ PASSED

📱 Test 2: Mobile Stacked Layout (<768px)
⏭️ SKIPPED
  - Skipped: Not a mobile viewport (≥ 768px)

👁️ Test 3: Chart Readability at Various Screen Sizes
✅ PASSED

👆 Test 4: Touch Interactions on Mobile Devices
⏭️ SKIPPED
  - Skipped: Not a touch device

📈 Test 5: Layout with Different Transaction Data Volumes
✅ PASSED

====================================================
📋 Summary: 3/5 tests passed (2 skipped)
====================================================
```

### 3. Automated E2E Testing with Playwright

#### Running Playwright Tests

```bash
# Install Playwright (if not already installed)
npm install -D @playwright/test

# Run all responsive tests
npx playwright test dual-pie-charts-responsive

# Run tests in headed mode (see browser)
npx playwright test dual-pie-charts-responsive --headed

# Run tests on specific browser
npx playwright test dual-pie-charts-responsive --project=chromium
npx playwright test dual-pie-charts-responsive --project=firefox
npx playwright test dual-pie-charts-responsive --project=webkit

# Run tests with UI mode
npx playwright test dual-pie-charts-responsive --ui
```

#### Test Coverage

The Playwright test suite includes:
- Desktop layout tests (768px, 1280px, 1920px)
- Mobile layout tests (320px, 375px, 414px)
- Readability tests across all viewports
- Touch interaction tests
- Data volume tests (empty, small, medium, large)
- Cross-viewport transition tests

### 4. Visual Regression Testing

#### Using the Test Page

1. Navigate to `/test/dual-pie-charts`
2. Use the data volume controls to switch between datasets
3. Use browser DevTools to resize viewport
4. Click "Run All Responsive Tests" to execute tests
5. Review results displayed on the page

#### Test Page Features

- **Current Viewport Display**: Shows current width, height, breakpoint, and touch device status
- **Data Volume Controls**: Switch between empty, small, medium, and large datasets
- **Test Results Display**: Visual feedback on test pass/fail status
- **Breakpoint Reference**: Quick reference for all standard breakpoints
- **Testing Instructions**: Step-by-step guide for manual testing

## Breakpoint Reference

| Breakpoint | Width | Tailwind Class | Expected Layout |
|------------|-------|----------------|-----------------|
| Mobile Small | 320px | (default) | Stacked |
| Mobile Medium | 375px | (default) | Stacked |
| Mobile Large | 414px | (default) | Stacked |
| Tablet Portrait | 768px | md: | Side-by-side |
| Tablet Landscape | 1024px | lg: | Side-by-side |
| Desktop Small | 1280px | xl: | Side-by-side |
| Desktop Medium | 1440px | xl: | Side-by-side |
| Desktop Large | 1920px | 2xl: | Side-by-side |

## Common Issues and Solutions

### Issue 1: Charts Not Stacking on Mobile
**Symptoms**: Charts appear side-by-side on mobile devices

**Solution**: 
- Verify `grid-cols-1` class is applied to container
- Check that `md:grid-cols-2` only applies at 768px+
- Clear browser cache and reload

### Issue 2: Text Too Small on Mobile
**Symptoms**: Labels and percentages are hard to read

**Solution**:
- Verify font sizes are at least 12px
- Check responsive font size classes
- Ensure Recharts label configuration is correct

### Issue 3: Touch Targets Too Small
**Symptoms**: Difficult to tap legend items on mobile

**Solution**:
- Verify legend items have adequate padding
- Check that touch targets are at least 44x44px
- Ensure adequate spacing between items (8px minimum)

### Issue 4: Charts Overflow Viewport
**Symptoms**: Horizontal scrolling required on mobile

**Solution**:
- Verify ResponsiveContainer width is "100%"
- Check that parent containers don't have fixed widths
- Ensure no padding/margin causes overflow

### Issue 5: Performance Issues with Large Datasets
**Symptoms**: Slow rendering or laggy interactions

**Solution**:
- Verify React.memo is applied to chart components
- Check that useMemo is used for data calculations
- Consider limiting categories to 20 maximum
- Group small categories into "Other"

## Test Checklist

Use this checklist to ensure comprehensive testing:

### Desktop Layout (≥768px)
- [ ] Charts display side-by-side at 768px
- [ ] Charts display side-by-side at 1280px
- [ ] Charts display side-by-side at 1920px
- [ ] Charts have equal width
- [ ] Gap spacing is consistent
- [ ] Both charts are fully visible

### Mobile Layout (<768px)
- [ ] Charts stack vertically at 320px
- [ ] Charts stack vertically at 375px
- [ ] Charts stack vertically at 414px
- [ ] Income chart is on top
- [ ] Expense chart is below
- [ ] Charts take full width

### Readability
- [ ] Chart width ≥ 280px on all viewports
- [ ] Font sizes ≥ 12px
- [ ] Labels don't overlap
- [ ] Percentages are readable
- [ ] Legend is clearly visible
- [ ] No horizontal scrolling

### Touch Interactions
- [ ] Legend items ≥ 44x44px
- [ ] Spacing between targets ≥ 8px
- [ ] Tapping legend items works
- [ ] Tapping chart slices shows tooltip
- [ ] No accidental taps

### Data Volumes
- [ ] Empty state displays message
- [ ] Small dataset (5) renders correctly
- [ ] Medium dataset (20) renders correctly
- [ ] Large dataset (50+) renders correctly
- [ ] No performance issues
- [ ] No layout breaks

## Reporting Issues

When reporting responsive behavior issues, please include:

1. **Viewport Size**: Width x Height (e.g., 375x667)
2. **Browser**: Name and version (e.g., Chrome 120)
3. **Device**: Desktop, mobile, or tablet
4. **Data Volume**: Empty, small, medium, or large
5. **Screenshot**: Visual evidence of the issue
6. **Console Errors**: Any JavaScript errors
7. **Test Results**: Output from automated tests

## Continuous Testing

### During Development
- Run browser console tests after each change
- Test at mobile and desktop breakpoints
- Verify with different data volumes

### Before Commit
- Run full Playwright test suite
- Test on multiple browsers
- Verify on actual mobile devices

### Before Release
- Complete full manual test checklist
- Run visual regression tests
- Test on various devices and browsers
- Verify accessibility compliance

## Resources

- **Test Files**:
  - `frontend/src/__tests__/dual-pie-charts-responsive.test.ts` - Browser console tests
  - `frontend/tests/dual-pie-charts-responsive.spec.ts` - Playwright E2E tests
  - `frontend/src/pages/DualPieChartsTestPage.tsx` - Manual test page

- **Utilities**:
  - `frontend/src/utils/responsiveTest.ts` - Responsive testing utilities
  - `frontend/src/utils/chartUtils.ts` - Chart data utilities
  - `frontend/src/utils/chartColors.ts` - Color palette definitions

- **Components**:
  - `frontend/src/components/DualPieChartLayout.tsx` - Main layout component
  - `frontend/src/components/IncomeCategoryChart.tsx` - Income chart
  - `frontend/src/components/ExpenseCategoryChart.tsx` - Expense chart

## Conclusion

Comprehensive responsive testing ensures that the dual pie charts provide an excellent user experience across all devices and screen sizes. Follow this guide to validate all requirements and maintain high quality standards.
