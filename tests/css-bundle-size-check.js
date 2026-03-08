const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * CSS Bundle Size Verification
 * Validates: Requirements 12.6
 * 
 * Checks that the total CSS bundle size remains under 100KB compressed
 */

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function getCompressedSize(content) {
  return zlib.gzipSync(content).length;
}

function analyzeCSSBundle() {
  const results = {
    files: [],
    totalUncompressed: 0,
    totalCompressed: 0,
    isUnderLimit: false,
    limit: 100 * 1024, // 100KB
  };

  // Check main CSS files
  const cssFiles = [
    'src/index.css',
  ];

  // Find built CSS files dynamically
  const distAssetsPath = path.join(__dirname, '..', 'dist', 'assets');
  if (fs.existsSync(distAssetsPath)) {
    const distFiles = fs.readdirSync(distAssetsPath);
    const builtCssFiles = distFiles.filter(file => file.endsWith('.css'));
    builtCssFiles.forEach(file => {
      cssFiles.push(`dist/assets/${file}`);
    });
  }

  cssFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const uncompressed = content.length;
      const compressed = getCompressedSize(content);

      results.files.push({
        path: filePath,
        uncompressed,
        compressed,
        uncompressedKB: (uncompressed / 1024).toFixed(2),
        compressedKB: (compressed / 1024).toFixed(2),
      });

      results.totalUncompressed += uncompressed;
      results.totalCompressed += compressed;
    }
  });

  results.isUnderLimit = results.totalCompressed <= results.limit;
  results.totalUncompressedKB = (results.totalUncompressed / 1024).toFixed(2);
  results.totalCompressedKB = (results.totalCompressed / 1024).toFixed(2);
  results.limitKB = (results.limit / 1024).toFixed(2);

  return results;
}

function generateReport() {
  const results = analyzeCSSBundle();
  
  console.log('\n=== CSS Bundle Size Analysis ===');
  console.log(`Target: Under ${results.limitKB}KB compressed`);
  console.log(`Status: ${results.isUnderLimit ? '✅ PASS' : '❌ FAIL'}`);
  console.log('\nFile Details:');
  
  results.files.forEach(file => {
    console.log(`  ${file.path}:`);
    console.log(`    Uncompressed: ${file.uncompressedKB}KB`);
    console.log(`    Compressed: ${file.compressedKB}KB`);
  });
  
  console.log(`\nTotals:`);
  console.log(`  Uncompressed: ${results.totalUncompressedKB}KB`);
  console.log(`  Compressed: ${results.totalCompressedKB}KB`);
  console.log(`  Limit: ${results.limitKB}KB`);
  console.log(`  Under Limit: ${results.isUnderLimit ? 'Yes' : 'No'}`);
  
  if (!results.isUnderLimit) {
    console.log('\n⚠️  CSS bundle exceeds size limit!');
    console.log('Consider:');
    console.log('- Removing unused CSS rules');
    console.log('- Optimizing gradient definitions');
    console.log('- Consolidating similar styles');
    console.log('- Using CSS purging tools');
  }
  
  return results;
}

// Export for use in tests
module.exports = { analyzeCSSBundle, generateReport };

// Run if called directly
if (require.main === module) {
  generateReport();
}