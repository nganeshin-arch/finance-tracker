/**
 * Input Component Validation Script
 * Validates that the enhanced Input component meets all requirements from Task 5.1
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateInputComponent() {
  log('\n=== Input Component Validation ===\n', 'cyan');
  
  const inputPath = path.join(__dirname, '../src/components/ui/input.tsx');
  const selectPath = path.join(__dirname, '../src/components/ui/select.tsx');
  
  let passed = 0;
  let failed = 0;
  
  // Check if files exist
  if (!fs.existsSync(inputPath)) {
    log('✗ Input component file not found', 'red');
    failed++;
    return;
  }
  
  const inputContent = fs.readFileSync(inputPath, 'utf-8');
  const selectContent = fs.existsSync(selectPath) ? fs.readFileSync(selectPath, 'utf-8') : '';
  
  // Test 1: Check for consistent sizing (h-12, px-4)
  log('Test 1: Consistent sizing (h-12, px-4)', 'blue');
  if (inputContent.includes('h-12') && inputContent.includes('px-4')) {
    log('  ✓ Input has h-12 height and px-4 padding', 'green');
    passed++;
  } else {
    log('  ✗ Input missing h-12 or px-4 sizing', 'red');
    failed++;
  }
  
  // Test 2: Check for focus state with border color change
  log('\nTest 2: Focus state with border color change', 'blue');
  if (inputContent.includes('focus-visible:border-ring') || inputContent.includes('focus:border-ring')) {
    log('  ✓ Focus state changes border color', 'green');
    passed++;
  } else {
    log('  ✗ Focus state border color change not found', 'red');
    failed++;
  }
  
  // Test 3: Check for focus glow effect (box-shadow)
  log('\nTest 3: Focus state with subtle glow (box-shadow)', 'blue');
  if (inputContent.includes('focus-visible:shadow') || inputContent.includes('box-shadow')) {
    log('  ✓ Focus state includes glow effect', 'green');
    passed++;
  } else {
    log('  ✗ Focus glow effect not found', 'red');
    failed++;
  }
  
  // Test 4: Check for error state
  log('\nTest 4: Error state with red border', 'blue');
  if (inputContent.includes('error') && (inputContent.includes('destructive') || inputContent.includes('red'))) {
    log('  ✓ Error state variant exists', 'green');
    passed++;
  } else {
    log('  ✗ Error state not properly implemented', 'red');
    failed++;
  }
  
  // Test 5: Check for error message display
  log('\nTest 5: Error message display', 'blue');
  if (inputContent.includes('error') && inputContent.includes('role="alert"')) {
    log('  ✓ Error message with proper ARIA attributes', 'green');
    passed++;
  } else {
    log('  ✗ Error message display not found', 'red');
    failed++;
  }
  
  // Test 6: Check for success state
  log('\nTest 6: Success state with green border', 'blue');
  if (inputContent.includes('success') && inputContent.includes('success-')) {
    log('  ✓ Success state variant exists', 'green');
    passed++;
  } else {
    log('  ✗ Success state not properly implemented', 'red');
    failed++;
  }
  
  // Test 7: Check for success indicator
  log('\nTest 7: Success indicator display', 'blue');
  if (inputContent.includes('success') && inputContent.includes('svg')) {
    log('  ✓ Success indicator with icon', 'green');
    passed++;
  } else {
    log('  ✗ Success indicator not found', 'red');
    failed++;
  }
  
  // Test 8: Check for smooth transitions (200ms ease-smooth)
  log('\nTest 8: Smooth transitions (200ms ease-smooth)', 'blue');
  if (inputContent.includes('duration-200') && inputContent.includes('ease-smooth')) {
    log('  ✓ Transitions use 200ms ease-smooth', 'green');
    passed++;
  } else {
    log('  ✗ Proper transition timing not found', 'red');
    failed++;
  }
  
  // Test 9: Check for disabled state
  log('\nTest 9: Disabled state (opacity 0.5)', 'blue');
  if (inputContent.includes('disabled:opacity-50') || inputContent.includes('disabled:opacity-0.5')) {
    log('  ✓ Disabled state with opacity 0.5', 'green');
    passed++;
  } else {
    log('  ✗ Disabled state opacity not found', 'red');
    failed++;
  }
  
  // Test 10: Check for variant system using CVA
  log('\nTest 10: Variant system implementation', 'blue');
  if (inputContent.includes('cva') && inputContent.includes('variants')) {
    log('  ✓ Uses class-variance-authority for variants', 'green');
    passed++;
  } else {
    log('  ✗ CVA variant system not found', 'red');
    failed++;
  }
  
  // Test 11: Check for ARIA attributes
  log('\nTest 11: Accessibility (ARIA attributes)', 'blue');
  if (inputContent.includes('aria-invalid') && inputContent.includes('aria-describedby')) {
    log('  ✓ Proper ARIA attributes for accessibility', 'green');
    passed++;
  } else {
    log('  ✗ ARIA attributes missing', 'red');
    failed++;
  }
  
  // Test 12: Check for helper text support
  log('\nTest 12: Helper text support', 'blue');
  if (inputContent.includes('helperText')) {
    log('  ✓ Helper text prop supported', 'green');
    passed++;
  } else {
    log('  ✗ Helper text not supported', 'red');
    failed++;
  }
  
  // Test 13: Check Select component consistency
  if (selectContent) {
    log('\nTest 13: Select component consistency (h-12, px-4)', 'blue');
    if (selectContent.includes('h-12') && selectContent.includes('px-4')) {
      log('  ✓ Select component has consistent sizing', 'green');
      passed++;
    } else {
      log('  ✗ Select component sizing inconsistent', 'red');
      failed++;
    }
  }
  
  // Test 14: Check for hover state
  log('\nTest 14: Hover state transition', 'blue');
  if (inputContent.includes('hover:border')) {
    log('  ✓ Hover state implemented', 'green');
    passed++;
  } else {
    log('  ✗ Hover state not found', 'red');
    failed++;
  }
  
  // Summary
  log('\n=== Validation Summary ===\n', 'cyan');
  log(`Total Tests: ${passed + failed}`, 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  const percentage = ((passed / (passed + failed)) * 100).toFixed(1);
  log(`\nSuccess Rate: ${percentage}%`, percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red');
  
  if (failed === 0) {
    log('\n✓ All validation tests passed!', 'green');
    log('The Input component meets all requirements from Task 5.1', 'green');
  } else {
    log(`\n✗ ${failed} validation test(s) failed`, 'red');
    log('Please review the implementation', 'yellow');
  }
  
  return failed === 0;
}

// Run validation
try {
  const success = validateInputComponent();
  process.exit(success ? 0 : 1);
} catch (error) {
  log(`\nError during validation: ${error.message}`, 'red');
  process.exit(1);
}
