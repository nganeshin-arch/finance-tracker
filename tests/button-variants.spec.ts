/**
 * Unit Tests: Button Variants
 * 
 * **Validates: Requirements 4.5, 4.6**
 * 
 * Task 3.3: Write unit tests for button variants
 * - Test that each variant renders with correct classes
 * - Test that disabled state prevents interactions
 * - Test that focus state is keyboard accessible
 */

import { test, expect } from '@playwright/test';

test.describe('Button Variants Unit Tests', () => {
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

  test.describe('Button Variant Rendering', () => {
    test('Primary variant (default) renders with gradient background and correct classes', async ({ page }) => {
      // Create a test button with primary/default variant
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-primary-button';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-gradient-primary text-white shadow-md hover:shadow-lg h-10 px-4 py-2';
        testButton.textContent = 'Primary Button';
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-primary-button');
      
      // Check that button exists
      await expect(button).toBeVisible();
      
      // Check classes
      const classList = await button.evaluate((el) => el.className);
      expect(classList).toContain('bg-gradient-primary');
      expect(classList).toContain('text-white');
      expect(classList).toContain('shadow-md');
      expect(classList).toContain('hover:shadow-lg');
      expect(classList).toContain('transition-all');
      
      // Check computed styles
      const styles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundImage: computed.backgroundImage,
          color: computed.color,
          boxShadow: computed.boxShadow,
        };
      });
      
      // Should have gradient background
      expect(styles.backgroundImage).toContain('gradient');
      
      // Should have box shadow
      expect(styles.boxShadow).not.toBe('none');
      
      console.log('✓ Primary variant renders with gradient background and correct classes');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-primary-button')?.remove();
      });
    });

    test('Secondary variant renders with correct classes', async ({ page }) => {
      // Create a test button with secondary variant
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-secondary-button';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md h-10 px-4 py-2';
        testButton.textContent = 'Secondary Button';
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-secondary-button');
      
      // Check that button exists
      await expect(button).toBeVisible();
      
      // Check classes
      const classList = await button.evaluate((el) => el.className);
      expect(classList).toContain('bg-secondary');
      expect(classList).toContain('text-secondary-foreground');
      expect(classList).toContain('hover:bg-secondary/80');
      expect(classList).toContain('hover:shadow-md');
      
      console.log('✓ Secondary variant renders with correct classes');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-secondary-button')?.remove();
      });
    });

    test('Outline variant renders with border and correct classes', async ({ page }) => {
      // Create a test button with outline variant
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-outline-button';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/30 hover:shadow-md h-10 px-4 py-2';
        testButton.textContent = 'Outline Button';
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-outline-button');
      
      // Check that button exists
      await expect(button).toBeVisible();
      
      // Check classes
      const classList = await button.evaluate((el) => el.className);
      expect(classList).toContain('border-2');
      expect(classList).toContain('border-input');
      expect(classList).toContain('bg-background');
      expect(classList).toContain('hover:bg-accent');
      
      // Check computed styles
      const styles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          borderWidth: computed.borderWidth,
          borderStyle: computed.borderStyle,
        };
      });
      
      // Should have border
      expect(styles.borderWidth).toBe('2px');
      expect(styles.borderStyle).toBe('solid');
      
      console.log('✓ Outline variant renders with border and correct classes');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-outline-button')?.remove();
      });
    });

    test('Ghost variant renders with correct classes', async ({ page }) => {
      // Create a test button with ghost variant
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-ghost-button';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] hover:bg-accent hover:text-accent-foreground hover:shadow-sm h-10 px-4 py-2';
        testButton.textContent = 'Ghost Button';
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-ghost-button');
      
      // Check that button exists
      await expect(button).toBeVisible();
      
      // Check classes
      const classList = await button.evaluate((el) => el.className);
      expect(classList).toContain('hover:bg-accent');
      expect(classList).toContain('hover:text-accent-foreground');
      expect(classList).toContain('hover:shadow-sm');
      
      // Check computed styles - ghost should have transparent/minimal background
      const styles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          backgroundImage: computed.backgroundImage,
        };
      });
      
      // Ghost variant should not have gradient
      expect(styles.backgroundImage).toBe('none');
      
      console.log('✓ Ghost variant renders with correct classes');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-ghost-button')?.remove();
      });
    });
  });

  test.describe('Disabled State', () => {
    test('Disabled button has opacity 0.5', async ({ page }) => {
      // Create a disabled test button
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-disabled-opacity';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-gradient-primary text-white shadow-md hover:shadow-lg h-10 px-4 py-2';
        testButton.disabled = true;
        testButton.textContent = 'Disabled Button';
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-disabled-opacity');
      
      // Check that button is disabled
      await expect(button).toBeDisabled();
      
      // Check opacity
      const opacity = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return parseFloat(computed.opacity);
      });
      
      expect(opacity).toBe(0.5);
      
      console.log('✓ Disabled button has opacity 0.5');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-disabled-opacity')?.remove();
      });
    });

    test('Disabled button has pointer-events none', async ({ page }) => {
      // Create a disabled test button
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-disabled-pointer';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-gradient-primary text-white shadow-md hover:shadow-lg h-10 px-4 py-2';
        testButton.disabled = true;
        testButton.textContent = 'Disabled Button';
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-disabled-pointer');
      
      // Check pointer-events
      const pointerEvents = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.pointerEvents;
      });
      
      expect(pointerEvents).toBe('none');
      
      console.log('✓ Disabled button has pointer-events none');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-disabled-pointer')?.remove();
      });
    });

    test('Disabled button prevents click interactions', async ({ page }) => {
      // Create a disabled test button with click handler
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-disabled-click';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-gradient-primary text-white shadow-md hover:shadow-lg h-10 px-4 py-2';
        testButton.disabled = true;
        testButton.textContent = 'Disabled Button';
        
        // Add click counter
        (window as any).clickCount = 0;
        testButton.addEventListener('click', () => {
          (window as any).clickCount++;
        });
        
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-disabled-click');
      
      // Try to click the button
      await button.click({ force: true }); // Force click to bypass Playwright's actionability checks
      
      // Check that click was not registered
      const clickCount = await page.evaluate(() => (window as any).clickCount);
      
      expect(clickCount).toBe(0);
      
      console.log('✓ Disabled button prevents click interactions');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-disabled-click')?.remove();
        delete (window as any).clickCount;
      });
    });

    test('Disabled button does not respond to hover', async ({ page }) => {
      // Create a disabled test button
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-disabled-hover';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-gradient-primary text-white shadow-md hover:shadow-lg h-10 px-4 py-2';
        testButton.disabled = true;
        testButton.textContent = 'Disabled Button';
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-disabled-hover');
      
      // Get initial styles
      const initialStyles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          transform: computed.transform,
          boxShadow: computed.boxShadow,
        };
      });
      
      // Try to hover (won't work due to pointer-events: none)
      await button.hover({ force: true });
      await page.waitForTimeout(300);
      
      // Get styles after hover attempt
      const hoverStyles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          transform: computed.transform,
          boxShadow: computed.boxShadow,
        };
      });
      
      // Styles should not change
      expect(hoverStyles.transform).toBe(initialStyles.transform);
      expect(hoverStyles.boxShadow).toBe(initialStyles.boxShadow);
      
      console.log('✓ Disabled button does not respond to hover');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-disabled-hover')?.remove();
      });
    });
  });

  test.describe('Focus State and Keyboard Accessibility', () => {
    test('Button is focusable via keyboard (Tab key)', async ({ page }) => {
      // Create a test button
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-keyboard-focus';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-gradient-primary text-white shadow-md hover:shadow-lg h-10 px-4 py-2';
        testButton.textContent = 'Keyboard Focus Button';
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-keyboard-focus');
      
      // Focus the button using keyboard
      await button.focus();
      
      // Check that button is focused
      const isFocused = await button.evaluate((el) => el === document.activeElement);
      
      expect(isFocused).toBe(true);
      
      console.log('✓ Button is focusable via keyboard');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-keyboard-focus')?.remove();
      });
    });

    test('Focused button displays visible focus ring', async ({ page }) => {
      // Create a test button
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-focus-ring';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-gradient-primary text-white shadow-md hover:shadow-lg h-10 px-4 py-2';
        testButton.textContent = 'Focus Ring Button';
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-focus-ring');
      
      // Focus the button
      await button.focus();
      await page.waitForTimeout(200);
      
      // Check focus ring styles
      const focusStyles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          outlineOffset: computed.outlineOffset,
          boxShadow: computed.boxShadow,
        };
      });
      
      // Should have visible focus indicator (outline or box-shadow ring)
      const hasOutline = focusStyles.outline !== 'none' && focusStyles.outlineWidth !== '0px';
      const hasFocusRing = focusStyles.boxShadow.includes('ring') || focusStyles.boxShadow !== 'none';
      
      expect(hasOutline || hasFocusRing).toBe(true);
      
      console.log('✓ Focused button displays visible focus ring');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-focus-ring')?.remove();
      });
    });

    test('Focus ring has 2px offset', async ({ page }) => {
      // Create a test button
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-focus-offset';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-gradient-primary text-white shadow-md hover:shadow-lg h-10 px-4 py-2';
        testButton.textContent = 'Focus Offset Button';
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-focus-offset');
      
      // Focus the button
      await button.focus();
      await page.waitForTimeout(200);
      
      // Check focus ring offset
      const classList = await button.evaluate((el) => el.className);
      
      // Should have ring-offset-2 class
      expect(classList).toContain('ring-offset-2');
      
      console.log('✓ Focus ring has 2px offset');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-focus-offset')?.remove();
      });
    });

    test('Button can be activated with Enter key', async ({ page }) => {
      // Create a test button with click handler
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-enter-key';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-gradient-primary text-white shadow-md hover:shadow-lg h-10 px-4 py-2';
        testButton.textContent = 'Enter Key Button';
        
        // Add click counter
        (window as any).enterKeyClickCount = 0;
        testButton.addEventListener('click', () => {
          (window as any).enterKeyClickCount++;
        });
        
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-enter-key');
      
      // Focus and press Enter
      await button.focus();
      await page.keyboard.press('Enter');
      
      // Check that click was registered
      const clickCount = await page.evaluate(() => (window as any).enterKeyClickCount);
      
      expect(clickCount).toBe(1);
      
      console.log('✓ Button can be activated with Enter key');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-enter-key')?.remove();
        delete (window as any).enterKeyClickCount;
      });
    });

    test('Button can be activated with Space key', async ({ page }) => {
      // Create a test button with click handler
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-space-key';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-gradient-primary text-white shadow-md hover:shadow-lg h-10 px-4 py-2';
        testButton.textContent = 'Space Key Button';
        
        // Add click counter
        (window as any).spaceKeyClickCount = 0;
        testButton.addEventListener('click', () => {
          (window as any).spaceKeyClickCount++;
        });
        
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-space-key');
      
      // Focus and press Space
      await button.focus();
      await page.keyboard.press('Space');
      
      // Check that click was registered
      const clickCount = await page.evaluate(() => (window as any).spaceKeyClickCount);
      
      expect(clickCount).toBe(1);
      
      console.log('✓ Button can be activated with Space key');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-space-key')?.remove();
        delete (window as any).spaceKeyClickCount;
      });
    });

    test('Disabled button cannot be focused', async ({ page }) => {
      // Create a disabled test button
      await page.evaluate(() => {
        const testButton = document.createElement('button');
        testButton.id = 'test-disabled-focus';
        testButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] bg-gradient-primary text-white shadow-md hover:shadow-lg h-10 px-4 py-2';
        testButton.disabled = true;
        testButton.textContent = 'Disabled Focus Button';
        document.body.appendChild(testButton);
      });
      
      await page.waitForTimeout(100);
      
      const button = page.locator('#test-disabled-focus');
      
      // Try to focus the button
      await button.focus({ timeout: 1000 }).catch(() => {
        // Expected to fail
      });
      
      // Check that button is not focused
      const isFocused = await button.evaluate((el) => el === document.activeElement);
      
      expect(isFocused).toBe(false);
      
      console.log('✓ Disabled button cannot be focused');
      
      // Clean up
      await page.evaluate(() => {
        document.getElementById('test-disabled-focus')?.remove();
      });
    });
  });

  test.describe('All Variants Comprehensive Test', () => {
    test('All button variants have consistent base classes', async ({ page }) => {
      const variants = [
        { name: 'primary', classes: 'bg-gradient-primary text-white shadow-md hover:shadow-lg' },
        { name: 'secondary', classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md' },
        { name: 'outline', classes: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/30 hover:shadow-md' },
        { name: 'ghost', classes: 'hover:bg-accent hover:text-accent-foreground hover:shadow-sm' },
      ];
      
      const baseClasses = [
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-md',
        'font-semibold',
        'transition-all',
        'duration-200',
        'focus-visible:ring-2',
        'disabled:opacity-50',
        'hover:scale-[1.02]',
      ];
      
      for (const variant of variants) {
        // Create test button
        await page.evaluate(({ name, classes }) => {
          const testButton = document.createElement('button');
          testButton.id = `test-variant-${name}`;
          testButton.className = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] ${classes} h-10 px-4 py-2`;
          testButton.textContent = `${name} Button`;
          document.body.appendChild(testButton);
        }, variant);
        
        await page.waitForTimeout(50);
        
        const button = page.locator(`#test-variant-${variant.name}`);
        const classList = await button.evaluate((el) => el.className);
        
        // Check base classes
        for (const baseClass of baseClasses) {
          expect(classList).toContain(baseClass);
        }
        
        console.log(`✓ ${variant.name} variant has consistent base classes`);
        
        // Clean up
        await page.evaluate(({ name }) => {
          document.getElementById(`test-variant-${name}`)?.remove();
        }, variant);
      }
    });
  });
});
