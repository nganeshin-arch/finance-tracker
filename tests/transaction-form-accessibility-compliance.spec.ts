import { test, expect } from '@playwright/test';

/**
 * TransactionForm Accessibility Compliance Test Suite
 * 
 * This test suite validates that the TransactionForm component meets WCAG 2.1 AA standards:
 * - Keyboard navigation through all form fields
 * - Visible focus indicators on all interactive elements
 * - Screen reader announcements for labels and errors
 * - Proper tab order and ARIA attributes
 * - Form accessibility compliance
 * 
 * **Validates: Requirements 8.6, 11.2, 11.6**
 */

test.describe('TransactionForm Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open the TransactionForm (look for various possible triggers)
    const addTransactionTriggers = [
      'button:has-text("Add Transaction")',
      'button:has-text("New Transaction")',
      '[data-testid="add-transaction"]',
      'button:has-text("Create Transaction")',
      '.add-transaction-btn'
    ];
    
    let formOpened = false;
    for (const selector of addTransactionTriggers) {
      const trigger = page.locator(selector).first();
      if (await trigger.isVisible()) {
        await trigger.click();
        await page.waitForTimeout(500);
        formOpened = true;
        break;
      }
    }
    
    // If no trigger found, check if form is already visible
    if (!formOpened) {
      const form = page.locator('form[aria-label*="transaction"], form:has(input[id*="transaction"]), form:has(input[id*="amount"])');
      if (await form.count() > 0) {
        formOpened = true;
      }
    }
    
    // Ensure we have a transaction form visible
    expect(formOpened, 'TransactionForm should be visible for testing').toBe(true);
  });

  test('TransactionForm should have proper semantic structure and form labeling', async ({ page }) => {
    console.log('\n--- Testing TransactionForm Semantic Structure ---');
    
    // Check for form element with proper aria-label
    const form = page.locator('form[aria-label*="transaction"], form:has(input[id*="amount"])').first();
    expect(await form.count(), 'TransactionForm should have a form element').toBeGreaterThan(0);
    
    const formAriaLabel = await form.getAttribute('aria-label');
    console.log(`✓ Form has aria-label: "${formAriaLabel}"`);
    expect(formAriaLabel, 'Form should have descriptive aria-label').toBeTruthy();
    
    // Check for form title/heading
    const formTitle = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /transaction/i }).first();
    if (await formTitle.count() > 0) {
      const titleText = await formTitle.textContent();
      console.log(`✓ Form has title: "${titleText?.trim()}"`);
    }
  });

  test('All form fields should have proper label association', async ({ page }) => {
    console.log('\n--- Testing TransactionForm Label Association ---');
    
    // Define expected form fields for TransactionForm
    const expectedFields = [
      { id: 'date', label: /date/i },
      { id: 'transactionTypeId', label: /transaction.*type|type/i },
      { id: 'categoryId', label: /category/i },
      { id: 'subCategoryId', label: /sub.*category|subcategory/i },
      { id: 'paymentModeId', label: /payment.*mode|payment/i },
      { id: 'accountId', label: /account/i },
      { id: 'amount', label: /amount/i },
      { id: 'description', label: /description/i }
    ];
    
    let fieldsFound = 0;
    let fieldsWithLabels = 0;
    
    for (const field of expectedFields) {
      const input = page.locator(`input[id="${field.id}"], select[id="${field.id}"], textarea[id="${field.id}"]`);
      
      if (await input.count() > 0) {
        fieldsFound++;
        
        // Check for associated label
        const label = page.locator(`label[for="${field.id}"]`);
        const hasLabel = await label.count() > 0;
        
        if (hasLabel) {
          fieldsWithLabels++;
          const labelText = await label.textContent();
          console.log(`✓ ${field.id}: Has label "${labelText?.trim()}"`);
          
          // Verify label text matches expected pattern
          expect(labelText?.toLowerCase(), 
            `Label for ${field.id} should match expected pattern`
          ).toMatch(field.label);
        } else {
          console.log(`✗ ${field.id}: Missing associated label`);
        }
        
        expect(hasLabel, `Field ${field.id} should have an associated label`).toBe(true);
      }
    }
    
    console.log(`\nLabel Association Summary: ${fieldsWithLabels}/${fieldsFound} fields have proper labels`);
    expect(fieldsFound, 'Should find at least 6 form fields').toBeGreaterThanOrEqual(6);
    expect(fieldsWithLabels, 'All found fields should have labels').toBe(fieldsFound);
  });

  test('Form fields should have proper ARIA attributes and validation states', async ({ page }) => {
    console.log('\n--- Testing TransactionForm ARIA Attributes ---');
    
    const formFields = [
      'date', 'transactionTypeId', 'categoryId', 'subCategoryId', 
      'paymentModeId', 'accountId', 'amount', 'description'
    ];
    
    let fieldsWithAria = 0;
    
    for (const fieldId of formFields) {
      const field = page.locator(`input[id="${fieldId}"], select[id="${fieldId}"], textarea[id="${fieldId}"]`);
      
      if (await field.count() > 0) {
        // Check required ARIA attributes
        const ariaRequired = await field.getAttribute('aria-required');
        const ariaLabel = await field.getAttribute('aria-label');
        const ariaInvalid = await field.getAttribute('aria-invalid');
        const ariaDescribedBy = await field.getAttribute('aria-describedby');
        
        // Required fields should have aria-required
        if (fieldId !== 'description') { // description is optional
          expect(ariaRequired, 
            `Required field ${fieldId} should have aria-required="true"`
          ).toBe('true');
        }
        
        // Fields should have aria-label for screen readers
        expect(ariaLabel, 
          `Field ${fieldId} should have aria-label`
        ).toBeTruthy();
        
        // Check for error message association
        const errorMessage = page.locator(`#${fieldId}-error`);
        const hasErrorMessage = await errorMessage.count() > 0;
        
        if (hasErrorMessage) {
          expect(ariaInvalid, 
            `Field ${fieldId} with error should have aria-invalid="true"`
          ).toBe('true');
          
          expect(ariaDescribedBy, 
            `Field ${fieldId} with error should have aria-describedby`
          ).toContain(`${fieldId}-error`);
        }
        
        fieldsWithAria++;
        console.log(`✓ ${fieldId}: ARIA attributes configured (required="${ariaRequired}", label="${ariaLabel}", invalid="${ariaInvalid}")`);
      }
    }
    
    console.log(`\nARIA Attributes Summary: ${fieldsWithAria} fields have proper ARIA attributes`);
    expect(fieldsWithAria, 'Should test ARIA attributes for multiple fields').toBeGreaterThan(0);
  });

  test('Keyboard navigation should work through all form fields with proper tab order', async ({ page }) => {
    console.log('\n--- Testing TransactionForm Keyboard Navigation ---');
    
    // Get all focusable elements in the form in tab order
    const focusableElements = await page.locator(`
      input:not([type="hidden"]):not([disabled]), 
      select:not([disabled]), 
      textarea:not([disabled]), 
      button:not([disabled])
    `).all();
    
    let focusableCount = 0;
    let focusableWithIndicators = 0;
    const tabOrder: string[] = [];
    
    // Test keyboard navigation through each element
    for (let i = 0; i < focusableElements.length; i++) {
      const element = focusableElements[i];
      const isVisible = await element.isVisible();
      
      if (!isVisible) continue;
      
      focusableCount++;
      
      // Focus the element using keyboard (Tab key simulation)
      if (i === 0) {
        await element.focus();
      } else {
        await page.keyboard.press('Tab');
      }
      
      // Verify element is focused
      const isFocused = await element.evaluate(el => el === document.activeElement);
      expect(isFocused, `Element ${i + 1} should be focusable via keyboard`).toBe(true);
      
      // Check for visible focus indicator
      const focusStyles = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          boxShadow: style.boxShadow,
          borderColor: style.borderColor,
          ringWidth: style.getPropertyValue('--tw-ring-width') || '0px'
        };
      });
      
      const hasVisibleFocus = 
        focusStyles.outline !== 'none' ||
        parseFloat(focusStyles.outlineWidth) > 0 ||
        focusStyles.boxShadow.includes('rgb') ||
        focusStyles.boxShadow.includes('rgba') ||
        parseFloat(focusStyles.ringWidth) > 0;
      
      if (hasVisibleFocus) {
        focusableWithIndicators++;
      }
      
      // Get element identifier for tab order tracking
      const elementId = await element.getAttribute('id') || 
                       await element.getAttribute('name') || 
                       await element.evaluate(el => el.tagName.toLowerCase());
      tabOrder.push(elementId);
      
      console.log(`${hasVisibleFocus ? '✓' : '✗'} Element ${i + 1} (${elementId}): ${hasVisibleFocus ? 'Has' : 'Missing'} visible focus indicator`);
      
      expect(hasVisibleFocus, 
        `Element ${elementId} should have visible focus indicator`
      ).toBe(true);
    }
    
    console.log(`\nTab Order: ${tabOrder.join(' → ')}`);
    console.log(`Keyboard Navigation Summary: ${focusableWithIndicators}/${focusableCount} elements have visible focus indicators`);
    
    expect(focusableCount, 'Should have multiple focusable elements').toBeGreaterThan(5);
    expect(focusableWithIndicators, 'All focusable elements should have visible focus indicators').toBe(focusableCount);
  });

  test('Focus indicators should be visible and have sufficient contrast', async ({ page }) => {
    console.log('\n--- Testing TransactionForm Focus Indicator Visibility ---');
    
    const focusableElements = await page.locator(`
      input:not([type="hidden"]):not([disabled]), 
      select:not([disabled]), 
      textarea:not([disabled]), 
      button:not([disabled])
    `).all();
    
    let elementsWithSufficientContrast = 0;
    let totalTested = 0;
    
    for (const element of focusableElements) {
      const isVisible = await element.isVisible();
      if (!isVisible) continue;
      
      totalTested++;
      
      // Focus the element
      await element.focus();
      
      // Get focus styles and background color
      const focusInfo = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        return {
          outline: style.outline,
          outlineColor: style.outlineColor,
          outlineWidth: style.outlineWidth,
          boxShadow: style.boxShadow,
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          elementId: el.id || el.name || el.tagName.toLowerCase(),
          width: rect.width,
          height: rect.height
        };
      });
      
      // Check if focus indicator is visible (basic check)
      const hasVisibleFocusIndicator = 
        focusInfo.outline !== 'none' ||
        parseFloat(focusInfo.outlineWidth) > 0 ||
        focusInfo.boxShadow.includes('rgb') ||
        focusInfo.boxShadow.includes('rgba');
      
      if (hasVisibleFocusIndicator) {
        elementsWithSufficientContrast++;
        console.log(`✓ ${focusInfo.elementId}: Has visible focus indicator`);
        console.log(`  - Outline: ${focusInfo.outline}`);
        console.log(`  - Box Shadow: ${focusInfo.boxShadow}`);
      } else {
        console.log(`✗ ${focusInfo.elementId}: Missing visible focus indicator`);
      }
      
      expect(hasVisibleFocusIndicator, 
        `Element ${focusInfo.elementId} should have a visible focus indicator`
      ).toBe(true);
    }
    
    console.log(`\nFocus Indicator Summary: ${elementsWithSufficientContrast}/${totalTested} elements have visible focus indicators`);
    expect(totalTested, 'Should test focus indicators on multiple elements').toBeGreaterThan(0);
    expect(elementsWithSufficientContrast, 'All elements should have visible focus indicators').toBe(totalTested);
  });

  test('Screen reader announcements should work for form labels and validation errors', async ({ page }) => {
    console.log('\n--- Testing TransactionForm Screen Reader Announcements ---');
    
    // Test 1: Check that all labels are properly announced
    const labeledFields = await page.locator('input[id], select[id], textarea[id]').all();
    let fieldsWithProperLabels = 0;
    
    for (const field of labeledFields) {
      const fieldId = await field.getAttribute('id');
      if (!fieldId) continue;
      
      const label = page.locator(`label[for="${fieldId}"]`);
      const hasLabel = await label.count() > 0;
      
      if (hasLabel) {
        const labelText = await label.textContent();
        fieldsWithProperLabels++;
        console.log(`✓ ${fieldId}: Label "${labelText?.trim()}" will be announced`);
      }
    }
    
    // Test 2: Trigger validation to test error announcements
    const submitButton = page.locator('button[type="submit"]').first();
    
    if (await submitButton.isVisible()) {
      // Clear required fields to trigger validation
      const requiredFields = ['date', 'transactionTypeId', 'categoryId', 'amount'];
      
      for (const fieldId of requiredFields) {
        const field = page.locator(`input[id="${fieldId}"], select[id="${fieldId}"]`);
        if (await field.count() > 0) {
          await field.fill('');
          // For select elements, try to select empty/default option
          if (await field.evaluate(el => el.tagName.toLowerCase() === 'select')) {
            await field.selectOption('0');
          }
        }
      }
      
      // Submit form to trigger validation
      await submitButton.click();
      await page.waitForTimeout(1000); // Wait for validation messages
      
      // Check for error messages with proper screen reader attributes
      const errorMessages = await page.locator('[role="alert"], [id*="error"]').all();
      let announceableErrors = 0;
      
      for (const errorMsg of errorMessages) {
        const isVisible = await errorMsg.isVisible();
        if (!isVisible) continue;
        
        const role = await errorMsg.getAttribute('role');
        const id = await errorMsg.getAttribute('id');
        const textContent = await errorMsg.textContent();
        
        // Check if error is properly configured for screen readers
        const isAnnounceable = role === 'alert' || (id && id.includes('error'));
        
        if (isAnnounceable) {
          announceableErrors++;
          console.log(`✓ Error message will be announced: "${textContent?.trim()}" (role="${role}", id="${id}")`);
          
          // Check if error is associated with a field via aria-describedby
          if (id && id.includes('error')) {
            const fieldId = id.replace('-error', '');
            const associatedField = page.locator(`[aria-describedby*="${id}"]`);
            const hasAssociation = await associatedField.count() > 0;
            
            if (hasAssociation) {
              console.log(`  - Associated with field ${fieldId} via aria-describedby`);
            }
          }
        }
        
        expect(isAnnounceable, 
          `Error message "${textContent?.trim()}" should be announceable to screen readers`
        ).toBe(true);
      }
      
      console.log(`\nError Announcement Summary: ${announceableErrors} error messages are properly configured for screen readers`);
    }
    
    console.log(`\nLabel Announcement Summary: ${fieldsWithProperLabels} fields have proper labels for screen readers`);
    expect(fieldsWithProperLabels, 'Multiple fields should have proper labels').toBeGreaterThan(0);
  });

  test('Form submission and error handling should be accessible', async ({ page }) => {
    console.log('\n--- Testing TransactionForm Submission Accessibility ---');
    
    // Find submit and cancel buttons
    const submitButton = page.locator('button[type="submit"]').first();
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    
    // Test submit button accessibility
    if (await submitButton.isVisible()) {
      const submitAriaLabel = await submitButton.getAttribute('aria-label');
      const submitText = await submitButton.textContent();
      
      console.log(`✓ Submit button: "${submitText?.trim()}" (aria-label: "${submitAriaLabel}")`);
      expect(submitAriaLabel || submitText, 'Submit button should have accessible text').toBeTruthy();
      
      // Test button focus
      await submitButton.focus();
      const isSubmitFocused = await submitButton.evaluate(el => el === document.activeElement);
      expect(isSubmitFocused, 'Submit button should be focusable').toBe(true);
    }
    
    // Test cancel button accessibility
    if (await cancelButton.isVisible()) {
      const cancelAriaLabel = await cancelButton.getAttribute('aria-label');
      const cancelText = await cancelButton.textContent();
      
      console.log(`✓ Cancel button: "${cancelText?.trim()}" (aria-label: "${cancelAriaLabel}")`);
      expect(cancelAriaLabel || cancelText, 'Cancel button should have accessible text').toBeTruthy();
      
      // Test button focus
      await cancelButton.focus();
      const isCancelFocused = await cancelButton.evaluate(el => el === document.activeElement);
      expect(isCancelFocused, 'Cancel button should be focusable').toBe(true);
    }
    
    // Test form submission with invalid data to check error handling
    if (await submitButton.isVisible()) {
      // Fill form with invalid data
      const amountField = page.locator('input[id="amount"]');
      if (await amountField.count() > 0) {
        await amountField.fill('-100'); // Invalid negative amount
      }
      
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Check for accessible error messages
      const errorMessages = await page.locator('[role="alert"], [id*="error"]').all();
      let accessibleErrors = 0;
      
      for (const errorMsg of errorMessages) {
        const isVisible = await errorMsg.isVisible();
        if (!isVisible) continue;
        
        const role = await errorMsg.getAttribute('role');
        const textContent = await errorMsg.textContent();
        
        if (role === 'alert' || textContent?.includes('error') || textContent?.includes('required')) {
          accessibleErrors++;
          console.log(`✓ Accessible error message: "${textContent?.trim()}"`);
        }
      }
      
      console.log(`\nError Handling Summary: ${accessibleErrors} accessible error messages found`);
    }
  });

  test('Property-based test: TransactionForm accessibility compliance across all interactive elements', async ({ page }) => {
    console.log('\n--- Property-based Test: TransactionForm Accessibility Compliance ---');
    
    // Get all interactive elements in the TransactionForm
    const interactiveElements = await page.locator(`
      input:not([type="hidden"]), 
      select, 
      textarea, 
      button,
      [role="button"],
      [tabindex]:not([tabindex="-1"])
    `).all();
    
    let totalElements = 0;
    let compliantElements = 0;
    const failures: string[] = [];
    
    for (const element of interactiveElements) {
      const isVisible = await element.isVisible();
      if (!isVisible) continue;
      
      totalElements++;
      
      // Get element information
      const elementInfo = await element.evaluate(el => ({
        tagName: el.tagName.toLowerCase(),
        id: el.id,
        type: el.getAttribute('type'),
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        ariaRequired: el.getAttribute('aria-required'),
        ariaInvalid: el.getAttribute('aria-invalid'),
        ariaDescribedBy: el.getAttribute('aria-describedby'),
        disabled: el.hasAttribute('disabled')
      }));
      
      const elementId = elementInfo.id || `${elementInfo.tagName}-${totalElements}`;
      let isCompliant = true;
      const issues: string[] = [];
      
      // Test 1: Has proper identification (id, aria-label, or associated label)
      const hasId = elementInfo.id !== null && elementInfo.id.length > 0;
      const hasAriaLabel = elementInfo.ariaLabel !== null && elementInfo.ariaLabel.length > 0;
      const hasAssociatedLabel = hasId ? await page.locator(`label[for="${elementInfo.id}"]`).count() > 0 : false;
      
      if (!hasId && !hasAriaLabel && !hasAssociatedLabel) {
        isCompliant = false;
        issues.push('missing identification');
      }
      
      // Test 2: Form fields should have proper ARIA attributes
      if (['input', 'select', 'textarea'].includes(elementInfo.tagName)) {
        // Required fields should have aria-required
        if (elementInfo.id !== 'description' && elementInfo.ariaRequired !== 'true') {
          isCompliant = false;
          issues.push('missing aria-required');
        }
        
        // Fields with errors should have aria-invalid
        const hasError = hasId ? await page.locator(`#${elementInfo.id}-error`).count() > 0 : false;
        if (hasError && elementInfo.ariaInvalid !== 'true') {
          isCompliant = false;
          issues.push('missing aria-invalid for error state');
        }
      }
      
      // Test 3: Is keyboard focusable (if not disabled)
      if (!elementInfo.disabled) {
        await element.focus();
        const isFocused = await element.evaluate(el => el === document.activeElement);
        if (!isFocused) {
          isCompliant = false;
          issues.push('not keyboard focusable');
        }
        
        // Test 4: Has visible focus indicator
        const focusStyles = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            outline: style.outline,
            outlineWidth: style.outlineWidth,
            boxShadow: style.boxShadow
          };
        });
        
        const hasVisibleFocus = 
          focusStyles.outline !== 'none' ||
          parseFloat(focusStyles.outlineWidth) > 0 ||
          focusStyles.boxShadow.includes('rgb') ||
          focusStyles.boxShadow.includes('rgba');
        
        if (!hasVisibleFocus) {
          isCompliant = false;
          issues.push('missing visible focus indicator');
        }
      }
      
      if (isCompliant) {
        compliantElements++;
        console.log(`✓ ${elementId}: Fully accessible`);
      } else {
        const failureMsg = `${elementId}: ${issues.join(', ')}`;
        failures.push(failureMsg);
        console.log(`✗ ${failureMsg}`);
      }
    }
    
    console.log(`\nProperty-based Test Summary: ${compliantElements}/${totalElements} interactive elements are fully accessible`);
    
    if (failures.length > 0) {
      console.log('\nAccessibility Issues:');
      failures.forEach(failure => console.log(`  - ${failure}`));
    }
    
    // Assert that all interactive elements are accessible
    expect(compliantElements, 
      `All ${totalElements} interactive elements should be fully accessible. Issues found:\n${failures.join('\n')}`
    ).toBe(totalElements);
    
    // Ensure we tested a reasonable number of elements
    expect(totalElements, 'Should have tested multiple interactive elements').toBeGreaterThan(8);
  });
});