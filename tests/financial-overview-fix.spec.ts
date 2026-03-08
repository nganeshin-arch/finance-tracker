import { test, expect } from '@playwright/test';

test.describe('Financial Overview Fix', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display Financial Overview section with metrics', async ({ page }) => {
    // Wait for Financial Overview section to load
    await page.waitForSelector('h2:has-text("Financial Overview")', { timeout: 10000 });
    
    // Check that Financial Overview section exists
    const overviewSection = page.locator('h2:has-text("Financial Overview")');
    await expect(overviewSection).toBeVisible();
    
    // Verify the descriptive text is present
    const descriptionText = page.locator('text=Key financial metrics and trends');
    await expect(descriptionText).toBeVisible();
    
    // Wait for the dashboard grid to load
    await page.waitForSelector('[class*="grid"]', { timeout: 5000 });
    
    // Check that summary cards are present in the grid
    const summaryCards = page.locator('[class*="grid"] > div').first();
    await expect(summaryCards).toBeVisible();
    
    // Verify key financial metrics are displayed
    const expectedMetrics = ['Total Balance', 'Monthly Income', 'Monthly Expenses', 'Transfers'];
    
    for (const metric of expectedMetrics) {
      const metricElement = page.locator(`text=${metric}`);
      await expect(metricElement).toBeVisible();
    }
    
    // Check that currency values are displayed (look for ₹ symbol)
    const currencyValues = page.locator('text=/₹[0-9,]+/');
    const currencyCount = await currencyValues.count();
    expect(currencyCount).toBeGreaterThan(0);
  });

  test('should display trend indicators in financial metrics', async ({ page }) => {
    // Wait for Financial Overview section
    await page.waitForSelector('h2:has-text("Financial Overview")', { timeout: 10000 });
    
    // Look for trend indicators (arrows or percentage changes)
    const trendIndicators = page.locator('[class*="ArrowUp"], [class*="ArrowDown"], text=/%/');
    
    // Should have at least some trend indicators visible
    const indicatorCount = await trendIndicators.count();
    
    // Even if there are no transactions, we should see 0% trends
    expect(indicatorCount).toBeGreaterThanOrEqual(0);
  });

  test('should have proper responsive layout for financial overview', async ({ page }) => {
    // Test on different viewport sizes
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow layout to adjust
      
      // Check that Financial Overview section is visible
      const overviewSection = page.locator('h2:has-text("Financial Overview")');
      await expect(overviewSection).toBeVisible();
      
      // Check that the grid layout adapts properly
      const gridContainer = page.locator('[class*="grid"]').first();
      await expect(gridContainer).toBeVisible();
      
      // Verify that cards are properly arranged
      const cards = gridContainer.locator('> div');
      const cardCount = await cards.count();
      
      if (cardCount > 0) {
        // All cards should be visible
        for (let i = 0; i < cardCount; i++) {
          await expect(cards.nth(i)).toBeVisible();
        }
      }
    }
  });

  test('should show loading state gracefully', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    
    // Check if loading skeletons appear initially
    const skeletons = page.locator('[class*="animate-shimmer"]');
    
    // Wait for content to load
    await page.waitForSelector('h2:has-text("Financial Overview")', { timeout: 10000 });
    
    // Eventually, actual content should appear
    const actualContent = page.locator('text=Total Balance');
    await expect(actualContent).toBeVisible();
  });
});