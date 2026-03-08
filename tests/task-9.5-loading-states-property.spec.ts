/**
 * Task 9.5: Loading States Property-Based Test
 * 
 * Property-based test for loading state animations and transitions.
 * Tests universal properties that should hold across all loading scenarios.
 * 
 * **Validates: Requirements 9.5, 3.5**
 * **Property 10: Loading Animation Presence**
 * 
 * For any content that loads asynchronously, when the loading state is active,
 * the UI should display fade-in or slide-in animations, or skeleton screens/spinners.
 */

import { test, expect } from '@playwright/test';
import fc from 'fast-check';

test.describe('Task 9.5: Loading States Property-Based Tests', () => {
  
  test('Property 10: Loading Animation Presence - All async content should show loading animations', async ({ page }) => {
    await page.goto('/');
    
    // Property: For any content that loads asynchronously, loading states should be present
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          reloadCount: fc.integer({ min: 1, max: 5 }),
          waitTime: fc.integer({ min: 100, max: 1000 }),
          viewportWidth: fc.integer({ min: 320, max: 1920 }),
          viewportHeight: fc.integer({ min: 568, max: 1080 })
        }),
        async ({ reloadCount, waitTime, viewportWidth, viewportHeight }) => {
          // Set random viewport size
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          
          // Perform multiple reloads to test loading states
          for (let i = 0; i < reloadCount; i++) {
            await page.reload();
            
            // Wait a random amount of time to catch different loading phases
            await page.waitForTimeout(waitTime);
            
            // Check for loading indicators or loaded content
            const hasSkeletonLoading = await page.locator('.animate-shimmer, .animate-pulse').count() > 0;
            const hasSpinnerLoading = await page.locator('[role="status"], .animate-spin').count() > 0;
            const hasLoadedContent = await page.locator('[id="dashboard-section"]').isVisible();
            const hasFadeInAnimations = await page.locator('.animate-fade-in, [class*="fade-in"]').count() > 0;
            
            // Property: Either loading indicators are present OR content is loaded with animations
            const hasLoadingStates = hasSkeletonLoading || hasSpinnerLoading;
            const hasContentWithAnimations = hasLoadedContent && hasFadeInAnimations;
            
            // The property should hold: loading states OR loaded content with animations
            expect(hasLoadingStates || hasContentWithAnimations).toBeTruthy();
          }
        }
      ),
      { 
        numRuns: 10,
        timeout: 30000,
        verbose: true
      }
    );
  });

  test('Property: Skeleton screens should have consistent structure across viewport sizes', async ({ page }) => {
    await page.goto('/');
    
    // Property: Skeleton loading elements should maintain consistent structure
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 1920 }),
          viewportHeight: fc.integer({ min: 568, max: 1080 }),
          sectionType: fc.constantFrom('dashboard', 'transactions', 'charts')
        }),
        async ({ viewportWidth, viewportHeight, sectionType }) => {
          await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
          await page.reload();
          
          // Wait briefly to catch loading states
          await page.waitForTimeout(200);
          
          // Check for skeleton elements
          const skeletonElements = page.locator('.animate-shimmer');
          const skeletonCount = await skeletonElements.count();
          
          if (skeletonCount > 0) {
            // Property: All skeleton elements should have proper dimensions
            for (let i = 0; i < Math.min(skeletonCount, 5); i++) {
              const skeleton = skeletonElements.nth(i);
              const boundingBox = await skeleton.boundingBox();
              
              if (boundingBox) {
                // Skeleton elements should have reasonable dimensions
                expect(boundingBox.width).toBeGreaterThan(0);
                expect(boundingBox.height).toBeGreaterThan(0);
                expect(boundingBox.width).toBeLessThan(viewportWidth);
                expect(boundingBox.height).toBeLessThan(viewportHeight);
              }
            }
            
            // Property: Skeleton elements should have animation classes
            const firstSkeleton = skeletonElements.first();
            const hasAnimationClass = await firstSkeleton.evaluate((el) => {
              return el.className.includes('animate-') || el.className.includes('shimmer');
            });
            expect(hasAnimationClass).toBeTruthy();
          }
        }
      ),
      { 
        numRuns: 8,
        timeout: 25000
      }
    );
  });

  test('Property: Fade-in animations should have appropriate timing', async ({ page }) => {
    await page.goto('/');
    
    // Property: All fade-in animations should use appropriate duration and easing
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          reloadDelay: fc.integer({ min: 0, max: 500 }),
          checkDelay: fc.integer({ min: 100, max: 1000 })
        }),
        async ({ reloadDelay, checkDelay }) => {
          await page.waitForTimeout(reloadDelay);
          await page.reload();
          await page.waitForTimeout(checkDelay);
          
          // Find elements with fade-in animations
          const fadeElements = page.locator('[class*="fade-in"], [class*="animate-fade"]');
          const fadeCount = await fadeElements.count();
          
          if (fadeCount > 0) {
            // Check animation properties for a sample of elements
            const sampleSize = Math.min(fadeCount, 3);
            for (let i = 0; i < sampleSize; i++) {
              const element = fadeElements.nth(i);
              
              const animationProps = await element.evaluate((el) => {
                const styles = window.getComputedStyle(el);
                return {
                  animationDuration: styles.animationDuration,
                  animationTimingFunction: styles.animationTimingFunction,
                  transitionDuration: styles.transitionDuration,
                  transitionTimingFunction: styles.transitionTimingFunction
                };
              });
              
              // Property: Animation/transition durations should be reasonable (150ms - 1000ms)
              const duration = parseFloat(animationProps.animationDuration) || parseFloat(animationProps.transitionDuration) || 0;
              if (duration > 0) {
                expect(duration).toBeGreaterThanOrEqual(0.15); // 150ms
                expect(duration).toBeLessThanOrEqual(1.0);     // 1000ms
              }
              
              // Property: Should use smooth easing functions
              const timingFunction = animationProps.animationTimingFunction || animationProps.transitionTimingFunction;
              if (timingFunction && timingFunction !== 'linear') {
                expect(timingFunction).toMatch(/ease|cubic-bezier/);
              }
            }
          }
        }
      ),
      { 
        numRuns: 6,
        timeout: 20000
      }
    );
  });

  test('Property: Loading states should be accessible', async ({ page }) => {
    await page.goto('/');
    
    // Property: All loading states should have proper accessibility attributes
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          reloadCount: fc.integer({ min: 1, max: 3 }),
          checkTiming: fc.integer({ min: 50, max: 300 })
        }),
        async ({ reloadCount, checkTiming }) => {
          for (let i = 0; i < reloadCount; i++) {
            await page.reload();
            await page.waitForTimeout(checkTiming);
            
            // Check for loading elements with accessibility attributes
            const loadingElements = page.locator('[role="status"], [aria-live], [aria-label*="Loading"], [aria-label*="loading"]');
            const skeletonElements = page.locator('.animate-shimmer, .animate-pulse');
            
            const loadingCount = await loadingElements.count();
            const skeletonCount = await skeletonElements.count();
            
            // If there are loading states, they should have accessibility attributes
            if (skeletonCount > 0 || loadingCount > 0) {
              // Property: Loading elements should have proper ARIA attributes
              const accessibleElements = await page.locator('[role="status"], [aria-live], [aria-label]').count();
              expect(accessibleElements).toBeGreaterThan(0);
            }
            
            // Check that skeleton elements have proper structure
            if (skeletonCount > 0) {
              const firstSkeleton = skeletonElements.first();
              const hasAccessibilityInfo = await firstSkeleton.evaluate((el) => {
                return el.getAttribute('role') !== null || 
                       el.getAttribute('aria-label') !== null ||
                       el.getAttribute('aria-hidden') !== null;
              });
              
              // Property: Skeleton elements should have accessibility information
              expect(hasAccessibilityInfo).toBeTruthy();
            }
          }
        }
      ),
      { 
        numRuns: 5,
        timeout: 15000
      }
    );
  });

  test('Property: Staggered animations should have increasing delays', async ({ page }) => {
    await page.goto('/');
    
    // Property: Staggered animations should have progressively increasing delays
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          waitTime: fc.integer({ min: 100, max: 500 })
        }),
        async ({ waitTime }) => {
          await page.reload();
          await page.waitForTimeout(waitTime);
          
          // Find elements with staggered animations (dashboard cards)
          const staggeredElements = page.locator('.dashboard-grid > *, [style*="animation-delay"]');
          const staggerCount = await staggeredElements.count();
          
          if (staggerCount > 1) {
            // Collect animation delays
            const delays = [];
            for (let i = 0; i < Math.min(staggerCount, 4); i++) {
              const element = staggeredElements.nth(i);
              const delay = await element.evaluate((el) => {
                const inlineDelay = el.style.animationDelay;
                const computedDelay = window.getComputedStyle(el).animationDelay;
                return inlineDelay || computedDelay || '0s';
              });
              
              // Convert delay to milliseconds
              const delayMs = parseFloat(delay) * (delay.includes('ms') ? 1 : 1000);
              delays.push(delayMs);
            }
            
            // Property: Delays should generally increase (allowing for some flexibility)
            if (delays.length > 1) {
              let increasingCount = 0;
              for (let i = 1; i < delays.length; i++) {
                if (delays[i] >= delays[i - 1]) {
                  increasingCount++;
                }
              }
              
              // At least half of the delays should be increasing (staggered effect)
              const increasingRatio = increasingCount / (delays.length - 1);
              expect(increasingRatio).toBeGreaterThanOrEqual(0.5);
            }
          }
        }
      ),
      { 
        numRuns: 4,
        timeout: 12000
      }
    );
  });
});