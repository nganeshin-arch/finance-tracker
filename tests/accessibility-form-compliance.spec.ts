import { test, expect } from '@playwright/test'

/**
 * Form Accessibility Compliance Test Suite
 * 
 * This test suite verifies comprehensive form accessibility:
 * - All form labels are properly associated with inputs
 * - Error messages are announced to screen readers
 * - Keyboard navigation works through all forms
 * - Form validation is accessible
 * 
 * Validates: Requirements 11.6, 6.6
 */

test.describe('Form Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should have properly associated labels for all form inputs', async ({ page }) => {
    const forms = await page.locator('form').all()
    const labelViolations: Array<{
      form: number
      input: number
      issue: string
      inputType: string
    }> = []

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i]
      
      if (!(await form.isVisible())) continue

      const inputs = await form.locator('input, select, textarea').all()
      
      for (let j = 0; j < inputs.length; j++) {
        const input = inputs[j]
        
        const inputInfo = await input.evaluate((el) => {
          const id = el.id
          const type = el.getAttribute('type') || el.tagName.toLowerCase()
          const name = el.getAttribute('name') || ''
          
          // Check for explicit label association
          const hasExplicitLabel = id ? document.querySelector(`label[for="${id}"]`) !== null : false
          
          // Check for implicit label (input inside label)
          const hasImplicitLabel = el.closest('label') !== null
          
          // Check for ARIA labeling
          const hasAriaLabel = el.hasAttribute('aria-label')
          const ariaLabel = el.getAttribute('aria-label') || ''
          const hasAriaLabelledby = el.hasAttribute('aria-labelledby')
          const ariaLabelledby = el.getAttribute('aria-labelledby') || ''
          
          // Get the actual label text
          let labelText = ''
          if (hasExplicitLabel && id) {
            const labelEl = document.querySelector(`label[for="${id}"]`)
            labelText = labelEl?.textContent?.trim() || ''
          } else if (hasImplicitLabel) {
            const labelEl = el.closest('label')
            labelText = labelEl?.textContent?.trim() || ''
          } else if (hasAriaLabel) {
            labelText = ariaLabel
          } else if (hasAriaLabelledby) {
            const labelEl = document.getElementById(ariaLabelledby)
            labelText = labelEl?.textContent?.trim() || ''
          }
          
          // Check for placeholder (not sufficient as label)
          const hasPlaceholder = el.hasAttribute('placeholder')
          const placeholder = el.getAttribute('placeholder') || ''
          
          return {
            id,
            type,
            name,
            hasExplicitLabel,
            hasImplicitLabel,
            hasAriaLabel,
            ariaLabel,
            hasAriaLabelledby,
            ariaLabelledby,
            labelText,
            hasPlaceholder,
            placeholder,
            hasAnyLabel: hasExplicitLabel || hasImplicitLabel || hasAriaLabel || hasAriaLabelledby
          }
        })

        // Skip hidden inputs
        if (inputInfo.type === 'hidden') continue

        // Check for proper labeling
        if (!inputInfo.hasAnyLabel) {
          labelViolations.push({
            form: i + 1,
            input: j + 1,
            issue: 'No accessible label found',
            inputType: inputInfo.type
          })
        } else if (inputInfo.labelText.length === 0) {
          labelViolations.push({
            form: i + 1,
            input: j + 1,
            issue: 'Label exists but has no text content',
            inputType: inputInfo.type
          })
        }

        // Warn about placeholder-only labeling
        if (!inputInfo.hasAnyLabel && inputInfo.hasPlaceholder) {
          labelViolations.push({
            form: i + 1,
            input: j + 1,
            issue: 'Only has placeholder text, needs proper label',
            inputType: inputInfo.type
          })
        }

        // Check for missing ID when using explicit labels
        if (!inputInfo.id && inputInfo.hasExplicitLabel) {
          labelViolations.push({
            form: i + 1,
            input: j + 1,
            issue: 'Input lacks ID for label association',
            inputType: inputInfo.type
          })
        }
      }
    }

    if (labelViolations.length > 0) {
      console.log('Form label violations:')
      labelViolations.forEach(violation => {
        console.log(`- Form ${violation.form}, Input ${violation.input} (${violation.inputType}): ${violation.issue}`)
      })
    }

    expect(labelViolations.length).toBe(0)
  })

  test('should announce error messages to screen readers', async ({ page }) => {
    const forms = await page.locator('form').all()
    const errorViolations: Array<{
      form: number
      input: number
      issue: string
    }> = []

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i]
      
      if (!(await form.isVisible())) continue

      // Look for inputs with error states or validation
      const inputs = await form.locator('input, select, textarea').all()
      
      for (let j = 0; j < inputs.length; j++) {
        const input = inputs[j]
        
        const errorInfo = await input.evaluate((el) => {
          const hasErrorClass = el.className.includes('error') || el.className.includes('invalid')
          const hasAriaInvalid = el.hasAttribute('aria-invalid')
          const ariaInvalid = el.getAttribute('aria-invalid')
          const hasAriaDescribedby = el.hasAttribute('aria-describedby')
          const ariaDescribedby = el.getAttribute('aria-describedby') || ''
          
          // Check for associated error message
          let hasErrorMessage = false
          let errorMessageText = ''
          if (hasAriaDescribedby) {
            const describedByIds = ariaDescribedby.split(' ')
            describedByIds.forEach(id => {
              const messageEl = document.getElementById(id)
              if (messageEl) {
                const text = messageEl.textContent?.trim() || ''
                if (text.length > 0) {
                  hasErrorMessage = true
                  errorMessageText += text + ' '
                }
              }
            })
          }
          
          // Look for nearby error messages (common pattern)
          const parentContainer = el.closest('.form-group, .input-group, .field, div')
          let hasNearbyErrorMessage = false
          if (parentContainer) {
            const errorElements = parentContainer.querySelectorAll('.error, [class*="error"], [role="alert"]')
            hasNearbyErrorMessage = errorElements.length > 0
          }
          
          return {
            hasErrorClass,
            hasAriaInvalid,
            ariaInvalid,
            hasAriaDescribedby,
            ariaDescribedby,
            hasErrorMessage,
            errorMessageText: errorMessageText.trim(),
            hasNearbyErrorMessage,
            id: el.id || '',
            type: el.getAttribute('type') || el.tagName.toLowerCase()
          }
        })

        // If input has error styling, it should have accessible error messaging
        if (errorInfo.hasErrorClass || errorInfo.ariaInvalid === 'true') {
          if (!errorInfo.hasErrorMessage && !errorInfo.hasNearbyErrorMessage) {
            errorViolations.push({
              form: i + 1,
              input: j + 1,
              issue: 'Input has error state but no accessible error message'
            })
          }
          
          if (!errorInfo.hasAriaDescribedby && errorInfo.hasErrorMessage) {
            errorViolations.push({
              form: i + 1,
              input: j + 1,
              issue: 'Error message exists but not linked via aria-describedby'
            })
          }
        }

        // Check for required field indicators
        const requiredInfo = await input.evaluate((el) => {
          const hasRequired = el.hasAttribute('required')
          const hasAriaRequired = el.getAttribute('aria-required') === 'true'
          const hasRequiredIndicator = el.closest('label, .field')?.textContent?.includes('*') || false
          
          return {
            hasRequired,
            hasAriaRequired,
            hasRequiredIndicator,
            isRequired: hasRequired || hasAriaRequired
          }
        })

        // Required fields should be properly indicated
        if (requiredInfo.isRequired && !requiredInfo.hasRequiredIndicator) {
          console.log(`Recommendation: Form ${i + 1}, Input ${j + 1} is required but lacks visual indicator`)
        }
      }

      // Check for form-level error messages
      const formErrors = await form.locator('[role="alert"], .form-error, [class*="form-error"]').all()
      
      for (const errorEl of formErrors) {
        if (!(await errorEl.isVisible())) continue
        
        const errorElInfo = await errorEl.evaluate((el) => {
          const hasRole = el.getAttribute('role') === 'alert'
          const hasAriaLive = el.hasAttribute('aria-live')
          const text = el.textContent?.trim() || ''
          
          return {
            hasRole,
            hasAriaLive,
            hasText: text.length > 0
          }
        })

        if (errorElInfo.hasText && !errorElInfo.hasRole && !errorElInfo.hasAriaLive) {
          console.log(`Recommendation: Form ${i + 1} error message should have role="alert" or aria-live`)
        }
      }
    }

    if (errorViolations.length > 0) {
      console.log('Form error message violations:')
      errorViolations.forEach(violation => {
        console.log(`- Form ${violation.form}, Input ${violation.input}: ${violation.issue}`)
      })
    }

    expect(errorViolations.length).toBe(0)
  })

  test('should support keyboard navigation through all forms', async ({ page }) => {
    const forms = await page.locator('form').all()
    const keyboardViolations: string[] = []

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i]
      
      if (!(await form.isVisible())) continue

      // Get all focusable elements in the form
      const focusableElements = await form.locator(`
        input:not([type="hidden"]):not([disabled]), 
        select:not([disabled]), 
        textarea:not([disabled]), 
        button:not([disabled]), 
        [tabindex]:not([tabindex="-1"]):not([disabled])
      `).all()

      if (focusableElements.length === 0) {
        keyboardViolations.push(`Form ${i + 1}: No focusable elements found`)
        continue
      }

      // Test keyboard navigation through form
      const navigationResults: Array<{
        element: string
        canFocus: boolean
        hasVisibleFocus: boolean
      }> = []

      for (let j = 0; j < focusableElements.length; j++) {
        const element = focusableElements[j]
        
        try {
          // Focus the element
          await element.focus()
          await page.waitForTimeout(50)

          // Check if element received focus
          const hasFocus = await element.evaluate((el) => el === document.activeElement)
          
          // Check for visible focus indicator
          const focusStyles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el)
            return {
              outline: computed.outline,
              outlineWidth: computed.outlineWidth,
              boxShadow: computed.boxShadow,
              borderColor: computed.borderColor
            }
          })

          const hasVisibleFocus = 
            (focusStyles.outline !== 'none' && 
             focusStyles.outline !== '0px none' && 
             focusStyles.outlineWidth !== '0px') ||
            (focusStyles.boxShadow !== 'none' && 
             (focusStyles.boxShadow.includes('ring') || 
              focusStyles.boxShadow.includes('focus')))

          const elementInfo = await element.evaluate((el) => {
            return {
              tagName: el.tagName.toLowerCase(),
              type: el.getAttribute('type') || '',
              id: el.id || '',
              className: el.className
            }
          })

          navigationResults.push({
            element: `${elementInfo.tagName}${elementInfo.type ? `[${elementInfo.type}]` : ''}${elementInfo.id ? `#${elementInfo.id}` : ''}`,
            canFocus: hasFocus,
            hasVisibleFocus: hasVisibleFocus
          })

          if (!hasFocus) {
            keyboardViolations.push(`Form ${i + 1}, Element ${j + 1}: Cannot receive keyboard focus`)
          }

          if (hasFocus && !hasVisibleFocus) {
            keyboardViolations.push(`Form ${i + 1}, Element ${j + 1}: No visible focus indicator`)
          }

        } catch (error) {
          keyboardViolations.push(`Form ${i + 1}, Element ${j + 1}: Error during keyboard navigation test`)
        }
      }

      // Test Tab navigation through the form
      try {
        // Focus first element
        await focusableElements[0].focus()
        
        // Tab through all elements
        for (let j = 1; j < focusableElements.length; j++) {
          await page.keyboard.press('Tab')
          await page.waitForTimeout(50)
          
          const currentFocus = await page.evaluate(() => {
            const el = document.activeElement
            return el ? {
              tagName: el.tagName.toLowerCase(),
              id: el.id || '',
              type: el.getAttribute('type') || ''
            } : null
          })

          if (!currentFocus) {
            keyboardViolations.push(`Form ${i + 1}: Lost focus during Tab navigation at step ${j}`)
            break
          }
        }

        // Test Shift+Tab (reverse navigation)
        for (let j = focusableElements.length - 2; j >= 0; j--) {
          await page.keyboard.press('Shift+Tab')
          await page.waitForTimeout(50)
          
          const currentFocus = await page.evaluate(() => {
            const el = document.activeElement
            return el ? {
              tagName: el.tagName.toLowerCase(),
              id: el.id || ''
            } : null
          })

          if (!currentFocus) {
            keyboardViolations.push(`Form ${i + 1}: Lost focus during Shift+Tab navigation`)
            break
          }
        }

      } catch (error) {
        keyboardViolations.push(`Form ${i + 1}: Error during Tab navigation test`)
      }

      console.log(`Form ${i + 1} keyboard navigation:`)
      navigationResults.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.element} - Focus: ${result.canFocus}, Visible: ${result.hasVisibleFocus}`)
      })
    }

    if (keyboardViolations.length > 0) {
      console.log('Keyboard navigation violations:')
      keyboardViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    expect(keyboardViolations.length).toBe(0)
  })

  test('should have accessible form validation and submission', async ({ page }) => {
    const forms = await page.locator('form').all()
    const validationViolations: string[] = []

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i]
      
      if (!(await form.isVisible())) continue

      // Check for submit button
      const submitButtons = await form.locator('button[type="submit"], input[type="submit"], button:not([type])').all()
      
      if (submitButtons.length === 0) {
        validationViolations.push(`Form ${i + 1}: No submit button found`)
        continue
      }

      // Test form submission accessibility
      for (let j = 0; j < submitButtons.length; j++) {
        const submitButton = submitButtons[j]
        
        const buttonInfo = await submitButton.evaluate((el) => {
          const text = el.textContent?.trim() || ''
          const hasAriaLabel = el.hasAttribute('aria-label')
          const ariaLabel = el.getAttribute('aria-label') || ''
          const isDisabled = el.hasAttribute('disabled')
          const hasAccessibleName = text.length > 0 || hasAriaLabel
          
          return {
            text,
            hasAriaLabel,
            ariaLabel,
            isDisabled,
            hasAccessibleName
          }
        })

        if (!buttonInfo.hasAccessibleName) {
          validationViolations.push(`Form ${i + 1}, Submit button ${j + 1}: No accessible name`)
        }
      }

      // Check for fieldsets in complex forms
      const inputs = await form.locator('input, select, textarea').count()
      const fieldsets = await form.locator('fieldset').all()
      
      if (inputs > 5 && fieldsets.length === 0) {
        console.log(`Recommendation: Form ${i + 1} has ${inputs} inputs - consider using fieldsets to group related fields`)
      }

      // Check fieldset accessibility
      for (let j = 0; j < fieldsets.length; j++) {
        const fieldset = fieldsets[j]
        
        const fieldsetInfo = await fieldset.evaluate((el) => {
          const hasLegend = el.querySelector('legend') !== null
          const legendText = el.querySelector('legend')?.textContent?.trim() || ''
          
          return {
            hasLegend,
            legendText
          }
        })

        if (!fieldsetInfo.hasLegend) {
          validationViolations.push(`Form ${i + 1}, Fieldset ${j + 1}: Missing legend element`)
        } else if (fieldsetInfo.legendText.length === 0) {
          validationViolations.push(`Form ${i + 1}, Fieldset ${j + 1}: Legend has no text content`)
        }
      }

      // Check for form instructions or help text
      const helpElements = await form.locator('[class*="help"], [class*="hint"], [class*="instruction"]').count()
      const complexInputs = await form.locator('input[type="password"], input[pattern], input[minlength], input[maxlength]').count()
      
      if (complexInputs > 0 && helpElements === 0) {
        console.log(`Recommendation: Form ${i + 1} has complex inputs but no help text`)
      }

      // Test form reset functionality (if present)
      const resetButtons = await form.locator('button[type="reset"], input[type="reset"]').all()
      
      for (const resetButton of resetButtons) {
        const resetInfo = await resetButton.evaluate((el) => {
          const text = el.textContent?.trim() || ''
          const hasAriaLabel = el.hasAttribute('aria-label')
          const hasAccessibleName = text.length > 0 || hasAriaLabel
          
          return { hasAccessibleName }
        })

        if (!resetInfo.hasAccessibleName) {
          validationViolations.push(`Form ${i + 1}: Reset button has no accessible name`)
        }
      }
    }

    if (validationViolations.length > 0) {
      console.log('Form validation violations:')
      validationViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    expect(validationViolations.length).toBe(0)
  })

  test('should have proper ARIA attributes for complex form controls', async ({ page }) => {
    const forms = await page.locator('form').all()
    const ariaViolations: string[] = []

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i]
      
      if (!(await form.isVisible())) continue

      // Check for custom form controls that might need ARIA
      const customControls = await form.locator(`
        [role="combobox"], [role="listbox"], [role="option"], 
        [role="radiogroup"], [role="radio"], [role="checkbox"],
        [role="slider"], [role="spinbutton"], [role="textbox"]
      `).all()

      for (let j = 0; j < customControls.length; j++) {
        const control = customControls[j]
        
        const ariaInfo = await control.evaluate((el) => {
          const role = el.getAttribute('role') || ''
          const hasAriaLabel = el.hasAttribute('aria-label')
          const hasAriaLabelledby = el.hasAttribute('aria-labelledby')
          const hasAriaDescribedby = el.hasAttribute('aria-describedby')
          const hasAriaExpanded = el.hasAttribute('aria-expanded')
          const hasAriaSelected = el.hasAttribute('aria-selected')
          const hasAriaChecked = el.hasAttribute('aria-checked')
          const hasAriaValueNow = el.hasAttribute('aria-valuenow')
          const hasAriaValueMin = el.hasAttribute('aria-valuemin')
          const hasAriaValueMax = el.hasAttribute('aria-valuemax')
          
          return {
            role,
            hasAriaLabel,
            hasAriaLabelledby,
            hasAriaDescribedby,
            hasAriaExpanded,
            hasAriaSelected,
            hasAriaChecked,
            hasAriaValueNow,
            hasAriaValueMin,
            hasAriaValueMax,
            hasAccessibleName: hasAriaLabel || hasAriaLabelledby
          }
        })

        // Check role-specific ARIA requirements
        switch (ariaInfo.role) {
          case 'combobox':
            if (!ariaInfo.hasAriaExpanded) {
              ariaViolations.push(`Form ${i + 1}, Combobox ${j + 1}: Missing aria-expanded`)
            }
            break
          case 'radio':
          case 'checkbox':
            if (!ariaInfo.hasAriaChecked) {
              ariaViolations.push(`Form ${i + 1}, ${ariaInfo.role} ${j + 1}: Missing aria-checked`)
            }
            break
          case 'option':
            if (!ariaInfo.hasAriaSelected) {
              ariaViolations.push(`Form ${i + 1}, Option ${j + 1}: Missing aria-selected`)
            }
            break
          case 'slider':
          case 'spinbutton':
            if (!ariaInfo.hasAriaValueNow) {
              ariaViolations.push(`Form ${i + 1}, ${ariaInfo.role} ${j + 1}: Missing aria-valuenow`)
            }
            break
        }

        // All custom controls should have accessible names
        if (!ariaInfo.hasAccessibleName) {
          ariaViolations.push(`Form ${i + 1}, ${ariaInfo.role} ${j + 1}: No accessible name`)
        }
      }

      // Check for live regions for dynamic form feedback
      const liveRegions = await form.locator('[aria-live], [role="status"], [role="alert"]').count()
      const dynamicContent = await form.locator('[class*="loading"], [class*="success"], [class*="error"]').count()
      
      if (dynamicContent > 0 && liveRegions === 0) {
        console.log(`Recommendation: Form ${i + 1} has dynamic content but no live regions for screen reader announcements`)
      }
    }

    if (ariaViolations.length > 0) {
      console.log('ARIA violations in forms:')
      ariaViolations.forEach(violation => {
        console.log(`- ${violation}`)
      })
    }

    expect(ariaViolations.length).toBe(0)
  })
})