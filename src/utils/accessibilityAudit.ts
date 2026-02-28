/**
 * Accessibility Audit Utilities
 * 
 * This module provides utilities for running automated accessibility tests
 * using axe-core and generating reports.
 */

import axe, { AxeResults, Result } from 'axe-core';

export interface AccessibilityIssue {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: any; // Changed from string[] to any to handle axe's complex selector types
    failureSummary: string;
  }>;
}

export interface AccessibilityReport {
  url: string;
  timestamp: string;
  violations: AccessibilityIssue[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  violationCount: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
}

/**
 * Run axe accessibility audit on the current page
 */
export async function runAccessibilityAudit(
  context?: any,
  options?: any
): Promise<AxeResults> {
  // @ts-ignore - axe.run types may not be perfectly aligned
  const results: AxeResults = await axe.run(context || document, options || {});
  return results;
}

/**
 * Format axe results into a readable report
 */
export function formatAccessibilityReport(
  results: AxeResults
): AccessibilityReport {
  const violations: AccessibilityIssue[] = results.violations.map((violation: Result) => ({
    id: violation.id,
    impact: violation.impact as 'minor' | 'moderate' | 'serious' | 'critical',
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map((node) => ({
      html: node.html,
      target: node.target, // Keep as-is, let TypeScript handle the type
      failureSummary: node.failureSummary || '',
    })),
  }));

  const criticalCount = violations.filter((v) => v.impact === 'critical').length;
  const seriousCount = violations.filter((v) => v.impact === 'serious').length;
  const moderateCount = violations.filter((v) => v.impact === 'moderate').length;
  const minorCount = violations.filter((v) => v.impact === 'minor').length;

  return {
    url: results.url,
    timestamp: results.timestamp,
    violations,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    inapplicable: results.inapplicable.length,
    violationCount: violations.length,
    criticalCount,
    seriousCount,
    moderateCount,
    minorCount,
  };
}

/**
 * Log accessibility report to console
 */
export function logAccessibilityReport(report: AccessibilityReport): void {
  console.group('🔍 Accessibility Audit Report');
  console.log(`URL: ${report.url}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Passes: ${report.passes}`);
  console.log(`  ❌ Violations: ${report.violationCount}`);
  console.log(`  ⚠️  Incomplete: ${report.incomplete}`);
  console.log(`  ➖ Inapplicable: ${report.inapplicable}`);

  if (report.violationCount > 0) {
    console.log(`\n🚨 Violations by Impact:`);
    if (report.criticalCount > 0) {
      console.log(`  🔴 Critical: ${report.criticalCount}`);
    }
    if (report.seriousCount > 0) {
      console.log(`  🟠 Serious: ${report.seriousCount}`);
    }
    if (report.moderateCount > 0) {
      console.log(`  🟡 Moderate: ${report.moderateCount}`);
    }
    if (report.minorCount > 0) {
      console.log(`  🟢 Minor: ${report.minorCount}`);
    }

    console.log(`\n📋 Detailed Violations:`);
    report.violations.forEach((violation, index) => {
      console.group(
        `${index + 1}. [${violation.impact.toUpperCase()}] ${violation.help}`
      );
      console.log(`ID: ${violation.id}`);
      console.log(`Description: ${violation.description}`);
      console.log(`Help: ${violation.helpUrl}`);
      console.log(`Affected elements: ${violation.nodes.length}`);
      violation.nodes.forEach((node, nodeIndex) => {
        console.log(`\n  Element ${nodeIndex + 1}:`);
        const targetStr = Array.isArray(node.target) ? node.target.join(' > ') : String(node.target);
        console.log(`    Target: ${targetStr}`);
        console.log(`    HTML: ${node.html}`);
        if (node.failureSummary) {
          console.log(`    Issue: ${node.failureSummary}`);
        }
      });
      console.groupEnd();
    });
  }

  console.groupEnd();
}

/**
 * Generate HTML report for accessibility audit
 */
export function generateHTMLReport(report: AccessibilityReport): string {
  const impactColors = {
    critical: '#d32f2f',
    serious: '#f57c00',
    moderate: '#fbc02d',
    minor: '#388e3c',
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
    .meta { color: #666; font-size: 14px; }
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
    .incomplete .value { color: #f57c00; }
    .violation {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid;
    }
    .violation.critical { border-left-color: ${impactColors.critical}; }
    .violation.serious { border-left-color: ${impactColors.serious}; }
    .violation.moderate { border-left-color: ${impactColors.moderate}; }
    .violation.minor { border-left-color: ${impactColors.minor}; }
    .violation h3 { margin: 0 0 10px 0; color: #333; }
    .impact-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      color: white;
      text-transform: uppercase;
    }
    .impact-badge.critical { background: ${impactColors.critical}; }
    .impact-badge.serious { background: ${impactColors.serious}; }
    .impact-badge.moderate { background: ${impactColors.moderate}; }
    .impact-badge.minor { background: ${impactColors.minor}; }
    .node {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-top: 10px;
      font-size: 14px;
    }
    .node code {
      background: #e0e0e0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }
    .help-link {
      color: #1976d2;
      text-decoration: none;
      font-size: 14px;
    }
    .help-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Accessibility Audit Report</h1>
    <div class="meta">
      <div><strong>URL:</strong> ${report.url}</div>
      <div><strong>Timestamp:</strong> ${new Date(report.timestamp).toLocaleString()}</div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card passes">
      <h3>Passes</h3>
      <div class="value">${report.passes}</div>
    </div>
    <div class="summary-card violations">
      <h3>Violations</h3>
      <div class="value">${report.violationCount}</div>
    </div>
    <div class="summary-card incomplete">
      <h3>Incomplete</h3>
      <div class="value">${report.incomplete}</div>
    </div>
    <div class="summary-card">
      <h3>Inapplicable</h3>
      <div class="value">${report.inapplicable}</div>
    </div>
  </div>

  ${
    report.violationCount > 0
      ? `
  <h2>Violations by Impact</h2>
  <div class="summary">
    ${
      report.criticalCount > 0
        ? `<div class="summary-card"><h3>Critical</h3><div class="value" style="color: ${impactColors.critical}">${report.criticalCount}</div></div>`
        : ''
    }
    ${
      report.seriousCount > 0
        ? `<div class="summary-card"><h3>Serious</h3><div class="value" style="color: ${impactColors.serious}">${report.seriousCount}</div></div>`
        : ''
    }
    ${
      report.moderateCount > 0
        ? `<div class="summary-card"><h3>Moderate</h3><div class="value" style="color: ${impactColors.moderate}">${report.moderateCount}</div></div>`
        : ''
    }
    ${
      report.minorCount > 0
        ? `<div class="summary-card"><h3>Minor</h3><div class="value" style="color: ${impactColors.minor}">${report.minorCount}</div></div>`
        : ''
    }
  </div>

  <h2>Detailed Violations</h2>
  ${report.violations
    .map(
      (violation, index) => `
    <div class="violation ${violation.impact}">
      <h3>
        ${index + 1}. ${violation.help}
        <span class="impact-badge ${violation.impact}">${violation.impact}</span>
      </h3>
      <p>${violation.description}</p>
      <p><a href="${violation.helpUrl}" target="_blank" class="help-link">Learn more →</a></p>
      <p><strong>Affected elements:</strong> ${violation.nodes.length}</p>
      ${violation.nodes
        .map(
          (node, nodeIndex) => {
            const targetStr = Array.isArray(node.target) ? node.target.join(' > ') : String(node.target);
            return `
        <div class="node">
          <strong>Element ${nodeIndex + 1}:</strong><br>
          <strong>Target:</strong> <code>${targetStr}</code><br>
          <strong>HTML:</strong> <code>${node.html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
          ${node.failureSummary ? `<br><strong>Issue:</strong> ${node.failureSummary}` : ''}
        </div>
      `;
          }
        )
        .join('')}
    </div>
  `
    )
    .join('')}
  `
      : '<h2>✅ No violations found!</h2>'
  }
</body>
</html>
  `;
}

/**
 * Check keyboard navigation support
 */
export function checkKeyboardNavigation(): {
  focusableElements: number;
  elementsWithTabIndex: number;
  elementsWithNegativeTabIndex: number;
  issues: string[];
} {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  const focusableElements = document.querySelectorAll(focusableSelectors.join(','));
  const elementsWithTabIndex = document.querySelectorAll('[tabindex]');
  const elementsWithNegativeTabIndex = document.querySelectorAll('[tabindex="-1"]');

  const issues: string[] = [];

  // Check for positive tabindex values (anti-pattern)
  const positiveTabIndex = Array.from(elementsWithTabIndex).filter((el) => {
    const tabIndex = parseInt(el.getAttribute('tabindex') || '0');
    return tabIndex > 0;
  });

  if (positiveTabIndex.length > 0) {
    issues.push(
      `Found ${positiveTabIndex.length} elements with positive tabindex (anti-pattern)`
    );
  }

  // Check for interactive elements without keyboard support
  const interactiveElements = document.querySelectorAll('[onclick], [role="button"]');
  const nonKeyboardAccessible = Array.from(interactiveElements).filter((el) => {
    const tagName = el.tagName.toLowerCase();
    const role = el.getAttribute('role');
    const tabIndex = el.getAttribute('tabindex');

    // If it's a native button or link, it's fine
    if (tagName === 'button' || tagName === 'a') return false;

    // If it has role="button" but no tabindex, it's not keyboard accessible
    if (role === 'button' && !tabIndex) return true;

    return false;
  });

  if (nonKeyboardAccessible.length > 0) {
    issues.push(
      `Found ${nonKeyboardAccessible.length} interactive elements without keyboard support`
    );
  }

  return {
    focusableElements: focusableElements.length,
    elementsWithTabIndex: elementsWithTabIndex.length,
    elementsWithNegativeTabIndex: elementsWithNegativeTabIndex.length,
    issues,
  };
}

/**
 * Check color contrast
 */
export async function checkColorContrast(): Promise<AxeResults> {
  return await axe.run(document, {
    runOnly: ['color-contrast'],
  });
}

/**
 * Check ARIA attributes
 */
export async function checkARIA(): Promise<AxeResults> {
  return await axe.run(document, {
    runOnly: ['aria'],
  });
}
