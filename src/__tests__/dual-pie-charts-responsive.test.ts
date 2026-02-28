/**
 * Responsive Behavior Tests for Dual Pie Charts
 * 
 * This test suite validates:
 * - Charts display side-by-side on desktop (≥768px)
 * - Charts stack vertically on mobile (<768px)
 * - Chart readability at various screen sizes
 * - Touch interactions work on mobile devices
 * - Layout with different transaction data volumes
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { BREAKPOINTS, getViewportSize, getCurrentBreakpoint, isTouchDevice } from '../utils/responsiveTest';

interface ResponsiveTestResult {
  breakpoint: string;
  width: number;
  height: number;
  passed: boolean;
  issues: string[];
}

interface ChartLayoutInfo {
  container: Element | null;
  incomeChart: Element | null;
  expenseChart: Element | null;
  isStacked: boolean;
  isSideBySide: boolean;
}

/**
 * Gets the dual pie chart layout information
 */
function getChartLayout(): ChartLayoutInfo {
  // Find the dual chart container
  const container = document.querySelector('[role="group"][aria-label*="Income and expense"]');
  
  if (!container) {
    return {
      container: null,
      incomeChart: null,
      expenseChart: null,
      isStacked: false,
      isSideBySide: false,
    };
  }

  // Find individual charts
  const charts = container.querySelectorAll('[role="region"]');
  const incomeChart = Array.from(charts).find(chart => 
    chart.getAttribute('aria-label')?.includes('Income')
  );
  const expenseChart = Array.from(charts).find(chart => 
    chart.getAttribute('aria-label')?.includes('Expense')
  );

  if (!incomeChart || !expenseChart) {
    return {
      container,
      incomeChart: null,
      expenseChart: null,
      isStacked: false,
      isSideBySide: false,
    };
  }

  // Check layout by comparing positions
  const incomeRect = incomeChart.getBoundingClientRect();
  const expenseRect = expenseChart.getBoundingClientRect();

  // Stacked: expense chart is below income chart (y position is greater)
  const isStacked = expenseRect.top > incomeRect.bottom - 10; // 10px tolerance

  // Side-by-side: charts are on the same horizontal level
  const isSideBySide = Math.abs(incomeRect.top - expenseRect.top) < 50; // 50px tolerance

  return {
    container,
    incomeChart,
    expenseChart,
    isStacked,
    isSideBySide,
  };
}

/**
 * Test 1: Verify charts display side-by-side on desktop (≥768px)
 * Requirement: 7.1
 */
export function testDesktopSideBySideLayout(): ResponsiveTestResult {
  const viewport = getViewportSize();
  const breakpoint = getCurrentBreakpoint();
  const issues: string[] = [];

  // Only test on desktop breakpoints
  if (viewport.width < 768) {
    return {
      breakpoint,
      width: viewport.width,
      height: viewport.height,
      passed: true,
      issues: ['Skipped: Not a desktop viewport (< 768px)'],
    };
  }

  const layout = getChartLayout();

  // Check if charts exist
  if (!layout.container) {
    issues.push('Dual chart container not found');
    return { breakpoint, width: viewport.width, height: viewport.height, passed: false, issues };
  }

  if (!layout.incomeChart || !layout.expenseChart) {
    issues.push('Income or Expense chart not found');
    return { breakpoint, width: viewport.width, height: viewport.height, passed: false, issues };
  }

  // Verify side-by-side layout
  if (!layout.isSideBySide) {
    issues.push('Charts are not displayed side-by-side on desktop');
  }

  if (layout.isStacked) {
    issues.push('Charts are stacked vertically on desktop (should be side-by-side)');
  }

  // Check grid layout classes
  const containerClasses = layout.container.className;
  if (!containerClasses.includes('md:grid-cols-2')) {
    issues.push('Container missing md:grid-cols-2 class for desktop layout');
  }

  return {
    breakpoint,
    width: viewport.width,
    height: viewport.height,
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Test 2: Verify charts stack vertically on mobile (<768px)
 * Requirement: 7.2
 */
export function testMobileStackedLayout(): ResponsiveTestResult {
  const viewport = getViewportSize();
  const breakpoint = getCurrentBreakpoint();
  const issues: string[] = [];

  // Only test on mobile breakpoints
  if (viewport.width >= 768) {
    return {
      breakpoint,
      width: viewport.width,
      height: viewport.height,
      passed: true,
      issues: ['Skipped: Not a mobile viewport (≥ 768px)'],
    };
  }

  const layout = getChartLayout();

  // Check if charts exist
  if (!layout.container) {
    issues.push('Dual chart container not found');
    return { breakpoint, width: viewport.width, height: viewport.height, passed: false, issues };
  }

  if (!layout.incomeChart || !layout.expenseChart) {
    issues.push('Income or Expense chart not found');
    return { breakpoint, width: viewport.width, height: viewport.height, passed: false, issues };
  }

  // Verify stacked layout
  if (!layout.isStacked) {
    issues.push('Charts are not stacked vertically on mobile');
  }

  if (layout.isSideBySide) {
    issues.push('Charts are side-by-side on mobile (should be stacked)');
  }

  // Check grid layout classes
  const containerClasses = layout.container.className;
  if (!containerClasses.includes('grid-cols-1')) {
    issues.push('Container missing grid-cols-1 class for mobile layout');
  }

  return {
    breakpoint,
    width: viewport.width,
    height: viewport.height,
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Test 3: Test chart readability at various screen sizes
 * Requirement: 7.3
 */
export function testChartReadability(): ResponsiveTestResult {
  const viewport = getViewportSize();
  const breakpoint = getCurrentBreakpoint();
  const issues: string[] = [];

  const layout = getChartLayout();

  if (!layout.incomeChart || !layout.expenseChart) {
    issues.push('Charts not found for readability test');
    return { breakpoint, width: viewport.width, height: viewport.height, passed: false, issues };
  }

  // Check chart dimensions
  const incomeRect = layout.incomeChart.getBoundingClientRect();
  const expenseRect = layout.expenseChart.getBoundingClientRect();

  // Minimum readable width (should be at least 280px)
  const MIN_WIDTH = 280;
  if (incomeRect.width < MIN_WIDTH) {
    issues.push(`Income chart width (${incomeRect.width.toFixed(0)}px) is below minimum readable width (${MIN_WIDTH}px)`);
  }
  if (expenseRect.width < MIN_WIDTH) {
    issues.push(`Expense chart width (${expenseRect.width.toFixed(0)}px) is below minimum readable width (${MIN_WIDTH}px)`);
  }

  // Check if charts are visible
  if (incomeRect.width === 0 || incomeRect.height === 0) {
    issues.push('Income chart has zero dimensions');
  }
  if (expenseRect.width === 0 || expenseRect.height === 0) {
    issues.push('Expense chart has zero dimensions');
  }

  // Check text elements for readability
  const checkTextReadability = (chart: Element, chartName: string) => {
    const textElements = chart.querySelectorAll('text, span, p, h1, h2, h3, h4, h5, h6');
    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const fontSize = parseFloat(styles.fontSize);
      
      // Minimum font size for readability (12px)
      if (fontSize < 12) {
        issues.push(`${chartName}: Text element has font size ${fontSize.toFixed(1)}px (minimum 12px recommended)`);
      }
    });
  };

  checkTextReadability(layout.incomeChart, 'Income chart');
  checkTextReadability(layout.expenseChart, 'Expense chart');

  // Check ResponsiveContainer height (should be 350px as per design)
  const responsiveContainers = document.querySelectorAll('.recharts-responsive-container');
  responsiveContainers.forEach((container, index) => {
    const rect = container.getBoundingClientRect();
    if (rect.height < 300) {
      issues.push(`Chart ${index + 1}: ResponsiveContainer height (${rect.height.toFixed(0)}px) is below expected 350px`);
    }
  });

  return {
    breakpoint,
    width: viewport.width,
    height: viewport.height,
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Test 4: Verify touch interactions work on mobile devices
 * Requirement: 7.4
 */
export function testTouchInteractions(): ResponsiveTestResult {
  const viewport = getViewportSize();
  const breakpoint = getCurrentBreakpoint();
  const issues: string[] = [];
  const isTouch = isTouchDevice();

  // Only test on touch devices
  if (!isTouch) {
    return {
      breakpoint,
      width: viewport.width,
      height: viewport.height,
      passed: true,
      issues: ['Skipped: Not a touch device'],
    };
  }

  const layout = getChartLayout();

  if (!layout.incomeChart || !layout.expenseChart) {
    issues.push('Charts not found for touch interaction test');
    return { breakpoint, width: viewport.width, height: viewport.height, passed: false, issues };
  }

  // Check for touch-friendly interactive elements
  const MIN_TOUCH_TARGET = 44; // 44x44px minimum for touch targets

  const checkTouchTargets = (chart: Element, chartName: string) => {
    // Check legend items (should be touch-friendly)
    const legendItems = chart.querySelectorAll('[role="button"], button, a');
    legendItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      if (rect.width < MIN_TOUCH_TARGET || rect.height < MIN_TOUCH_TARGET) {
        issues.push(
          `${chartName}: Touch target ${index + 1} is too small (${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px, minimum ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px)`
        );
      }
    });

    // Check if elements have appropriate spacing for touch
    const interactiveElements = chart.querySelectorAll('[role="button"]');
    for (let i = 0; i < interactiveElements.length - 1; i++) {
      const current = interactiveElements[i].getBoundingClientRect();
      const next = interactiveElements[i + 1].getBoundingClientRect();
      
      // Check horizontal spacing
      const horizontalGap = next.left - current.right;
      if (horizontalGap < 8 && horizontalGap > -current.width) {
        issues.push(`${chartName}: Insufficient spacing between touch targets (${horizontalGap.toFixed(0)}px, minimum 8px recommended)`);
      }
    }
  };

  checkTouchTargets(layout.incomeChart, 'Income chart');
  checkTouchTargets(layout.expenseChart, 'Expense chart');

  // Check if charts have proper touch event handling
  const pieSlices = document.querySelectorAll('.recharts-pie-sector');
  if (pieSlices.length === 0) {
    issues.push('No pie chart slices found for touch interaction');
  }

  return {
    breakpoint,
    width: viewport.width,
    height: viewport.height,
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Test 5: Test layout with different transaction data volumes
 * Requirement: 7.5
 */
export function testDataVolumeHandling(): ResponsiveTestResult {
  const viewport = getViewportSize();
  const breakpoint = getCurrentBreakpoint();
  const issues: string[] = [];

  const layout = getChartLayout();

  // Test 1: Check if empty state is handled
  const emptyStateMessages = document.querySelectorAll('[role="status"]');
  const hasEmptyState = Array.from(emptyStateMessages).some(msg => 
    msg.textContent?.includes('No transaction') || 
    msg.textContent?.includes('No income') ||
    msg.textContent?.includes('No expense')
  );

  // Test 2: Check if charts handle multiple categories
  const pieSlices = document.querySelectorAll('.recharts-pie-sector');
  const legendItems = document.querySelectorAll('[role="list"] [role="button"]');

  if (pieSlices.length > 0) {
    // Charts have data - verify they render properly
    if (pieSlices.length > 20) {
      issues.push(`Too many pie slices (${pieSlices.length}), may affect readability (maximum 20 recommended)`);
    }

    // Check if legend items match pie slices
    const expectedLegendItems = pieSlices.length;
    if (legendItems.length !== expectedLegendItems && legendItems.length > 0) {
      issues.push(`Legend items (${legendItems.length}) don't match pie slices (${pieSlices.length})`);
    }

    // Check if labels are readable with many categories
    const labels = document.querySelectorAll('.recharts-pie-label-text');
    labels.forEach((label, index) => {
      const rect = label.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        issues.push(`Label ${index + 1} has zero dimensions (may be overlapping)`);
      }
    });
  } else if (!hasEmptyState) {
    // No data and no empty state message
    issues.push('No chart data and no empty state message displayed');
  }

  // Test 3: Check container overflow handling
  if (layout.container) {
    const containerRect = layout.container.getBoundingClientRect();
    const containerStyles = window.getComputedStyle(layout.container);
    
    // Check if container has proper overflow handling
    if (containerStyles.overflow === 'visible' && legendItems.length > 10) {
      issues.push('Container may overflow with many legend items (overflow: visible)');
    }

    // Check if charts fit within viewport
    if (containerRect.right > viewport.width) {
      issues.push(`Container extends beyond viewport (${containerRect.right.toFixed(0)}px > ${viewport.width}px)`);
    }
  }

  // Test 4: Check performance with large datasets
  const allChartElements = document.querySelectorAll('.recharts-surface, .recharts-layer, .recharts-pie');
  if (allChartElements.length > 100) {
    issues.push(`High number of chart elements (${allChartElements.length}), may impact performance`);
  }

  return {
    breakpoint,
    width: viewport.width,
    height: viewport.height,
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Run all responsive tests
 */
export function runAllResponsiveTests(): ResponsiveTestResult[] {
  const results: ResponsiveTestResult[] = [];

  console.group('🧪 Dual Pie Charts - Responsive Behavior Tests');
  
  // Test 1: Desktop side-by-side layout
  console.log('\n📊 Test 1: Desktop Side-by-Side Layout (≥768px)');
  const test1 = testDesktopSideBySideLayout();
  results.push(test1);
  console.log(test1.passed ? '✅ PASSED' : '❌ FAILED');
  if (test1.issues.length > 0) {
    test1.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  // Test 2: Mobile stacked layout
  console.log('\n📱 Test 2: Mobile Stacked Layout (<768px)');
  const test2 = testMobileStackedLayout();
  results.push(test2);
  console.log(test2.passed ? '✅ PASSED' : '❌ FAILED');
  if (test2.issues.length > 0) {
    test2.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  // Test 3: Chart readability
  console.log('\n👁️ Test 3: Chart Readability at Various Screen Sizes');
  const test3 = testChartReadability();
  results.push(test3);
  console.log(test3.passed ? '✅ PASSED' : '❌ FAILED');
  if (test3.issues.length > 0) {
    test3.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  // Test 4: Touch interactions
  console.log('\n👆 Test 4: Touch Interactions on Mobile Devices');
  const test4 = testTouchInteractions();
  results.push(test4);
  console.log(test4.passed ? '✅ PASSED' : '❌ FAILED');
  if (test4.issues.length > 0) {
    test4.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  // Test 5: Data volume handling
  console.log('\n📈 Test 5: Layout with Different Transaction Data Volumes');
  const test5 = testDataVolumeHandling();
  results.push(test5);
  console.log(test5.passed ? '✅ PASSED' : '❌ FAILED');
  if (test5.issues.length > 0) {
    test5.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  // Summary
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const skippedTests = results.filter(r => r.issues.some(i => i.startsWith('Skipped'))).length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`📋 Summary: ${passedTests}/${totalTests} tests passed (${skippedTests} skipped)`);
  console.log('='.repeat(60));
  
  console.groupEnd();

  return results;
}

/**
 * Test at specific breakpoint
 */
export function testAtBreakpoint(breakpoint: { name: string; width: number; height: number }): void {
  console.group(`🔍 Testing at ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
  
  // Note: Actual viewport resizing would need to be done externally
  // This function assumes the viewport is already set to the desired size
  
  runAllResponsiveTests();
  
  console.groupEnd();
}

// Export for use in browser console or test runners
if (typeof window !== 'undefined') {
  (window as any).dualPieChartsResponsiveTests = {
    runAllTests: runAllResponsiveTests,
    testDesktopLayout: testDesktopSideBySideLayout,
    testMobileLayout: testMobileStackedLayout,
    testReadability: testChartReadability,
    testTouchInteractions: testTouchInteractions,
    testDataVolume: testDataVolumeHandling,
    testAtBreakpoint,
    BREAKPOINTS,
  };
}
