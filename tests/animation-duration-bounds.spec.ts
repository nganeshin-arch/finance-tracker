/**
 * Property-Based Test: Animation Duration Bounds
 * 
 * **Validates: Requirements 3.1**
 * 
 * Property 6: Animation Duration Bounds
 * For any CSS transition or animation definition, the duration value should be 
 * between 150ms and 300ms for standard interactions, ensuring animations feel 
 * responsive without being jarring.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const MIN_DURATION_MS = 150;
const MAX_DURATION_MS = 300;

/**
 * Parse duration string to milliseconds
 * Handles both 's' (seconds) and 'ms' (milliseconds) formats
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
 * Get computed transition and animation durations for an element
 */
async function getElementAnimationInfo(page: Page, selector: string, index: number = 0) {
  return await page.locator(selector).nth(index).evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    return {
      transitionDuration: computed.transitionDuration,
      transitionProperty: computed.transitionProperty,
      animationDuration: computed.animationDuration,
      animationName: computed.animationName,
      tagName: el.tagName.toLowerCase(),
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

test.describe('Property 6: Animation Duration Bounds', () => {
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

  test('Button elements should have transition durations within 150-300ms range', async ({ page }) => {
    const buttons = await page.locator('button').all();
    
    console.log(`\nTesting ${buttons.length} button elements for animation duration bounds...`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const info = await getElementAnimationInfo(page, 'button', i);
      
      // Parse transition durations (can be comma-separated for multiple properties)
      const durations = info.transitionDuration.split(',').map(d => parseDuration(d.trim()));
      
      // Check each duration
      for (const duration of durations) {
        // Skip elements with no transition (0ms is acceptable)
        if (duration === 0) continue;
        
        expect(duration, 
          `button[${i}] transition duration ${duration}ms should be >= ${MIN_DURATION_MS}ms ` +
          `(class: "${info.classList}")`
        ).toBeGreaterThanOrEqual(MIN_DURATION_MS);
        
        expect(duration,
          `button[${i}] transition duration ${duration}ms should be <= ${MAX_DURATION_MS}ms ` +
          `(class: "${info.classList}")`
        ).toBeLessThanOrEqual(MAX_DURATION_MS);
        
        console.log(`✓ button[${i}]: ${duration}ms (${MIN_DURATION_MS}-${MAX_DURATION_MS}ms)`);
      }
    }
  });

  test('Interactive card elements should have transition durations within 150-300ms range', async ({ page }) => {
    // Cards with hover effects
    const cardSelectors = [
      '[class*="hover:"]',
      '[class*="transition"]',
      'div[class*="card"]',
      'div[class*="rounded"]',
    ];
    
    for (const selector of cardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getElementAnimationInfo(page, selector, i);
          
          // Only test elements that have transitions defined
          if (info.transitionProperty === 'none' || info.transitionProperty === 'all' && info.transitionDuration === '0s') {
            continue;
          }
          
          const durations = info.transitionDuration.split(',').map(d => parseDuration(d.trim()));
          
          for (const duration of durations) {
            if (duration === 0) continue;
            
            expect(duration,
              `${selector}[${i}] transition duration ${duration}ms should be >= ${MIN_DURATION_MS}ms`
            ).toBeGreaterThanOrEqual(MIN_DURATION_MS);
            
            expect(duration,
              `${selector}[${i}] transition duration ${duration}ms should be <= ${MAX_DURATION_MS}ms`
            ).toBeLessThanOrEqual(MAX_DURATION_MS);
            
            console.log(`✓ ${selector}[${i}]: ${duration}ms (${MIN_DURATION_MS}-${MAX_DURATION_MS}ms)`);
          }
        }
      }
    }
  });

  test('Input elements should have transition durations within 150-300ms range', async ({ page }) => {
    const inputSelectors = ['input', 'select', 'textarea'];
    
    for (const selector of inputSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getElementAnimationInfo(page, selector, i);
          
          const durations = info.transitionDuration.split(',').map(d => parseDuration(d.trim()));
          
          for (const duration of durations) {
            if (duration === 0) continue;
            
            expect(duration,
              `${selector}[${i}] transition duration ${duration}ms should be >= ${MIN_DURATION_MS}ms`
            ).toBeGreaterThanOrEqual(MIN_DURATION_MS);
            
            expect(duration,
              `${selector}[${i}] transition duration ${duration}ms should be <= ${MAX_DURATION_MS}ms`
            ).toBeLessThanOrEqual(MAX_DURATION_MS);
            
            console.log(`✓ ${selector}[${i}]: ${duration}ms (${MIN_DURATION_MS}-${MAX_DURATION_MS}ms)`);
          }
        }
      }
    }
  });

  test('Elements with animations should have animation durations within 150-300ms range', async ({ page }) => {
    // Get all elements with animations
    const animatedElements = await page.evaluate(() => {
      const elements: Array<{ selector: string; index: number }> = [];
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        if (computed.animationName && computed.animationName !== 'none') {
          elements.push({
            selector: el.tagName.toLowerCase(),
            index,
          });
        }
      });
      
      return elements;
    });
    
    console.log(`\nFound ${animatedElements.length} elements with animations`);
    
    for (const { selector, index } of animatedElements.slice(0, 10)) {
      const info = await page.evaluate(({ sel, idx }) => {
        const allElements = Array.from(document.querySelectorAll(sel));
        const el = allElements[idx];
        if (!el) return null;
        
        const computed = window.getComputedStyle(el);
        return {
          animationDuration: computed.animationDuration,
          animationName: computed.animationName,
          classList: el.className,
        };
      }, { sel: selector, idx: index });
      
      if (!info) continue;
      
      const durations = info.animationDuration.split(',').map(d => parseDuration(d.trim()));
      
      for (const duration of durations) {
        // Skip infinite animations (like skeleton loaders which are 1500ms)
        // We only test standard interaction animations
        if (duration === 0 || duration > 1000) continue;
        
        expect(duration,
          `${selector}[${index}] animation duration ${duration}ms should be >= ${MIN_DURATION_MS}ms ` +
          `(animation: ${info.animationName})`
        ).toBeGreaterThanOrEqual(MIN_DURATION_MS);
        
        expect(duration,
          `${selector}[${index}] animation duration ${duration}ms should be <= ${MAX_DURATION_MS}ms ` +
          `(animation: ${info.animationName})`
        ).toBeLessThanOrEqual(MAX_DURATION_MS);
        
        console.log(`✓ ${selector}[${index}]: ${duration}ms (${MIN_DURATION_MS}-${MAX_DURATION_MS}ms) - ${info.animationName}`);
      }
    }
  });

  test('Property-based test: Validate Tailwind config animation durations', async ({ page }) => {
    // This test validates that the Tailwind configuration itself defines animations
    // within the correct duration bounds
    
    const configAnimations = await page.evaluate(() => {
      // Parse animation definitions from computed styles
      const testDiv = document.createElement('div');
      document.body.appendChild(testDiv);
      
      const animations = [
        { name: 'fade-in', class: 'animate-fade-in' },
        { name: 'slide-in', class: 'animate-slide-in' },
        { name: 'scale-in', class: 'animate-scale-in' },
        { name: 'hover-lift', class: 'animate-hover-lift' },
        { name: 'hover-glow', class: 'animate-hover-glow' },
        { name: 'active-press', class: 'animate-active-press' },
      ];
      
      const results: Array<{ name: string; duration: string }> = [];
      
      for (const anim of animations) {
        testDiv.className = anim.class;
        const computed = window.getComputedStyle(testDiv);
        if (computed.animationDuration && computed.animationDuration !== '0s') {
          results.push({
            name: anim.name,
            duration: computed.animationDuration,
          });
        }
      }
      
      document.body.removeChild(testDiv);
      return results;
    });
    
    console.log(`\nValidating ${configAnimations.length} Tailwind animation configurations...`);
    
    for (const anim of configAnimations) {
      const duration = parseDuration(anim.duration);
      
      expect(duration,
        `Tailwind animation "${anim.name}" duration ${duration}ms should be >= ${MIN_DURATION_MS}ms`
      ).toBeGreaterThanOrEqual(MIN_DURATION_MS);
      
      expect(duration,
        `Tailwind animation "${anim.name}" duration ${duration}ms should be <= ${MAX_DURATION_MS}ms`
      ).toBeLessThanOrEqual(MAX_DURATION_MS);
      
      console.log(`✓ ${anim.name}: ${duration}ms (${MIN_DURATION_MS}-${MAX_DURATION_MS}ms)`);
    }
  });

  test('Property-based test: Validate transition duration utilities', async ({ page }) => {
    // Test that Tailwind's transition duration utilities are within bounds
    
    const durationUtilities = await page.evaluate(() => {
      const testDiv = document.createElement('div');
      document.body.appendChild(testDiv);
      
      const utilities = [
        { name: 'duration-150', class: 'transition duration-150' },
        { name: 'duration-200', class: 'transition duration-200' },
        { name: 'duration-250', class: 'transition duration-250' },
        { name: 'duration-300', class: 'transition duration-300' },
      ];
      
      const results: Array<{ name: string; duration: string }> = [];
      
      for (const util of utilities) {
        testDiv.className = util.class;
        const computed = window.getComputedStyle(testDiv);
        results.push({
          name: util.name,
          duration: computed.transitionDuration,
        });
      }
      
      document.body.removeChild(testDiv);
      return results;
    });
    
    console.log(`\nValidating ${durationUtilities.length} transition duration utilities...`);
    
    for (const util of durationUtilities) {
      const duration = parseDuration(util.duration);
      
      expect(duration,
        `Utility "${util.name}" duration ${duration}ms should be >= ${MIN_DURATION_MS}ms`
      ).toBeGreaterThanOrEqual(MIN_DURATION_MS);
      
      expect(duration,
        `Utility "${util.name}" duration ${duration}ms should be <= ${MAX_DURATION_MS}ms`
      ).toBeLessThanOrEqual(MAX_DURATION_MS);
      
      console.log(`✓ ${util.name}: ${duration}ms (${MIN_DURATION_MS}-${MAX_DURATION_MS}ms)`);
    }
  });

  test('Property-based test: Comprehensive animation duration validation across all interactive elements', async ({ page }) => {
    // This test validates the universal property: ALL interactive elements with 
    // transitions/animations should have durations within the 150-300ms range
    
    console.log('\n--- Comprehensive Animation Duration Validation ---');
    
    const allInteractiveElements = await page.evaluate(() => {
      const selectors = [
        'button', 'a', 'input', 'select', 'textarea',
        '[role="button"]', '[tabindex]',
        '[class*="hover"]', '[class*="transition"]',
      ];
      
      const elements: Array<{
        selector: string;
        index: number;
        transitionDuration: string;
        animationDuration: string;
        classList: string;
      }> = [];
      
      for (const selector of selectors) {
        const matches = document.querySelectorAll(selector);
        matches.forEach((el, idx) => {
          const computed = window.getComputedStyle(el);
          
          // Only include elements with transitions or animations
          if (computed.transitionDuration !== '0s' || computed.animationDuration !== '0s') {
            elements.push({
              selector,
              index: idx,
              transitionDuration: computed.transitionDuration,
              animationDuration: computed.animationDuration,
              classList: el.className,
            });
          }
        });
      }
      
      return elements;
    });
    
    console.log(`Testing ${allInteractiveElements.length} interactive elements with animations/transitions...`);
    
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const element of allInteractiveElements.slice(0, 20)) {
      // Test transition durations
      const transitionDurations = element.transitionDuration.split(',').map(d => parseDuration(d.trim()));
      
      for (const duration of transitionDurations) {
        if (duration === 0) continue;
        
        totalTested++;
        
        if (duration >= MIN_DURATION_MS && duration <= MAX_DURATION_MS) {
          totalPassed++;
        } else {
          failures.push(
            `${element.selector}[${element.index}] transition: ${duration}ms (expected ${MIN_DURATION_MS}-${MAX_DURATION_MS}ms)`
          );
        }
      }
      
      // Test animation durations (skip long-running animations like skeleton)
      const animationDurations = element.animationDuration.split(',').map(d => parseDuration(d.trim()));
      
      for (const duration of animationDurations) {
        if (duration === 0 || duration > 1000) continue; // Skip infinite/long animations
        
        totalTested++;
        
        if (duration >= MIN_DURATION_MS && duration <= MAX_DURATION_MS) {
          totalPassed++;
        } else {
          failures.push(
            `${element.selector}[${element.index}] animation: ${duration}ms (expected ${MIN_DURATION_MS}-${MAX_DURATION_MS}ms)`
          );
        }
      }
    }
    
    console.log(`\nTested ${totalTested} animation/transition durations`);
    console.log(`Passed: ${totalPassed}/${totalTested} (${((totalPassed/totalTested)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nDuration Bound Failures:');
      failures.forEach(f => console.log(`  ✗ ${f}`));
    }
    
    // Assert that all tested durations are within bounds
    expect(totalPassed,
      `All ${totalTested} animation/transition durations should be within ${MIN_DURATION_MS}-${MAX_DURATION_MS}ms range. ` +
      `Failures:\n${failures.join('\n')}`
    ).toBe(totalTested);
  });

  test('Property-based test: Animation duration consistency across page states', async ({ page }) => {
    // Test that animation durations remain consistent across different page states
    
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
        name: 'After hover interaction', 
        action: async () => {
          const button = page.locator('button').first();
          if (await button.count() > 0) {
            await button.hover();
            await page.waitForTimeout(200);
          }
        },
      },
    ];
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      await testCase.action();
      
      // Sample button elements
      const buttonInfo = await getElementAnimationInfo(page, 'button', 0);
      const durations = buttonInfo.transitionDuration.split(',').map(d => parseDuration(d.trim()));
      
      for (const duration of durations) {
        if (duration === 0) continue;
        
        expect(duration,
          `[${testCase.name}] button transition duration ${duration}ms should be >= ${MIN_DURATION_MS}ms`
        ).toBeGreaterThanOrEqual(MIN_DURATION_MS);
        
        expect(duration,
          `[${testCase.name}] button transition duration ${duration}ms should be <= ${MAX_DURATION_MS}ms`
        ).toBeLessThanOrEqual(MAX_DURATION_MS);
        
        console.log(`✓ button: ${duration}ms (${MIN_DURATION_MS}-${MAX_DURATION_MS}ms)`);
      }
    }
  });
});
