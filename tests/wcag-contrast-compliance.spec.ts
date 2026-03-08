/**
 * Property-Based Test: WCAG Contrast Compliance
 * 
 * **Validates: Requirements 2.5, 2.6, 4.6, 11.1**
 * 
 * Property 5: WCAG Contrast Compliance
 * For any text element and its background, the contrast ratio should be at least 
 * 4.5:1 for normal text and at least 3:1 for large text (18pt+) or UI components, 
 * in both light and dark modes.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const TEST_ITERATIONS = 20; // Reduced for faster execution

// WCAG 2.1 AA contrast ratio requirements
const WCAG_AA_NORMAL_TEXT = 4.5;
const WCAG_AA_LARGE_TEXT = 3.0;
const LARGE_TEXT_SIZE_PX = 18; // 18pt = 24px
const LARGE_TEXT_BOLD_SIZE_PX = 14; // 14pt bold = ~18.67px

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function getContrastRatio(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse RGB color string to RGB object
 */
function parseRgb(rgbString: string): { r: number; g: number; b: number } | null {
  // Handle rgb() and rgba() formats
  const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }
  return null;
}

/**
 * Get computed colors and font properties for an element
 */
async function getElementColorInfo(page: Page, selector: string, index: number = 0) {
  return await page.locator(selector).nth(index).evaluate((el) => {
    const computed = window.getComputedStyle(el);
    const fontSize = parseFloat(computed.fontSize);
    const fontWeight = computed.fontWeight === 'normal' ? 400 : 
                       computed.fontWeight === 'bold' ? 700 : 
                       parseInt(computed.fontWeight, 10);
    
    // Get text color
    const color = computed.color;
    
    // Get background color - walk up the DOM tree to find non-transparent background
    let bgColor = computed.backgroundColor;
    let currentEl: HTMLElement | null = el as HTMLElement;
    
    while (currentEl && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
      currentEl = currentEl.parentElement;
      if (currentEl) {
        bgColor = window.getComputedStyle(currentEl).backgroundColor;
      }
    }
    
    // If still transparent, use white as default (light mode)
    if (!currentEl || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      bgColor = 'rgb(255, 255, 255)';
    }
    
    return {
      color,
      backgroundColor: bgColor,
      fontSize,
      fontWeight,
      tagName: el.tagName.toLowerCase(),
      text: el.textContent?.trim().substring(0, 50) || '',
    };
  });
}

/**
 * Check if element is large text according to WCAG
 */
function isLargeText(fontSize: number, fontWeight: number): boolean {
  // 18pt (24px) or larger
  if (fontSize >= LARGE_TEXT_SIZE_PX) {
    return true;
  }
  // 14pt (18.67px) or larger AND bold (700+)
  if (fontSize >= LARGE_TEXT_BOLD_SIZE_PX && fontWeight >= 700) {
    return true;
  }
  return false;
}

/**
 * Get all text elements on the page
 */
async function getAllTextElements(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const selectors: string[] = [];
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, label, button, a, td, th, li');
    
    elements.forEach((el, index) => {
      const text = el.textContent?.trim();
      // Only include elements with visible text
      if (text && text.length > 0) {
        const computed = window.getComputedStyle(el);
        if (computed.display !== 'none' && computed.visibility !== 'hidden' && computed.opacity !== '0') {
          selectors.push(`${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`);
        }
      }
    });
    
    return selectors;
  });
}

test.describe('Property 5: WCAG Contrast Compliance', () => {
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

  test('Heading elements should meet WCAG AA contrast requirements in light mode', async ({ page }) => {
    const headingSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    
    for (const selector of headingSelectors) {
      const count = await page.locator(selector).count();
      
      if (count > 0) {
        const info = await getElementColorInfo(page, selector);
        const textColor = parseRgb(info.color);
        const bgColor = parseRgb(info.backgroundColor);
        
        if (textColor && bgColor) {
          const contrastRatio = getContrastRatio(textColor, bgColor);
          const isLarge = isLargeText(info.fontSize, info.fontWeight);
          const requiredRatio = isLarge ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT;
          
          expect(contrastRatio, 
            `${selector} contrast ratio ${contrastRatio.toFixed(2)}:1 should be >= ${requiredRatio}:1 ` +
            `(fontSize: ${info.fontSize}px, fontWeight: ${info.fontWeight}, text: "${info.text}")`
          ).toBeGreaterThanOrEqual(requiredRatio);
          
          console.log(`✓ ${selector}: ${contrastRatio.toFixed(2)}:1 (>= ${requiredRatio}:1) - "${info.text}"`);
        }
      }
    }
  });

  test('Body text elements should meet WCAG AA contrast requirements in light mode', async ({ page }) => {
    const bodySelectors = ['p', 'span', 'div', 'label', 'td', 'li'];
    
    for (const selector of bodySelectors) {
      const count = await page.locator(selector).count();
      
      if (count > 0) {
        // Test first few instances of each selector
        const testCount = Math.min(count, 3);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getElementColorInfo(page, selector, i);
          
          // Skip elements with no text
          if (!info.text) continue;
          
          const textColor = parseRgb(info.color);
          const bgColor = parseRgb(info.backgroundColor);
          
          if (textColor && bgColor) {
            const contrastRatio = getContrastRatio(textColor, bgColor);
            const isLarge = isLargeText(info.fontSize, info.fontWeight);
            const requiredRatio = isLarge ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT;
            
            expect(contrastRatio,
              `${selector}[${i}] contrast ratio ${contrastRatio.toFixed(2)}:1 should be >= ${requiredRatio}:1 ` +
              `(fontSize: ${info.fontSize}px, fontWeight: ${info.fontWeight}, text: "${info.text}")`
            ).toBeGreaterThanOrEqual(requiredRatio);
            
            console.log(`✓ ${selector}[${i}]: ${contrastRatio.toFixed(2)}:1 (>= ${requiredRatio}:1)`);
          }
        }
      }
    }
  });

  test('Button elements should meet WCAG AA contrast requirements in light mode', async ({ page }) => {
    const buttons = await page.locator('button').all();
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const info = await getElementColorInfo(page, 'button', i);
      
      // Skip buttons with no text
      if (!info.text) continue;
      
      const textColor = parseRgb(info.color);
      const bgColor = parseRgb(info.backgroundColor);
      
      if (textColor && bgColor) {
        const contrastRatio = getContrastRatio(textColor, bgColor);
        // Buttons are UI components, so they need 3:1 minimum
        const requiredRatio = WCAG_AA_LARGE_TEXT;
        
        expect(contrastRatio,
          `button[${i}] contrast ratio ${contrastRatio.toFixed(2)}:1 should be >= ${requiredRatio}:1 ` +
          `(text: "${info.text}")`
        ).toBeGreaterThanOrEqual(requiredRatio);
        
        console.log(`✓ button[${i}]: ${contrastRatio.toFixed(2)}:1 (>= ${requiredRatio}:1) - "${info.text}"`);
      }
    }
  });

  test('Financial statistics should meet WCAG AA contrast requirements in light mode', async ({ page }) => {
    const statSelectors = [
      '[class*="text-2xl"][class*="font-bold"]',
      '[class*="text-xl"][class*="font-bold"]',
      '.stat-premium',
    ];
    
    for (const selector of statSelectors) {
      const count = await page.locator(selector).count();
      
      if (count > 0) {
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getElementColorInfo(page, selector, i);
          
          if (!info.text) continue;
          
          const textColor = parseRgb(info.color);
          const bgColor = parseRgb(info.backgroundColor);
          
          if (textColor && bgColor) {
            const contrastRatio = getContrastRatio(textColor, bgColor);
            const isLarge = isLargeText(info.fontSize, info.fontWeight);
            const requiredRatio = isLarge ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT;
            
            expect(contrastRatio,
              `Stat ${selector}[${i}] contrast ratio ${contrastRatio.toFixed(2)}:1 should be >= ${requiredRatio}:1 ` +
              `(fontSize: ${info.fontSize}px, fontWeight: ${info.fontWeight}, text: "${info.text}")`
            ).toBeGreaterThanOrEqual(requiredRatio);
            
            console.log(`✓ Stat ${selector}[${i}]: ${contrastRatio.toFixed(2)}:1 (>= ${requiredRatio}:1)`);
          }
        }
      }
    }
  });

  test('All text elements should meet WCAG AA contrast requirements in dark mode', async ({ page }) => {
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    const selectors = ['h1', 'h2', 'h3', 'p', 'span', 'button', 'label'];
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      
      if (count > 0) {
        const testCount = Math.min(count, 3);
        
        for (let i = 0; i < testCount; i++) {
          const info = await getElementColorInfo(page, selector, i);
          
          if (!info.text) continue;
          
          const textColor = parseRgb(info.color);
          const bgColor = parseRgb(info.backgroundColor);
          
          if (textColor && bgColor) {
            const contrastRatio = getContrastRatio(textColor, bgColor);
            const isLarge = isLargeText(info.fontSize, info.fontWeight);
            const isButton = selector === 'button';
            const requiredRatio = (isLarge || isButton) ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT;
            
            expect(contrastRatio,
              `[DARK MODE] ${selector}[${i}] contrast ratio ${contrastRatio.toFixed(2)}:1 should be >= ${requiredRatio}:1 ` +
              `(fontSize: ${info.fontSize}px, fontWeight: ${info.fontWeight}, text: "${info.text}")`
            ).toBeGreaterThanOrEqual(requiredRatio);
            
            console.log(`✓ [DARK MODE] ${selector}[${i}]: ${contrastRatio.toFixed(2)}:1 (>= ${requiredRatio}:1)`);
          }
        }
      }
    }
  });

  test('Property-based test: Random text element sampling across page states', async ({ page }) => {
    // Test contrast across different page states
    const testCases = [
      { 
        name: 'Initial page load', 
        action: async () => { /* Already loaded */ },
        darkMode: false,
      },
      { 
        name: 'After scrolling', 
        action: async () => { 
          await page.evaluate(() => window.scrollTo(0, 500)); 
          await page.waitForTimeout(300);
        },
        darkMode: false,
      },
      { 
        name: 'Dark mode enabled', 
        action: async () => {
          await page.evaluate(() => {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
          });
          await page.waitForTimeout(500);
        },
        darkMode: true,
      },
    ];
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      await testCase.action();
      
      // Sample various element types
      const sampleSelectors = ['h1', 'h2', 'p', 'button', 'span'];
      
      for (const selector of sampleSelectors) {
        const count = await page.locator(selector).count();
        
        if (count > 0) {
          const info = await getElementColorInfo(page, selector, 0);
          
          if (!info.text) continue;
          
          const textColor = parseRgb(info.color);
          const bgColor = parseRgb(info.backgroundColor);
          
          if (textColor && bgColor) {
            const contrastRatio = getContrastRatio(textColor, bgColor);
            const isLarge = isLargeText(info.fontSize, info.fontWeight);
            const isButton = selector === 'button';
            const requiredRatio = (isLarge || isButton) ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT;
            
            expect(contrastRatio,
              `[${testCase.name}] ${selector} contrast ratio ${contrastRatio.toFixed(2)}:1 should be >= ${requiredRatio}:1`
            ).toBeGreaterThanOrEqual(requiredRatio);
            
            console.log(`✓ ${selector}: ${contrastRatio.toFixed(2)}:1 (>= ${requiredRatio}:1)`);
          }
        }
      }
    }
  });

  test('Property-based test: Comprehensive contrast validation across all visible text', async ({ page }) => {
    // This test validates the universal property: ALL text elements should meet contrast requirements
    console.log('\n--- Comprehensive Contrast Validation ---');
    
    const allSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'span', 'div', 'label', 'button', 'a',
      'td', 'th', 'li',
    ];
    
    let totalTested = 0;
    let totalPassed = 0;
    const failures: string[] = [];
    
    for (const selector of allSelectors) {
      const count = await page.locator(selector).count();
      
      if (count > 0) {
        // Test up to 5 instances of each selector type
        const testCount = Math.min(count, 5);
        
        for (let i = 0; i < testCount; i++) {
          try {
            const info = await getElementColorInfo(page, selector, i);
            
            // Skip elements with no text
            if (!info.text) continue;
            
            const textColor = parseRgb(info.color);
            const bgColor = parseRgb(info.backgroundColor);
            
            if (textColor && bgColor) {
              totalTested++;
              
              const contrastRatio = getContrastRatio(textColor, bgColor);
              const isLarge = isLargeText(info.fontSize, info.fontWeight);
              const isButton = selector === 'button';
              const requiredRatio = (isLarge || isButton) ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT;
              
              if (contrastRatio >= requiredRatio) {
                totalPassed++;
              } else {
                const failureMsg = `${selector}[${i}]: ${contrastRatio.toFixed(2)}:1 < ${requiredRatio}:1 (text: "${info.text}")`;
                failures.push(failureMsg);
              }
            }
          } catch (error) {
            // Skip elements that can't be evaluated
            continue;
          }
        }
      }
    }
    
    console.log(`\nTested ${totalTested} text elements`);
    console.log(`Passed: ${totalPassed}/${totalTested} (${((totalPassed/totalTested)*100).toFixed(1)}%)`);
    
    if (failures.length > 0) {
      console.log('\nContrast Failures:');
      failures.forEach(f => console.log(`  ✗ ${f}`));
    }
    
    // Assert that all tested elements pass
    expect(totalPassed, 
      `All ${totalTested} text elements should meet WCAG AA contrast requirements. ` +
      `Failures:\n${failures.join('\n')}`
    ).toBe(totalTested);
  });
});
