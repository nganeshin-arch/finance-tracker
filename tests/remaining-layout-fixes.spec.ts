import { test, expect } from '@playwright/test';

test.describe('Remaining Layout Fixes', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display transaction dates in single line format with no wrapping', async ({ page }) => {
    // Wait for transactions table to load
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Check if transaction dates are in single line format
    const dateElements = page.locator('table tbody tr td:first-child div');
    const dateCount = await dateElements.count();
    
    if (dateCount > 0) {
      for (let i = 0; i < dateCount; i++) {
        const dateElement = dateElements.nth(i);
        const dateText = await dateElement.textContent();
        
        if (dateText && dateText.trim()) {
          // Verify date format matches "dd MMM yyyy" pattern (e.g., "07 Mar 2026")
          expect(dateText.trim()).toMatch(/^\d{2} \w{3} \d{4}$/);
          
          // Check that the date container has whitespace-nowrap to prevent wrapping
          const classes = await dateElement.getAttribute('class');
          expect(classes).toContain('whitespace-nowrap');
          
          // Verify minimum width is set appropriately
          expect(classes).toContain('min-w-[90px]');
        }
      }
    }
  });

  test('should contain category breakdown legends within chart boundaries', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('[role="region"][aria-label*="breakdown"]', { timeout: 10000 });
    
    // Test both Income and Expense charts
    const charts = page.locator('[role="region"][aria-label*="breakdown"]');
    const chartCount = await charts.count();
    
    for (let i = 0; i < chartCount; i++) {
      const chart = charts.nth(i);
      
      // Check that chart container has overflow-hidden
      const cardContent = chart.locator('[class*="overflow-hidden"]');
      await expect(cardContent).toBeVisible();
      
      // Check legend container
      const legendContainer = chart.locator('[role="list"]');
      if (await legendContainer.isVisible()) {
        // Verify legend uses grid layout
        const legendClass = await legendContainer.getAttribute('class');
        expect(legendClass).toContain('grid');
        expect(legendClass).toContain('grid-cols-1');
        expect(legendClass).toContain('sm:grid-cols-2');
        expect(legendClass).toContain('max-w-full');
        
        // Check individual legend items have proper overflow handling
        const legendItems = legendContainer.locator('li');
        const itemCount = await legendItems.count();
        
        if (itemCount > 0) {
          for (let j = 0; j < Math.min(itemCount, 3); j++) { // Check first 3 items
            const item = legendItems.nth(j);
            const itemClass = await item.getAttribute('class');
            
            // Verify overflow handling classes
            expect(itemClass).toContain('min-w-0');
            expect(itemClass).toContain('max-w-full');
            
            // Check text span has proper truncation
            const textSpan = item.locator('span.truncate');
            await expect(textSpan).toBeVisible();
            
            const spanClass = await textSpan.getAttribute('class');
            expect(spanClass).toContain('flex-1');
            expect(spanClass).toContain('min-w-0');
          }
        }
      }
    }
  });

  test('should handle long category names without overflow', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('[role="region"][aria-label*="breakdown"]', { timeout: 10000 });
    
    // Test responsive behavior with different viewport sizes
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow layout to adjust
      
      // Check that legends stay within bounds
      const charts = page.locator('[role="region"][aria-label*="breakdown"]');
      const chartCount = await charts.count();
      
      for (let i = 0; i < chartCount; i++) {
        const chart = charts.nth(i);
        const chartBox = await chart.boundingBox();
        
        if (chartBox) {
          // Check legend container
          const legendContainer = chart.locator('[role="list"]');
          if (await legendContainer.isVisible()) {
            const legendBox = await legendContainer.boundingBox();
            
            if (legendBox) {
              // Legend should not exceed chart container width
              expect(legendBox.x + legendBox.width).toBeLessThanOrEqual(chartBox.x + chartBox.width + 5); // 5px tolerance
              expect(legendBox.x).toBeGreaterThanOrEqual(chartBox.x - 5); // 5px tolerance
            }
          }
        }
      }
    }
  });

  test('should display proper legend height allocation', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('[role="region"][aria-label*="breakdown"]', { timeout: 10000 });
    
    // Check that legend height is properly allocated (should be 80px)
    const charts = page.locator('[role="region"][aria-label*="breakdown"]');
    const chartCount = await charts.count();
    
    if (chartCount > 0) {
      // Check the ResponsiveContainer height and legend height allocation
      const chart = charts.first();
      
      // The chart should have proper height allocation for legend
      // This is more of a visual verification that legends don't overlap with pie chart
      const pieChart = chart.locator('[role="img"]');
      await expect(pieChart).toBeVisible();
      
      const legend = chart.locator('[role="list"]');
      if (await legend.isVisible()) {
        // Legend should be visible and not overlapping with chart
        await expect(legend).toBeVisible();
        
        // Check that legend items are properly spaced
        const legendItems = legend.locator('li');
        const itemCount = await legendItems.count();
        
        if (itemCount > 1) {
          // Verify gap between items
          const firstItem = legendItems.first();
          const secondItem = legendItems.nth(1);
          
          const firstBox = await firstItem.boundingBox();
          const secondBox = await secondItem.boundingBox();
          
          if (firstBox && secondBox) {
            // Items should not overlap
            expect(firstBox.y + firstBox.height).toBeLessThanOrEqual(secondBox.y + 2); // Small tolerance
          }
        }
      }
    }
  });

  test('should maintain proper text truncation in legends', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('[role="region"][aria-label*="breakdown"]', { timeout: 10000 });
    
    // Check text truncation behavior
    const legendItems = page.locator('[role="list"] li span.truncate');
    const itemCount = await legendItems.count();
    
    if (itemCount > 0) {
      for (let i = 0; i < Math.min(itemCount, 5); i++) { // Check first 5 items
        const item = legendItems.nth(i);
        
        // Verify truncate class is applied
        const classes = await item.getAttribute('class');
        expect(classes).toContain('truncate');
        expect(classes).toContain('flex-1');
        expect(classes).toContain('min-w-0');
        
        // Text should be visible
        await expect(item).toBeVisible();
      }
    }
  });
});