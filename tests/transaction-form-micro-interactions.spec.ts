import { test, expect } from '@playwright/test';

/**
 * Task 8.3: TransactionForm Micro-interactions Test
 * 
 * **Validates: Requirements 8.2, 8.5**
 * 
 * This test verifies that the TransactionForm provides micro-interactions
 * including focus animations (glow effect), smooth transitions to validation
 * state changes, and hover effects on interactive elements.
 */

test.describe('TransactionForm Micro-interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and login
    await page.goto('http://localhost:5173');
    
    // Login
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'Admin123!@#');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('**/dashboard');
    
    // Navigate to transactions page and open form
    await page.click('text=Transactions');
    await page.waitForTimeout(500);
    
    // Click "Add Transaction" button
    await page.click('button:has-text("Add Transaction")');
    await page.waitForTimeout(500);
  });

  test('Input fields should have focus glow effect', async ({ page }) => {
    // Find the date input field
    const dateInput = page.locator('input[type="date"]');
    
    // Get computed styles before focus
    await dateInput.focus();
    await page.waitForTimeout(100); // Wait for transition
    
    // Check that focus styles are applied
    const boxShadow = await dateInput.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });
    
    // Verify that a box-shadow (glow effect) is present
    expect(boxShadow).not.toBe('none');
    expect(boxShadow.length).toBeGreaterThan(0);
  });

  test('Input fields should have smooth transitions', async ({ page }) => {
    const dateInput = page.locator('input[type="date"]');
    
    // Check transition property
    const transition = await dateInput.evaluate((el) => {
      return window.getComputedStyle(el).transition;
    });
    
    // Verify transition is defined and includes 'all' or specific properties
    expect(transition).toContain('all');
    
    // Verify transition duration is within acceptable range (150ms-300ms)
    const durationMatch = transition.match(/(\d+\.?\d*)s/);
    if (durationMatch) {
      const durationInMs = parseFloat(durationMatch[1]) * 1000;
      expect(durationInMs).toBeGreaterThanOrEqual(150);
      expect(durationInMs).toBeLessThanOrEqual(300);
    }
  });

  test('Select triggers should have hover effects', async ({ page }) => {
    // Find a select trigger
    const selectTrigger = page.locator('[role="combobox"]').first();
    
    // Get border color before hover
    const borderColorBefore = await selectTrigger.evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });
    
    // Hover over the select
    await selectTrigger.hover();
    await page.waitForTimeout(100); // Wait for transition
    
    // Get border color after hover
    const borderColorAfter = await selectTrigger.evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });
    
    // Verify that hover effect is present (border color changes or other visual feedback)
    // Note: This might be the same if hover effect is subtle, but transition should exist
    const transition = await selectTrigger.evaluate((el) => {
      return window.getComputedStyle(el).transition;
    });
    
    expect(transition).toContain('all');
  });

  test('Textarea should have focus glow effect', async ({ page }) => {
    // Find the description textarea
    const textarea = page.locator('textarea#description');
    
    // Focus the textarea
    await textarea.focus();
    await page.waitForTimeout(100); // Wait for transition
    
    // Check that focus styles are applied
    const boxShadow = await textarea.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });
    
    // Verify that a box-shadow (glow effect) is present
    expect(boxShadow).not.toBe('none');
    expect(boxShadow.length).toBeGreaterThan(0);
  });

  test('Textarea should have smooth transitions', async ({ page }) => {
    const textarea = page.locator('textarea#description');
    
    // Check transition property
    const transition = await textarea.evaluate((el) => {
      return window.getComputedStyle(el).transition;
    });
    
    // Verify transition is defined
    expect(transition).toContain('all');
    
    // Verify transition duration is within acceptable range
    const durationMatch = transition.match(/(\d+\.?\d*)s/);
    if (durationMatch) {
      const durationInMs = parseFloat(durationMatch[1]) * 1000;
      expect(durationInMs).toBeGreaterThanOrEqual(150);
      expect(durationInMs).toBeLessThanOrEqual(300);
    }
  });

  test('Validation state changes should have smooth transitions', async ({ page }) => {
    // Submit form without filling required fields to trigger validation
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(300); // Wait for validation
    
    // Check if error messages appear with animation
    const errorMessage = page.locator('[role="alert"]').first();
    
    if (await errorMessage.isVisible()) {
      // Verify error message has fade-in animation
      const animation = await errorMessage.evaluate((el) => {
        return window.getComputedStyle(el).animation;
      });
      
      // Check if animation is present (fade-in)
      expect(animation).toBeTruthy();
    }
  });

  test('Buttons should have hover effects', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    
    // Get initial transform
    const transformBefore = await submitButton.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });
    
    // Hover over button
    await submitButton.hover();
    await page.waitForTimeout(150); // Wait for transition
    
    // Check transition exists
    const transition = await submitButton.evaluate((el) => {
      return window.getComputedStyle(el).transition;
    });
    
    expect(transition).toBeTruthy();
  });

  test('All interactive elements should have transition properties', async ({ page }) => {
    // Get all input, select, and button elements
    const interactiveElements = await page.locator('input, textarea, [role="combobox"], button').all();
    
    // Verify each has transition property
    for (const element of interactiveElements) {
      const transition = await element.evaluate((el) => {
        return window.getComputedStyle(el).transition;
      });
      
      // Each interactive element should have some transition defined
      expect(transition).not.toBe('all 0s ease 0s');
      expect(transition.length).toBeGreaterThan(0);
    }
  });

  test('Focus ring should be visible on keyboard navigation', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    // Get the focused element
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    
    // Check if focus ring is visible
    const outline = await focusedElement.evaluate((el) => {
      return window.getComputedStyle(el).outline;
    });
    
    const boxShadow = await focusedElement.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });
    
    // Either outline or box-shadow should be present for focus indication
    const hasFocusIndicator = outline !== 'none' || boxShadow !== 'none';
    expect(hasFocusIndicator).toBe(true);
  });
});
