/**
 * Property-Based Test: Input Sizing Consistency
 * 
 * **Validates: Requirements 6.4**
 * 
 * Property 20: Input Sizing Consistency
 * For any input field (text, select, date picker), its height should be between 
 * 40px and 48px, and padding should be between 12px and 16px, ensuring consistent 
 * sizing across form elements.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const MIN_HEIGHT_PX = 40;
const MAX_HEIGHT_PX = 48;
const MIN_PADDING_PX = 12;
const MAX_PADDING_PX = 16;

/**
 * Parse CSS value to pixels
 * Handles px, rem, em units and converts to pixels
 */
function parseToPixels(value: string, fontSize: number = 16): number {
  if (!value || value === '0' || value === 'none' || value === 'auto') {
    return 0;
  }
  
  if (value.endsWith('px')) {
    return parseFloat(value);
  } else if (value.endsWith('rem')) {
    return parseFloat(value) * 16; // 1rem = 16px
  } else if (value.endsWith('em')) {
    return parseFloat(value) * fontSize;
  }
  
  // Try to parse as number (assume px)
  const numValue = parseFloat(value);
  return isNaN(numValue) ? 0 : numValue;
}

/**
 * Get computed sizing for an input element
 */
async function getInputSizing(page: Page, selector: string, index: number = 0) {
  return await page.locator(selector).nth(index).evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    return {
      height: computed.height,
      paddingTop: computed.paddingTop,
      paddingRight: computed.paddingRight,
      paddingBottom: computed.paddingBottom,
      paddingLeft: computed.paddingLeft,
      fontSize: computed.fontSize,
      tagName: el.tagName.toLowerCase(),
      type: (el as HTMLInputElement).type || 'N/A',
      classList: el.className,
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
 * Check if element is a form input (not a button or other element)
 */
function isFormInput(tagName: string, type: string): boolean {
  // Exclude buttons and other non-input elements
  if (type === 'button' || type === 'submit' || type === 'reset' || type === 'image') {
    return false;
  }
  
  // Include text inputs, selects, textareas, and date pickers
  return tagName === 'input' || tagName === 'select' || tagName === 'textarea';
}

test.describe('Property 20: Input Sizing Consistency', () => {
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

  test('Text input elements should have height within 40-48px range', async ({ page }) => {
    const textInputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], input[type="number"]').all();
    
    console.log(`\nTesting ${textInputs.length} text input elements for height consistency...`);
    
    for (let i = 0; i < Math.min(textInputs.length, 10); i++) {
      const sizing = await getInputSizing(page, 'input[type="text"], input[type="email"], input[type="password"], input[type="number"]', i);
      
      const fontSize = parseFloat(sizing.fontSize);
      const heightPx = parseToPixels(sizing.height, fontSize);
      
      expect(heightPx,
        `input[${i}] (${sizing.type}) height ${heightPx}px should be >= ${MIN_HEIGHT_PX}px ` +
        `(class: "${sizing.classList}")`
      ).toBeGreaterThanOrEqual(MIN_HEIGHT_PX);
      
      expect(heightPx,
        `input[${i}] (${sizing.type}) height ${heightPx}px should be <= ${MAX_HEIGHT_PX}px ` +
        `(class: "${sizing.classList}")`
      ).toBeLessThanOrEqual(MAX_HEIGHT_PX);
      
      console.log(`✓ input[${i}] (${sizing.type}): ${heightPx}px (${MIN_HEIGHT_PX}-${MAX_HEIGHT_PX}px)`);
    }
  });

  test('Text input elements should have padding within 12-16px range', async ({ page }) => {
    const textInputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], input[type="number"]').all();
    
    console.log(`\nTesting ${textInputs.length} text input elements for padding consistency...`);
    
    for (let i = 0; i < Math.min(textInputs.length, 10); i++) {
      const sizing = await getInputSizing(page, 'input[type="text"], input[type="email"], input[type="password"], input[type="number"]', i);
      
      const fontSize = parseFloat(sizing.fontSize);
      const paddingTopPx = parseToPixels(sizing.paddingTop, fontSize);
      const paddingRightPx = parseToPixels(sizing.paddingRight, fontSize);
      const paddingBottomPx = parseToPixels(sizing.paddingBottom, fontSize);
      const paddingLeftPx = parseToPixels(sizing.paddingLeft, fontSize);
      
      // Check horizontal padding (left and right)
      expect(paddingLeftPx,
        `input[${i}] (${sizing.type}) padding-left ${paddingLeftPx}px should be >= ${MIN_PADDING_PX}px`
      ).toBeGreaterThanOrEqual(MIN_PADDING_PX);
      
      expect(paddingLeftPx,
        `input[${i}] (${sizing.type}) padding-left ${paddingLeftPx}px should be <= ${MAX_PADDING_PX}px`
      ).toBeLessThanOrEqual(MAX_PADDING_PX);
      
      expect(paddingRightPx,
        `input[${i}] (${sizing.type}) padding-right ${paddingRightPx}px should be >= ${MIN_PADDING_PX}px`
      ).toBeGreaterThanOrEqual(MIN_PADDING_PX);
      
      expect(paddingRightPx,
        `input[${i}] (${sizing.type}) padding-right ${paddingRightPx}px should be <= ${MAX_PADDING_PX}px`
      ).toBeLessThanOrEqual(MAX_PADDING_PX);
      
      console.log(`✓ input[${i}] (${sizing.type}): padding L:${paddingLeftPx}px R:${paddingRightPx}px T:${paddingTopPx}px B:${paddingBottomPx}px`);
    }
  });

  test('Select elements should have height within 40-48px range', async ({ page }) => {
    const selects = await page.locator('select').all();
    
    if (selects.length === 0) {
      console.log('\nNo select elements found on page, skipping test');
      return;
    }
    
    console.log(`\nTesting ${selects.length} select elements for height consistency...`);
    
    for (let i = 0; i < Math.min(selects.length, 5); i++) {
      const sizing = await getInputSizing(page, 'select', i);
      
      const fontSize = parseFloat(sizing.fontSize);
      const heightPx = parseToPixels(sizing.height, fontSize);
      
      expect(heightPx,
        `select[${i}] height ${heightPx}px should be >= ${MIN_HEIGHT_PX}px ` +
        `(class: "${sizing.classList}")`
      ).toBeGreaterThanOrEqual(MIN_HEIGHT_PX);
      
      expect(heightPx,
        `select[${i}] height ${heightPx}px should be <= ${MAX_HEIGHT_PX}px ` +
        `(class: "${sizing.classList}")`
      ).toBeLessThanOrEqual(MAX_HEIGHT_PX);
      
      console.log(`✓ select[${i}]: ${heightPx}px (${MIN_HEIGHT_PX}-${MAX_HEIGHT_PX}px)`);
    }
  });

  test('Select elements should have padding within 12-16px range', async ({ page }) => {
    const selects = await page.locator('select').all();
    
    if (selects.length === 0) {
      console.log('\nNo select elements found on page, skipping test');
      return;
    }
    
    console.log(`\nTesting ${selects.length} select elements for padding consistency...`);
    
    for (let i = 0; i < Math.min(selects.length, 5); i++) {
      const sizing = await getInputSizing(page, 'select', i);
      
      const fontSize = parseFloat(sizing.fontSize);
      const paddingLeftPx = parseToPixels(sizing.paddingLeft, fontSize);
      const paddingRightPx = parseToPixels(sizing.paddingRight, fontSize);
      
      expect(paddingLeftPx,
        `select[${i}] padding-left ${paddingLeftPx}px should be >= ${MIN_PADDING_PX}px`
      ).toBeGreaterThanOrEqual(MIN_PADDING_PX);
      
      expect(paddingLeftPx,
        `select[${i}] padding-left ${paddingLeftPx}px should be <= ${MAX_PADDING_PX}px`
      ).toBeLessThanOrEqual(MAX_PADDING_PX);
      
      console.log(`✓ select[${i}]: padding L:${paddingLeftPx}px R:${paddingRightPx}px`);
    }
  });


  test('Date picker inputs should have height within 40-48px range', async ({ page }) => {
    const datePickers = await page.locator('input[type="date"], input[type="datetime-local"], input[type="time"]').all();
    
    if (datePickers.length === 0) {
      console.log('\nNo date picker elements found on page, skipping test');
      return;
    }
    
    console.log(`\nTesting ${datePickers.length} date picker elements for height consistency...`);
    
    for (let i = 0; i < Math.min(datePickers.length, 5); i++) {
      const sizing = await getInputSizing(page, 'input[type="date"], input[type="datetime-local"], input[type="time"]', i);
      
      const fontSize = parseFloat(sizing.fontSize);
      const heightPx = parseToPixels(sizing.height, fontSize);
      
      expect(heightPx,
        `date-picker[${i}] (${sizing.type}) height ${heightPx}px should be >= ${MIN_HEIGHT_PX}px ` +
        `(class: "${sizing.classList}")`
      ).toBeGreaterThanOrEqual(MIN_HEIGHT_PX);
      
      expect(heightPx,
        `date-picker[${i}] (${sizing.type}) height ${heightPx}px should be <= ${MAX_HEIGHT_PX}px ` +
        `(class: "${sizing.classList}")`
      ).toBeLessThanOrEqual(MAX_HEIGHT_PX);
      
      console.log(`✓ date-picker[${i}] (${sizing.type}): ${heightPx}px (${MIN_HEIGHT_PX}-${MAX_HEIGHT_PX}px)`);
    }
  });

  test('Textarea elements should have consistent padding within 12-16px range', async ({ page }) => {
    const textareas = await page.locator('textarea').all();
    
    if (textareas.length === 0) {
      console.log('\nNo textarea elements found on page, skipping test');
      return;
    }
    
    console.log(`\nTesting ${textareas.length} textarea elements for padding consistency...`);
    
    for (let i = 0; i < Math.min(textareas.length, 5); i++) {
      const sizing = await getInputSizing(page, 'textarea', i);
      
      const fontSize = parseFloat(sizing.fontSize);
      const paddingLeftPx = parseToPixels(sizing.paddingLeft, fontSize);
      const paddingRightPx = parseToPixels(sizing.paddingRight, fontSize);
      const paddingTopPx = parseToPixels(sizing.paddingTop, fontSize);
      
      expect(paddingLeftPx,
        `textarea[${i}] padding-left ${paddingLeftPx}px should be >= ${MIN_PADDING_PX}px`
      ).toBeGreaterThanOrEqual(MIN_PADDING_PX);
      
      expect(paddingLeftPx,
        `textarea[${i}] padding-left ${paddingLeftPx}px should be <= ${MAX_PADDING_PX}px`
      ).toBeLessThanOrEqual(MAX_PADDING_PX);
      
      expect(paddingTopPx,
        `textarea[${i}] padding-top ${paddingTopPx}px should be >= ${MIN_PADDING_PX}px`
      ).toBeGreaterThanOrEqual(MIN_PADDING_PX);
      
      expect(paddingTopPx,
        `textarea[${i}] padding-top ${paddingTopPx}px should be <= ${MAX_PADDING_PX}px`
      ).toBeLessThanOrEqual(MAX_PADDING_PX);
      
      console.log(`✓ textarea[${i}]: padding L:${paddingLeftPx}px R:${paddingRightPx}px T:${paddingTopPx}px`);
    }
  });

  test('Property-based test: Input size variants should maintain consistent sizing', async ({ page }) => {
    // Test that different input size variants (sm, default, lg) maintain appropriate sizing
    console.log('\n--- Testing Input Size Variants ---');
    
    const testResult = await page.evaluate(() => {
      const testContainer = document.createElement('div');
      testContainer.style.position = 'absolute';
      testContainer.style.visibility = 'hidden';
      document.body.appendChild(testContainer);
      
      const variants = [
        { name: 'sm', class: 'h-10 px-3 py-2' },
        { name: 'default', class: 'h-12 px-4 py-3' },
        { name: 'lg', class: 'h-14 px-5 py-4' },
      ];
      
      const results: Array<{
        variant: string;
        height: string;
        paddingLeft: string;
        paddingTop: string;
        fontSize: string;
      }> = [];
      
      for (const variant of variants) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = `flex w-full rounded-md border bg-background text-sm ${variant.class}`;
        testContainer.appendChild(input);
        
        const computed = window.getComputedStyle(input);
        results.push({
          variant: variant.name,
          height: computed.height,
          paddingLeft: computed.paddingLeft,
          paddingTop: computed.paddingTop,
          fontSize: computed.fontSize,
        });
      }
      
      document.body.removeChild(testContainer);
      return results;
    });
    
    console.log(`Testing ${testResult.length} input size variants...`);
    
    for (const result of testResult) {
      const fontSize = parseFloat(result.fontSize);
      const heightPx = parseToPixels(result.height, fontSize);
      const paddingLeftPx = parseToPixels(result.paddingLeft, fontSize);
      const paddingTopPx = parseToPixels(result.paddingTop, fontSize);
      
      // Default variant should be within the specified range
      if (result.variant === 'default') {
        expect(heightPx,
          `Input variant "${result.variant}" height ${heightPx}px should be >= ${MIN_HEIGHT_PX}px`
        ).toBeGreaterThanOrEqual(MIN_HEIGHT_PX);
        
        expect(heightPx,
          `Input variant "${result.variant}" height ${heightPx}px should be <= ${MAX_HEIGHT_PX}px`
        ).toBeLessThanOrEqual(MAX_HEIGHT_PX);
        
        expect(paddingLeftPx,
          `Input variant "${result.variant}" padding ${paddingLeftPx}px should be >= ${MIN_PADDING_PX}px`
        ).toBeGreaterThanOrEqual(MIN_PADDING_PX);
        
        expect(paddingLeftPx,
          `Input variant "${result.variant}" padding ${paddingLeftPx}px should be <= ${MAX_PADDING_PX}px`
        ).toBeLessThanOrEqual(MAX_PADDING_PX);
      }
      
      console.log(`✓ ${result.variant}: height=${heightPx}px, padding=${paddingLeftPx}px`);
    }
  });

  test('Property-based test: Comprehensive input sizing validation across all form inputs', async ({ page }) => {
    // This test validates the universal property: ALL form input elements should have 
    // consistent sizing (height 40-48px, padding 12-16px)
    
    console.log('\n--- Comprehensive Input Sizing Validation ---');
    
    const allInputs = await page.evaluate(() => {
      const inputs: Array<{
        index: number;
        tagName: string;
        type: string;
        classList: string;
        height: string;
        paddingLeft: string;
        paddingRight: string;
        paddingTop: string;
        paddingBottom: string;
        fontSize: string;
      }> = [];
      
      // Find all form input elements
      const elements = document.querySelectorAll('input, select, textarea');
      
      elements.forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        const tagName = el.tagName.toLowerCase();
        const type = (el as HTMLInputElement).type || 'N/A';
        
        // Skip button-type inputs
        if (type === 'button' || type === 'submit' || type === 'reset' || type === 'image' || type === 'checkbox' || type === 'radio') {
          return;
        }
        
        inputs.push({
          index,
          tagName,
          type,
          classList: el.className,
          height: computed.height,
          paddingLeft: computed.paddingLeft,
          paddingRight: computed.paddingRight,
          paddingTop: computed.paddingTop,
          paddingBottom: computed.paddingBottom,
          fontSize: computed.fontSize,
        });
      });
      
      return inputs;
    });
    
    console.log(`Testing ${allInputs.length} form input elements for sizing consistency...`);
    
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const inputInfo of allInputs.slice(0, 40)) {
      const fontSize = parseFloat(inputInfo.fontSize);
      const heightPx = parseToPixels(inputInfo.height, fontSize);
      const paddingLeftPx = parseToPixels(inputInfo.paddingLeft, fontSize);
      const paddingRightPx = parseToPixels(inputInfo.paddingRight, fontSize);
      
      // Skip textareas for height check (they can be taller)
      const shouldCheckHeight = inputInfo.tagName !== 'textarea';
      
      totalTested++;
      
      let heightValid = true;
      let paddingValid = true;
      
      // Check height (for non-textarea elements)
      if (shouldCheckHeight) {
        heightValid = heightPx >= MIN_HEIGHT_PX && heightPx <= MAX_HEIGHT_PX;
      }
      
      // Check padding
      paddingValid = paddingLeftPx >= MIN_PADDING_PX && paddingLeftPx <= MAX_PADDING_PX &&
                    paddingRightPx >= MIN_PADDING_PX && paddingRightPx <= MAX_PADDING_PX;
      
      const allChecksPassed = heightValid && paddingValid;
      
      if (allChecksPassed) {
        totalPassed++;
      } else {
        failures.push(
          `${inputInfo.tagName}[${inputInfo.index}] (${inputInfo.type}): ` +
          `height=${heightPx}px (expected ${MIN_HEIGHT_PX}-${MAX_HEIGHT_PX}px), ` +
          `padding L:${paddingLeftPx}px R:${paddingRightPx}px (expected ${MIN_PADDING_PX}-${MAX_PADDING_PX}px) - ` +
          `"${inputInfo.classList}"`
        );
      }
    }
    
    console.log(`\nTested ${totalTested} form input elements`);
    console.log(`Passed: ${totalPassed}/${totalTested} (${((totalPassed/totalTested)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nInput Sizing Failures:');
      failures.forEach(f => console.log(`  ✗ ${f}`));
    }
    
    // Assert that all tested inputs have consistent sizing
    expect(totalPassed,
      `All ${totalTested} form input elements should have consistent sizing. ` +
      `Failures:\n${failures.join('\n')}`
    ).toBe(totalTested);
  });


  test('Property-based test: Input sizing consistency across different page states', async ({ page }) => {
    // Test that input sizing remains consistent across different page states
    
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
        name: 'After focus interaction', 
        action: async () => {
          const input = page.locator('input[type="text"]').first();
          if (await input.count() > 0) {
            await input.focus();
            await page.waitForTimeout(200);
          }
        },
      },
    ];
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      await testCase.action();
      
      // Sample input elements
      const inputCount = await page.locator('input[type="text"], input[type="email"]').count();
      
      if (inputCount > 0) {
        const sizing = await getInputSizing(page, 'input[type="text"], input[type="email"]', 0);
        
        const fontSize = parseFloat(sizing.fontSize);
        const heightPx = parseToPixels(sizing.height, fontSize);
        const paddingLeftPx = parseToPixels(sizing.paddingLeft, fontSize);
        
        expect(heightPx,
          `[${testCase.name}] Input height ${heightPx}px should be >= ${MIN_HEIGHT_PX}px`
        ).toBeGreaterThanOrEqual(MIN_HEIGHT_PX);
        
        expect(heightPx,
          `[${testCase.name}] Input height ${heightPx}px should be <= ${MAX_HEIGHT_PX}px`
        ).toBeLessThanOrEqual(MAX_HEIGHT_PX);
        
        expect(paddingLeftPx,
          `[${testCase.name}] Input padding ${paddingLeftPx}px should be >= ${MIN_PADDING_PX}px`
        ).toBeGreaterThanOrEqual(MIN_PADDING_PX);
        
        expect(paddingLeftPx,
          `[${testCase.name}] Input padding ${paddingLeftPx}px should be <= ${MAX_PADDING_PX}px`
        ).toBeLessThanOrEqual(MAX_PADDING_PX);
        
        console.log(`✓ Input: height=${heightPx}px, padding=${paddingLeftPx}px in ${testCase.name}`);
      }
    }
  });

  test('Property-based test: Input sizing consistency across different input types', async ({ page }) => {
    // Verify that different input types maintain consistent sizing
    console.log('\n--- Testing Input Type Sizing Consistency ---');
    
    const inputTypes = [
      { type: 'text', selector: 'input[type="text"]' },
      { type: 'email', selector: 'input[type="email"]' },
      { type: 'password', selector: 'input[type="password"]' },
      { type: 'number', selector: 'input[type="number"]' },
    ];
    
    const sizingResults: Array<{ type: string; height: number; padding: number }> = [];
    
    for (const inputType of inputTypes) {
      const count = await page.locator(inputType.selector).count();
      
      if (count > 0) {
        const sizing = await getInputSizing(page, inputType.selector, 0);
        
        const fontSize = parseFloat(sizing.fontSize);
        const heightPx = parseToPixels(sizing.height, fontSize);
        const paddingLeftPx = parseToPixels(sizing.paddingLeft, fontSize);
        
        sizingResults.push({
          type: inputType.type,
          height: heightPx,
          padding: paddingLeftPx,
        });
        
        // Verify sizing is within range
        expect(heightPx,
          `${inputType.type} input height ${heightPx}px should be >= ${MIN_HEIGHT_PX}px`
        ).toBeGreaterThanOrEqual(MIN_HEIGHT_PX);
        
        expect(heightPx,
          `${inputType.type} input height ${heightPx}px should be <= ${MAX_HEIGHT_PX}px`
        ).toBeLessThanOrEqual(MAX_HEIGHT_PX);
        
        expect(paddingLeftPx,
          `${inputType.type} input padding ${paddingLeftPx}px should be >= ${MIN_PADDING_PX}px`
        ).toBeGreaterThanOrEqual(MIN_PADDING_PX);
        
        expect(paddingLeftPx,
          `${inputType.type} input padding ${paddingLeftPx}px should be <= ${MAX_PADDING_PX}px`
        ).toBeLessThanOrEqual(MAX_PADDING_PX);
        
        console.log(`✓ ${inputType.type}: height=${heightPx}px, padding=${paddingLeftPx}px`);
      }
    }
    
    // Verify consistency across types (all should have same height and padding)
    if (sizingResults.length > 1) {
      const firstHeight = sizingResults[0].height;
      const firstPadding = sizingResults[0].padding;
      
      for (let i = 1; i < sizingResults.length; i++) {
        expect(sizingResults[i].height,
          `${sizingResults[i].type} input height should match ${sizingResults[0].type} input height`
        ).toBe(firstHeight);
        
        expect(sizingResults[i].padding,
          `${sizingResults[i].type} input padding should match ${sizingResults[0].type} input padding`
        ).toBe(firstPadding);
      }
      
      console.log(`\n✓ All input types have consistent sizing: height=${firstHeight}px, padding=${firstPadding}px`);
    }
  });

  test('Property-based test: Input sizing maintains premium aesthetic standards', async ({ page }) => {
    // Verify that input sizing contributes to premium aesthetic
    console.log('\n--- Testing Premium Input Aesthetic Standards ---');
    
    const inputs = await page.evaluate(() => {
      const inputElements: Array<{
        type: string;
        height: string;
        paddingLeft: string;
        fontSize: string;
        hasTransition: boolean;
        hasBorder: boolean;
        hasRoundedCorners: boolean;
      }> = [];
      
      const elements = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], select');
      
      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const type = (el as HTMLInputElement).type || el.tagName.toLowerCase();
        
        inputElements.push({
          type,
          height: computed.height,
          paddingLeft: computed.paddingLeft,
          fontSize: computed.fontSize,
          hasTransition: computed.transitionProperty !== 'none',
          hasBorder: computed.borderWidth !== '0px',
          hasRoundedCorners: computed.borderRadius !== '0px',
        });
      });
      
      return inputElements;
    });
    
    console.log(`Testing ${inputs.length} input elements for premium aesthetic standards...`);
    
    for (const inputInfo of inputs.slice(0, 20)) {
      const fontSize = parseFloat(inputInfo.fontSize);
      const heightPx = parseToPixels(inputInfo.height, fontSize);
      const paddingLeftPx = parseToPixels(inputInfo.paddingLeft, fontSize);
      
      // Premium inputs should have:
      // 1. Consistent sizing within range
      const hasValidSizing = heightPx >= MIN_HEIGHT_PX && heightPx <= MAX_HEIGHT_PX &&
                            paddingLeftPx >= MIN_PADDING_PX && paddingLeftPx <= MAX_PADDING_PX;
      
      // 2. Smooth transitions for interactions
      const hasPremiumInteractions = inputInfo.hasTransition;
      
      // 3. Visual refinement (borders and rounded corners)
      const hasPremiumStyling = inputInfo.hasBorder && inputInfo.hasRoundedCorners;
      
      expect(hasValidSizing,
        `${inputInfo.type} input should have valid sizing (height: ${heightPx}px, padding: ${paddingLeftPx}px)`
      ).toBe(true);
      
      expect(hasPremiumInteractions,
        `${inputInfo.type} input should have smooth transitions for premium feel`
      ).toBe(true);
      
      expect(hasPremiumStyling,
        `${inputInfo.type} input should have borders and rounded corners for premium aesthetic`
      ).toBe(true);
      
      console.log(`✓ ${inputInfo.type}: sizing=${hasValidSizing}, transitions=${hasPremiumInteractions}, styling=${hasPremiumStyling}`);
    }
  });
});
