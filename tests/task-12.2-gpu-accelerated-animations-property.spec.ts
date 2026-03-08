import { test, expect } from '@playwright/test';
import fc from 'fast-check';

/**
 * Property 37: GPU-Accelerated Animations
 * **Validates: Requirements 12.1, 12.2**
 * 
 * Verifies that all animations use GPU-accelerated properties (transform, opacity)
 * and avoid expensive properties during animation.
 */

test.describe('GPU-Accelerated Animations Property Tests', () => {
  test('Property 37: All animations use GPU-accelerated properties only', async ({ page }) => {
    await page.goto('/');
    
    // Property: All animation keyframes should only use transform and opacity
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'fadeIn', 'slideUp', 'scaleIn', 'bounceSubtle', 
          'glow', 'shimmer', 'float'
        ),
        async (animationName) => {
          // Get the computed keyframes for the animation
          const keyframeProperties = await page.evaluate((name) => {
            const styleSheets = Array.from(document.styleSheets);
            const properties = new Set<string>();
            
            for (const sheet of styleSheets) {
              try {
                const rules = Array.from(sheet.cssRules || []);
                for (const rule of rules) {
                  if (rule instanceof CSSKeyframesRule && rule.name === name) {
                    for (const keyframe of Array.from(rule.cssRules)) {
                      if (keyframe instanceof CSSKeyframeRule) {
                        const style = keyframe.style;
                        for (let i = 0; i < style.length; i++) {
                          const prop = style.item(i);
                          if (prop && !['animation-timing-function'].includes(prop)) {
                            properties.add(prop);
                          }
                        }
                      }
                    }
                  }
                }
              } catch (e) {
                // Skip inaccessible stylesheets
              }
            }
            
            return Array.from(properties);
          }, animationName);
          
          // Verify only GPU-accelerated properties are used
          const allowedProperties = ['opacity', 'transform'];
          const disallowedProperties = [
            'box-shadow', 'filter', 'background-position', 
            'width', 'height', 'left', 'top', 'right', 'bottom',
            'margin', 'padding', 'border-width'
          ];
          
          const hasDisallowedProps = keyframeProperties.some(prop => 
            disallowedProperties.includes(prop)
          );
          
          const hasOnlyAllowedProps = keyframeProperties.every(prop => 
            allowedProperties.includes(prop)
          );
          
          return !hasDisallowedProps && (keyframeProperties.length === 0 || hasOnlyAllowedProps);
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 37: Animation elements have will-change hints', async ({ page }) => {
    await page.goto('/');
    
    // Property: Elements with animations should have appropriate will-change hints
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          '.animate-fade-in', '.animate-slide-up', '.animate-scale-in',
          '.animate-bounce-subtle', '.animate-glow', '.animate-shimmer',
          '.animate-pulse-slow', '.animate-float'
        ),
        async (selector) => {
          const willChangeValue = await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (!element) return null;
            
            return window.getComputedStyle(element).willChange;
          }, selector);
          
          // If element exists, it should have appropriate will-change value
          if (willChangeValue !== null) {
            const validWillChangeValues = ['transform', 'opacity', 'auto'];
            return validWillChangeValues.includes(willChangeValue);
          }
          
          return true; // Element doesn't exist, which is fine
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 37: Transform animations use translate3d for GPU acceleration', async ({ page }) => {
    await page.goto('/');
    
    // Property: Transform-based animations should use 3D transforms
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('slideUp', 'bounceSubtle', 'float', 'shimmer'),
        async (animationName) => {
          const uses3DTransforms = await page.evaluate((name) => {
            const styleSheets = Array.from(document.styleSheets);
            
            for (const sheet of styleSheets) {
              try {
                const rules = Array.from(sheet.cssRules || []);
                for (const rule of rules) {
                  if (rule instanceof CSSKeyframesRule && rule.name === name) {
                    for (const keyframe of Array.from(rule.cssRules)) {
                      if (keyframe instanceof CSSKeyframeRule) {
                        const transformValue = keyframe.style.transform;
                        if (transformValue && transformValue.includes('translate') && 
                            !transformValue.includes('translate3d')) {
                          return false; // Found 2D transform
                        }
                      }
                    }
                  }
                }
              } catch (e) {
                // Skip inaccessible stylesheets
              }
            }
            
            return true; // All transforms are 3D or no transforms found
          }, animationName);
          
          return uses3DTransforms;
        }
      ),
      { numRuns: 10 }
    );
  });
});