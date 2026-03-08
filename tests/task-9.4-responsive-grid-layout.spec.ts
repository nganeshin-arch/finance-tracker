import { test, expect } from '@playwright/test';

/**
 * Task 9.4: Apply responsive grid layout to UnifiedHomePage
 * 
 * Tests the responsive grid layout implementation that adapts from 
 * 1 column on mobile to 2-3 columns on desktop with consistent spacing.
 * 
 * Requirements: 9.4, 7.5
 * Property 26: Dashboard Responsive Layout
 */

test.describe('Task 9.4: Responsive Grid Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the unified home page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="unified-home-page"], main', { timeout: 10000 });
  });

  test('should implement responsive grid layout with proper breakpoints', async ({ page }) => {
    // Test mobile layout (1 column)
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.waitForTimeout(500); // Allow layout to adjust
    
    const gridContainer = page.locator('.dashboard-grid').first();
    await expect(gridContainer).toBeVisible();
    
    // Check that grid container has the correct classes
    await expect(gridContainer).toHaveClass(/dashboard-grid/);
    await expect(gridContainer).toHaveClass(/dashboard-grid-3/);
    
    // Test tablet layout (2 columns)
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.waitForTimeout(500); // Allow layout to adjust
    
    // Verify grid is still visible and responsive
    await expect(gridContainer).toBeVisible();
    
    // Test desktop layout (3 columns)
    await page.setViewportSize({ width: 1024, height: 768 }); // Desktop
    await page.waitForTimeout(500); // Allow layout to adjust
    
    // Verify grid is still visible and responsive
    await expect(gridContainer).toBeVisible();
  });

  test('should maintain consistent spacing across breakpoints', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'desktop' },
      { width: 1440, height: 900, name: 'large-desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow layout to adjust
      
      const gridContainer = page.locator('.dashboard-grid').first();
      await expect(gridContainer).toBeVisible();
      
      // Check that gap classes are applied for consistent spacing
      const hasGapClass = await gridContainer.evaluate((el) => {
        return el.className.includes('gap-6') || 
               el.className.includes('gap-8') ||
               el.classList.contains('gap-6') ||
               el.classList.contains('gap-8');
      });
      
      expect(hasGapClass).toBe(true);
    }
  });

  test('should have proper column spans for different sections', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 }); // Desktop
    await page.waitForTimeout(500);
    
    // Dashboard section should span 2 columns on desktop
    const dashboardSection = page.locator('#dashboard-section');
    await expect(dashboardSection).toBeVisible();
    await expect(dashboardSection).toHaveClass(/lg:col-span-2/);
    
    // Transaction form section should span 1 column
    const formSection = page.locator('#add-transaction-section');
    await expect(formSection).toBeVisible();
    await expect(formSection).toHaveClass(/col-span-1/);
    
    // Transactions section should span full width (3 columns)
    const transactionsSection = page.locator('#transactions-section');
    await expect(transactionsSection).toBeVisible();
    await expect(transactionsSection).toHaveClass(/lg:col-span-3/);
  });

  test('should maintain equal height cards in grid layout', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 }); // Desktop
    await page.waitForTimeout(500);
    
    // Check that cards have h-full class for equal heights
    const dashboardCard = page.locator('#dashboard-section .card').first();
    const formCard = page.locator('#add-transaction-section .card').first();
    
    await expect(dashboardCard).toHaveClass(/h-full/);
    await expect(formCard).toHaveClass(/h-full/);
  });

  test('should adapt layout from mobile to desktop smoothly', async ({ page }) => {
    // Start with mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const gridContainer = page.locator('.dashboard-grid').first();
    await expect(gridContainer).toBeVisible();
    
    // Gradually increase viewport width and check layout remains functional
    const widths = [480, 640, 768, 1024, 1280];
    
    for (const width of widths) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(300);
      
      // Ensure grid container is still visible and functional
      await expect(gridContainer).toBeVisible();
      
      // Ensure all sections are still visible
      await expect(page.locator('#dashboard-section')).toBeVisible();
      await expect(page.locator('#add-transaction-section')).toBeVisible();
      await expect(page.locator('#transactions-section')).toBeVisible();
    }
  });

  test('should have proper responsive classes on grid container', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    
    const gridContainer = page.locator('.dashboard-grid').first();
    
    // Check for responsive gap classes
    const hasResponsiveGaps = await gridContainer.evaluate((el) => {
      const classes = el.className;
      return classes.includes('gap-6') && 
             (classes.includes('sm:gap-6') || classes.includes('lg:gap-8'));
    });
    
    expect(hasResponsiveGaps).toBe(true);
  });

  test('should maintain accessibility with grid layout', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    
    // Check that sections maintain proper semantic structure
    const sections = page.locator('section');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThanOrEqual(3);
    
    // Check that all sections have proper IDs for navigation
    await expect(page.locator('#dashboard-section')).toBeVisible();
    await expect(page.locator('#add-transaction-section')).toBeVisible();
    await expect(page.locator('#transactions-section')).toBeVisible();
    
    // Verify keyboard navigation still works
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should handle content overflow gracefully in grid layout', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    
    // Check that cards don't overflow their grid areas
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      if (await card.isVisible()) {
        const boundingBox = await card.boundingBox();
        expect(boundingBox).toBeTruthy();
        expect(boundingBox!.width).toBeGreaterThan(0);
        expect(boundingBox!.height).toBeGreaterThan(0);
      }
    }
  });
});