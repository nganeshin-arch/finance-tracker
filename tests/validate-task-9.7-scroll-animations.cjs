/**
 * Task 9.7: UnifiedHomePage Scroll Animations Validation Script
 * 
 * Validates that UnifiedHomePage scroll animations are properly implemented
 * with smooth scroll behavior, fade-in animations, and stagger effects.
 * 
 * **Validates: Requirements 9.3**
 * **Property 33: UnifiedHomePage Scroll Animations**
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Task 9.7: Validating UnifiedHomePage Scroll Animations Implementation...\n');

// Validation results
const results = {
  passed: 0,
  failed: 0,
  details: []
};

function validateFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      results.passed++;
      results.details.push(`✅ ${description}: Found`);
      return content;
    } else {
      results.failed++;
      results.details.push(`❌ ${description}: Missing file ${filePath}`);
      return null;
    }
  } catch (error) {
    results.failed++;
    results.details.push(`❌ ${description}: Error reading ${filePath} - ${error.message}`);
    return null;
  }
}

function validateContent(content, patterns, description) {
  if (!content) return false;
  
  let allPassed = true;
  patterns.forEach(pattern => {
    if (pattern.test(content)) {
      results.passed++;
      results.details.push(`✅ ${description}: ${pattern.source}`);
    } else {
      results.failed++;
      results.details.push(`❌ ${description}: Missing ${pattern.source}`);
      allPassed = false;
    }
  });
  
  return allPassed;
}

// 1. Validate UnifiedHomePage component has scroll animations
console.log('1. Validating UnifiedHomePage scroll animation implementation...');
const unifiedHomePagePath = path.join(__dirname, '../src/pages/UnifiedHomePage.tsx');
const unifiedHomePageContent = validateFile(unifiedHomePagePath, 'UnifiedHomePage component');

if (unifiedHomePageContent) {
  validateContent(unifiedHomePageContent, [
    /scrollToSection.*function/,
    /scrollIntoView.*behavior.*smooth/,
    /motion-safe:animate-fade-in/,
    /animationDelay.*\d+ms/,
    /id="dashboard-section"/,
    /id="add-transaction-section"/,
    /id="transactions-section"/
  ], 'UnifiedHomePage scroll animations');
}

// 2. Validate global CSS has smooth scroll behavior
console.log('\n2. Validating global CSS smooth scroll behavior...');
const globalCSSPath = path.join(__dirname, '../src/index.css');
const globalCSSContent = validateFile(globalCSSPath, 'Global CSS file');

if (globalCSSContent) {
  validateContent(globalCSSContent, [
    /html\s*\{[^}]*scroll-behavior:\s*smooth/,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)/,
    /scroll-behavior:\s*auto/,
    /@keyframes\s+fadeIn/,
    /@keyframes\s+fadeInUp/,
    /animate-fade-in/,
    /animate-fade-in-up/,
    /stagger-\d+/
  ], 'Global CSS scroll animations');
}

// 3. Validate property-based test exists
console.log('\n3. Validating property-based test implementation...');
const propertyTestPath = path.join(__dirname, 'task-9.7-unified-homepage-scroll-animations-property.spec.ts');
const propertyTestContent = validateFile(propertyTestPath, 'Property-based test');

if (propertyTestContent) {
  validateContent(propertyTestContent, [
    /Property 33: UnifiedHomePage Scroll Animations/,
    /smooth scroll behavior/,
    /fade-in animations/,
    /stagger effects/,
    /prefers-reduced-motion/,
    /fast-check/,
    /fc\.assert/,
    /numRuns.*\d+/
  ], 'Property-based test content');
}

// 4. Validate navigation structure
console.log('\n4. Validating navigation structure...');
if (unifiedHomePageContent) {
  validateContent(unifiedHomePageContent, [
    /nav.*button.*Dashboard/,
    /nav.*button.*Add Transaction/,
    /nav.*button.*Transactions/,
    /onClick.*scrollToSection/,
    /hover:scale-105/,
    /active:scale-95/,
    /transition-colors/
  ], 'Navigation structure');
}

// 5. Validate animation timing and accessibility
console.log('\n5. Validating animation timing and accessibility...');
if (globalCSSContent) {
  validateContent(globalCSSContent, [
    /animation.*\d+ms.*ease/,
    /transition.*\d+ms.*cubic-bezier/,
    /prefers-reduced-motion.*reduce/,
    /animation-duration.*0\.01ms/,
    /transition-duration.*0\.01ms/
  ], 'Animation timing and accessibility');
}

// 6. Validate stagger animation implementation
console.log('\n6. Validating stagger animation implementation...');
if (unifiedHomePageContent) {
  validateContent(unifiedHomePageContent, [
    /animationDelay.*0ms/,
    /animationDelay.*100ms/,
    /animationDelay.*400ms/,
    /animationDelay.*500ms/,
    /i \* 150/,
    /i \* 100/
  ], 'Stagger animation delays');
}

// 7. Validate section IDs and structure
console.log('\n7. Validating section IDs and structure...');
if (unifiedHomePageContent) {
  validateContent(unifiedHomePageContent, [
    /section.*id="dashboard-section"/,
    /section.*id="add-transaction-section"/,
    /section.*id="transactions-section"/,
    /Card.*variant="premium"/,
    /shadow-lg.*hover:shadow-xl/
  ], 'Section structure');
}

// Print results
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION RESULTS');
console.log('='.repeat(60));

results.details.forEach(detail => console.log(detail));

console.log('\n' + '='.repeat(60));
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

if (results.failed === 0) {
  console.log('\n🎉 All validations passed! UnifiedHomePage scroll animations are properly implemented.');
  console.log('\n📋 Implementation Summary:');
  console.log('   • Smooth scroll behavior enabled globally');
  console.log('   • Section navigation with smooth scrolling');
  console.log('   • Fade-in animations with staggered delays');
  console.log('   • Dashboard cards with stagger effects');
  console.log('   • Accessibility compliance (prefers-reduced-motion)');
  console.log('   • Property-based test coverage');
} else {
  console.log('\n⚠️  Some validations failed. Please review the implementation.');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));