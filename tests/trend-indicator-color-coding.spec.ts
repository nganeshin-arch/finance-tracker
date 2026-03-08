/**
 * Property-Based Test: Trend Indicator Color Coding
 * 
 * **Validates: Requirements 7.2, 11.5**
 * 
 * Property 23: Trend Indicator Color Coding
 * For any trend indicator displaying financial changes, positive trends should be 
 * styled with green colors and negative trends should be styled with red colors, 
 * with additional non-color indicators (arrows, icons) for accessibility.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const TEST_ITERATIONS = 100; // Property-based testing requires multiple iterations

/**
 * Parse RGB/RGBA color string to extract color components
 */
function parseColor(color: string): { r: number; g: number; b: number; a: number } | null {
  if (!color) return null;
  
  // Match rgb(r, g, b) or rgba(r, g, b, a)
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
    };
  }
  
  return null;
}

/**
 * Check if color is green (positive trend)
 * Green colors have higher green component than red and blue
 */
function isGreenColor(color: string): boolean {
  const parsed = parseColor(color);
  if (!parsed) return false;
  
  // Green should have g > r and g > b
  // Allow some tolerance for dark mode variations
  return parsed.g > parsed.r && parsed.g > parsed.b;
}

/**
 * Check if color is red (negative trend)
 * Red colors have higher red component than green and blue
 */
function isRedColor(color: string): boolean {
  const parsed = parseColor(color);
  if (!parsed) return false;
  
  // Red should have r > g and r > b
  return parsed.r > parsed.g && parsed.r > parsed.b;
}

/**
 * Get trend indicator information from an element
 */
async function getTrendIndicatorInfo(page: Page, selector: string, index: number = 0) {
  return await page.locator(selector).nth(index).evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    // Check for arrow icons (SVG elements)
    const hasArrowUp = el.querySelector('svg[class*="lucide-arrow-up"]') !== null ||
                      el.innerHTML.includes('arrow-up') ||
                      el.innerHTML.includes('ArrowUp');
    
    const hasArrowDown = el.querySelector('svg[class*="lucide-arrow-down"]') !== null ||
                        el.innerHTML.includes('arrow-down') ||
                        el.innerHTML.includes('ArrowDown');
    
    const hasMinus = el.querySelector('svg[class*="lucide-minus"]') !== null ||
                    el.innerHTML.includes('minus') ||
                    el.innerHTML.includes('Minus');
    
    // Check for screen reader text
    const srOnly = el.querySelector('.sr-only');
    const hasScreenReaderText = srOnly !== null && srOnly.textContent !== null && srOnly.textContent.trim().length > 0;
    
    return {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      borderColor: computed.borderLeftColor || computed.borderColor,
      classList: el.className,
      
      // Icon indicators
      hasArrowUp,
      hasArrowDown,
      hasMinus,
      hasIcon: hasArrowUp || hasArrowDown || hasMinus,
      
      // Accessibility
      hasScreenReaderText,
      screenReaderText: srOnly?.textContent || '',
      
      // Aria attributes
      ariaLabel: el.getAttribute('aria-label'),
      ariaDescribedBy: el.getAttribute('aria-describedby'),
      
      // Element info
      tagName: el.tagName.toLowerCase(),
      textContent: el.textContent?.trim() || '',
    };
  });
}

/**
 * Determine trend type from element classes or content
 */
function determineTrendType(info: any): 'positive' | 'negative' | 'neutral' | 'none' {
  const classList = info.classList.toLowerCase();
  const textContent = info.textContent.toLowerCase();
  
  // Check classes
  if (classList.includes('positive') || classList.includes('income')) {
    return 'positive';
  }
  if (classList.includes('negative') || classList.includes('expense')) {
    return 'negative';
  }
  if (classList.includes('neutral')) {
    return 'neutral';
  }
  
  // Check icons
  if (info.hasArrowUp) return 'positive';
  if (info.hasArrowDown) return 'negative';
  if (info.hasMinus) return 'neutral';
  
  // Check text content
  if (textContent.includes('positive') || textContent.includes('up') || textContent.includes('+')) {
    return 'positive';
  }
  if (textContent.includes('negative') || textContent.includes('down') || textContent.includes('-')) {
    return 'negative';
  }
  
  return 'none';
}

/**
 * Check if element exists
 */
async function elementExists(page: Page, selector: string): Promise<boolean> {
  const count = await page.locator(selector).count();
  return count > 0;
}

test.describe('Property 23: Trend Indicator Color Coding', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173/login');
    
    // Fill in login form
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to home page
    await page.waitForURL('**/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('Positive trend indicators should be styled with green colors', async ({ page }) => {
    // Find elements that might contain trend indicators
    const trendSelectors = [
      '[class*="trend"]',
      '[class*="income"]',
      '[class*="positive"]',
      '[class*="border-l-income"]',
      '[class*="text-income"]',
    ];
    
    let totalPositiveTrends = 0;
    let trendsWithGreenColor = 0;
    
    console.log('\n--- Testing Positive Trend Color Coding ---');
    
    for (const selector of trendSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 10);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getTrendIndicatorInfo(page, selector, i);
          const trendType = determineTrendType(info);
          
          // Only test positive trends
          if (trendType !== 'positive') continue;
          
          totalPositiveTrends++;
          
          // Check if any color property is green
          const hasGreenColor = isGreenColor(info.color) || 
                               isGreenColor(info.backgroundColor) ||
                               isGreenColor(info.borderColor);
          
          if (hasGreenColor) {
            trendsWithGreenColor++;
            console.log(`✓ ${selector}[${i}]: Positive trend has green color - "${info.classList}"`);
          } else {
            console.log(`✗ ${selector}[${i}]: Positive trend missing green color - color: "${info.color}", bg: "${info.backgroundColor}", border: "${info.borderColor}"`);
          }
          
          expect(hasGreenColor,
            `${selector}[${i}] positive trend should have green color ` +
            `(color: "${info.color}", backgroundColor: "${info.backgroundColor}", ` +
            `borderColor: "${info.borderColor}", class: "${info.classList}")`
          ).toBe(true);
        }
      }
    }
    
    console.log(`\nTotal positive trends tested: ${totalPositiveTrends}`);
    console.log(`Trends with green color: ${trendsWithGreenColor}/${totalPositiveTrends}`);
    
    // Ensure we tested at least some positive trends
    expect(totalPositiveTrends,
      'Should find at least one positive trend indicator to test'
    ).toBeGreaterThan(0);
  });

  test('Negative trend indicators should be styled with red colors', async ({ page }) => {
    // Find elements that might contain trend indicators
    const trendSelectors = [
      '[class*="trend"]',
      '[class*="expense"]',
      '[class*="negative"]',
      '[class*="border-l-expense"]',
      '[class*="text-expense"]',
    ];
    
    let totalNegativeTrends = 0;
    let trendsWithRedColor = 0;
    
    console.log('\n--- Testing Negative Trend Color Coding ---');
    
    for (const selector of trendSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 10);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getTrendIndicatorInfo(page, selector, i);
          const trendType = determineTrendType(info);
          
          // Only test negative trends
          if (trendType !== 'negative') continue;
          
          totalNegativeTrends++;
          
          // Check if any color property is red
          const hasRedColor = isRedColor(info.color) || 
                             isRedColor(info.backgroundColor) ||
                             isRedColor(info.borderColor);
          
          if (hasRedColor) {
            trendsWithRedColor++;
            console.log(`✓ ${selector}[${i}]: Negative trend has red color - "${info.classList}"`);
          } else {
            console.log(`✗ ${selector}[${i}]: Negative trend missing red color - color: "${info.color}", bg: "${info.backgroundColor}", border: "${info.borderColor}"`);
          }
          
          expect(hasRedColor,
            `${selector}[${i}] negative trend should have red color ` +
            `(color: "${info.color}", backgroundColor: "${info.backgroundColor}", ` +
            `borderColor: "${info.borderColor}", class: "${info.classList}")`
          ).toBe(true);
        }
      }
    }
    
    console.log(`\nTotal negative trends tested: ${totalNegativeTrends}`);
    console.log(`Trends with red color: ${trendsWithRedColor}/${totalNegativeTrends}`);
    
    // Ensure we tested at least some negative trends
    expect(totalNegativeTrends,
      'Should find at least one negative trend indicator to test'
    ).toBeGreaterThan(0);
  });

  test('Trend indicators should include non-color indicators (arrows, icons) for accessibility', async ({ page }) => {
    // Find all trend indicator elements
    const trendSelectors = [
      '[class*="trend"]',
      '[class*="income"]',
      '[class*="expense"]',
      '[class*="positive"]',
      '[class*="negative"]',
      '[class*="border-l-income"]',
      '[class*="border-l-expense"]',
    ];
    
    let totalTrends = 0;
    let trendsWithIcons = 0;
    
    console.log('\n--- Testing Trend Indicator Non-Color Indicators ---');
    
    for (const selector of trendSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 15);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getTrendIndicatorInfo(page, selector, i);
          const trendType = determineTrendType(info);
          
          // Only test elements with trend indicators (not 'none')
          if (trendType === 'none') continue;
          
          totalTrends++;
          
          // Check for icon indicators
          if (info.hasIcon) {
            trendsWithIcons++;
            console.log(`✓ ${selector}[${i}]: Has icon indicator (${trendType}) - ArrowUp: ${info.hasArrowUp}, ArrowDown: ${info.hasArrowDown}, Minus: ${info.hasMinus}`);
          } else {
            console.log(`✗ ${selector}[${i}]: Missing icon indicator (${trendType}) - "${info.classList}"`);
          }
          
          expect(info.hasIcon,
            `${selector}[${i}] trend indicator should have icon (arrow or minus) for accessibility ` +
            `(trendType: ${trendType}, hasArrowUp: ${info.hasArrowUp}, hasArrowDown: ${info.hasArrowDown}, ` +
            `hasMinus: ${info.hasMinus}, class: "${info.classList}")`
          ).toBe(true);
        }
      }
    }
    
    console.log(`\nTotal trends tested: ${totalTrends}`);
    console.log(`Trends with icons: ${trendsWithIcons}/${totalTrends}`);
    
    // Ensure we tested at least some trends
    expect(totalTrends,
      'Should find at least one trend indicator to test'
    ).toBeGreaterThan(0);
  });

  test('Trend indicators should have screen reader accessible text', async ({ page }) => {
    // Find all trend indicator elements
    const trendSelectors = [
      '[class*="trend"]',
      '[class*="income"]',
      '[class*="expense"]',
      '[class*="positive"]',
      '[class*="negative"]',
    ];
    
    let totalTrends = 0;
    let trendsWithA11y = 0;
    
    console.log('\n--- Testing Trend Indicator Screen Reader Accessibility ---');
    
    for (const selector of trendSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 15);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getTrendIndicatorInfo(page, selector, i);
          const trendType = determineTrendType(info);
          
          // Only test elements with trend indicators
          if (trendType === 'none') continue;
          
          totalTrends++;
          
          // Check for accessibility features
          const hasA11y = info.hasScreenReaderText || 
                         (info.ariaLabel !== null && info.ariaLabel.length > 0) ||
                         (info.ariaDescribedBy !== null && info.ariaDescribedBy.length > 0);
          
          if (hasA11y) {
            trendsWithA11y++;
            console.log(`✓ ${selector}[${i}]: Has screen reader text (${trendType}) - "${info.screenReaderText || info.ariaLabel}"`);
          } else {
            console.log(`✗ ${selector}[${i}]: Missing screen reader text (${trendType})`);
          }
          
          expect(hasA11y,
            `${selector}[${i}] trend indicator should have screen reader accessible text ` +
            `(trendType: ${trendType}, hasScreenReaderText: ${info.hasScreenReaderText}, ` +
            `ariaLabel: "${info.ariaLabel}", ariaDescribedBy: "${info.ariaDescribedBy}")`
          ).toBe(true);
        }
      }
    }
    
    console.log(`\nTotal trends tested: ${totalTrends}`);
    console.log(`Trends with accessibility: ${trendsWithA11y}/${totalTrends}`);
    
    // Ensure we tested at least some trends
    expect(totalTrends,
      'Should find at least one trend indicator to test'
    ).toBeGreaterThan(0);
  });

  test('Property-based test: Trend indicator color and icon consistency', async ({ page }) => {
    // This test validates the universal property: ALL trend indicators should have 
    // proper color coding AND non-color indicators
    
    console.log('\n--- Comprehensive Trend Indicator Validation ---');
    
    const allTrendElements = await page.evaluate(() => {
      const trends: Array<{
        index: number;
        classList: string;
        color: string;
        backgroundColor: string;
        borderColor: string;
        hasArrowUp: boolean;
        hasArrowDown: boolean;
        hasMinus: boolean;
        hasScreenReaderText: boolean;
      }> = [];
      
      // Find all elements that might be trend indicators
      const selectors = [
        '[class*="trend"]',
        '[class*="income"]',
        '[class*="expense"]',
        '[class*="positive"]',
        '[class*="negative"]',
        '[class*="border-l-income"]',
        '[class*="border-l-expense"]',
      ];
      
      const elements = new Set<Element>();
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => elements.add(el));
      });
      
      Array.from(elements).forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        
        const hasArrowUp = el.querySelector('svg[class*="lucide-arrow-up"]') !== null ||
                          el.innerHTML.includes('arrow-up');
        const hasArrowDown = el.querySelector('svg[class*="lucide-arrow-down"]') !== null ||
                            el.innerHTML.includes('arrow-down');
        const hasMinus = el.querySelector('svg[class*="lucide-minus"]') !== null ||
                        el.innerHTML.includes('minus');
        
        const srOnly = el.querySelector('.sr-only');
        const hasScreenReaderText = srOnly !== null && srOnly.textContent !== null && srOnly.textContent.trim().length > 0;
        
        trends.push({
          index,
          classList: el.className,
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderLeftColor || computed.borderColor,
          hasArrowUp,
          hasArrowDown,
          hasMinus,
          hasScreenReaderText,
        });
      });
      
      return trends;
    });
    
    console.log(`Testing ${allTrendElements.length} trend indicator elements...`);
    
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const trendInfo of allTrendElements) {
      const trendType = determineTrendType(trendInfo);
      
      // Skip elements without trend indicators
      if (trendType === 'none') continue;
      
      totalTested++;
      
      // Check 1: Proper color coding
      let hasProperColor = false;
      if (trendType === 'positive') {
        hasProperColor = isGreenColor(trendInfo.color) || 
                        isGreenColor(trendInfo.backgroundColor) ||
                        isGreenColor(trendInfo.borderColor);
      } else if (trendType === 'negative') {
        hasProperColor = isRedColor(trendInfo.color) || 
                        isRedColor(trendInfo.backgroundColor) ||
                        isRedColor(trendInfo.borderColor);
      } else {
        // Neutral trends can have any color
        hasProperColor = true;
      }
      
      // Check 2: Has icon indicator
      const hasIcon = trendInfo.hasArrowUp || trendInfo.hasArrowDown || trendInfo.hasMinus;
      
      // Check 3: Has accessibility features
      const hasA11y = trendInfo.hasScreenReaderText;
      
      const allChecksPassed = hasProperColor && hasIcon && hasA11y;
      
      if (allChecksPassed) {
        totalPassed++;
      } else {
        failures.push(
          `trend[${trendInfo.index}] (${trendType}): color=${hasProperColor}, icon=${hasIcon}, a11y=${hasA11y} - "${trendInfo.classList}"`
        );
      }
    }
    
    console.log(`\nTested ${totalTested} trend indicator elements`);
    console.log(`Passed: ${totalPassed}/${totalTested} (${((totalPassed/totalTested)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nTrend Indicator Failures:');
      failures.forEach(f => console.log(`  ✗ ${f}`));
    }
    
    // Assert that all tested trend indicators pass
    expect(totalPassed,
      `All ${totalTested} trend indicator elements should have proper color coding, icons, and accessibility. ` +
      `Failures:\n${failures.join('\n')}`
    ).toBe(totalTested);
  });

  test('Property-based test: Trend indicator consistency across different trend types', async ({ page }) => {
    // Test that positive, negative, and neutral trends all follow the same pattern
    
    console.log('\n--- Testing Trend Indicator Consistency Across Types ---');
    
    const trendTypes = ['positive', 'negative', 'neutral'];
    const results: Record<string, { total: number; withColor: number; withIcon: number; withA11y: number }> = {
      positive: { total: 0, withColor: 0, withIcon: 0, withA11y: 0 },
      negative: { total: 0, withColor: 0, withIcon: 0, withA11y: 0 },
      neutral: { total: 0, withColor: 0, withIcon: 0, withA11y: 0 },
    };
    
    const trendSelectors = [
      '[class*="trend"]',
      '[class*="income"]',
      '[class*="expense"]',
      '[class*="positive"]',
      '[class*="negative"]',
      '[class*="neutral"]',
    ];
    
    for (const selector of trendSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 20);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getTrendIndicatorInfo(page, selector, i);
          const trendType = determineTrendType(info);
          
          if (trendType === 'none') continue;
          
          results[trendType].total++;
          
          // Check color
          let hasProperColor = false;
          if (trendType === 'positive') {
            hasProperColor = isGreenColor(info.color) || isGreenColor(info.backgroundColor) || isGreenColor(info.borderColor);
          } else if (trendType === 'negative') {
            hasProperColor = isRedColor(info.color) || isRedColor(info.backgroundColor) || isRedColor(info.borderColor);
          } else {
            hasProperColor = true; // Neutral can have any color
          }
          
          if (hasProperColor) results[trendType].withColor++;
          
          // Check icon
          if (info.hasIcon) results[trendType].withIcon++;
          
          // Check accessibility
          const hasA11y = info.hasScreenReaderText || (info.ariaLabel !== null && info.ariaLabel.length > 0);
          if (hasA11y) results[trendType].withA11y++;
        }
      }
    }
    
    // Report results
    for (const trendType of trendTypes) {
      const result = results[trendType];
      if (result.total > 0) {
        console.log(`\n${trendType.toUpperCase()} trends:`);
        console.log(`  Total: ${result.total}`);
        console.log(`  With proper color: ${result.withColor}/${result.total} (${((result.withColor/result.total)*100).toFixed(1)}%)`);
        console.log(`  With icon: ${result.withIcon}/${result.total} (${((result.withIcon/result.total)*100).toFixed(1)}%)`);
        console.log(`  With accessibility: ${result.withA11y}/${result.total} (${((result.withA11y/result.total)*100).toFixed(1)}%)`);
        
        // Assert that all trends of this type have proper styling
        expect(result.withColor,
          `All ${trendType} trends should have proper color coding`
        ).toBe(result.total);
        
        expect(result.withIcon,
          `All ${trendType} trends should have icon indicators`
        ).toBe(result.total);
        
        expect(result.withA11y,
          `All ${trendType} trends should have accessibility features`
        ).toBe(result.total);
      }
    }
  });

  test('Property-based test: Trend indicators maintain consistency across page interactions', async ({ page }) => {
    // Test that trend indicators remain consistent across different page states
    
    const testCases = [
      { 
        name: 'Initial page load', 
        action: async () => { /* Already loaded */ },
      },
      { 
        name: 'After scrolling', 
        action: async () => { 
          await page.evaluate(() => window.scrollTo(0, 500)); 
          await page.waitForTimeout(300);
        },
      },
      { 
        name: 'After hovering over elements', 
        action: async () => {
          const firstTrend = page.locator('[class*="trend"]').first();
          if (await firstTrend.count() > 0) {
            await firstTrend.hover();
            await page.waitForTimeout(300);
          }
        },
      },
    ];
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      await testCase.action();
      
      // Sample trend elements
      const trendSelector = '[class*="trend"], [class*="income"], [class*="expense"]';
      const count = await page.locator(trendSelector).count();
      
      if (count > 0) {
        const info = await getTrendIndicatorInfo(page, trendSelector, 0);
        const trendType = determineTrendType(info);
        
        if (trendType !== 'none') {
          // Check color
          let hasProperColor = false;
          if (trendType === 'positive') {
            hasProperColor = isGreenColor(info.color) || isGreenColor(info.backgroundColor) || isGreenColor(info.borderColor);
          } else if (trendType === 'negative') {
            hasProperColor = isRedColor(info.color) || isRedColor(info.backgroundColor) || isRedColor(info.borderColor);
          } else {
            hasProperColor = true;
          }
          
          expect(hasProperColor,
            `[${testCase.name}] Trend indicator should have proper color coding`
          ).toBe(true);
          
          expect(info.hasIcon,
            `[${testCase.name}] Trend indicator should have icon`
          ).toBe(true);
          
          console.log(`✓ Trend indicator maintains consistency in ${testCase.name}`);
        }
      }
    }
  });
});
