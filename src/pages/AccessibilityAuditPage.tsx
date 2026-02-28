import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  runAccessibilityAudit,
  formatAccessibilityReport,
  logAccessibilityReport,
  generateHTMLReport,
  checkKeyboardNavigation,
  type AccessibilityReport,
} from '../utils/accessibilityAudit';
import { AlertCircle, CheckCircle, Download, Play, Keyboard } from 'lucide-react';

export const AccessibilityAuditPage: React.FC = () => {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [keyboardCheck, setKeyboardCheck] = useState<any>(null);

  const runAudit = async () => {
    setIsRunning(true);
    try {
      const results = await runAccessibilityAudit();
      const formattedReport = formatAccessibilityReport(results);
      setReport(formattedReport);
      logAccessibilityReport(formattedReport);
    } catch (error) {
      console.error('Failed to run accessibility audit:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const checkKeyboard = () => {
    const results = checkKeyboardNavigation();
    setKeyboardCheck(results);
    console.log('Keyboard Navigation Check:', results);
  };

  const downloadReport = () => {
    if (!report) return;

    const html = generateHTMLReport(report);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // Auto-run audit on page load
    runAudit();
    checkKeyboard();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Accessibility Audit</h1>
        <p className="text-muted-foreground">
          Automated accessibility testing using axe-core
        </p>
      </div>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Run accessibility tests and generate reports</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={runAudit} disabled={isRunning}>
              <Play className="mr-2 h-4 w-4" />
              {isRunning ? 'Running Audit...' : 'Run Audit'}
            </Button>
            <Button onClick={checkKeyboard} variant="outline">
              <Keyboard className="mr-2 h-4 w-4" />
              Check Keyboard Navigation
            </Button>
            {report && (
              <Button onClick={downloadReport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            )}
          </CardContent>
        </Card>

        {report && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Passes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{report.passes}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Violations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {report.violationCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Incomplete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{report.incomplete}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Inapplicable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-600">{report.inapplicable}</div>
                </CardContent>
              </Card>
            </div>

            {report.violationCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Violations by Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    {report.criticalCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-600" />
                        <span className="font-medium">Critical:</span>
                        <span>{report.criticalCount}</span>
                      </div>
                    )}
                    {report.seriousCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-orange-600" />
                        <span className="font-medium">Serious:</span>
                        <span>{report.seriousCount}</span>
                      </div>
                    )}
                    {report.moderateCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-600" />
                        <span className="font-medium">Moderate:</span>
                        <span>{report.moderateCount}</span>
                      </div>
                    )}
                    {report.minorCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-600" />
                        <span className="font-medium">Minor:</span>
                        <span>{report.minorCount}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {keyboardCheck && (
              <Card>
                <CardHeader>
                  <CardTitle>Keyboard Navigation Check</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Focusable elements: {keyboardCheck.focusableElements}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>Elements with tabindex: {keyboardCheck.elementsWithTabIndex}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-gray-600" />
                      <span>
                        Elements with negative tabindex:{' '}
                        {keyboardCheck.elementsWithNegativeTabIndex}
                      </span>
                    </div>
                    {keyboardCheck.issues.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Issues:</h4>
                        {keyboardCheck.issues.map((issue: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4 mt-0.5" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {report.violations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Violations</CardTitle>
                  <CardDescription>
                    Review and fix these accessibility issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.violations.map((violation, index) => (
                      <div
                        key={violation.id}
                        className={`border-l-4 p-4 rounded-r ${
                          violation.impact === 'critical'
                            ? 'border-red-600 bg-red-50 dark:bg-red-950'
                            : violation.impact === 'serious'
                              ? 'border-orange-600 bg-orange-50 dark:bg-orange-950'
                              : violation.impact === 'moderate'
                                ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-950'
                                : 'border-green-600 bg-green-50 dark:bg-green-950'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">
                            {index + 1}. {violation.help}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                              violation.impact === 'critical'
                                ? 'bg-red-600 text-white'
                                : violation.impact === 'serious'
                                  ? 'bg-orange-600 text-white'
                                  : violation.impact === 'moderate'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-green-600 text-white'
                            }`}
                          >
                            {violation.impact}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {violation.description}
                        </p>
                        <a
                          href={violation.helpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Learn more →
                        </a>
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">
                            Affected elements: {violation.nodes.length}
                          </p>
                          {violation.nodes.slice(0, 3).map((node, nodeIndex) => (
                            <div
                              key={nodeIndex}
                              className="bg-white dark:bg-gray-900 p-3 rounded text-sm mb-2"
                            >
                              <div className="mb-1">
                                <span className="font-medium">Target:</span>{' '}
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                                  {Array.isArray(node.target) ? node.target.join(' > ') : String(node.target)}
                                </code>
                              </div>
                              <div className="mb-1">
                                <span className="font-medium">HTML:</span>{' '}
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded break-all">
                                  {node.html}
                                </code>
                              </div>
                              {node.failureSummary && (
                                <div>
                                  <span className="font-medium">Issue:</span>{' '}
                                  <span className="text-xs">{node.failureSummary}</span>
                                </div>
                              )}
                            </div>
                          ))}
                          {violation.nodes.length > 3 && (
                            <p className="text-sm text-muted-foreground">
                              ... and {violation.nodes.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {report.violationCount === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">No Violations Found!</h3>
                    <p className="text-muted-foreground">
                      Your application passed all automated accessibility tests.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual Testing Checklist</CardTitle>
          <CardDescription>
            Automated tests can't catch everything. Complete these manual checks:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="keyboard-nav" />
              <label htmlFor="keyboard-nav" className="text-sm">
                <strong>Keyboard Navigation:</strong> Navigate through the entire app using only
                Tab, Shift+Tab, Enter, Space, and Arrow keys
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="focus-visible" />
              <label htmlFor="focus-visible" className="text-sm">
                <strong>Focus Indicators:</strong> Verify all interactive elements have visible
                focus indicators
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="screen-reader" />
              <label htmlFor="screen-reader" className="text-sm">
                <strong>Screen Reader:</strong> Test with NVDA (Windows), JAWS (Windows), or
                VoiceOver (Mac)
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="zoom" />
              <label htmlFor="zoom" className="text-sm">
                <strong>Zoom:</strong> Test at 200% zoom level - content should remain readable
                and functional
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="color-blind" />
              <label htmlFor="color-blind" className="text-sm">
                <strong>Color Blindness:</strong> Use browser extensions to simulate different
                types of color blindness
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="forms" />
              <label htmlFor="forms" className="text-sm">
                <strong>Form Validation:</strong> Ensure error messages are announced by screen
                readers
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" id="dynamic-content" />
              <label htmlFor="dynamic-content" className="text-sm">
                <strong>Dynamic Content:</strong> Verify ARIA live regions announce updates
                properly
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityAuditPage;
