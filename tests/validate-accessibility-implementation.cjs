const fs = require('fs');
const path = require('path');

/**
 * Accessibility Implementation Validation Script
 * 
 * This script validates that all accessibility compliance tests have been
 * properly implemented and checks for common issues.
 */

console.log('🔍 Validating Accessibility Implementation...\n');

const testFiles = [
  'accessibility-contrast-compliance.spec.ts',
  'accessibility-focus-indicators.spec.ts', 
  'accessibility-reduced-motion-property.spec.ts',
  'accessibility-semantic-html.spec.ts',
  'accessibility-non-color-indicators.spec.ts',
  'accessibility-form-compliance.spec.ts'
];

let allTestsValid = true;
let totalTests = 0;

// Validate each test file
testFiles.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Missing test file: ${filename}`);
    allTestsValid = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for basic test structure
  const hasTestDescribe = content.includes('test.describe(');
  const hasTestCases = content.includes('test(');
  const hasExpectations = content.includes('expect(');
  
  if (!hasTestDescribe || !hasTestCases || !hasExpectations) {
    console.log(`❌ Invalid test structure in: ${filename}`);
    allTestsValid = false;
    return;
  }
  
  // Count test cases
  const testMatches = content.match(/test\(/g);
  const testCount = testMatches ? testMatches.length : 0;
  totalTests += testCount;
  
  console.log(`✅ ${filename} - ${testCount} test cases`);
  
  // Check for specific accessibility patterns
  switch (filename) {
    case 'accessibility-contrast-compliance.spec.ts':
      if (!content.includes('getContrastRatio') || !content.includes('WCAG_AA')) {
        console.log(`⚠️  ${filename}: Missing contrast ratio calculations`);
      }
      break;
      
    case 'accessibility-focus-indicators.spec.ts':
      if (!content.includes('focus()') || !content.includes('outline')) {
        console.log(`⚠️  ${filename}: Missing focus indicator checks`);
      }
      break;
      
    case 'accessibility-reduced-motion-property.spec.ts':
      if (!content.includes('prefers-reduced-motion') || !content.includes('fc.assert')) {
        console.log(`⚠️  ${filename}: Missing reduced motion or property-based testing`);
      }
      break;
      
    case 'accessibility-semantic-html.spec.ts':
      if (!content.includes('semantic') || !content.includes('landmark')) {
        console.log(`⚠️  ${filename}: Missing semantic HTML checks`);
      }
      break;
      
    case 'accessibility-non-color-indicators.spec.ts':
      if (!content.includes('color') || !content.includes('icon')) {
        console.log(`⚠️  ${filename}: Missing non-color indicator checks`);
      }
      break;
      
    case 'accessibility-form-compliance.spec.ts':
      if (!content.includes('label') || !content.includes('aria-')) {
        console.log(`⚠️  ${filename}: Missing form accessibility checks`);
      }
      break;
  }
});

console.log(`\n📊 Summary:`);
console.log(`- Test files: ${testFiles.length}`);
console.log(`- Total test cases: ${totalTests}`);
console.log(`- All tests valid: ${allTestsValid ? '✅' : '❌'}`);

// Check for required dependencies
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = ['@playwright/test', 'fast-check'];
  const missingDeps = requiredDeps.filter(dep => !deps[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`\n⚠️  Missing dependencies: ${missingDeps.join(', ')}`);
    console.log('Run: npm install @playwright/test fast-check --save-dev');
  } else {
    console.log(`\n✅ All required dependencies are installed`);
  }
}

// Validate HTML test page
const htmlTestPath = path.join(__dirname, 'validate-accessibility-tests.html');
if (fs.existsSync(htmlTestPath)) {
  console.log(`✅ HTML validation page created`);
} else {
  console.log(`❌ Missing HTML validation page`);
  allTestsValid = false;
}

// Check for accessibility compliance in existing components
const componentPaths = [
  '../src/components/ui/button.tsx',
  '../src/components/ui/card.tsx', 
  '../src/components/ui/input.tsx',
  '../src/components/ui/stat-card.tsx'
];

console.log(`\n🔍 Checking component accessibility features:`);

componentPaths.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const filename = path.basename(componentPath);
    
    // Check for accessibility features
    const hasAriaAttributes = content.includes('aria-');
    const hasFocusStyles = content.includes('focus:') || content.includes('focus-visible:');
    const hasKeyboardSupport = content.includes('tabIndex') || content.includes('onKeyDown');
    
    console.log(`  ${filename}:`);
    console.log(`    - ARIA attributes: ${hasAriaAttributes ? '✅' : '⚠️'}`);
    console.log(`    - Focus styles: ${hasFocusStyles ? '✅' : '⚠️'}`);
    console.log(`    - Keyboard support: ${hasKeyboardSupport ? '✅' : '⚠️'}`);
  }
});

// Check global CSS for accessibility features
const cssPath = path.join(__dirname, '../src/index.css');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  console.log(`\n🎨 Checking global CSS accessibility:`);
  console.log(`  - Reduced motion support: ${cssContent.includes('prefers-reduced-motion') ? '✅' : '⚠️'}`);
  console.log(`  - Focus indicators: ${cssContent.includes('focus:') || cssContent.includes('focus-visible:') ? '✅' : '⚠️'}`);
  console.log(`  - High contrast support: ${cssContent.includes('contrast') ? '✅' : '⚠️'}`);
}

console.log(`\n${allTestsValid ? '🎉' : '❌'} Accessibility implementation ${allTestsValid ? 'validation complete!' : 'has issues that need to be addressed.'}`);

if (allTestsValid) {
  console.log(`\n📋 Next steps:`);
  console.log(`1. Run the tests: npx playwright test tests/accessibility-*.spec.ts`);
  console.log(`2. Open validation page: tests/validate-accessibility-tests.html`);
  console.log(`3. Test with screen readers (NVDA, JAWS, VoiceOver)`);
  console.log(`4. Test keyboard navigation throughout the app`);
  console.log(`5. Test with color blindness simulators`);
}

process.exit(allTestsValid ? 0 : 1);