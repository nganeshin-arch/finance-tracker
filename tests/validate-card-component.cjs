/**
 * Card Component Validation Script
 * Task 4.1: Verify enhanced Card component with premium styling
 * 
 * This script validates that the Card component meets all requirements:
 * - Requirement 5.1: Subtle box-shadow for depth (shadow-md)
 * - Requirement 5.2: Hover effects (shadow-lg, translateY(-2px))
 * - Requirement 5.3: Rounded corners (12px border-radius)
 * - Requirement 5.4: Premium variant with gradient border
 * - Requirement 5.6: Consistent padding (p-6)
 * - Smooth transitions (250ms ease-smooth)
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
  cyan: '\x1b[36m',
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

// Read the Card component file
const cardPath = path.join(__dirname, '../src/components/ui/card.tsx');
let cardContent = '';

try {
  cardContent = fs.readFileSync(cardPath, 'utf8');
} catch (error) {
  log(`Error reading card component: ${error.message}`, 'red');
  process.exit(1);
}

logSection('Card Component Validation - Task 4.1');

let allTestsPassed = true;
const results = {
  passed: 0,
  failed: 0,
  total: 0,
};

// Test 1: Check for class-variance-authority import
logSection('Test 1: Component Structure');
results.total++;
const hasCVA = cardContent.includes('class-variance-authority');
logTest('Imports class-variance-authority for variant management', hasCVA);
if (hasCVA) results.passed++;
else { results.failed++; allTestsPassed = false; }

// Test 2: Check for cardVariants definition
results.total++;
const hasCardVariants = cardContent.includes('const cardVariants = cva(');
logTest('Defines cardVariants using cva', hasCardVariants);
if (hasCardVariants) results.passed++;
else { results.failed++; allTestsPassed = false; }

// Test 3: Check for variant types
logSection('Test 2: Card Variants');
results.total++;
const hasDefaultVariant = cardContent.includes('default:') && cardContent.includes('shadow-md');
logTest('Has default variant with shadow-md', hasDefaultVariant, 
  'Default cards should have subtle shadow for depth (Req 5.1)');
if (hasDefaultVariant) results.passed++;
else { results.failed++; allTestsPassed = false; }

results.total++;
const hasInteractiveVariant = cardContent.includes('interactive:') && 
  cardContent.includes('hover:shadow-lg') && 
  cardContent.includes('hover:-translate-y');
logTest('Has interactive variant with hover effects', hasInteractiveVariant,
  'Interactive cards should enhance shadow and lift on hover (Req 5.2)');
if (hasInteractiveVariant) results.passed++;
else { results.failed++; allTestsPassed = false; }

results.total++;
const hasPremiumVariant = cardContent.includes('premium:') && 
  (cardContent.includes('gradient') || cardContent.includes('bg-gradient'));
logTest('Has premium variant with gradient styling', hasPremiumVariant,
  'Premium cards should have gradient border or background (Req 5.4)');
if (hasPremiumVariant) results.passed++;
else { results.failed++; allTestsPassed = false; }

// Test 4: Check for border-radius
logSection('Test 3: Border Radius (Requirement 5.3)');
results.total++;
const hasBorderRadius = cardContent.includes('rounded-xl');
logTest('Uses rounded-xl (12px border-radius)', hasBorderRadius,
  'Cards should have 12px rounded corners (within 8-16px range)');
if (hasBorderRadius) results.passed++;
else { results.failed++; allTestsPassed = false; }

// Test 5: Check for padding variants
logSection('Test 4: Padding Consistency (Requirement 5.6)');
results.total++;
const hasPaddingVariants = cardContent.includes('padding:') && cardContent.includes('p-6');
logTest('Defines padding variants with p-6 default', hasPaddingVariants,
  'Cards should have consistent padding (p-6 = 1.5rem = 24px)');
if (hasPaddingVariants) results.passed++;
else { results.failed++; allTestsPassed = false; }

// Test 6: Check for transition timing
logSection('Test 5: Smooth Transitions');
results.total++;
const hasTransition = cardContent.includes('transition-all') && 
  (cardContent.includes('duration-250') || cardContent.includes('250'));
logTest('Uses transition-all with 250ms duration', hasTransition,
  'Transitions should be 250ms for smooth hover effects');
if (hasTransition) results.passed++;
else { results.failed++; allTestsPassed = false; }

results.total++;
const hasEaseSmooth = cardContent.includes('ease-smooth');
logTest('Uses ease-smooth timing function', hasEaseSmooth,
  'Should use cubic-bezier(0.4, 0, 0.2, 1) for natural motion');
if (hasEaseSmooth) results.passed++;
else { results.failed++; allTestsPassed = false; }

// Test 7: Check for CardProps interface
logSection('Test 6: TypeScript Types');
results.total++;
const hasCardProps = cardContent.includes('export interface CardProps') || 
  cardContent.includes('export type CardProps');
logTest('Exports CardProps interface/type', hasCardProps);
if (hasCardProps) results.passed++;
else { results.failed++; allTestsPassed = false; }

results.total++;
const hasVariantProps = cardContent.includes('VariantProps<typeof cardVariants>');
logTest('CardProps extends VariantProps', hasVariantProps);
if (hasVariantProps) results.passed++;
else { results.failed++; allTestsPassed = false; }

// Test 8: Check for interactive prop
results.total++;
const hasInteractiveProp = cardContent.includes('interactive?:');
logTest('Has optional interactive prop', hasInteractiveProp,
  'Allows easy toggling of interactive behavior');
if (hasInteractiveProp) results.passed++;
else { results.failed++; allTestsPassed = false; }

// Test 9: Check for proper exports
logSection('Test 7: Component Exports');
results.total++;
const exportsCard = cardContent.includes('export { Card');
logTest('Exports Card component', exportsCard);
if (exportsCard) results.passed++;
else { results.failed++; allTestsPassed = false; }

results.total++;
const exportsVariants = cardContent.includes('cardVariants');
logTest('Exports cardVariants for reusability', exportsVariants);
if (exportsVariants) results.passed++;
else { results.failed++; allTestsPassed = false; }

// Test 10: Check for sub-components
results.total++;
const hasSubComponents = cardContent.includes('CardHeader') && 
  cardContent.includes('CardTitle') && 
  cardContent.includes('CardContent') && 
  cardContent.includes('CardFooter');
logTest('Includes all sub-components (Header, Title, Content, Footer)', hasSubComponents);
if (hasSubComponents) results.passed++;
else { results.failed++; allTestsPassed = false; }

// Test 11: Verify padding is removed from sub-components
logSection('Test 8: Sub-component Padding');
results.total++;
const cardHeaderNoPadding = !cardContent.match(/CardHeader[^}]*className[^}]*p-6/);
logTest('CardHeader does not force padding', cardHeaderNoPadding,
  'Padding should be controlled by Card variant, not sub-components');
if (cardHeaderNoPadding) results.passed++;
else { results.failed++; allTestsPassed = false; }

results.total++;
const cardContentNoPadding = !cardContent.match(/CardContent[^}]*className[^}]*p-6/);
logTest('CardContent does not force padding', cardContentNoPadding,
  'Padding should be controlled by Card variant, not sub-components');
if (cardContentNoPadding) results.passed++;
else { results.failed++; allTestsPassed = false; }

// Summary
logSection('Validation Summary');
log(`Total Tests: ${results.total}`, 'cyan');
log(`Passed: ${results.passed}`, 'green');
log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');

const passRate = ((results.passed / results.total) * 100).toFixed(1);
log(`\nPass Rate: ${passRate}%`, passRate === '100.0' ? 'green' : 'yellow');

if (allTestsPassed) {
  log('\n✓ All validation tests passed!', 'green');
  log('The Card component meets all requirements for Task 4.1.', 'green');
  process.exit(0);
} else {
  log('\n✗ Some validation tests failed.', 'red');
  log('Please review the failed tests above and update the Card component.', 'red');
  process.exit(1);
}
