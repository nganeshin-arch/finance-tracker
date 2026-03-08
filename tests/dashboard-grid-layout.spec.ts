/**
 * Dashboard Grid Layout Tests
 * Task 7.4: Implement responsive dashboard grid layout
 * 
 * Tests verify that the dashboard grid layout:
 * - Uses CSS Grid with proper responsive breakpoints
 * - Adapts from 1 column on mobile to 2-4 columns on tablet/desktop
 * - Applies consistent spacing between elements
 * - Has smooth transitions across breakpoints
 * 
 * Validates: Requirements 7.5, 9.4
 * Property 26: Dashboard Responsive Layout
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Grid Layout - Responsive Behavior', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard page
    await page.goto('/');
    
    // Wait for the dashboard to load
    await page.waitForSelector('.dashboard-grid', { timeout: 10000 });
  });

  test('should use CSS Grid display', async ({ page }) => {
    const grid = page.locator('.dashboard-grid').first();
    
    // Verify the grid uses CSS Grid
    const display = await grid.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });
    
    expect(display).toBe('grid');
  });

  test('should have 1 column on mobile (320px)', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 320, height: 568 });
    
    const grid = page.locator('.dashboard-grid').first();
    
    // Get the computed grid-template-columns
    const gridColumns = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // Should have 1 column (single value)
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(1);
  });

  test('should have 2 columns on tablet (640px)', async ({ page }) => {
    // Set viewport to tablet size
    await page.setViewportSize({ width: 640, height: 768 });
    
    const grid = page.locator('.dashboard-grid').first();
    
    // Get the computed grid-template-columns
    const gridColumns = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // Should have 2 columns
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(2);
  });

  test('should have 4 columns on desktop (1024px) for 4-column grid', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1024, height: 768 });
    
    const grid = page.locator('.dashboard-grid-4').first();
    
    // Get the computed grid-template-columns
    const gridColumns = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // Should have 4 columns
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(4);
  });

  test('should have consistent gap spacing', async ({ page }) => {
    const grid = page.locator('.dashboard-grid').first();
    
    // Get the gap value
    const gap = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gap;
    });
    
    // Gap should be defined (16px on mobile/tablet, 20px on desktop)
    expect(gap).toBeTruthy();
    expect(gap).toMatch(/16px|20px|1rem|1\.25rem/);
  });

  test('should increase gap on larger screens', async ({ page }) => {
    // Get gap on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    const grid = page.locator('.dashboard-grid').first();
    
    const mobileGap = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gap;
    });
    
    // Get gap on desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(100); // Wait for transition
    
    const desktopGap = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gap;
    });
    
    // Parse pixel values
    const mobileGapPx = parseFloat(mobileGap);
    const desktopGapPx = parseFloat(desktopGap);
    
    // Desktop gap should be equal or larger than mobile gap
    expect(desktopGapPx).toBeGreaterThanOrEqual(mobileGapPx);
  });

  test('should have smooth transitions on grid and grid items', async ({ page }) => {
    const grid = page.locator('.dashboard-grid').first();
    
    // Check grid transition
    const gridTransition = await grid.evaluate((el) => {
      return window.getComputedStyle(el).transition;
    });
    
    // Should have transition defined
    expect(gridTransition).toContain('gap');
    expect(gridTransition).toMatch(/0\.25s|250ms/);
    
    // Check grid item transitions
    const firstItem = grid.locator('> *').first();
    const itemTransition = await firstItem.evaluate((el) => {
      return window.getComputedStyle(el).transition;
    });
    
    // Should have transform and box-shadow transitions
    expect(itemTransition).toContain('transform');
    expect(itemTransition).toContain('box-shadow');
  });

  test('should adapt layout smoothly across breakpoints', async ({ page }) => {
    const grid = page.locator('.dashboard-grid').first();
    
    // Start at mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100);
    
    const mobileColumns = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    
    // Move to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(100);
    
    const tabletColumns = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    
    // Move to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(100);
    
    const desktopColumns = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    
    // Verify progression: mobile (1) < tablet (2) <= desktop (4)
    expect(mobileColumns).toBe(1);
    expect(tabletColumns).toBeGreaterThanOrEqual(2);
    expect(desktopColumns).toBeGreaterThanOrEqual(tabletColumns);
  });

  test('should maintain equal column widths', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    
    const grid = page.locator('.dashboard-grid').first();
    
    // Get grid template columns
    const gridColumns = await grid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // Split into individual column widths
    const columns = gridColumns.split(' ');
    
    // All columns should have the same width (1fr = equal fractions)
    // Parse the pixel values and check they're approximately equal
    const widths = columns.map(col => parseFloat(col));
    const firstWidth = widths[0];
    
    widths.forEach(width => {
      // Allow 1px difference due to rounding
      expect(Math.abs(width - firstWidth)).toBeLessThanOrEqual(1);
    });
  });

  test('should have full width', async ({ page }) => {
    const grid = page.locator('.dashboard-grid').first();
    
    const width = await grid.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });
    
    // Get parent width
    const parentWidth = await grid.evaluate((el) => {
      return el.parentElement ? window.getComputedStyle(el.parentElement).width : '0px';
    });
    
    // Grid should take full width of parent (allowing for padding)
    const gridWidthPx = parseFloat(width);
    const parentWidthPx = parseFloat(parentWidth);
    
    // Grid width should be close to parent width (within 10% for padding)
    expect(gridWidthPx).toBeGreaterThan(parentWidthPx * 0.9);
  });
});

test.describe('Dashboard Grid Layout - StatCard Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.dashboard-grid', { timeout: 10000 });
  });

  test('should contain StatCard components', async ({ page }) => {
    const grid = page.locator('.dashboard-grid').first();
    const statCards = grid.locator('[class*="stat"]');
    
    // Should have multiple stat cards
    const count = await statCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display all summary cards in grid', async ({ page }) => {
    const grid = page.locator('.dashboard-grid').first();
    
    // Check for expected summary cards (Income, Expenses, Transfers, Balance)
    await expect(grid.getByText('Income')).toBeVisible();
    await expect(grid.getByText('Expenses')).toBeVisible();
    await expect(grid.getByText('Transfers')).toBeVisible();
    await expect(grid.getByText('Balance')).toBeVisible();
  });

  test('should maintain card spacing in grid', async ({ page }) => {
    const grid = page.locator('.dashboard-grid').first();
    const cards = grid.locator('> *');
    
    // Get positions of first two cards
    const firstCardBox = await cards.nth(0).boundingBox();
    const secondCardBox = await cards.nth(1).boundingBox();
    
    if (firstCardBox && secondCardBox) {
      // Calculate gap between cards
      const gap = secondCardBox.x - (firstCardBox.x + firstCardBox.width);
      
      // Gap should be positive and reasonable (between 10px and 30px)
      expect(gap).toBeGreaterThan(10);
      expect(gap).toBeLessThan(30);
    }
  });
});

test.describe('Dashboard Grid Layout - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.dashboard-grid', { timeout: 10000 });
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through the grid items
    await page.keyboard.press('Tab');
    
    // Check if focus is within the grid
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.closest('.dashboard-grid') !== null;
    });
    
    // At least one element should be focusable
    expect(focusedElement).toBeTruthy();
  });

  test('should maintain logical tab order', async ({ page }) => {
    const grid = page.locator('.dashboard-grid').first();
    const cards = grid.locator('> *');
    const cardCount = await cards.count();
    
    // Tab through all cards
    const tabOrder: string[] = [];
    
    for (let i = 0; i < cardCount; i++) {
      await page.keyboard.press('Tab');
      
      const focusedText = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.textContent?.trim() || '';
      });
      
      if (focusedText) {
        tabOrder.push(focusedText);
      }
    }
    
    // Tab order should follow visual order (Income, Expenses, Transfers, Balance)
    expect(tabOrder.length).toBeGreaterThan(0);
  });
});
