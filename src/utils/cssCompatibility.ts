/**
 * CSS Compatibility Testing Utilities
 * Tests for CSS feature support across different browsers
 */

export interface CSSFeatureTest {
  name: string;
  property: string;
  value: string;
  supported: boolean;
}

/**
 * Tests critical CSS features used in the application
 */
export function testCSSFeatures(): CSSFeatureTest[] {
  const features = [
    // Layout
    { name: 'Flexbox', property: 'display', value: 'flex' },
    { name: 'Grid', property: 'display', value: 'grid' },
    { name: 'Gap (Flexbox)', property: 'gap', value: '1rem' },
    
    // Visual Effects
    { name: 'Backdrop Filter', property: 'backdrop-filter', value: 'blur(10px)' },
    { name: 'Box Shadow', property: 'box-shadow', value: '0 0 10px rgba(0,0,0,0.1)' },
    { name: 'Border Radius', property: 'border-radius', value: '8px' },
    
    // Transforms & Animations
    { name: 'Transform', property: 'transform', value: 'scale(1.05)' },
    { name: 'Transition', property: 'transition', value: 'all 0.3s ease' },
    { name: 'Animation', property: 'animation', value: 'spin 1s linear infinite' },
    
    // Modern CSS
    { name: 'Custom Properties', property: '--custom', value: 'value' },
    { name: 'Calc', property: 'width', value: 'calc(100% - 20px)' },
    { name: 'Clamp', property: 'width', value: 'clamp(10px, 50%, 100px)' },
    
    // Colors
    { name: 'RGB', property: 'color', value: 'rgb(255, 0, 0)' },
    { name: 'RGBA', property: 'color', value: 'rgba(255, 0, 0, 0.5)' },
    { name: 'HSL', property: 'color', value: 'hsl(0, 100%, 50%)' },
    
    // Positioning
    { name: 'Sticky Position', property: 'position', value: 'sticky' },
    { name: 'Fixed Position', property: 'position', value: 'fixed' },
    
    // Typography
    { name: 'Font Feature Settings', property: 'font-feature-settings', value: '"liga" 1' },
    { name: 'Text Overflow', property: 'text-overflow', value: 'ellipsis' },
  ];

  return features.map((feature) => ({
    ...feature,
    supported: CSS.supports(feature.property, feature.value),
  }));
}

/**
 * Tests for vendor-prefixed properties that might be needed
 */
export function testVendorPrefixes(): Record<string, boolean> {
  const prefixes = ['-webkit-', '-moz-', '-ms-', '-o-'];
  const properties = ['backdrop-filter', 'user-select', 'appearance'];
  
  const results: Record<string, boolean> = {};
  
  properties.forEach((prop) => {
    // Test standard property
    results[prop] = CSS.supports(prop, 'none');
    
    // Test prefixed versions
    prefixes.forEach((prefix) => {
      const prefixedProp = prefix + prop;
      results[prefixedProp] = CSS.supports(prefixedProp, 'none');
    });
  });
  
  return results;
}

/**
 * Checks for Tailwind CSS-specific features
 */
export function testTailwindFeatures(): Record<string, boolean> {
  return {
    // Check if Tailwind classes are being applied
    tailwindLoaded: (() => {
      const testDiv = document.createElement('div');
      testDiv.className = 'flex';
      document.body.appendChild(testDiv);
      const computed = window.getComputedStyle(testDiv);
      const isFlexbox = computed.display === 'flex';
      document.body.removeChild(testDiv);
      return isFlexbox;
    })(),
    
    // Check for dark mode support
    darkModeSupported: window.matchMedia('(prefers-color-scheme: dark)').matches !== undefined,
    
    // Check for reduced motion preference
    reducedMotionSupported: window.matchMedia('(prefers-reduced-motion: reduce)').matches !== undefined,
  };
}

/**
 * Logs CSS compatibility information to console
 */
export function logCSSCompatibility(): void {
  const features = testCSSFeatures();
  const vendorPrefixes = testVendorPrefixes();
  const tailwindFeatures = testTailwindFeatures();
  
  console.group('CSS Feature Support');
  features.forEach((feature) => {
    const icon = feature.supported ? '✓' : '✗';
    console.log(`${icon} ${feature.name}:`, feature.supported);
  });
  console.groupEnd();
  
  console.group('Vendor Prefix Support');
  Object.entries(vendorPrefixes).forEach(([prop, supported]) => {
    if (supported) {
      console.log(`✓ ${prop}`);
    }
  });
  console.groupEnd();
  
  console.group('Tailwind CSS Features');
  Object.entries(tailwindFeatures).forEach(([feature, supported]) => {
    const icon = supported ? '✓' : '✗';
    console.log(`${icon} ${feature}:`, supported);
  });
  console.groupEnd();
}

/**
 * Gets unsupported features that might need polyfills or fallbacks
 */
export function getUnsupportedFeatures(): string[] {
  const features = testCSSFeatures();
  return features.filter((f) => !f.supported).map((f) => f.name);
}
