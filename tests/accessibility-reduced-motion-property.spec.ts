import { test, expect } from '@playwright/test'

/**
 * Property Test: Reduced Motion Respect
 * 
 * **Validates: Requirements 11.3, 3.6**
 * 
 * Property 11: Reduced Motion Respect
 * For any animation or transition, when the user's system has prefers-reduced-motion enabled,
 * the animation should be disabled or significantly reduced in intensity.
 * 
 * This test verifies that all animations and transitions respect
 * the user's motion preferences across different scenarios and components.
 */

test.describe('Property Test: Reduced Motion Respect', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('Property 11: All animations respect prefers-reduced-motion setting', async ({ page }) => {
    // Test with reduced motion enabled
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(100)

    // Get all elements that might have animations
    const animatedElements = await page.locator(`
      button, 
      .card, 
      [class*="transition"], 
      [class*="animate"], 
      [class*="hover"], 
      input,
      select,
      textarea
    `).all()

    const animationViolations: string[] = []

    for (let i = 0; i < Math.min(animatedElements.length, 10); i++) {
      const element = animatedElements[i]
      
      if (!(await element.isVisible())) continue

      try {
        // Test hover animations
        await element.hover()
        await page.waitForTimeout(50)

        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el)
          return {
            transitionDuration: computed.transitionDuration,
            animationDuration: computed.animationDuration
          }
        })

        // Parse transition durations
        const transitionDurations = styles.transitionDuration
          .split(',')
          .map(d => parseFloat(d.trim()))
          .filter(d => !isNaN(d))

        const animationDurations = styles.animationDuration
          .split(',')
          .map(d => parseFloat(d.trim()))
          .filter(d => !isNaN(d))

        // Check that durations are very short (≤ 0.01s) when motion is reduced
        const hasLongTransitions = transitionDurations.some(d => d > 0.01)
        const hasLongAnimations = animationDurations.some(d => d > 0.01)

        if (hasLongTransitions) {
          animationViolations.push(`Element ${i}: Long transition duration when motion should be reduced`)
        }

        if (hasLongAnimations) {
          animationViolations.push(`Element ${i}: Long animation duration when motion should be reduced`)
        }

      } catch (error) {
        // Skip elements that can't be interacted with
        continue
      }
    }

    // Report violations
    if (animationViolations.length > 0) {
      console.log('Reduced motion violations:')
      animationViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    expect(animationViolations.length).toBe(0)
  })

  test('Property 11: CSS animations respect prefers-reduced-motion media query', async ({ page }) => {
    // Test with reduced motion enabled
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(100)

    // Check if CSS properly handles reduced motion
    const cssViolations = await page.evaluate(() => {
      const violations: string[] = []
      const selectors = [
        '.animate-fade-in',
        '.animate-slide-in', 
        '.animate-scale-in',
        '.transition-all',
        '.hover-lift',
        '.hover-glow',
        '[class*="animate"]',
        '[class*="transition"]'
      ]

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        elements.forEach((el, index) => {
          const computed = window.getComputedStyle(el)
          const transitionDuration = computed.transitionDuration
          const animationDuration = computed.animationDuration
          
          // Parse durations
          const transitionDurations = transitionDuration
            .split(',')
            .map(d => parseFloat(d.trim()))
            .filter(d => !isNaN(d))

          const animationDurations = animationDuration
            .split(',')
            .map(d => parseFloat(d.trim()))
            .filter(d => !isNaN(d))

          // Check if durations are properly reduced
          const hasLongTransitions = transitionDurations.some(d => d > 0.01)
          const hasLongAnimations = animationDurations.some(d => d > 0.01)

          if (hasLongTransitions || hasLongAnimations) {
            violations.push(`${selector}[${index}]: Animation not reduced`)
          }
        })
      })

      return violations
    })

    if (cssViolations.length > 0) {
      console.log('CSS motion violations:')
      cssViolations.forEach(violation => console.log(`- ${violation}`))
    }

    expect(cssViolations.length).toBe(0)
  })

  test('Property 11: JavaScript animations respect motion preferences', async ({ page }) => {
    // Test with reduced motion enabled
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(100)

    // Check if JavaScript respects motion preferences
    const jsMotionTest = await page.evaluate(() => {
      const violations: string[] = []
      
      // Check if prefers-reduced-motion is properly detected
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      
      if (!prefersReducedMotion) {
        violations.push('prefers-reduced-motion media query not properly detected')
      }

      // Check scroll-triggered animations
      const scrollElements = document.querySelectorAll('.fade-in-on-scroll, .section-fade-in')
      scrollElements.forEach((el, index) => {
        const computed = window.getComputedStyle(el)
        const transitionDuration = parseFloat(computed.transitionDuration)
        if (transitionDuration > 0.01) {
          violations.push(`Scroll animation ${index} not reduced: ${transitionDuration}s`)
        }
      })

      // Check intersection observer animations
      const observedElements = document.querySelectorAll('[class*="animate"], [class*="fade"]')
      observedElements.forEach((el, index) => {
        const computed = window.getComputedStyle(el)
        const animationDuration = parseFloat(computed.animationDuration)
        if (animationDuration > 0.01) {
          violations.push(`Intersection animation ${index} not reduced: ${animationDuration}s`)
        }
      })

      return violations
    })

    if (jsMotionTest.length > 0) {
      console.log('JavaScript motion violations:')
      jsMotionTest.forEach(violation => console.log(`- ${violation}`))
    }

    expect(jsMotionTest.length).toBe(0)
  })

  test('Property 11: Component animations respect reduced motion', async ({ page }) => {
    const componentTypes = ['button', 'card', 'input', 'stat-card']
    
    for (const componentType of componentTypes) {
      // Test with reduced motion enabled
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForTimeout(100)

      // Test specific component types
      let selector: string
      switch (componentType) {
        case 'button':
          selector = 'button'
          break
        case 'card':
          selector = '.card, [class*="card"]'
          break
        case 'input':
          selector = 'input, select, textarea'
          break
        case 'stat-card':
          selector = '[data-testid*="stat"], .stat-card, [class*="stat"]'
          break
        default:
          selector = '*'
      }

      const elements = await page.locator(selector).all()
      const componentViolations: string[] = []

      for (let i = 0; i < Math.min(elements.length, 3); i++) {
        const element = elements[i]
        
        if (!(await element.isVisible())) continue

        try {
          // Test hover animations
          await element.hover()
          await page.waitForTimeout(50)

          const hoverStyles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el)
            return {
              transitionDuration: computed.transitionDuration,
              animationDuration: computed.animationDuration
            }
          })

          const transitionDurations = hoverStyles.transitionDuration
            .split(',')
            .map(d => parseFloat(d.trim()))
            .filter(d => !isNaN(d))

          const hasLongTransitions = transitionDurations.some(d => d > 0.01)
          
          if (hasLongTransitions) {
            componentViolations.push(`${componentType}[${i}] hover animation not reduced`)
          }

        } catch (error) {
          continue
        }
      }

      if (componentViolations.length > 0) {
        console.log(`Component motion violations (${componentType}):`)
        componentViolations.forEach(violation => console.log(`- ${violation}`))
      }

      expect(componentViolations.length).toBe(0)
    }
  })
})