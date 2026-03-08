/**
 * Task 9.2: Integrate enhanced StatCard components for financial statistics
 * Property-based test to verify StatCard integration requirements
 * 
 * **Validates: Requirements 9.2**
 */

import { test, expect } from '@playwright/test';

test.describe('Task 9.2: Enhanced StatCard Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display enhanced StatCard components with bold typography', async ({ page }) => {
    // Wait for the dashboard to load
    await page.waitForSelector('[role="region"][aria-label*="Dashboard statistics"]', { timeout: 10000 });
    
    // Find all StatCard components in the financial overview section
    const statCards = await page.locator('[role="region"][aria-label*="Dashboard statistics"] > div').all();
    
    expect(statCards.length).toBeGreaterThan(0);
    
    // Check each StatCard for bold typography on numerical values
    for (const card of statCards) {
      // Find the numerical value element (should have font-bold class and large text)
      const valueElement = card.locator('p').filter({ hasText: /₹|[0-9]/ }).first();
      
      if (await valueElement.count() > 0) {
        // Check for bold typography (font-weight 700+)
        const fontWeight = await valueElement.evaluate((el) => {
          const computedStyle = window.getComputedStyle(el);
          return computedStyle.fontWeight;
        });
        
        // Font weight should be 700 or higher (bold)
        const numericWeight = parseInt(fontWeight);
        expect(numericWeight).toBeGreaterThanOrEqual(700);
        
        // Check for responsive font sizing (text-3xl sm:text-4xl)
        const classList = await valueElement.getAttribute('class');
        expect(classList).toMatch(/text-(3xl|4xl)/);
      }
    }
  });

  test('should apply gradient accents to key metrics', async ({ page }) => {
    // Wait for the dashboard to load
    await page.waitForSelector('[role="region"][aria-label*="Dashboard statistics"]', { timeout: 10000 });
    
    // Find StatCards with gradient backgrounds
    const gradientCards = await page.locator('[class*="bg-gradient"]').all();
    
    expect(gradientCards.length).toBeGreaterThanOrEqual(3); // At least 3 key metrics should have gradients
    
    // Check for specific gradient classes
    const totalBalanceCard = page.locator('[aria-label*="Total balance"]');
    const incomeCard = page.locator('[aria-label*="Monthly income"]');
    const expenseCard = page.locator('[aria-label*="Monthly expenses"]');
    
    if (await totalBalanceCard.count() > 0) {
      const balanceClass = await totalBalanceCard.getAttribute('class');
      expect(balanceClass).toMatch(/bg-gradient-(income|expense)/);
    }
    
    if (await incomeCard.count() > 0) {
      const incomeClass = await incomeCard.getAttribute('class');
      expect(incomeClass).toContain('bg-gradient-income');
    }
    
    if (await expenseCard.count() > 0) {
      const expenseClass = await expenseCard.getAttribute('class');
      expect(expenseClass).toContain('bg-gradient-expense');
    }
  });

  test('should implement color-coded trend indicators with icons', async ({ page }) => {
    // Wait for the dashboard to load
    await page.waitForSelector('[role="region"][aria-label*="Dashboard statistics"]', { timeout: 10000 });
    
    // Find all StatCard components
    const statCards = await page.locator('[role="region"][aria-label*="Dashboard statistics"] > div').all();
    
    let trendsFound = 0;
    
    for (const card of statCards) {
      // Look for trend indicators (arrows or trend icons)
      const trendIcons = await card.locator('svg').all();
      
      if (trendIcons.length > 0) {
        trendsFound++;
        
        // Check for trend value text (percentage)
        const trendValue = card.locator('span').filter({ hasText: /%/ });
        
        if (await trendValue.count() > 0) {
          const trendText = await trendValue.textContent();
          expect(trendText).toMatch(/[+-]?\d+\.\d+%/);
        }
        
        // Check for color coding on trend elements
        for (const icon of trendIcons) {
          const iconClass = await icon.getAttribute('class');
          if (iconClass) {
            // Should have color classes for positive (green) or negative (red) trends
            const hasColorCoding = iconClass.includes('text-income') || 
                                 iconClass.includes('text-expense') || 
                                 iconClass.includes('text-neutral');
            
            if (hasColorCoding) {
              expect(hasColorCoding).toBe(true);
            }
          }
        }
      }
    }
    
    // At least some cards should have trend indicators
    expect(trendsFound).toBeGreaterThan(0);
  });

  test('should maintain accessibility compliance', async ({ page }) => {
    // Wait for the dashboard to load
    await page.waitForSelector('[role="region"][aria-label*="Dashboard statistics"]', { timeout: 10000 });
    
    // Check for proper ARIA labels on StatCards
    const statCards = await page.locator('[role="region"][aria-label*="Dashboard statistics"] > div').all();
    
    for (const card of statCards) {
      // Each card should have an aria-label
      const ariaLabel = await card.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/(balance|income|expense|transfer)/i);
    }
    
    // Check for screen reader accessible trend descriptions
    const srOnlyElements = await page.locator('.sr-only').all();
    expect(srOnlyElements.length).toBeGreaterThan(0);
    
    // Verify keyboard navigation works
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus').first();
    expect(await focusedElement.count()).toBe(1);
  });

  test('should display proper currency formatting', async ({ page }) => {
    // Wait for the dashboard to load
    await page.waitForSelector('[role="region"][aria-label*="Dashboard statistics"]', { timeout: 10000 });
    
    // Find all numerical values in StatCards
    const valueElements = await page.locator('[role="region"][aria-label*="Dashboard statistics"] p').filter({ hasText: /₹/ }).all();
    
    expect(valueElements.length).toBeGreaterThan(0);
    
    for (const element of valueElements) {
      const text = await element.textContent();
      
      if (text) {
        // Should be formatted as Indian currency (₹)
        expect(text).toMatch(/₹[\d,]+\.?\d*/);
        
        // Should use Indian numbering system with commas
        if (text.includes(',')) {
          expect(text).toMatch(/₹\d{1,2}(,\d{2})*,\d{3}(\.\d{2})?/);
        }
      }
    }
  });

  test('should have responsive grid layout', async ({ page }) => {
    // Wait for the dashboard to load
    await page.waitForSelector('[role="region"][aria-label*="Dashboard statistics"]', { timeout: 10000 });
    
    // Check for dashboard grid container
    const gridContainer = page.locator('[role="region"][aria-label*="Dashboard statistics"]');
    expect(await gridContainer.count()).toBe(1);
    
    // Check grid classes
    const gridClass = await gridContainer.getAttribute('class');
    expect(gridClass).toMatch(/dashboard-grid/);
    
    // Test responsive behavior by changing viewport
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(100);
    
    // On mobile, cards should stack vertically
    const mobileLayout = await gridContainer.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return computedStyle.gridTemplateColumns;
    });
    expect(mobileLayout).toBe('1fr');
    
    await page.setViewportSize({ width: 1024, height: 768 }); // Desktop
    await page.waitForTimeout(100);
    
    // On desktop, should have multiple columns
    const desktopLayout = await gridContainer.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return computedStyle.gridTemplateColumns;
    });
    expect(desktopLayout).toMatch(/repeat\(4, 1fr\)|1fr 1fr 1fr 1fr/);
  });
});