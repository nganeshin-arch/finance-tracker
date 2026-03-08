/**
 * Dashboard Grid Layout Validation
 * Task 7.4: Implement responsive dashboard grid layout
 * 
 * This script validates that the dashboard grid CSS is properly implemented
 * with responsive breakpoints, consistent spacing, and smooth transitions.
 * 
 * Validates: Requirements 7.5, 9.4
 * Property 26: Dashboard Responsive Layout
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

function validateDashboardGrid() {
  log('\n=== Dashboard Grid Layout Validation ===\n', 'cyan');
  
  const errors = [];
  const warnings = [];
  const successes = [];
  
  // Read the CSS file
  const cssPath = path.join(__dirname, '../src/index.css');
  
  if (!fs.existsSync(cssPath)) {
    errors.push('CSS file not found: ' + cssPath);
    return { errors, warnings, successes };
  }
  
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  
  // Test 1: Check for dashboard-grid class definition
  log('Test 1: Checking for dashboard-grid class...', 'blue');
  if (cssContent.includes('.dashboard-grid')) {
    successes.push('✓ dashboard-grid class is defined');
  } else {
    errors.push('✗ dashboard-grid class is not defined');
  }
  
  // Test 2: Check for CSS Grid display
  log('Test 2: Checking for CSS Grid display...', 'blue');
  const gridDisplayRegex = /\.dashboard-grid\s*{[^}]*display:\s*grid/s;
  if (gridDisplayRegex.test(cssContent)) {
    successes.push('✓ dashboard-grid uses CSS Grid (display: grid)');
  } else {
    errors.push('✗ dashboard-grid does not use CSS Grid');
  }
  
  // Test 3: Check for gap property
  log('Test 3: Checking for gap property...', 'blue');
  const gapRegex = /\.dashboard-grid\s*{[^}]*gap:\s*[\d.]+(?:px|rem)/s;
  if (gapRegex.test(cssContent)) {
    successes.push('✓ dashboard-grid has gap property for consistent spacing');
  } else {
    errors.push('✗ dashboard-grid does not have gap property');
  }
  
  // Test 4: Check for mobile layout (1 column)
  log('Test 4: Checking for mobile layout (1 column)...', 'blue');
  const mobileLayoutRegex = /\.dashboard-grid\s*{[^}]*grid-template-columns:\s*1fr/s;
  if (mobileLayoutRegex.test(cssContent)) {
    successes.push('✓ Mobile layout uses 1 column (grid-template-columns: 1fr)');
  } else {
    errors.push('✗ Mobile layout does not use 1 column');
  }
  
  // Test 5: Check for tablet breakpoint (min-width: 640px)
  log('Test 5: Checking for tablet breakpoint...', 'blue');
  const tabletBreakpointRegex = /@media\s*\([^)]*min-width:\s*640px[^)]*\)/;
  if (tabletBreakpointRegex.test(cssContent)) {
    successes.push('✓ Tablet breakpoint defined (min-width: 640px)');
  } else {
    errors.push('✗ Tablet breakpoint not found');
  }
  
  // Test 6: Check for desktop breakpoint (min-width: 1024px)
  log('Test 6: Checking for desktop breakpoint...', 'blue');
  const desktopBreakpointRegex = /@media\s*\([^)]*min-width:\s*1024px[^)]*\)/;
  if (desktopBreakpointRegex.test(cssContent)) {
    successes.push('✓ Desktop breakpoint defined (min-width: 1024px)');
  } else {
    errors.push('✗ Desktop breakpoint not found');
  }
  
  // Test 7: Check for 2-column grid variant
  log('Test 7: Checking for 2-column grid variant...', 'blue');
  const grid2Regex = /\.dashboard-grid-2\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)/s;
  if (grid2Regex.test(cssContent)) {
    successes.push('✓ 2-column grid variant defined');
  } else {
    warnings.push('⚠ 2-column grid variant not found');
  }
  
  // Test 8: Check for 3-column grid variant
  log('Test 8: Checking for 3-column grid variant...', 'blue');
  const grid3Regex = /\.dashboard-grid-3\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*1fr\)/s;
  if (grid3Regex.test(cssContent)) {
    successes.push('✓ 3-column grid variant defined');
  } else {
    warnings.push('⚠ 3-column grid variant not found');
  }
  
  // Test 9: Check for 4-column grid variant
  log('Test 9: Checking for 4-column grid variant...', 'blue');
  const grid4Regex = /\.dashboard-grid-4\s*{[^}]*grid-template-columns:\s*repeat\(4,\s*1fr\)/s;
  if (grid4Regex.test(cssContent)) {
    successes.push('✓ 4-column grid variant defined');
  } else {
    warnings.push('⚠ 4-column grid variant not found');
  }
  
  // Test 10: Check for smooth transitions
  log('Test 10: Checking for smooth transitions...', 'blue');
  const transitionRegex = /\.dashboard-grid\s*{[^}]*transition:[^;]*gap[^;]*cubic-bezier/s;
  if (transitionRegex.test(cssContent)) {
    successes.push('✓ Smooth transitions defined for gap property');
  } else {
    warnings.push('⚠ Smooth transitions not found for gap property');
  }
  
  // Test 11: Check for grid item transitions
  log('Test 11: Checking for grid item transitions...', 'blue');
  const itemTransitionRegex = /\.dashboard-grid\s*>\s*\*\s*{[^}]*transition:[^;]*(transform|box-shadow)/s;
  if (itemTransitionRegex.test(cssContent)) {
    successes.push('✓ Grid items have smooth transitions');
  } else {
    warnings.push('⚠ Grid items do not have smooth transitions');
  }
  
  // Test 12: Check for width: 100%
  log('Test 12: Checking for full width...', 'blue');
  const widthRegex = /\.dashboard-grid\s*{[^}]*width:\s*100%/s;
  if (widthRegex.test(cssContent)) {
    successes.push('✓ dashboard-grid has full width (width: 100%)');
  } else {
    warnings.push('⚠ dashboard-grid does not explicitly set width: 100%');
  }
  
  // Check DashboardGrid component
  log('\nTest 13: Checking DashboardGrid component...', 'blue');
  const componentPath = path.join(__dirname, '../src/components/ui/dashboard-grid.tsx');
  
  if (fs.existsSync(componentPath)) {
    successes.push('✓ DashboardGrid component file exists');
    
    const componentContent = fs.readFileSync(componentPath, 'utf-8');
    
    // Check for columns prop
    if (componentContent.includes('columns')) {
      successes.push('✓ DashboardGrid component has columns prop');
    } else {
      warnings.push('⚠ DashboardGrid component does not have columns prop');
    }
    
    // Check for dashboard-grid class usage
    if (componentContent.includes('dashboard-grid')) {
      successes.push('✓ DashboardGrid component uses dashboard-grid class');
    } else {
      errors.push('✗ DashboardGrid component does not use dashboard-grid class');
    }
  } else {
    errors.push('✗ DashboardGrid component file not found');
  }
  
  // Check SummaryCards component
  log('\nTest 14: Checking SummaryCards component integration...', 'blue');
  const summaryCardsPath = path.join(__dirname, '../src/components/SummaryCards.tsx');
  
  if (fs.existsSync(summaryCardsPath)) {
    const summaryCardsContent = fs.readFileSync(summaryCardsPath, 'utf-8');
    
    // Check if it uses DashboardGrid
    if (summaryCardsContent.includes('DashboardGrid')) {
      successes.push('✓ SummaryCards uses DashboardGrid component');
    } else {
      warnings.push('⚠ SummaryCards does not use DashboardGrid component');
    }
    
    // Check if it uses StatCard
    if (summaryCardsContent.includes('StatCard')) {
      successes.push('✓ SummaryCards uses StatCard component');
    } else {
      warnings.push('⚠ SummaryCards does not use StatCard component');
    }
  } else {
    warnings.push('⚠ SummaryCards component file not found');
  }
  
  return { errors, warnings, successes };
}

// Run validation
const { errors, warnings, successes } = validateDashboardGrid();

// Print results
log('\n=== Validation Results ===\n', 'cyan');

if (successes.length > 0) {
  log('Successes:', 'green');
  successes.forEach(success => log(success, 'green'));
  log('');
}

if (warnings.length > 0) {
  log('Warnings:', 'yellow');
  warnings.forEach(warning => log(warning, 'yellow'));
  log('');
}

if (errors.length > 0) {
  log('Errors:', 'red');
  errors.forEach(error => log(error, 'red'));
  log('');
}

// Summary
log('=== Summary ===', 'cyan');
log(`Total Successes: ${successes.length}`, 'green');
log(`Total Warnings: ${warnings.length}`, 'yellow');
log(`Total Errors: ${errors.length}`, 'red');

// Exit with appropriate code
if (errors.length > 0) {
  log('\n❌ Validation FAILED', 'red');
  process.exit(1);
} else if (warnings.length > 0) {
  log('\n⚠️  Validation PASSED with warnings', 'yellow');
  process.exit(0);
} else {
  log('\n✅ Validation PASSED', 'green');
  process.exit(0);
}
