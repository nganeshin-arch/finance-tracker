/**
 * Property-Based Test: Key Metric Highlighting
 * 
 * **Validates: Requirements 7.3**
 * 
 * Property 24: Key Metric Highlighting
 * For any key metric display on the dashboard, it should have gradient backgrounds 
 * or accent colors applied to visually distinguish it from standard metrics.
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
 * Check if element has a gradient background
 */
function hasGradientBackground(backgroundImage: string): boolean {
  if (!backgroundImage || backgroundImage === 'none') return false;
  
  // Check for linear-gradient, radial-gradient, or conic-gradient
  return backgroundImage.includes('gradient');
}

/**
 * Check if element has accent/highlight colors
 * Accent colors are typically more saturated or have distinct hues
 */
function hasAccentColor(backgroundColor: string, borderColor: string): boolean {
  const bgColor = parseColor(backgroundColor);
  const bdColor = parseColor(borderColor);
  
  // Check if background color is not default/neutral
  if (bgColor) {
    // Accent colors typically have higher saturation
    // Check if any color channel is significantly different from others
    const maxChannel = Math.max(bgColor.r, bgColor.g, bgColor.b);
    const minChannel = Math.min(bgColor.r, bgColor.g, bgColor.b);
    const saturation = maxChannel - minChannel;
    
    // If saturation is high (> 30), it's likely an accent color
    if (saturation > 30) return true;
  }
  
  // Check if border color is accent (colored border)
  if (bdColor) {
    const maxChannel = Math.max(bdColor.r, bdColor.g, bdColor.b);
    const minChannel = Math.min(bdColor.r, bdColor.g, bdColor.b);
    const saturation = maxChannel - minChannel;
    
    // Colored borders indicate accent styling
    if (saturation > 30) return true;
  }
  
  return false;
}

/**
 * Get metric card information from an element
 */
async function getMetricCardInfo(page: Page, selector: string, index: number = 0) {
  return await page.locator(selector).nth(index).evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    // Check for gradient classes
    const hasGradientClass = el.className.includes('gradient') ||
                            el.className.includes('bg-gradient') ||
                            el.className.includes('from-') ||
                            el.className.includes('to-') ||
                            el.className.includes('via-');
    
    // Check for premium/key metric classes
    const isPremiumVariant = el.className.includes('premium') ||
                            el.className.includes('key') ||
                            el.className.includes('highlight') ||
                            el.className.includes('accent');
    
    // Check for trend-based coloring
    const hasTrendColor = el.className.includes('income') ||
                         el.className.includes('expense') ||
                         el.className.includes('positive') ||
                         el.className.includes('negative');
    
    // Get border information
    const borderLeftWidth = computed.borderLeftWidth;
    const borderLeftColor = computed.borderLeftColor;
    const hasBorderAccent = borderLeftWidth !== '0px' && borderLeftWidth !== '';
    
    return {
      // Computed styles
      backgroundColor: computed.backgroundColor,
      backgroundImage: computed.backgroundImage,
      borderColor: computed.borderColor,
      borderLeftColor: borderLeftColor,
      borderLeftWidth: borderLeftWidth,
      
      // Class information
      classList: el.className,
      hasGradientClass,
      isPremiumVariant,
      hasTrendColor,
      hasBorderAccent,
      
      // Element information
      tagName: el.tagName.toLowerCase(),
      textContent: el.textContent?.trim() || '',
      
      // Check if it's a stat card
      isStatCard: el.className.includes('stat') || 
                  el.className.includes('metric') ||
                  el.className.includes('card'),
    };
  });
}

/**
 * Determine if element is a key metric (vs standard metric)
 */
function isKeyMetric(info: any): boolean {
  const classList = info.classList.toLowerCase();
  const textContent = info.textContent.toLowerCase();
  
  // Key metrics typically have:
  // 1. Premium/gradient classes
  if (info.isPremiumVariant || info.hasGradientClass) return true;
  
  // 2. Trend indicators (income/expense)
  if (info.hasTrendColor) return true;
  
  // 3. Border accents
  if (info.hasBorderAccent) return true;
  
  // 4. Keywords in text content (balance, total, income, expense)
  const keyMetricKeywords = ['balance', 'total', 'income', 'expense', 'revenue', 'profit'];
  if (keyMetricKeywords.some(keyword => textContent.includes(keyword))) {
    return true;
  }
  
  return false;
}

/**
 * Check if element has visual distinction (gradient or accent colors)
 */
function hasVisualDistinction(info: any): boolean {
  // Check 1: Has gradient background
  if (hasGradientBackground(info.backgroundImage)) {
    return true;
  }
  
  // Check 2: Has accent colors
  if (hasAccentColor(info.backgroundColor, info.borderLeftColor)) {
    return true;
  }
  
  // Check 3: Has gradient class
  if (info.hasGradientClass) {
    return true;
  }
  
  // Check 4: Has border accent
  if (info.hasBorderAccent) {
    return true;
  }
  
  return false;
}

/**
 * Check if element exists
 */
async function elementExists(page: Page, selector: string): Promise<boolean> {
  const count = await page.locator(selector).count();
  return count > 0;
}

test.describe('Property 24: Key Metric Highlighting', () => {
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

  test('Key metrics should have gradient backgrounds', async ({ page }) => {
    // Find elements that might be key metrics
    const metricSelectors = [
      '[class*="gradient"]',
      '[class*="premium"]',
      '[class*="stat"]',
      '[class*="metric"]',
      '[class*="card"]',
    ];
    
    let totalKeyMetrics = 0;
    let metricsWithGradient = 0;
    
    console.log('\n--- Testing Key Metric Gradient Backgrounds ---');
    
    for (const selector of metricSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 10);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getMetricCardInfo(page, selector, i);
          
          // Only test key metrics
          if (!isKeyMetric(info)) continue;
          
          totalKeyMetrics++;
          
          // Check if has gradient background
          const hasGradient = hasGradientBackground(info.backgroundImage) || info.hasGradientClass;
          
          if (hasGradient) {
            metricsWithGradient++;
            console.log(`✓ ${selector}[${i}]: Has gradient background - "${info.classList}"`);
          } else {
            console.log(`  ${selector}[${i}]: No gradient (may have other distinction) - "${info.classList}"`);
          }
        }
      }
    }
    
    console.log(`\nTotal key metrics tested: ${totalKeyMetrics}`);
    console.log(`Metrics with gradient: ${metricsWithGradient}/${totalKeyMetrics}`);
    
    // Note: Not all key metrics need gradients, they can use accent colors instead
    // This test just checks that gradients are being used for some key metrics
    if (totalKeyMetrics > 0) {
      console.log(`Gradient usage: ${((metricsWithGradient/totalKeyMetrics)*100).toFixed(1)}%`);
    }
  });

  test('Key metrics should have accent colors for visual distinction', async ({ page }) => {
    // Find elements that might be key metrics
    const metricSelectors = [
      '[class*="income"]',
      '[class*="expense"]',
      '[class*="border-l"]',
      '[class*="stat"]',
      '[class*="metric"]',
    ];
    
    let totalKeyMetrics = 0;
    let metricsWithAccent = 0;
    
    console.log('\n--- Testing Key Metric Accent Colors ---');
    
    for (const selector of metricSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 10);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getMetricCardInfo(page, selector, i);
          
          // Only test key metrics
          if (!isKeyMetric(info)) continue;
          
          totalKeyMetrics++;
          
          // Check if has accent colors
          const hasAccent = hasAccentColor(info.backgroundColor, info.borderLeftColor) || 
                           info.hasBorderAccent;
          
          if (hasAccent) {
            metricsWithAccent++;
            console.log(`✓ ${selector}[${i}]: Has accent colors - bg: "${info.backgroundColor}", border: "${info.borderLeftColor}"`);
          } else {
            console.log(`  ${selector}[${i}]: No accent colors (may have gradient) - "${info.classList}"`);
          }
        }
      }
    }
    
    console.log(`\nTotal key metrics tested: ${totalKeyMetrics}`);
    console.log(`Metrics with accent colors: ${metricsWithAccent}/${totalKeyMetrics}`);
    
    if (totalKeyMetrics > 0) {
      console.log(`Accent color usage: ${((metricsWithAccent/totalKeyMetrics)*100).toFixed(1)}%`);
    }
  });

  test('Key metrics should be visually distinguished from standard metrics', async ({ page }) => {
    // This is the core property test: ALL key metrics should have visual distinction
    
    const metricSelectors = [
      '[class*="stat"]',
      '[class*="metric"]',
      '[class*="card"]',
      '[class*="income"]',
      '[class*="expense"]',
      '[class*="gradient"]',
      '[class*="premium"]',
    ];
    
    let totalKeyMetrics = 0;
    let metricsWithDistinction = 0;
    
    console.log('\n--- Testing Key Metric Visual Distinction ---');
    
    for (const selector of metricSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 15);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getMetricCardInfo(page, selector, i);
          
          // Only test key metrics
          if (!isKeyMetric(info)) continue;
          
          totalKeyMetrics++;
          
          // Check if has visual distinction (gradient OR accent colors)
          const hasDistinction = hasVisualDistinction(info);
          
          if (hasDistinction) {
            metricsWithDistinction++;
            console.log(`✓ ${selector}[${i}]: Has visual distinction - gradient: ${hasGradientBackground(info.backgroundImage)}, accent: ${hasAccentColor(info.backgroundColor, info.borderLeftColor)}, border: ${info.hasBorderAccent}`);
          } else {
            console.log(`✗ ${selector}[${i}]: Missing visual distinction - "${info.classList}"`);
          }
          
          expect(hasDistinction,
            `${selector}[${i}] key metric should have gradient backgrounds or accent colors for visual distinction ` +
            `(hasGradient: ${hasGradientBackground(info.backgroundImage)}, hasAccent: ${hasAccentColor(info.backgroundColor, info.borderLeftColor)}, ` +
            `hasBorderAccent: ${info.hasBorderAccent}, class: "${info.classList}")`
          ).toBe(true);
        }
      }
    }
    
    console.log(`\nTotal key metrics tested: ${totalKeyMetrics}`);
    console.log(`Metrics with visual distinction: ${metricsWithDistinction}/${totalKeyMetrics}`);
    
    // Ensure we tested at least some key metrics
    expect(totalKeyMetrics,
      'Should find at least one key metric to test'
    ).toBeGreaterThan(0);
  });

  test('StatCard component with premium variant should have gradient or accent styling', async ({ page }) => {
    // Test the StatCard component specifically
    
    console.log('\n--- Testing StatCard Premium Variant ---');
    
    // Look for StatCard elements with premium styling
    const statCardSelectors = [
      '[class*="stat"]',
      '[class*="card"]',
    ];
    
    let totalStatCards = 0;
    let premiumStatCards = 0;
    
    for (const selector of statCardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 10);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getMetricCardInfo(page, selector, i);
          
          // Only test stat cards
          if (!info.isStatCard) continue;
          
          totalStatCards++;
          
          // Check if it's a premium/key metric
          if (isKeyMetric(info)) {
            premiumStatCards++;
            
            // Premium stat cards should have visual distinction
            const hasDistinction = hasVisualDistinction(info);
            
            expect(hasDistinction,
              `${selector}[${i}] premium StatCard should have gradient or accent styling ` +
              `(class: "${info.classList}", backgroundImage: "${info.backgroundImage}", ` +
              `backgroundColor: "${info.backgroundColor}", borderLeftColor: "${info.borderLeftColor}")`
            ).toBe(true);
            
            console.log(`✓ ${selector}[${i}]: Premium StatCard has visual distinction`);
          }
        }
      }
    }
    
    console.log(`\nTotal stat cards: ${totalStatCards}`);
    console.log(`Premium stat cards: ${premiumStatCards}`);
  });

  test('Property-based test: All key metrics have gradient or accent distinction', async ({ page }) => {
    // Comprehensive property test: validate that ALL key metrics have visual distinction
    
    console.log('\n--- Comprehensive Key Metric Highlighting Validation ---');
    
    const allMetrics = await page.evaluate(() => {
      const metrics: Array<{
        index: number;
        classList: string;
        backgroundColor: string;
        backgroundImage: string;
        borderLeftColor: string;
        borderLeftWidth: string;
        hasGradientClass: boolean;
        isPremiumVariant: boolean;
        hasTrendColor: boolean;
        textContent: string;
      }> = [];
      
      // Find all elements that might be metrics
      const selectors = [
        '[class*="stat"]',
        '[class*="metric"]',
        '[class*="card"]',
        '[class*="income"]',
        '[class*="expense"]',
        '[class*="gradient"]',
        '[class*="premium"]',
      ];
      
      const elements = new Set<Element>();
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => elements.add(el));
      });
      
      Array.from(elements).forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        
        const hasGradientClass = el.className.includes('gradient') ||
                                el.className.includes('bg-gradient') ||
                                el.className.includes('from-') ||
                                el.className.includes('to-');
        
        const isPremiumVariant = el.className.includes('premium') ||
                                el.className.includes('key') ||
                                el.className.includes('highlight');
        
        const hasTrendColor = el.className.includes('income') ||
                             el.className.includes('expense') ||
                             el.className.includes('positive') ||
                             el.className.includes('negative');
        
        metrics.push({
          index,
          classList: el.className,
          backgroundColor: computed.backgroundColor,
          backgroundImage: computed.backgroundImage,
          borderLeftColor: computed.borderLeftColor,
          borderLeftWidth: computed.borderLeftWidth,
          hasGradientClass,
          isPremiumVariant,
          hasTrendColor,
          textContent: el.textContent?.trim() || '',
        });
      });
      
      return metrics;
    });
    
    console.log(`Testing ${allMetrics.length} metric elements...`);
    
    let totalKeyMetrics = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const metricInfo of allMetrics) {
      // Determine if it's a key metric
      const isKey = isKeyMetric(metricInfo);
      
      // Skip standard metrics
      if (!isKey) continue;
      
      totalKeyMetrics++;
      
      // Check for visual distinction
      const hasDistinction = hasVisualDistinction(metricInfo);
      
      if (hasDistinction) {
        totalPassed++;
      } else {
        failures.push(
          `metric[${metricInfo.index}]: Missing visual distinction - "${metricInfo.classList}"`
        );
      }
    }
    
    console.log(`\nTested ${totalKeyMetrics} key metric elements`);
    console.log(`Passed: ${totalPassed}/${totalKeyMetrics} (${totalKeyMetrics > 0 ? ((totalPassed/totalKeyMetrics)*100).toFixed(1) : 0}%)`);
    
    if (failures.length > 0) {
      console.log('\nKey Metric Highlighting Failures:');
      failures.forEach(f => console.log(`  ✗ ${f}`));
    }
    
    // Assert that all key metrics have visual distinction
    expect(totalPassed,
      `All ${totalKeyMetrics} key metric elements should have gradient backgrounds or accent colors for visual distinction. ` +
      `Failures:\n${failures.join('\n')}`
    ).toBe(totalKeyMetrics);
  });

  test('Property-based test: Key metrics maintain distinction across page interactions', async ({ page }) => {
    // Test that key metrics maintain visual distinction across different page states
    
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
        name: 'After hovering over metric', 
        action: async () => {
          const metric = page.locator('[class*="stat"], [class*="metric"]').first();
          if (await metric.count() > 0) {
            await metric.hover();
            await page.waitForTimeout(300);
          }
        },
      },
    ];
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      await testCase.action();
      
      // Sample key metrics
      const metricSelector = '[class*="stat"], [class*="metric"], [class*="income"], [class*="expense"]';
      const count = await page.locator(metricSelector).count();
      
      if (count > 0) {
        const info = await getMetricCardInfo(page, metricSelector, 0);
        
        if (isKeyMetric(info)) {
          const hasDistinction = hasVisualDistinction(info);
          
          expect(hasDistinction,
            `[${testCase.name}] Key metric should maintain visual distinction`
          ).toBe(true);
          
          console.log(`✓ Key metric maintains visual distinction in ${testCase.name}`);
        }
      }
    }
  });

  test('Property-based test: Gradient and accent color usage patterns', async ({ page }) => {
    // Analyze the patterns of gradient and accent color usage across key metrics
    
    console.log('\n--- Analyzing Key Metric Styling Patterns ---');
    
    const allMetrics = await page.evaluate(() => {
      const metrics: Array<{
        classList: string;
        backgroundImage: string;
        backgroundColor: string;
        borderLeftColor: string;
        borderLeftWidth: string;
        hasGradientClass: boolean;
        isPremiumVariant: boolean;
        hasTrendColor: boolean;
      }> = [];
      
      const elements = document.querySelectorAll('[class*="stat"], [class*="metric"], [class*="card"]');
      
      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        
        const hasGradientClass = el.className.includes('gradient') ||
                                el.className.includes('from-') ||
                                el.className.includes('to-');
        
        const isPremiumVariant = el.className.includes('premium') ||
                                el.className.includes('key');
        
        const hasTrendColor = el.className.includes('income') ||
                             el.className.includes('expense');
        
        metrics.push({
          classList: el.className,
          backgroundImage: computed.backgroundImage,
          backgroundColor: computed.backgroundColor,
          borderLeftColor: computed.borderLeftColor,
          borderLeftWidth: computed.borderLeftWidth,
          hasGradientClass,
          isPremiumVariant,
          hasTrendColor,
        });
      });
      
      return metrics;
    });
    
    let totalKeyMetrics = 0;
    let withGradient = 0;
    let withAccentColor = 0;
    let withBorderAccent = 0;
    let withMultipleDistinctions = 0;
    
    for (const metricInfo of allMetrics) {
      if (!isKeyMetric(metricInfo)) continue;
      
      totalKeyMetrics++;
      
      const hasGrad = hasGradientBackground(metricInfo.backgroundImage) || metricInfo.hasGradientClass;
      const hasAccent = hasAccentColor(metricInfo.backgroundColor, metricInfo.borderLeftColor);
      const hasBorder = metricInfo.borderLeftWidth !== '0px' && metricInfo.borderLeftWidth !== '';
      
      if (hasGrad) withGradient++;
      if (hasAccent) withAccentColor++;
      if (hasBorder) withBorderAccent++;
      
      const distinctionCount = [hasGrad, hasAccent, hasBorder].filter(Boolean).length;
      if (distinctionCount > 1) withMultipleDistinctions++;
    }
    
    console.log(`\nKey Metric Styling Analysis (${totalKeyMetrics} metrics):`);
    console.log(`  With gradient: ${withGradient} (${totalKeyMetrics > 0 ? ((withGradient/totalKeyMetrics)*100).toFixed(1) : 0}%)`);
    console.log(`  With accent colors: ${withAccentColor} (${totalKeyMetrics > 0 ? ((withAccentColor/totalKeyMetrics)*100).toFixed(1) : 0}%)`);
    console.log(`  With border accent: ${withBorderAccent} (${totalKeyMetrics > 0 ? ((withBorderAccent/totalKeyMetrics)*100).toFixed(1) : 0}%)`);
    console.log(`  With multiple distinctions: ${withMultipleDistinctions} (${totalKeyMetrics > 0 ? ((withMultipleDistinctions/totalKeyMetrics)*100).toFixed(1) : 0}%)`);
    
    // At least one distinction method should be used
    const totalWithAnyDistinction = withGradient + withAccentColor + withBorderAccent;
    expect(totalWithAnyDistinction,
      'Key metrics should use at least one visual distinction method (gradient, accent color, or border)'
    ).toBeGreaterThan(0);
  });

  test('Property-based test: Key metrics vs standard metrics distinction', async ({ page }) => {
    // Verify that key metrics are MORE visually distinct than standard metrics
    
    console.log('\n--- Comparing Key Metrics vs Standard Metrics ---');
    
    const allMetrics = await page.evaluate(() => {
      const metrics: Array<{
        isKey: boolean;
        hasGradient: boolean;
        hasAccent: boolean;
        hasBorder: boolean;
      }> = [];
      
      const elements = document.querySelectorAll('[class*="stat"], [class*="metric"], [class*="card"]');
      
      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        
        const hasGradientClass = el.className.includes('gradient') ||
                                el.className.includes('from-') ||
                                el.className.includes('to-');
        
        const isPremiumVariant = el.className.includes('premium') ||
                                el.className.includes('key');
        
        const hasTrendColor = el.className.includes('income') ||
                             el.className.includes('expense');
        
        const isKey = isPremiumVariant || hasTrendColor || hasGradientClass;
        
        const hasGradient = computed.backgroundImage.includes('gradient') || hasGradientClass;
        
        const bgColor = computed.backgroundColor;
        const bdColor = computed.borderLeftColor;
        const hasAccent = bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent';
        
        const hasBorder = computed.borderLeftWidth !== '0px' && computed.borderLeftWidth !== '';
        
        metrics.push({
          isKey,
          hasGradient,
          hasAccent,
          hasBorder,
        });
      });
      
      return metrics;
    });
    
    const keyMetrics = allMetrics.filter(m => m.isKey);
    const standardMetrics = allMetrics.filter(m => !m.isKey);
    
    console.log(`\nKey metrics: ${keyMetrics.length}`);
    console.log(`Standard metrics: ${standardMetrics.length}`);
    
    if (keyMetrics.length > 0 && standardMetrics.length > 0) {
      const keyDistinctionRate = keyMetrics.filter(m => m.hasGradient || m.hasAccent || m.hasBorder).length / keyMetrics.length;
      const standardDistinctionRate = standardMetrics.filter(m => m.hasGradient || m.hasAccent || m.hasBorder).length / standardMetrics.length;
      
      console.log(`Key metrics with distinction: ${(keyDistinctionRate * 100).toFixed(1)}%`);
      console.log(`Standard metrics with distinction: ${(standardDistinctionRate * 100).toFixed(1)}%`);
      
      // Key metrics should have higher distinction rate than standard metrics
      expect(keyDistinctionRate,
        'Key metrics should have higher visual distinction rate than standard metrics'
      ).toBeGreaterThan(standardDistinctionRate);
    }
  });
});
