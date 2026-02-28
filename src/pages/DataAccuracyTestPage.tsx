/**
 * Data Accuracy Test Page for Dual Pie Charts
 * 
 * This page provides a visual interface to test and verify:
 * - Various transaction datasets (income only, expense only, mixed)
 * - Category aggregation accuracy
 * - Percentage calculations
 * - Empty state handling
 * - Missing category data
 * - INR currency formatting
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '../types/models';
import { DualPieChartLayout } from '../components/DualPieChartLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { verifyAllDataAccuracy, getAllTestResults } from '../utils/chartDataVerification';
import { formatCurrency } from '../utils/formatUtils';

// Helper function to create mock transaction
function createMockTransaction(
  id: number,
  amount: number,
  categoryName: string,
  transactionTypeName: 'Income' | 'Expense'
): Transaction {
  const category: Category = {
    id,
    name: categoryName,
    transactionTypeId: transactionTypeName === 'Income' ? 1 : 2,
    createdAt: new Date(),
  };

  const transactionType: TransactionType = {
    id: transactionTypeName === 'Income' ? 1 : 2,
    name: transactionTypeName,
    createdAt: new Date(),
  };

  return {
    id,
    amount,
    description: `Test ${transactionTypeName}`,
    date: new Date(),
    category,
    categoryId: category.id,
    transactionType,
    transactionTypeId: transactionType.id,
    subCategoryId: 1,
    paymentModeId: 1,
    accountId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Test datasets
const testDatasets = {
  incomeOnly: [
    createMockTransaction(1, 50000, 'Salary', 'Income'),
    createMockTransaction(2, 10000, 'Freelance', 'Income'),
    createMockTransaction(3, 5000, 'Investment', 'Income'),
    createMockTransaction(4, 3000, 'Bonus', 'Income'),
  ],
  expenseOnly: [
    createMockTransaction(1, 5000, 'Food', 'Expense'),
    createMockTransaction(2, 2000, 'Transport', 'Expense'),
    createMockTransaction(3, 3000, 'Entertainment', 'Expense'),
    createMockTransaction(4, 1500, 'Utilities', 'Expense'),
    createMockTransaction(5, 2500, 'Shopping', 'Expense'),
  ],
  mixed: [
    createMockTransaction(1, 50000, 'Salary', 'Income'),
    createMockTransaction(2, 5000, 'Food', 'Expense'),
    createMockTransaction(3, 10000, 'Freelance', 'Income'),
    createMockTransaction(4, 2000, 'Transport', 'Expense'),
    createMockTransaction(5, 5000, 'Investment', 'Income'),
    createMockTransaction(6, 3000, 'Entertainment', 'Expense'),
  ],
  multipleCategories: [
    createMockTransaction(1, 1000, 'Food', 'Expense'),
    createMockTransaction(2, 2000, 'Food', 'Expense'),
    createMockTransaction(3, 1500, 'Transport', 'Expense'),
    createMockTransaction(4, 500, 'Food', 'Expense'),
    createMockTransaction(5, 3000, 'Entertainment', 'Expense'),
    createMockTransaction(6, 2500, 'Transport', 'Expense'),
  ],
  empty: [],
  singleTransaction: [
    createMockTransaction(1, 10000, 'Salary', 'Income'),
  ],
};

export const DataAccuracyTestPage: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<keyof typeof testDatasets>('mixed');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const currentTransactions = testDatasets[selectedDataset];

  const runTests = () => {
    console.clear();
    verifyAllDataAccuracy();
    const results = getAllTestResults();
    setTestResults(results);
    setShowResults(true);
  };

  useEffect(() => {
    // Run tests on mount
    const results = getAllTestResults();
    setTestResults(results);
  }, []);

  const calculateStats = () => {
    const incomeTransactions = currentTransactions.filter(t => t.transactionType?.name === 'Income');
    const expenseTransactions = currentTransactions.filter(t => t.transactionType?.name === 'Expense');
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const incomeCategories = new Set(incomeTransactions.map(t => t.category?.name)).size;
    const expenseCategories = new Set(expenseTransactions.map(t => t.category?.name)).size;

    return {
      totalTransactions: currentTransactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      totalIncome,
      totalExpense,
      incomeCategories,
      expenseCategories,
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              📊 Dual Pie Charts - Data Accuracy Testing
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Test and verify data accuracy, edge cases, and currency formatting
            </p>
          </CardHeader>
        </Card>

        {/* Test Controls */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Test Dataset Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.keys(testDatasets).map((key) => (
                <Button
                  key={key}
                  onClick={() => setSelectedDataset(key as keyof typeof testDatasets)}
                  variant={selectedDataset === key ? 'default' : 'outline'}
                  className="capitalize"
                >
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Button>
              ))}
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={runTests}
                className="w-full md:w-auto"
                size="lg"
              >
                🧪 Run All Verification Tests
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Check browser console for detailed test output
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dataset Statistics */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Current Dataset Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Transactions</div>
                <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm text-muted-foreground">Income</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.incomeCount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.incomeCategories} categories
                </div>
              </div>
              <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <div className="text-sm text-muted-foreground">Expenses</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.expenseCount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.expenseCategories} categories
                </div>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-muted-foreground">Net</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(stats.totalIncome - stats.totalExpense)}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-sm font-medium text-green-700 dark:text-green-300">Total Income</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(stats.totalIncome)}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-sm font-medium text-red-700 dark:text-red-300">Total Expenses</div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(stats.totalExpense)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <DualPieChartLayout transactions={currentTransactions} />

        {/* Test Results */}
        {showResults && testResults.length > 0 && (
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      result.passed
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{result.passed ? '✅' : '❌'}</span>
                          <span className="font-semibold">{result.testName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                        {result.details && (
                          <pre className="text-xs mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {testResults.filter(r => r.passed).length} / {testResults.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Tests Passed</div>
                  <div className="text-2xl font-bold mt-2">
                    {((testResults.filter(r => r.passed).length / testResults.length) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction Details */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            {currentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg font-medium">No transactions in this dataset</p>
                <p className="text-sm mt-2">This tests the empty state handling</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="text-right p-2">Formatted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="p-2">{transaction.id}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              transaction.transactionType?.name === 'Income'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            }`}
                          >
                            {transaction.transactionType?.name}
                          </span>
                        </td>
                        <td className="p-2">{transaction.category?.name}</td>
                        <td className="p-2 text-right font-mono">{transaction.amount}</td>
                        <td className="p-2 text-right font-semibold">
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataAccuracyTestPage;
