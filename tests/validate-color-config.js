/**
 * Validation script for Task 1.3: Enhanced Color System
 * 
 * This script validates:
 * 1. Extended color palette shades (50-950) exist for all color families
 * 2. Gradient CSS custom properties are defined
 * 3. Dark mode support is configured
 * 4. Gradient utility classes are available
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read Tailwind config
const tailwindConfigPath = join(__dirname, '..', 'tailwind.config.js');
const tailwindConfig = readFileSync(tailwindConfigPath, 'utf-8');

// Read CSS file
const cssPath = join(__dirname, '..', 'src', 'index.css');
const cssContent = readFileSync(cssPath, 'utf-8');

console.log('🔍 Validating Enhanced Color System Configuration...\n');

// Test 1: Validate extended color palette shades
console.log('✓ Test 1: Extended Color Palette Shades (50-950)');
const colorFamilies = [
  'primary', 'secondary', 'destructive', 'muted', 'accent',
  'income', 'expense', 'neutral', 'success', 'warning', 'danger', 'info'
];

const requiredShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

let allShadesPresent = true;
colorFamilies.forEach(family => {
  const missingShades = [];
  requiredShades.forEach(shade => {
    const pattern = new RegExp(`${family}:\\s*{[^}]*${shade}:\\s*["']#[0-9a-fA-F]{6}["']`, 's');
    if (!pattern.test(tailwindConfig)) {
      missingShades.push(shade);
    }
  });
  
  if (missingShades.length === 0) {
    console.log(`  ✓ ${family}: All shades (50-950) present`);
  } else {
    console.log(`  ✗ ${family}: Missing shades: ${missingShades.join(', ')}`);
    allShadesPresent = false;
  }
});

if (allShadesPresent) {
  console.log('  ✅ All color families have complete shade ranges\n');
} else {
  console.log('  ❌ Some color families are missing shades\n');
}

// Test 2: Validate gradient CSS custom properties
console.log('✓ Test 2: Gradient CSS Custom Properties');
const gradients = [
  'gradient-primary', 'gradient-accent', 'gradient-success', 'gradient-danger',
  'gradient-warning', 'gradient-info', 'gradient-premium',
  'gradient-income', 'gradient-expense', 'gradient-neutral'
];

let allGradientsPresent = true;
gradients.forEach(gradient => {
  const lightModePattern = new RegExp(`--${gradient}:\\s*linear-gradient`);
  const darkModePattern = new RegExp(`\\.dark[^}]*--${gradient}:\\s*linear-gradient`, 's');
  const dataThemePattern = new RegExp(`\\[data-theme="dark"\\][^}]*--${gradient}:\\s*linear-gradient`, 's');
  
  const hasLightMode = lightModePattern.test(cssContent);
  const hasDarkMode = darkModePattern.test(cssContent) || dataThemePattern.test(cssContent);
  
  if (hasLightMode && hasDarkMode) {
    console.log(`  ✓ ${gradient}: Light and dark mode variants present`);
  } else {
    console.log(`  ✗ ${gradient}: Missing ${!hasLightMode ? 'light mode' : ''} ${!hasDarkMode ? 'dark mode' : ''}`);
    allGradientsPresent = false;
  }
});

if (allGradientsPresent) {
  console.log('  ✅ All gradient custom properties defined for light and dark modes\n');
} else {
  console.log('  ❌ Some gradient custom properties are missing\n');
}

// Test 3: Validate dark mode support
console.log('✓ Test 3: Dark Mode Support');
const hasDarkClass = /\.dark\s*{/.test(cssContent);
const hasDataTheme = /\[data-theme="dark"\]\s*{/.test(cssContent);

if (hasDarkClass) {
  console.log('  ✓ .dark class support: Present');
} else {
  console.log('  ✗ .dark class support: Missing');
}

if (hasDataTheme) {
  console.log('  ✓ [data-theme="dark"] support: Present');
} else {
  console.log('  ✗ [data-theme="dark"] support: Missing');
}

if (hasDarkClass && hasDataTheme) {
  console.log('  ✅ Dual dark mode support configured\n');
} else {
  console.log('  ❌ Dark mode support incomplete\n');
}

// Test 4: Validate gradient utility classes
console.log('✓ Test 4: Gradient Utility Classes');
const hasBackgroundImageConfig = /backgroundImage:\s*{/.test(tailwindConfig);
const hasCssUtilities = gradients.every(gradient => {
  const pattern = new RegExp(`\\.bg-${gradient}\\s*{[^}]*background-image:\\s*var\\(--${gradient}\\)`, 's');
  return pattern.test(cssContent);
});

if (hasBackgroundImageConfig) {
  console.log('  ✓ Tailwind backgroundImage configuration: Present');
} else {
  console.log('  ✗ Tailwind backgroundImage configuration: Missing');
}

if (hasCssUtilities) {
  console.log('  ✓ CSS utility classes: All present');
} else {
  console.log('  ✗ CSS utility classes: Some missing');
}

if (hasBackgroundImageConfig && hasCssUtilities) {
  console.log('  ✅ Gradient utility classes configured\n');
} else {
  console.log('  ❌ Gradient utility classes incomplete\n');
}

// Final summary
console.log('═══════════════════════════════════════════════════════');
if (allShadesPresent && allGradientsPresent && hasDarkClass && hasDataTheme && hasBackgroundImageConfig && hasCssUtilities) {
  console.log('✅ ALL VALIDATIONS PASSED');
  console.log('Task 1.3: Enhanced Color System is complete and correct');
} else {
  console.log('❌ SOME VALIDATIONS FAILED');
  console.log('Please review the output above for details');
}
console.log('═══════════════════════════════════════════════════════');
