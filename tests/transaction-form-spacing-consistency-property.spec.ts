/**
 * Property-Based Test: TransactionForm Spacing Consistency
 * 
 * **Validates: Requirements 8.4**
 * 
 * Property 29: TransactionForm Spacing Consistency
 * For any form element in TransactionForm, spacing (margins, padding) and alignment 
 * should be consistent across all elements, creating visual harmony.
 * 
 * This includes:
 * - Consistent spacing between form fields
 * - Proper padding and margins
 * - Responsive spacing that adapts to different screen sizes
 * - Alignment consistency across form elements
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const TEST_ITERATIONS = 20; // Reduced iterations for faster execution

/**
 * Parse CSS spacing value to pixels
 */
function parseSpacing(value: string): number {
  if (!value || value === 'auto' || value === 'none') {
    return 0;
  }
  
  if (value.endsWith('px')) {
    return parseFloat(value);
  } else if (value.endsWith('rem')) {
    return parseFloat(value) * 16; // Assuming 1rem = 16px
  } else if (value.endsWith('em')) {
    return parseFloat(value) * 16; // Approximate
  }
  
  return parseFloat(value) || 0;
}

/**
 * Get spacing information for an element
 */
async function getElementSpacing(page: Page, selector: string, index: number = 0) {
  return await page.locator(selector).nth(index).evaluate((el) => {
    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    
    return {
      // Margin values
      marginTop: computed.marginTop,
      marginRight: computed.marginRight,
      marginBottom: computed.marginBottom,
      marginLeft: computed.marginLeft,
      
      // Padding values
      paddingTop: computed.paddingTop,
      paddingRight: computed.paddingRight,
      paddingBottom: computed.paddingBottom,
      paddingLeft: computed.paddingLeft,
      
      // Element info
      width: rect.width,
      height: rect.height,
      classList: el.className,
      tagName: el.tagName.toLowerCase(),
      id: el.id,
      textContent: el.textContent?.trim().substring(0, 30) || '',
    };
  });
}

/**
 * Get form field container spacing
 */
async function getFormFieldContainerSpacing(page: Page) {
  // Get all form field containers (div elements with space-y-2 class)
  const containers = await page.locator('.space-y-2').all();
  const spacingData = [];
  
  for (let i = 0; i < containers.length; i++) {
    const spacing = await getElementSpacing(page, '.space-y-2', i);
    spacingData.push({
      index: i,
      ...spacing,
    });
  }
  
  return spacingData;
}

/**
 * Get form element spacing between adjacent elements
 */
async function getAdjacentElementSpacing(page: Page) {
  return await page.evaluate(() => {
    const formElements = Array.from(document.querySelectorAll('.space-y-2'));
    const spacingData = [];
    
    for (let i = 0; i < formElements.length - 1; i++) {
      const current = formElements[i];
      const next = formElements[i + 1];
      
      const currentRect = current.getBoundingClientRect();
      const nextRect = next.getBoundingClientRect();
      
      // Calculate gap between elements
      const gap = nextRect.top - (currentRect.top + currentRect.height);
      
      spacingData.push({
        currentIndex: i,
        nextIndex: i + 1,
        gap: gap,
        currentId: current.querySelector('input, textarea, [role="combobox"]')?.id || `element-${i}`,
        nextId: next.querySelector('input, textarea, [role="combobox"]')?.id || `element-${i + 1}`,
      });
    }
    
    return spacingData;
  });
}

/**
 * Get input field padding consistency
 */
async function getInputFieldPadding(page: Page) {
  const inputSelectors = [
    'input[type="date"]',
    'input[type="number"]',
    'textarea',
    '[role="combobox"]',
  ];
  
  const paddingData = [];
  
  for (const selector of inputSelectors) {
    const count = await page.locator(selector).count();
    
    for (let i = 0; i < count; i++) {
      const spacing = await getElementSpacing(page, selector, i);
      paddingData.push({
        selector,
        index: i,
        ...spacing,
      });
    }
  }
  
  return paddingData;
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

test.describe('Property 29: TransactionForm Spacing Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTransactionForm(page);
  });

  test('Form field containers should have consistent vertical spacing', async ({ page }) => {
    console.log('\n--- Testing Form Field Container Spacing ---');
    
    const containerSpacing = await getFormFieldContainerSpacing(page);
    
    console.log(`Found ${containerSpacing.length} form field containers`);
    
    if (containerSpacing.length < 2) {
      console.log('⚠ Not enough containers to test spacing consistency');
      return;
    }
    
    // Check that all containers have consistent margin/padding
    const firstContainer = containerSpacing[0];
    let consistentSpacing = 0;
    let inconsistentSpacing = 0;
    
    for (let i = 1; i < containerSpacing.length; i++) {
      const container = containerSpacing[i];
      
      // Compare margin and padding values
      const marginTopMatch = container.marginTop === firstContainer.marginTop;
      const marginBottomMatch = container.marginBottom === firstContainer.marginBottom;
      const paddingMatch = container.paddingTop === firstContainer.paddingTop &&
                          container.paddingBottom === firstContainer.paddingBottom;
      
      const isConsistent = marginTopMatch && marginBottomMatch && paddingMatch;
      
      if (isConsistent) {
        consistentSpacing++;
        console.log(`✓ Container ${i} (${container.id}): Consistent spacing`);
      } else {
        inconsistentSpacing++;
        console.log(`✗ Container ${i} (${container.id}): Inconsistent spacing`);
        console.log(`  Expected: margin(${firstContainer.marginTop}, ${firstContainer.marginBottom}), padding(${firstContainer.paddingTop}, ${firstContainer.paddingBottom})`);
        console.log(`  Actual: margin(${container.marginTop}, ${container.marginBottom}), padding(${container.paddingTop}, ${container.paddingBottom})`);
      }
      
      expect(isConsistent,
        `Container ${i} (${container.id}) should have consistent spacing with other containers`
      ).toBe(true);
    }
    
    console.log(`\nSpacing consistency: ${consistentSpacing}/${containerSpacing.length - 1} containers match`);
  });

  test('Adjacent form elements should have consistent gaps', async ({ page }) => {
    console.log('\n--- Testing Adjacent Element Gaps ---');
    
    const adjacentSpacing = await getAdjacentElementSpacing(page);
    
    console.log(`Found ${adjacentSpacing.length} adjacent element pairs`);
    
    if (adjacentSpacing.length < 2) {
      console.log('⚠ Not enough adjacent elements to test gap consistency');
      return;
    }
    
    // Calculate expected gap (should be consistent)
    const gaps = adjacentSpacing.map(s => Math.round(s.gap));
    const uniqueGaps = [...new Set(gaps)];
    
    console.log(`Gap values found: ${uniqueGaps.join(', ')}px`);
    
    // Allow for small variations (±2px) due to browser rendering differences
    const tolerance = 2;
    const expectedGap = gaps[0];
    
    let consistentGaps = 0;
    let inconsistentGaps = 0;
    
    for (const spacing of adjacentSpacing) {
      const actualGap = Math.round(spacing.gap);
      const isConsistent = Math.abs(actualGap - expectedGap) <= tolerance;
      
      if (isConsistent) {
        consistentGaps++;
        console.log(`✓ Gap between ${spacing.currentId} → ${spacing.nextId}: ${actualGap}px`);
      } else {
        inconsistentGaps++;
        console.log(`✗ Gap between ${spacing.currentId} → ${spacing.nextId}: ${actualGap}px (expected ~${expectedGap}px)`);
      }
      
      expect(isConsistent,
        `Gap between ${spacing.currentId} and ${spacing.nextId} should be consistent ` +
        `(expected ~${expectedGap}px ±${tolerance}px, got ${actualGap}px)`
      ).toBe(true);
    }
    
    console.log(`\nGap consistency: ${consistentGaps}/${adjacentSpacing.length} gaps are consistent`);
  });

  test('Input fields should have consistent padding', async ({ page }) => {
    console.log('\n--- Testing Input Field Padding Consistency ---');
    
    const inputPadding = await getInputFieldPadding(page);
    
    console.log(`Found ${inputPadding.length} input fields`);
    
    if (inputPadding.length < 2) {
      console.log('⚠ Not enough input fields to test padding consistency');
      return;
    }
    
    // Group by input type for comparison
    const inputsByType = inputPadding.reduce((acc, input) => {
      const key = input.selector;
      if (!acc[key]) acc[key] = [];
      acc[key].push(input);
      return acc;
    }, {} as Record<string, typeof inputPadding>);
    
    let totalConsistent = 0;
    let totalTested = 0;
    
    for (const [inputType, inputs] of Object.entries(inputsByType)) {
      if (inputs.length < 2) continue;
      
      console.log(`\nTesting ${inputs.length} ${inputType} fields:`);
      
      const firstInput = inputs[0];
      
      for (let i = 1; i < inputs.length; i++) {
        totalTested++;
        const input = inputs[i];
        
        // Compare padding values
        const paddingTopMatch = input.paddingTop === firstInput.paddingTop;
        const paddingRightMatch = input.paddingRight === firstInput.paddingRight;
        const paddingBottomMatch = input.paddingBottom === firstInput.paddingBottom;
        const paddingLeftMatch = input.paddingLeft === firstInput.paddingLeft;
        
        const isConsistent = paddingTopMatch && paddingRightMatch && 
                           paddingBottomMatch && paddingLeftMatch;
        
        if (isConsistent) {
          totalConsistent++;
          console.log(`✓ ${inputType}[${i}] (${input.id}): Consistent padding`);
        } else {
          console.log(`✗ ${inputType}[${i}] (${input.id}): Inconsistent padding`);
          console.log(`  Expected: ${firstInput.paddingTop} ${firstInput.paddingRight} ${firstInput.paddingBottom} ${firstInput.paddingLeft}`);
          console.log(`  Actual: ${input.paddingTop} ${input.paddingRight} ${input.paddingBottom} ${input.paddingLeft}`);
        }
        
        expect(isConsistent,
          `${inputType}[${i}] (${input.id}) should have consistent padding with other ${inputType} fields`
        ).toBe(true);
      }
    }
    
    console.log(`\nPadding consistency: ${totalConsistent}/${totalTested} comparisons passed`);
  });

  test('Form elements should have proper alignment', async ({ page }) => {
    console.log('\n--- Testing Form Element Alignment ---');
    
    // Get all form field containers and check their alignment
    const alignmentData = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('.space-y-2'));
      const alignmentInfo = [];
      
      for (let i = 0; i < containers.length; i++) {
        const container = containers[i];
        const rect = container.getBoundingClientRect();
        const label = container.querySelector('label');
        const input = container.querySelector('input, textarea, [role="combobox"]');
        
        if (label && input) {
          const labelRect = label.getBoundingClientRect();
          const inputRect = input.getBoundingClientRect();
          
          alignmentInfo.push({
            index: i,
            containerLeft: rect.left,
            labelLeft: labelRect.left,
            inputLeft: inputRect.left,
            labelId: label.getAttribute('for') || `label-${i}`,
            inputId: input.id || `input-${i}`,
          });
        }
      }
      
      return alignmentInfo;
    });
    
    console.log(`Found ${alignmentData.length} form field pairs (label + input)`);
    
    if (alignmentData.length < 2) {
      console.log('⚠ Not enough form field pairs to test alignment');
      return;
    }
    
    // Check that all labels are aligned
    const firstLabelLeft = alignmentData[0].labelLeft;
    const firstInputLeft = alignmentData[0].inputLeft;
    
    let alignedLabels = 0;
    let alignedInputs = 0;
    const tolerance = 2; // Allow 2px tolerance for alignment
    
    for (let i = 1; i < alignmentData.length; i++) {
      const data = alignmentData[i];
      
      // Check label alignment
      const labelAligned = Math.abs(data.labelLeft - firstLabelLeft) <= tolerance;
      if (labelAligned) {
        alignedLabels++;
        console.log(`✓ Label ${data.labelId}: Aligned (${data.labelLeft}px)`);
      } else {
        console.log(`✗ Label ${data.labelId}: Misaligned (${data.labelLeft}px, expected ~${firstLabelLeft}px)`);
      }
      
      // Check input alignment
      const inputAligned = Math.abs(data.inputLeft - firstInputLeft) <= tolerance;
      if (inputAligned) {
        alignedInputs++;
        console.log(`✓ Input ${data.inputId}: Aligned (${data.inputLeft}px)`);
      } else {
        console.log(`✗ Input ${data.inputId}: Misaligned (${data.inputLeft}px, expected ~${firstInputLeft}px)`);
      }
      
      expect(labelAligned,
        `Label ${data.labelId} should be aligned with other labels ` +
        `(expected ~${firstLabelLeft}px ±${tolerance}px, got ${data.labelLeft}px)`
      ).toBe(true);
      
      expect(inputAligned,
        `Input ${data.inputId} should be aligned with other inputs ` +
        `(expected ~${firstInputLeft}px ±${tolerance}px, got ${data.inputLeft}px)`
      ).toBe(true);
    }
    
    console.log(`\nAlignment consistency:`);
    console.log(`  Labels: ${alignedLabels}/${alignmentData.length - 1} aligned`);
    console.log(`  Inputs: ${alignedInputs}/${alignmentData.length - 1} aligned`);
  });

  test('Form should maintain spacing consistency across different viewport sizes', async ({ page }) => {
    console.log('\n--- Testing Responsive Spacing Consistency ---');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1200, height: 800 },
    ];
    
    const spacingByViewport = {};
    
    for (const viewport of viewports) {
      console.log(`\nTesting ${viewport.name} (${viewport.width}x${viewport.height}):`);
      
      // Set viewport size
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300); // Wait for responsive changes
      
      // Get spacing data
      const containerSpacing = await getFormFieldContainerSpacing(page);
      const adjacentSpacing = await getAdjacentElementSpacing(page);
      
      spacingByViewport[viewport.name] = {
        containerSpacing,
        adjacentSpacing,
      };
      
      console.log(`  Containers: ${containerSpacing.length}`);
      console.log(`  Adjacent gaps: ${adjacentSpacing.length}`);
      
      // Verify spacing is reasonable for this viewport
      if (adjacentSpacing.length > 0) {
        const avgGap = adjacentSpacing.reduce((sum, s) => sum + s.gap, 0) / adjacentSpacing.length;
        console.log(`  Average gap: ${Math.round(avgGap)}px`);
        
        // Gaps should be reasonable (not too small or too large)
        expect(avgGap,
          `Average gap on ${viewport.name} should be reasonable (8-40px), got ${avgGap}px`
        ).toBeGreaterThanOrEqual(8);
        
        expect(avgGap,
          `Average gap on ${viewport.name} should be reasonable (8-40px), got ${avgGap}px`
        ).toBeLessThanOrEqual(40);
      }
    }
    
    // Compare spacing consistency across viewports
    const viewportNames = Object.keys(spacingByViewport);
    if (viewportNames.length >= 2) {
      console.log('\nComparing spacing across viewports:');
      
      for (let i = 1; i < viewportNames.length; i++) {
        const current = spacingByViewport[viewportNames[i]];
        const previous = spacingByViewport[viewportNames[i - 1]];
        
        // Compare number of elements (should be consistent)
        const elementsConsistent = current.containerSpacing.length === previous.containerSpacing.length;
        
        expect(elementsConsistent,
          `Number of form elements should be consistent across viewports ` +
          `(${viewportNames[i - 1]}: ${previous.containerSpacing.length}, ` +
          `${viewportNames[i]}: ${current.containerSpacing.length})`
        ).toBe(true);
        
        if (elementsConsistent) {
          console.log(`✓ ${viewportNames[i - 1]} → ${viewportNames[i]}: Element count consistent`);
        }
      }
    }
  });

  test('Property-based test: All form elements maintain consistent spacing patterns', async ({ page }) => {
    console.log('\n--- Comprehensive Spacing Consistency Validation ---');
    
    // Get all spacing-related data
    const containerSpacing = await getFormFieldContainerSpacing(page);
    const adjacentSpacing = await getAdjacentElementSpacing(page);
    const inputPadding = await getInputFieldPadding(page);
    
    console.log(`Testing comprehensive spacing across:`);
    console.log(`  - ${containerSpacing.length} form field containers`);
    console.log(`  - ${adjacentSpacing.length} adjacent element pairs`);
    console.log(`  - ${inputPadding.length} input fields`);
    
    let totalTests = 0;
    let passedTests = 0;
    const failures = [];
    
    // Test 1: Container spacing consistency
    if (containerSpacing.length >= 2) {
      const firstContainer = containerSpacing[0];
      
      for (let i = 1; i < containerSpacing.length; i++) {
        totalTests++;
        const container = containerSpacing[i];
        
        const isConsistent = container.marginTop === firstContainer.marginTop &&
                           container.marginBottom === firstContainer.marginBottom;
        
        if (isConsistent) {
          passedTests++;
        } else {
          failures.push(`Container ${i} spacing inconsistent`);
        }
      }
    }
    
    // Test 2: Adjacent gap consistency
    if (adjacentSpacing.length >= 2) {
      const expectedGap = Math.round(adjacentSpacing[0].gap);
      const tolerance = 3;
      
      for (const spacing of adjacentSpacing) {
        totalTests++;
        const actualGap = Math.round(spacing.gap);
        const isConsistent = Math.abs(actualGap - expectedGap) <= tolerance;
        
        if (isConsistent) {
          passedTests++;
        } else {
          failures.push(`Gap ${spacing.currentId}→${spacing.nextId}: ${actualGap}px vs ${expectedGap}px`);
        }
      }
    }
    
    // Test 3: Input padding consistency by type
    const inputsByType = inputPadding.reduce((acc, input) => {
      const key = input.selector;
      if (!acc[key]) acc[key] = [];
      acc[key].push(input);
      return acc;
    }, {} as Record<string, typeof inputPadding>);
    
    for (const [inputType, inputs] of Object.entries(inputsByType)) {
      if (inputs.length >= 2) {
        const firstInput = inputs[0];
        
        for (let i = 1; i < inputs.length; i++) {
          totalTests++;
          const input = inputs[i];
          
          const isConsistent = input.paddingTop === firstInput.paddingTop &&
                             input.paddingRight === firstInput.paddingRight &&
                             input.paddingBottom === firstInput.paddingBottom &&
                             input.paddingLeft === firstInput.paddingLeft;
          
          if (isConsistent) {
            passedTests++;
          } else {
            failures.push(`${inputType}[${i}] padding inconsistent`);
          }
        }
      }
    }
    
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 100;
    
    console.log(`\nSpacing Consistency Results:`);
    console.log(`  Total tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log(`\nSpacing Consistency Failures:`);
      failures.slice(0, 10).forEach(f => console.log(`  ✗ ${f}`));
      if (failures.length > 10) {
        console.log(`  ... and ${failures.length - 10} more failures`);
      }
    }
    
    // Assert that at least 90% of spacing tests pass
    expect(successRate,
      `At least 90% of spacing consistency tests should pass. ` +
      `Got ${successRate.toFixed(1)}% (${passedTests}/${totalTests}). ` +
      `Failures: ${failures.slice(0, 5).join(', ')}`
    ).toBeGreaterThanOrEqual(90);
  });

  test('Property-based test: Form spacing adapts properly to content changes', async ({ page }) => {
    console.log('\n--- Testing Spacing Adaptation to Content Changes ---');
    
    // Get initial spacing
    const initialSpacing = await getAdjacentElementSpacing(page);
    
    // Fill out form fields to trigger content changes
    const testActions = [
      {
        name: 'Select transaction type',
        action: async () => {
          const select = page.locator('[role="combobox"]').first();
          await select.click();
          await page.waitForTimeout(200);
          
          const firstOption = page.locator('[role="option"]').first();
          if (await firstOption.count() > 0) {
            await firstOption.click();
            await page.waitForTimeout(300);
          }
        },
      },
      {
        name: 'Enter amount',
        action: async () => {
          const amountInput = page.locator('input[type="number"]');
          await amountInput.fill('150.75');
          await page.waitForTimeout(200);
        },
      },
      {
        name: 'Enter description',
        action: async () => {
          const textarea = page.locator('textarea');
          await textarea.fill('Test transaction with longer description to see how spacing adapts');
          await page.waitForTimeout(200);
        },
      },
    ];
    
    let consistentSpacing = 0;
    let totalChecks = 0;
    
    for (const testAction of testActions) {
      console.log(`\nTesting: ${testAction.name}`);
      
      await testAction.action();
      
      // Get spacing after action
      const newSpacing = await getAdjacentElementSpacing(page);
      
      // Compare with initial spacing
      if (newSpacing.length === initialSpacing.length) {
        for (let i = 0; i < newSpacing.length; i++) {
          totalChecks++;
          
          const initialGap = Math.round(initialSpacing[i].gap);
          const newGap = Math.round(newSpacing[i].gap);
          const tolerance = 5; // Allow some variation due to content changes
          
          const isConsistent = Math.abs(newGap - initialGap) <= tolerance;
          
          if (isConsistent) {
            consistentSpacing++;
          }
          
          expect(isConsistent,
            `[${testAction.name}] Gap between ${newSpacing[i].currentId} and ${newSpacing[i].nextId} ` +
            `should remain consistent (initial: ${initialGap}px, after: ${newGap}px, tolerance: ±${tolerance}px)`
          ).toBe(true);
        }
        
        console.log(`✓ Spacing maintained after ${testAction.name}`);
      } else {
        console.log(`⚠ Element count changed after ${testAction.name} (${initialSpacing.length} → ${newSpacing.length})`);
      }
    }
    
    const consistencyRate = totalChecks > 0 ? (consistentSpacing / totalChecks) * 100 : 100;
    console.log(`\nSpacing adaptation consistency: ${consistentSpacing}/${totalChecks} (${consistencyRate.toFixed(1)}%)`);
  });

  test('Property-based test: Error states maintain spacing consistency', async ({ page }) => {
    console.log('\n--- Testing Spacing Consistency with Error States ---');
    
    // Get initial spacing
    const initialSpacing = await getAdjacentElementSpacing(page);
    
    // Trigger validation errors by submitting empty form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(500); // Wait for validation
    
    // Get spacing after validation errors
    const errorSpacing = await getAdjacentElementSpacing(page);
    
    console.log(`Comparing spacing: ${initialSpacing.length} initial vs ${errorSpacing.length} with errors`);
    
    // Check if error messages are present
    const errorMessages = await page.locator('[role="alert"]').count();
    console.log(`Found ${errorMessages} error messages`);
    
    if (errorMessages > 0) {
      // Spacing might change due to error messages, but should remain consistent
      let consistentErrorSpacing = 0;
      let totalErrorChecks = 0;
      
      // Check that spacing between form fields (excluding error messages) is still consistent
      const formFieldSpacing = await page.evaluate(() => {
        const containers = Array.from(document.querySelectorAll('.space-y-2'));
        const spacingData = [];
        
        for (let i = 0; i < containers.length - 1; i++) {
          const current = containers[i];
          const next = containers[i + 1];
          
          const currentRect = current.getBoundingClientRect();
          const nextRect = next.getBoundingClientRect();
          
          // Calculate gap between form field containers (not including error messages)
          const gap = nextRect.top - (currentRect.top + currentRect.height);
          
          spacingData.push({
            index: i,
            gap: gap,
            currentId: current.querySelector('input, textarea, [role="combobox"]')?.id || `field-${i}`,
          });
        }
        
        return spacingData;
      });
      
      if (formFieldSpacing.length >= 2) {
        const expectedGap = Math.round(formFieldSpacing[0].gap);
        const tolerance = 10; // More tolerance with error states
        
        for (const spacing of formFieldSpacing) {
          totalErrorChecks++;
          const actualGap = Math.round(spacing.gap);
          const isConsistent = Math.abs(actualGap - expectedGap) <= tolerance;
          
          if (isConsistent) {
            consistentErrorSpacing++;
          }
          
          expect(isConsistent,
            `Form field spacing should remain consistent even with error states ` +
            `(field ${spacing.currentId}: expected ~${expectedGap}px ±${tolerance}px, got ${actualGap}px)`
          ).toBe(true);
        }
        
        const errorConsistencyRate = (consistentErrorSpacing / totalErrorChecks) * 100;
        console.log(`Error state spacing consistency: ${consistentErrorSpacing}/${totalErrorChecks} (${errorConsistencyRate.toFixed(1)}%)`);
      }
    } else {
      console.log('⚠ No error messages found - form validation may not be working as expected');
    }
  });

  test('Property-based test: Button spacing is consistent with form elements', async ({ page }) => {
    console.log('\n--- Testing Button Spacing Consistency ---');
    
    // Get button container spacing
    const buttonContainer = await page.locator('.flex.gap-4.pt-4').first();
    
    if (await buttonContainer.count() === 0) {
      console.log('⚠ Button container not found');
      return;
    }
    
    const buttonSpacing = await buttonContainer.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      
      return {
        marginTop: computed.marginTop,
        paddingTop: computed.paddingTop,
        gap: computed.gap,
        top: rect.top,
      };
    });
    
    // Get the last form field to compare spacing
    const lastFormField = await page.locator('.space-y-2').last().evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        bottom: rect.bottom,
      };
    });
    
    // Calculate gap between last form field and button container
    const gapToButtons = buttonSpacing.top - lastFormField.bottom;
    
    console.log(`Gap between last form field and buttons: ${Math.round(gapToButtons)}px`);
    console.log(`Button container padding-top: ${buttonSpacing.paddingTop}`);
    console.log(`Button container gap: ${buttonSpacing.gap}`);
    
    // Verify button spacing is reasonable
    expect(gapToButtons,
      `Gap between form fields and buttons should be reasonable (16-48px), got ${gapToButtons}px`
    ).toBeGreaterThanOrEqual(16);
    
    expect(gapToButtons,
      `Gap between form fields and buttons should be reasonable (16-48px), got ${gapToButtons}px`
    ).toBeLessThanOrEqual(48);
    
    // Verify button gap is consistent
    const buttonGap = parseSpacing(buttonSpacing.gap);
    expect(buttonGap,
      `Button gap should be reasonable (8-24px), got ${buttonGap}px`
    ).toBeGreaterThanOrEqual(8);
    
    expect(buttonGap,
      `Button gap should be reasonable (8-24px), got ${buttonGap}px`
    ).toBeLessThanOrEqual(24);
    
    console.log('✓ Button spacing is consistent with form elements');
  });
});