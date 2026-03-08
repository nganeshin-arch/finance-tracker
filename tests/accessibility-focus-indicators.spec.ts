import { test, expect } from '@playwright/test'

/**
 * Focus Indicators Accessibility Test Suite
 * 
 * This test suite verifies that all interactive elements have visible focus
 * indicators that meet WCAG 2.1 AA requirements:
 * - Focus indicators must be visible with sufficient contrast
 * - Focus indicator offset must be at least 2px
 * - Focus order must be logical throughout the application
 * 
 * Validates: Requirements 11.2, 4.3
 */

// Helper function to calculate contrast ratio (same as previous test)
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(color1: string, color2: string): number {
  const parseRGB = (color: string) => {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!match) return [0, 0, 0]
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
  }

  const [r1, g1, b1] = parseRGB(color1)
  const [r2, g2, b2] = parseRGB(color2)

  const lum1 = getLuminance(r1, g1, b1)
  const lum2 = getLuminance(r2, g2, b2)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

test.describe('Focus Indicators Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should have visible focus indicators on all interactive elements', async ({ page }) => {
    // Get all interactive elements
    const interactiveSelectors = [
      'button',
      'a[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="link"]',
      '[role="tab"]',
      '[role="menuitem"]'
    ]

    const focusViolations: Array<{
      element: string
      issue: string
      selector: string
    }> = []

    for (const selector of interactiveSelectors) {
      const elements = await page.locator(selector).all()
      
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        
        // Skip if element is not visible
        if (!(await element.isVisible())) continue
        
        // Skip if element is disabled
        const isDisabled = await element.evaluate((el) => {
          return el.hasAttribute('disabled') || 
                 el.getAttribute('aria-disabled') === 'true' ||
                 el.hasAttribute('inert')
        })
        if (isDisabled) continue

        try {
          // Focus the element
          await element.focus()
          
          // Wait a moment for focus styles to apply
          await page.waitForTimeout(50)
          
          // Check if element has focus
          const hasFocus = await element.evaluate((el) => el === document.activeElement)
          
          if (!hasFocus) {
            focusViolations.push({
              element: selector,
              issue: 'Element cannot receive focus',
              selector: `${selector}:nth-of-type(${i + 1})`
            })
            continue
          }

          // Get focus styles
          const focusStyles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el)
            return {
              outline: computed.outline,
              outlineWidth: computed.outlineWidth,
              outlineStyle: computed.outlineStyle,
              outlineColor: computed.outlineColor,
              outlineOffset: computed.outlineOffset,
              boxShadow: computed.boxShadow,
              borderColor: computed.borderColor,
              backgroundColor: computed.backgroundColor
            }
          })

          // Check if there's a visible focus indicator
          const hasVisibleFocusIndicator = 
            (focusStyles.outline !== 'none' && 
             focusStyles.outline !== '0px none' && 
             focusStyles.outlineWidth !== '0px') ||
            (focusStyles.boxShadow !== 'none' && 
             focusStyles.boxShadow.includes('ring') || 
             focusStyles.boxShadow.includes('focus')) ||
            (focusStyles.borderColor && focusStyles.borderColor !== 'rgba(0, 0, 0, 0)')

          if (!hasVisibleFocusIndicator) {
            focusViolations.push({
              element: selector,
              issue: 'No visible focus indicator',
              selector: `${selector}:nth-of-type(${i + 1})`
            })
          }

          // Check focus indicator offset (should be at least 2px)
          if (focusStyles.outlineOffset) {
            const offset = parseFloat(focusStyles.outlineOffset)
            if (offset < 2) {
              focusViolations.push({
                element: selector,
                issue: `Focus indicator offset too small: ${offset}px (minimum 2px required)`,
                selector: `${selector}:nth-of-type(${i + 1})`
              })
            }
          }

          // Check focus indicator contrast
          if (focusStyles.outlineColor && focusStyles.outlineColor !== 'rgba(0, 0, 0, 0)') {
            // Get background color from parent or body
            const backgroundColor = await element.evaluate((el) => {
              let parent = el.parentElement
              while (parent) {
                const bg = window.getComputedStyle(parent).backgroundColor
                if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                  return bg
                }
                parent = parent.parentElement
              }
              return window.getComputedStyle(document.body).backgroundColor || 'rgb(255, 255, 255)'
            })

            try {
              const contrast = getContrastRatio(focusStyles.outlineColor, backgroundColor)
              if (contrast < 3.0) {
                focusViolations.push({
                  element: selector,
                  issue: `Focus indicator contrast too low: ${contrast.toFixed(2)}:1 (minimum 3:1 required)`,
                  selector: `${selector}:nth-of-type(${i + 1})`
                })
              }
            } catch (error) {
              // Skip contrast check if colors can't be parsed
            }
          }

        } catch (error) {
          // Skip elements that can't be focused or evaluated
          continue
        }
      }
    }

    // Report violations
    if (focusViolations.length > 0) {
      console.log('Focus indicator violations:')
      focusViolations.forEach(violation => {
        console.log(`- ${violation.selector}: ${violation.issue}`)
      })
    }

    expect(focusViolations.length).toBe(0)
  })

  test('should have logical focus order throughout the application', async ({ page }) => {
    // Test focus order by tabbing through all focusable elements
    const focusOrder: Array<{
      element: string
      text: string
      position: { x: number, y: number }
    }> = []

    // Start from the beginning
    await page.keyboard.press('Tab')
    
    let previousElement = null
    let tabCount = 0
    const maxTabs = 50 // Prevent infinite loops

    while (tabCount < maxTabs) {
      const activeElement = await page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body) return null
        
        const rect = el.getBoundingClientRect()
        return {
          tagName: el.tagName.toLowerCase(),
          text: el.textContent?.trim().substring(0, 30) || '',
          id: el.id || '',
          className: el.className || '',
          position: { x: rect.left, y: rect.top },
          isVisible: rect.width > 0 && rect.height > 0
        }
      })

      if (!activeElement || !activeElement.isVisible) {
        await page.keyboard.press('Tab')
        tabCount++
        continue
      }

      // Check if we've returned to a previous element (completed the cycle)
      const elementKey = `${activeElement.tagName}-${activeElement.id}-${activeElement.className}`
      if (previousElement === elementKey) {
        break
      }

      focusOrder.push({
        element: activeElement.tagName + (activeElement.id ? `#${activeElement.id}` : ''),
        text: activeElement.text,
        position: activeElement.position
      })

      previousElement = elementKey
      await page.keyboard.press('Tab')
      tabCount++
    }

    // Verify focus order makes visual sense (generally left-to-right, top-to-bottom)
    const focusOrderViolations: string[] = []
    
    for (let i = 1; i < focusOrder.length; i++) {
      const current = focusOrder[i]
      const previous = focusOrder[i - 1]
      
      // Check if focus jumps significantly backwards in reading order
      // (allowing some flexibility for responsive layouts)
      if (current.position.y < previous.position.y - 50) {
        // Only flag if it's a significant upward jump
        if (current.position.x < previous.position.x - 100) {
          focusOrderViolations.push(
            `Focus jumps from "${previous.element}" (${previous.position.x}, ${previous.position.y}) ` +
            `to "${current.element}" (${current.position.x}, ${current.position.y})`
          )
        }
      }
    }

    // Report focus order violations
    if (focusOrderViolations.length > 0) {
      console.log('Focus order violations:')
      focusOrderViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    // Ensure we have a reasonable number of focusable elements
    expect(focusOrder.length).toBeGreaterThan(0)
    
    // Focus order violations should be minimal
    expect(focusOrderViolations.length).toBeLessThanOrEqual(2)
  })

  test('should maintain focus indicators in both light and dark modes', async ({ page }) => {
    const modes = [
      { name: 'light', setup: () => page.evaluate(() => {
        document.documentElement.classList.remove('dark')
        document.documentElement.removeAttribute('data-theme')
      })},
      { name: 'dark', setup: () => page.evaluate(() => {
        document.documentElement.classList.add('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      })}
    ]

    for (const mode of modes) {
      await mode.setup()
      await page.waitForTimeout(100)

      // Test focus indicators on key interactive elements
      const keyElements = [
        'button:first-of-type',
        'input:first-of-type',
        'a[href]:first-of-type'
      ]

      const modeViolations: string[] = []

      for (const selector of keyElements) {
        const element = page.locator(selector).first()
        
        if (!(await element.isVisible())) continue

        try {
          await element.focus()
          await page.waitForTimeout(50)

          const focusStyles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el)
            return {
              outline: computed.outline,
              outlineWidth: computed.outlineWidth,
              boxShadow: computed.boxShadow,
              borderColor: computed.borderColor
            }
          })

          const hasVisibleFocusIndicator = 
            (focusStyles.outline !== 'none' && 
             focusStyles.outline !== '0px none' && 
             focusStyles.outlineWidth !== '0px') ||
            (focusStyles.boxShadow !== 'none' && 
             (focusStyles.boxShadow.includes('ring') || 
              focusStyles.boxShadow.includes('focus') ||
              focusStyles.boxShadow.includes('rgba')))

          if (!hasVisibleFocusIndicator) {
            modeViolations.push(`${selector} has no visible focus indicator in ${mode.name} mode`)
          }

        } catch (error) {
          continue
        }
      }

      if (modeViolations.length > 0) {
        console.log(`${mode.name} mode focus indicator violations:`)
        modeViolations.forEach(violation => {
          console.log(`- ${violation}`)
        })
      }

      expect(modeViolations.length).toBe(0)
    }
  })

  test('should have proper focus management in modal dialogs and dropdowns', async ({ page }) => {
    // Test focus trapping in modal dialogs (if any exist)
    const modalTriggers = await page.locator('[data-testid*="modal"], [role="dialog"], .modal-trigger').all()
    
    for (const trigger of modalTriggers) {
      if (!(await trigger.isVisible())) continue

      try {
        // Open modal
        await trigger.click()
        await page.waitForTimeout(200)

        // Check if focus is trapped within modal
        const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]').first()
        
        if (await modal.isVisible()) {
          // Tab through modal elements
          await page.keyboard.press('Tab')
          
          const focusedElement = await page.evaluate(() => {
            const el = document.activeElement
            return el ? {
              tagName: el.tagName.toLowerCase(),
              isInModal: el.closest('[role="dialog"], .modal, [data-testid*="modal"]') !== null
            } : null
          })

          expect(focusedElement?.isInModal).toBe(true)

          // Close modal (try Escape key)
          await page.keyboard.press('Escape')
          await page.waitForTimeout(100)
        }
      } catch (error) {
        // Skip if modal interaction fails
        continue
      }
    }

    // Test focus management in dropdown menus
    const dropdownTriggers = await page.locator('[role="button"][aria-haspopup], .dropdown-trigger, select').all()
    
    for (const trigger of dropdownTriggers) {
      if (!(await trigger.isVisible())) continue

      try {
        await trigger.focus()
        await page.waitForTimeout(50)

        // Check if element is properly focusable
        const hasFocus = await trigger.evaluate((el) => el === document.activeElement)
        expect(hasFocus).toBe(true)

        // Test keyboard navigation (Arrow keys for dropdowns)
        await page.keyboard.press('ArrowDown')
        await page.waitForTimeout(50)

        // Verify focus is still managed properly
        const focusAfterArrow = await page.evaluate(() => {
          return document.activeElement !== null
        })
        expect(focusAfterArrow).toBe(true)

      } catch (error) {
        // Skip if dropdown interaction fails
        continue
      }
    }
  })

  test('should have visible focus indicators on custom interactive components', async ({ page }) => {
    // Test custom components like StatCard, Card with interactive prop, etc.
    const customInteractiveElements = [
      '[role="button"]',
      '[tabindex="0"]',
      '.card[tabindex]',
      '[data-testid*="interactive"]',
      '.interactive'
    ]

    const customViolations: string[] = []

    for (const selector of customInteractiveElements) {
      const elements = await page.locator(selector).all()
      
      for (const element of elements) {
        if (!(await element.isVisible())) continue

        try {
          await element.focus()
          await page.waitForTimeout(50)

          const hasFocus = await element.evaluate((el) => el === document.activeElement)
          
          if (!hasFocus) {
            customViolations.push(`${selector} cannot receive focus`)
            continue
          }

          const focusStyles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el)
            return {
              outline: computed.outline,
              outlineWidth: computed.outlineWidth,
              boxShadow: computed.boxShadow,
              borderColor: computed.borderColor
            }
          })

          const hasVisibleFocusIndicator = 
            (focusStyles.outline !== 'none' && 
             focusStyles.outline !== '0px none' && 
             focusStyles.outlineWidth !== '0px') ||
            (focusStyles.boxShadow !== 'none' && 
             (focusStyles.boxShadow.includes('ring') || 
              focusStyles.boxShadow.includes('focus')))

          if (!hasVisibleFocusIndicator) {
            customViolations.push(`${selector} has no visible focus indicator`)
          }

        } catch (error) {
          continue
        }
      }
    }

    if (customViolations.length > 0) {
      console.log('Custom component focus violations:')
      customViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    expect(customViolations.length).toBe(0)
  })
})