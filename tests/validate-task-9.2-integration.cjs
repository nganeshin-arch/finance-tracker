/**
 * Task 9.2: StatCard Integration Validation Script
 * Validates that enhanced StatCard components are properly integrated
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Task 9.2: Enhanced StatCard Integration...\n');

// Check if required files exist and contain expected content
const checks = [
  {
    name: 'SummaryCards Component Enhancement',
    file: 'frontend/src/components/SummaryCards.tsx',
    patterns: [
      /useGradient={true}/,
      /gradientClass=/,
      /showTrendIcon={true}/,
      /trendValue=/,
      /bg-gradient-income/,
      /bg-gradient-expense/,
      /formatCurrencyValue/,
      /previousTransactions/
    ]
  },
  {
    name: 'UnifiedHomePage Previous Period Logic',
    file: 'frontend/src/pages/UnifiedHomePage.tsx',
    patterns: [
      /previousPeriodTransactions/,
      /previousTransactions={previousPeriodTransactions}/,
      /previousReferenceDate/
    ]
  },
  {
    name: 'StatCard Component Features',
    file: 'frontend/src/components/ui/stat-card.tsx',
    patterns: [
      /useGradient/,
      /gradientClass/,
      /showTrendIcon/,
      /trendValue/,
      /font-bold/,
      /text-3xl.*text-4xl/,
      /ArrowUp.*ArrowDown.*Minus/
    ]
  }
];

let allPassed = true;

checks.forEach(check => {
  console.log(`📋 Checking: ${check.name}`);
  
  try {
    const filePath = path.join(__dirname, '..', check.file.replace('frontend/', ''));
    const content = fs.readFileSync(filePath, 'utf8');
    
    let passed = 0;
    let total = check.patterns.length;
    
    check.patterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        passed++;
        console.log(`   ✅ Pattern ${index + 1}: Found`);
      } else {
        console.log(`   ❌ Pattern ${index + 1}: Missing - ${pattern}`);
        allPassed = false;
      }
    });
    
    console.log(`   📊 Result: ${passed}/${total} patterns found\n`);
    
  } catch (error) {
    console.log(`   ❌ Error reading file: ${error.message}\n`);
    allPassed = false;
  }
});

// Check for gradient CSS classes
console.log('🎨 Checking CSS Gradient Classes...');
try {
  const cssPath = path.join(__dirname, '..', 'src', 'index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  const gradientPatterns = [
    /\.bg-gradient-income/,
    /\.bg-gradient-expense/,
    /--gradient-income/,
    /--gradient-expense/
  ];
  
  let gradientsPassed = 0;
  gradientPatterns.forEach((pattern, index) => {
    if (pattern.test(cssContent)) {
      gradientsPassed++;
      console.log(`   ✅ Gradient ${index + 1}: Found`);
    } else {
      console.log(`   ❌ Gradient ${index + 1}: Missing - ${pattern}`);
      allPassed = false;
    }
  });
  
  console.log(`   📊 Result: ${gradientsPassed}/${gradientPatterns.length} gradients found\n`);
  
} catch (error) {
  console.log(`   ❌ Error reading CSS file: ${error.message}\n`);
  allPassed = false;
}

// Final result
console.log('=' .repeat(60));
if (allPassed) {
  console.log('🎉 Task 9.2 Validation: ALL CHECKS PASSED!');
  console.log('✅ Enhanced StatCard components are properly integrated');
  console.log('✅ Bold typography, gradient accents, and trend indicators implemented');
  console.log('✅ Previous period calculation logic added');
  console.log('✅ All required patterns found in source code');
} else {
  console.log('❌ Task 9.2 Validation: SOME CHECKS FAILED');
  console.log('Please review the missing patterns above');
}
console.log('=' .repeat(60));

process.exit(allPassed ? 0 : 1);