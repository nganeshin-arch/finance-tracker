/**
 * Validation script for Task 1.7: Global CSS Design System
 * 
 * This script validates that all required design system variables and utilities
 * are properly defined in the global CSS file (index.css).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the index.css file
const cssPath = path.join(__dirname, '..', 'src', 'index.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

console.log('🔍 Validating Global CSS Design System (Task 1.7)...\n');

let allTestsPassed = true;

// Test 1: Check for CSS custom properties
console.log('Test 1: CSS Custom Properties');
const requiredCustomProperties = [
  '--font-weight-normal',
  '--font-weight-medium',
  '--font-weight-semibold',
  '--font-weight-bold',
  '--font-weight-extrabold',
  '--line-height-body',
  '--line-height-heading',
  '--duration-fast',
  '--duration-normal',
  '--duration-medium',
  '--duration-slow',
  '--ease-smooth',
  '--ease-bounce',
  '--shadow-sm',
  '--shadow-md',
  '--shadow-lg',
  '--shadow-xl',
  '--gradient-primary',
  '--gradient-accent',
  '--gradient-success',
  '--gradient-danger',
  '--gradient-warning',
  '--gradient-info',
  '--gradient-premium',
  '--gradient-income',
  '--gradient-expense',
  '--gradient-neutral',
];

const missingProperties = requiredCustomProperties.filter(prop => !cssContent.includes(prop));
if (missingProperties.length === 0) {
  console.log('  ✅ All required CSS custom properties are defined');
} else {
  console.log('  ❌ Missing custom properties:', missingProperties.join(', '));
  allTestsPassed = false;
}

// Test 2: Check for typography base styles
console.log('\nTest 2: Typography Base Styles');
const typographyChecks = [
  { name: 'Heading styles (h1-h6)', pattern: /h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6/ },
  { name: 'Body text line-height', pattern: /line-height:\s*1\.5/ },
  { name: 'Financial value styling', pattern: /\.financial-/ },
];

typographyChecks.forEach(check => {
  if (check.pattern.test(cssContent)) {
    console.log(`  ✅ ${check.name} defined`);
  } else {
    console.log(`  ❌ ${check.name} missing`);
    allTestsPassed = false;
  }
});

// Test 3: Check for dark mode support
console.log('\nTest 3: Dark Mode Theme Switching');
const darkModeChecks = [
  { name: '.dark class selector', pattern: /\.dark\s*{/ },
  { name: '[data-theme="dark"] attribute selector', pattern: /\[data-theme="dark"\]/ },
];

darkModeChecks.forEach(check => {
  if (check.pattern.test(cssContent)) {
    console.log(`  ✅ ${check.name} defined`);
  } else {
    console.log(`  ❌ ${check.name} missing`);
    allTestsPassed = false;
  }
});

// Test 4: Check for utility classes
console.log('\nTest 4: Utility Classes');
const utilityClasses = [
  // Typography utilities
  '.font-weight-normal',
  '.font-weight-bold',
  '.leading-body',
  '.leading-heading',
  '.heading-premium',
  '.body-premium',
  '.stat-premium',
  '.financial-value',
  '.financial-label',
  // Gradient utilities
  '.bg-gradient-primary',
  '.bg-gradient-accent',
  '.bg-gradient-success',
  '.text-gradient-primary',
  '.text-gradient-accent',
  // Shadow utilities
  '.shadow-premium',
  '.shadow-glow-primary',
  // Transition utilities
  '.transition-smooth',
  '.hover-lift',
  '.focus-ring',
  '.active-scale',
];

const missingUtilities = utilityClasses.filter(cls => !cssContent.includes(cls));
if (missingUtilities.length === 0) {
  console.log('  ✅ All required utility classes are defined');
} else {
  console.log('  ❌ Missing utility classes:', missingUtilities.join(', '));
  allTestsPassed = false;
}

// Test 5: Check for Inter font loading
console.log('\nTest 5: Inter Font Loading');
const fontChecks = [
  { name: 'Inter font import', pattern: /@import.*Inter/ },
  { name: 'font-display: swap', pattern: /display=swap/ },
];

fontChecks.forEach(check => {
  if (check.pattern.test(cssContent)) {
    console.log(`  ✅ ${check.name} configured`);
  } else {
    console.log(`  ❌ ${check.name} missing`);
    allTestsPassed = false;
  }
});

// Test 6: Check for reduced motion support
console.log('\nTest 6: Accessibility - Reduced Motion');
if (cssContent.includes('prefers-reduced-motion')) {
  console.log('  ✅ Reduced motion support implemented');
} else {
  console.log('  ❌ Reduced motion support missing');
  allTestsPassed = false;
}

// Test 7: Check for @layer directives
console.log('\nTest 7: CSS Layer Organization');
const layers = ['@layer base', '@layer components', '@layer utilities'];
const missingLayers = layers.filter(layer => !cssContent.includes(layer));
if (missingLayers.length === 0) {
  console.log('  ✅ All CSS layers properly organized');
} else {
  console.log('  ❌ Missing layers:', missingLayers.join(', '));
  allTestsPassed = false;
}

// Final summary
console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED - Task 1.7 Complete!');
  console.log('\nThe global CSS design system has been successfully updated with:');
  console.log('  • CSS custom properties for all design tokens');
  console.log('  • Base styles for typography (headings, body text, financial values)');
  console.log('  • Dark mode theme switching logic');
  console.log('  • Utility classes for common patterns (shadows, gradients, transitions)');
  console.log('  • Inter font with font-display: swap');
  console.log('\nRequirements validated: 10.1, 10.2, 10.3, 10.4');
} else {
  console.log('❌ SOME TESTS FAILED - Please review the errors above');
  process.exit(1);
}
console.log('='.repeat(60));
