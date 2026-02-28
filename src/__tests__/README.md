# Dual Pie Charts Responsive Testing

## Quick Start

### Run Tests in Browser Console
1. Navigate to http://localhost:5173
2. Open DevTools (F12)
3. Run: `window.dualPieChartsResponsiveTests.runAllTests()`

### Use Interactive Test Page
1. Navigate to http://localhost:5173/test/dual-pie-charts
2. Adjust data volume using controls
3. Resize browser window to test responsive behavior
4. Click "Run All Responsive Tests" button

### Run Playwright Tests
```bash
npx playwright test dual-pie-charts-responsive
```

## Files

- `dual-pie-charts-responsive.test.ts` - Browser console tests
- `DUAL_PIE_CHARTS_RESPONSIVE_TESTING.md` - Full testing guide
- `RESPONSIVE_TEST_SUMMARY.md` - Implementation summary
- `../pages/DualPieChartsTestPage.tsx` - Interactive test page
- `../../tests/dual-pie-charts-responsive.spec.ts` - Playwright E2E tests

## Requirements Tested

- ✅ 7.1: Desktop side-by-side layout (≥768px)
- ✅ 7.2: Mobile stacked layout (<768px)
- ✅ 7.3: Chart readability at various screen sizes
- ✅ 7.4: Touch interactions on mobile devices
- ✅ 7.5: Layout with different transaction data volumes

## Test Coverage

All responsive behavior requirements are fully tested with:
- Manual testing procedures
- Browser console tests
- Interactive test page
- Automated Playwright E2E tests
