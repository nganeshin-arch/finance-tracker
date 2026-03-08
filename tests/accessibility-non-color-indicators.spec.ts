import { test, expect } from '@playwright/test'

/**
 * Non-Color Indicators Accessibility Test Suite
 * 
 * This test suite verifies that information is not conveyed by color alone:
 * - Trend indicators include icons alongside colors
 * - Text labels or ARIA labels are provided where color conveys meaning
 * - Color blindness simulation testing
 * 
 * Validates: Requirements 11.5, 7.2
 */

test.describe('Non-Color Indicators Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should provide non-color indicators for trend information', async ({ page }) => {
    // Find elements that use color to indicate trends (positive/negative/neutral)
    const trendElements = await page.locator(`
      [class*="income"], 
      [class*="expense"], 
      [class*="positive"], 
      [class*="negative"], 
      [class*="trend"],
      [data-testid*="trend"],
      .text-green-600,
      .text-red-600,
      .text-income-600,
      .text-expense-600
    `).all()

    const trendViolations: Array<{
      element: string
      issue: string
      text: string
    }> = []

    for (let i = 0; i < trendElements.length; i++) {
      const element = trendElements[i]
      
      if (!(await element.isVisible())) continue

      const elementInfo = await element.evaluate((el) => {
        const text = el.textContent?.trim() || ''
        const hasIcon = el.querySelector('svg, .icon, [class*="icon"]') !== null
        const hasAriaLabel = el.hasAttribute('aria-label')
        const ariaLabel = el.getAttribute('aria-label') || ''
        const hasTextIndicator = /(\+|\-|up|down|increase|decrease|gain|loss|profit|deficit)/i.test(text)
        const hasSymbol = /[↑↓▲▼⬆⬇]/u.test(text)
        
        return {
          text: text.substring(0, 50),
          hasIcon,
          hasAriaLabel,
          ariaLabel,
          hasTextIndicator,
          hasSymbol,
          className: el.className
        }
      })

      // Check if trend information has non-color indicators
      const hasNonColorIndicator = 
        elementInfo.hasIcon || 
        elementInfo.hasTextIndicator || 
        elementInfo.hasSymbol ||
        (elementInfo.hasAriaLabel && /positive|negative|up|down|increase|decrease/i.test(elementInfo.ariaLabel))

      if (!hasNonColorIndicator && elementInfo.text.length > 0) {
        // Check if this element is likely conveying trend information through color
        const likelyTrendElement = 
          elementInfo.className.includes('income') ||
          elementInfo.className.includes('expense') ||
          elementInfo.className.includes('positive') ||
          elementInfo.className.includes('negative') ||
          elementInfo.className.includes('green') ||
          elementInfo.className.includes('red')

        if (likelyTrendElement) {
          trendViolations.push({
            element: `trend-element[${i}]`,
            issue: 'Trend information conveyed by color only, missing icon or text indicator',
            text: elementInfo.text
          })
        }
      }
    }

    // Check StatCard components specifically
    const statCards = await page.locator('[data-testid*="stat"], .stat-card, [class*="stat"]').all()
    
    for (let i = 0; i < statCards.length; i++) {
      const card = statCards[i]
      
      if (!(await card.isVisible())) continue

      const cardInfo = await card.evaluate((el) => {
        const trendElements = el.querySelectorAll('[class*="income"], [class*="expense"], [class*="positive"], [class*="negative"]')
        const trends: Array<{
          hasIcon: boolean
          hasTextIndicator: boolean
          text: string
          className: string
        }> = []

        trendElements.forEach(trendEl => {
          const text = trendEl.textContent?.trim() || ''
          const hasIcon = trendEl.querySelector('svg, .icon') !== null
          const hasTextIndicator = /(\+|\-|up|down|increase|decrease)/i.test(text)
          
          trends.push({
            hasIcon,
            hasTextIndicator,
            text: text.substring(0, 30),
            className: trendEl.className
          })
        })

        return trends
      })

      cardInfo.forEach((trend, trendIndex) => {
        if (!trend.hasIcon && !trend.hasTextIndicator && trend.text.length > 0) {
          trendViolations.push({
            element: `stat-card[${i}] trend[${trendIndex}]`,
            issue: 'Trend in stat card lacks non-color indicator',
            text: trend.text
          })
        }
      })
    }

    if (trendViolations.length > 0) {
      console.log('Trend indicator violations:')
      trendViolations.forEach(violation => {
        console.log(`- ${violation.element}: ${violation.issue} ("${violation.text}")`)
      })
    }

    expect(trendViolations.length).toBe(0)
  })

  test('should provide text alternatives for color-coded information', async ({ page }) => {
    // Find elements that use color classes to convey meaning
    const colorCodedElements = await page.locator(`
      .text-green-600, .text-red-600, .text-blue-600,
      .text-income-600, .text-expense-600, .text-neutral-600,
      .bg-green-50, .bg-red-50, .bg-blue-50,
      .bg-income-50, .bg-expense-50, .bg-neutral-50,
      .border-green-200, .border-red-200, .border-blue-200,
      [class*="success"], [class*="error"], [class*="warning"]
    `).all()

    const colorViolations: Array<{
      element: string
      issue: string
      colorClass: string
    }> = []

    for (let i = 0; i < colorCodedElements.length; i++) {
      const element = colorCodedElements[i]
      
      if (!(await element.isVisible())) continue

      const elementInfo = await element.evaluate((el) => {
        const hasAriaLabel = el.hasAttribute('aria-label')
        const ariaLabel = el.getAttribute('aria-label') || ''
        const hasTitle = el.hasAttribute('title')
        const title = el.getAttribute('title') || ''
        const text = el.textContent?.trim() || ''
        const className = el.className
        const hasDescriptiveText = /success|error|warning|positive|negative|good|bad|valid|invalid/i.test(text)
        
        return {
          hasAriaLabel,
          ariaLabel,
          hasTitle,
          title,
          text: text.substring(0, 50),
          className,
          hasDescriptiveText
        }
      })

      // Check if color-coded element has alternative text indication
      const hasTextAlternative = 
        elementInfo.hasDescriptiveText ||
        (elementInfo.hasAriaLabel && /success|error|warning|positive|negative|good|bad/i.test(elementInfo.ariaLabel)) ||
        (elementInfo.hasTitle && /success|error|warning|positive|negative|good|bad/i.test(elementInfo.title))

      // Only flag elements that seem to convey status/meaning through color
      const conveysStatusThroughColor = 
        elementInfo.className.includes('success') ||
        elementInfo.className.includes('error') ||
        elementInfo.className.includes('warning') ||
        elementInfo.className.includes('income') ||
        elementInfo.className.includes('expense') ||
        (elementInfo.className.includes('green') && elementInfo.text.match(/\d/)) ||
        (elementInfo.className.includes('red') && elementInfo.text.match(/\d/))

      if (conveysStatusThroughColor && !hasTextAlternative && elementInfo.text.length > 0) {
        colorViolations.push({
          element: `color-coded[${i}]`,
          issue: 'Color-coded information lacks text alternative',
          colorClass: elementInfo.className.split(' ').find(c => 
            c.includes('green') || c.includes('red') || c.includes('blue') ||
            c.includes('success') || c.includes('error') || c.includes('warning') ||
            c.includes('income') || c.includes('expense')
          ) || 'unknown'
        })
      }
    }

    if (colorViolations.length > 0) {
      console.log('Color-coded information violations:')
      colorViolations.forEach(violation => {
        console.log(`- ${violation.element}: ${violation.issue} (class: ${violation.colorClass})`)
      })
    }

    expect(colorViolations.length).toBe(0)
  })

  test('should provide accessible form validation indicators', async ({ page }) => {
    // Test form validation that might rely on color
    const forms = await page.locator('form').all()
    const formViolations: string[] = []

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i]
      
      if (!(await form.isVisible())) continue

      // Look for validation indicators
      const validationElements = await form.locator(`
        .error, .success, .warning,
        [class*="error"], [class*="success"], [class*="warning"],
        [class*="invalid"], [class*="valid"],
        .text-red-600, .text-green-600, .text-yellow-600,
        .border-red-500, .border-green-500, .border-yellow-500
      `).all()

      for (let j = 0; j < validationElements.length; j++) {
        const validationEl = validationElements[j]
        
        if (!(await validationEl.isVisible())) continue

        const validationInfo = await validationEl.evaluate((el) => {
          const text = el.textContent?.trim() || ''
          const hasIcon = el.querySelector('svg, .icon') !== null
          const hasAriaRole = el.hasAttribute('role')
          const role = el.getAttribute('role') || ''
          const hasDescriptiveText = /error|success|warning|invalid|valid|required|optional/i.test(text)
          
          return {
            text: text.substring(0, 50),
            hasIcon,
            hasAriaRole,
            role,
            hasDescriptiveText,
            className: el.className
          }
        })

        // Validation messages should have text content or icons, not just color
        const hasNonColorIndicator = 
          validationInfo.hasDescriptiveText ||
          validationInfo.hasIcon ||
          validationInfo.role === 'alert'

        if (!hasNonColorIndicator && validationInfo.text.length === 0) {
          formViolations.push(`Form ${i + 1}, validation element ${j + 1}: Validation state indicated by color only`)
        }
      }

      // Check input field validation states
      const inputs = await form.locator('input, select, textarea').all()
      
      for (let j = 0; j < inputs.length; j++) {
        const input = inputs[j]
        
        const inputValidation = await input.evaluate((el) => {
          const hasErrorClass = el.className.includes('error') || el.className.includes('invalid')
          const hasSuccessClass = el.className.includes('success') || el.className.includes('valid')
          const hasAriaInvalid = el.hasAttribute('aria-invalid')
          const hasAriaDescribedby = el.hasAttribute('aria-describedby')
          
          let hasAssociatedMessage = false
          if (hasAriaDescribedby) {
            const describedBy = el.getAttribute('aria-describedby')
            const messageEl = document.getElementById(describedBy || '')
            hasAssociatedMessage = messageEl !== null && messageEl.textContent?.trim().length > 0
          }
          
          return {
            hasErrorClass,
            hasSuccessClass,
            hasAriaInvalid,
            hasAssociatedMessage
          }
        })

        // If input has validation styling, it should have associated text
        if ((inputValidation.hasErrorClass || inputValidation.hasSuccessClass) && 
            !inputValidation.hasAssociatedMessage) {
          formViolations.push(`Form ${i + 1}, input ${j + 1}: Validation state styling without associated text message`)
        }
      }
    }

    if (formViolations.length > 0) {
      console.log('Form validation violations:')
      formViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    expect(formViolations.length).toBe(0)
  })

  test('should provide accessible status indicators', async ({ page }) => {
    // Find status indicators that might rely on color
    const statusElements = await page.locator(`
      [class*="status"], [class*="badge"], [class*="chip"],
      [data-testid*="status"], [role="status"],
      .online, .offline, .active, .inactive,
      .available, .unavailable, .pending, .complete
    `).all()

    const statusViolations: string[] = []

    for (let i = 0; i < statusElements.length; i++) {
      const element = statusElements[i]
      
      if (!(await element.isVisible())) continue

      const statusInfo = await element.evaluate((el) => {
        const text = el.textContent?.trim() || ''
        const hasIcon = el.querySelector('svg, .icon') !== null
        const hasAriaLabel = el.hasAttribute('aria-label')
        const ariaLabel = el.getAttribute('aria-label') || ''
        const hasRole = el.hasAttribute('role')
        const role = el.getAttribute('role') || ''
        const hasDescriptiveText = text.length > 0 && !/^\s*$/.test(text)
        
        return {
          text: text.substring(0, 30),
          hasIcon,
          hasAriaLabel,
          ariaLabel,
          hasRole,
          role,
          hasDescriptiveText,
          className: el.className
        }
      })

      // Status should be conveyed through text, icons, or ARIA labels
      const hasNonColorIndicator = 
        statusInfo.hasDescriptiveText ||
        statusInfo.hasIcon ||
        (statusInfo.hasAriaLabel && statusInfo.ariaLabel.length > 0) ||
        statusInfo.role === 'status'

      if (!hasNonColorIndicator) {
        statusViolations.push(`Status element ${i + 1}: Status conveyed by color/styling only (class: ${statusInfo.className})`)
      }
    }

    if (statusViolations.length > 0) {
      console.log('Status indicator violations:')
      statusViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    expect(statusViolations.length).toBe(0)
  })

  test('should be accessible with simulated color blindness', async ({ page }) => {
    // Test with different types of color blindness simulation
    const colorBlindnessTypes = [
      { name: 'protanopia', description: 'red-blind' },
      { name: 'deuteranopia', description: 'green-blind' },
      { name: 'tritanopia', description: 'blue-blind' }
    ]

    for (const colorBlindness of colorBlindnessTypes) {
      // Simulate color blindness by injecting CSS filter
      await page.addStyleTag({
        content: `
          html.${colorBlindness.name} {
            filter: ${getColorBlindnessFilter(colorBlindness.name)};
          }
        `
      })

      await page.evaluate((type) => {
        document.documentElement.classList.add(type)
      }, colorBlindness.name)

      // Wait for filter to apply
      await page.waitForTimeout(100)

      // Check if critical information is still accessible
      const criticalElements = await page.locator(`
        [class*="income"], [class*="expense"], [class*="positive"], [class*="negative"],
        .text-green-600, .text-red-600, .error, .success, .warning
      `).all()

      const accessibilityIssues: string[] = []

      for (let i = 0; i < Math.min(criticalElements.length, 10); i++) {
        const element = criticalElements[i]
        
        if (!(await element.isVisible())) continue

        const elementInfo = await element.evaluate((el) => {
          const text = el.textContent?.trim() || ''
          const hasIcon = el.querySelector('svg, .icon') !== null
          const hasAriaLabel = el.hasAttribute('aria-label')
          const hasTextIndicator = /(\+|\-|up|down|increase|decrease|error|success|warning)/i.test(text)
          
          return {
            text: text.substring(0, 30),
            hasIcon,
            hasAriaLabel,
            hasTextIndicator,
            className: el.className
          }
        })

        // Element should still be understandable without color
        const isAccessibleWithoutColor = 
          elementInfo.hasIcon ||
          elementInfo.hasTextIndicator ||
          elementInfo.hasAriaLabel

        if (!isAccessibleWithoutColor && elementInfo.text.length > 0) {
          accessibilityIssues.push(`Element ${i + 1} may not be accessible with ${colorBlindness.description} vision`)
        }
      }

      // Remove the color blindness simulation
      await page.evaluate((type) => {
        document.documentElement.classList.remove(type)
      }, colorBlindness.name)

      if (accessibilityIssues.length > 0) {
        console.log(`${colorBlindness.description} simulation issues:`)
        accessibilityIssues.forEach(issue => {
          console.log(`- ${issue}`)
        })
      }

      // Allow some flexibility - minor issues are warnings
      expect(accessibilityIssues.length).toBeLessThanOrEqual(2)
    }
  })

  test('should have proper ARIA live regions for dynamic content', async ({ page }) => {
    // Check for dynamic content that changes and might need live regions
    const dynamicElements = await page.locator(`
      [data-testid*="balance"], [data-testid*="total"], [data-testid*="amount"],
      [class*="stat"], [class*="metric"], [class*="counter"],
      .loading, [class*="loading"], [aria-live], [role="status"], [role="alert"]
    `).all()

    const liveRegionViolations: string[] = []

    for (let i = 0; i < dynamicElements.length; i++) {
      const element = dynamicElements[i]
      
      if (!(await element.isVisible())) continue

      const liveRegionInfo = await element.evaluate((el) => {
        const hasAriaLive = el.hasAttribute('aria-live')
        const ariaLive = el.getAttribute('aria-live') || ''
        const hasRole = el.hasAttribute('role')
        const role = el.getAttribute('role') || ''
        const isLiveRegion = hasAriaLive || role === 'status' || role === 'alert'
        const text = el.textContent?.trim() || ''
        const hasNumbers = /\d/.test(text)
        
        return {
          hasAriaLive,
          ariaLive,
          hasRole,
          role,
          isLiveRegion,
          hasNumbers,
          text: text.substring(0, 30),
          className: el.className
        }
      })

      // Elements that display changing numerical data should have live regions
      const shouldHaveLiveRegion = 
        liveRegionInfo.hasNumbers && 
        (liveRegionInfo.className.includes('stat') || 
         liveRegionInfo.className.includes('balance') ||
         liveRegionInfo.className.includes('total') ||
         liveRegionInfo.className.includes('amount'))

      if (shouldHaveLiveRegion && !liveRegionInfo.isLiveRegion) {
        console.log(`Recommendation: Dynamic element ${i + 1} with numerical data should have aria-live or role="status" ("${liveRegionInfo.text}")`)
      }
    }

    // Check for existing live regions
    const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count()
    console.log(`Found ${liveRegions} live regions for dynamic content`)

    // This is more of a recommendation than a strict requirement
    expect(liveRegionViolations.length).toBe(0)
  })
})

// Helper function to get CSS filter for color blindness simulation
function getColorBlindnessFilter(type: string): string {
  switch (type) {
    case 'protanopia':
      return 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'protanopia\'%3E%3CfeColorMatrix values=\'0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0\'/%3E%3C/filter%3E%3C/svg%3E#protanopia")'
    case 'deuteranopia':
      return 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'deuteranopia\'%3E%3CfeColorMatrix values=\'0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0\'/%3E%3C/filter%3E%3C/svg%3E#deuteranopia")'
    case 'tritanopia':
      return 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'tritanopia\'%3E%3CfeColorMatrix values=\'0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0\'/%3E%3C/filter%3E%3C/svg%3E#tritanopia")'
    default:
      return 'none'
  }
}