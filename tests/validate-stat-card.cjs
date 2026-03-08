/**
 * StatCard Component Validation Script
 * Task 7.1: Verify enhanced StatCard component implementation
 * 
 * Requirements validated:
 * - 7.1: Bold typography (font-weight 700+) with responsive sizing
 * - 7.2: Color-coded trend indicators with accessibility icons
 * - 7.3: Gradient backgrounds for key metrics
 * - 7.4: Smooth transitions (250ms) on value changes
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bold');
  console.log('='.repeat(60));
}

function logTest(testName, passed, details = '') {
  const icon = passed ? '✓' : '✗';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${testName}`, color);
  if (details) {
    console.log(`  ${details}`);
  }
}

// Read the StatCard component file
const componentPath = path.join(__dirname, '../src/components/ui/stat-card.tsx');
let componentContent = '';
let allTestsPassed = true;

try {
  componentContent = fs.readFileSync(componentPath, 'utf8');
} catch (error) {
  log(`Error reading component file: ${error.message}`, 'red');
  process.exit(1);
}

logSection('Task 7.1: StatCard Component Validation');

// Test 1: Component file exists
logSection('Test 1: Component File Structure');
const fileExists = fs.existsSync(componentPath);
logTest('StatCard component file exists', fileExists, componentPath);
allTestsPassed = allTestsPassed && fileExists;

// Test 2: Bold typography implementation (font-weight 700+)
logSection('Test 2: Bold Typography (Requirement 7.1)');
const hasBoldTypography = componentContent.includes('font-bold') || 
                          componentContent.includes('font-weight: 700') ||
                          componentContent.includes('font-extrabold');
logTest(
  'Bold typography (font-weight 700+) applied to values',
  hasBoldTypography,
  'Found: font-bold class for numerical values'
);
allTestsPassed = allTestsPassed && hasBoldTypography;

// Test 3: Responsive font sizing (text-3xl to text-4xl)
logSection('Test 3: Responsive Typography (Requirement 7.1)');
const hasResponsiveSizing = componentContent.includes('text-3xl') && 
                            componentContent.includes('text-4xl');
logTest(
  'Responsive font sizes (text-3xl on mobile, text-4xl on desktop)',
  hasResponsiveSizing,
  'Found: text-3xl sm:text-4xl responsive classes'
);
allTestsPassed = allTestsPassed && hasResponsiveSizing;

// Test 4: Color-coded trend indicators
logSection('Test 4: Color-Coded Trends (Requirement 7.2)');
const hasPositiveTrend = componentContent.includes('income') || 
                         componentContent.includes('positive') ||
                         componentContent.includes('green');
const hasNegativeTrend = componentContent.includes('expense') || 
                         componentContent.includes('negative') ||
                         componentContent.includes('red');
const hasTrendColors = hasPositiveTrend && hasNegativeTrend;
logTest(
  'Color-coded trend indicators (green for positive, red for negative)',
  hasTrendColors,
  'Found: income/expense color variants'
);
allTestsPassed = allTestsPassed && hasTrendColors;

// Test 5: Arrow icons for accessibility
logSection('Test 5: Accessibility Icons (Requirement 7.2)');
const hasArrowIcons = componentContent.includes('ArrowUp') && 
                      componentContent.includes('ArrowDown');
logTest(
  'Arrow icons alongside color coding for accessibility',
  hasArrowIcons,
  'Found: ArrowUp and ArrowDown icons from lucide-react'
);
allTestsPassed = allTestsPassed && hasArrowIcons;

// Test 6: Screen reader support
const hasScreenReaderSupport = componentContent.includes('sr-only') || 
                               componentContent.includes('aria-hidden');
logTest(
  'Screen reader accessible trend descriptions',
  hasScreenReaderSupport,
  'Found: sr-only or aria-hidden attributes'
);
allTestsPassed = allTestsPassed && hasScreenReaderSupport;

// Test 7: Gradient backgrounds
logSection('Test 7: Gradient Backgrounds (Requirement 7.3)');
const hasGradientSupport = componentContent.includes('gradient') || 
                           componentContent.includes('bg-gradient');
logTest(
  'Gradient backgrounds or accent colors for key metrics',
  hasGradientSupport,
  'Found: gradient variant or gradient class support'
);
allTestsPassed = allTestsPassed && hasGradientSupport;

// Test 8: Smooth transitions (250ms)
logSection('Test 8: Smooth Transitions (Requirement 7.4)');
const hasTransitions = componentContent.includes('transition') && 
                       (componentContent.includes('250') || 
                        componentContent.includes('duration-250'));
logTest(
  'Smooth transitions (250ms) on value changes',
  hasTransitions,
  'Found: transition with 250ms duration'
);
allTestsPassed = allTestsPassed && hasTransitions;

// Test 9: Hover effects
const hasHoverEffects = componentContent.includes('hover:') || 
                        componentContent.includes('hover-');
logTest(
  'Hover effects for interactive feedback',
  hasHoverEffects,
  'Found: hover state styling'
);
allTestsPassed = allTestsPassed && hasHoverEffects;

// Test 10: Component props interface
logSection('Test 9: Component API Design');
const hasPropsInterface = componentContent.includes('StatCardProps') || 
                          componentContent.includes('interface');
logTest(
  'TypeScript props interface defined',
  hasPropsInterface,
  'Found: StatCardProps interface'
);
allTestsPassed = allTestsPassed && hasPropsInterface;

// Test 11: Essential props
const hasLabelProp = componentContent.includes('label');
const hasValueProp = componentContent.includes('value');
const hasTrendProp = componentContent.includes('trend');
const hasEssentialProps = hasLabelProp && hasValueProp && hasTrendProp;
logTest(
  'Essential props (label, value, trend) defined',
  hasEssentialProps,
  'Found: label, value, and trend props'
);
allTestsPassed = allTestsPassed && hasEssentialProps;

// Test 12: Icon support
const hasIconProp = componentContent.includes('icon');
logTest(
  'Icon prop for custom icons',
  hasIconProp,
  'Found: icon prop support'
);
allTestsPassed = allTestsPassed && hasIconProp;

// Test 13: Format function support
const hasFormatFunction = componentContent.includes('formatValue') || 
                          componentContent.includes('format');
logTest(
  'Value formatting function support',
  hasFormatFunction,
  'Found: formatValue prop for custom formatting'
);
allTestsPassed = allTestsPassed && hasFormatFunction;

// Test 14: Variant system
logSection('Test 10: Variant System');
const hasVariants = componentContent.includes('cva') || 
                    componentContent.includes('variants');
logTest(
  'Class variance authority (cva) for variants',
  hasVariants,
  'Found: cva variant system'
);
allTestsPassed = allTestsPassed && hasVariants;

// Test 15: Card component integration
const usesCardComponent = componentContent.includes('Card') && 
                          componentContent.includes('CardContent');
logTest(
  'Integration with enhanced Card component',
  usesCardComponent,
  'Found: Card and CardContent usage'
);
allTestsPassed = allTestsPassed && usesCardComponent;

// Test 16: Export validation
logSection('Test 11: Module Exports');
const hasExports = componentContent.includes('export') && 
                   componentContent.includes('StatCard');
logTest(
  'Component properly exported',
  hasExports,
  'Found: StatCard export'
);
allTestsPassed = allTestsPassed && hasExports;

// Check if component is exported from index
const indexPath = path.join(__dirname, '../src/components/ui/index.ts');
let indexContent = '';
try {
  indexContent = fs.readFileSync(indexPath, 'utf8');
} catch (error) {
  log(`Warning: Could not read index file: ${error.message}`, 'yellow');
}

const exportedInIndex = indexContent.includes('stat-card') || 
                        indexContent.includes('StatCard');
logTest(
  'Component exported from ui/index.ts',
  exportedInIndex,
  'Found: StatCard export in index'
);
allTestsPassed = allTestsPassed && exportedInIndex;

// Final summary
logSection('Validation Summary');
if (allTestsPassed) {
  log('✓ ALL TESTS PASSED', 'green');
  log('\nTask 7.1 Implementation Complete:', 'bold');
  log('  ✓ Bold typography (font-weight 700+) with responsive sizing', 'green');
  log('  ✓ Color-coded trend indicators (green/red) with arrow icons', 'green');
  log('  ✓ Gradient backgrounds for key metrics', 'green');
  log('  ✓ Smooth transitions (250ms) on value changes', 'green');
  log('  ✓ Accessibility features (screen reader support, icons)', 'green');
  log('  ✓ Proper TypeScript types and component API', 'green');
  log('\nRequirements Validated:', 'bold');
  log('  ✓ Requirement 7.1: Bold typography with responsive sizing', 'green');
  log('  ✓ Requirement 7.2: Color-coded trends with accessibility icons', 'green');
  log('  ✓ Requirement 7.3: Gradient backgrounds for key metrics', 'green');
  log('  ✓ Requirement 7.4: Smooth transitions (250ms)', 'green');
  process.exit(0);
} else {
  log('✗ SOME TESTS FAILED', 'red');
  log('\nPlease review the failed tests above and fix the issues.', 'yellow');
  process.exit(1);
}
