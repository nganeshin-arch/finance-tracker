const fs = require('fs');
const path = require('path');

console.log('🔍 Task 9.7: Simple Validation...\n');

// Check UnifiedHomePage
const homePagePath = path.join(__dirname, '../src/pages/UnifiedHomePage.tsx');
if (fs.existsSync(homePagePath)) {
  const content = fs.readFileSync(homePagePath, 'utf8');
  console.log('✅ UnifiedHomePage.tsx exists');
  
  if (content.includes('scrollToSection')) {
    console.log('✅ scrollToSection function found');
  }
  
  if (content.includes('scrollIntoView')) {
    console.log('✅ scrollIntoView implementation found');
  }
  
  if (content.includes('motion-safe:animate-fade-in')) {
    console.log('✅ Fade-in animations found');
  }
  
  if (content.includes('animationDelay')) {
    console.log('✅ Animation delays found');
  }
}

// Check CSS
const cssPath = path.join(__dirname, '../src/index.css');
if (fs.existsSync(cssPath)) {
  const content = fs.readFileSync(cssPath, 'utf8');
  console.log('✅ index.css exists');
  
  if (content.includes('scroll-behavior: smooth')) {
    console.log('✅ Smooth scroll behavior found');
  }
  
  if (content.includes('prefers-reduced-motion')) {
    console.log('✅ Reduced motion support found');
  }
}

// Check test file
const testPath = path.join(__dirname, 'task-9.7-unified-homepage-scroll-animations-property.spec.ts');
if (fs.existsSync(testPath)) {
  console.log('✅ Property-based test file exists');
}

console.log('\n🎉 Basic validation complete!');