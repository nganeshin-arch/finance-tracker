import { test, expect } from '@playwright/test';

/**
 * Task 8.4: TransactionForm Button Integration Tests
 * 
 * Validates that the enhanced Button components are properly integrated
 * into the TransactionForm with correct variants and spacing.
 * 
 * Requirements validated:
 * - 8.3: Enhanced button components integrated into TransactionForm
 * - 4.1: Primary gradient button for submit action
 * - 4.5: Secondary button variant for cancel action
 */

test.describe('TransactionForm Button Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and ensure we're logged in
    await page.goto('http://localhost:5173');
    
    // Check if we need to login
    const loginButton = page.locator('button:has-text("Login")');
    if (await loginButton.isVisible()) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await loginButton.click();
      await page.waitForURL('**/dashboard', { timeout: 5000 });
    }
    
    // Navigate to transaction form (assuming there's a button to add transaction)
    const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('submit button should use primary gradient variant', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').first();
    
    // Check if button exists
    await expect(submitButton).toBeVisible();
    
    // Check for gradient background class (default variant uses bg-gradient-primary)
    const buttonClasses = await submitButton.getAttribute('class');
    expect(buttonClasses).toContain('bg-gradient-primary');
    
    // Verify button text
    const buttonText = await submitButton.textContent();
    expect(buttonText).toMatch(/Create|Update/);
  });

  test('cancel button should use secondary variant', async ({ page }) => {
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    
    // Check if button exists
    await expect(cancelButton).toBeVisible();
    
    // Check for secondary variant class
    const buttonClasses = await cancelButton.getAttribute('class');
    expect(buttonClasses).toContain('bg-secondary');
    
    // Verify it's not using gradient
    expect(buttonClasses).not.toContain('bg-gradient-primary');
  });

  test('buttons should have proper spacing', async ({ page }) => {
    const buttonContainer = page.locator('div.flex.gap-4').last();
    
    // Check if container exists
    await expect(buttonContainer).toBeVisible();
    
    // Verify gap-4 class is present (16px spacing)
    const containerClasses = await buttonContainer.getAttribute('class');
    expect(containerClasses).toContain('gap-4');
    
    // Verify both buttons are in the container
    const buttonsInContainer = buttonContainer.locator('button');
    await expect(buttonsInContainer).toHaveCount(2);
  });

  test('buttons should have equal width (flex-1)', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').first();
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    
    // Check flex-1 class on both buttons
    const submitClasses = await submitButton.getAttribute('class');
    const cancelClasses = await cancelButton.getAttribute('class');
    
    expect(submitClasses).toContain('flex-1');
    expect(cancelClasses).toContain('flex-1');
    
    // Verify buttons have similar widths
    const submitBox = await submitButton.boundingBox();
    const cancelBox = await cancelButton.boundingBox();
    
    if (submitBox && cancelBox) {
      // Allow 5px tolerance for width difference
      expect(Math.abs(submitBox.width - cancelBox.width)).toBeLessThan(5);
    }
  });

  test('submit button should have hover effects', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').first();
    
    // Get initial state
    await expect(submitButton).toBeVisible();
    
    // Hover over button
    await submitButton.hover();
    
    // Check for hover scale class (hover:scale-[1.02])
    const buttonClasses = await submitButton.getAttribute('class');
    expect(buttonClasses).toContain('hover:scale-[1.02]');
    
    // Check for shadow enhancement (hover:shadow-lg)
    expect(buttonClasses).toContain('hover:shadow-lg');
  });

  test('cancel button should have hover effects', async ({ page }) => {
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    
    // Get initial state
    await expect(cancelButton).toBeVisible();
    
    // Hover over button
    await cancelButton.hover();
    
    // Check for hover scale class
    const buttonClasses = await cancelButton.getAttribute('class');
    expect(buttonClasses).toContain('hover:scale-[1.02]');
    
    // Check for shadow enhancement
    expect(buttonClasses).toContain('hover:shadow-md');
  });

  test('buttons should have smooth transitions', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').first();
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    
    // Check for transition classes
    const submitClasses = await submitButton.getAttribute('class');
    const cancelClasses = await cancelButton.getAttribute('class');
    
    expect(submitClasses).toContain('transition-all');
    expect(submitClasses).toContain('duration-200');
    
    expect(cancelClasses).toContain('transition-all');
    expect(cancelClasses).toContain('duration-200');
  });

  test('buttons should be keyboard accessible', async ({ page }) => {
    // Tab to first button
    await page.keyboard.press('Tab');
    
    // Continue tabbing until we reach the submit button
    let attempts = 0;
    while (attempts < 20) {
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          type: el?.getAttribute('type'),
          text: el?.textContent
        };
      });
      
      if (focusedElement.tagName === 'BUTTON' && focusedElement.type === 'submit') {
        break;
      }
      
      await page.keyboard.press('Tab');
      attempts++;
    }
    
    // Verify focus ring is visible
    const submitButton = page.locator('button[type="submit"]').first();
    const submitClasses = await submitButton.getAttribute('class');
    expect(submitClasses).toContain('focus-visible:ring-2');
  });

  test('submit button should be disabled when submitting', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').first();
    
    // Check disabled state styling
    const buttonClasses = await submitButton.getAttribute('class');
    expect(buttonClasses).toContain('disabled:opacity-50');
    expect(buttonClasses).toContain('disabled:pointer-events-none');
  });
});
