import React, { useState } from 'react';
import { DualPieChartLayout } from '../components/DualPieChartLayout';
import { IncomeCategoryChart } from '../components/IncomeCategoryChart';
import { ExpenseCategoryChart } from '../components/ExpenseCategoryChart';
import { Transaction } from '../types/models';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { INCOME_COLOR_PALETTE, EXPENSE_COLOR_PALETTE } from '../utils/chartColors';

/**
 * Final Visual Polish and Integration Test Page
 * 
 * This page tests all aspects of task 10:
 * - Color scheme verification
 * - Hover effects and animations
 * - Tooltip styling and content
 * - Chart updates when data changes
 * - Overall dashboard cohesion and visual appeal
 */

// Sample transaction data for testing
const generateSampleTransactions = (includeIncome = true, includeExpense = true): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();

  if (includeIncome) {
    transactions.push(
      {
        id: 1,
        amount: 50000,
        date: now,
        description: 'Monthly Salary',
        transactionType: { id: 1, name: 'Income', createdAt: now },
        transactionTypeId: 1,
        category: { id: 1, name: 'Salary', transactionTypeId: 1, createdAt: now },
        categoryId: 1,
        subCategoryId: 1,
        account: { id: 1, name: 'Bank Account', createdAt: now },
        accountId: 1,
        paymentMode: { id: 1, name: 'Bank Transfer', createdAt: now },
        paymentModeId: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        amount: 15000,
        date: now,
        description: 'Freelance Project',
        transactionType: { id: 1, name: 'Income', createdAt: now },
        transactionTypeId: 1,
        category: { id: 2, name: 'Business', transactionTypeId: 1, createdAt: now },
        categoryId: 2,
        subCategoryId: 2,
        account: { id: 1, name: 'Bank Account', createdAt: now },
        accountId: 1,
        paymentMode: { id: 1, name: 'Bank Transfer', createdAt: now },
        paymentModeId: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        amount: 5000,
        date: now,
        description: 'Investment Returns',
        transactionType: { id: 1, name: 'Income', createdAt: now },
        transactionTypeId: 1,
        category: { id: 3, name: 'Investments', transactionTypeId: 1, createdAt: now },
        categoryId: 3,
        subCategoryId: 3,
        account: { id: 1, name: 'Bank Account', createdAt: now },
        accountId: 1,
        paymentMode: { id: 1, name: 'Bank Transfer', createdAt: now },
        paymentModeId: 1,
        createdAt: now,
        updatedAt: now,
      }
    );
  }

  if (includeExpense) {
    transactions.push(
      {
        id: 4,
        amount: 8000,
        date: now,
        description: 'Groceries',
        transactionType: { id: 2, name: 'Expense', createdAt: now },
        transactionTypeId: 2,
        category: { id: 4, name: 'Food', transactionTypeId: 2, createdAt: now },
        categoryId: 4,
        subCategoryId: 4,
        account: { id: 1, name: 'Bank Account', createdAt: now },
        accountId: 1,
        paymentMode: { id: 2, name: 'Credit Card', createdAt: now },
        paymentModeId: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        amount: 3000,
        date: now,
        description: 'Uber rides',
        transactionType: { id: 2, name: 'Expense', createdAt: now },
        transactionTypeId: 2,
        category: { id: 5, name: 'Transport', transactionTypeId: 2, createdAt: now },
        categoryId: 5,
        subCategoryId: 5,
        account: { id: 1, name: 'Bank Account', createdAt: now },
        accountId: 1,
        paymentMode: { id: 2, name: 'Credit Card', createdAt: now },
        paymentModeId: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        amount: 2000,
        date: now,
        description: 'Movie tickets',
        transactionType: { id: 2, name: 'Expense', createdAt: now },
        transactionTypeId: 2,
        category: { id: 6, name: 'Entertainment', transactionTypeId: 2, createdAt: now },
        categoryId: 6,
        subCategoryId: 6,
        account: { id: 1, name: 'Bank Account', createdAt: now },
        accountId: 1,
        paymentMode: { id: 3, name: 'Cash', createdAt: now },
        paymentModeId: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 7,
        amount: 1500,
        date: now,
        description: 'Electricity bill',
        transactionType: { id: 2, name: 'Expense', createdAt: now },
        transactionTypeId: 2,
        category: { id: 7, name: 'Utilities', transactionTypeId: 2, createdAt: now },
        categoryId: 7,
        subCategoryId: 7,
        account: { id: 1, name: 'Bank Account', createdAt: now },
        accountId: 1,
        paymentMode: { id: 1, name: 'Bank Transfer', createdAt: now },
        paymentModeId: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 8,
        amount: 5000,
        date: now,
        description: 'Shopping',
        transactionType: { id: 2, name: 'Expense', createdAt: now },
        transactionTypeId: 2,
        category: { id: 8, name: 'Shopping', transactionTypeId: 2, createdAt: now },
        categoryId: 8,
        subCategoryId: 8,
        account: { id: 1, name: 'Bank Account', createdAt: now },
        accountId: 1,
        paymentMode: { id: 2, name: 'Credit Card', createdAt: now },
        paymentModeId: 2,
        createdAt: now,
        updatedAt: now,
      }
    );
  }

  return transactions;
};

export const FinalVisualPolishTestPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(
    generateSampleTransactions(true, true)
  );
  const [testScenario, setTestScenario] = useState<string>('full');

  const handleScenarioChange = (scenario: string) => {
    setTestScenario(scenario);
    switch (scenario) {
      case 'full':
        setTransactions(generateSampleTransactions(true, true));
        break;
      case 'income-only':
        setTransactions(generateSampleTransactions(true, false));
        break;
      case 'expense-only':
        setTransactions(generateSampleTransactions(false, true));
        break;
      case 'empty':
        setTransactions([]);
        break;
      default:
        setTransactions(generateSampleTransactions(true, true));
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Final Visual Polish & Integration Test
          </h1>
          <p className="text-lg text-muted-foreground">
            Task 10: Comprehensive verification of color schemes, hover effects, animations, 
            tooltips, and overall visual cohesion
          </p>
        </div>

        {/* Test Controls */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleScenarioChange('full')}
                variant={testScenario === 'full' ? 'default' : 'outline'}
              >
                Full Data (Income + Expense)
              </Button>
              <Button
                onClick={() => handleScenarioChange('income-only')}
                variant={testScenario === 'income-only' ? 'default' : 'outline'}
              >
                Income Only
              </Button>
              <Button
                onClick={() => handleScenarioChange('expense-only')}
                variant={testScenario === 'expense-only' ? 'default' : 'outline'}
              >
                Expense Only
              </Button>
              <Button
                onClick={() => handleScenarioChange('empty')}
                variant={testScenario === 'empty' ? 'default' : 'outline'}
              >
                Empty State
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Current scenario: <strong>{testScenario}</strong> | 
              Transactions: <strong>{transactions.length}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Color Palette Verification */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>✓ Color Scheme Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Income Colors (Green Gradient)</h3>
              <div className="flex flex-wrap gap-3">
                {INCOME_COLOR_PALETTE.map((color, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div
                      className="w-16 h-16 rounded-lg shadow-md border-2 border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Expense Colors (Red-Orange Gradient)</h3>
              <div className="flex flex-wrap gap-3">
                {EXPENSE_COLOR_PALETTE.map((color, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div
                      className="w-16 h-16 rounded-lg shadow-md border-2 border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Chart Display */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Dual Pie Chart Layout</h2>
          <p className="text-muted-foreground">
            Test hover effects, animations, tooltips, and responsive behavior
          </p>
          <DualPieChartLayout transactions={transactions} />
        </div>

        {/* Individual Chart Testing */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Individual Chart Components</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Income Category Chart</h3>
              <IncomeCategoryChart transactions={transactions} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Expense Category Chart</h3>
              <ExpenseCategoryChart transactions={transactions} />
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <Card className="border-2 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle>Verification Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <div>
                  <strong>Color Scheme:</strong> Income uses green gradient (#10b981 to #065f46), 
                  Expense uses red-orange gradient (#ef4444 to #fca5a5)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <div>
                  <strong>Hover Effects:</strong> Cards scale to 1.02x on hover, shadows increase, 
                  legend items highlight with background color
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <div>
                  <strong>Animations:</strong> Smooth transitions (300ms duration), 
                  shadow and scale animations on hover
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <div>
                  <strong>Tooltips:</strong> Display category name, formatted INR amount, 
                  and percentage with proper styling
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <div>
                  <strong>Data Updates:</strong> Charts re-render when scenario changes, 
                  memoization prevents unnecessary updates
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <div>
                  <strong>Visual Cohesion:</strong> Consistent card styling, rounded corners (xl), 
                  gradient backgrounds, proper spacing (gap-6)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <div>
                  <strong>Responsive Layout:</strong> 2 columns on desktop (md:grid-cols-2), 
                  1 column on mobile, maintains readability
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <div>
                  <strong>Empty States:</strong> Graceful handling with icons and helpful messages
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Manual Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Color Scheme Verification</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Verify income chart uses green gradient colors</li>
                <li>Verify expense chart uses red-orange gradient colors</li>
                <li>Check color palette swatches match design specifications</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">2. Hover Effects Testing</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Hover over chart cards - should scale slightly and shadow increases</li>
                <li>Hover over pie slices - should see tooltip appear</li>
                <li>Hover over legend items - should see background highlight</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">3. Animation Verification</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Switch between scenarios - charts should update smoothly</li>
                <li>Observe transition duration (300ms) on hover effects</li>
                <li>Check that animations don't cause jank or flicker</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">4. Tooltip Content</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Hover over slices - tooltip shows category name</li>
                <li>Verify INR formatting (₹ symbol with proper number format)</li>
                <li>Check percentage display (one decimal place)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">5. Data Update Testing</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Click different scenario buttons</li>
                <li>Verify charts update immediately</li>
                <li>Check empty states display correctly</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">6. Visual Cohesion</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Check consistent card styling across all charts</li>
                <li>Verify gradient backgrounds match theme</li>
                <li>Ensure proper spacing and alignment</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinalVisualPolishTestPage;
