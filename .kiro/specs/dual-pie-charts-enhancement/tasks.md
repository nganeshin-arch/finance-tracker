# Implementation Plan

- [x] 1. Create utility functions for chart data processing





  - Create `frontend/src/utils/chartColors.ts` with color palette definitions for income and expense categories
  - Create `frontend/src/utils/chartUtils.ts` with `aggregateByCategory` and `assignColors` functions
  - Implement data validation and edge case handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2. Implement IncomeCategoryChart component






- [x] 2.1 Create IncomeCategoryChart component with basic structure

  - Create `frontend/src/components/IncomeCategoryChart.tsx`
  - Define component props interface (`IncomeCategoryChartProps`)
  - Implement transaction filtering for income type
  - Use `aggregateByCategory` utility to group by category
  - Assign colors from income color palette
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4_


- [x] 2.2 Add Recharts pie chart with income data





  - Implement ResponsiveContainer with 350px height
  - Configure Pie component with data, colors, and labels
  - Add percentage labels to chart slices
  - Implement custom tooltip with INR formatting
  - Add legend with category names and amounts
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 9.1, 9.2, 9.3, 9.4_


- [x] 2.3 Add visual styling and empty state handling





  - Wrap chart in Card component with enhanced styling
  - Display total income amount prominently
  - Implement empty state message for no income transactions
  - Add rounded corners, shadows, and hover effects
  - Apply green gradient color scheme
  - _Requirements: 2.5, 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 3. Implement ExpenseCategoryChart component






- [x] 3.1 Create ExpenseCategoryChart component with basic structure

  - Create `frontend/src/components/ExpenseCategoryChart.tsx`
  - Define component props interface (`ExpenseCategoryChartProps`)
  - Implement transaction filtering for expense type
  - Use `aggregateByCategory` utility to group by category
  - Assign colors from expense color palette
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5_


- [x] 3.2 Add Recharts pie chart with expense data




  - Implement ResponsiveContainer with 350px height
  - Configure Pie component with data, colors, and labels
  - Add percentage labels to chart slices
  - Implement custom tooltip with INR formatting
  - Add legend with category names and amounts
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 9.1, 9.2, 9.3, 9.4, 9.5_


- [x] 3.3 Add visual styling and empty state handling





  - Wrap chart in Card component with enhanced styling
  - Display total expense amount prominently
  - Implement empty state message for no expense transactions
  - Add rounded corners, shadows, and hover effects
  - Apply red-orange gradient color scheme
  - _Requirements: 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 4. Create DualPieChartLayout component






- [x] 4.1 Implement responsive layout container

  - Create `frontend/src/components/DualPieChartLayout.tsx`
  - Define component props interface (`DualPieChartLayoutProps`)
  - Implement responsive grid layout (2 columns desktop, 1 column mobile)
  - Split transactions into income and expense arrays
  - Pass filtered data to IncomeCategoryChart and ExpenseCategoryChart
  - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2, 7.3, 7.4, 7.5_


- [x] 4.2 Add empty state and error handling

  - Handle case when no transactions exist
  - Display appropriate message for empty state
  - Implement data validation before passing to child components
  - Handle missing category data with "Uncategorized" fallback
  - _Requirements: 1.5, 2.5, 3.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 5. Update UnifiedHomePage to use new dual chart layout





  - Import DualPieChartLayout component in `frontend/src/pages/UnifiedHomePage.tsx`
  - Replace `<IncomeExpensePieChart />` with `<DualPieChartLayout />`
  - Pass `filteredTransactions` prop to new component
  - Verify layout integration with existing Dashboard section
  - Keep IncomeExpensePieChart.tsx file for potential rollback
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6. Implement performance optimizations





  - Add React.memo to IncomeCategoryChart component
  - Add React.memo to ExpenseCategoryChart component
  - Use useMemo for chart data calculation in both components
  - Use useMemo for color assignment
  - Optimize aggregateByCategory function for O(n) complexity
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 7. Add accessibility features





  - Add ARIA labels to chart containers with descriptive text
  - Implement keyboard navigation for chart legends
  - Add screen reader text alternatives for chart data
  - Ensure all colors meet WCAG AA contrast requirements
  - Add focus indicators for interactive elements
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 8. Test responsive behavior across screen sizes





  - Verify charts display side-by-side on desktop (≥768px)
  - Verify charts stack vertically on mobile (<768px)
  - Test chart readability at various screen sizes
  - Verify touch interactions work on mobile devices
  - Test layout with different transaction data volumes
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 9. Verify data accuracy and edge cases





  - Test with various transaction datasets (income only, expense only, mixed)
  - Verify category aggregation is accurate
  - Verify percentage calculations are correct
  - Test with empty transaction arrays
  - Test with missing category data
  - Verify INR currency formatting is correct
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 10. Final visual polish and integration testing





  - Verify color scheme matches design specifications
  - Test hover effects and animations
  - Verify tooltip styling and content
  - Test chart updates when date range changes
  - Verify overall dashboard cohesion and visual appeal
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.4, 6.5, 11.1, 11.2, 11.3, 11.4, 11.5_
