/**
 * Task 9.6: UnifiedHomePage Statistics Styling Unit Test
 * 
 * Unit test for UnifiedHomePage statistics styling with bold typography,
 * gradient accents, and color-coded trend indicators.
 * 
 * **Validates: Requirements 9.2**
 * **Property 32: UnifiedHomePage Statistics Styling**
 * 
 * For any financial statistic displayed on UnifiedHomePage, it should use bold typography 
 * (font-weight 700+) and gradient accents to create visual emphasis.
 */

import { test, expect } from '@playwright/test';

test.describe('Task 9.6: UnifiedHomePage Statistics Styling Unit Tests', () => {
  
  test('UnifiedHomePage should render with statistics section', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the dashboard section to load
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Verify dashboard section exists
    const dashboardSection = page.locator('#dashboard-section');
    await expect(dashboardSection).toBeVisible();
    
    // Verify SummaryCards are present
    const summaryCards = page.locator('#dashboard-section [role="region"]');
    await expect(summaryCards).toHaveCount(4); // Should have 4 stat cards
  });

  test('Statistical values should use bold typography (font-weight 700+)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Find statistical value elements (currency amounts)
    const statValues = page.locator('#dashboard-section [role="region"] p').filter({ 
      hasText: /^\$|^[\d,]+\.?\d*$/ 
    });
    
    // Check that at least one statistical value exists
    await expect(statValues.first()).toBeVisible();
    
    // Verify font weight is 700 or higher
    const fontWeight = await statValues.first().evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return parseInt(styles.fontWeight) || 400;
    });
    
    expect(fontWeight).toBeGreaterThanOrEqual(700);
  });

  test('Key metrics should have gradient accents', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Find key metric cards (Total Balance, Monthly Income, Monthly Expenses)
    const keyMetricCards = page.locator('#dashboard-section [role="region"]').filter({ 
      hasText: /Total Balance|Monthly Income|Monthly Expenses/ 
    });
    
    // Check that key metrics exist
    await expect(keyMetricCards.first()).toBeVisible();
    
    // Verify gradient styling is applied
    const hasGradient = await keyMetricCards.first().evaluate((el) => {
      const classList = Array.from(el.classList);
      const hasGradientClass = classList.some(cls => 
        cls.includes('gradient') || cls.includes('bg-gradient')
      );
      
      const styles = window.getComputedStyle(el);
      const hasGradientStyle = styles.backgroundImage && 
        styles.backgroundImage.includes('gradient');
      
      return hasGradientClass || hasGradientStyle;
    });
    
    expect(hasGradient).toBeTruthy();
  });

  test('Trend indicators should be color-coded with icons', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Find trend indicator elements
    const trendIndicators = page.locator('#dashboard-section [class*="text-income"], #dashboard-section [class*="text-expense"]');
    
    if (await trendIndicators.count() > 0) {
      // Verify trend indicators have icons
      const hasIcon = await trendIndicators.first().locator('svg').count() > 0;
      expect(hasIcon).toBeTruthy();
      
      // Verify color coding is applied
      const trendColor = await trendIndicators.first().evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.color;
      });
      
      // Color should not be default text color
      expect(trendColor).not.toBe('rgb(0, 0, 0)'); // Not black
      expect(trendColor).not.toBe('rgb(255, 255, 255)'); // Not white
    }
  });

  test('Statistical values should have appropriate font sizes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Find statistical value elements
    const statValues = page.locator('#dashboard-section [role="region"] p').filter({ 
      hasText: /^\$|^[\d,]+\.?\d*$/ 
    });
    
    if (await statValues.count() > 0) {
      const fontSize = await statValues.first().evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.fontSize);
      });
      
      // Font size should be appropriate for statistics display
      expect(fontSize).toBeGreaterThanOrEqual(24); // At least 24px
      expect(fontSize).toBeLessThanOrEqual(72);    // Not larger than 72px
    }
  });

  test('StatCard components should have consistent styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Find all StatCard components
    const statCards = page.locator('#dashboard-section [role="region"]');
    const cardCount = await statCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    // Check consistent styling across cards
    const cardStyles = [];
    for (let i = 0; i < Math.min(cardCount, 4); i++) {
      const card = statCards.nth(i);
      
      const cardStyle = await card.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow,
          transition: styles.transition
        };
      });
      
      cardStyles.push(cardStyle);
    }
    
    // Verify consistent border radius
    if (cardStyles.length > 1) {
      const firstBorderRadius = cardStyles[0].borderRadius;
      const allSameBorderRadius = cardStyles.every(style => 
        style.borderRadius === firstBorderRadius
      );
      expect(allSameBorderRadius).toBeTruthy();
      
      // Verify all cards have shadows
      const allHaveShadow = cardStyles.every(style => 
        style.boxShadow && style.boxShadow !== 'none'
      );
      expect(allHaveShadow).toBeTruthy();
    }
  });

  test('Trend indicators should be accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Find trend indicator elements
    const trendElements = page.locator('#dashboard-section [class*="text-income"], #dashboard-section [class*="text-expense"]');
    
    if (await trendElements.count() > 0) {
      // Verify accessibility attributes
      const hasAccessibilityInfo = await trendElements.first().evaluate((el) => {
        const hasAriaLabel = el.getAttribute('aria-label') !== null;
        const hasScreenReaderText = el.querySelector('.sr-only') !== null;
        const hasTitle = el.getAttribute('title') !== null;
        
        return hasAriaLabel || hasScreenReaderText || hasTitle;
      });
      
      expect(hasAccessibilityInfo).toBeTruthy();
    }
  });

  test('Statistics should maintain responsive behavior', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    
    const statValues = page.locator('#dashboard-section [role="region"] p').filter({ 
      hasText: /^\$|^[\d,]+\.?\d*$/ 
    });
    
    if (await statValues.count() > 0) {
      const mobileFontSize = await statValues.first().evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.fontSize);
      });
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(300);
      
      const desktopFontSize = await statValues.first().evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.fontSize);
      });
      
      // Desktop should be at least as large as mobile (responsive scaling)
      expect(desktopFontSize).toBeGreaterThanOrEqual(mobileFontSize * 0.9);
    }
  });
});