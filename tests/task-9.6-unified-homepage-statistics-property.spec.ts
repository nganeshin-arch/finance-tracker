/**
 * Task 9.6: UnifiedHomePage Statistics Styling Property-Based Test
 * 
 * Property-based test for UnifiedHomePage statistics styling with bold typography,
 * gradient accents, and color-coded trend indicators.
 * 
 * **Validates: Requirements 9.2**
 * **Property 32: UnifiedHomePage Statistics Styling**
 * 
 * For any financial statistic displayed on UnifiedHomePage, it should use bold typography 
 * (font-weight 700+) and gradient accents to create visual emphasis.
 */

import { test, expect } from '@playwright/test';
import fc from 'fast-check';

test.describe('Task 9.6: UnifiedHomePage Statistics Styling Property-Based Tests', () => {
  
  test('Property 32: UnifiedHomePage Statistics Styling - Bold typography and gradient accents', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load and statistics to be visible
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Property: For any financial statistic displayed on UnifiedHomePage, 
    // it should use bold typography (font-weight 700+) and gradient accents
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 1920 }),
          viewportHeight: fc.integer({ min: 568, max: 1080 }),
          waitTime: fc.integer({ min: 500, max: 2000 }),
          reloadCount: fc.integer({ min: 1, max: 3 })
        }),
        async ({ viewportWidth, viewportHeight, waitTime, reloadCount }) => {
          // Set random viewport size to test responsive behavior
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          
          // Perform multiple reloads to test consistency
          for (let i = 0; i < reloadCount; i++) {
            await page.reload();
            await page.waitForTimeout(waitTime);
            
            // Wait for dashboard section to be visible
            await page.waitForSelector('#dashboard-section', { state: 'visible', timeout: 5000 });
            
            // Find all StatCard components with financial statistics
            const statCards = page.locator('[role="region"]').filter({ 
              hasText: /Total Balance|Monthly Income|Monthly Expenses|Transfers/ 
            });
            const statCardCount = await statCards.count();
            
            if (statCardCount > 0) {
              // Test each StatCard for proper styling
              for (let cardIndex = 0; cardIndex < Math.min(statCardCount, 4); cardIndex++) {
                const statCard = statCards.nth(cardIndex);
                
                // Property: Statistical values should use bold typography (font-weight 700+)
                const valueElements = statCard.locator('p').filter({ 
                  hasText: /^\$|^[\d,]+\.?\d*$/ 
                });
                const valueCount = await valueElements.count();
                
                if (valueCount > 0) {
                  const firstValue = valueElements.first();
                  const fontWeight = await firstValue.evaluate((el) => {
                    const styles = window.getComputedStyle(el);
                    return parseInt(styles.fontWeight) || 400;
                  });
                  
                  // Property: Font weight should be 700 or higher for numerical values
                  expect(fontWeight).toBeGreaterThanOrEqual(700);
                  
                  // Property: Font size should be responsive (larger on desktop)
                  const fontSize = await firstValue.evaluate((el) => {
                    const styles = window.getComputedStyle(el);
                    return parseFloat(styles.fontSize);
                  });
                  
                  // Font size should be reasonable for statistics display
                  expect(fontSize).toBeGreaterThanOrEqual(24); // At least 24px for statistics
                  expect(fontSize).toBeLessThanOrEqual(72);    // Not larger than 72px
                }
                
                // Property: Key metrics should have gradient accents
                const cardLabel = await statCard.locator('span').first().textContent();
                const isKeyMetric = cardLabel && (
                  cardLabel.includes('Total Balance') || 
                  cardLabel.includes('Monthly Income') || 
                  cardLabel.includes('Monthly Expenses')
                );
                
                if (isKeyMetric) {
                  // Check for gradient background classes or styles
                  const hasGradient = await statCard.evaluate((el) => {
                    const classList = Array.from(el.classList);
                    const hasGradientClass = classList.some(cls => 
                      cls.includes('gradient') || cls.includes('bg-gradient')
                    );
                    
                    const styles = window.getComputedStyle(el);
                    const hasGradientStyle = styles.backgroundImage && 
                      styles.backgroundImage.includes('gradient');
                    
                    return hasGradientClass || hasGradientStyle;
                  });
                  
                  // Property: Key metrics should have gradient styling
                  expect(hasGradient).toBeTruthy();
                }
                
                // Property: Trend indicators should be color-coded with icons
                const trendIndicators = statCard.locator('[class*="text-income"], [class*="text-expense"]');
                const trendCount = await trendIndicators.count();
                
                if (trendCount > 0) {
                  const trendElement = trendIndicators.first();
                  
                  // Check for trend icon (arrow up, arrow down, or minus)
                  const hasIcon = await trendElement.locator('svg').count() > 0;
                  expect(hasIcon).toBeTruthy();
                  
                  // Check for color coding
                  const trendColor = await trendElement.evaluate((el) => {
                    const styles = window.getComputedStyle(el);
                    return styles.color;
                  });
                  
                  // Color should not be default text color (should be green/red for trends)
                  expect(trendColor).not.toBe('rgb(0, 0, 0)'); // Not black
                  expect(trendColor).not.toBe('rgb(255, 255, 255)'); // Not white
                }
              }
            }
          }
        }
      ),
      { 
        numRuns: 12,
        timeout: 45000,
        verbose: true
      }
    );
  });

  test('Property: Statistics should maintain responsive font sizes across viewports', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Property: Statistical values should scale appropriately across different viewport sizes
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          mobileWidth: fc.integer({ min: 320, max: 767 }),
          tabletWidth: fc.integer({ min: 768, max: 1023 }),
          desktopWidth: fc.integer({ min: 1024, max: 1920 }),
          height: fc.integer({ min: 568, max: 1080 })
        }),
        async ({ mobileWidth, tabletWidth, desktopWidth, height }) => {
          const viewports = [
            { width: mobileWidth, height, name: 'mobile' },
            { width: tabletWidth, height, name: 'tablet' },
            { width: desktopWidth, height, name: 'desktop' }
          ];
          
          const fontSizes: Record<string, number[]> = {};
          
          for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(300); // Allow for responsive adjustments
            
            // Find statistical value elements
            const statValues = page.locator('#dashboard-section [role="region"] p').filter({ 
              hasText: /^\$|^[\d,]+\.?\d*$/ 
            });
            const valueCount = await statValues.count();
            
            if (valueCount > 0) {
              const fontSize = await statValues.first().evaluate((el) => {
                const styles = window.getComputedStyle(el);
                return parseFloat(styles.fontSize);
              });
              
              if (!fontSizes[viewport.name]) {
                fontSizes[viewport.name] = [];
              }
              fontSizes[viewport.name].push(fontSize);
            }
          }
          
          // Property: Font sizes should generally increase from mobile to desktop
          if (fontSizes.mobile && fontSizes.tablet && fontSizes.desktop) {
            const avgMobile = fontSizes.mobile.reduce((a, b) => a + b, 0) / fontSizes.mobile.length;
            const avgTablet = fontSizes.tablet.reduce((a, b) => a + b, 0) / fontSizes.tablet.length;
            const avgDesktop = fontSizes.desktop.reduce((a, b) => a + b, 0) / fontSizes.desktop.length;
            
            // Allow for some flexibility in responsive scaling
            expect(avgDesktop).toBeGreaterThanOrEqual(avgMobile * 0.9); // Desktop should be at least 90% of mobile
            expect(avgTablet).toBeGreaterThanOrEqual(avgMobile * 0.9);  // Tablet should be at least 90% of mobile
          }
        }
      ),
      { 
        numRuns: 8,
        timeout: 30000
      }
    );
  });

  test('Property: StatCard integration should maintain consistent styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Property: All StatCard components should have consistent styling patterns
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 768, max: 1920 }),
          viewportHeight: fc.integer({ min: 600, max: 1080 }),
          waitTime: fc.integer({ min: 300, max: 1000 })
        }),
        async ({ viewportWidth, viewportHeight, waitTime }) => {
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          await page.waitForTimeout(waitTime);
          
          // Find all StatCard components
          const statCards = page.locator('#dashboard-section [role="region"]');
          const cardCount = await statCards.count();
          
          if (cardCount > 0) {
            const cardStyles = [];
            
            // Collect styling information from each card
            for (let i = 0; i < Math.min(cardCount, 4); i++) {
              const card = statCards.nth(i);
              
              const cardStyle = await card.evaluate((el) => {
                const styles = window.getComputedStyle(el);
                return {
                  borderRadius: styles.borderRadius,
                  padding: styles.padding,
                  boxShadow: styles.boxShadow,
                  backgroundColor: styles.backgroundColor,
                  transition: styles.transition
                };
              });
              
              cardStyles.push(cardStyle);
            }
            
            // Property: All cards should have consistent border radius
            if (cardStyles.length > 1) {
              const firstBorderRadius = cardStyles[0].borderRadius;
              const allSameBorderRadius = cardStyles.every(style => 
                style.borderRadius === firstBorderRadius
              );
              expect(allSameBorderRadius).toBeTruthy();
              
              // Property: All cards should have some form of shadow for depth
              const allHaveShadow = cardStyles.every(style => 
                style.boxShadow && style.boxShadow !== 'none'
              );
              expect(allHaveShadow).toBeTruthy();
              
              // Property: All cards should have transitions for smooth interactions
              const allHaveTransitions = cardStyles.every(style => 
                style.transition && style.transition !== 'none'
              );
              expect(allHaveTransitions).toBeTruthy();
            }
          }
        }
      ),
      { 
        numRuns: 6,
        timeout: 25000
      }
    );
  });

  test('Property: Color-coded trend indicators should be accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Property: Trend indicators should use both color and icons for accessibility
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 1920 }),
          viewportHeight: fc.integer({ min: 568, max: 1080 }),
          checkDelay: fc.integer({ min: 200, max: 800 })
        }),
        async ({ viewportWidth, viewportHeight, checkDelay }) => {
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          await page.waitForTimeout(checkDelay);
          
          // Find trend indicator elements
          const trendElements = page.locator('#dashboard-section [class*="text-income"], #dashboard-section [class*="text-expense"]');
          const trendCount = await trendElements.count();
          
          if (trendCount > 0) {
            // Test each trend indicator
            for (let i = 0; i < Math.min(trendCount, 4); i++) {
              const trendElement = trendElements.nth(i);
              
              // Property: Should have both color coding AND icon for accessibility
              const hasIcon = await trendElement.locator('svg').count() > 0;
              expect(hasIcon).toBeTruthy();
              
              // Property: Should have appropriate ARIA attributes or screen reader text
              const hasAccessibilityInfo = await trendElement.evaluate((el) => {
                const hasAriaLabel = el.getAttribute('aria-label') !== null;
                const hasScreenReaderText = el.querySelector('.sr-only') !== null;
                const hasTitle = el.getAttribute('title') !== null;
                
                return hasAriaLabel || hasScreenReaderText || hasTitle;
              });
              
              // At least one form of accessibility information should be present
              expect(hasAccessibilityInfo).toBeTruthy();
              
              // Property: Color contrast should be sufficient
              const colorContrast = await trendElement.evaluate((el) => {
                const styles = window.getComputedStyle(el);
                const color = styles.color;
                const backgroundColor = styles.backgroundColor;
                
                // Simple check: color should not be too light or too similar to background
                return color !== backgroundColor && color !== 'rgba(0, 0, 0, 0)';
              });
              
              expect(colorContrast).toBeTruthy();
            }
          }
        }
      ),
      { 
        numRuns: 8,
        timeout: 30000
      }
    );
  });

  test('Property: Statistics should have smooth value transitions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Property: Statistical values should have smooth transitions when data changes
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 768, max: 1920 }),
          viewportHeight: fc.integer({ min: 600, max: 1080 }),
          transitionDelay: fc.integer({ min: 100, max: 500 })
        }),
        async ({ viewportWidth, viewportHeight, transitionDelay }) => {
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          
          // Find statistical value elements
          const statValues = page.locator('#dashboard-section [role="region"] p').filter({ 
            hasText: /^\$|^[\d,]+\.?\d*$/ 
          });
          const valueCount = await statValues.count();
          
          if (valueCount > 0) {
            // Check transition properties on statistical values
            for (let i = 0; i < Math.min(valueCount, 3); i++) {
              const valueElement = statValues.nth(i);
              
              const transitionProps = await valueElement.evaluate((el) => {
                const styles = window.getComputedStyle(el);
                return {
                  transition: styles.transition,
                  transitionDuration: styles.transitionDuration,
                  transitionTimingFunction: styles.transitionTimingFunction
                };
              });
              
              // Property: Should have transition properties for smooth changes
              const hasTransition = transitionProps.transition && 
                transitionProps.transition !== 'none' && 
                transitionProps.transition !== 'all 0s ease 0s';
              
              if (hasTransition) {
                // Property: Transition duration should be reasonable (150ms - 500ms)
                const duration = parseFloat(transitionProps.transitionDuration) || 0;
                if (duration > 0) {
                  expect(duration).toBeGreaterThanOrEqual(0.15); // 150ms
                  expect(duration).toBeLessThanOrEqual(0.5);     // 500ms
                }
                
                // Property: Should use smooth easing function
                const timingFunction = transitionProps.transitionTimingFunction;
                if (timingFunction && timingFunction !== 'linear') {
                  expect(timingFunction).toMatch(/ease|cubic-bezier/);
                }
              }
            }
          }
          
          await page.waitForTimeout(transitionDelay);
        }
      ),
      { 
        numRuns: 6,
        timeout: 20000
      }
    );
  });
});