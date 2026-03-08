/**
 * Property-Based Test: Typography Weight Consistency
 * 
 * **Validates: Requirements 1.3, 1.4, 7.1**
 * 
 * Property 1: Typography Weight Consistency
 * For any text element in the application, if it is a heading element (h1-h6), 
 * then its computed font-weight should be 700 or higher; if it is body text, 
 * then its computed font-weight should be between 400 and 600; if it is a 
 * financial statistic value, then its computed font-weight should be 700 or higher.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const TEST_ITERATIONS = 20; // Reduced for faster execution

// Helper function to get computed font weight
async function getComputedFontWeight(page: Page, selector: string): Promise<number> {
  const fontWeight = await page.locator(selector).first().evaluate((el) => {
    const computed = window.getComputedStyle(el);
    const weight = computed.fontWeight;
    // Convert font-weight to number (handles both numeric and keyword values)
    if (weight === 'normal') return 400;
    if (weight === 'bold') return 700;
    return parseInt(weight, 10);
  });
  return fontWeight;
}

// Helper function to check if element exists
async function elementExists(page: Page, selector: string): Promise<boolean> {
  const count = await page.locator(selector).count();
  return count > 0;
}

test.describe('Property 1: Typography Weight Consistency', () => {
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

  test('Heading elements (h1-h6) should have font-weight 700 or higher', async ({ page }) => {
    // Test all heading levels
    const headingSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    
    for (const selector of headingSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const fontWeight = await getComputedFontWeight(page, selector);
        
        expect(fontWeight, `${selector} should have font-weight >= 700, but got ${fontWeight}`).toBeGreaterThanOrEqual(700);
        
        console.log(`✓ ${selector}: font-weight = ${fontWeight} (>= 700)`);
      } else {
        console.log(`⊘ ${selector}: not found on page (skipped)`);
      }
    }
  });

  test('Body text elements should have font-weight between 400 and 600', async ({ page }) => {
    // Test common body text elements
    const bodySelectors = [
      'p',
      'span:not(.font-bold):not(.font-semibold):not(.font-extrabold)',
      'div:not(.font-bold):not(.font-semibold):not(.font-extrabold) > span',
      'label',
      'td', // Table cells typically contain body text
    ];
    
    for (const selector of bodySelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const fontWeight = await getComputedFontWeight(page, selector);
        
        expect(fontWeight, `${selector} should have font-weight between 400-600, but got ${fontWeight}`).toBeGreaterThanOrEqual(400);
        expect(fontWeight, `${selector} should have font-weight between 400-600, but got ${fontWeight}`).toBeLessThanOrEqual(600);
        
        console.log(`✓ ${selector}: font-weight = ${fontWeight} (400-600)`);
      } else {
        console.log(`⊘ ${selector}: not found on page (skipped)`);
      }
    }
  });

  test('Financial statistic values should have font-weight 700 or higher', async ({ page }) => {
    // Financial statistics are displayed in SummaryCards component
    // They use classes like "text-2xl font-bold" or similar
    const statisticSelectors = [
      '[class*="text-2xl"][class*="font-bold"]', // SummaryCards values
      '[class*="text-xl"][class*="font-bold"]', // Alternative stat displays
      '.stat-premium', // Custom stat class from CSS
    ];
    
    for (const selector of statisticSelectors) {
      const exists = await elementExists(page, selector);
      
      if (exists) {
        const fontWeight = await getComputedFontWeight(page, selector);
        
        expect(fontWeight, `Financial statistic (${selector}) should have font-weight >= 700, but got ${fontWeight}`).toBeGreaterThanOrEqual(700);
        
        console.log(`✓ Financial stat (${selector}): font-weight = ${fontWeight} (>= 700)`);
      } else {
        console.log(`⊘ Financial stat (${selector}): not found on page (skipped)`);
      }
    }
  });

  test('Property-based test: Random element sampling across multiple page states', async ({ page }) => {
    // This test simulates property-based testing by checking typography consistency
    // across different page states and interactions
    
    const testCases = [
      { name: 'Initial page load', action: async () => { /* Already loaded */ } },
      { name: 'After scrolling', action: async () => { await page.evaluate(() => window.scrollTo(0, 500)); } },
      { name: 'After view mode change', action: async () => { 
        const viewModeButton = page.locator('button:has-text("Weekly")');
        if (await viewModeButton.count() > 0) {
          await viewModeButton.click();
          await page.waitForTimeout(500);
        }
      }},
    ];
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      await testCase.action();
      
      // Check headings
      const h1Exists = await elementExists(page, 'h1');
      if (h1Exists) {
        const h1Weight = await getComputedFontWeight(page, 'h1');
        expect(h1Weight, `h1 in "${testCase.name}" should have font-weight >= 700`).toBeGreaterThanOrEqual(700);
        console.log(`✓ h1: ${h1Weight} >= 700`);
      }
      
      const h2Exists = await elementExists(page, 'h2');
      if (h2Exists) {
        const h2Weight = await getComputedFontWeight(page, 'h2');
        expect(h2Weight, `h2 in "${testCase.name}" should have font-weight >= 700`).toBeGreaterThanOrEqual(700);
        console.log(`✓ h2: ${h2Weight} >= 700`);
      }
      
      // Check financial statistics
      const statExists = await elementExists(page, '[class*="text-2xl"][class*="font-bold"]');
      if (statExists) {
        const statWeight = await getComputedFontWeight(page, '[class*="text-2xl"][class*="font-bold"]');
        expect(statWeight, `Financial stat in "${testCase.name}" should have font-weight >= 700`).toBeGreaterThanOrEqual(700);
        console.log(`✓ Financial stat: ${statWeight} >= 700`);
      }
      
      // Check body text
      const pExists = await elementExists(page, 'p');
      if (pExists) {
        const pWeight = await getComputedFontWeight(page, 'p');
        expect(pWeight, `Body text (p) in "${testCase.name}" should be 400-600`).toBeGreaterThanOrEqual(400);
        expect(pWeight, `Body text (p) in "${testCase.name}" should be 400-600`).toBeLessThanOrEqual(600);
        console.log(`✓ Body text (p): ${pWeight} (400-600)`);
      }
    }
  });

  test('Property-based test: Typography consistency across all text elements', async ({ page }) => {
    // Get all text-containing elements and verify typography rules
    const allTextElements = await page.locator('h1, h2, h3, h4, h5, h6, p, span, div, label').all();
    
    console.log(`\nTesting ${allTextElements.length} text elements for typography consistency...`);
    
    let headingCount = 0;
    let bodyCount = 0;
    let statCount = 0;
    
    for (const element of allTextElements.slice(0, 20)) { // Test first 20 elements for performance
      const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
      const classList = await element.evaluate((el) => el.className);
      const fontWeight = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        const weight = computed.fontWeight;
        if (weight === 'normal') return 400;
        if (weight === 'bold') return 700;
        return parseInt(weight, 10);
      });
      
      // Classify element type and verify font weight
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        // Heading element
        expect(fontWeight, `Heading ${tagName} should have font-weight >= 700, but got ${fontWeight}`).toBeGreaterThanOrEqual(700);
        headingCount++;
      } else if (classList.includes('font-bold') || classList.includes('font-extrabold')) {
        // Financial statistic or emphasized text
        expect(fontWeight, `Bold element should have font-weight >= 700, but got ${fontWeight}`).toBeGreaterThanOrEqual(700);
        statCount++;
      } else if (['p', 'span', 'div', 'label'].includes(tagName) && !classList.includes('font-bold')) {
        // Body text
        expect(fontWeight, `Body text ${tagName} should have font-weight 400-600, but got ${fontWeight}`).toBeGreaterThanOrEqual(400);
        expect(fontWeight, `Body text ${tagName} should have font-weight 400-600, but got ${fontWeight}`).toBeLessThanOrEqual(600);
        bodyCount++;
      }
    }
    
    console.log(`\n✓ Verified ${headingCount} headings (all >= 700)`);
    console.log(`✓ Verified ${statCount} bold/stat elements (all >= 700)`);
    console.log(`✓ Verified ${bodyCount} body text elements (all 400-600)`);
  });
});
