/**
 * Property-Based Test: TransactionForm Micro-interactions
 * 
 * **Validates: Requirements 8.2**
 * 
 * Property 28: TransactionForm Micro-interactions
 * For any form field in TransactionForm, when a user interacts with it 
 * (focus, input, blur), micro-interactions should trigger providing immediate feedback.
 * 
 * This includes:
 * - Focus animations (glow effect) on input focus
 * - Smooth transitions to validation state changes
 * - Hover effects on interactive elements
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
 * Check if box-shadow includes glow effect
 */
function hasGlowEffect(boxShadow: string): boolean {
  if (!boxShadow || boxShadow === 'none' || boxShadow.trim().length === 0) {
    return false;
  }
  
  // Glow effect typically includes rgba with some transparency
  return boxShadow.includes('rgba') || boxShadow.includes('rgb');
}

/**
 * Get computed styles for a form field
 */
async function getFormFieldStyles(page: Page, selector: string, index: number = 0) {
  return await page.locator(selector).nth(index).evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    return {
      // Focus properties
      boxShadow: computed.boxShadow,
      borderColor: computed.borderColor,
      outline: computed.outline,
      
      // Transition properties
      transitionProperty: computed.transitionProperty,
      transitionDuration: computed.transitionDuration,
      transitionTimingFunction: computed.transitionTimingFunction,
      
      // Element info
      classList: el.className,
      tagName: el.tagName.toLowerCase(),
      id: el.id,
      type: (el as HTMLInputElement).type || 'unknown',
    };
  });
}

/**
 * Get form field styles in focus state
 */
async function getFormFieldFocusStyles(page: Page, selector: string, index: number = 0) {
  const field = page.locator(selector).nth(index);
  
  // Focus the field
  await field.focus();
  await page.waitForTimeout(250); // Wait for transition
  
  return await field.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    return {
      boxShadow: computed.boxShadow,
      borderColor: computed.borderColor,
      outline: computed.outline,
    };
  });
}

/**
 * Get form field styles in hover state
 */
async function getFormFieldHoverStyles(page: Page, selector: string, index: number = 0) {
  const field = page.locator(selector).nth(index);
  
  // Hover over the field
  await field.hover();
  await page.waitForTimeout(200); // Wait for transition
  
  return await field.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    return {
      borderColor: computed.borderColor,
      boxShadow: computed.boxShadow,
    };
  });
}

/**
 * Navigate to TransactionForm
 */
async function navigateToTransactionForm(page: Page) {
  // Navigate to the app
  await page.goto('http://localhost:5173');
  
  // Login
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'Admin123!@#');
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete
  await page.waitForURL('**/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Navigate to transactions page
  await page.click('text=Transactions');
  await page.waitForTimeout(500);
  
  // Click "Add Transaction" button
  await page.click('button:has-text("Add Transaction")');
  await page.waitForTimeout(500);
}

test.describe('Property 28: TransactionForm Micro-interactions', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTransactionForm(page);
  });

  test('All input fields should have focus glow effect', async ({ page }) => {
    // Get all input fields in the form
    const inputSelectors = [
      'input[type="date"]',
      'input[type="number"]',
      'textarea',
    ];
    
    console.log('\n--- Testing Input Fields for Focus Glow Effect ---');
    
    let totalInputs = 0;
    let inputsWithGlow = 0;
    
    for (const selector of inputSelectors) {
      const count = await page.locator(selector).count();
      
      for (let i = 0; i < count; i++) {
        totalInputs++;
        
        const defaultStyles = await getFormFieldStyles(page, selector, i);
        const focusStyles = await getFormFieldFocusStyles(page, selector, i);
        
        // Check if focus state has glow effect (box-shadow)
        const hasGlow = hasGlowEffect(focusStyles.boxShadow);
        const glowChanged = focusStyles.boxShadow !== defaultStyles.boxShadow;
        
        if (hasGlow && glowChanged) {
          inputsWithGlow++;
          console.log(`✓ ${selector}[${i}] (${defaultStyles.id}): Has focus glow effect`);
        } else {
          console.log(`✗ ${selector}[${i}] (${defaultStyles.id}): No focus glow effect`);
        }
        
        expect(hasGlow && glowChanged,
          `${selector}[${i}] (${defaultStyles.id}) should have focus glow effect ` +
          `(default: "${defaultStyles.boxShadow}", focus: "${focusStyles.boxShadow}")`
        ).toBe(true);
        
        // Blur the field
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
    }
    
    console.log(`\nTotal inputs tested: ${totalInputs}`);
    console.log(`Inputs with glow: ${inputsWithGlow}/${totalInputs}`);
  });

  test('All select triggers should have focus glow effect', async ({ page }) => {
    // Get all select triggers (combobox role)
    const selectTriggers = await page.locator('[role="combobox"]').all();
    
    console.log(`\n--- Testing ${selectTriggers.length} Select Triggers for Focus Glow Effect ---`);
    
    let totalSelects = 0;
    let selectsWithGlow = 0;
    
    for (let i = 0; i < selectTriggers.length; i++) {
      totalSelects++;
      
      const defaultStyles = await getFormFieldStyles(page, '[role="combobox"]', i);
      const focusStyles = await getFormFieldFocusStyles(page, '[role="combobox"]', i);
      
      // Check if focus state has glow effect or border change
      const hasGlow = hasGlowEffect(focusStyles.boxShadow);
      const borderChanged = focusStyles.borderColor !== defaultStyles.borderColor;
      const hasFocusEffect = hasGlow || borderChanged;
      
      if (hasFocusEffect) {
        selectsWithGlow++;
        console.log(`✓ select[${i}] (${defaultStyles.id}): Has focus effect`);
      } else {
        console.log(`✗ select[${i}] (${defaultStyles.id}): No focus effect`);
      }
      
      expect(hasFocusEffect,
        `select[${i}] (${defaultStyles.id}) should have focus effect ` +
        `(glow: ${hasGlow}, borderChanged: ${borderChanged})`
      ).toBe(true);
      
      // Blur the field
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
    }
    
    console.log(`\nTotal selects tested: ${totalSelects}`);
    console.log(`Selects with focus effect: ${selectsWithGlow}/${totalSelects}`);
  });

  test('All form fields should have smooth transitions', async ({ page }) => {
    // Get all form fields
    const formFieldSelectors = [
      'input[type="date"]',
      'input[type="number"]',
      'textarea',
      '[role="combobox"]',
    ];
    
    console.log('\n--- Testing Form Fields for Smooth Transitions ---');
    
    let totalFields = 0;
    let fieldsWithTransitions = 0;
    
    for (const selector of formFieldSelectors) {
      const count = await page.locator(selector).count();
      
      for (let i = 0; i < count; i++) {
        totalFields++;
        
        const styles = await getFormFieldStyles(page, selector, i);
        
        // Check that transitions are defined
        const hasTransitions = styles.transitionProperty !== 'none' &&
                              styles.transitionDuration !== '0s';
        
        if (hasTransitions) {
          // Check transition duration is within acceptable range (150ms-300ms)
          const durations = styles.transitionDuration.split(',').map(d => parseDuration(d.trim()));
          const hasValidDuration = durations.some(d => d >= 150 && d <= 300);
          
          if (hasValidDuration) {
            fieldsWithTransitions++;
            console.log(`✓ ${selector}[${i}] (${styles.id}): Has smooth transitions (${styles.transitionDuration})`);
          } else {
            console.log(`✗ ${selector}[${i}] (${styles.id}): Transition duration out of range (${styles.transitionDuration})`);
          }
          
          expect(hasValidDuration,
            `${selector}[${i}] (${styles.id}) should have transition duration between 150-300ms, ` +
            `got ${styles.transitionDuration}`
          ).toBe(true);
        } else {
          console.log(`✗ ${selector}[${i}] (${styles.id}): No transitions defined`);
          
          expect(hasTransitions,
            `${selector}[${i}] (${styles.id}) should have transitions defined ` +
            `(transitionProperty: "${styles.transitionProperty}", ` +
            `transitionDuration: "${styles.transitionDuration}")`
          ).toBe(true);
        }
      }
    }
    
    console.log(`\nTotal fields tested: ${totalFields}`);
    console.log(`Fields with smooth transitions: ${fieldsWithTransitions}/${totalFields}`);
  });

  test('All interactive elements should have hover effects', async ({ page }) => {
    // Get all interactive elements (inputs, selects, buttons)
    const interactiveSelectors = [
      'input[type="date"]',
      'input[type="number"]',
      'textarea',
      '[role="combobox"]',
    ];
    
    console.log('\n--- Testing Interactive Elements for Hover Effects ---');
    
    let totalElements = 0;
    let elementsWithHover = 0;
    
    for (const selector of interactiveSelectors) {
      const count = await page.locator(selector).count();
      
      for (let i = 0; i < count; i++) {
        totalElements++;
        
        const defaultStyles = await getFormFieldStyles(page, selector, i);
        const hoverStyles = await getFormFieldHoverStyles(page, selector, i);
        
        // Check if hover state changes border or shadow
        const borderChanged = hoverStyles.borderColor !== defaultStyles.borderColor;
        const shadowChanged = hoverStyles.boxShadow !== defaultStyles.boxShadow;
        const hasHoverEffect = borderChanged || shadowChanged;
        
        if (hasHoverEffect) {
          elementsWithHover++;
          console.log(`✓ ${selector}[${i}] (${defaultStyles.id}): Has hover effect`);
        } else {
          console.log(`✗ ${selector}[${i}] (${defaultStyles.id}): No hover effect`);
        }
        
        expect(hasHoverEffect,
          `${selector}[${i}] (${defaultStyles.id}) should have hover effect ` +
          `(borderChanged: ${borderChanged}, shadowChanged: ${shadowChanged})`
        ).toBe(true);
        
        // Move mouse away
        await page.mouse.move(0, 0);
        await page.waitForTimeout(100);
      }
    }
    
    console.log(`\nTotal elements tested: ${totalElements}`);
    console.log(`Elements with hover effect: ${elementsWithHover}/${totalElements}`);
  });

  test('Validation state changes should have smooth transitions', async ({ page }) => {
    // Submit form without filling required fields to trigger validation
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(400); // Wait for validation
    
    // Check if error messages appear
    const errorMessages = await page.locator('[role="alert"]').all();
    
    console.log(`\n--- Testing ${errorMessages.length} Validation Messages for Smooth Transitions ---`);
    
    if (errorMessages.length > 0) {
      // Check the first error message
      const errorMessage = page.locator('[role="alert"]').first();
      
      const styles = await errorMessage.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          transition: computed.transition,
          animation: computed.animation,
          opacity: computed.opacity,
        };
      });
      
      // Verify error message has transition or animation
      const hasTransitionOrAnimation = styles.transition !== 'all 0s ease 0s' || 
                                       styles.animation !== 'none';
      
      expect(hasTransitionOrAnimation,
        `Error messages should have smooth transitions or animations ` +
        `(transition: "${styles.transition}", animation: "${styles.animation}")`
      ).toBe(true);
      
      console.log(`✓ Error messages have smooth transitions`);
    } else {
      console.log('⚠ No error messages found to test');
    }
  });

  test('Property-based test: All form fields have consistent micro-interactions', async ({ page }) => {
    // This test validates the universal property: ALL form fields should have 
    // micro-interactions (focus glow, smooth transitions, hover effects)
    
    console.log('\n--- Comprehensive Form Field Micro-interactions Validation ---');
    
    // Get all form fields
    const allFormFields = await page.evaluate(() => {
      const fields: Array<{
        index: number;
        selector: string;
        id: string;
        type: string;
        classList: string;
      }> = [];
      
      // Collect all input fields
      const inputs = document.querySelectorAll('input[type="date"], input[type="number"], textarea');
      inputs.forEach((el, index) => {
        fields.push({
          index,
          selector: el.tagName.toLowerCase(),
          id: el.id,
          type: (el as HTMLInputElement).type || 'textarea',
          classList: el.className,
        });
      });
      
      // Collect all select triggers
      const selects = document.querySelectorAll('[role="combobox"]');
      selects.forEach((el, index) => {
        fields.push({
          index: index + inputs.length,
          selector: 'select',
          id: el.id,
          type: 'select',
          classList: el.className,
        });
      });
      
      return fields;
    });
    
    console.log(`Testing ${allFormFields.length} form fields for comprehensive micro-interactions...`);
    
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const fieldInfo of allFormFields) {
      try {
        totalTested++;
        
        let selector: string;
        let index: number;
        
        if (fieldInfo.type === 'select') {
          selector = '[role="combobox"]';
          index = fieldInfo.index - (allFormFields.filter(f => f.type !== 'select').length);
        } else if (fieldInfo.type === 'textarea') {
          selector = 'textarea';
          index = 0; // Usually only one textarea
        } else {
          selector = `input[type="${fieldInfo.type}"]`;
          index = allFormFields.filter(f => f.type === fieldInfo.type && f.index < fieldInfo.index).length;
        }
        
        const defaultStyles = await getFormFieldStyles(page, selector, index);
        const focusStyles = await getFormFieldFocusStyles(page, selector, index);
        
        // Test 1: Has focus glow effect
        const hasGlow = hasGlowEffect(focusStyles.boxShadow);
        const glowChanged = focusStyles.boxShadow !== defaultStyles.boxShadow;
        const hasFocusEffect = hasGlow && glowChanged;
        
        // Test 2: Has smooth transitions
        const hasTransitions = defaultStyles.transitionProperty !== 'none' &&
                              defaultStyles.transitionDuration !== '0s';
        
        // Test 3: Transition duration is valid (150-300ms)
        let hasValidDuration = false;
        if (hasTransitions) {
          const durations = defaultStyles.transitionDuration.split(',').map(d => parseDuration(d.trim()));
          hasValidDuration = durations.some(d => d >= 150 && d <= 300);
        }
        
        const allChecksPassed = hasFocusEffect && hasTransitions && hasValidDuration;
        
        if (allChecksPassed) {
          totalPassed++;
        } else {
          failures.push(
            `${fieldInfo.type}[${fieldInfo.id}]: focusEffect=${hasFocusEffect}, ` +
            `transitions=${hasTransitions}, validDuration=${hasValidDuration}`
          );
        }
        
        // Blur the field
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
      } catch (error) {
        // Skip elements that can't be evaluated
        console.log(`⚠ Skipped ${fieldInfo.type}[${fieldInfo.id}]: ${error}`);
        continue;
      }
    }
    
    console.log(`\nTested ${totalTested} form fields`);
    console.log(`Passed: ${totalPassed}/${totalTested} (${((totalPassed/totalTested)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nForm Field Micro-interaction Failures:');
      failures.forEach(f => console.log(`  ✗ ${f}`));
    }
    
    // Assert that all tested form fields have proper micro-interactions
    expect(totalPassed,
      `All ${totalTested} form fields should have proper micro-interactions. ` +
      `Failures:\n${failures.join('\n')}`
    ).toBe(totalTested);
  });

  test('Property-based test: Micro-interactions persist across form interactions', async ({ page }) => {
    // Test that micro-interactions remain consistent across different form interactions
    
    const testCases = [
      { 
        name: 'Initial form load', 
        action: async () => { /* Already loaded */ },
      },
      { 
        name: 'After selecting transaction type', 
        action: async () => {
          const transactionTypeSelect = page.locator('[role="combobox"]').first();
          await transactionTypeSelect.click();
          await page.waitForTimeout(300);
          
          // Select first option
          const firstOption = page.locator('[role="option"]').first();
          if (await firstOption.count() > 0) {
            await firstOption.click();
            await page.waitForTimeout(300);
          }
        },
      },
      { 
        name: 'After entering amount', 
        action: async () => {
          const amountInput = page.locator('input[type="number"]');
          await amountInput.fill('100.50');
          await page.waitForTimeout(200);
        },
      },
    ];
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      await testCase.action();
      
      // Test a sample input field
      const dateInput = page.locator('input[type="date"]');
      
      if (await dateInput.count() > 0) {
        const defaultStyles = await getFormFieldStyles(page, 'input[type="date"]', 0);
        const focusStyles = await getFormFieldFocusStyles(page, 'input[type="date"]', 0);
        
        // Check focus glow effect
        const hasGlow = hasGlowEffect(focusStyles.boxShadow);
        const glowChanged = focusStyles.boxShadow !== defaultStyles.boxShadow;
        
        expect(hasGlow && glowChanged,
          `[${testCase.name}] Date input should have focus glow effect`
        ).toBe(true);
        
        // Check transitions
        const hasTransitions = defaultStyles.transitionProperty !== 'none';
        
        expect(hasTransitions,
          `[${testCase.name}] Date input should have transitions`
        ).toBe(true);
        
        console.log(`✓ Micro-interactions maintained in ${testCase.name}`);
        
        // Blur the field
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
    }
  });

  test('Property-based test: Focus ring visibility on keyboard navigation', async ({ page }) => {
    // Test that focus indicators are visible when navigating via keyboard
    
    console.log('\n--- Testing Focus Ring Visibility on Keyboard Navigation ---');
    
    // Tab through form elements
    const formFieldCount = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea, [role="combobox"]');
      return inputs.length;
    });
    
    console.log(`Testing keyboard navigation through ${formFieldCount} form fields...`);
    
    let totalTested = 0;
    let totalWithFocusIndicator = 0;
    
    for (let i = 0; i < Math.min(formFieldCount, 10); i++) {
      // Tab to next element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(150);
      
      // Get the focused element
      const focusedElement = await page.evaluateHandle(() => document.activeElement);
      
      const styles = await focusedElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          boxShadow: computed.boxShadow,
          borderColor: computed.borderColor,
          tagName: el.tagName.toLowerCase(),
          id: el.id,
        };
      });
      
      // Skip if not a form field
      if (!['input', 'textarea', 'button'].includes(styles.tagName)) {
        continue;
      }
      
      totalTested++;
      
      // Check if focus indicator is visible (outline, box-shadow, or border change)
      const hasOutline = styles.outline !== 'none';
      const hasBoxShadow = hasGlowEffect(styles.boxShadow);
      const hasFocusIndicator = hasOutline || hasBoxShadow;
      
      if (hasFocusIndicator) {
        totalWithFocusIndicator++;
        console.log(`✓ ${styles.tagName}[${styles.id}]: Has visible focus indicator`);
      } else {
        console.log(`✗ ${styles.tagName}[${styles.id}]: No visible focus indicator`);
      }
      
      expect(hasFocusIndicator,
        `${styles.tagName}[${styles.id}] should have visible focus indicator ` +
        `(outline: "${styles.outline}", boxShadow: "${styles.boxShadow}")`
      ).toBe(true);
    }
    
    console.log(`\nTotal tested: ${totalTested}`);
    console.log(`With focus indicator: ${totalWithFocusIndicator}/${totalTested}`);
  });

  test('Property-based test: Transition timing functions are natural', async ({ page }) => {
    // Test that all transitions use natural easing functions (not linear)
    
    console.log('\n--- Testing Transition Timing Functions ---');
    
    const formFieldSelectors = [
      'input[type="date"]',
      'input[type="number"]',
      'textarea',
      '[role="combobox"]',
    ];
    
    let totalFields = 0;
    let fieldsWithNaturalEasing = 0;
    
    for (const selector of formFieldSelectors) {
      const count = await page.locator(selector).count();
      
      for (let i = 0; i < count; i++) {
        totalFields++;
        
        const styles = await getFormFieldStyles(page, selector, i);
        
        // Check timing function is not linear
        const timingFunction = styles.transitionTimingFunction;
        const isNaturalEasing = timingFunction !== 'linear' && 
                               (timingFunction.includes('ease') || 
                                timingFunction.includes('cubic-bezier'));
        
        if (isNaturalEasing) {
          fieldsWithNaturalEasing++;
          console.log(`✓ ${selector}[${i}] (${styles.id}): Has natural easing (${timingFunction})`);
        } else {
          console.log(`✗ ${selector}[${i}] (${styles.id}): Linear or no easing (${timingFunction})`);
        }
        
        expect(isNaturalEasing,
          `${selector}[${i}] (${styles.id}) should use natural easing function, ` +
          `got "${timingFunction}"`
        ).toBe(true);
      }
    }
    
    console.log(`\nTotal fields tested: ${totalFields}`);
    console.log(`Fields with natural easing: ${fieldsWithNaturalEasing}/${totalFields}`);
  });

  test('Property-based test: Border color changes on focus', async ({ page }) => {
    // Test that border color changes when form fields receive focus
    
    console.log('\n--- Testing Border Color Changes on Focus ---');
    
    const formFieldSelectors = [
      'input[type="date"]',
      'input[type="number"]',
      'textarea',
      '[role="combobox"]',
    ];
    
    let totalFields = 0;
    let fieldsWithBorderChange = 0;
    
    for (const selector of formFieldSelectors) {
      const count = await page.locator(selector).count();
      
      for (let i = 0; i < count; i++) {
        totalFields++;
        
        const defaultStyles = await getFormFieldStyles(page, selector, i);
        const focusStyles = await getFormFieldFocusStyles(page, selector, i);
        
        // Check if border color changes on focus
        const borderChanged = focusStyles.borderColor !== defaultStyles.borderColor;
        
        if (borderChanged) {
          fieldsWithBorderChange++;
          console.log(`✓ ${selector}[${i}] (${defaultStyles.id}): Border color changes on focus`);
        } else {
          console.log(`⚠ ${selector}[${i}] (${defaultStyles.id}): Border color unchanged (may use box-shadow instead)`);
        }
        
        // Border change OR box-shadow change is acceptable
        const hasVisualChange = borderChanged || 
                               (focusStyles.boxShadow !== defaultStyles.boxShadow);
        
        expect(hasVisualChange,
          `${selector}[${i}] (${defaultStyles.id}) should have visual change on focus ` +
          `(border or box-shadow)`
        ).toBe(true);
        
        // Blur the field
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
    }
    
    console.log(`\nTotal fields tested: ${totalFields}`);
    console.log(`Fields with border change: ${fieldsWithBorderChange}/${totalFields}`);
  });

  test('Property-based test: All form buttons have micro-interactions', async ({ page }) => {
    // Test that form buttons (Submit, Cancel) have proper micro-interactions
    
    console.log('\n--- Testing Form Button Micro-interactions ---');
    
    const buttons = await page.locator('button').all();
    
    console.log(`Testing ${buttons.length} buttons for micro-interactions...`);
    
    let totalButtons = 0;
    let buttonsWithMicroInteractions = 0;
    
    for (let i = 0; i < buttons.length; i++) {
      totalButtons++;
      
      const styles = await page.locator('button').nth(i).evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          transitionProperty: computed.transitionProperty,
          transitionDuration: computed.transitionDuration,
          classList: el.className,
          textContent: el.textContent?.trim(),
        };
      });
      
      // Check that buttons have transitions
      const hasTransitions = styles.transitionProperty !== 'none' &&
                            styles.transitionDuration !== '0s';
      
      if (hasTransitions) {
        buttonsWithMicroInteractions++;
        console.log(`✓ button[${i}] (${styles.textContent}): Has micro-interactions`);
      } else {
        console.log(`✗ button[${i}] (${styles.textContent}): No micro-interactions`);
      }
      
      expect(hasTransitions,
        `button[${i}] (${styles.textContent}) should have micro-interactions ` +
        `(transitionProperty: "${styles.transitionProperty}")`
      ).toBe(true);
    }
    
    console.log(`\nTotal buttons tested: ${totalButtons}`);
    console.log(`Buttons with micro-interactions: ${buttonsWithMicroInteractions}/${totalButtons}`);
  });
});
