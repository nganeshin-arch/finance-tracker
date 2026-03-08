/**
 * Task 9.6: UnifiedHomePage Statistics Styling Validation Script
 * 
 * Validates that UnifiedHomePage statistics use bold typography (font-weight 700+),
 * gradient accents for key metrics, and color-coded trend indicators with icons.
 * 
 * **Validates: Requirements 9.2**
 * **Property 32: UnifiedHomePage Statistics Styling**
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Task 9.6 Validation: UnifiedHomePage Statistics Styling');
console.log('============================================================');

let allChecksPassed = true;
const issues = [];

// Check 1: Verify UnifiedHomePage component exists and has statistics
const unifiedHomePagePath = path.join(__dirname, '../src/pages/UnifiedHomePage.tsx');
if (fs.existsSync(unifiedHomePagePath)) {
  const unifiedHomePageContent = fs.readFileSync(unifiedHomePagePath, 'utf8');
  
  // Check for SummaryCards integration
  if (unifiedHomePageContent.includes('SummaryCards')) {
    console.log('✅ UnifiedHomePage integrates SummaryCards component');
  } else {
    console.log('❌ UnifiedHomePage missing SummaryCards integration');
    issues.push('SummaryCards component not found in UnifiedHomePage');
    allChecksPassed = false;
  }
  
  // Check for dashboard section with statistics
  if (unifiedHomePageContent.includes('id="dashboard-section"')) {
    console.log('✅ Dashboard section with statistics present');
  } else {
    console.log('❌ Dashboard section missing');
    issues.push('Dashboard section with id="dashboard-section" not found');
    allChecksPassed = false;
  }
  
  // Check for financial overview section
  if (unifiedHomePageContent.includes('Financial Overview')) {
    console.log('✅ Financial Overview section present');
  } else {
    console.log('❌ Financial Overview section missing');
    issues.push('Financial Overview section not found');
    allChecksPassed = false;
  }
  
} else {
  console.log('❌ UnifiedHomePage component not found');
  issues.push('UnifiedHomePage.tsx file not found');
  allChecksPassed = false;
}

// Check 2: Verify SummaryCards component has proper StatCard integration
const summaryCardsPath = path.join(__dirname, '../src/components/SummaryCards.tsx');
if (fs.existsSync(summaryCardsPath)) {
  const summaryCardsContent = fs.readFileSync(summaryCardsPath, 'utf8');
  
  // Check for StatCard usage
  if (summaryCardsContent.includes('StatCard')) {
    console.log('✅ SummaryCards uses StatCard components');
  } else {
    console.log('❌ SummaryCards missing StatCard integration');
    issues.push('StatCard components not used in SummaryCards');
    allChecksPassed = false;
  }
  
  // Check for gradient accents on key metrics
  if (summaryCardsContent.includes('useGradient={true}') || summaryCardsContent.includes('gradientClass')) {
    console.log('✅ Gradient accents applied to key metrics');
  } else {
    console.log('❌ Gradient accents missing from key metrics');
    issues.push('Gradient accents not applied to key metrics');
    allChecksPassed = false;
  }
  
  // Check for trend indicators
  if (summaryCardsContent.includes('trend=') && summaryCardsContent.includes('showTrendIcon')) {
    console.log('✅ Color-coded trend indicators with icons implemented');
  } else {
    console.log('❌ Trend indicators missing or incomplete');
    issues.push('Color-coded trend indicators with icons not properly implemented');
    allChecksPassed = false;
  }
  
  // Check for key metrics (Total Balance, Monthly Income, Monthly Expenses)
  const keyMetrics = ['Total Balance', 'Monthly Income', 'Monthly Expenses'];
  const foundMetrics = keyMetrics.filter(metric => summaryCardsContent.includes(metric));
  
  if (foundMetrics.length === keyMetrics.length) {
    console.log('✅ All key financial metrics present');
  } else {
    console.log(`❌ Missing key metrics: ${keyMetrics.filter(m => !foundMetrics.includes(m)).join(', ')}`);
    issues.push('Not all key financial metrics are present');
    allChecksPassed = false;
  }
  
} else {
  console.log('❌ SummaryCards component not found');
  issues.push('SummaryCards.tsx file not found');
  allChecksPassed = false;
}

// Check 3: Verify StatCard component has bold typography and proper styling
const statCardPath = path.join(__dirname, '../src/components/ui/stat-card.tsx');
if (fs.existsSync(statCardPath)) {
  const statCardContent = fs.readFileSync(statCardPath, 'utf8');
  
  // Check for bold typography (font-weight 700+)
  if (statCardContent.includes('font-bold') || statCardContent.includes('font-weight: 700')) {
    console.log('✅ Bold typography (font-weight 700+) implemented for numerical values');
  } else {
    console.log('❌ Bold typography missing from numerical values');
    issues.push('Bold typography (font-weight 700+) not applied to numerical values');
    allChecksPassed = false;
  }
  
  // Check for responsive font sizes
  if (statCardContent.includes('text-3xl') || statCardContent.includes('text-4xl')) {
    console.log('✅ Responsive font sizes implemented');
  } else {
    console.log('❌ Responsive font sizes missing');
    issues.push('Responsive font sizes not implemented');
    allChecksPassed = false;
  }
  
  // Check for gradient support
  if (statCardContent.includes('useGradient') && statCardContent.includes('gradientClass')) {
    console.log('✅ Gradient accent support implemented');
  } else {
    console.log('❌ Gradient accent support missing');
    issues.push('Gradient accent support not implemented');
    allChecksPassed = false;
  }
  
  // Check for trend indicators with icons
  if (statCardContent.includes('ArrowUp') && statCardContent.includes('ArrowDown')) {
    console.log('✅ Trend indicator icons implemented');
  } else {
    console.log('❌ Trend indicator icons missing');
    issues.push('Trend indicator icons not implemented');
    allChecksPassed = false;
  }
  
  // Check for color-coded trends
  if (statCardContent.includes('text-income') && statCardContent.includes('text-expense')) {
    console.log('✅ Color-coded trend indicators implemented');
  } else {
    console.log('❌ Color-coded trend indicators missing');
    issues.push('Color-coded trend indicators not implemented');
    allChecksPassed = false;
  }
  
  // Check for accessibility features
  if (statCardContent.includes('aria-label') || statCardContent.includes('sr-only')) {
    console.log('✅ Accessibility features implemented');
  } else {
    console.log('❌ Accessibility features missing');
    issues.push('Accessibility features not implemented');
    allChecksPassed = false;
  }
  
} else {
  console.log('❌ StatCard component not found');
  issues.push('StatCard.tsx file not found');
  allChecksPassed = false;
}

// Check 4: Verify CSS classes for gradients exist
const tailwindConfigPath = path.join(__dirname, '../tailwind.config.js');
if (fs.existsSync(tailwindConfigPath)) {
  const tailwindContent = fs.readFileSync(tailwindConfigPath, 'utf8');
  
  // Check for gradient utilities
  if (tailwindContent.includes('gradient') || tailwindContent.includes('bg-gradient')) {
    console.log('✅ Gradient utilities configured in Tailwind');
  } else {
    console.log('❌ Gradient utilities missing from Tailwind config');
    issues.push('Gradient utilities not configured in Tailwind');
    allChecksPassed = false;
  }
} else {
  console.log('⚠️  Tailwind config not found - skipping gradient utility check');
}

// Check 5: Verify test files exist
const propertyTestPath = path.join(__dirname, 'task-9.6-unified-homepage-statistics-property.spec.ts');
const unitTestPath = path.join(__dirname, 'task-9.6-unified-homepage-statistics.spec.ts');

if (fs.existsSync(propertyTestPath)) {
  console.log('✅ Property-based test file created');
} else {
  console.log('❌ Property-based test file missing');
  issues.push('Property-based test file not found');
  allChecksPassed = false;
}

if (fs.existsSync(unitTestPath)) {
  console.log('✅ Unit test file created');
} else {
  console.log('❌ Unit test file missing');
  issues.push('Unit test file not found');
  allChecksPassed = false;
}

// Final validation summary
console.log('\n============================================================');
if (allChecksPassed) {
  console.log('🎉 Task 9.6 Validation: ALL CHECKS PASSED!');
  console.log('✅ UnifiedHomePage statistics styling implemented successfully');
  console.log('✅ Bold typography (font-weight 700+) for numerical values');
  console.log('✅ Gradient accents applied to key metrics');
  console.log('✅ Color-coded trend indicators with icons');
  console.log('✅ Responsive font sizes and proper StatCard integration');
  console.log('✅ Accessibility features for screen readers');
  console.log('✅ Property-based and unit tests created');
} else {
  console.log('❌ Task 9.6 Validation: ISSUES FOUND');
  console.log('\nIssues to address:');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
}
console.log('============================================================');

process.exit(allChecksPassed ? 0 : 1);