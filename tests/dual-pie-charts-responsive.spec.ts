/**
 * Playwright E2E Tests for Dual Pie Charts Responsive Behavior
 * 
 * These tests validate:
 * - Charts display side-by-side on desktop (≥768px)
 * - Charts stack vertically on mobile (<768px)
 * - Chart readability at various screen sizes
 * - Touch interactions work on mobile devices
 * - Layout with different transaction data volumes
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { test, expect, Page } from '@playwright/test';

// Test viewport sizes
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  mobileSmall: { width: 320, height: 568 },
  mobileLarge: { width: 414, height: 896 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  desktopLarge: { width: 1920, height: 1080 },
};

// Helper function to wait for charts to load
async function waitForChartsToLoad(page: Page) {
  // Wait for the dual chart container
  await page.waitForSelector('[role="group"][aria-label*="Income and expense"]', { timeout: 10000 });
  
  // Wait for at least one chart to be visible
  await page.waitForSelector('[role="region"]', { timeout: 10000 });
}

// Helper function to get chart layout info
async function getChartLayout(page: Page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[role="group"][aria-label*="Income and expense"]');
    if (!container) return null;

    const charts = container.querySelectorAll('[role="region"]');
    const incomeChart = Array.from(charts).find(chart => 
      chart.getAttribute('aria-label')?.includes('Income')
    );
    const expenseChart = Array.from(charts).find(chart => 
      chart.getAttribute('aria-label')?.includes('Expense')
    );

    if (!incomeChart || !expenseChart) return null;

    const incomeRect = incomeChart.getBoundingClientRect();
    const expenseRect = expenseChart.getBoundingClientRect();

    return {
      incomeRect: {
        top: incomeRect.top,
        bottom: incomeRect.bottom,
        left: incomeRect.left,
        right: incomeRect.right,
        width: incomeRect.width,
        height: incomeRect.height,
      },
      expenseRect: {
        top: expenseRect.top,
        bottom: expenseRect.bottom,
        left: expenseRect.left,
        right: expenseRect.right,
        width: expenseRect.width,
        height: expenseRect.height,
      },
      isStacked: expenseRect.top > incomeRect.bottom - 10,
      isSideBySide: Math.abs(incomeRect.top - expenseRect.top) < 50,
    };
  });
}

test.describe('Dual Pie Charts - Responsive Behavior', () => {
  
  test.describe('Requirement 7.1: Desktop Side-by-Side Layout (≥768px)', () => {
    
    test('should display charts side-by-side on tablet (768px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto('/'); // Adjust URL to your test page
      await waitForChartsToLoad(page);

      const layout = await getChartLayout(page);
      expect(layout).not.toBeNull();
      expect(layout?.isSideBySide).toBe(true);
      expect(layout?.isStacked).toBe(false);
    });

    test('should display charts side-by-side on desktop (1280px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      await waitForChartsToLoad(page);

      const layout = await getChartLayout(page);
      expect(layout).not.toBeNull();
      expect(layout?.isSideBySide).toBe(true);
      expect(layout?.isStacked).toBe(false);
    });

    test('should display charts side-by-side on large desktop (1920px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktopLarge);
      await page.goto('/');
      await waitForChartsToLoad(page);

      const layout = await getChartLayout(page);
      expect(layout).not.toBeNull();
      expect(layout?.isSideBySide).toBe(true);
      expect(layout?.isStacked).toBe(false);
    });

    test('should have equal width charts on desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      await waitForChartsToLoad(page);

      const layout = await getChartLayout(page);
      expect(layout).not.toBeNull();
      
      // Charts should have similar widths (within 10% tolerance)
      const widthDiff = Math.abs(layout!.incomeRect.width - layout!.expenseRect.width);
      const avgWidth = (layout!.incomeRect.width + layout!.expenseRect.width) / 2;
      const widthDiffPercent = (widthDiff / avgWidth) * 100;
      
      expect(widthDiffPercent).toBeLessThan(10);
    });
  });

  test.describe('Requirement 7.2: Mobile Stacked Layout (<768px)', () => {
    
    test('should stack charts vertically on small mobile (320px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobileSmall);
      await page.goto('/');
      await waitForChartsToLoad(page);

      const layout = await getChartLayout(page);
      expect(layout).not.toBeNull();
      expect(layout?.isStacked).toBe(true);
      expect(layout?.isSideBySide).toBe(false);
    });

    test('should stack charts vertically on mobile (375px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await waitForChartsToLoad(page);

      const layout = await getChartLayout(page);
      expect(layout).not.toBeNull();
      expect(layout?.isStacked).toBe(true);
      expect(layout?.isSideBySide).toBe(false);
    });

    test('should stack charts vertically on large mobile (414px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobileLarge);
      await page.goto('/');
      await waitForChartsToLoad(page);

      const layout = await getChartLayout(page);
      expect(layout).not.toBeNull();
      expect(layout?.isStacked).toBe(true);
      expect(layout?.isSideBySide).toBe(false);
    });

    test('should have income chart above expense chart on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await waitForChartsToLoad(page);

      const layout = await getChartLayout(page);
      expect(layout).not.toBeNull();
      expect(layout!.incomeRect.top).toBeLessThan(layout!.expenseRect.top);
    });
  });

  test.describe('Requirement 7.3: Chart Readability at Various Screen Sizes', () => {
    
    test('should maintain minimum chart width on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobileSmall);
      await page.goto('/');
      await waitForChartsToLoad(page);

      const layout = await getChartLayout(page);
      expect(layout).not.toBeNull();
      
      const MIN_WIDTH = 280;
      expect(layout!.incomeRect.width).toBeGreaterThanOrEqual(MIN_WIDTH);
      expect(layout!.expenseRect.width).toBeGreaterThanOrEqual(MIN_WIDTH);
    });

    test('should have readable font sizes', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await waitForChartsToLoad(page);

      const fontSizes = await page.evaluate(() => {
        const textElements = document.querySelectorAll('[role="region"] text, [role="region"] span, [role="region"] p');
        const sizes: number[] = [];
        
        textElements.forEach(element => {
          const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
          if (fontSize > 0) sizes.push(fontSize);
        });
        
        return sizes;
      });

      // All font sizes should be at least 12px
      fontSizes.forEach(size => {
        expect(size).toBeGreaterThanOrEqual(12);
      });
    });

    test('should not overflow viewport on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await waitForChartsToLoad(page);

      const overflow = await page.evaluate(() => {
        const container = document.querySelector('[role="group"][aria-label*="Income and expense"]');
        if (!container) return true;
        
        const rect = container.getBoundingClientRect();
        return rect.right > window.innerWidth || rect.bottom > window.innerHeight;
      });

      expect(overflow).toBe(false);
    });

    test('should maintain chart height across screen sizes', async ({ page }) => {
      const viewports = [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop];
      const heights: number[] = [];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await waitForChartsToLoad(page);

        const height = await page.evaluate(() => {
          const container = document.querySelector('.recharts-responsive-container');
          return container?.getBoundingClientRect().height || 0;
        });

        heights.push(height);
      }

      // All heights should be around 350px (within 50px tolerance)
      heights.forEach(height => {
        expect(height).toBeGreaterThan(300);
        expect(height).toBeLessThan(400);
      });
    });
  });

  test.describe('Requirement 7.4: Touch Interactions on Mobile Devices', () => {
    
    test('should have touch-friendly legend items', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await waitForChartsToLoad(page);

      const touchTargets = await page.evaluate(() => {
        const MIN_SIZE = 44;
        const legendItems = document.querySelectorAll('[role="button"]');
        const violations: Array<{ width: number; height: number }> = [];

        legendItems.forEach(item => {
          const rect = item.getBoundingClientRect();
          if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
            violations.push({ width: rect.width, height: rect.height });
          }
        });

        return violations;
      });

      // All touch targets should meet minimum size
      expect(touchTargets.length).toBe(0);
    });

    test('should have adequate spacing between touch targets', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await waitForChartsToLoad(page);

      const spacingIssues = await page.evaluate(() => {
        const MIN_SPACING = 8;
        const legendItems = Array.from(document.querySelectorAll('[role="button"]'));
        const issues: number[] = [];

        for (let i = 0; i < legendItems.length - 1; i++) {
          const current = legendItems[i].getBoundingClientRect();
          const next = legendItems[i + 1].getBoundingClientRect();
          
          const horizontalGap = next.left - current.right;
          if (horizontalGap < MIN_SPACING && horizontalGap > -current.width) {
            issues.push(horizontalGap);
          }
        }

        return issues;
      });

      // Should have adequate spacing
      expect(spacingIssues.length).toBe(0);
    });

    test('should be able to tap legend items', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await waitForChartsToLoad(page);

      // Find first legend item
      const legendItem = page.locator('[role="button"]').first();
      await expect(legendItem).toBeVisible();
      
      // Should be able to tap it
      await legendItem.tap();
      
      // No error should occur
    });
  });

  test.describe('Requirement 7.5: Layout with Different Transaction Data Volumes', () => {
    
    test('should handle empty state gracefully', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      // Navigate to page with no transactions
      await page.goto('/?transactions=empty');
      
      // Should show empty state message
      const emptyState = page.locator('[role="status"]');
      await expect(emptyState).toBeVisible();
      
      const text = await emptyState.textContent();
      expect(text).toContain('No transaction');
    });

    test('should handle small dataset (5 transactions)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/?transactions=small');
      await waitForChartsToLoad(page);

      // Charts should render
      const charts = page.locator('[role="region"]');
      await expect(charts.first()).toBeVisible();
      
      // Should have pie slices
      const slices = page.locator('.recharts-pie-sector');
      const count = await slices.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should handle medium dataset (20 transactions)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/?transactions=medium');
      await waitForChartsToLoad(page);

      // Charts should render without issues
      const charts = page.locator('[role="region"]');
      await expect(charts.first()).toBeVisible();
      
      // Legend should be readable
      const legendItems = page.locator('[role="button"]');
      const count = await legendItems.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(20);
    });

    test('should handle large dataset (50+ transactions)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/?transactions=large');
      await waitForChartsToLoad(page);

      // Charts should still render
      const charts = page.locator('[role="region"]');
      await expect(charts.first()).toBeVisible();
      
      // Should not have too many slices (max 20 recommended)
      const slices = page.locator('.recharts-pie-sector');
      const count = await slices.count();
      expect(count).toBeLessThanOrEqual(20);
    });

    test('should not overflow container with many categories', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/?transactions=large');
      await waitForChartsToLoad(page);

      const overflow = await page.evaluate(() => {
        const container = document.querySelector('[role="group"]');
        if (!container) return true;
        
        const rect = container.getBoundingClientRect();
        return rect.right > window.innerWidth;
      });

      expect(overflow).toBe(false);
    });
  });

  test.describe('Cross-Viewport Transition Tests', () => {
    
    test('should transition smoothly from mobile to desktop', async ({ page }) => {
      // Start on mobile
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await waitForChartsToLoad(page);

      let layout = await getChartLayout(page);
      expect(layout?.isStacked).toBe(true);

      // Resize to desktop
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.waitForTimeout(500); // Wait for layout to adjust

      layout = await getChartLayout(page);
      expect(layout?.isSideBySide).toBe(true);
    });

    test('should transition smoothly from desktop to mobile', async ({ page }) => {
      // Start on desktop
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      await waitForChartsToLoad(page);

      let layout = await getChartLayout(page);
      expect(layout?.isSideBySide).toBe(true);

      // Resize to mobile
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.waitForTimeout(500); // Wait for layout to adjust

      layout = await getChartLayout(page);
      expect(layout?.isStacked).toBe(true);
    });
  });
});
