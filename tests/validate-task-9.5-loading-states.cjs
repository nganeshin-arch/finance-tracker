/**
 * Task 9.5: Loading States Validation Script
 * 
 * Validates the implementation of loading states in UnifiedHomePage:
 * - Skeleton screens for dashboard sections during data load
 * - Fade-in animations when data loads  
 * - Smooth transitions to loading state changes
 * 
 * Requirements: 9.5, 3.5
 */

const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('🔍 Task 9.5: Loading States Implementation Validation');
console.log('============================================================\n');

// File paths
const unifiedHomePagePath = path.join(__dirname, '../src/pages/UnifiedHomePage.tsx');
const summaryCardsPath = path.join(__dirname, '../src/components/SummaryCards.tsx');
const globalCssPath = path.join(__dirname, '../src/index.css');

let allChecksPass = true;

function checkFile(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${description}: File not found`);
    allChecksPass = false;
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
}

function validateCheck(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
  } else {
    console.log(`❌ ${message}`);
    allChecksPass = false;
  }
  return condition;
}

// 1. Validate UnifiedHomePage loading states implementation
console.log('📄 Validating UnifiedHomePage.tsx...');
const unifiedHomePageContent = checkFile(unifiedHomePagePath, 'UnifiedHomePage.tsx');

if (unifiedHomePageContent) {
  // Check for loading state management
  validateCheck(
    unifiedHomePageContent.includes('transactionsLoading'),
    'Uses transactionsLoading from useTransactions hook'
  );
  
  validateCheck(
    unifiedHomePageContent.includes('hasInitialData'),
    'Implements hasInitialData state for smooth transitions'
  );
  
  // Check for skeleton components
  validateCheck(
    unifiedHomePageContent.includes('SummaryCardsSkeleton'),
    'Implements SummaryCardsSkeleton component'
  );
  
  validateCheck(
    unifiedHomePageContent.includes('DualPieChartSkeleton'),
    'Implements DualPieChartSkeleton component'
  );
  
  validateCheck(
    unifiedHomePageContent.includes('TransactionTableSkeleton'),
    'Implements TransactionTableSkeleton component'
  );
  
  // Check for conditional rendering
  validateCheck(
    unifiedHomePageContent.includes('transactionsLoading ?') && 
    unifiedHomePageContent.includes('Skeleton') &&
    unifiedHomePageContent.includes('animate-fade-in'),
    'Implements conditional rendering with loading states and animations'
  );
  
  // Check for shimmer animations
  validateCheck(
    unifiedHomePageContent.includes('animate-shimmer'),
    'Uses shimmer animations for skeleton elements'
  );
  
  // Check for staggered animations
  validateCheck(
    unifiedHomePageContent.includes('animationDelay') || 
    unifiedHomePageContent.includes('animation-delay'),
    'Implements staggered animation delays'
  );
  
  // Check for fade-in animations
  validateCheck(
    unifiedHomePageContent.includes('animate-fade-in-up') ||
    unifiedHomePageContent.includes('fadeInUp'),
    'Uses fade-in-up animations for loading states'
  );
}

console.log('\n📄 Validating SummaryCards.tsx...');
const summaryCardsContent = checkFile(summaryCardsPath, 'SummaryCards.tsx');

if (summaryCardsContent) {
  // Check for loading prop
  validateCheck(
    summaryCardsContent.includes('isLoading') &&
    summaryCardsContent.includes('isLoading?'),
    'Accepts isLoading prop for loading state management'
  );
  
  // Check for data loaded state
  validateCheck(
    summaryCardsContent.includes('isDataLoaded') &&
    summaryCardsContent.includes('setIsDataLoaded'),
    'Implements isDataLoaded state for smooth transitions'
  );
  
  // Check for transition wrapper
  validateCheck(
    summaryCardsContent.includes('transition-all') &&
    summaryCardsContent.includes('opacity-100') &&
    summaryCardsContent.includes('translate-y-0'),
    'Wraps content with smooth transition classes'
  );
}

console.log('\n📄 Validating global CSS animations...');
const globalCssContent = checkFile(globalCssPath, 'index.css');

if (globalCssContent) {
  // Check for fadeInUp keyframe
  validateCheck(
    globalCssContent.includes('@keyframes fadeInUp') &&
    globalCssContent.includes('translateY(20px)') &&
    globalCssContent.includes('translateY(0)'),
    'Defines fadeInUp keyframe animation'
  );
  
  // Check for shimmer keyframe
  validateCheck(
    globalCssContent.includes('@keyframes shimmer') &&
    globalCssContent.includes('background-position'),
    'Defines shimmer keyframe animation'
  );
  
  // Check for animation utility classes
  validateCheck(
    globalCssContent.includes('.animate-fade-in-up') &&
    globalCssContent.includes('fadeInUp'),
    'Defines fade-in-up animation utility class'
  );
  
  validateCheck(
    globalCssContent.includes('.animate-shimmer') &&
    globalCssContent.includes('shimmer'),
    'Defines shimmer animation utility class'
  );
  
  // Check for animation timing
  validateCheck(
    globalCssContent.includes('0.5s ease-out') ||
    globalCssContent.includes('0.8s ease-out'),
    'Uses appropriate animation timing (0.5s-0.8s ease-out)'
  );
}

// 2. Validate test files exist
console.log('\n📄 Validating test files...');
const testFiles = [
  'task-9.5-loading-states.spec.ts',
  'task-9.5-loading-states-property.spec.ts',
  'verify-task-9.5-loading-states.html',
  'TASK_9.5_LOADING_STATES_COMPLETION.md'
];

testFiles.forEach(testFile => {
  const testPath = path.join(__dirname, testFile);
  validateCheck(
    fs.existsSync(testPath),
    `Test file exists: ${testFile}`
  );
});

// 3. Validate property-based test content
console.log('\n📄 Validating property-based tests...');
const propertyTestPath = path.join(__dirname, 'task-9.5-loading-states-property.spec.ts');
const propertyTestContent = checkFile(propertyTestPath, 'Property-based test');

if (propertyTestContent) {
  validateCheck(
    propertyTestContent.includes('Property 10: Loading Animation Presence'),
    'Implements Property 10: Loading Animation Presence test'
  );
  
  validateCheck(
    propertyTestContent.includes('animate-shimmer') &&
    propertyTestContent.includes('animate-pulse') &&
    propertyTestContent.includes('animate-fade-in'),
    'Tests for loading animation classes'
  );
  
  validateCheck(
    propertyTestContent.includes('fc.assert') &&
    propertyTestContent.includes('fc.asyncProperty'),
    'Uses fast-check for property-based testing'
  );
  
  validateCheck(
    propertyTestContent.includes('role="status"') &&
    propertyTestContent.includes('aria-live') &&
    propertyTestContent.includes('aria-label'),
    'Tests accessibility attributes for loading states'
  );
}

// 4. Validate skeleton component structure
console.log('\n📄 Validating skeleton component structure...');
if (unifiedHomePageContent) {
  // Check SummaryCardsSkeleton structure
  const summarySkeletonMatch = unifiedHomePageContent.match(/const SummaryCardsSkeleton[\s\S]*?};/);
  if (summarySkeletonMatch) {
    const skeletonContent = summarySkeletonMatch[0];
    validateCheck(
      skeletonContent.includes('dashboard-grid-4') &&
      skeletonContent.includes('[...Array(4)]'),
      'SummaryCardsSkeleton uses 4-card grid layout'
    );
    
    validateCheck(
      skeletonContent.includes('animate-shimmer') &&
      skeletonContent.includes('animate-fade-in-up'),
      'SummaryCardsSkeleton uses shimmer and fade-in animations'
    );
  }
  
  // Check DualPieChartSkeleton structure
  const chartSkeletonMatch = unifiedHomePageContent.match(/const DualPieChartSkeleton[\s\S]*?};/);
  if (chartSkeletonMatch) {
    const skeletonContent = chartSkeletonMatch[0];
    validateCheck(
      skeletonContent.includes('grid-cols-1 md:grid-cols-2') &&
      skeletonContent.includes('[...Array(2)]'),
      'DualPieChartSkeleton uses 2-column responsive grid'
    );
    
    validateCheck(
      skeletonContent.includes('rounded-full') &&
      skeletonContent.includes('h-32 w-32'),
      'DualPieChartSkeleton includes circular chart placeholders'
    );
  }
  
  // Check TransactionTableSkeleton structure
  const tableSkeletonMatch = unifiedHomePageContent.match(/const TransactionTableSkeleton[\s\S]*?};/);
  if (tableSkeletonMatch) {
    const skeletonContent = tableSkeletonMatch[0];
    validateCheck(
      skeletonContent.includes('[...Array(5)]') &&
      skeletonContent.includes('space-y-3'),
      'TransactionTableSkeleton shows 5 rows with proper spacing'
    );
  }
}

// 5. Final validation summary
console.log('\n============================================================');
if (allChecksPass) {
  console.log('🎉 Task 9.5 Validation: ALL CHECKS PASSED!');
  console.log('✅ Loading states implemented successfully');
  console.log('✅ Skeleton screens for dashboard sections during data load');
  console.log('✅ Fade-in animations when data loads');
  console.log('✅ Smooth transitions to loading state changes');
  console.log('✅ Shimmer animations for premium loading experience');
  console.log('✅ Staggered animation delays for dashboard cards');
  console.log('✅ Accessibility attributes for loading states');
  console.log('✅ Property-based tests for universal loading behavior');
} else {
  console.log('❌ Task 9.5 Validation: SOME CHECKS FAILED');
  console.log('Please review the failed checks above and fix the issues.');
}
console.log('============================================================');

process.exit(allChecksPass ? 0 : 1);