const fs = require('fs');
const path = require('path');

/**
 * Task 9.3: Smooth Scroll Animations Validation
 * 
 * Validates that smooth scroll behavior, fade-in animations for sections,
 * and stagger effects for dashboard cards are properly implemented.
 * 
 * Requirements: 9.3
 */

console.log('🔍 Task 9.3: Validating Smooth Scroll Animations Implementation...\n');

// File paths to check
const filesToCheck = [
  '../src/pages/UnifiedHomePage.tsx',
  '../src/index.css',
  '../src/components/ui/dashboard-grid.tsx',
  '../src/components/SummaryCards.tsx'
];

let allChecksPass = true;
const results = [];

// Check 1: Smooth scroll behavior in global CSS
console.log('📋 Check 1: Smooth scroll behavior in global CSS');
try {
  const cssContent = fs.readFileSync(path.join(__dirname, '../src/index.css'), 'utf8');
  
  const checks = [
    { pattern: /scroll-behavior:\s*smooth/, description: 'Global smooth scroll behavior' },
    { pattern: /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?scroll-behavior:\s*auto/, description: 'Reduced motion respect for scroll' },
    { pattern: /\.stagger-\d+\s*{[\s\S]*?animation-delay:/, description: 'Stagger animation utilities' },
    { pattern: /\.fade-in-on-scroll/, description: 'Scroll-triggered fade-in animation' },
    { pattern: /\.section-fade-in/, description: 'Section fade-in animation' }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(cssContent)) {
      console.log(`   ✅ ${check.description}: Found`);
      results.push(`✅ ${check.description}`);
    } else {
      console.log(`   ❌ ${check.description}: Missing`);
      results.push(`❌ ${check.description}`);
      allChecksPass = false;
    }
  });
} catch (error) {
  console.log(`   ❌ Error reading CSS file: ${error.message}`);
  allChecksPass = false;
}

console.log('');

// Check 2: Navigation links and smooth scroll function in UnifiedHomePage
console.log('📋 Check 2: Navigation and smooth scroll in UnifiedHomePage');
try {
  const homePageContent = fs.readFileSync(path.join(__dirname, '../src/pages/UnifiedHomePage.tsx'), 'utf8');
  
  const checks = [
    { pattern: /scrollToSection\s*=\s*\([^)]*\)\s*=>\s*{/, description: 'Smooth scroll function' },
    { pattern: /scrollIntoView\s*\(\s*{[\s\S]*?behavior:\s*['"]smooth['"]/, description: 'Smooth scroll behavior implementation' },
    { pattern: /onClick=\{\(\)\s*=>\s*scrollToSection\(['"][^'"]*['"]\)/, description: 'Navigation button click handlers' },
    { pattern: /id=['"]dashboard-section['"]/, description: 'Dashboard section ID' },
    { pattern: /id=['"]add-transaction-section['"]/, description: 'Add transaction section ID' },
    { pattern: /id=['"]transactions-section['"]/, description: 'Transactions section ID' },
    { pattern: /motion-safe:animate-fade-in/, description: 'Fade-in animations for sections' },
    { pattern: /animationDelay:\s*['"][0-9]+ms['"]/, description: 'Staggered animation delays' }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(homePageContent)) {
      console.log(`   ✅ ${check.description}: Found`);
      results.push(`✅ ${check.description}`);
    } else {
      console.log(`   ❌ ${check.description}: Missing`);
      results.push(`❌ ${check.description}`);
      allChecksPass = false;
    }
  });
} catch (error) {
  console.log(`   ❌ Error reading UnifiedHomePage file: ${error.message}`);
  allChecksPass = false;
}

console.log('');

// Check 3: Stagger animation support in DashboardGrid
console.log('📋 Check 3: Stagger animation support in DashboardGrid');
try {
  const dashboardGridContent = fs.readFileSync(path.join(__dirname, '../src/components/ui/dashboard-grid.tsx'), 'utf8');
  
  const checks = [
    { pattern: /enableStagger\?\s*:\s*boolean/, description: 'EnableStagger prop type' },
    { pattern: /staggerDelay\?\s*:\s*number/, description: 'StaggerDelay prop type' },
    { pattern: /enableStagger\s*=\s*false/, description: 'EnableStagger default value' },
    { pattern: /staggerDelay\s*=\s*100/, description: 'StaggerDelay default value' },
    { pattern: /React\.Children\.map\(children,\s*\(child,\s*index\)/, description: 'Children mapping for stagger' },
    { pattern: /animationDelay:\s*`\$\{index\s*\*\s*staggerDelay\}ms`/, description: 'Dynamic animation delay calculation' },
    { pattern: /motion-safe:animate-fade-in/, description: 'Fade-in animation class application' }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(dashboardGridContent)) {
      console.log(`   ✅ ${check.description}: Found`);
      results.push(`✅ ${check.description}`);
    } else {
      console.log(`   ❌ ${check.description}: Missing`);
      results.push(`❌ ${check.description}`);
      allChecksPass = false;
    }
  });
} catch (error) {
  console.log(`   ❌ Error reading DashboardGrid file: ${error.message}`);
  allChecksPass = false;
}

console.log('');

// Check 4: Stagger animation enabled in SummaryCards
console.log('📋 Check 4: Stagger animation enabled in SummaryCards');
try {
  const summaryCardsContent = fs.readFileSync(path.join(__dirname, '../src/components/SummaryCards.tsx'), 'utf8');
  
  const checks = [
    { pattern: /enableStagger=\{true\}/, description: 'EnableStagger prop set to true' },
    { pattern: /staggerDelay=\{150\}/, description: 'StaggerDelay prop set to 150ms' }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(summaryCardsContent)) {
      console.log(`   ✅ ${check.description}: Found`);
      results.push(`✅ ${check.description}`);
    } else {
      console.log(`   ❌ ${check.description}: Missing`);
      results.push(`❌ ${check.description}`);
      allChecksPass = false;
    }
  });
} catch (error) {
  console.log(`   ❌ Error reading SummaryCards file: ${error.message}`);
  allChecksPass = false;
}

console.log('');

// Summary
console.log('============================================================');
if (allChecksPass) {
  console.log('🎉 Task 9.3 Validation: ALL CHECKS PASSED!');
  console.log('✅ Smooth scroll behavior implemented globally');
  console.log('✅ Navigation links with smooth scroll functionality');
  console.log('✅ Fade-in animations for sections with staggered delays');
  console.log('✅ Stagger effects for dashboard cards');
  console.log('✅ Accessibility support with reduced motion preferences');
} else {
  console.log('❌ Task 9.3 Validation: SOME CHECKS FAILED');
  console.log('Please review the missing implementations above.');
}
console.log('============================================================');

// Exit with appropriate code
process.exit(allChecksPass ? 0 : 1);