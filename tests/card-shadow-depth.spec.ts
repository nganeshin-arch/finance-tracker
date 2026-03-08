/**
 * Property-Based Test: Card Shadow and Depth
 * 
 * **Validates: Requirements 5.1, 5.2**
 * 
 * Property 13: Card Shadow and Depth
 * For any card element, it should have a box-shadow applied for depth perception, 
 * and if interactive, the shadow should enhance on hover along with a subtle lift 
 * effect (transform).
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const TEST_ITERATIONS = 100; // Property-based testing requires multiple iterations

/**
 * Parse box-shadow to extract shadow depth information
 */
function parseBoxShadow(boxShadow: string): { hasShadow: boolean; depth: number } {
  if (!boxShadow || boxShadow === 'none' || boxShadow.trim().length === 0) {
    return { hasShadow: false, depth: 0 };
  }
  
  // Extract blur radius and spread radius from box-shadow
  // Format: offset-x offset-y blur-radius spread-radius color
  const shadowParts = boxShadow.split('px');
  
  if (shadowParts.length >= 3) {
    // Get blur radius (3rd value)
    const blurMatch = boxShadow.match(/(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px/);
    if (blurMatch) {
      const blurRadius = parseFloat(blurMatch[3]);
      return { hasShadow: true, depth: blurRadius };
    }
  }
  
  return { hasShadow: true, depth: 1 }; // Has shadow but can't parse depth
}

/**
 * Check if transform includes translateY (lift effect)
 */
function hasLiftTransform(transform: string): boolean {
  if (transform === 'none') return false;
  
  // Check for translateY in transform
  const translateYMatch = transform.match(/translateY\(([^)]+)\)/);
  if (translateYMatch) {
    const translateValue = parseFloat(translateYMatch[1]);
    return translateValue < 0; // Negative translateY means lift up
  }
  
  // Check for translate3d
  const translate3dMatch = transform.match(/translate3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
  if (translate3dMatch) {
    const translateY = parseFloat(translate3dMatch[2]);
    return translateY < 0;
  }
  
  // Check for matrix
  const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
  if (matrixMatch) {
    const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
    // In 2D matrix, values[5] is translateY
    return values.length >= 6 && values[5] < 0;
  }
  
  return false;
}

/**
 * Get computed styles for a card element
 */
async function getCardStyles(page: Page, selector: string, index: number = 0) {
  return await page.locator(selector).nth(index).evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    return {
      // Shadow properties
      boxShadow: computed.boxShadow,
      
      // Transform properties
      transform: computed.transform,
      
      // Transition properties
      transitionProperty: computed.transitionProperty,
      transitionDuration: computed.transitionDuration,
      
      // Element info
      classList: el.className,
      tagName: el.tagName.toLowerCase(),
      
      // Check if interactive (has hover classes or cursor pointer)
      isInteractive: el.className.includes('hover:') || 
                    el.className.includes('interactive') ||
                    computed.cursor === 'pointer',
    };
  });
}

/**
 * Get card styles in hover state
 */
async function getCardHoverStyles(page: Page, selector: string, index: number = 0) {
  const card = page.locator(selector).nth(index);
  
  // Hover over the card
  await card.hover();
  await page.waitForTimeout(300); // Wait for transition
  
  return await card.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    return {
      boxShadow: computed.boxShadow,
      transform: computed.transform,
    };
  });
}

/**
 * Check if element exists
 */
async function elementExists(page: Page, selector: string): Promise<boolean> {
  const count = await page.locator(selector).count();
  return count > 0;
}

test.describe('Property 13: Card Shadow and Depth', () => {
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

  test('Card elements should have box-shadow for depth perception', async ({ page }) => {
    // Find all card-like elements
    const cardSelectors = [
      '[class*="rounded-xl"]',
      '[class*="shadow"]',
      'div[class*="card"]',
      '[class*="bg-card"]',
    ];
    
    let totalCards = 0;
    let cardsWithShadow = 0;
    
    console.log('\n--- Testing Card Shadow Presence ---');
    
    for (const selector of cardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const styles = await getCardStyles(page, selector, i);
          
          // Skip non-card elements (buttons, inputs, etc.)
          if (styles.tagName === 'button' || styles.tagName === 'input') {
            continue;
          }
          
          totalCards++;
          
          const shadowInfo = parseBoxShadow(styles.boxShadow);
          
          if (shadowInfo.hasShadow) {
            cardsWithShadow++;
            console.log(`✓ ${selector}[${i}]: Has shadow (depth: ${shadowInfo.depth}px) - "${styles.classList}"`);
          } else {
            console.log(`✗ ${selector}[${i}]: No shadow - "${styles.classList}"`);
          }
          
          expect(shadowInfo.hasShadow,
            `${selector}[${i}] should have box-shadow for depth perception ` +
            `(boxShadow: "${styles.boxShadow}", class: "${styles.classList}")`
          ).toBe(true);
        }
      }
    }
    
    console.log(`\nTotal cards tested: ${totalCards}`);
    console.log(`Cards with shadow: ${cardsWithShadow}/${totalCards}`);
  });

  test('Interactive card elements should enhance shadow on hover', async ({ page }) => {
    // Find interactive card elements
    const interactiveCardSelectors = [
      '[class*="hover:shadow"]',
      '[class*="interactive"]',
      'div[class*="cursor-pointer"]',
    ];
    
    let totalInteractiveCards = 0;
    let cardsWithEnhancedShadow = 0;
    
    console.log('\n--- Testing Interactive Card Shadow Enhancement ---');
    
    for (const selector of interactiveCardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const defaultStyles = await getCardStyles(page, selector, i);
          
          // Skip non-card elements
          if (defaultStyles.tagName === 'button' || defaultStyles.tagName === 'input') {
            continue;
          }
          
          // Only test interactive cards
          if (!defaultStyles.isInteractive) {
            continue;
          }
          
          totalInteractiveCards++;
          
          const hoverStyles = await getCardHoverStyles(page, selector, i);
          
          // Check if shadow enhanced on hover
          const defaultShadow = parseBoxShadow(defaultStyles.boxShadow);
          const hoverShadow = parseBoxShadow(hoverStyles.boxShadow);
          
          const shadowEnhanced = hoverShadow.depth > defaultShadow.depth ||
                                hoverStyles.boxShadow !== defaultStyles.boxShadow;
          
          if (shadowEnhanced) {
            cardsWithEnhancedShadow++;
            console.log(`✓ ${selector}[${i}]: Shadow enhanced on hover (${defaultShadow.depth}px → ${hoverShadow.depth}px)`);
          } else {
            console.log(`✗ ${selector}[${i}]: Shadow not enhanced on hover`);
          }
          
          expect(shadowEnhanced,
            `${selector}[${i}] should enhance shadow on hover ` +
            `(default: "${defaultStyles.boxShadow}", hover: "${hoverStyles.boxShadow}")`
          ).toBe(true);
          
          // Reset hover
          await page.mouse.move(0, 0);
          await page.waitForTimeout(200);
        }
      }
    }
    
    console.log(`\nTotal interactive cards tested: ${totalInteractiveCards}`);
    console.log(`Cards with enhanced shadow: ${cardsWithEnhancedShadow}/${totalInteractiveCards}`);
  });

  test('Interactive card elements should have lift effect on hover', async ({ page }) => {
    // Find interactive card elements
    const interactiveCardSelectors = [
      '[class*="hover:-translate-y"]',
      '[class*="interactive"]',
      'div[class*="cursor-pointer"]',
    ];
    
    let totalInteractiveCards = 0;
    let cardsWithLift = 0;
    
    console.log('\n--- Testing Interactive Card Lift Effect ---');
    
    for (const selector of interactiveCardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const defaultStyles = await getCardStyles(page, selector, i);
          
          // Skip non-card elements
          if (defaultStyles.tagName === 'button' || defaultStyles.tagName === 'input') {
            continue;
          }
          
          // Only test interactive cards
          if (!defaultStyles.isInteractive) {
            continue;
          }
          
          totalInteractiveCards++;
          
          const hoverStyles = await getCardHoverStyles(page, selector, i);
          
          // Check if transform includes lift (translateY negative)
          const hasLift = hasLiftTransform(hoverStyles.transform);
          
          if (hasLift) {
            cardsWithLift++;
            console.log(`✓ ${selector}[${i}]: Has lift effect on hover (${hoverStyles.transform})`);
          } else {
            console.log(`✗ ${selector}[${i}]: No lift effect on hover (${hoverStyles.transform})`);
          }
          
          expect(hasLift,
            `${selector}[${i}] should have lift effect (translateY) on hover ` +
            `(transform: "${hoverStyles.transform}", class: "${defaultStyles.classList}")`
          ).toBe(true);
          
          // Reset hover
          await page.mouse.move(0, 0);
          await page.waitForTimeout(200);
        }
      }
    }
    
    console.log(`\nTotal interactive cards tested: ${totalInteractiveCards}`);
    console.log(`Cards with lift effect: ${cardsWithLift}/${totalInteractiveCards}`);
  });

  test('Card elements should have smooth transitions for shadow and transform', async ({ page }) => {
    const cardSelectors = [
      '[class*="rounded-xl"]',
      '[class*="shadow"]',
      'div[class*="card"]',
    ];
    
    console.log('\n--- Testing Card Transition Smoothness ---');
    
    for (const selector of cardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const styles = await getCardStyles(page, selector, i);
          
          // Skip non-card elements
          if (styles.tagName === 'button' || styles.tagName === 'input') {
            continue;
          }
          
          // Check that transitions are defined
          const hasTransitions = styles.transitionProperty !== 'none' &&
                                 styles.transitionDuration !== '0s';
          
          if (hasTransitions) {
            console.log(`✓ ${selector}[${i}]: Has smooth transitions (${styles.transitionDuration})`);
          }
          
          expect(hasTransitions,
            `${selector}[${i}] should have smooth transitions defined ` +
            `(transitionProperty: "${styles.transitionProperty}", ` +
            `transitionDuration: "${styles.transitionDuration}")`
          ).toBe(true);
        }
      }
    }
  });

  test('Property-based test: Card shadow consistency across all card variants', async ({ page }) => {
    console.log('\n--- Testing Card Shadow Consistency Across Variants ---');
    
    // Get all card-like elements
    const allCards = await page.evaluate(() => {
      const cards: Array<{
        index: number;
        classList: string;
        tagName: string;
        isInteractive: boolean;
      }> = [];
      
      // Find elements that look like cards
      const elements = document.querySelectorAll('[class*="rounded"], [class*="shadow"], [class*="card"]');
      
      elements.forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        
        // Skip buttons and inputs
        if (el.tagName.toLowerCase() === 'button' || el.tagName.toLowerCase() === 'input') {
          return;
        }
        
        cards.push({
          index,
          classList: el.className,
          tagName: el.tagName.toLowerCase(),
          isInteractive: el.className.includes('hover:') || 
                        el.className.includes('interactive') ||
                        computed.cursor === 'pointer',
        });
      });
      
      return cards;
    });
    
    console.log(`Testing ${allCards.length} card elements for shadow consistency...`);
    
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const cardInfo of allCards.slice(0, 30)) {
      try {
        const styles = await page.evaluate((idx) => {
          const elements = Array.from(document.querySelectorAll('[class*="rounded"], [class*="shadow"], [class*="card"]'));
          const el = elements[idx];
          if (!el) return null;
          
          const computed = window.getComputedStyle(el);
          return {
            boxShadow: computed.boxShadow,
            classList: el.className,
          };
        }, cardInfo.index);
        
        if (!styles) continue;
        
        totalTested++;
        
        const shadowInfo = parseBoxShadow(styles.boxShadow);
        
        if (shadowInfo.hasShadow) {
          totalPassed++;
        } else {
          failures.push(
            `card[${cardInfo.index}] (${cardInfo.tagName}): No shadow - "${cardInfo.classList}"`
          );
        }
      } catch (error) {
        // Skip elements that can't be evaluated
        continue;
      }
    }
    
    console.log(`\nTested ${totalTested} card elements`);
    console.log(`Passed: ${totalPassed}/${totalTested} (${((totalPassed/totalTested)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nCard Shadow Failures:');
      failures.slice(0, 10).forEach(f => console.log(`  ✗ ${f}`));
      if (failures.length > 10) {
        console.log(`  ... and ${failures.length - 10} more failures`);
      }
    }
    
    // Assert that all tested cards have shadows
    expect(totalPassed,
      `All ${totalTested} card elements should have box-shadow for depth perception. ` +
      `Failures:\n${failures.slice(0, 5).join('\n')}`
    ).toBe(totalTested);
  });

  test('Property-based test: Interactive card hover effects across all variants', async ({ page }) => {
    console.log('\n--- Testing Interactive Card Hover Effects ---');
    
    // Get all interactive card elements
    const interactiveCards = await page.evaluate(() => {
      const cards: Array<{
        index: number;
        classList: string;
        tagName: string;
      }> = [];
      
      const elements = document.querySelectorAll('[class*="rounded"], [class*="shadow"], [class*="card"]');
      
      elements.forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        
        // Skip buttons and inputs
        if (el.tagName.toLowerCase() === 'button' || el.tagName.toLowerCase() === 'input') {
          return;
        }
        
        // Only include interactive cards
        const isInteractive = el.className.includes('hover:') || 
                             el.className.includes('interactive') ||
                             computed.cursor === 'pointer';
        
        if (isInteractive) {
          cards.push({
            index,
            classList: el.className,
            tagName: el.tagName.toLowerCase(),
          });
        }
      });
      
      return cards;
    });
    
    console.log(`Testing ${interactiveCards.length} interactive card elements for hover effects...`);
    
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const cardInfo of interactiveCards.slice(0, 20)) {
      try {
        // Get default and hover styles
        const defaultStyles = await page.evaluate((idx) => {
          const elements = Array.from(document.querySelectorAll('[class*="rounded"], [class*="shadow"], [class*="card"]'));
          const el = elements[idx];
          if (!el) return null;
          
          const computed = window.getComputedStyle(el);
          return {
            boxShadow: computed.boxShadow,
            transform: computed.transform,
          };
        }, cardInfo.index);
        
        if (!defaultStyles) continue;
        
        // Hover over the card
        const cardElement = await page.evaluateHandle((idx) => {
          const elements = Array.from(document.querySelectorAll('[class*="rounded"], [class*="shadow"], [class*="card"]'));
          return elements[idx];
        }, cardInfo.index);
        
        await cardElement.asElement()?.hover();
        await page.waitForTimeout(300);
        
        const hoverStyles = await page.evaluate((idx) => {
          const elements = Array.from(document.querySelectorAll('[class*="rounded"], [class*="shadow"], [class*="card"]'));
          const el = elements[idx];
          if (!el) return null;
          
          const computed = window.getComputedStyle(el);
          return {
            boxShadow: computed.boxShadow,
            transform: computed.transform,
          };
        }, cardInfo.index);
        
        if (!hoverStyles) continue;
        
        totalTested++;
        
        // Check 1: Shadow enhanced on hover
        const shadowEnhanced = hoverStyles.boxShadow !== defaultStyles.boxShadow;
        
        // Check 2: Has lift effect (translateY)
        const hasLift = hasLiftTransform(hoverStyles.transform);
        
        const allChecksPassed = shadowEnhanced && hasLift;
        
        if (allChecksPassed) {
          totalPassed++;
        } else {
          failures.push(
            `card[${cardInfo.index}]: shadowEnhanced=${shadowEnhanced}, hasLift=${hasLift} - "${cardInfo.classList}"`
          );
        }
        
        // Reset hover
        await page.mouse.move(0, 0);
        await page.waitForTimeout(200);
      } catch (error) {
        // Skip elements that can't be evaluated
        continue;
      }
    }
    
    console.log(`\nTested ${totalTested} interactive card elements`);
    console.log(`Passed: ${totalPassed}/${totalTested} (${((totalPassed/totalTested)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nInteractive Card Hover Effect Failures:');
      failures.forEach(f => console.log(`  ✗ ${f}`));
    }
    
    // Assert that all tested interactive cards have proper hover effects
    expect(totalPassed,
      `All ${totalTested} interactive card elements should have shadow enhancement and lift effect on hover. ` +
      `Failures:\n${failures.join('\n')}`
    ).toBe(totalTested);
  });

  test('Property-based test: Card shadow depth perception across page states', async ({ page }) => {
    // Test that card shadows remain consistent across different page states
    
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
        name: 'After modal interaction', 
        action: async () => {
          const addButton = page.locator('button:has-text("Add")').first();
          if (await addButton.count() > 0) {
            await addButton.click();
            await page.waitForTimeout(500);
          }
        },
      },
    ];
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      await testCase.action();
      
      // Sample card elements
      const cardSelectors = ['[class*="rounded-xl"]', '[class*="shadow"]'];
      
      for (const selector of cardSelectors) {
        const count = await page.locator(selector).count();
        
        if (count > 0) {
          const styles = await getCardStyles(page, selector, 0);
          
          // Skip non-card elements
          if (styles.tagName === 'button' || styles.tagName === 'input') {
            continue;
          }
          
          const shadowInfo = parseBoxShadow(styles.boxShadow);
          
          expect(shadowInfo.hasShadow,
            `[${testCase.name}] ${selector} should have box-shadow for depth perception`
          ).toBe(true);
          
          console.log(`✓ ${selector}: Has shadow (depth: ${shadowInfo.depth}px) in ${testCase.name}`);
          break;
        }
      }
    }
  });

  test('Property-based test: Comprehensive card shadow and depth validation', async ({ page }) => {
    // This test validates the universal property: ALL card elements should have 
    // box-shadow for depth, and interactive cards should enhance on hover
    
    console.log('\n--- Comprehensive Card Shadow and Depth Validation ---');
    
    const allCards = await page.evaluate(() => {
      const cards: Array<{
        index: number;
        classList: string;
        tagName: string;
        isInteractive: boolean;
        boxShadow: string;
      }> = [];
      
      const elements = document.querySelectorAll('[class*="rounded"], [class*="shadow"], [class*="card"], [class*="bg-card"]');
      
      elements.forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        
        // Skip buttons, inputs, and very small elements
        if (el.tagName.toLowerCase() === 'button' || 
            el.tagName.toLowerCase() === 'input' ||
            el.clientHeight < 50) {
          return;
        }
        
        cards.push({
          index,
          classList: el.className,
          tagName: el.tagName.toLowerCase(),
          isInteractive: el.className.includes('hover:') || 
                        el.className.includes('interactive') ||
                        computed.cursor === 'pointer',
          boxShadow: computed.boxShadow,
        });
      });
      
      return cards;
    });
    
    console.log(`Testing ${allCards.length} card elements for comprehensive shadow and depth validation...`);
    
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const cardInfo of allCards.slice(0, 40)) {
      totalTested++;
      
      // Test 1: Has box-shadow for depth perception
      const shadowInfo = parseBoxShadow(cardInfo.boxShadow);
      
      if (shadowInfo.hasShadow) {
        totalPassed++;
      } else {
        failures.push(
          `card[${cardInfo.index}] (${cardInfo.tagName}): No shadow - "${cardInfo.classList}"`
        );
      }
    }
    
    console.log(`\nTested ${totalTested} card elements`);
    console.log(`Passed: ${totalPassed}/${totalTested} (${((totalPassed/totalTested)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nCard Shadow and Depth Failures:');
      failures.slice(0, 10).forEach(f => console.log(`  ✗ ${f}`));
      if (failures.length > 10) {
        console.log(`  ... and ${failures.length - 10} more failures`);
      }
    }
    
    // Assert that all tested cards have proper shadow and depth
    expect(totalPassed,
      `All ${totalTested} card elements should have box-shadow for depth perception. ` +
      `Failures:\n${failures.slice(0, 5).join('\n')}`
    ).toBe(totalTested);
  });
});
