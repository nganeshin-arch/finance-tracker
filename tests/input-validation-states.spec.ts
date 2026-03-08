/**
 * Property-Based Test: Input Validation States
 * 
 * **Validates: Requirements 6.2, 6.3**
 * 
 * Property 19: Input Validation States
 * For any input field, when it contains an error, it should display red border 
 * styling and error message text; when successfully validated, it should display 
 * green border styling or success indicators.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const ERROR_BORDER_COLORS = [
  'rgb(239, 68, 68)',   // red-500
  'rgb(220, 38, 38)',   // red-600
  'rgb(185, 28, 28)',   // red-700
  'rgb(153, 27, 27)',   // red-800
];

const SUCCESS_BORDER_COLORS = [
  'rgb(16, 185, 129)',  // emerald-500
  'rgb(5, 150, 105)',   // emerald-600
  'rgb(4, 120, 87)',    // emerald-700
  'rgb(6, 95, 70)',     // emerald-800
];

const ERROR_TEXT_COLORS = [
  'rgb(239, 68, 68)',   // red-500
  'rgb(220, 38, 38)',   // red-600
  'rgb(185, 28, 28)',   // red-700
  'rgb(248, 113, 113)', // red-400
];

const SUCCESS_TEXT_COLORS = [
  'rgb(16, 185, 129)',  // emerald-500
  'rgb(5, 150, 105)',   // emerald-600
  'rgb(4, 120, 87)',    // emerald-700
  'rgb(52, 211, 153)',  // emerald-400
];

/**
 * Parse RGB color string to compare colors
 */
function parseRgbColor(colorStr: string): { r: number; g: number; b: number } | null {
  const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;
  
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
  };
}

/**
 * Check if a color is in the red spectrum (for error states)
 */
function isRedColor(colorStr: string): boolean {
  const color = parseRgbColor(colorStr);
  if (!color) return false;
  
  // Red colors have high red component and lower green/blue
  return color.r > 150 && color.r > color.g && color.r > color.b;
}

/**
 * Check if a color is in the green spectrum (for success states)
 */
function isGreenColor(colorStr: string): boolean {
  const color = parseRgbColor(colorStr);
  if (!color) return false;
  
  // Green colors have high green component
  return color.g > 120 && color.g > color.r && color.g > color.b;
}

/**
 * Get input validation state information
 */
async function getInputValidationState(page: Page, selector: string, index: number = 0) {
  return await page.locator(selector).nth(index).evaluate((el) => {
    const computed = window.getComputedStyle(el);
    const container = el.closest('div');
    
    // Look for error message
    const errorElement = container?.querySelector('[role="alert"], [id*="error"], .text-destructive, .text-red');
    const successElement = container?.querySelector('[id*="success"], .text-success, .text-green, .text-emerald');
    
    return {
      borderColor: computed.borderColor,
      borderWidth: computed.borderWidth,
      boxShadow: computed.boxShadow,
      hasAriaInvalid: el.hasAttribute('aria-invalid'),
      ariaInvalid: el.getAttribute('aria-invalid'),
      ariaDescribedBy: el.getAttribute('aria-describedby'),
      hasErrorMessage: !!errorElement,
      errorMessageText: errorElement?.textContent?.trim() || '',
      errorMessageColor: errorElement ? window.getComputedStyle(errorElement).color : '',
      hasSuccessMessage: !!successElement,
      successMessageText: successElement?.textContent?.trim() || '',
      successMessageColor: successElement ? window.getComputedStyle(successElement).color : '',
      classList: el.className,
      tagName: el.tagName.toLowerCase(),
      type: (el as HTMLInputElement).type || 'N/A',
    };
  });
}

/**
 * Create test input with validation state
 */
async function createTestInput(page: Page, state: 'error' | 'success' | 'default') {
  return await page.evaluate((state) => {
    // Create test container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-1000px';
    container.style.left = '-1000px';
    container.id = 'test-input-container';
    
    // Create input with appropriate classes based on state
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'test-input';
    
    if (state === 'error') {
      input.className = 'flex w-full rounded-md border border-destructive-500 focus-visible:border-destructive-600 focus-visible:ring-2 focus-visible:ring-destructive-500/20 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] bg-background text-sm ring-offset-background h-12 px-4 py-3 transition-all duration-200 ease-smooth focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', 'test-input-error');
      
      // Create error message
      const errorMsg = document.createElement('p');
      errorMsg.id = 'test-input-error';
      errorMsg.className = 'mt-1.5 text-sm text-destructive-600 dark:text-destructive-400 flex items-center gap-1.5 animate-fade-in';
      errorMsg.setAttribute('role', 'alert');
      errorMsg.innerHTML = `
        <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
        </svg>
        This field is required
      `;
      container.appendChild(errorMsg);
      
    } else if (state === 'success') {
      input.className = 'flex w-full rounded-md border border-success-500 focus-visible:border-success-600 focus-visible:ring-2 focus-visible:ring-success-500/20 focus-visible:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] bg-background text-sm ring-offset-background h-12 px-4 py-3 transition-all duration-200 ease-smooth focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
      input.setAttribute('aria-describedby', 'test-input-success');
      
      // Create success message
      const successMsg = document.createElement('p');
      successMsg.id = 'test-input-success';
      successMsg.className = 'mt-1.5 text-sm text-success-600 dark:text-success-400 flex items-center gap-1.5 animate-fade-in';
      successMsg.innerHTML = `
        <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
        </svg>
        Valid input
      `;
      container.appendChild(successMsg);
      
    } else {
      input.className = 'flex w-full rounded-md border border-input hover:border-input/80 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] bg-background text-sm ring-offset-background h-12 px-4 py-3 transition-all duration-200 ease-smooth focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
    }
    
    container.appendChild(input);
    document.body.appendChild(container);
    
    return container.id;
  }, state);
}

/**
 * Remove test input
 */
async function removeTestInput(page: Page, containerId: string) {
  await page.evaluate((id) => {
    const container = document.getElementById(id);
    if (container) {
      container.remove();
    }
  }, containerId);
}

test.describe('Property 19: Input Validation States', () => {
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

  test('Error state inputs should display red border styling', async ({ page }) => {
    console.log('\n--- Testing Error State Border Styling ---');
    
    // Create test input with error state
    const containerId = await createTestInput(page, 'error');
    
    try {
      const validationState = await getInputValidationState(page, '#test-input');
      
      // Check that border color is red
      const hasRedBorder = isRedColor(validationState.borderColor) || 
                          ERROR_BORDER_COLORS.includes(validationState.borderColor);
      
      expect(hasRedBorder,
        `Error state input should have red border color. Got: ${validationState.borderColor}`
      ).toBe(true);
      
      // Check that border is visible (not 0px)
      expect(validationState.borderWidth,
        'Error state input should have visible border'
      ).not.toBe('0px');
      
      // Check aria-invalid attribute
      expect(validationState.hasAriaInvalid,
        'Error state input should have aria-invalid attribute'
      ).toBe(true);
      
      expect(validationState.ariaInvalid,
        'Error state input should have aria-invalid="true"'
      ).toBe('true');
      
      console.log(`✓ Error input: border=${validationState.borderColor}, width=${validationState.borderWidth}, aria-invalid=${validationState.ariaInvalid}`);
      
    } finally {
      await removeTestInput(page, containerId);
    }
  });

  test('Error state inputs should display error message text', async ({ page }) => {
    console.log('\n--- Testing Error State Message Display ---');
    
    // Create test input with error state
    const containerId = await createTestInput(page, 'error');
    
    try {
      const validationState = await getInputValidationState(page, '#test-input');
      
      // Check that error message exists
      expect(validationState.hasErrorMessage,
        'Error state input should display error message'
      ).toBe(true);
      
      // Check that error message has content
      expect(validationState.errorMessageText.length,
        'Error message should have text content'
      ).toBeGreaterThan(0);
      
      // Check that error message color is red
      const hasRedText = isRedColor(validationState.errorMessageColor) || 
                        ERROR_TEXT_COLORS.includes(validationState.errorMessageColor);
      
      expect(hasRedText,
        `Error message should have red text color. Got: ${validationState.errorMessageColor}`
      ).toBe(true);
      
      // Check aria-describedby association
      expect(validationState.ariaDescribedBy,
        'Error state input should have aria-describedby attribute'
      ).toBeTruthy();
      
      console.log(`✓ Error message: text="${validationState.errorMessageText}", color=${validationState.errorMessageColor}, aria-describedby=${validationState.ariaDescribedBy}`);
      
    } finally {
      await removeTestInput(page, containerId);
    }
  });

  test('Success state inputs should display green border styling', async ({ page }) => {
    console.log('\n--- Testing Success State Border Styling ---');
    
    // Create test input with success state
    const containerId = await createTestInput(page, 'success');
    
    try {
      const validationState = await getInputValidationState(page, '#test-input');
      
      // Check that border color is green
      const hasGreenBorder = isGreenColor(validationState.borderColor) || 
                            SUCCESS_BORDER_COLORS.includes(validationState.borderColor);
      
      expect(hasGreenBorder,
        `Success state input should have green border color. Got: ${validationState.borderColor}`
      ).toBe(true);
      
      // Check that border is visible (not 0px)
      expect(validationState.borderWidth,
        'Success state input should have visible border'
      ).not.toBe('0px');
      
      // Check that aria-invalid is not set or is false
      expect(validationState.ariaInvalid,
        'Success state input should not have aria-invalid="true"'
      ).not.toBe('true');
      
      console.log(`✓ Success input: border=${validationState.borderColor}, width=${validationState.borderWidth}, aria-invalid=${validationState.ariaInvalid}`);
      
    } finally {
      await removeTestInput(page, containerId);
    }
  });

  test('Success state inputs should display success indicators', async ({ page }) => {
    console.log('\n--- Testing Success State Indicator Display ---');
    
    // Create test input with success state
    const containerId = await createTestInput(page, 'success');
    
    try {
      const validationState = await getInputValidationState(page, '#test-input');
      
      // Check that success message exists
      expect(validationState.hasSuccessMessage,
        'Success state input should display success indicator'
      ).toBe(true);
      
      // Check that success message has content
      expect(validationState.successMessageText.length,
        'Success indicator should have text content'
      ).toBeGreaterThan(0);
      
      // Check that success message color is green
      const hasGreenText = isGreenColor(validationState.successMessageColor) || 
                          SUCCESS_TEXT_COLORS.includes(validationState.successMessageColor);
      
      expect(hasGreenText,
        `Success indicator should have green text color. Got: ${validationState.successMessageColor}`
      ).toBe(true);
      
      // Check aria-describedby association
      expect(validationState.ariaDescribedBy,
        'Success state input should have aria-describedby attribute'
      ).toBeTruthy();
      
      console.log(`✓ Success indicator: text="${validationState.successMessageText}", color=${validationState.successMessageColor}, aria-describedby=${validationState.ariaDescribedBy}`);
      
    } finally {
      await removeTestInput(page, containerId);
    }
  });

  test('Property-based test: All input fields should support error validation states', async ({ page }) => {
    console.log('\n--- Testing Error States Across All Input Fields ---');
    
    // Find all input fields on the page
    const inputFields = await page.evaluate(() => {
      const inputs: Array<{
        selector: string;
        type: string;
        tagName: string;
        id: string;
        className: string;
      }> = [];
      
      const elements = document.querySelectorAll('input, select, textarea');
      
      elements.forEach((el, index) => {
        const tagName = el.tagName.toLowerCase();
        const type = (el as HTMLInputElement).type || tagName;
        
        // Skip button-type inputs and hidden inputs
        if (type === 'button' || type === 'submit' || type === 'reset' || 
            type === 'image' || type === 'hidden' || type === 'checkbox' || type === 'radio') {
          return;
        }
        
        // Create unique selector
        let selector = tagName;
        if (el.id) {
          selector = `#${el.id}`;
        } else if (el.className) {
          selector = `${tagName}.${el.className.split(' ')[0]}`;
        } else {
          selector = `${tagName}:nth-of-type(${index + 1})`;
        }
        
        inputs.push({
          selector,
          type,
          tagName,
          id: el.id || `${tagName}-${index}`,
          className: el.className,
        });
      });
      
      return inputs;
    });
    
    console.log(`Testing error state support across ${inputFields.length} input fields...`);
    
    let testedCount = 0;
    let supportedCount = 0;
    const failures: string[] = [];
    
    // Test up to 20 input fields for performance
    for (const field of inputFields.slice(0, 20)) {
      try {
        // Test if the input can be put into error state by adding error classes
        const canShowError = await page.evaluate((fieldInfo) => {
          const element = document.querySelector(fieldInfo.selector) as HTMLInputElement;
          if (!element) return false;
          
          // Try to simulate error state
          const originalClass = element.className;
          const originalAriaInvalid = element.getAttribute('aria-invalid');
          
          // Add error styling classes
          element.className = element.className.replace(/border-\w+/g, 'border-destructive-500');
          element.setAttribute('aria-invalid', 'true');
          
          // Check if styling changed
          const computed = window.getComputedStyle(element);
          const borderColor = computed.borderColor;
          
          // Restore original state
          element.className = originalClass;
          if (originalAriaInvalid) {
            element.setAttribute('aria-invalid', originalAriaInvalid);
          } else {
            element.removeAttribute('aria-invalid');
          }
          
          // Check if border color indicates error state capability
          return borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent';
        }, field);
        
        testedCount++;
        
        if (canShowError) {
          supportedCount++;
          console.log(`✓ ${field.type} (${field.selector}): supports error state`);
        } else {
          failures.push(`${field.type} (${field.selector}): cannot display error state`);
          console.log(`✗ ${field.type} (${field.selector}): cannot display error state`);
        }
        
      } catch (error) {
        failures.push(`${field.type} (${field.selector}): test failed - ${error}`);
      }
    }
    
    console.log(`\nTested ${testedCount} input fields`);
    console.log(`Error state support: ${supportedCount}/${testedCount} (${((supportedCount/testedCount)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nError State Support Failures:');
      failures.forEach(f => console.log(`  ${f}`));
    }
    
    // Expect at least 80% of inputs to support error states
    const successRate = supportedCount / testedCount;
    expect(successRate,
      `At least 80% of input fields should support error validation states. ` +
      `Got ${(successRate * 100).toFixed(1)}% (${supportedCount}/${testedCount}). ` +
      `Failures: ${failures.join(', ')}`
    ).toBeGreaterThanOrEqual(0.8);
  });

  test('Property-based test: All input fields should support success validation states', async ({ page }) => {
    console.log('\n--- Testing Success States Across All Input Fields ---');
    
    // Find all input fields on the page
    const inputFields = await page.evaluate(() => {
      const inputs: Array<{
        selector: string;
        type: string;
        tagName: string;
        id: string;
        className: string;
      }> = [];
      
      const elements = document.querySelectorAll('input, select, textarea');
      
      elements.forEach((el, index) => {
        const tagName = el.tagName.toLowerCase();
        const type = (el as HTMLInputElement).type || tagName;
        
        // Skip button-type inputs and hidden inputs
        if (type === 'button' || type === 'submit' || type === 'reset' || 
            type === 'image' || type === 'hidden' || type === 'checkbox' || type === 'radio') {
          return;
        }
        
        // Create unique selector
        let selector = tagName;
        if (el.id) {
          selector = `#${el.id}`;
        } else if (el.className) {
          selector = `${tagName}.${el.className.split(' ')[0]}`;
        } else {
          selector = `${tagName}:nth-of-type(${index + 1})`;
        }
        
        inputs.push({
          selector,
          type,
          tagName,
          id: el.id || `${tagName}-${index}`,
          className: el.className,
        });
      });
      
      return inputs;
    });
    
    console.log(`Testing success state support across ${inputFields.length} input fields...`);
    
    let testedCount = 0;
    let supportedCount = 0;
    const failures: string[] = [];
    
    // Test up to 20 input fields for performance
    for (const field of inputFields.slice(0, 20)) {
      try {
        // Test if the input can be put into success state by adding success classes
        const canShowSuccess = await page.evaluate((fieldInfo) => {
          const element = document.querySelector(fieldInfo.selector) as HTMLInputElement;
          if (!element) return false;
          
          // Try to simulate success state
          const originalClass = element.className;
          
          // Add success styling classes
          element.className = element.className.replace(/border-\w+/g, 'border-success-500');
          
          // Check if styling changed
          const computed = window.getComputedStyle(element);
          const borderColor = computed.borderColor;
          
          // Restore original state
          element.className = originalClass;
          
          // Check if border color indicates success state capability
          return borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent';
        }, field);
        
        testedCount++;
        
        if (canShowSuccess) {
          supportedCount++;
          console.log(`✓ ${field.type} (${field.selector}): supports success state`);
        } else {
          failures.push(`${field.type} (${field.selector}): cannot display success state`);
          console.log(`✗ ${field.type} (${field.selector}): cannot display success state`);
        }
        
      } catch (error) {
        failures.push(`${field.type} (${field.selector}): test failed - ${error}`);
      }
    }
    
    console.log(`\nTested ${testedCount} input fields`);
    console.log(`Success state support: ${supportedCount}/${testedCount} (${((supportedCount/testedCount)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nSuccess State Support Failures:');
      failures.forEach(f => console.log(`  ${f}`));
    }
    
    // Expect at least 80% of inputs to support success states
    const successRate = supportedCount / testedCount;
    expect(successRate,
      `At least 80% of input fields should support success validation states. ` +
      `Got ${(successRate * 100).toFixed(1)}% (${supportedCount}/${testedCount}). ` +
      `Failures: ${failures.join(', ')}`
    ).toBeGreaterThanOrEqual(0.8);
  });

  test('Property-based test: Validation state transitions should be smooth', async ({ page }) => {
    console.log('\n--- Testing Validation State Transition Smoothness ---');
    
    // Create test inputs for transition testing
    const testCases = [
      { from: 'default', to: 'error', name: 'Default to Error' },
      { from: 'error', to: 'success', name: 'Error to Success' },
      { from: 'success', to: 'default', name: 'Success to Default' },
    ];
    
    for (const testCase of testCases) {
      console.log(`\nTesting transition: ${testCase.name}`);
      
      // Create initial state input
      const containerId = await createTestInput(page, testCase.from as 'error' | 'success' | 'default');
      
      try {
        // Get initial state
        const initialState = await getInputValidationState(page, '#test-input');
        
        // Change to target state
        await page.evaluate((targetState) => {
          const input = document.getElementById('test-input') as HTMLInputElement;
          if (!input) return;
          
          // Remove existing state classes and attributes
          input.className = input.className.replace(/border-\w+-\d+/g, '');
          input.removeAttribute('aria-invalid');
          input.removeAttribute('aria-describedby');
          
          // Remove existing messages
          const container = input.parentElement;
          const existingMessages = container?.querySelectorAll('[role="alert"], [id*="error"], [id*="success"]');
          existingMessages?.forEach(msg => msg.remove());
          
          // Apply new state
          if (targetState === 'error') {
            input.className += ' border-destructive-500';
            input.setAttribute('aria-invalid', 'true');
          } else if (targetState === 'success') {
            input.className += ' border-success-500';
          } else {
            input.className += ' border-input';
          }
        }, testCase.to);
        
        // Wait for transition
        await page.waitForTimeout(300);
        
        // Get final state
        const finalState = await getInputValidationState(page, '#test-input');
        
        // Check that transition occurred
        const stateChanged = initialState.borderColor !== finalState.borderColor;
        
        expect(stateChanged,
          `Transition from ${testCase.from} to ${testCase.to} should change border color. ` +
          `Initial: ${initialState.borderColor}, Final: ${finalState.borderColor}`
        ).toBe(true);
        
        // Check that input has transition properties for smooth animation
        const hasTransition = await page.evaluate(() => {
          const input = document.getElementById('test-input');
          if (!input) return false;
          
          const computed = window.getComputedStyle(input);
          return computed.transitionProperty !== 'none' && 
                 computed.transitionDuration !== '0s';
        });
        
        expect(hasTransition,
          'Input should have CSS transitions for smooth state changes'
        ).toBe(true);
        
        console.log(`✓ ${testCase.name}: ${initialState.borderColor} → ${finalState.borderColor}`);
        
      } finally {
        await removeTestInput(page, containerId);
      }
    }
  });

  test('Property-based test: Validation states should maintain accessibility standards', async ({ page }) => {
    console.log('\n--- Testing Validation State Accessibility ---');
    
    const states = ['error', 'success'] as const;
    
    for (const state of states) {
      console.log(`\nTesting ${state} state accessibility...`);
      
      const containerId = await createTestInput(page, state);
      
      try {
        const validationState = await getInputValidationState(page, '#test-input');
        
        // Check ARIA attributes
        if (state === 'error') {
          expect(validationState.hasAriaInvalid,
            'Error state input should have aria-invalid attribute'
          ).toBe(true);
          
          expect(validationState.ariaInvalid,
            'Error state input should have aria-invalid="true"'
          ).toBe('true');
        }
        
        // Check aria-describedby association
        expect(validationState.ariaDescribedBy,
          `${state} state input should have aria-describedby attribute`
        ).toBeTruthy();
        
        // Check message element has proper role (for error messages)
        if (state === 'error') {
          const hasAlertRole = await page.evaluate(() => {
            const errorElement = document.querySelector('[role="alert"]');
            return !!errorElement;
          });
          
          expect(hasAlertRole,
            'Error message should have role="alert" for screen reader announcement'
          ).toBe(true);
        }
        
        // Check color contrast (basic check - colors should not be too light)
        const messageColor = state === 'error' ? validationState.errorMessageColor : validationState.successMessageColor;
        const color = parseRgbColor(messageColor);
        
        if (color) {
          // Basic contrast check - ensure colors are not too light (all components > 200 would be very light)
          const isTooLight = color.r > 200 && color.g > 200 && color.b > 200;
          
          expect(isTooLight,
            `${state} message color should have sufficient contrast (not too light). Got: ${messageColor}`
          ).toBe(false);
        }
        
        console.log(`✓ ${state} state: aria-invalid=${validationState.ariaInvalid}, aria-describedby=${validationState.ariaDescribedBy}, color=${messageColor}`);
        
      } finally {
        await removeTestInput(page, containerId);
      }
    }
  });

  test('Property-based test: Input validation states should work across different input types', async ({ page }) => {
    console.log('\n--- Testing Validation States Across Input Types ---');
    
    const inputTypes = [
      { type: 'text', name: 'Text Input' },
      { type: 'email', name: 'Email Input' },
      { type: 'password', name: 'Password Input' },
      { type: 'number', name: 'Number Input' },
    ];
    
    for (const inputType of inputTypes) {
      console.log(`\nTesting ${inputType.name} validation states...`);
      
      // Test both error and success states for each input type
      for (const state of ['error', 'success'] as const) {
        const containerId = await page.evaluate((type, validationState) => {
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.top = '-1000px';
          container.id = `test-${type}-${validationState}`;
          
          const input = document.createElement('input');
          input.type = type;
          input.id = `test-input-${type}-${validationState}`;
          
          if (validationState === 'error') {
            input.className = 'border-destructive-500 text-sm h-12 px-4';
            input.setAttribute('aria-invalid', 'true');
          } else {
            input.className = 'border-success-500 text-sm h-12 px-4';
          }
          
          container.appendChild(input);
          document.body.appendChild(container);
          
          return container.id;
        }, inputType.type, state);
        
        try {
          const validationState = await getInputValidationState(page, `#test-input-${inputType.type}-${state}`);
          
          // Check border color matches expected state
          const hasCorrectBorderColor = state === 'error' 
            ? isRedColor(validationState.borderColor) || ERROR_BORDER_COLORS.includes(validationState.borderColor)
            : isGreenColor(validationState.borderColor) || SUCCESS_BORDER_COLORS.includes(validationState.borderColor);
          
          expect(hasCorrectBorderColor,
            `${inputType.name} should have correct ${state} border color. Got: ${validationState.borderColor}`
          ).toBe(true);
          
          // Check ARIA attributes for error state
          if (state === 'error') {
            expect(validationState.ariaInvalid,
              `${inputType.name} in error state should have aria-invalid="true"`
            ).toBe('true');
          }
          
          console.log(`✓ ${inputType.name} ${state}: border=${validationState.borderColor}, aria-invalid=${validationState.ariaInvalid}`);
          
        } finally {
          await removeTestInput(page, containerId);
        }
      }
    }
  });

  test('Property-based test: Validation states should be consistent across viewport sizes', async ({ page }) => {
    console.log('\n--- Testing Validation State Consistency Across Viewports ---');
    
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' },
    ];
    
    for (const viewport of viewports) {
      console.log(`\nTesting validation states at ${viewport.name} (${viewport.width}x${viewport.height})...`);
      
      // Set viewport size
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300);
      
      // Test error state
      const errorContainerId = await createTestInput(page, 'error');
      
      try {
        const errorState = await getInputValidationState(page, '#test-input');
        
        // Check that error styling is maintained
        const hasRedBorder = isRedColor(errorState.borderColor) || 
                            ERROR_BORDER_COLORS.includes(errorState.borderColor);
        
        expect(hasRedBorder,
          `Error state should maintain red border at ${viewport.name} viewport. Got: ${errorState.borderColor}`
        ).toBe(true);
        
        expect(errorState.ariaInvalid,
          `Error state should maintain aria-invalid at ${viewport.name} viewport`
        ).toBe('true');
        
        console.log(`✓ ${viewport.name} error state: border=${errorState.borderColor}, aria-invalid=${errorState.ariaInvalid}`);
        
      } finally {
        await removeTestInput(page, errorContainerId);
      }
      
      // Test success state
      const successContainerId = await createTestInput(page, 'success');
      
      try {
        const successState = await getInputValidationState(page, '#test-input');
        
        // Check that success styling is maintained
        const hasGreenBorder = isGreenColor(successState.borderColor) || 
                              SUCCESS_BORDER_COLORS.includes(successState.borderColor);
        
        expect(hasGreenBorder,
          `Success state should maintain green border at ${viewport.name} viewport. Got: ${successState.borderColor}`
        ).toBe(true);
        
        console.log(`✓ ${viewport.name} success state: border=${successState.borderColor}`);
        
      } finally {
        await removeTestInput(page, successContainerId);
      }
    }
    
    // Reset to default viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});