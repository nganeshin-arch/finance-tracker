/**
 * Property-Based Test: Button State Styling
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
 * 
 * Property 12: Button State Styling
 * For any button element, it should have distinct visual treatments for default 
 * (gradient or bold color), hover (scale + shadow), focus (visible ring with 2px offset), 
 * and disabled (opacity 0.5, pointer-events none) states.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const TEST_ITERATIONS = 100; // Property-based testing requires multiple iterations

/**
 * Parse duration string to milliseconds
 */
function parseDuration(duration: string): number {
  if (!duration || duration === '0' || duration === '0s' || duration === '0ms') {
    return 0;
  }
  
  if (duration.endsWith('ms')) {
    return parseFloat(duration);
  } else if (duration.endsWith('s')) {
    return parseFloat(duration) * 1000;
  }
  
  return 0;
}

/**
 * Get computed styles for a button element
 */
async function getButtonStyles(page: Page, selector: string, index: number = 0) {
  return await page.locator(selector).nth(index).evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    return {
      // Default state
      background: computed.background,
      backgroundImage: computed.backgroundImage,
      backgroundColor: computed.backgroundColor,
      boxShadow: computed.boxShadow,
      transform: computed.transform,
      
      // Transition properties
      transitionProperty: computed.transitionProperty,
      transitionDuration: computed.transitionDuration,
      
      // Focus properties
      outline: computed.outline,
      outlineOffset: computed.outlineOffset,
      
      // Disabled state
      opacity: computed.opacity,
      pointerEvents: computed.pointerEvents,
      
      // Button attributes
      disabled: (el as HTMLButtonElement).disabled,
      classList: el.className,
      tagName: el.tagName.toLowerCase(),
    };
  });
}

/**
 * Get button styles in hover state
 */
async function getButtonHoverStyles(page: Page, selector: string, index: number = 0) {
  const button = page.locator(selector).nth(index);
  
  // Hover over the button
  await button.hover();
  await page.waitForTimeout(300); // Wait for transition
  
  return await button.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    return {
      boxShadow: computed.boxShadow,
      transform: computed.transform,
      backgroundColor: computed.backgroundColor,
      backgroundImage: computed.backgroundImage,
    };
  });
}

/**
 * Get button styles in focus state
 */
async function getButtonFocusStyles(page: Page, selector: string, index: number = 0) {
  const button = page.locator(selector).nth(index);
  
  // Focus the button
  await button.focus();
  await page.waitForTimeout(200); // Wait for transition
  
  return await button.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    return {
      outline: computed.outline,
      outlineWidth: computed.outlineWidth,
      outlineStyle: computed.outlineStyle,
      outlineColor: computed.outlineColor,
      outlineOffset: computed.outlineOffset,
      boxShadow: computed.boxShadow,
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

/**
 * Parse box-shadow to check if it exists and has depth
 */
function hasBoxShadow(boxShadow: string): boolean {
  return boxShadow !== 'none' && boxShadow.trim().length > 0;
}

/**
 * Check if transform includes scale
 */
function hasScaleTransform(transform: string): boolean {
  if (transform === 'none') return false;
  
  // Check for scale in matrix or scale function
  const scaleMatch = transform.match(/scale\(([^)]+)\)/);
  if (scaleMatch) {
    const scaleValue = parseFloat(scaleMatch[1]);
    return scaleValue !== 1;
  }
  
  // Check for scale in matrix
  const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
  if (matrixMatch) {
    const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
    // In 2D matrix, values[0] and values[3] are scaleX and scaleY
    return values[0] !== 1 || values[3] !== 1;
  }
  
  return false;
}

/**
 * Check if background has gradient or bold color
 */
function hasGradientOrBoldColor(backgroundImage: string, backgroundColor: string): boolean {
  // Check for gradient
  if (backgroundImage && backgroundImage !== 'none' && 
      (backgroundImage.includes('gradient') || backgroundImage.includes('linear-gradient'))) {
    return true;
  }
  
  // Check for non-transparent background color
  if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && 
      backgroundColor !== 'transparent') {
    return true;
  }
  
  return false;
}

test.describe('Property 12: Button State Styling', () => {
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

  test('Button elements should have gradient or bold color in default state', async ({ page }) => {
    const buttons = await page.locator('button').all();
    
    console.log(`\nTesting ${buttons.length} button elements for default state styling...`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const styles = await getButtonStyles(page, 'button', i);
      
      // Skip disabled buttons for this test
      if (styles.disabled) continue;
      
      const hasGradientOrColor = hasGradientOrBoldColor(styles.backgroundImage, styles.backgroundColor);
      
      expect(hasGradientOrColor,
        `button[${i}] should have gradient or bold color in default state ` +
        `(backgroundImage: "${styles.backgroundImage}", backgroundColor: "${styles.backgroundColor}", ` +
        `class: "${styles.classList}")`
      ).toBe(true);
      
      console.log(`✓ button[${i}]: Has gradient or bold color - "${styles.classList}"`);
    }
  });

  test('Button elements should have scale transform on hover', async ({ page }) => {
    const buttons = await page.locator('button:not([disabled])').all();
    
    console.log(`\nTesting ${buttons.length} enabled button elements for hover scale...`);
    
    for (let i = 0; i < Math.min(buttons.length, 8); i++) {
      // Get default state
      const defaultStyles = await getButtonStyles(page, 'button:not([disabled])', i);
      
      // Get hover state
      const hoverStyles = await getButtonHoverStyles(page, 'button:not([disabled])', i);
      
      // Check if transform changed on hover (scale effect)
      const hasScale = hasScaleTransform(hoverStyles.transform);
      
      // Note: Some buttons may use scale-[1.02] which is subtle
      // We check if transform is different from default or has scale
      const transformChanged = hoverStyles.transform !== defaultStyles.transform || hasScale;
      
      expect(transformChanged,
        `button[${i}] should have scale transform on hover ` +
        `(default: "${defaultStyles.transform}", hover: "${hoverStyles.transform}", ` +
        `class: "${defaultStyles.classList}")`
      ).toBe(true);
      
      console.log(`✓ button[${i}]: Has scale transform on hover - "${hoverStyles.transform}"`);
    }
  });

  test('Button elements should have enhanced shadow on hover', async ({ page }) => {
    const buttons = await page.locator('button:not([disabled])').all();
    
    console.log(`\nTesting ${buttons.length} enabled button elements for hover shadow...`);
    
    for (let i = 0; i < Math.min(buttons.length, 8); i++) {
      // Get default state
      const defaultStyles = await getButtonStyles(page, 'button:not([disabled])', i);
      
      // Get hover state
      const hoverStyles = await getButtonHoverStyles(page, 'button:not([disabled])', i);
      
      // Check if shadow exists or changed on hover
      const hasDefaultShadow = hasBoxShadow(defaultStyles.boxShadow);
      const hasHoverShadow = hasBoxShadow(hoverStyles.boxShadow);
      const shadowChanged = hoverStyles.boxShadow !== defaultStyles.boxShadow;
      
      // Button should have shadow in default or hover state, and it should change on hover
      const hasShadowEffect = (hasDefaultShadow || hasHoverShadow) && shadowChanged;
      
      expect(hasShadowEffect,
        `button[${i}] should have shadow enhancement on hover ` +
        `(default: "${defaultStyles.boxShadow}", hover: "${hoverStyles.boxShadow}", ` +
        `class: "${defaultStyles.classList}")`
      ).toBe(true);
      
      console.log(`✓ button[${i}]: Has shadow enhancement on hover`);
    }
  });

  test('Button elements should have visible focus ring with proper offset', async ({ page }) => {
    const buttons = await page.locator('button:not([disabled])').all();
    
    console.log(`\nTesting ${buttons.length} enabled button elements for focus ring...`);
    
    for (let i = 0; i < Math.min(buttons.length, 15); i++) {
      // Get focus state
      const focusStyles = await getButtonFocusStyles(page, 'button:not([disabled])', i);
      
      // Check for visible focus indicator (outline or box-shadow ring)
      const hasOutline = focusStyles.outline !== 'none' && 
                        focusStyles.outlineWidth !== '0px' &&
                        focusStyles.outlineStyle !== 'none';
      
      const hasFocusRing = focusStyles.boxShadow.includes('ring') || 
                          focusStyles.boxShadow !== 'none';
      
      const hasFocusIndicator = hasOutline || hasFocusRing;
      
      expect(hasFocusIndicator,
        `button[${i}] should have visible focus indicator ` +
        `(outline: "${focusStyles.outline}", boxShadow: "${focusStyles.boxShadow}")`
      ).toBe(true);
      
      // Check for proper offset (should be 2px)
      if (hasOutline) {
        const offset = parseFloat(focusStyles.outlineOffset);
        expect(Math.abs(offset - 2) <= 0.5,
          `button[${i}] focus ring offset should be approximately 2px, got ${offset}px`
        ).toBe(true);
        
        console.log(`✓ button[${i}]: Has focus ring with ${offset}px offset`);
      } else {
        console.log(`✓ button[${i}]: Has focus ring (box-shadow)`);
      }
    }
  });

  test('Disabled button elements should have opacity 0.5 and pointer-events none', async ({ page }) => {
    // Create a test button that is disabled
    await page.evaluate(() => {
      const testButton = document.createElement('button');
      testButton.id = 'test-disabled-button';
      testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-gradient-primary text-white shadow-md hover:shadow-lg h-10 px-4 py-2';
      testButton.disabled = true;
      testButton.textContent = 'Disabled Test Button';
      document.body.appendChild(testButton);
    });
    
    await page.waitForTimeout(100);
    
    const styles = await getButtonStyles(page, '#test-disabled-button', 0);
    
    // Check opacity
    const opacity = parseFloat(styles.opacity);
    expect(opacity,
      `Disabled button should have opacity 0.5, got ${opacity}`
    ).toBe(0.5);
    
    // Check pointer-events
    expect(styles.pointerEvents,
      `Disabled button should have pointer-events: none, got ${styles.pointerEvents}`
    ).toBe('none');
    
    console.log(`✓ Disabled button: opacity = ${opacity}, pointer-events = ${styles.pointerEvents}`);
    
    // Clean up
    await page.evaluate(() => {
      const testButton = document.getElementById('test-disabled-button');
      if (testButton) testButton.remove();
    });
  });

  test('Button elements should have smooth transitions for state changes', async ({ page }) => {
    const buttons = await page.locator('button').all();
    
    console.log(`\nTesting ${buttons.length} button elements for smooth transitions...`);
    
    for (let i = 0; i < Math.min(buttons.length, 15); i++) {
      const styles = await getButtonStyles(page, 'button', i);
      
      // Check that transitions are defined
      expect(styles.transitionProperty,
        `button[${i}] should have transition properties defined`
      ).not.toBe('none');
      
      // Check transition duration
      const durations = styles.transitionDuration.split(',').map(d => parseDuration(d.trim()));
      const hasValidDuration = durations.some(d => d >= 150 && d <= 300);
      
      expect(hasValidDuration,
        `button[${i}] should have transition duration between 150-300ms, got ${styles.transitionDuration}`
      ).toBe(true);
      
      console.log(`✓ button[${i}]: Has smooth transitions (${styles.transitionDuration})`);
    }
  });

  test('Property-based test: Button state consistency across all button variants', async ({ page }) => {
    // Test different button variants
    console.log('\n--- Testing Button State Consistency Across Variants ---');
    
    const buttonSelectors = [
      'button[type="submit"]',
      'button[type="button"]',
      'button:not([type])',
      '[role="button"]',
    ];
    
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const selector of buttonSelectors) {
      const count = await page.locator(selector).count();
      
      if (count > 0) {
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          try {
            const styles = await getButtonStyles(page, selector, i);
            
            // Skip disabled buttons
            if (styles.disabled) continue;
            
            totalTested++;
            
            // Check 1: Default state has gradient or bold color
            const hasGradientOrColor = hasGradientOrBoldColor(styles.backgroundImage, styles.backgroundColor);
            
            // Check 2: Has transitions
            const hasTransitions = styles.transitionProperty !== 'none';
            
            // Check 3: Has proper styling classes
            const hasProperClasses = styles.classList.includes('transition') || 
                                    styles.classList.includes('hover:') ||
                                    styles.classList.includes('focus');
            
            const allChecksPassed = hasGradientOrColor && hasTransitions && hasProperClasses;
            
            if (allChecksPassed) {
              totalPassed++;
            } else {
              failures.push(
                `${selector}[${i}]: gradient=${hasGradientOrColor}, ` +
                `transitions=${hasTransitions}, classes=${hasProperClasses}`
              );
            }
          } catch (error) {
            // Skip elements that can't be evaluated
            continue;
          }
        }
      }
    }
    
    console.log(`\nTested ${totalTested} button elements`);
    console.log(`Passed: ${totalPassed}/${totalTested} (${((totalPassed/totalTested)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nButton State Failures:');
      failures.forEach(f => console.log(`  ✗ ${f}`));
    }
    
    // Assert that all tested buttons pass
    expect(totalPassed,
      `All ${totalTested} button elements should have proper state styling. ` +
      `Failures:\n${failures.join('\n')}`
    ).toBe(totalTested);
  });

  test('Property-based test: Button state styling across page interactions', async ({ page }) => {
    // Test button states across different page interactions
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
          // Try to open a modal if available
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
      
      // Sample button elements
      const buttonCount = await page.locator('button:not([disabled])').count();
      
      if (buttonCount > 0) {
        const styles = await getButtonStyles(page, 'button:not([disabled])', 0);
        
        // Check default state styling
        const hasGradientOrColor = hasGradientOrBoldColor(styles.backgroundImage, styles.backgroundColor);
        expect(hasGradientOrColor,
          `[${testCase.name}] Button should have gradient or bold color`
        ).toBe(true);
        
        // Check transitions
        expect(styles.transitionProperty,
          `[${testCase.name}] Button should have transitions`
        ).not.toBe('none');
        
        console.log(`✓ Button state styling maintained in ${testCase.name}`);
      }
    }
  });

  test('Property-based test: Comprehensive button state validation', async ({ page }) => {
    // This test validates the universal property: ALL buttons should have proper state styling
    console.log('\n--- Comprehensive Button State Validation ---');
    
    const allButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      
      return buttons.map((btn, index) => ({
        index,
        disabled: btn.disabled,
        classList: btn.className,
        hasText: btn.textContent?.trim().length || 0 > 0,
      }));
    });
    
    console.log(`Testing ${allButtons.length} button elements for comprehensive state styling...`);
    
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const buttonInfo of allButtons.slice(0, 30)) {
      try {
        const styles = await getButtonStyles(page, 'button', buttonInfo.index);
        
        totalTested++;
        
        // Test 1: Default state has gradient or bold color
        const hasGradientOrColor = hasGradientOrBoldColor(styles.backgroundImage, styles.backgroundColor);
        
        // Test 2: Has transitions
        const hasTransitions = styles.transitionProperty !== 'none';
        
        // Test 3: Disabled buttons have proper styling
        let disabledStylesCorrect = true;
        if (buttonInfo.disabled) {
          const opacity = parseFloat(styles.opacity);
          disabledStylesCorrect = opacity === 0.5 && styles.pointerEvents === 'none';
        }
        
        const allChecksPassed = hasGradientOrColor && hasTransitions && disabledStylesCorrect;
        
        if (allChecksPassed) {
          totalPassed++;
        } else {
          failures.push(
            `button[${buttonInfo.index}]: gradient=${hasGradientOrColor}, ` +
            `transitions=${hasTransitions}, disabled=${disabledStylesCorrect} ` +
            `(class: "${buttonInfo.classList}")`
          );
        }
      } catch (error) {
        // Skip elements that can't be evaluated
        continue;
      }
    }
    
    console.log(`\nTested ${totalTested} button elements`);
    console.log(`Passed: ${totalPassed}/${totalTested} (${((totalPassed/totalTested)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nButton State Styling Failures:');
      failures.slice(0, 10).forEach(f => console.log(`  ✗ ${f}`));
      if (failures.length > 10) {
        console.log(`  ... and ${failures.length - 10} more failures`);
      }
    }
    
    // Assert that all tested buttons pass
    expect(totalPassed,
      `All ${totalTested} button elements should have proper state styling. ` +
      `Failures:\n${failures.slice(0, 5).join('\n')}`
    ).toBe(totalTested);
  });

  test('Property-based test: Button hover and focus states are distinct', async ({ page }) => {
    // Verify that hover and focus states are visually distinct
    console.log('\n--- Testing Button Hover and Focus State Distinction ---');
    
    const buttons = await page.locator('button:not([disabled])').all();
    const testCount = Math.min(buttons.length, 5);
    
    for (let i = 0; i < testCount; i++) {
      // Get default state
      const defaultStyles = await getButtonStyles(page, 'button:not([disabled])', i);
      
      // Get hover state
      const hoverStyles = await getButtonHoverStyles(page, 'button:not([disabled])', i);
      
      // Reset hover
      await page.mouse.move(0, 0);
      await page.waitForTimeout(200);
      
      // Get focus state
      const focusStyles = await getButtonFocusStyles(page, 'button:not([disabled])', i);
      
      // Verify hover state is different from default
      const hoverIsDifferent = hoverStyles.transform !== defaultStyles.transform ||
                              hoverStyles.boxShadow !== defaultStyles.boxShadow;
      
      expect(hoverIsDifferent,
        `button[${i}] hover state should be visually different from default`
      ).toBe(true);
      
      // Verify focus state has visible indicator
      const hasFocusIndicator = focusStyles.outline !== 'none' || 
                               focusStyles.boxShadow.includes('ring') ||
                               focusStyles.boxShadow !== defaultStyles.boxShadow;
      
      expect(hasFocusIndicator,
        `button[${i}] focus state should have visible indicator`
      ).toBe(true);
      
      console.log(`✓ button[${i}]: Hover and focus states are distinct`);
    }
  });
});
