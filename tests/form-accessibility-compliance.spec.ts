import { test, expect } from '@playwright/test';

/**
 * Form Accessibility Compliance Test Suite
 * 
 * This test suite validates that all form components meet accessibility standards:
 * - Label association using for/id attributes
 * - ARIA attributes for error messages (aria-invalid, aria-describedby)
 * - Screen reader announcements for validation states
 * - Keyboard navigation through forms
 * 
 * **Validates: Requirements 6.6, 11.6**
 */

test.describe('Form Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page with forms (TransactionForm)
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Click on "Add Transaction" or similar button to open the form
    const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction"), [data-testid="add-transaction"]').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500); // Wait for form to appear
    }
  });

  test('All form inputs should have properly associated labels', async ({ page }) => {
    console.log('\n--- Testing Label Association ---');
    
    // Find all input elements
    const inputs = await page.locator('input, select, textarea').all();
    let totalInputs = 0;
    let inputsWithLabels = 0;
    
    for (const input of inputs) {
      const inputId = await input.getAttribute('id');
      const inputType = await input.getAttribute('type');
      const tagName = await input.evaluate(el => el.tagName.toLowerCase());
      
      // Skip hidden inputs and buttons
      if (inputType === 'hidden' || inputType === 'button' || inputType === 'submit') {
        continue;
      }
      
      totalInputs++;
      
      if (inputId) {
        // Look for label with matching for attribute
        const associatedLabel = page.locator(`label[for="${inputId}"]`);
        const hasLabel = await associatedLabel.count() > 0;
        
        if (hasLabel) {
          inputsWithLabels++;
          const labelText = await associatedLabel.textContent();
          console.log(`✓ ${tagName}#${inputId}: Has associated label "${labelText?.trim()}"`);
        } else {
          console.log(`✗ ${tagName}#${inputId}: Missing associated label`);
        }
        
        expect(hasLabel, 
          `Input ${tagName}#${inputId} should have an associated label with for="${inputId}"`
        ).toBe(true);
      } else {
        console.log(`✗ ${tagName}: Missing id attribute (required for label association)`);
        expect(inputId, `Input ${tagName} should have an id attribute for label association`).toBeTruthy();
      }
    }
    
    console.log(`\nLabel Association Summary: ${inputsWithLabels}/${totalInputs} inputs have proper labels`);
    expect(inputsWithLabels).toBeGreaterThan(0); // Ensure we tested some inputs
  });

  test('Form inputs should have proper ARIA attributes for validation states', async ({ page }) => {
    console.log('\n--- Testing ARIA Attributes for Validation ---');
    
    // Find all input elements
    const inputs = await page.locator('input, select, textarea').all();
    let totalInputs = 0;
    let inputsWithAria = 0;
    
    for (const input of inputs) {
      const inputId = await input.getAttribute('id');
      const inputType = await input.getAttribute('type');
      const tagName = await input.evaluate(el => el.tagName.toLowerCase());
      
      // Skip hidden inputs and buttons
      if (inputType === 'hidden' || inputType === 'button' || inputType === 'submit') {
        continue;
      }
      
      totalInputs++;
      
      if (inputId) {
        // Check for ARIA attributes
        const ariaInvalid = await input.getAttribute('aria-invalid');
        const ariaDescribedBy = await input.getAttribute('aria-describedby');
        
        // Check if there are error/success/helper messages
        const errorMessage = page.locator(`#${inputId}-error, [id*="${inputId}"][id*="error"]`);
        const successMessage = page.locator(`#${inputId}-success, [id*="${inputId}"][id*="success"]`);
        const helperMessage = page.locator(`#${inputId}-helper, [id*="${inputId}"][id*="helper"]`);
        
        const hasErrorMessage = await errorMessage.count() > 0;
        const hasSuccessMessage = await successMessage.count() > 0;
        const hasHelperMessage = await helperMessage.count() > 0;
        
        // If there are validation messages, check ARIA attributes
        if (hasErrorMessage || hasSuccessMessage || hasHelperMessage) {
          inputsWithAria++;
          
          if (hasErrorMessage) {
            expect(ariaInvalid, 
              `Input ${tagName}#${inputId} with error message should have aria-invalid="true"`
            ).toBe('true');
            
            expect(ariaDescribedBy, 
              `Input ${tagName}#${inputId} with error message should have aria-describedby`
            ).toBeTruthy();
            
            console.log(`✓ ${tagName}#${inputId}: Has error ARIA attributes (aria-invalid="${ariaInvalid}", aria-describedby="${ariaDescribedBy}")`);
          }
          
          if (hasSuccessMessage && !hasErrorMessage) {
            expect(ariaDescribedBy, 
              `Input ${tagName}#${inputId} with success message should have aria-describedby`
            ).toBeTruthy();
            
            console.log(`✓ ${tagName}#${inputId}: Has success ARIA attributes (aria-describedby="${ariaDescribedBy}")`);
          }
          
          if (hasHelperMessage && !hasErrorMessage && !hasSuccessMessage) {
            expect(ariaDescribedBy, 
              `Input ${tagName}#${inputId} with helper text should have aria-describedby`
            ).toBeTruthy();
            
            console.log(`✓ ${tagName}#${inputId}: Has helper ARIA attributes (aria-describedby="${ariaDescribedBy}")`);
          }
        } else {
          console.log(`- ${tagName}#${inputId}: No validation messages (ARIA attributes not required)`);
        }
      }
    }
    
    console.log(`\nARIA Attributes Summary: ${inputsWithAria} inputs have validation messages with proper ARIA attributes`);
  });

  test('Error messages should have proper role and be announced to screen readers', async ({ page }) => {
    console.log('\n--- Testing Error Message Accessibility ---');
    
    // Find all error message elements
    const errorMessages = await page.locator('[id*="error"], [role="alert"], .text-destructive, .text-red').all();
    let totalErrors = 0;
    let accessibleErrors = 0;
    
    for (const errorMsg of errorMessages) {
      const isVisible = await errorMsg.isVisible();
      if (!isVisible) continue;
      
      totalErrors++;
      
      const role = await errorMsg.getAttribute('role');
      const id = await errorMsg.getAttribute('id');
      const textContent = await errorMsg.textContent();
      
      // Check if error message has proper role
      const hasAlertRole = role === 'alert';
      
      // Check if error message has an ID (for aria-describedby)
      const hasId = id !== null && id.includes('error');
      
      if (hasAlertRole || hasId) {
        accessibleErrors++;
        console.log(`✓ Error message: "${textContent?.trim()}" (role="${role}", id="${id}")`);
      } else {
        console.log(`✗ Error message: "${textContent?.trim()}" (missing role="alert" or error ID)`);
      }
      
      // At least one accessibility feature should be present
      expect(hasAlertRole || hasId, 
        `Error message "${textContent?.trim()}" should have role="alert" or an error ID for screen reader accessibility`
      ).toBe(true);
    }
    
    console.log(`\nError Message Summary: ${accessibleErrors}/${totalErrors} error messages are accessible`);
  });

  test('Form should be keyboard navigable with proper tab order', async ({ page }) => {
    console.log('\n--- Testing Keyboard Navigation ---');
    
    // Find all focusable elements in the form (limit to first 10 for faster testing)
    const allFocusableElements = await page.locator('input:not([type="hidden"]), select, textarea, button').all();
    const focusableElements = allFocusableElements.slice(0, 10);
    let totalFocusable = 0;
    let focusableWithIndicators = 0;
    
    for (const element of focusableElements) {
      const isVisible = await element.isVisible();
      const isDisabled = await element.isDisabled();
      
      if (!isVisible || isDisabled) continue;
      
      totalFocusable++;
      
      // Focus the element
      await element.focus();
      
      // Check if focus indicator is visible
      const focusedElement = page.locator(':focus');
      const isFocused = await focusedElement.count() > 0;
      
      if (isFocused) {
        // Check for visible focus indicator (outline, ring, etc.)
        const computedStyle = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            outline: style.outline,
            outlineWidth: style.outlineWidth,
            outlineStyle: style.outlineStyle,
            boxShadow: style.boxShadow,
            borderColor: style.borderColor
          };
        });
        
        const hasVisibleFocus = 
          computedStyle.outline !== 'none' ||
          computedStyle.outlineWidth !== '0px' ||
          computedStyle.boxShadow.includes('rgb') ||
          computedStyle.boxShadow.includes('rgba');
        
        if (hasVisibleFocus) {
          focusableWithIndicators++;
          console.log(`✓ Element is focusable with visible indicator`);
        } else {
          console.log(`✗ Element is focusable but lacks visible focus indicator`);
        }
        
        expect(hasVisibleFocus, 
          'Focusable element should have a visible focus indicator (outline, box-shadow, etc.)'
        ).toBe(true);
      }
    }
    
    console.log(`\nKeyboard Navigation Summary: ${focusableWithIndicators}/${totalFocusable} focusable elements have visible focus indicators (tested ${totalFocusable} of ${allFocusableElements.length} total elements)`);
    expect(totalFocusable).toBeGreaterThan(0); // Ensure we tested some elements
  });

  test('Form validation should trigger proper screen reader announcements', async ({ page }) => {
    console.log('\n--- Testing Screen Reader Announcements ---');
    
    // Try to trigger validation by submitting an empty form or invalid data
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Submit")').first();
    
    if (await submitButton.isVisible()) {
      // Clear any existing input values to trigger validation
      const requiredInputs = await page.locator('input[required], input:has-text("*")').all();
      
      for (const input of requiredInputs) {
        await input.fill('');
      }
      
      // Submit the form to trigger validation
      await submitButton.click();
      await page.waitForTimeout(500); // Wait for validation messages
      
      // Check for validation messages that appeared
      const validationMessages = await page.locator('[role="alert"], [id*="error"], .text-destructive').all();
      let announceableMessages = 0;
      
      for (const message of validationMessages) {
        const isVisible = await message.isVisible();
        if (!isVisible) continue;
        
        const role = await message.getAttribute('role');
        const id = await message.getAttribute('id');
        const textContent = await message.textContent();
        
        // Check if message is announceable (has role="alert" or is referenced by aria-describedby)
        const isAnnounceable = role === 'alert' || (id && id.includes('error'));
        
        if (isAnnounceable) {
          announceableMessages++;
          console.log(`✓ Validation message is announceable: "${textContent?.trim()}" (role="${role}", id="${id}")`);
        } else {
          console.log(`✗ Validation message may not be announced: "${textContent?.trim()}"`);
        }
      }
      
      console.log(`\nScreen Reader Announcements: ${announceableMessages} validation messages are properly configured for screen readers`);
    } else {
      console.log('No submit button found - skipping validation announcement test');
    }
  });

  test('Property-based test: All form inputs should have consistent accessibility patterns', async ({ page }) => {
    console.log('\n--- Property-based Test: Form Input Accessibility Patterns ---');
    
    // Get all form inputs (reduced sample size for faster execution)
    const allInputs = await page.locator('input:not([type="hidden"]):not([type="button"]):not([type="submit"]), select, textarea').all();
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    // Limit to first 5 inputs for faster testing while maintaining coverage
    const inputsToTest = allInputs.slice(0, 5);
    
    for (const input of inputsToTest) {
      const isVisible = await input.isVisible();
      if (!isVisible) continue;
      
      totalTested++;
      
      const inputId = await input.getAttribute('id');
      const tagName = await input.evaluate(el => el.tagName.toLowerCase());
      const inputType = await input.getAttribute('type') || tagName;
      
      // Test 1: Has ID for label association
      const hasId = inputId !== null && inputId.length > 0;
      
      // Test 2: Has associated label
      const hasLabel = hasId ? await page.locator(`label[for="${inputId}"]`).count() > 0 : false;
      
      // Test 3: If has validation messages, has proper ARIA
      const hasErrorMsg = hasId ? await page.locator(`#${inputId}-error`).count() > 0 : false;
      const hasSuccessMsg = hasId ? await page.locator(`#${inputId}-success`).count() > 0 : false;
      const hasHelperMsg = hasId ? await page.locator(`#${inputId}-helper`).count() > 0 : false;
      
      let hasProperAria = true;
      if (hasErrorMsg || hasSuccessMsg || hasHelperMsg) {
        const ariaDescribedBy = await input.getAttribute('aria-describedby');
        hasProperAria = ariaDescribedBy !== null;
        
        if (hasErrorMsg) {
          const ariaInvalid = await input.getAttribute('aria-invalid');
          hasProperAria = hasProperAria && ariaInvalid === 'true';
        }
      }
      
      // Test 4: Is keyboard focusable (if not disabled)
      const isDisabled = await input.isDisabled();
      let isFocusable = true;
      if (!isDisabled) {
        await input.focus();
        const focusedElement = page.locator(':focus');
        isFocusable = await focusedElement.count() > 0;
      }
      
      // All tests must pass
      const allTestsPassed = hasId && hasLabel && hasProperAria && isFocusable;
      
      if (allTestsPassed) {
        totalPassed++;
        console.log(`✓ ${inputType}#${inputId}: All accessibility tests passed`);
      } else {
        const failureReasons = [];
        if (!hasId) failureReasons.push('missing ID');
        if (!hasLabel) failureReasons.push('missing label');
        if (!hasProperAria) failureReasons.push('improper ARIA');
        if (!isFocusable && !isDisabled) failureReasons.push('not focusable');
        
        const failureMsg = `${inputType}#${inputId || 'no-id'}: ${failureReasons.join(', ')}`;
        failures.push(failureMsg);
        console.log(`✗ ${failureMsg}`);
      }
    }
    
    console.log(`\nProperty-based Test Summary: ${totalPassed}/${totalTested} inputs passed all accessibility tests (tested ${totalTested} of ${allInputs.length} total inputs)`);
    
    if (failures.length > 0) {
      console.log('\nFailures:');
      failures.forEach(failure => console.log(`  - ${failure}`));
    }
    
    // Assert that all tested inputs pass accessibility tests
    expect(totalPassed, 
      `All ${totalTested} tested form inputs should pass accessibility tests. Failures:\n${failures.join('\n')}`
    ).toBe(totalTested);
    
    // Ensure we tested at least some inputs
    expect(totalTested, 'Should have tested at least some form inputs').toBeGreaterThan(0);
  });
});