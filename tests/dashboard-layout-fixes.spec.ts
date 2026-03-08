import { test, expect } from '@playwright/test';

test.describe('Dashboard Layout Fixes', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display transaction dates in single line format', async ({ page }) => {
    // Wait for transactions table to load
    await page.waitForSelector('[data-testid="transaction-table"], table', { timeout: 10000 });
    
    // Check if transaction dates are in single line format (dd MMM yyyy)
    const dateElements = await page.locator('table tbody tr td:first-child').all();
    
    if (dateElements.length > 0) {
      for (const dateElement of dateElements) {
        const dateText = await dateElement.textContent();
        if (dateText && dateText.trim()) {
          // Verify date format matches "dd MMM yyyy" pattern (e.g., "07 Mar 2026")
          expect(dateText.trim()).toMatch(/^\d{2} \w{3} \d{4}$/);
        }
      }
    }
  });

  test('should display category breakdown legends within container bounds', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('[role="region"][aria-label*="Income breakdown"], [role="region"][aria-label*="Expense breakdown"]', { timeout: 10000 });
    
    // Check Income Category Chart legend
    const incomeChart = page.locator('[role="region"][aria-label*="Income breakdown"]').first();
    if (await incomeChart.isVisible()) {
      const incomeLegend = incomeChart.locator('[role="list"][aria-label*="Income categories legend"]');
      if (await incomeLegend.isVisible()) {
        // Verify legend uses grid layout (not flex-wrap)
        const legendClass = await incomeLegend.getAttribute('class');
        expect(legendClass).toContain('grid');
        expect(legendClass).toContain('grid-cols-1');
        expect(legendClass).toContain('sm:grid-cols-2');
      }
    }
    
    // Check Expense Category Chart legend
    const expenseChart = page.locator('[role="region"][aria-label*="Expense breakdown"]').first();
    if (await expenseChart.isVisible()) {
      const expenseLegend = expenseChart.locator('[role="list"][aria-label*="Expense categories legend"]');
      if (await expenseLegend.isVisible()) {
        // Verify legend uses grid layout (not flex-wrap)
        const legendClass = await expenseLegend.getAttribute('class');
        expect(legendClass).toContain('grid');
        expect(legendClass).toContain('grid-cols-1');
        expect(legendClass).toContain('sm:grid-cols-2');
      }
    }
  });

  test('should display Financial Overview section with clear purpose', async ({ page }) => {
    // Wait for Financial Overview section to load
    await page.waitForSelector('h2:has-text("Financial Overview")', { timeout: 10000 });
    
    // Check that Financial Overview section exists and has descriptive text
    const overviewSection = page.locator('h2:has-text("Financial Overview")').locator('..');
    await expect(overviewSection).toBeVisible();
    
    // Verify the descriptive text is present
    const descriptionText = page.locator('text=Key financial metrics and trends');
    await expect(descriptionText).toBeVisible();
    
    // Check that summary cards are present
    const summaryCards = page.locator('[class*="dashboard-grid"]').first();
    await expect(summaryCards).toBeVisible();
    
    // Verify key financial metrics are displayed
    const expectedMetrics = ['Total Balance', 'Monthly Income', 'Monthly Expenses', 'Transfers'];
    
    for (const metric of expectedMetrics) {
      const metricElement = page.locator(`text=${metric}`);
      await expect(metricElement).toBeVisible();
    }
  });

  test('should have proper responsive layout for category charts', async ({ page }) => {
    // Test on different viewport sizes
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow layout to adjust
      
      // Check that charts are visible and properly laid out
      const chartContainer = page.locator('h2:has-text("Category Breakdown")').locator('..');
      await expect(chartContainer).toBeVisible();
      
      // Verify charts don't overflow their containers
      const charts = page.locator('[role="region"][aria-label*="breakdown"]');
      const chartCount = await charts.count();
      
      if (chartCount > 0) {
        for (let i = 0; i < chartCount; i++) {
          const chart = charts.nth(i);
          await expect(chart).toBeVisible();
          
          // Check that legends are contained within chart bounds
          const legend = chart.locator('[role="list"]');
          if (await legend.isVisible()) {
            const chartBox = await chart.boundingBox();
            const legendBox = await legend.boundingBox();
            
            if (chartBox && legendBox) {
              // Legend should be within chart container bounds
              expect(legendBox.x).toBeGreaterThanOrEqual(chartBox.x - 10); // Allow small margin
              expect(legendBox.x + legendBox.width).toBeLessThanOrEqual(chartBox.x + chartBox.width + 10);
            }
          }
        }
      }
    }
  });

  test('should display proper date format in transaction table across different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Check transaction table date format
      const transactionTable = page.locator('table');
      if (await transactionTable.isVisible()) {
        const dateColumns = transactionTable.locator('tbody tr td:first-child');
        const dateCount = await dateColumns.count();
        
        if (dateCount > 0) {
          const firstDate = await dateColumns.first().textContent();
          if (firstDate && firstDate.trim()) {
            // Should be single line format like "07 Mar 2026"
            expect(firstDate.trim()).toMatch(/^\d{2} \w{3} \d{4}$/);
            
            // Should not contain line breaks or multiple date parts
            expect(firstDate).not.toContain('\n');
            expect(firstDate.split(' ').length).toBe(3); // day, month, year
          }
        }
      }
    }
  });
});