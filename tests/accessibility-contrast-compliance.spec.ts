import { test, expect } from '@playwright/test'

/**
 * WCAG 2.1 AA Contrast Compliance Test Suite
 * 
 * This test suite verifies that all text and UI components meet WCAG 2.1 AA
 * contrast ratio requirements:
 * - Normal text: minimum 4.5:1 contrast ratio
 * - Large text (18pt+ or 14pt+ bold): minimum 3:1 contrast ratio
 * - UI components: minimum 3:1 contrast ratio
 * 
 * Tests both light and dark modes to ensure accessibility compliance
 * across all theme variations.
 * 
 * Validates: Requirements 11.1, 2.5, 2.6
 */

// WCAG 2.1 AA contrast ratio thresholds
const WCAG_AA_NORMAL_TEXT = 4.5
const WCAG_AA_LARGE_TEXT = 3.0
const WCAG_AA_UI_COMPONENTS = 3.0

// Helper function to calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Helper function to calculate contrast ratio
function getContrastRatio(color1: string, color2: string): number {
  // Parse RGB values from color strings
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

// Helper function to check if text is considered large
function isLargeText(fontSize: string, fontWeight: string): boolean {
  const size = parseFloat(fontSize)
  const weight = parseInt(fontWeight) || 400
  
  // 18pt = 24px, 14pt = 18.67px (approximately 19px)
  return size >= 24 || (size >= 19 && weight >= 700)
}

test.describe('WCAG 2.1 AA Contrast Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle')
  })

  test('should meet contrast requirements for all text elements in light mode', async ({ page }) => {
    // Ensure we're in light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      document.documentElement.removeAttribute('data-theme')
    })
    
    // Wait for theme to apply
    await page.waitForTimeout(100)

    // Get all text elements
    const textElements = await page.locator('*').filter({ hasText: /\S/ }).all()
    
    const contrastViolations: Array<{
      element: string
      text: string
      contrast: number
      required: number
      fontSize: string
      fontWeight: string
    }> = []

    for (const element of textElements) {
      try {
        // Skip if element is not visible
        if (!(await element.isVisible())) continue
        
        // Get computed styles
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el)
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            tagName: el.tagName.toLowerCase(),
            textContent: el.textContent?.trim() || ''
          }
        })

        // Skip if no text content
        if (!styles.textContent) continue

        // Skip if background color is transparent, try to find parent background
        let backgroundColor = styles.backgroundColor
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          // Try to get background from parent elements
          backgroundColor = await element.evaluate((el) => {
            let parent = el.parentElement
            while (parent) {
              const bg = window.getComputedStyle(parent).backgroundColor
              if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                return bg
              }
              parent = parent.parentElement
            }
            return 'rgb(255, 255, 255)' // Default to white
          })
        }

        // Calculate contrast ratio
        const contrast = getContrastRatio(styles.color, backgroundColor)
        
        // Determine required contrast ratio
        const isLarge = isLargeText(styles.fontSize, styles.fontWeight)
        const requiredContrast = isLarge ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT
        
        // Check if contrast meets requirements
        if (contrast < requiredContrast) {
          contrastViolations.push({
            element: styles.tagName,
            text: styles.textContent.substring(0, 50) + (styles.textContent.length > 50 ? '...' : ''),
            contrast: Math.round(contrast * 100) / 100,
            required: requiredContrast,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight
          })
        }
      } catch (error) {
        // Skip elements that can't be evaluated
        continue
      }
    }

    // Report violations
    if (contrastViolations.length > 0) {
      console.log('Light mode contrast violations:')
      contrastViolations.forEach(violation => {
        console.log(`- ${violation.element}: "${violation.text}" (${violation.contrast}:1, required: ${violation.required}:1)`)
      })
    }

    expect(contrastViolations.length).toBe(0)
  })

  test('should meet contrast requirements for all text elements in dark mode', async ({ page }) => {
    // Switch to dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    })
    
    // Wait for theme to apply
    await page.waitForTimeout(100)

    // Get all text elements
    const textElements = await page.locator('*').filter({ hasText: /\S/ }).all()
    
    const contrastViolations: Array<{
      element: string
      text: string
      contrast: number
      required: number
      fontSize: string
      fontWeight: string
    }> = []

    for (const element of textElements) {
      try {
        // Skip if element is not visible
        if (!(await element.isVisible())) continue
        
        // Get computed styles
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el)
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            tagName: el.tagName.toLowerCase(),
            textContent: el.textContent?.trim() || ''
          }
        })

        // Skip if no text content
        if (!styles.textContent) continue

        // Skip if background color is transparent, try to find parent background
        let backgroundColor = styles.backgroundColor
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          // Try to get background from parent elements
          backgroundColor = await element.evaluate((el) => {
            let parent = el.parentElement
            while (parent) {
              const bg = window.getComputedStyle(parent).backgroundColor
              if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                return bg
              }
              parent = parent.parentElement
            }
            return 'rgb(15, 23, 42)' // Default to dark background
          })
        }

        // Calculate contrast ratio
        const contrast = getContrastRatio(styles.color, backgroundColor)
        
        // Determine required contrast ratio
        const isLarge = isLargeText(styles.fontSize, styles.fontWeight)
        const requiredContrast = isLarge ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT
        
        // Check if contrast meets requirements
        if (contrast < requiredContrast) {
          contrastViolations.push({
            element: styles.tagName,
            text: styles.textContent.substring(0, 50) + (styles.textContent.length > 50 ? '...' : ''),
            contrast: Math.round(contrast * 100) / 100,
            required: requiredContrast,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight
          })
        }
      } catch (error) {
        // Skip elements that can't be evaluated
        continue
      }
    }

    // Report violations
    if (contrastViolations.length > 0) {
      console.log('Dark mode contrast violations:')
      contrastViolations.forEach(violation => {
        console.log(`- ${violation.element}: "${violation.text}" (${violation.contrast}:1, required: ${violation.required}:1)`)
      })
    }

    expect(contrastViolations.length).toBe(0)
  })

  test('should meet contrast requirements for UI components in light mode', async ({ page }) => {
    // Ensure we're in light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      document.documentElement.removeAttribute('data-theme')
    })
    
    // Wait for theme to apply
    await page.waitForTimeout(100)

    // Test button components
    const buttons = await page.locator('button').all()
    const buttonViolations: Array<{
      element: string
      contrast: number
      required: number
    }> = []

    for (const button of buttons) {
      if (!(await button.isVisible())) continue
      
      const styles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor
        }
      })

      // Check text contrast
      if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = getContrastRatio(styles.color, styles.backgroundColor)
        if (contrast < WCAG_AA_UI_COMPONENTS) {
          buttonViolations.push({
            element: 'button',
            contrast: Math.round(contrast * 100) / 100,
            required: WCAG_AA_UI_COMPONENTS
          })
        }
      }
    }

    // Test input components
    const inputs = await page.locator('input, select, textarea').all()
    const inputViolations: Array<{
      element: string
      contrast: number
      required: number
    }> = []

    for (const input of inputs) {
      if (!(await input.isVisible())) continue
      
      const styles = await input.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor
        }
      })

      // Check text contrast
      if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = getContrastRatio(styles.color, styles.backgroundColor)
        if (contrast < WCAG_AA_UI_COMPONENTS) {
          inputViolations.push({
            element: 'input',
            contrast: Math.round(contrast * 100) / 100,
            required: WCAG_AA_UI_COMPONENTS
          })
        }
      }
    }

    // Report violations
    const allViolations = [...buttonViolations, ...inputViolations]
    if (allViolations.length > 0) {
      console.log('Light mode UI component contrast violations:')
      allViolations.forEach(violation => {
        console.log(`- ${violation.element}: ${violation.contrast}:1 (required: ${violation.required}:1)`)
      })
    }

    expect(allViolations.length).toBe(0)
  })

  test('should meet contrast requirements for UI components in dark mode', async ({ page }) => {
    // Switch to dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    })
    
    // Wait for theme to apply
    await page.waitForTimeout(100)

    // Test button components
    const buttons = await page.locator('button').all()
    const buttonViolations: Array<{
      element: string
      contrast: number
      required: number
    }> = []

    for (const button of buttons) {
      if (!(await button.isVisible())) continue
      
      const styles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor
        }
      })

      // Check text contrast
      if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = getContrastRatio(styles.color, styles.backgroundColor)
        if (contrast < WCAG_AA_UI_COMPONENTS) {
          buttonViolations.push({
            element: 'button',
            contrast: Math.round(contrast * 100) / 100,
            required: WCAG_AA_UI_COMPONENTS
          })
        }
      }
    }

    // Test input components
    const inputs = await page.locator('input, select, textarea').all()
    const inputViolations: Array<{
      element: string
      contrast: number
      required: number
    }> = []

    for (const input of inputs) {
      if (!(await input.isVisible())) continue
      
      const styles = await input.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor
        }
      })

      // Check text contrast
      if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = getContrastRatio(styles.color, styles.backgroundColor)
        if (contrast < WCAG_AA_UI_COMPONENTS) {
          inputViolations.push({
            element: 'input',
            contrast: Math.round(contrast * 100) / 100,
            required: WCAG_AA_UI_COMPONENTS
          })
        }
      }
    }

    // Report violations
    const allViolations = [...buttonViolations, ...inputViolations]
    if (allViolations.length > 0) {
      console.log('Dark mode UI component contrast violations:')
      allViolations.forEach(violation => {
        console.log(`- ${violation.element}: ${violation.contrast}:1 (required: ${violation.required}:1)`)
      })
    }

    expect(allViolations.length).toBe(0)
  })

  test('should verify specific component contrast ratios', async ({ page }) => {
    // Test specific premium components that should have high contrast
    
    // Test StatCard components
    const statCards = await page.locator('[data-testid*="stat-card"], .stat-card, [class*="stat"]').all()
    
    for (const card of statCards) {
      if (!(await card.isVisible())) continue
      
      // Test the main value text (should be bold and high contrast)
      const valueElements = await card.locator('.text-3xl, .text-4xl, .financial-value, [class*="font-bold"]').all()
      
      for (const valueEl of valueElements) {
        if (!(await valueEl.isVisible())) continue
        
        const styles = await valueEl.evaluate((el) => {
          const computed = window.getComputedStyle(el)
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight
          }
        })

        // Get background from parent if transparent
        let backgroundColor = styles.backgroundColor
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          backgroundColor = await valueEl.evaluate((el) => {
            let parent = el.parentElement
            while (parent) {
              const bg = window.getComputedStyle(parent).backgroundColor
              if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                return bg
              }
              parent = parent.parentElement
            }
            return 'rgb(255, 255, 255)'
          })
        }

        const contrast = getContrastRatio(styles.color, backgroundColor)
        const isLarge = isLargeText(styles.fontSize, styles.fontWeight)
        const requiredContrast = isLarge ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT
        
        expect(contrast).toBeGreaterThanOrEqual(requiredContrast)
      }
    }

    // Test Button components
    const buttons = await page.locator('button').all()
    
    for (const button of buttons) {
      if (!(await button.isVisible())) continue
      
      const styles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor
        }
      })

      if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = getContrastRatio(styles.color, styles.backgroundColor)
        expect(contrast).toBeGreaterThanOrEqual(WCAG_AA_UI_COMPONENTS)
      }
    }

    // Test Input components
    const inputs = await page.locator('input, select, textarea').all()
    
    for (const input of inputs) {
      if (!(await input.isVisible())) continue
      
      const styles = await input.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor
        }
      })

      if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = getContrastRatio(styles.color, styles.backgroundColor)
        expect(contrast).toBeGreaterThanOrEqual(WCAG_AA_UI_COMPONENTS)
      }
    }
  })
})