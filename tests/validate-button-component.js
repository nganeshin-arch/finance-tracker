/**
 * Button Component Validation Script
 * Task 3.1: Enhanced Button Component with Premium Styling
 * 
 * This script validates that the Button component implementation
 * meets all requirements from the premium-ui-enhancement spec.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the button component file
const buttonPath = join(__dirname, '../src/components/ui/button.tsx');
const buttonContent = readFileSync(buttonPath, 'utf-8');

console.log('🔍 Validating Button Component Implementation...\n');

// Validation checks
const checks = {
  'Gradient Primary Variant': {
    pattern: /bg-gradient-primary/,
    requirement: '4.1 - Primary variant with gradient background',
    passed: false
  },
  'Gradient Danger Variant': {
    pattern: /bg-gradient-danger/,
    requirement: '4.1 - Destructive variant with gradient background',
    passed: false
  },
  'Hover Scale Transform': {
    pattern: /hover:scale-\[1\.02\]/,
    requirement: '4.2 - Hover state with scale transform (1.02)',
    passed: false
  },
  'Hover Shadow Enhancement': {
    pattern: /hover:shadow-lg/,
    requirement: '4.2 - Hover state with shadow enhancement',
    passed: false
  },
  'Focus Visible Ring': {
    pattern: /focus-visible:ring-2/,
    requirement: '4.3 - Focus state with visible ring',
    passed: false
  },
  'Focus Ring Offset': {
    pattern: /focus-visible:ring-offset-2/,
    requirement: '4.3 - Focus state with 2px offset',
    passed: false
  },
  'Active Scale Transform': {
    pattern: /active:scale-\[0\.98\]/,
    requirement: '4.4 - Active state with scale transform (0.98)',
    passed: false
  },
  'Disabled Opacity': {
    pattern: /disabled:opacity-50/,
    requirement: '4.5 - Disabled state with opacity 0.5',
    passed: false
  },
  'Disabled Pointer Events': {
    pattern: /disabled:pointer-events-none/,
    requirement: '4.5 - Disabled state with pointer-events none',
    passed: false
  },
  'Transition Duration': {
    pattern: /duration-200/,
    requirement: 'Smooth transitions (200ms)',
    passed: false
  },
  'Transition Easing': {
    pattern: /ease-smooth/,
    requirement: 'Smooth transitions (ease-smooth)',
    passed: false
  },
  'Semibold Font Weight': {
    pattern: /font-semibold/,
    requirement: 'Premium typography (font-semibold)',
    passed: false
  },
  'Outline Variant': {
    pattern: /variant:\s*{\s*[^}]*outline:/,
    requirement: '4.1 - Outline variant',
    passed: false
  },
  'Secondary Variant': {
    pattern: /variant:\s*{\s*[^}]*secondary:/,
    requirement: '4.1 - Secondary variant',
    passed: false
  },
  'Ghost Variant': {
    pattern: /variant:\s*{\s*[^}]*ghost:/,
    requirement: '4.1 - Ghost variant',
    passed: false
  }
};

// Run validation checks
let passedCount = 0;
let failedCount = 0;

console.log('📋 Validation Results:\n');

for (const [checkName, check] of Object.entries(checks)) {
  check.passed = check.pattern.test(buttonContent);
  
  if (check.passed) {
    console.log(`✅ ${checkName}`);
    console.log(`   Requirement: ${check.requirement}\n`);
    passedCount++;
  } else {
    console.log(`❌ ${checkName}`);
    console.log(`   Requirement: ${check.requirement}`);
    console.log(`   Pattern: ${check.pattern}\n`);
    failedCount++;
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Validation Summary');
console.log('='.repeat(60));
console.log(`Total Checks: ${passedCount + failedCount}`);
console.log(`✅ Passed: ${passedCount}`);
console.log(`❌ Failed: ${failedCount}`);
console.log(`Success Rate: ${((passedCount / (passedCount + failedCount)) * 100).toFixed(1)}%`);

if (failedCount === 0) {
  console.log('\n🎉 All validation checks passed!');
  console.log('The Button component meets all requirements for Task 3.1.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some validation checks failed.');
  console.log('Please review the implementation.\n');
  process.exit(1);
}
