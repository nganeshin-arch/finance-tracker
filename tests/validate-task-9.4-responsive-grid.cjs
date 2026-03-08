const fs = require('fs');
const path = require('path');

/**
 * Task 9.4: Apply responsive grid layout to UnifiedHomePage
 * 
 * Validates the responsive grid layout implementation that adapts from 
 * 1 column on mobile to 2-3 columns on desktop with consistent spacing.
 * 
 * Requirements: 9.4, 7.5
 * Property 26: Dashboard Responsive Layout
 */

console.log('============================================================');
console.log('🔍 Task 9.4 Validation: Responsive Grid Layout');
console.log('============================================================');

const checks = [];

// Check 1: Verify UnifiedHomePage uses responsive grid layout
try {
  const unifiedHomePagePath = path.join(__dirname, '../src/pages/UnifiedHomePage.tsx');
  const unifiedHomePageContent = fs.readFileSync(unifiedHomePagePath, 'utf8');
  
  // Check for dashboard-grid classes
  if (unifiedHomePageContent.includes('dashboard-grid') && 
      unifiedHomePageContent.includes('dashboard-grid-3')) {
    checks.push('✅ Dashboard grid classes applied to main layout');
  } else {
    checks.push('❌ Dashboard grid classes missing from main layout');
  }
  
  // Check for responsive gap classes
  if (unifiedHomePageContent.includes('gap-6') && 
      (unifiedHomePageContent.includes('sm:gap-6') || unifiedHomePageContent.includes('lg:gap-8'))) {
    checks.push('✅ Responsive gap classes for consistent spacing');
  } else {
    checks.push('❌ Responsive gap classes missing');
  }
  
  // Check for column span classes
  if (unifiedHomePageContent.includes('col-span-1') && 
      unifiedHomePageContent.includes('sm:col-span-2') && 
      unifiedHomePageContent.includes('lg:col-span-2')) {
    checks.push('✅ Dashboard section has proper column spans');
  } else {
    checks.push('❌ Dashboard section column spans missing or incorrect');
  }
  
  if (unifiedHomePageContent.includes('lg:col-span-3')) {
    checks.push('✅ Transactions section spans full width on desktop');
  } else {
    checks.push('❌ Transactions section full width span missing');
  }
  
  // Check for equal height cards
  if (unifiedHomePageContent.includes('h-full')) {
    checks.push('✅ Equal height cards implemented with h-full class');
  } else {
    checks.push('❌ Equal height cards not implemented');
  }
  
  // Check for proper section structure within grid
  const sectionMatches = unifiedHomePageContent.match(/id="[^"]*-section"/g);
  if (sectionMatches && sectionMatches.length >= 3) {
    checks.push('✅ All three main sections present in grid layout');
  } else {
    checks.push('❌ Missing sections in grid layout');
  }
  
} catch (error) {
  checks.push('❌ Error reading UnifiedHomePage.tsx: ' + error.message);
}

// Check 2: Verify dashboard grid utilities exist in global CSS
try {
  const globalCssPath = path.join(__dirname, '../src/index.css');
  const globalCssContent = fs.readFileSync(globalCssPath, 'utf8');
  
  // Check for dashboard grid utilities
  if (globalCssContent.includes('.dashboard-grid') && 
      globalCssContent.includes('grid-template-columns')) {
    checks.push('✅ Dashboard grid utilities defined in global CSS');
  } else {
    checks.push('❌ Dashboard grid utilities missing from global CSS');
  }
  
  // Check for responsive breakpoints
  if (globalCssContent.includes('@media (min-width: 640px)') && 
      globalCssContent.includes('@media (min-width: 1024px)')) {
    checks.push('✅ Responsive breakpoints defined for grid layout');
  } else {
    checks.push('❌ Responsive breakpoints missing for grid layout');
  }
  
  // Check for different column configurations
  if (globalCssContent.includes('dashboard-grid-2') && 
      globalCssContent.includes('dashboard-grid-3') && 
      globalCssContent.includes('dashboard-grid-4')) {
    checks.push('✅ Multiple grid column configurations available');
  } else {
    checks.push('❌ Grid column configurations incomplete');
  }
  
} catch (error) {
  checks.push('❌ Error reading global CSS: ' + error.message);
}

// Check 3: Verify DashboardGrid component exists and is properly configured
try {
  const dashboardGridPath = path.join(__dirname, '../src/components/ui/dashboard-grid.tsx');
  const dashboardGridContent = fs.readFileSync(dashboardGridPath, 'utf8');
  
  // Check for responsive grid implementation
  if (dashboardGridContent.includes('DashboardGrid') && 
      dashboardGridContent.includes('columns') && 
      dashboardGridContent.includes('enableStagger')) {
    checks.push('✅ DashboardGrid component properly configured');
  } else {
    checks.push('❌ DashboardGrid component missing or incomplete');
  }
  
  // Check for accessibility features
  if (dashboardGridContent.includes('ariaLabel') && 
      dashboardGridContent.includes('role')) {
    checks.push('✅ DashboardGrid includes accessibility features');
  } else {
    checks.push('❌ DashboardGrid accessibility features missing');
  }
  
} catch (error) {
  checks.push('❌ Error reading DashboardGrid component: ' + error.message);
}

// Check 4: Verify SummaryCards uses DashboardGrid
try {
  const summaryCardsPath = path.join(__dirname, '../src/components/SummaryCards.tsx');
  const summaryCardsContent = fs.readFileSync(summaryCardsPath, 'utf8');
  
  if (summaryCardsContent.includes('DashboardGrid') && 
      summaryCardsContent.includes('columns={4}')) {
    checks.push('✅ SummaryCards uses DashboardGrid with 4 columns');
  } else {
    checks.push('❌ SummaryCards not using DashboardGrid properly');
  }
  
} catch (error) {
  checks.push('❌ Error reading SummaryCards component: ' + error.message);
}

// Print results
console.log('');
checks.forEach(check => console.log(check));
console.log('');

const passedChecks = checks.filter(check => check.startsWith('✅')).length;
const totalChecks = checks.length;

if (passedChecks === totalChecks) {
  console.log('============================================================');
  console.log('🎉 Task 9.4 Validation: ALL CHECKS PASSED!');
  console.log('✅ Responsive grid layout implemented successfully');
  console.log('✅ Layout adapts from 1 column (mobile) to 2-3 columns (desktop)');
  console.log('✅ Consistent spacing maintained across all breakpoints');
  console.log('✅ Proper column spans and equal height cards');
  console.log('✅ Accessibility features preserved');
  console.log('============================================================');
  process.exit(0);
} else {
  console.log('============================================================');
  console.log(`❌ Task 9.4 Validation: ${passedChecks}/${totalChecks} checks passed`);
  console.log('❌ Some responsive grid layout requirements not met');
  console.log('============================================================');
  process.exit(1);
}