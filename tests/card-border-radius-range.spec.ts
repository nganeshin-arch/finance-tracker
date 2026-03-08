/**
 * Property-Based Test: Card Border Radius Range
 * 
 * **Validates: Requirements 5.3**
 * 
 * Property 14: Card Border Radius Range
 * For any card element, its border-radius value should be between 8px and 16px, 
 * creating modern, rounded aesthetics.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const MIN_BORDER_RADIUS_PX = 8;
const MAX_BORDER_RADIUS_PX = 16;

/**
 * Parse border-radius value to pixels
 * Handles px, rem, em units and converts to pixels
 */
function parseBorderRadius(borderRadius: string, fontSize: number = 16): number {
  if (!borderRadius || borderRadius === '0' || borderRadius === 'none') {
    return 0;
  }
  
  // Handle multiple values (e.g., "12px 12px 12px 12px")
  // Take the first value as representative
  const firstValue = borderRadius.split(' ')[0];
  
  if (firstValue.endsWith('px')) {
    return parseFloat(firstValue);
  } else if (firstValue.endsWith('rem')) {
    return parseFloat(firstValue) * 16; // 1rem = 16px
  } else if (firstValue.endsWith('em')) {
    return parseFloat(firstValue) * fontSize;
  }
  
  // Try to parse as number (assume px)
  const numValue = parseFloat(firstValue);
  return isNaN(numValue) ? 0 : numValue;
}

/**
 * Get computed border-radius for an element
 */
async function getElementBorderRadius(page: Page, selector: string, index: number = 0) {
  return await page.locator(selector).nth(index).evaluate((el) => {
    const computed = window.getComputedStyle(el);
    
    return {
      borderRadius: computed.borderRadius,
      borderTopLeftRadius: computed.borderTopLeftRadius,
      borderTopRightRadius: computed.borderTopRightRadius,
      borderBottomLeftRadius: computed.borderBottomLeftRadius,
      borderBottomRightRadius: computed.borderBottomRightRadius,
      fontSize: computed.fontSize,
      tagName: el.tagName.toLowerCase(),
      classList: el.className,
      // Check if element looks like a card
      isCard: el.className.includes('card') || 
              el.className.includes('rounded') ||
              el.className.includes('shadow') ||
              el.className.includes('bg-card'),
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
 * Check if element is likely a card (not a button, input, etc.)
 */
function isLikelyCard(tagName: string, classList: string): boolean {
  // Exclude buttons, inputs, and other non-card elements
  if (tagName === 'button' || tagName === 'input' || tagName === 'select' || 
      tagName === 'textarea' || tagName === 'a') {
    return false;
  }
  
  // Include elements with card-like classes
  return classList.includes('card') || 
         classList.includes('bg-card') ||
         (classList.includes('rounded') && classList.includes('shadow')) ||
         classList.includes('border');
}

test.describe('Property 14: Card Border Radius Range', () => {
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

  test('Card elements with rounded-xl should have border-radius within 8-16px range', async ({ page }) => {
    const cardSelectors = [
      '[class*="rounded-xl"]',
      '[class*="card"]',
      'div[class*="bg-card"]',
    ];
    
    console.log('\n--- Testing Card Border Radius Range ---');
    
    for (const selector of cardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getElementBorderRadius(page, selector, i);
          
          // Skip non-card elements
          if (!isLikelyCard(info.tagName, info.classList)) {
            continue;
          }
          
          const fontSize = parseFloat(info.fontSize);
          const radiusPx = parseBorderRadius(info.borderRadius, fontSize);
          
          // Skip elements with no border-radius
          if (radiusPx === 0) {
            continue;
          }
          
          expect(radiusPx,
            `${selector}[${i}] border-radius ${radiusPx}px should be >= ${MIN_BORDER_RADIUS_PX}px ` +
            `(class: "${info.classList}")`
          ).toBeGreaterThanOrEqual(MIN_BORDER_RADIUS_PX);
          
          expect(radiusPx,
            `${selector}[${i}] border-radius ${radiusPx}px should be <= ${MAX_BORDER_RADIUS_PX}px ` +
            `(class: "${info.classList}")`
          ).toBeLessThanOrEqual(MAX_BORDER_RADIUS_PX);
          
          console.log(`✓ ${selector}[${i}]: ${radiusPx}px (${MIN_BORDER_RADIUS_PX}-${MAX_BORDER_RADIUS_PX}px) - "${info.classList}"`);
        }
      }
    }
  });

  test('Card component variants should have consistent border-radius within range', async ({ page }) => {
    // Test different card variants
    const cardVariants = [
      { name: 'default', selector: '[class*="rounded-xl"][class*="shadow-md"]' },
      { name: 'premium', selector: '[class*="gradient"][class*="rounded-xl"]' },
      { name: 'interactive', selector: '[class*="hover:shadow"][class*="rounded-xl"]' },
    ];
    
    console.log('\n--- Testing Card Variant Border Radius Consistency ---');
    
    for (const variant of cardVariants) {
      const exists = await elementExists(page, variant.selector);
      
      if (exists) {
        const count = await page.locator(variant.selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getElementBorderRadius(page, variant.selector, i);
          
          // Skip non-card elements
          if (!isLikelyCard(info.tagName, info.classList)) {
            continue;
          }
          
          const fontSize = parseFloat(info.fontSize);
          const radiusPx = parseBorderRadius(info.borderRadius, fontSize);
          
          if (radiusPx === 0) continue;
          
          expect(radiusPx,
            `${variant.name} card[${i}] border-radius ${radiusPx}px should be >= ${MIN_BORDER_RADIUS_PX}px`
          ).toBeGreaterThanOrEqual(MIN_BORDER_RADIUS_PX);
          
          expect(radiusPx,
            `${variant.name} card[${i}] border-radius ${radiusPx}px should be <= ${MAX_BORDER_RADIUS_PX}px`
          ).toBeLessThanOrEqual(MAX_BORDER_RADIUS_PX);
          
          console.log(`✓ ${variant.name} card[${i}]: ${radiusPx}px (${MIN_BORDER_RADIUS_PX}-${MAX_BORDER_RADIUS_PX}px)`);
        }
      }
    }
  });

  test('Card elements should have uniform border-radius on all corners', async ({ page }) => {
    const cardSelectors = [
      '[class*="rounded-xl"]',
      'div[class*="card"]',
    ];
    
    console.log('\n--- Testing Card Border Radius Uniformity ---');
    
    for (const selector of cardSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const count = await page.locator(selector).count();
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getElementBorderRadius(page, selector, i);
          
          // Skip non-card elements
          if (!isLikelyCard(info.tagName, info.classList)) {
            continue;
          }
          
          const fontSize = parseFloat(info.fontSize);
          const topLeft = parseBorderRadius(info.borderTopLeftRadius, fontSize);
          const topRight = parseBorderRadius(info.borderTopRightRadius, fontSize);
          const bottomLeft = parseBorderRadius(info.borderBottomLeftRadius, fontSize);
          const bottomRight = parseBorderRadius(info.borderBottomRightRadius, fontSize);
          
          // Skip elements with no border-radius
          if (topLeft === 0 && topRight === 0 && bottomLeft === 0 && bottomRight === 0) {
            continue;
          }
          
          // Check that all corners have the same radius (uniform)
          const allEqual = topLeft === topRight && 
                          topRight === bottomLeft && 
                          bottomLeft === bottomRight;
          
          expect(allEqual,
            `${selector}[${i}] should have uniform border-radius on all corners ` +
            `(TL: ${topLeft}px, TR: ${topRight}px, BL: ${bottomLeft}px, BR: ${bottomRight}px)`
          ).toBe(true);
          
          console.log(`✓ ${selector}[${i}]: Uniform radius ${topLeft}px on all corners`);
        }
      }
    }
  });

  test('Property-based test: Validate Tailwind rounded-xl utility', async ({ page }) => {
    // Test that the Tailwind rounded-xl utility produces correct border-radius
    
    const testResult = await page.evaluate(() => {
      const testDiv = document.createElement('div');
      testDiv.className = 'rounded-xl';
      document.body.appendChild(testDiv);
      
      const computed = window.getComputedStyle(testDiv);
      const borderRadius = computed.borderRadius;
      
      document.body.removeChild(testDiv);
      
      return {
        borderRadius,
        fontSize: computed.fontSize,
      };
    });
    
    console.log('\n--- Testing Tailwind rounded-xl Utility ---');
    
    const fontSize = parseFloat(testResult.fontSize);
    const radiusPx = parseBorderRadius(testResult.borderRadius, fontSize);
    
    expect(radiusPx,
      `Tailwind rounded-xl utility should produce border-radius >= ${MIN_BORDER_RADIUS_PX}px, got ${radiusPx}px`
    ).toBeGreaterThanOrEqual(MIN_BORDER_RADIUS_PX);
    
    expect(radiusPx,
      `Tailwind rounded-xl utility should produce border-radius <= ${MAX_BORDER_RADIUS_PX}px, got ${radiusPx}px`
    ).toBeLessThanOrEqual(MAX_BORDER_RADIUS_PX);
    
    console.log(`✓ Tailwind rounded-xl: ${radiusPx}px (${MIN_BORDER_RADIUS_PX}-${MAX_BORDER_RADIUS_PX}px)`);
  });

  test('Property-based test: Card border-radius consistency across all card-like elements', async ({ page }) => {
    // This test validates the universal property: ALL card elements should have 
    // border-radius within the 8-16px range
    
    console.log('\n--- Comprehensive Card Border Radius Validation ---');
    
    const allCards = await page.evaluate(() => {
      const cards: Array<{
        index: number;
        classList: string;
        tagName: string;
        borderRadius: string;
        fontSize: string;
      }> = [];
      
      // Find all elements that look like cards
      const elements = document.querySelectorAll('[class*="rounded"], [class*="card"], [class*="shadow"]');
      
      elements.forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        
        // Skip buttons, inputs, and other non-card elements
        if (el.tagName.toLowerCase() === 'button' || 
            el.tagName.toLowerCase() === 'input' ||
            el.tagName.toLowerCase() === 'select' ||
            el.tagName.toLowerCase() === 'textarea' ||
            el.tagName.toLowerCase() === 'a') {
          return;
        }
        
        // Only include elements with card-like characteristics
        const isCard = el.className.includes('card') || 
                      el.className.includes('bg-card') ||
                      (el.className.includes('rounded') && el.className.includes('shadow'));
        
        if (isCard && computed.borderRadius !== '0px') {
          cards.push({
            index,
            classList: el.className,
            tagName: el.tagName.toLowerCase(),
            borderRadius: computed.borderRadius,
            fontSize: computed.fontSize,
          });
        }
      });
      
      return cards;
    });
    
    console.log(`Testing ${allCards.length} card elements for border-radius range...`);
    
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const cardInfo of allCards.slice(0, 40)) {
      const fontSize = parseFloat(cardInfo.fontSize);
      const radiusPx = parseBorderRadius(cardInfo.borderRadius, fontSize);
      
      if (radiusPx === 0) continue;
      
      totalTested++;
      
      const inRange = radiusPx >= MIN_BORDER_RADIUS_PX && radiusPx <= MAX_BORDER_RADIUS_PX;
      
      if (inRange) {
        totalPassed++;
      } else {
        failures.push(
          `card[${cardInfo.index}] (${cardInfo.tagName}): ${radiusPx}px (expected ${MIN_BORDER_RADIUS_PX}-${MAX_BORDER_RADIUS_PX}px) - "${cardInfo.classList}"`
        );
      }
    }
    
    console.log(`\nTested ${totalTested} card elements`);
    console.log(`Passed: ${totalPassed}/${totalTested} (${((totalPassed/totalTested)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nBorder Radius Range Failures:');
      failures.forEach(f => console.log(`  ✗ ${f}`));
    }
    
    // Assert that all tested cards have border-radius within range
    expect(totalPassed,
      `All ${totalTested} card elements should have border-radius within ${MIN_BORDER_RADIUS_PX}-${MAX_BORDER_RADIUS_PX}px range. ` +
      `Failures:\n${failures.join('\n')}`
    ).toBe(totalTested);
  });

  test('Property-based test: Card border-radius across different page states', async ({ page }) => {
    // Test that card border-radius remains consistent across different page states
    
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
          const card = page.locator('[class*="rounded-xl"]').first();
          if (await card.count() > 0) {
            await card.hover();
            await page.waitForTimeout(200);
          }
        },
      },
    ];
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      await testCase.action();
      
      // Sample card elements
      const cardSelector = '[class*="rounded-xl"]';
      const count = await page.locator(cardSelector).count();
      
      if (count > 0) {
        const info = await getElementBorderRadius(page, cardSelector, 0);
        
        // Skip non-card elements
        if (!isLikelyCard(info.tagName, info.classList)) {
          continue;
        }
        
        const fontSize = parseFloat(info.fontSize);
        const radiusPx = parseBorderRadius(info.borderRadius, fontSize);
        
        if (radiusPx === 0) continue;
        
        expect(radiusPx,
          `[${testCase.name}] Card border-radius ${radiusPx}px should be >= ${MIN_BORDER_RADIUS_PX}px`
        ).toBeGreaterThanOrEqual(MIN_BORDER_RADIUS_PX);
        
        expect(radiusPx,
          `[${testCase.name}] Card border-radius ${radiusPx}px should be <= ${MAX_BORDER_RADIUS_PX}px`
        ).toBeLessThanOrEqual(MAX_BORDER_RADIUS_PX);
        
        console.log(`✓ Card: ${radiusPx}px (${MIN_BORDER_RADIUS_PX}-${MAX_BORDER_RADIUS_PX}px) in ${testCase.name}`);
      }
    }
  });

  test('Property-based test: Card border-radius precision and modern aesthetics', async ({ page }) => {
    // Verify that card border-radius values create modern, rounded aesthetics
    // Modern design typically uses 8px, 12px, or 16px for card corners
    
    console.log('\n--- Testing Card Border Radius Modern Aesthetics ---');
    
    const modernRadiusValues = [8, 12, 16]; // Common modern design values
    
    const allCards = await page.evaluate(() => {
      const cards: Array<{
        classList: string;
        borderRadius: string;
        fontSize: string;
      }> = [];
      
      const elements = document.querySelectorAll('[class*="rounded"], [class*="card"]');
      
      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        
        // Skip non-card elements
        if (el.tagName.toLowerCase() === 'button' || 
            el.tagName.toLowerCase() === 'input') {
          return;
        }
        
        const isCard = el.className.includes('card') || 
                      el.className.includes('bg-card') ||
                      (el.className.includes('rounded') && el.className.includes('shadow'));
        
        if (isCard && computed.borderRadius !== '0px') {
          cards.push({
            classList: el.className,
            borderRadius: computed.borderRadius,
            fontSize: computed.fontSize,
          });
        }
      });
      
      return cards;
    });
    
    console.log(`Analyzing ${allCards.length} card elements for modern aesthetic values...`);
    
    const radiusDistribution: { [key: number]: number } = {};
    
    for (const cardInfo of allCards.slice(0, 30)) {
      const fontSize = parseFloat(cardInfo.fontSize);
      const radiusPx = parseBorderRadius(cardInfo.borderRadius, fontSize);
      
      if (radiusPx === 0) continue;
      
      // Round to nearest integer for distribution analysis
      const roundedRadius = Math.round(radiusPx);
      radiusDistribution[roundedRadius] = (radiusDistribution[roundedRadius] || 0) + 1;
      
      // Check if radius is one of the modern design values
      const isModernValue = modernRadiusValues.some(val => Math.abs(radiusPx - val) < 0.5);
      
      expect(isModernValue,
        `Card border-radius ${radiusPx}px should be close to modern design values (8px, 12px, or 16px)`
      ).toBe(true);
    }
    
    console.log('\nBorder Radius Distribution:');
    Object.entries(radiusDistribution)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([radius, count]) => {
        console.log(`  ${radius}px: ${count} cards`);
      });
  });

  test('Property-based test: Card border-radius maintains premium aesthetic standards', async ({ page }) => {
    // Verify that all card elements maintain premium aesthetic standards
    // with appropriate border-radius values
    
    console.log('\n--- Testing Premium Card Aesthetic Standards ---');
    
    const premiumCards = await page.evaluate(() => {
      const cards: Array<{
        variant: string;
        borderRadius: string;
        fontSize: string;
        hasShadow: boolean;
        hasGradient: boolean;
      }> = [];
      
      const elements = document.querySelectorAll('[class*="card"], [class*="rounded"]');
      
      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        
        // Skip non-card elements
        if (el.tagName.toLowerCase() === 'button' || 
            el.tagName.toLowerCase() === 'input') {
          return;
        }
        
        const isCard = el.className.includes('card') || 
                      el.className.includes('bg-card');
        
        if (isCard && computed.borderRadius !== '0px') {
          let variant = 'default';
          if (el.className.includes('premium')) variant = 'premium';
          else if (el.className.includes('interactive')) variant = 'interactive';
          
          cards.push({
            variant,
            borderRadius: computed.borderRadius,
            fontSize: computed.fontSize,
            hasShadow: computed.boxShadow !== 'none',
            hasGradient: computed.backgroundImage.includes('gradient'),
          });
        }
      });
      
      return cards;
    });
    
    console.log(`Testing ${premiumCards.length} premium card elements...`);
    
    for (const cardInfo of premiumCards.slice(0, 20)) {
      const fontSize = parseFloat(cardInfo.fontSize);
      const radiusPx = parseBorderRadius(cardInfo.borderRadius, fontSize);
      
      if (radiusPx === 0) continue;
      
      // Premium cards should have:
      // 1. Border-radius within 8-16px range
      const hasValidRadius = radiusPx >= MIN_BORDER_RADIUS_PX && radiusPx <= MAX_BORDER_RADIUS_PX;
      
      // 2. Shadow for depth (premium aesthetic)
      const hasPremiumDepth = cardInfo.hasShadow;
      
      expect(hasValidRadius,
        `${cardInfo.variant} card should have border-radius within ${MIN_BORDER_RADIUS_PX}-${MAX_BORDER_RADIUS_PX}px range, got ${radiusPx}px`
      ).toBe(true);
      
      expect(hasPremiumDepth,
        `${cardInfo.variant} card should have shadow for premium depth perception`
      ).toBe(true);
      
      console.log(`✓ ${cardInfo.variant} card: ${radiusPx}px radius, shadow: ${cardInfo.hasShadow}, gradient: ${cardInfo.hasGradient}`);
    }
  });
});
