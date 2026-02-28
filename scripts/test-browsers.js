/**
 * Cross-Browser Testing Script
 * Automated checks for browser compatibility
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🌐 Cross-Browser Testing Script\n');

// Check if build exists
console.log('1. Checking build...');
try {
  const distPath = join(__dirname, '..', 'dist');
  const indexPath = join(distPath, 'index.html');
  readFileSync(indexPath, 'utf-8');
  console.log('✓ Build exists\n');
} catch (error) {
  console.log('✗ Build not found. Running build...');
  execSync('npm run build', { stdio: 'inherit', cwd: join(__dirname, '..') });
  console.log('✓ Build complete\n');
}

// Check browserslist configuration
console.log('2. Checking browserslist configuration...');
try {
  const browserslistPath = join(__dirname, '..', '.browserslistrc');
  const browserslist = readFileSync(browserslistPath, 'utf-8');
  console.log('✓ Browserslist configured');
  console.log('  Supported browsers:');
  browserslist.split('\n')
    .filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('['))
    .forEach(line => console.log(`    - ${line.trim()}`));
  console.log('');
} catch (error) {
  console.log('✗ Browserslist not configured\n');
}

// Check autoprefixer
console.log('3. Checking autoprefixer...');
try {
  const postcssPath = join(__dirname, '..', 'postcss.config.js');
  const postcss = readFileSync(postcssPath, 'utf-8');
  if (postcss.includes('autoprefixer')) {
    console.log('✓ Autoprefixer configured\n');
  } else {
    console.log('✗ Autoprefixer not found in PostCSS config\n');
  }
} catch (error) {
  console.log('✗ PostCSS config not found\n');
}

// Check for vendor prefixes in built CSS
console.log('4. Checking for vendor prefixes in build...');
try {
  const distPath = join(__dirname, '..', 'dist');
  const cssFiles = execSync(`dir /s /b "${distPath}\\*.css"`, { encoding: 'utf-8' })
    .split('\n')
    .filter(f => f.trim());
  
  let prefixesFound = false;
  for (const cssFile of cssFiles) {
    if (!cssFile.trim()) continue;
    try {
      const css = readFileSync(cssFile.trim(), 'utf-8');
      if (css.includes('-webkit-') || css.includes('-moz-') || css.includes('-ms-')) {
        prefixesFound = true;
        break;
      }
    } catch (e) {
      // Skip files that can't be read
    }
  }
  
  if (prefixesFound) {
    console.log('✓ Vendor prefixes found in CSS\n');
  } else {
    console.log('⚠ No vendor prefixes found (may not be needed)\n');
  }
} catch (error) {
  console.log('⚠ Could not check CSS files\n');
}

// Check for polyfills
console.log('5. Checking for polyfills...');
try {
  const packagePath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
  const hasPolyfills = Object.keys(packageJson.dependencies || {}).some(
    dep => dep.includes('polyfill') || dep.includes('core-js')
  );
  
  if (hasPolyfills) {
    console.log('✓ Polyfills found\n');
  } else {
    console.log('⚠ No polyfills detected (modern browsers only)\n');
  }
} catch (error) {
  console.log('✗ Could not check package.json\n');
}

// Summary
console.log('═══════════════════════════════════════════════════');
console.log('Cross-Browser Testing Checklist:');
console.log('═══════════════════════════════════════════════════');
console.log('');
console.log('Manual Testing Required:');
console.log('  [ ] Test on Chrome (latest)');
console.log('  [ ] Test on Firefox (latest)');
console.log('  [ ] Test on Safari (latest)');
console.log('  [ ] Test on Edge (latest)');
console.log('');
console.log('Responsive Testing:');
console.log('  [ ] Mobile (320px - 639px)');
console.log('  [ ] Tablet (640px - 1023px)');
console.log('  [ ] Desktop (1024px+)');
console.log('');
console.log('Feature Testing:');
console.log('  [ ] All pages load without errors');
console.log('  [ ] Forms submit correctly');
console.log('  [ ] Charts render properly');
console.log('  [ ] Animations work smoothly');
console.log('  [ ] Dark mode toggle works');
console.log('');
console.log('Next Steps:');
console.log('  1. Start the preview server: npm run preview');
console.log('  2. Open http://localhost:4173 in each browser');
console.log('  3. Navigate to /browser-test for testing utilities');
console.log('  4. Follow the checklist in CROSS_BROWSER_TESTING.md');
console.log('');
