/**
 * Dual Pie Charts Responsive Test Page
 * 
 * This page provides a comprehensive testing interface for validating
 * the responsive behavior of the dual pie charts across different screen sizes.
 */

import React, { useState, useEffect } from 'react';
import { DualPieChartLayout } from '../components/DualPieChartLayout';
import { Transaction } from '../types/models';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  runAllResponsiveTests,
} from '../__tests__/dual-pie-charts-responsive.test';
import { getViewportSize, getCurrentBreakpoint, isTouchDevice, BREAKPOINTS } from '../utils/responsiveTest';

// Sample transaction data for testing
const generateSampleTransactions = (count: number): Transaction[] => {
  const categories = [
    { id: 1, name: 'Salary', transactionTypeId: 1, createdAt: new Date() },
    { id: 2, name: 'Business', transactionTypeId: 1, createdAt: new Date() },
    { id: 3, name: 'Investments', transactionTypeId: 1, createdAt: new Date() },
    { id: 4, name: 'Food', transactionTypeId: 2, createdAt: new Date() },
    { id: 5, name: 'Transport', transactionTypeId: 2, createdAt: new Date() },
    { id: 6, name: 'Entertainment', transactionTypeId: 2, createdAt: new Date() },
    { id: 7, name: 'Utilities', transactionTypeId: 2, createdAt: new Date() },
    { id: 8, name: 'Shopping', transactionTypeId: 2, createdAt: new Date() },
  ];

  const transactions: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const isIncome = i % 3 === 0; // 1/3 income, 2/3 expense
    const category = isIncome 
      ? categories[i % 3] 
      : categories[3 + (i % 5)];
    
    transactions.push({
      id: i + 1,
      amount: Math.floor(Math.random() * 5000) + 500,
      description: `Transaction ${i + 1}`,
      date: new Date(),
      transactionType: {
        id: isIncome ? 1 : 2,
        name: isIncome ? 'Income' : 'Expense',
        createdAt: new Date(),
      },
      transactionTypeId: isIncome ? 1 : 2,
      category,
      categoryId: category.id,
      subCategoryId: 1,
      accountId: 1,
      paymentModeId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  return transactions;
};

const DualPieChartsTestPage: React.FC = () => {
  const [viewport, setViewport] = useState(getViewportSize());
  const [breakpoint, setBreakpoint] = useState(getCurrentBreakpoint());
  const [isTouch] = useState(isTouchDevice());
  const [testResults, setTestResults] = useState<any[]>([]);
  const [dataVolume, setDataVolume] = useState<'empty' | 'small' | 'medium' | 'large'>('medium');
  const [transactions, setTransactions] = useState<Transaction[]>(generateSampleTransactions(20));

  // Update viewport info on resize
  useEffect(() => {
    const handleResize = () => {
      setViewport(getViewportSize());
      setBreakpoint(getCurrentBreakpoint());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update transactions based on data volume
  useEffect(() => {
    switch (dataVolume) {
      case 'empty':
        setTransactions([]);
        break;
      case 'small':
        setTransactions(generateSampleTransactions(5));
        break;
      case 'medium':
        setTransactions(generateSampleTransactions(20));
        break;
      case 'large':
        setTransactions(generateSampleTransactions(50));
        break;
    }
  }, [dataVolume]);

  const runTests = () => {
    const results = runAllResponsiveTests();
    setTestResults(results);
  };

  const getBreakpointColor = (bp: string): string => {
    if (bp === 'mobile' || bp === 'sm') return 'bg-blue-500';
    if (bp === 'md') return 'bg-green-500';
    if (bp === 'lg' || bp === 'xl') return 'bg-purple-500';
    return 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Dual Pie Charts - Responsive Testing</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Test the responsive behavior of dual pie charts across different screen sizes and data volumes
            </p>
          </CardHeader>
        </Card>

        {/* Viewport Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Viewport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Width</p>
                <p className="text-2xl font-bold">{viewport.width}px</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="text-2xl font-bold">{viewport.height}px</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Breakpoint</p>
                <Badge className={`${getBreakpointColor(breakpoint)} text-white mt-1`}>
                  {breakpoint}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Touch Device</p>
                <Badge className={`${isTouch ? 'bg-green-500' : 'bg-gray-500'} text-white mt-1`}>
                  {isTouch ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Data Volume Control */}
            <div>
              <p className="text-sm font-medium mb-2">Transaction Data Volume</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={dataVolume === 'empty' ? 'default' : 'outline'}
                  onClick={() => setDataVolume('empty')}
                  size="sm"
                >
                  Empty (0)
                </Button>
                <Button
                  variant={dataVolume === 'small' ? 'default' : 'outline'}
                  onClick={() => setDataVolume('small')}
                  size="sm"
                >
                  Small (5)
                </Button>
                <Button
                  variant={dataVolume === 'medium' ? 'default' : 'outline'}
                  onClick={() => setDataVolume('medium')}
                  size="sm"
                >
                  Medium (20)
                </Button>
                <Button
                  variant={dataVolume === 'large' ? 'default' : 'outline'}
                  onClick={() => setDataVolume('large')}
                  size="sm"
                >
                  Large (50)
                </Button>
              </div>
            </div>

            {/* Run Tests Button */}
            <div>
              <Button onClick={runTests} className="w-full md:w-auto">
                Run All Responsive Tests
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Tests will run in the browser console and display results below
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      result.passed
                        ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                        : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        Test {index + 1}: {result.breakpoint} ({result.width}x{result.height})
                      </span>
                      <Badge className={result.passed ? 'bg-green-500' : 'bg-red-500'}>
                        {result.passed ? '✓ Passed' : '✗ Failed'}
                      </Badge>
                    </div>
                    {result.issues.length > 0 && (
                      <ul className="text-sm space-y-1 mt-2">
                        {result.issues.map((issue: string, i: number) => (
                          <li key={i} className="text-muted-foreground">
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Breakpoint Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Breakpoint Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {BREAKPOINTS.map((bp) => (
                <div key={bp.name} className="p-3 border rounded-lg">
                  <p className="font-medium">{bp.name}</p>
                  <p className="text-muted-foreground">{bp.width}x{bp.height}px</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">1. Desktop Layout Test (≥768px)</p>
              <p className="text-muted-foreground">
                Resize your browser to at least 768px width. Charts should display side-by-side.
              </p>
            </div>
            <div>
              <p className="font-medium">2. Mobile Layout Test (&lt;768px)</p>
              <p className="text-muted-foreground">
                Resize your browser to less than 768px width. Charts should stack vertically.
              </p>
            </div>
            <div>
              <p className="font-medium">3. Readability Test</p>
              <p className="text-muted-foreground">
                Test at various screen sizes. Text should remain readable, charts should not overflow.
              </p>
            </div>
            <div>
              <p className="font-medium">4. Touch Interaction Test</p>
              <p className="text-muted-foreground">
                On touch devices, verify legend items and chart slices are easy to tap (44x44px minimum).
              </p>
            </div>
            <div>
              <p className="font-medium">5. Data Volume Test</p>
              <p className="text-muted-foreground">
                Use the controls above to test with different data volumes (empty, small, medium, large).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Charts Under Test */}
        <div>
          <h2 className="text-xl font-bold mb-4">Charts Under Test</h2>
          <DualPieChartLayout transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default DualPieChartsTestPage;
