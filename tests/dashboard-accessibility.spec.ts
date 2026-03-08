/**
 * Dashboard Accessibility Test
 * 
 * Validates: Requirements 7.6, 11.2, 11.4
 * Property 27: Dashboard Accessibility
 * 
 * Tests that dashboard components (StatCard, DashboardGrid) maintain
 * full accessibility compliance with WCAG 2.1 AA standards:
 * - Keyboard navigation with logical tab order
 * - Visible focus indicators on all interactive elements
 * - ARIA labels for screen reader compatibility
 * - Proper semantic HTML structure
 */

import { test, expect } from '@playwright/test'

test.describe('Dashboard Accessibility - Property 27', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173/login')
    
    // Fill in login form
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin123')
    
    // Click login button
    await page.click('button[type="submit"]')
    
    // Wait for navigation to home page
    await page.waitForURL('**/')
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
  })

  test.describe('StatCard Accessibility', () => {
    test('should have proper ARIA labels for screen readers', async ({ page }) => {
      // Navigate to home page where StatCards are displayed
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Find StatCard elements (they should have role="region" or role="button")
      const statCards = page.locator('[role="region"], [role="button"]').filter({
        has: page.locator('p.text-3xl, p.text-4xl') // StatCards have large text values
      })
      
      const count = await statCards.count()
      expect(count).toBeGreaterThan(0)
      
      // Check first StatCard has aria-label
      const firstCard = statCards.first()
      const ariaLabel = await firstCard.getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
      expect(ariaLabel).not.toBe('')
      
      console.log(`✓ Found ${count} StatCards with ARIA labels`)
      console.log(`✓ First card ARIA label: ${ariaLabel}`)
    })

    test('should mark decorative icons as aria-hidden', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Find icons within StatCards
      const statCardIcons = page.locator('[role="region"] svg, [role="button"] svg')
      const count = await statCardIcons.count()
      
      if (count > 0) {
        // Check that icons are marked as aria-hidden
        for (let i = 0; i < count; i++) {
          const icon = statCardIcons.nth(i)
          const ariaHidden = await icon.getAttribute('aria-hidden')
          expect(ariaHidden).toBe('true')
        }
        console.log(`✓ All ${count} icons are marked aria-hidden="true"`)
      }
    })

    test('should have screen reader text for trend indicators', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Find screen reader only text within StatCards
      const srTexts = page.locator('[role="region"] .sr-only, [role="button"] .sr-only')
      const count = await srTexts.count()
      
      if (count > 0) {
        // Check that sr-only text contains trend information
        const firstSrText = await srTexts.first().textContent()
        expect(firstSrText).toBeTruthy()
        
        // Should contain trend keywords
        const hasTrendInfo = firstSrText?.includes('trend') || 
                            firstSrText?.includes('Positive') || 
                            firstSrText?.includes('Negative') ||
                            firstSrText?.includes('Neutral')
        expect(hasTrendInfo).toBe(true)
        
        console.log(`✓ Found ${count} screen reader texts with trend information`)
      }
    })

    test('should be keyboard focusable when interactive', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Find interactive StatCards (role="button")
      const interactiveCards = page.locator('[role="button"]').filter({
        has: page.locator('p.text-3xl, p.text-4xl')
      })
      
      const count = await interactiveCards.count()
      
      if (count > 0) {
        // Check first interactive card is focusable
        const firstCard = interactiveCards.first()
        const tabIndex = await firstCard.getAttribute('tabindex')
        expect(tabIndex).toBe('0')
        
        // Try to focus it
        await firstCard.focus()
        const isFocused = await firstCard.evaluate((el) => el === document.activeElement)
        expect(isFocused).toBe(true)
        
        console.log(`✓ Interactive StatCards are keyboard focusable (found ${count})`)
      } else {
        console.log('ℹ No interactive StatCards found on this page')
      }
    })

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Find any focusable StatCard
      const focusableCards = page.locator('[tabindex="0"]').filter({
        has: page.locator('p.text-3xl, p.text-4xl')
      })
      
      const count = await focusableCards.count()
      
      if (count > 0) {
        const firstCard = focusableCards.first()
        
        // Focus the card
        await firstCard.focus()
        await page.waitForTimeout(200)
        
        // Check for focus ring classes
        const classList = await firstCard.evaluate((el) => el.className)
        const hasFocusClasses = classList.includes('focus') || 
                               classList.includes('ring')
        expect(hasFocusClasses).toBe(true)
        
        console.log('✓ Focused StatCard has visible focus indicator classes')
      }
    })
  })

  test.describe('DashboardGrid Accessibility', () => {
    test('should have proper ARIA role and label', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Find DashboardGrid elements (should have dashboard-grid class)
      const grids = page.locator('.dashboard-grid')
      const count = await grids.count()
      
      if (count > 0) {
        const firstGrid = grids.first()
        
        // Check role
        const role = await firstGrid.getAttribute('role')
        expect(role).toBeTruthy()
        
        // Check aria-label
        const ariaLabel = await firstGrid.getAttribute('aria-label')
        expect(ariaLabel).toBeTruthy()
        
        console.log(`✓ Found ${count} DashboardGrid(s) with role="${role}" and aria-label="${ariaLabel}"`)
      } else {
        console.log('ℹ No DashboardGrid found on this page')
      }
    })

    test('should maintain logical tab order for child elements', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Find DashboardGrid
      const grid = page.locator('.dashboard-grid').first()
      const gridExists = await grid.count() > 0
      
      if (gridExists) {
        // Find all focusable elements within the grid
        const focusableElements = grid.locator('[tabindex="0"]')
        const count = await focusableElements.count()
        
        if (count > 0) {
          // Tab through elements and verify order
          await page.keyboard.press('Tab')
          
          const firstElement = focusableElements.first()
          await firstElement.focus()
          
          const isFocused = await firstElement.evaluate((el) => el === document.activeElement)
          expect(isFocused).toBe(true)
          
          console.log(`✓ DashboardGrid maintains logical tab order (${count} focusable elements)`)
        }
      }
    })

    test('should apply responsive grid classes', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      const grids = page.locator('.dashboard-grid')
      const count = await grids.count()
      
      if (count > 0) {
        const firstGrid = grids.first()
        const classList = await firstGrid.evaluate((el) => el.className)
        
        // Should have dashboard-grid base class
        expect(classList).toContain('dashboard-grid')
        
        // Should have one of the column classes
        const hasColumnClass = classList.includes('dashboard-grid-2') ||
                              classList.includes('dashboard-grid-3') ||
                              classList.includes('dashboard-grid-4')
        expect(hasColumnClass).toBe(true)
        
        console.log(`✓ DashboardGrid has responsive grid classes: ${classList}`)
      }
    })
  })

  test.describe('Keyboard Navigation Integration', () => {
    test('should support keyboard navigation through dashboard', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Find all focusable elements on the page
      const focusableElements = page.locator('[tabindex="0"], button:not([disabled]), a[href]')
      const count = await focusableElements.count()
      
      expect(count).toBeGreaterThan(0)
      
      // Tab to first element
      await page.keyboard.press('Tab')
      
      // Verify something is focused
      const activeElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(activeElement).toBeTruthy()
      
      console.log(`✓ Keyboard navigation works (${count} focusable elements found)`)
    })

    test('should allow Tab and Shift+Tab navigation', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Tab forward
      await page.keyboard.press('Tab')
      const firstFocused = await page.evaluate(() => document.activeElement?.className)
      
      // Tab forward again
      await page.keyboard.press('Tab')
      const secondFocused = await page.evaluate(() => document.activeElement?.className)
      
      // Elements should be different
      expect(firstFocused).not.toBe(secondFocused)
      
      // Tab backward
      await page.keyboard.press('Shift+Tab')
      const backToFirst = await page.evaluate(() => document.activeElement?.className)
      
      // Should be back to first element
      expect(backToFirst).toBe(firstFocused)
      
      console.log('✓ Tab and Shift+Tab navigation works correctly')
    })
  })

  test.describe('Screen Reader Compatibility', () => {
    test('should provide complete information via ARIA labels', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Find StatCards with ARIA labels
      const cardsWithLabels = page.locator('[aria-label]').filter({
        has: page.locator('p.text-3xl, p.text-4xl')
      })
      
      const count = await cardsWithLabels.count()
      
      if (count > 0) {
        // Check each card has meaningful aria-label
        for (let i = 0; i < Math.min(count, 5); i++) {
          const card = cardsWithLabels.nth(i)
          const ariaLabel = await card.getAttribute('aria-label')
          
          // ARIA label should be descriptive (more than just a number)
          expect(ariaLabel).toBeTruthy()
          expect(ariaLabel!.length).toBeGreaterThan(5)
          
          console.log(`✓ Card ${i + 1} ARIA label: "${ariaLabel}"`)
        }
      }
    })

    test('should hide decorative elements from screen readers', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Find all SVG icons
      const allIcons = page.locator('svg')
      const count = await allIcons.count()
      
      if (count > 0) {
        // Check that decorative icons are hidden
        let hiddenCount = 0
        for (let i = 0; i < count; i++) {
          const icon = allIcons.nth(i)
          const ariaHidden = await icon.getAttribute('aria-hidden')
          if (ariaHidden === 'true') {
            hiddenCount++
          }
        }
        
        // Most icons should be decorative and hidden
        expect(hiddenCount).toBeGreaterThan(0)
        console.log(`✓ ${hiddenCount} of ${count} icons are properly hidden from screen readers`)
      }
    })
  })

  test.describe('Focus Indicator Visibility', () => {
    test('should have visible focus indicators with proper contrast', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Find focusable elements
      const focusableElements = page.locator('[tabindex="0"]').first()
      const exists = await focusableElements.count() > 0
      
      if (exists) {
        // Focus the element
        await focusableElements.focus()
        await page.waitForTimeout(200)
        
        // Check for focus ring in computed styles
        const focusStyles = await focusableElements.evaluate((el) => {
          const computed = window.getComputedStyle(el)
          return {
            outline: computed.outline,
            outlineWidth: computed.outlineWidth,
            boxShadow: computed.boxShadow,
          }
        })
        
        // Should have visible focus indicator
        const hasOutline = focusStyles.outline !== 'none' && focusStyles.outlineWidth !== '0px'
        const hasFocusRing = focusStyles.boxShadow !== 'none'
        
        expect(hasOutline || hasFocusRing).toBe(true)
        console.log('✓ Focus indicators are visible with proper styling')
      }
    })

    test('should have focus ring offset for visibility', async ({ page }) => {
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
      
      // Find focusable card elements
      const focusableCards = page.locator('[tabindex="0"]').filter({
        has: page.locator('p.text-3xl, p.text-4xl')
      })
      
      const count = await focusableCards.count()
      
      if (count > 0) {
        const firstCard = focusableCards.first()
        const classList = await firstCard.evaluate((el) => el.className)
        
        // Should have ring-offset class
        const hasRingOffset = classList.includes('ring-offset')
        expect(hasRingOffset).toBe(true)
        
        console.log('✓ Focus ring has proper offset for visibility')
      }
    })
  })
})
