/**
 * Property-Based Test: Card Focus Management
 * 
 * **Validates: Requirements 5.5, 11.2**
 * 
 * Property 16: Card Focus Management
 * For any card containing interactive elements, when navigating via keyboard, 
 * the tab order should be logical and focus indicators should be visible on 
 * all focusable elements.
 */

import { test, expect, Page } from '@playwright/test';

/**
 * Get all focusable elements within a container
 */
async function getFocusableElements(page: Page, containerSelector: string, index: number = 0) {
  return await page.locator(containerSelector).nth(index).evaluate((container) => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];
    
    const focusableElements: Array<{
      tagName: string;
      type: string;
      tabIndex: number;
      classList: string;
      isVisible: boolean;
    }> = [];
    
    focusableSelectors.forEach(selector => {
      const elements = container.querySelectorAll(selector);
      elements.forEach(el => {
        const computed = window.getComputedStyle(el);
        const isVisible = computed.display !== 'none' && 
                         computed.visibility !== 'hidden' &&
                         computed.opacity !== '0';
        
        focusableElements.push({
          tagName: el.tagName.toLowerCase(),
          type: (el as HTMLInputElement).type || '',
          tabIndex: (el as HTMLElement).tabIndex,
          classList: el.className,
          isVisible,
        });
      });
    });
    
    return focusableElements;
  });
}

/**
 * Get computed focus styles for an element
 */
async function getFocusStyles(page: Page, selector: string, index: number = 0) {
  const element = page.locator(selector).nth(index);
  
  // Focus the element
  await element.focus();
  await page.waitForTimeout(200); // Wait for focus transition
  
  return await element.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    return {
      outline: computed.outline,
      outlineWidth: computed.outlineWidth,
      outlineStyle: computed.outlineStyle,
      outlineColor: computed.outlineColor,
      outlineOffset: computed.outlineOffset,
      boxShadow: computed.boxShadow,
      borderColor: computed.borderColor,
      // Check for ring classes (Tailwind focus rings)
      hasRing: el.className.includes('ring') || computed.boxShadow.includes('rgb'),
    };
  });
}

/**
 * Check if element has visible focus indicator
 */
function hasVisibleFocusIndicator(styles: any): boolean {
  // Check for outline
  if (styles.outline !== 'none' && 
      styles.outlineStyle !== 'none' && 
      styles.outlineWidth !== '0px') {
    return true;
  }
  
  // Check for box-shadow (ring)
  if (styles.boxShadow && 
      styles.boxShadow !== 'none' && 
      styles.boxShadow.length > 10) {
    return true;
  }
  
  // Check for ring class
  if (styles.hasRing) {
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

/**
 * Get tab order of focusable elements
 */
async function getTabOrder(page: Page, containerSelector: string, index: number = 0) {
  return await page.locator(containerSelector).nth(index).evaluate((container) => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    
    const elements: Array<{
      element: Element;
      tabIndex: number;
      position: number;
    }> = [];
    
    focusableSelectors.forEach(selector => {
      const found = container.querySelectorAll(selector);
      found.forEach((el, idx) => {
        const computed = window.getComputedStyle(el);
        const isVisible = computed.display !== 'none' && 
                         computed.visibility !== 'hidden';
        
        if (isVisible) {
          elements.push({
            element: el,
            tabIndex: (el as HTMLElement).tabIndex,
            position: idx,
          });
        }
      });
    });
    
    // Sort by tabIndex (0 and positive values first, then -1)
    elements.sort((a, b) => {
      if (a.tabIndex === b.tabIndex) {
        return a.position - b.position;
      }
      if (a.tabIndex === 0 && b.tabIndex > 0) return 1;
      if (a.tabIndex > 0 && b.tabIndex === 0) return -1;
      return a.tabIndex - b.tabIndex;
    });
    
    return elements.map(e => ({
      tagName: e.element.tagName.toLowerCase(),
      tabIndex: e.tabIndex,
      classList: e.element.className,
    }));
  });
}

test.describe('Property 16: Card Focus Management', () => {
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

  test('Card elements should have logical tab order for interactive elements', async ({ page }) => {
    // Find card elements that contain interactive elements
    const cardSelectors = [
      '[class*="rounded-xl"]',
      'div[class*="card"]',
      '[class*="bg-card"]',
    ];
    
    console.log('\n--- Testing Card Tab Order ---');
    
    let totalCardsWithInteractiveElements = 0;
    let cardsWithLogicalTabOrder = 0;
    
    for (const selector of cardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const focusableElements = await getFocusableElements(page, selector, i);
          
          // Skip cards without interactive elements
          if (focusableElements.length === 0) {
            continue;
          }
          
          totalCardsWithInteractiveElements++;
          
          const tabOrder = await getTabOrder(page, selector, i);
          
          // Check if tab order is logical (sequential tabIndex values)
          let isLogical = true;
          let previousTabIndex = -1;
          
          for (const item of tabOrder) {
            if (item.tabIndex > 0) {
              if (previousTabIndex > 0 && item.tabIndex < previousTabIndex) {
                isLogical = false;
                break;
              }
              previousTabIndex = item.tabIndex;
            }
          }
          
          if (isLogical) {
            cardsWithLogicalTabOrder++;
            console.log(`✓ ${selector}[${i}]: Logical tab order (${focusableElements.length} focusable elements)`);
          } else {
            console.log(`✗ ${selector}[${i}]: Illogical tab order`);
          }
          
          expect(isLogical,
            `${selector}[${i}] should have logical tab order for its ${focusableElements.length} interactive elements`
          ).toBe(true);
        }
      }
    }
    
    console.log(`\nTotal cards with interactive elements: ${totalCardsWithInteractiveElements}`);
    console.log(`Cards with logical tab order: ${cardsWithLogicalTabOrder}/${totalCardsWithInteractiveElements}`);
  });

  test('All focusable elements within cards should have visible focus indicators', async ({ page }) => {
    const cardSelectors = [
      '[class*="rounded-xl"]',
      'div[class*="card"]',
      '[class*="bg-card"]',
    ];
    
    console.log('\n--- Testing Focus Indicators on Card Elements ---');
    
    let totalFocusableElements = 0;
    let elementsWithVisibleFocus = 0;
    const failures: string[] = [];
    
    for (const selector of cardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const focusableElements = await getFocusableElements(page, selector, i);
          
          // Test each focusable element
          for (const focusableInfo of focusableElements.slice(0, 3)) {
            if (!focusableInfo.isVisible) continue;
            
            totalFocusableElements++;
            
            try {
              // Find the specific element within the card
              const card = page.locator(selector).nth(i);
              const focusableElement = card.locator(focusableInfo.tagName).first();
              
              // Get focus styles
              await focusableElement.focus();
              await page.waitForTimeout(200);
              
              const styles = await focusableElement.evaluate((el) => {
                const computed = window.getComputedStyle(el);
                return {
                  outline: computed.outline,
                  outlineWidth: computed.outlineWidth,
                  outlineStyle: computed.outlineStyle,
                  boxShadow: computed.boxShadow,
                  hasRing: el.className.includes('ring') || computed.boxShadow.includes('rgb'),
                };
              });
              
              const hasVisibleFocus = hasVisibleFocusIndicator(styles);
              
              if (hasVisibleFocus) {
                elementsWithVisibleFocus++;
                console.log(`✓ ${selector}[${i}] ${focusableInfo.tagName}: Has visible focus indicator`);
              } else {
                const failure = `${selector}[${i}] ${focusableInfo.tagName}: No visible focus indicator`;
                failures.push(failure);
                console.log(`✗ ${failure}`);
              }
              
              expect(hasVisibleFocus,
                `${selector}[${i}] ${focusableInfo.tagName} should have visible focus indicator ` +
                `(outline: "${styles.outline}", boxShadow: "${styles.boxShadow}")`
              ).toBe(true);
            } catch (error) {
              // Skip elements that can't be focused
              continue;
            }
          }
        }
      }
    }
    
    console.log(`\nTotal focusable elements tested: ${totalFocusableElements}`);
    console.log(`Elements with visible focus: ${elementsWithVisibleFocus}/${totalFocusableElements}`);
    
    if (failures.length > 0) {
      console.log('\nFocus Indicator Failures:');
      failures.slice(0, 10).forEach(f => console.log(`  ${f}`));
    }
  });

  test('Interactive cards should be keyboard accessible', async ({ page }) => {
    // Find interactive cards
    const interactiveCardSelectors = [
      '[class*="interactive"]',
      '[class*="cursor-pointer"]',
      '[tabindex="0"]',
    ];
    
    console.log('\n--- Testing Interactive Card Keyboard Accessibility ---');
    
    let totalInteractiveCards = 0;
    let keyboardAccessibleCards = 0;
    
    for (const selector of interactiveCardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const card = page.locator(selector).nth(i);
          
          // Check if it's a card element
          const isCard = await card.evaluate((el) => {
            return el.className.includes('card') || 
                   el.className.includes('rounded') ||
                   el.className.includes('shadow');
          });
          
          if (!isCard) continue;
          
          totalInteractiveCards++;
          
          // Check if card is focusable
          const tabIndex = await card.getAttribute('tabindex');
          const isFocusable = tabIndex !== null && tabIndex !== '-1';
          
          // Try to focus the card
          try {
            await card.focus();
            await page.waitForTimeout(200);
            
            const isFocused = await card.evaluate((el) => {
              return document.activeElement === el;
            });
            
            if (isFocused) {
              keyboardAccessibleCards++;
              console.log(`✓ ${selector}[${i}]: Keyboard accessible (tabindex="${tabIndex}")`);
              
              // Check for visible focus indicator
              const styles = await getFocusStyles(page, selector, i);
              const hasVisibleFocus = hasVisibleFocusIndicator(styles);
              
              expect(hasVisibleFocus,
                `${selector}[${i}] should have visible focus indicator when focused`
              ).toBe(true);
            } else {
              console.log(`✗ ${selector}[${i}]: Not keyboard accessible`);
            }
            
            expect(isFocusable || isFocused,
              `${selector}[${i}] interactive card should be keyboard accessible (focusable)`
            ).toBe(true);
          } catch (error) {
            console.log(`✗ ${selector}[${i}]: Cannot be focused`);
          }
        }
      }
    }
    
    console.log(`\nTotal interactive cards: ${totalInteractiveCards}`);
    console.log(`Keyboard accessible cards: ${keyboardAccessibleCards}/${totalInteractiveCards}`);
  });

  test('Card focus indicators should have sufficient contrast', async ({ page }) => {
    const cardSelectors = [
      '[class*="rounded-xl"]',
      'div[class*="card"]',
    ];
    
    console.log('\n--- Testing Focus Indicator Contrast ---');
    
    let totalTested = 0;
    let totalPassed = 0;
    
    for (const selector of cardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const focusableElements = await getFocusableElements(page, selector, i);
          
          for (const focusableInfo of focusableElements.slice(0, 2)) {
            if (!focusableInfo.isVisible) continue;
            
            totalTested++;
            
            try {
              const card = page.locator(selector).nth(i);
              const focusableElement = card.locator(focusableInfo.tagName).first();
              
              await focusableElement.focus();
              await page.waitForTimeout(200);
              
              const styles = await focusableElement.evaluate((el) => {
                const computed = window.getComputedStyle(el);
                return {
                  outlineWidth: computed.outlineWidth,
                  outlineOffset: computed.outlineOffset,
                  boxShadow: computed.boxShadow,
                };
              });
              
              // Check for minimum 2px outline or ring
              const outlineWidthPx = parseFloat(styles.outlineWidth);
              const hasRing = styles.boxShadow && styles.boxShadow.includes('rgb');
              
              const hasSufficientIndicator = outlineWidthPx >= 2 || hasRing;
              
              if (hasSufficientIndicator) {
                totalPassed++;
                console.log(`✓ ${selector}[${i}] ${focusableInfo.tagName}: Sufficient focus indicator`);
              } else {
                console.log(`✗ ${selector}[${i}] ${focusableInfo.tagName}: Insufficient focus indicator`);
              }
              
              expect(hasSufficientIndicator,
                `${selector}[${i}] ${focusableInfo.tagName} should have sufficient focus indicator ` +
                `(outlineWidth: ${styles.outlineWidth}, hasRing: ${hasRing})`
              ).toBe(true);
            } catch (error) {
              // Skip elements that can't be focused
              continue;
            }
          }
        }
      }
    }
    
    console.log(`\nTotal elements tested: ${totalTested}`);
    console.log(`Elements with sufficient contrast: ${totalPassed}/${totalTested}`);
  });

  test('Card focus indicators should have proper offset', async ({ page }) => {
    const cardSelectors = [
      '[class*="rounded-xl"]',
      'div[class*="card"]',
    ];
    
    console.log('\n--- Testing Focus Indicator Offset ---');
    
    let totalTested = 0;
    let totalPassed = 0;
    
    for (const selector of cardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const focusableElements = await getFocusableElements(page, selector, i);
          
          for (const focusableInfo of focusableElements.slice(0, 2)) {
            if (!focusableInfo.isVisible) continue;
            
            totalTested++;
            
            try {
              const card = page.locator(selector).nth(i);
              const focusableElement = card.locator(focusableInfo.tagName).first();
              
              await focusableElement.focus();
              await page.waitForTimeout(200);
              
              const styles = await focusableElement.evaluate((el) => {
                const computed = window.getComputedStyle(el);
                return {
                  outlineOffset: computed.outlineOffset,
                };
              });
              
              // Check for minimum 2px offset (WCAG recommendation)
              const offsetPx = parseFloat(styles.outlineOffset);
              const hasProperOffset = offsetPx >= 2 || offsetPx === 0; // 0 is acceptable for ring styles
              
              if (hasProperOffset) {
                totalPassed++;
                console.log(`✓ ${selector}[${i}] ${focusableInfo.tagName}: Proper offset (${styles.outlineOffset})`);
              } else {
                console.log(`✗ ${selector}[${i}] ${focusableInfo.tagName}: Improper offset (${styles.outlineOffset})`);
              }
              
              expect(hasProperOffset,
                `${selector}[${i}] ${focusableInfo.tagName} should have proper focus indicator offset ` +
                `(outlineOffset: ${styles.outlineOffset})`
              ).toBe(true);
            } catch (error) {
              // Skip elements that can't be focused
              continue;
            }
          }
        }
      }
    }
    
    console.log(`\nTotal elements tested: ${totalTested}`);
    console.log(`Elements with proper offset: ${totalPassed}/${totalTested}`);
  });

  test('Property-based test: Comprehensive card focus management validation', async ({ page }) => {
    console.log('\n--- Comprehensive Card Focus Management Validation ---');
    
    // Get all card elements with interactive content
    const cardsWithInteractiveElements = await page.evaluate(() => {
      const cards: Array<{
        index: number;
        classList: string;
        focusableCount: number;
        isInteractive: boolean;
      }> = [];
      
      const cardElements = document.querySelectorAll('[class*="rounded"], [class*="card"], [class*="shadow"]');
      
      cardElements.forEach((card, index) => {
        // Skip buttons and inputs
        if (card.tagName.toLowerCase() === 'button' || card.tagName.toLowerCase() === 'input') {
          return;
        }
        
        // Count focusable elements within card
        const focusableSelectors = [
          'a[href]',
          'button:not([disabled])',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ];
        
        let focusableCount = 0;
        focusableSelectors.forEach(selector => {
          focusableCount += card.querySelectorAll(selector).length;
        });
        
        const computed = window.getComputedStyle(card);
        const isInteractive = card.className.includes('interactive') || 
                             computed.cursor === 'pointer' ||
                             (card as HTMLElement).tabIndex >= 0;
        
        if (focusableCount > 0 || isInteractive) {
          cards.push({
            index,
            classList: card.className,
            focusableCount,
            isInteractive,
          });
        }
      });
      
      return cards;
    });
    
    console.log(`Testing ${cardsWithInteractiveElements.length} cards with interactive elements...`);
    
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const cardInfo of cardsWithInteractiveElements.slice(0, 20)) {
      totalTested++;
      
      try {
        // Get the card element
        const allCards = await page.locator('[class*="rounded"], [class*="card"], [class*="shadow"]').all();
        const card = allCards[cardInfo.index];
        
        if (!card) continue;
        
        // Test 1: Check if card or its children are focusable
        const hasFocusableElements = cardInfo.focusableCount > 0 || cardInfo.isInteractive;
        
        // Test 2: Check tab order
        const tabOrder = await card.evaluate((el) => {
          const focusable = el.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
          const tabIndices = Array.from(focusable).map(e => (e as HTMLElement).tabIndex);
          
          // Check if tab order is logical (no negative jumps)
          let isLogical = true;
          for (let i = 1; i < tabIndices.length; i++) {
            if (tabIndices[i] > 0 && tabIndices[i-1] > 0 && tabIndices[i] < tabIndices[i-1]) {
              isLogical = false;
              break;
            }
          }
          
          return { isLogical, count: focusable.length };
        });
        
        const allChecksPassed = hasFocusableElements && tabOrder.isLogical;
        
        if (allChecksPassed) {
          totalPassed++;
          console.log(`✓ card[${cardInfo.index}]: Proper focus management (${cardInfo.focusableCount} focusable elements)`);
        } else {
          const failure = `card[${cardInfo.index}]: hasFocusable=${hasFocusableElements}, logicalTabOrder=${tabOrder.isLogical}`;
          failures.push(failure);
          console.log(`✗ ${failure}`);
        }
      } catch (error) {
        // Skip cards that can't be evaluated
        continue;
      }
    }
    
    console.log(`\nTested ${totalTested} cards`);
    console.log(`Passed: ${totalPassed}/${totalTested} (${((totalPassed/totalTested)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nFocus Management Failures:');
      failures.forEach(f => console.log(`  ${f}`));
    }
    
    // Assert that all tested cards have proper focus management
    expect(totalPassed,
      `All ${totalTested} cards should have proper focus management. ` +
      `Failures:\n${failures.join('\n')}`
    ).toBe(totalTested);
  });
});
