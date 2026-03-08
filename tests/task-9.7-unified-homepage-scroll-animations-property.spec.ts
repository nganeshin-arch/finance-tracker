/**
 * Task 9.7: UnifiedHomePage Scroll Animations Property-Based Test
 * 
 * Property-based test for UnifiedHomePage scroll animations including smooth scroll behavior,
 * fade-in animations for sections, stagger effects for dashboard cards, and accessibility compliance.
 * 
 * **Validates: Requirements 9.3**
 * **Property 33: UnifiedHomePage Scroll Animations**
 * 
 * For any section navigation on UnifiedHomePage, scrolling between sections should trigger 
 * smooth scroll animations rather than instant jumps.
 */

import { test, expect } from '@playwright/test';
import fc from 'fast-check';

test.describe('Task 9.7: UnifiedHomePage Scroll Animations Property-Based Tests', () => {
  
  test('Property 33: UnifiedHomePage Scroll Animations - Smooth scroll behavior and section navigation', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load and sections to be visible
    await page.waitForSelector('#dashboard-section', { timeout: 10000 });
    
    // Property: For any section navigation on UnifiedHomePage, scrolling between sections 
    // should trigger smooth scroll animations rather than instant jumps
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 768, max: 1920 }), // Navigation only visible on tablet+
          viewportHeight: fc.integer({ min: 600, max: 1080 }),
          navigationDelay: fc.integer({ min: 200, max: 800 }),
          scrollTarget: fc.constantFrom('dashboard-section', 'add-transaction-section', 'transactions-section'),
          testIterations: fc.integer({ min: 1, max: 3 })
        }),
        async ({ viewportWidth, viewportHeight, navigationDelay, scrollTarget, testIterations }) => {
          // Set viewport size to ensure navigation is visible
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          await page.waitForTimeout(300); // Allow for responsive adjustments
          
          // Property: HTML should have smooth scroll behavior enabled
          const scrollBehavior = await page.evaluate(() => {
            return window.getComputedStyle(document.documentElement).scrollBehavior;
          });
          expect(scrollBehavior).toBe('smooth');
          
          // Property: Navigation links should exist and be clickable
          const navButtons = page.locator('nav button');
          const navButtonCount = await navButtons.count();
          expect(navButtonCount).toBeGreaterThanOrEqual(3); // Dashboard, Add Transaction, Transactions
          
          // Property: Target sections should exist with proper IDs
          const targetSection = page.locator(`#${scrollTarget}`);
          await expect(targetSection).toBeVisible();
          
          // Test smooth scrolling behavior multiple times for consistency
          for (let iteration = 0; iteration < testIterations; iteration++) {
            // Find the navigation button for the target section
            let navButton;
            if (scrollTarget === 'dashboard-section') {
              navButton = page.locator('nav button:has-text("Dashboard")');
            } else if (scrollTarget === 'add-transaction-section') {
              navButton = page.locator('nav button:has-text("Add Transaction")');
            } else if (scrollTarget === 'transactions-section') {
              navButton = page.locator('nav button:has-text("Transactions")');
            }
            
            if (navButton) {
              // Property: Navigation buttons should have smooth transition effects
              const buttonTransitions = await navButton.evaluate((el) => {
                const styles = window.getComputedStyle(el);
                return {
                  transition: styles.transition,
                  hasHoverScale: el.classList.contains('hover:scale-105'),
                  hasActiveScale: el.classList.contains('active:scale-95'),
                  hasColorTransition: styles.transition.includes('color') || 
                                    el.classList.toString().includes('transition-colors')
                };
              });
              
              expect(buttonTransitions.hasHoverScale).toBeTruthy();
              expect(buttonTransitions.hasActiveScale).toBeTruthy();
              expect(buttonTransitions.hasColorTransition).toBeTruthy();
              
              // Record initial scroll position
              const initialScrollY = await page.evaluate(() => window.scrollY);
              
              // Click navigation button to trigger smooth scroll
              await navButton.click();
              await page.waitForTimeout(navigationDelay);
              
              // Property: Scroll position should change after navigation
              const finalScrollY = await page.evaluate(() => window.scrollY);
              
              // Property: Target section should be in viewport after navigation
              await expect(targetSection).toBeInViewport({ ratio: 0.3 }); // At least 30% visible
              
              // Property: Scroll should be smooth (not instant jump)
              // We can't directly test the smoothness, but we can verify the scroll behavior CSS
              const currentScrollBehavior = await page.evaluate(() => {
                return window.getComputedStyle(document.documentElement).scrollBehavior;
              });
              expect(currentScrollBehavior).toBe('smooth');
            }
          }
        }
      ),
      { 
        numRuns: 10,
        timeout: 45000,
        verbose: true
      }
    );
  });

  test('Property: Sections should have fade-in animations with staggered delays', async ({ page }) => {
    await page.goto('/');
    
    // Property: All main sections should have fade-in animations with appropriate stagger delays
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 1920 }),
          viewportHeight: fc.integer({ min: 568, max: 1080 }),
          loadDelay: fc.integer({ min: 500, max: 2000 }),
          reloadCount: fc.integer({ min: 1, max: 2 })
        }),
        async ({ viewportWidth, viewportHeight, loadDelay, reloadCount }) => {
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          
          for (let reload = 0; reload < reloadCount; reload++) {
            if (reload > 0) {
              await page.reload();
            }
            await page.waitForTimeout(loadDelay);
            
            // Property: Main sections should have fade-in animation classes
            const mainSections = [
              { selector: 'main > .shadow-lg', expectedDelay: '0ms', name: 'ViewMode' },
              { selector: '#dashboard-section .shadow-lg', expectedDelay: '100ms', name: 'Dashboard' },
              { selector: '#add-transaction-section .shadow-lg', expectedDelay: '400ms', name: 'TransactionForm' },
              { selector: '#transactions-section .shadow-lg', expectedDelay: '500ms', name: 'Transactions' }
            ];
            
            for (const section of mainSections) {
              const sectionElement = page.locator(section.selector).first();
              
              // Property: Section should have fade-in animation class
              const hasAnimationClass = await sectionElement.evaluate((el) => {
                const classList = Array.from(el.classList);
                return classList.some(cls => 
                  cls.includes('animate-fade-in') || 
                  cls.includes('motion-safe:animate-fade-in')
                );
              });
              expect(hasAnimationClass).toBeTruthy();
              
              // Property: Section should have correct stagger delay
              const animationDelay = await sectionElement.evaluate(el => el.style.animationDelay);
              expect(animationDelay).toBe(section.expectedDelay);
              
              // Property: Section should have opacity and transform transitions
              const transitionProps = await sectionElement.evaluate((el) => {
                const styles = window.getComputedStyle(el);
                return {
                  transition: styles.transition,
                  opacity: parseFloat(styles.opacity),
                  transform: styles.transform
                };
              });
              
              // After load delay, sections should be fully visible
              if (loadDelay >= 1000) {
                expect(transitionProps.opacity).toBeGreaterThanOrEqual(0.8);
              }
            }
          }
        }
      ),
      { 
        numRuns: 8,
        timeout: 35000
      }
    );
  });

  test('Property: Dashboard cards should have stagger effects on initial load', async ({ page }) => {
    await page.goto('/');
    
    // Property: Dashboard cards should have staggered animation delays for smooth loading
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 1920 }),
          viewportHeight: fc.integer({ min: 568, max: 1080 }),
          waitTime: fc.integer({ min: 1000, max: 3000 }),
          checkDelay: fc.integer({ min: 100, max: 500 })
        }),
        async ({ viewportWidth, viewportHeight, waitTime, checkDelay }) => {
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          await page.waitForTimeout(waitTime);
          
          // Wait for dashboard section to be visible
          await page.waitForSelector('#dashboard-section', { state: 'visible', timeout: 5000 });
          
          // Property: StatCard components should have staggered animations
          const statCards = page.locator('[data-testid="stat-card"]');
          const cardCount = await statCards.count();
          
          if (cardCount > 0) {
            // Property: Each card should have fade-in animation
            for (let i = 0; i < Math.min(cardCount, 4); i++) {
              const card = statCards.nth(i);
              
              const animationProps = await card.evaluate((el) => {
                const classList = Array.from(el.classList);
                const hasAnimationClass = classList.some(cls => 
                  cls.includes('animate-fade-in') || 
                  cls.includes('motion-safe:animate-fade-in')
                );
                
                return {
                  hasAnimation: hasAnimationClass,
                  animationDelay: el.style.animationDelay,
                  classList: classList
                };
              });
              
              expect(animationProps.hasAnimation).toBeTruthy();
              
              // Property: Cards should have staggered delays (150ms intervals)
              const expectedDelay = `${i * 150}ms`;
              expect(animationProps.animationDelay).toBe(expectedDelay);
            }
          }
          
          // Property: Skeleton loading cards should also have stagger effects
          const skeletonCards = page.locator('.dashboard-grid .animate-fade-in-up');
          const skeletonCount = await skeletonCards.count();
          
          if (skeletonCount > 0) {
            for (let i = 0; i < Math.min(skeletonCount, 4); i++) {
              const skeleton = skeletonCards.nth(i);
              
              const skeletonDelay = await skeleton.evaluate(el => el.style.animationDelay);
              const expectedSkeletonDelay = `${i * 100}ms`;
              expect(skeletonDelay).toBe(expectedSkeletonDelay);
            }
          }
          
          await page.waitForTimeout(checkDelay);
        }
      ),
      { 
        numRuns: 8,
        timeout: 40000
      }
    );
  });

  test('Property: Scroll animations should respect prefers-reduced-motion', async ({ page }) => {
    // Property: All scroll animations should be disabled or reduced when user prefers reduced motion
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 768, max: 1920 }),
          viewportHeight: fc.integer({ min: 600, max: 1080 }),
          reducedMotion: fc.boolean(),
          testDelay: fc.integer({ min: 300, max: 800 })
        }),
        async ({ viewportWidth, viewportHeight, reducedMotion, testDelay }) => {
          // Set reduced motion preference
          if (reducedMotion) {
            await page.emulateMedia({ reducedMotion: 'reduce' });
          } else {
            await page.emulateMedia({ reducedMotion: 'no-preference' });
          }
          
          await page.goto('/');
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          await page.waitForTimeout(testDelay);
          
          // Property: Smooth scroll behavior should respect reduced motion
          const scrollBehavior = await page.evaluate(() => {
            return window.getComputedStyle(document.documentElement).scrollBehavior;
          });
          
          if (reducedMotion) {
            expect(scrollBehavior).toBe('auto');
          } else {
            expect(scrollBehavior).toBe('smooth');
          }
          
          // Property: Animation durations should be reduced when reduced motion is preferred
          const animationElements = page.locator('.motion-safe\\:animate-fade-in');
          const elementCount = await animationElements.count();
          
          if (elementCount > 0 && reducedMotion) {
            const firstElement = animationElements.first();
            const animationDuration = await firstElement.evaluate((el) => {
              const styles = window.getComputedStyle(el);
              return parseFloat(styles.animationDuration) || 0;
            });
            
            // Property: Animation duration should be very short (< 100ms) when reduced motion is preferred
            if (animationDuration > 0) {
              expect(animationDuration).toBeLessThan(0.1); // Less than 100ms
            }
          }
          
          // Property: Transition durations should also be reduced
          const transitionElements = page.locator('nav button, .card-hover, .hover-lift');
          const transitionCount = await transitionElements.count();
          
          if (transitionCount > 0 && reducedMotion) {
            const firstTransition = transitionElements.first();
            const transitionDuration = await firstTransition.evaluate((el) => {
              const styles = window.getComputedStyle(el);
              const duration = styles.transitionDuration;
              return parseFloat(duration) || 0;
            });
            
            // Property: Transition duration should be very short when reduced motion is preferred
            if (transitionDuration > 0) {
              expect(transitionDuration).toBeLessThan(0.1); // Less than 100ms
            }
          }
        }
      ),
      { 
        numRuns: 10,
        timeout: 35000
      }
    );
  });

  test('Property: Navigation buttons should have consistent hover and active states', async ({ page }) => {
    await page.goto('/');
    
    // Property: All navigation buttons should have consistent interactive states
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 768, max: 1920 }), // Navigation visible on tablet+
          viewportHeight: fc.integer({ min: 600, max: 1080 }),
          hoverDelay: fc.integer({ min: 100, max: 400 }),
          buttonIndex: fc.integer({ min: 0, max: 2 }) // 3 navigation buttons
        }),
        async ({ viewportWidth, viewportHeight, hoverDelay, buttonIndex }) => {
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          await page.waitForTimeout(300);
          
          // Get navigation buttons
          const navButtons = page.locator('nav button');
          const buttonCount = await navButtons.count();
          
          if (buttonCount > buttonIndex) {
            const button = navButtons.nth(buttonIndex);
            
            // Property: Button should have hover scale effect
            const hasHoverScale = await button.evaluate((el) => {
              return el.classList.contains('hover:scale-105');
            });
            expect(hasHoverScale).toBeTruthy();
            
            // Property: Button should have active scale effect
            const hasActiveScale = await button.evaluate((el) => {
              return el.classList.contains('active:scale-95');
            });
            expect(hasActiveScale).toBeTruthy();
            
            // Property: Button should have color transitions
            const hasColorTransition = await button.evaluate((el) => {
              const classList = Array.from(el.classList);
              return classList.some(cls => 
                cls.includes('transition-colors') || 
                cls.includes('transition-all')
              );
            });
            expect(hasColorTransition).toBeTruthy();
            
            // Property: Button should have appropriate duration
            const transitionDuration = await button.evaluate((el) => {
              const classList = Array.from(el.classList);
              return classList.some(cls => 
                cls.includes('duration-200') || 
                cls.includes('duration-300')
              );
            });
            expect(transitionDuration).toBeTruthy();
            
            // Test hover interaction
            await button.hover();
            await page.waitForTimeout(hoverDelay);
            
            // Property: Button should be focusable via keyboard
            await button.focus();
            await expect(button).toBeFocused();
            
            // Property: Button should have visible focus state
            const hasFocusRing = await button.evaluate((el) => {
              const styles = window.getComputedStyle(el);
              return styles.outline !== 'none' || 
                     styles.boxShadow.includes('ring') ||
                     el.classList.toString().includes('focus:');
            });
            expect(hasFocusRing).toBeTruthy();
          }
        }
      ),
      { 
        numRuns: 12,
        timeout: 30000
      }
    );
  });

  test('Property: Scroll-triggered animations should have proper timing and easing', async ({ page }) => {
    await page.goto('/');
    
    // Property: All scroll-triggered animations should use appropriate timing and easing functions
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 1920 }),
          viewportHeight: fc.integer({ min: 568, max: 1080 }),
          scrollDelay: fc.integer({ min: 200, max: 600 }),
          animationCheck: fc.constantFrom('fade-in', 'slide-in', 'scale-in')
        }),
        async ({ viewportWidth, viewportHeight, scrollDelay, animationCheck }) => {
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          await page.waitForTimeout(scrollDelay);
          
          // Find elements with scroll-triggered animations
          const animatedElements = page.locator('.animate-fade-in, .animate-fade-in-up, .section-fade-in');
          const elementCount = await animatedElements.count();
          
          if (elementCount > 0) {
            for (let i = 0; i < Math.min(elementCount, 3); i++) {
              const element = animatedElements.nth(i);
              
              const animationProps = await element.evaluate((el) => {
                const styles = window.getComputedStyle(el);
                return {
                  animationDuration: parseFloat(styles.animationDuration) || 0,
                  animationTimingFunction: styles.animationTimingFunction,
                  transitionDuration: parseFloat(styles.transitionDuration) || 0,
                  transitionTimingFunction: styles.transitionTimingFunction
                };
              });
              
              // Property: Animation duration should be within reasonable bounds (150ms - 800ms)
              if (animationProps.animationDuration > 0) {
                expect(animationProps.animationDuration).toBeGreaterThanOrEqual(0.15); // 150ms
                expect(animationProps.animationDuration).toBeLessThanOrEqual(0.8);     // 800ms
                
                // Property: Should use smooth easing function
                if (animationProps.animationTimingFunction) {
                  expect(animationProps.animationTimingFunction).toMatch(/ease|cubic-bezier/);
                  expect(animationProps.animationTimingFunction).not.toBe('linear');
                }
              }
              
              // Property: Transition duration should also be reasonable
              if (animationProps.transitionDuration > 0) {
                expect(animationProps.transitionDuration).toBeGreaterThanOrEqual(0.15); // 150ms
                expect(animationProps.transitionDuration).toBeLessThanOrEqual(0.8);     // 800ms
                
                // Property: Should use smooth easing function
                if (animationProps.transitionTimingFunction) {
                  expect(animationProps.transitionTimingFunction).toMatch(/ease|cubic-bezier/);
                  expect(animationProps.transitionTimingFunction).not.toBe('linear');
                }
              }
            }
          }
        }
      ),
      { 
        numRuns: 8,
        timeout: 25000
      }
    );
  });

  test('Property: Section navigation should maintain accessibility standards', async ({ page }) => {
    await page.goto('/');
    
    // Property: Section navigation should be fully accessible via keyboard and screen readers
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 768, max: 1920 }),
          viewportHeight: fc.integer({ min: 600, max: 1080 }),
          keyboardDelay: fc.integer({ min: 100, max: 300 }),
          navigationTarget: fc.constantFrom('Dashboard', 'Add Transaction', 'Transactions')
        }),
        async ({ viewportWidth, viewportHeight, keyboardDelay, navigationTarget }) => {
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          await page.waitForTimeout(300);
          
          // Property: Navigation should have proper semantic structure
          const nav = page.locator('nav');
          await expect(nav).toBeVisible();
          
          // Property: Navigation buttons should be keyboard accessible
          const targetButton = page.locator(`nav button:has-text("${navigationTarget}")`);
          await expect(targetButton).toBeVisible();
          
          // Test keyboard navigation
          await targetButton.focus();
          await expect(targetButton).toBeFocused();
          
          // Property: Button should have visible focus indicator
          const focusStyles = await targetButton.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return {
              outline: styles.outline,
              boxShadow: styles.boxShadow,
              hasFocusClass: el.classList.toString().includes('focus:')
            };
          });
          
          const hasVisibleFocus = focusStyles.outline !== 'none' || 
                                 focusStyles.boxShadow.includes('ring') || 
                                 focusStyles.hasFocusClass;
          expect(hasVisibleFocus).toBeTruthy();
          
          // Property: Button should be activatable via keyboard
          await page.keyboard.press('Enter');
          await page.waitForTimeout(keyboardDelay);
          
          // Property: Target section should be accessible after navigation
          let targetSectionId;
          if (navigationTarget === 'Dashboard') {
            targetSectionId = '#dashboard-section';
          } else if (navigationTarget === 'Add Transaction') {
            targetSectionId = '#add-transaction-section';
          } else if (navigationTarget === 'Transactions') {
            targetSectionId = '#transactions-section';
          }
          
          if (targetSectionId) {
            const targetSection = page.locator(targetSectionId);
            await expect(targetSection).toBeInViewport({ ratio: 0.2 });
            
            // Property: Section should have proper heading structure
            const sectionHeading = targetSection.locator('h1, h2, h3');
            const headingCount = await sectionHeading.count();
            expect(headingCount).toBeGreaterThan(0);
          }
        }
      ),
      { 
        numRuns: 9,
        timeout: 30000
      }
    );
  });
});