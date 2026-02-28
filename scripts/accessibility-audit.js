/**
 * Automated Accessibility Audit Script
 * 
 * This script runs accessibility tests on all pages of the application
 * and generates a comprehensive report.
 * 
 * Usage: node scripts/accessibility-audit.js
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.VITE_APP_URL || 'http://localhost:5173';

const pages = [
  { name: 'Dashboard', path: '/' },
  { name: 'Transactions', path: '/transactions' },
  { name: 'Admin Panel', path: '/admin' },
];

async function injectAxe(page) {
  await page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.3/axe.min.js'
  });
}

async function runAxe(page) {
  return await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run();
  });
}

function generateHTMLReport(allResults) {
  const totalViolations = allResults.reduce((sum, r) => sum + r.violations.length, 0);
  const totalPasses = allResults.reduce((sum, r) => sum + r.passes, 0);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { margin: 0 0 10px 0; color: #333; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; }
    .summary-card .value { font-size: 32px; font-weight: bold; }
    .passes .value { color: #388e3c; }
    .violations .value { color: #d32f2f; }
    .page-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .violation {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 10px;
      border-left: 4px solid;
    }
    .violation.critical { border-left-color: #d32f2f; }
    .violation.serious { border-left-color: #f57c00; }
    .violation.moderate { border-left-color: #fbc02d; }
    .violation.minor { border-left-color: #388e3c; }
    .impact-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      color: white;
      text-transform: uppercase;
      margin-left: 10px;
    }
    .impact-badge.critical { background: #d32f2f; }
    .impact-badge.serious { background: #f57c00; }
    .impact-badge.moderate { background: #fbc02d; }
    .impact-badge.minor { background: #388e3c; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Accessibility Audit Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="summary">
    <div class="summary-card passes">
      <h3>Total Passes</h3>
      <div class="value">${totalPasses}</div>
    </div>
    <div class="summary-card violations">
      <h3>Total Violations</h3>
      <div class="value">${totalViolations}</div>
    </div>
    <div class="summary-card">
      <h3>Pages Tested</h3>
      <div class="value">${allResults.length}</div>
    </div>
  </div>

  ${allResults.map(result => `
    <div class="page-section">
      <h2>${result.pageName}</h2>
      <p><strong>URL:</strong> ${result.url}</p>
      <p><strong>Passes:</strong> ${result.passes} | <strong>Violations:</strong> ${result.violations.length}</p>
      
      ${result.violations.length > 0 ? `
        <h3>Violations</h3>
        ${result.violations.map((v, i) => `
          <div class="violation ${v.impact}">
            <strong>${i + 1}. ${v.help}</strong>
            <span class="impact-badge ${v.impact}">${v.impact}</span>
            <p>${v.description}</p>
            <p><small>Affected elements: ${v.nodes.length}</small></p>
            <p><a href="${v.helpUrl}" target="_blank">Learn more →</a></p>
          </div>
        `).join('')}
      ` : '<p>✅ No violations found!</p>'}
    </div>
  `).join('')}
</body>
</html>
  `;
}

async function main() {
  console.log('🚀 Starting accessibility audit...\n');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const allResults = [];

  for (const pageInfo of pages) {
    console.log(`Testing: ${pageInfo.name} (${pageInfo.path})`);
    
    const page = await context.newPage();
    await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'networkidle' });
    
    // Wait for page to be fully loaded
    await page.waitForTimeout(2000);
    
    // Inject axe-core
    await injectAxe(page);
    
    // Run accessibility tests
    const results = await runAxe(page);
    
    allResults.push({
      pageName: pageInfo.name,
      url: `${BASE_URL}${pageInfo.path}`,
      passes: results.passes.length,
      violations: results.violations,
    });
    
    console.log(`  ✅ Passes: ${results.passes.length}`);
    console.log(`  ❌ Violations: ${results.violations.length}`);
    
    if (results.violations.length > 0) {
      const critical = results.violations.filter(v => v.impact === 'critical').length;
      const serious = results.violations.filter(v => v.impact === 'serious').length;
      const moderate = results.violations.filter(v => v.impact === 'moderate').length;
      const minor = results.violations.filter(v => v.impact === 'minor').length;
      
      if (critical > 0) console.log(`    🔴 Critical: ${critical}`);
      if (serious > 0) console.log(`    🟠 Serious: ${serious}`);
      if (moderate > 0) console.log(`    🟡 Moderate: ${moderate}`);
      if (minor > 0) console.log(`    🟢 Minor: ${minor}`);
    }
    console.log('');
    
    await page.close();
  }

  await browser.close();

  // Generate report
  const reportDir = join(process.cwd(), 'frontend', 'accessibility-reports');
  try {
    mkdirSync(reportDir, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }

  const reportPath = join(reportDir, `accessibility-report-${Date.now()}.html`);
  const html = generateHTMLReport(allResults);
  writeFileSync(reportPath, html);

  console.log(`\n📄 Report generated: ${reportPath}`);
  console.log('\n✨ Accessibility audit complete!');
  
  // Exit with error code if there are violations
  const totalViolations = allResults.reduce((sum, r) => sum + r.violations.length, 0);
  if (totalViolations > 0) {
    console.log(`\n⚠️  Found ${totalViolations} accessibility violations`);
    process.exit(1);
  }
}

main().catch(console.error);