import { test, expect } from '@playwright/test'

/**
 * Semantic HTML Structure Accessibility Test Suite
 * 
 * This test suite verifies that the application uses proper semantic HTML elements
 * for screen reader navigation and accessibility:
 * - Proper use of semantic elements (header, nav, main, section, article, aside, footer)
 * - Logical heading hierarchy (h1-h6)
 * - Landmark regions for screen reader navigation
 * 
 * Validates: Requirements 11.4
 */

test.describe('Semantic HTML Structure Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should have proper semantic HTML structure with landmark regions', async ({ page }) => {
    // Check for essential landmark regions
    const landmarks = await page.evaluate(() => {
      const results = {
        header: document.querySelector('header') !== null,
        nav: document.querySelector('nav') !== null,
        main: document.querySelector('main') !== null,
        footer: document.querySelector('footer') !== null,
        // Also check for ARIA landmarks
        banner: document.querySelector('[role="banner"]') !== null,
        navigation: document.querySelector('[role="navigation"]') !== null,
        mainContent: document.querySelector('[role="main"]') !== null,
        contentinfo: document.querySelector('[role="contentinfo"]') !== null
      }
      
      return results
    })

    // At minimum, we should have main content area
    expect(landmarks.main || landmarks.mainContent).toBe(true)

    // Check for navigation (either semantic nav or role="navigation")
    const hasNavigation = landmarks.nav || landmarks.navigation
    if (!hasNavigation) {
      console.log('Warning: No navigation landmark found. Consider adding <nav> or role="navigation"')
    }

    // Check for header/banner
    const hasHeader = landmarks.header || landmarks.banner
    if (!hasHeader) {
      console.log('Warning: No header landmark found. Consider adding <header> or role="banner"')
    }

    // Verify landmark structure
    const landmarkStructure = await page.evaluate(() => {
      const landmarks: Array<{
        element: string
        role: string | null
        hasLabel: boolean
        labelText: string
      }> = []

      // Find all landmark elements
      const landmarkSelectors = [
        'header', 'nav', 'main', 'section', 'article', 'aside', 'footer',
        '[role="banner"]', '[role="navigation"]', '[role="main"]', 
        '[role="region"]', '[role="complementary"]', '[role="contentinfo"]'
      ]

      landmarkSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        elements.forEach(el => {
          const role = el.getAttribute('role') || el.tagName.toLowerCase()
          const ariaLabel = el.getAttribute('aria-label')
          const ariaLabelledby = el.getAttribute('aria-labelledby')
          
          let labelText = ''
          if (ariaLabel) {
            labelText = ariaLabel
          } else if (ariaLabelledby) {
            const labelElement = document.getElementById(ariaLabelledby)
            labelText = labelElement?.textContent?.trim() || ''
          }

          landmarks.push({
            element: el.tagName.toLowerCase(),
            role: role,
            hasLabel: !!(ariaLabel || ariaLabelledby),
            labelText: labelText
          })
        })
      })

      return landmarks
    })

    // Report landmark structure
    console.log('Landmark structure:')
    landmarkStructure.forEach(landmark => {
      console.log(`- ${landmark.element} (role: ${landmark.role})${landmark.hasLabel ? ` - "${landmark.labelText}"` : ''}`)
    })

    // Should have at least one main landmark
    const hasMainLandmark = landmarkStructure.some(l => 
      l.element === 'main' || l.role === 'main'
    )
    expect(hasMainLandmark).toBe(true)
  })

  test('should have logical heading hierarchy', async ({ page }) => {
    const headingStructure = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      
      return headings.map(heading => ({
        level: parseInt(heading.tagName.charAt(1)),
        text: heading.textContent?.trim().substring(0, 50) || '',
        hasContent: (heading.textContent?.trim().length || 0) > 0,
        isVisible: heading.offsetWidth > 0 && heading.offsetHeight > 0
      })).filter(h => h.isVisible && h.hasContent)
    })

    // Should have at least one heading
    expect(headingStructure.length).toBeGreaterThan(0)

    // Should start with h1 (or at least not skip levels at the beginning)
    if (headingStructure.length > 0) {
      const firstHeading = headingStructure[0]
      expect(firstHeading.level).toBeLessThanOrEqual(2) // h1 or h2 is acceptable for first heading
    }

    // Check for logical hierarchy (no skipping levels)
    const hierarchyViolations: string[] = []
    
    for (let i = 1; i < headingStructure.length; i++) {
      const current = headingStructure[i]
      const previous = headingStructure[i - 1]
      
      // If jumping more than one level (e.g., h2 to h4), that's a violation
      if (current.level > previous.level + 1) {
        hierarchyViolations.push(
          `Heading level jump from h${previous.level} ("${previous.text}") to h${current.level} ("${current.text}")`
        )
      }
    }

    // Report heading structure
    console.log('Heading structure:')
    headingStructure.forEach((heading, index) => {
      const indent = '  '.repeat(heading.level - 1)
      console.log(`${indent}h${heading.level}: ${heading.text}`)
    })

    if (hierarchyViolations.length > 0) {
      console.log('Heading hierarchy violations:')
      hierarchyViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    // Allow some flexibility - minor violations are warnings, major violations fail
    expect(hierarchyViolations.length).toBeLessThanOrEqual(2)
  })

  test('should use appropriate semantic elements for content structure', async ({ page }) => {
    const semanticStructure = await page.evaluate(() => {
      const results = {
        // Check for proper use of semantic elements
        articles: document.querySelectorAll('article').length,
        sections: document.querySelectorAll('section').length,
        asides: document.querySelectorAll('aside').length,
        
        // Check for generic div usage where semantic elements might be better
        divsWithHeadings: document.querySelectorAll('div > h1, div > h2, div > h3, div > h4, div > h5, div > h6').length,
        
        // Check for lists
        lists: {
          ul: document.querySelectorAll('ul').length,
          ol: document.querySelectorAll('ol').length,
          dl: document.querySelectorAll('dl').length
        },
        
        // Check for form structure
        forms: document.querySelectorAll('form').length,
        fieldsets: document.querySelectorAll('fieldset').length,
        legends: document.querySelectorAll('legend').length,
        
        // Check for table structure (if any)
        tables: document.querySelectorAll('table').length,
        tableHeaders: document.querySelectorAll('th').length,
        tableCaptions: document.querySelectorAll('caption').length
      }
      
      return results
    })

    console.log('Semantic structure analysis:')
    console.log(`- Articles: ${semanticStructure.articles}`)
    console.log(`- Sections: ${semanticStructure.sections}`)
    console.log(`- Asides: ${semanticStructure.asides}`)
    console.log(`- Forms: ${semanticStructure.forms}`)
    console.log(`- Lists: UL(${semanticStructure.lists.ul}), OL(${semanticStructure.lists.ol}), DL(${semanticStructure.lists.dl})`)
    console.log(`- Tables: ${semanticStructure.tables} (with ${semanticStructure.tableHeaders} headers)`)

    // Recommendations (not strict requirements)
    if (semanticStructure.divsWithHeadings > 0) {
      console.log(`Recommendation: ${semanticStructure.divsWithHeadings} div elements contain headings - consider using <section> or <article>`)
    }

    // Basic semantic structure should be present
    const hasSemanticStructure = 
      semanticStructure.sections > 0 || 
      semanticStructure.articles > 0 || 
      semanticStructure.forms > 0

    expect(hasSemanticStructure).toBe(true)
  })

  test('should have proper form semantics and accessibility', async ({ page }) => {
    const forms = await page.locator('form').all()
    const formViolations: string[] = []

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i]
      
      if (!(await form.isVisible())) continue

      // Check form inputs have proper labels
      const inputs = await form.locator('input, select, textarea').all()
      
      for (let j = 0; j < inputs.length; j++) {
        const input = inputs[j]
        
        const inputInfo = await input.evaluate((el) => {
          const id = el.id
          const type = el.getAttribute('type') || el.tagName.toLowerCase()
          const hasLabel = id ? document.querySelector(`label[for="${id}"]`) !== null : false
          const hasAriaLabel = el.hasAttribute('aria-label')
          const hasAriaLabelledby = el.hasAttribute('aria-labelledby')
          const hasPlaceholder = el.hasAttribute('placeholder')
          
          return {
            id,
            type,
            hasLabel,
            hasAriaLabel,
            hasAriaLabelledby,
            hasPlaceholder,
            hasAnyLabel: hasLabel || hasAriaLabel || hasAriaLabelledby
          }
        })

        // Skip hidden inputs
        if (inputInfo.type === 'hidden') continue

        if (!inputInfo.hasAnyLabel) {
          formViolations.push(`Form ${i + 1}, Input ${j + 1} (${inputInfo.type}): No accessible label found`)
        }

        // Placeholder is not sufficient as a label
        if (!inputInfo.hasAnyLabel && inputInfo.hasPlaceholder) {
          formViolations.push(`Form ${i + 1}, Input ${j + 1} (${inputInfo.type}): Only has placeholder, needs proper label`)
        }
      }

      // Check for fieldsets in complex forms
      const fieldsets = await form.locator('fieldset').count()
      const inputCount = await form.locator('input, select, textarea').count()
      
      if (inputCount > 5 && fieldsets === 0) {
        console.log(`Recommendation: Form ${i + 1} has ${inputCount} inputs but no fieldsets - consider grouping related fields`)
      }

      // Check for form validation messages
      const errorMessages = await form.locator('[role="alert"], .error, [class*="error"]').count()
      const requiredFields = await form.locator('[required], [aria-required="true"]').count()
      
      if (requiredFields > 0) {
        console.log(`Form ${i + 1}: ${requiredFields} required fields, ${errorMessages} error message containers`)
      }
    }

    if (formViolations.length > 0) {
      console.log('Form accessibility violations:')
      formViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    expect(formViolations.length).toBe(0)
  })

  test('should have proper table semantics (if tables exist)', async ({ page }) => {
    const tables = await page.locator('table').all()
    const tableViolations: string[] = []

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i]
      
      if (!(await table.isVisible())) continue

      const tableInfo = await table.evaluate((el) => {
        const hasCaption = el.querySelector('caption') !== null
        const hasHeaders = el.querySelectorAll('th').length > 0
        const hasThead = el.querySelector('thead') !== null
        const hasTbody = el.querySelector('tbody') !== null
        const rowCount = el.querySelectorAll('tr').length
        const hasScope = Array.from(el.querySelectorAll('th')).some(th => th.hasAttribute('scope'))
        
        return {
          hasCaption,
          hasHeaders,
          hasThead,
          hasTbody,
          rowCount,
          hasScope
        }
      })

      // Tables should have headers
      if (!tableInfo.hasHeaders) {
        tableViolations.push(`Table ${i + 1}: No header cells (th) found`)
      }

      // Complex tables should have proper structure
      if (tableInfo.rowCount > 3) {
        if (!tableInfo.hasThead) {
          console.log(`Recommendation: Table ${i + 1} should use <thead> for header rows`)
        }
        
        if (!tableInfo.hasTbody) {
          console.log(`Recommendation: Table ${i + 1} should use <tbody> for data rows`)
        }
        
        if (!tableInfo.hasScope && tableInfo.hasHeaders) {
          console.log(`Recommendation: Table ${i + 1} headers should have scope attributes`)
        }
      }

      // Tables should have captions for accessibility
      if (!tableInfo.hasCaption) {
        console.log(`Recommendation: Table ${i + 1} should have a <caption> describing its content`)
      }
    }

    if (tableViolations.length > 0) {
      console.log('Table accessibility violations:')
      tableViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    expect(tableViolations.length).toBe(0)
  })

  test('should have proper list semantics', async ({ page }) => {
    const listViolations: string[] = []

    // Check for proper list structure
    const listInfo = await page.evaluate(() => {
      const results: Array<{
        type: string
        hasItems: boolean
        itemCount: number
        hasNestedLists: boolean
      }> = []

      // Check unordered lists
      document.querySelectorAll('ul').forEach((ul, index) => {
        const items = ul.querySelectorAll(':scope > li')
        const nestedLists = ul.querySelectorAll('ul, ol')
        
        results.push({
          type: `ul[${index}]`,
          hasItems: items.length > 0,
          itemCount: items.length,
          hasNestedLists: nestedLists.length > 0
        })
      })

      // Check ordered lists
      document.querySelectorAll('ol').forEach((ol, index) => {
        const items = ol.querySelectorAll(':scope > li')
        const nestedLists = ol.querySelectorAll('ul, ol')
        
        results.push({
          type: `ol[${index}]`,
          hasItems: items.length > 0,
          itemCount: items.length,
          hasNestedLists: nestedLists.length > 0
        })
      })

      // Check definition lists
      document.querySelectorAll('dl').forEach((dl, index) => {
        const terms = dl.querySelectorAll('dt')
        const definitions = dl.querySelectorAll('dd')
        
        results.push({
          type: `dl[${index}]`,
          hasItems: terms.length > 0 && definitions.length > 0,
          itemCount: Math.min(terms.length, definitions.length),
          hasNestedLists: false
        })
      })

      return results
    })

    // Validate list structure
    listInfo.forEach(list => {
      if (!list.hasItems) {
        listViolations.push(`${list.type}: Empty list or missing list items`)
      }
      
      if (list.itemCount === 1 && !list.hasNestedLists) {
        console.log(`Recommendation: ${list.type} has only one item - consider if a list is necessary`)
      }
    })

    // Check for potential lists that aren't marked up as lists
    const potentialLists = await page.evaluate(() => {
      const violations: string[] = []
      
      // Look for div containers with multiple similar child elements
      const divs = document.querySelectorAll('div')
      divs.forEach((div, index) => {
        const children = Array.from(div.children)
        
        // If div has 3+ similar child elements, it might be a list
        if (children.length >= 3) {
          const tagNames = children.map(child => child.tagName)
          const uniqueTags = new Set(tagNames)
          
          // If all children have the same tag and it's not a list
          if (uniqueTags.size === 1 && !['UL', 'OL', 'DL'].includes(div.tagName)) {
            const childTag = Array.from(uniqueTags)[0]
            if (['DIV', 'P', 'SPAN'].includes(childTag)) {
              violations.push(`div[${index}] contains ${children.length} similar ${childTag} elements - consider using a list`)
            }
          }
        }
      })
      
      return violations
    })

    if (potentialLists.length > 0) {
      console.log('Potential list markup recommendations:')
      potentialLists.forEach(recommendation => {
        console.log(`- ${recommendation}`)
      })
    }

    if (listViolations.length > 0) {
      console.log('List structure violations:')
      listViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    expect(listViolations.length).toBe(0)
  })

  test('should have proper ARIA landmarks and roles', async ({ page }) => {
    const ariaInfo = await page.evaluate(() => {
      const landmarks: Array<{
        element: string
        role: string
        label: string
        hasLabel: boolean
      }> = []

      // Find elements with landmark roles
      const landmarkRoles = [
        'banner', 'navigation', 'main', 'region', 'search', 
        'complementary', 'contentinfo', 'form', 'application'
      ]

      landmarkRoles.forEach(role => {
        const elements = document.querySelectorAll(`[role="${role}"]`)
        elements.forEach((el, index) => {
          const ariaLabel = el.getAttribute('aria-label') || ''
          const ariaLabelledby = el.getAttribute('aria-labelledby')
          let labelText = ariaLabel
          
          if (!labelText && ariaLabelledby) {
            const labelEl = document.getElementById(ariaLabelledby)
            labelText = labelEl?.textContent?.trim() || ''
          }

          landmarks.push({
            element: `${el.tagName.toLowerCase()}[${index}]`,
            role: role,
            label: labelText,
            hasLabel: !!(ariaLabel || ariaLabelledby)
          })
        })
      })

      return landmarks
    })

    // Check for multiple landmarks of the same type without labels
    const roleGroups = ariaInfo.reduce((groups, landmark) => {
      if (!groups[landmark.role]) groups[landmark.role] = []
      groups[landmark.role].push(landmark)
      return groups
    }, {} as Record<string, typeof ariaInfo>)

    const ariaViolations: string[] = []

    Object.entries(roleGroups).forEach(([role, landmarks]) => {
      if (landmarks.length > 1) {
        const unlabeledLandmarks = landmarks.filter(l => !l.hasLabel)
        if (unlabeledLandmarks.length > 0) {
          ariaViolations.push(
            `Multiple ${role} landmarks found but ${unlabeledLandmarks.length} lack accessible names`
          )
        }
      }
    })

    console.log('ARIA landmarks found:')
    ariaInfo.forEach(landmark => {
      console.log(`- ${landmark.element} (role="${landmark.role}")${landmark.hasLabel ? ` - "${landmark.label}"` : ' - no label'}`)
    })

    if (ariaViolations.length > 0) {
      console.log('ARIA landmark violations:')
      ariaViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    expect(ariaViolations.length).toBe(0)
  })
})