/**
 * Manual Data Accuracy Verification for Dual Pie Charts
 * 
 * This module provides functions to manually verify:
 * - Various transaction datasets (income only, expense only, mixed)
 * - Category aggregation accuracy
 * - Percentage calculations correctness
 * - Empty transaction arrays handling
 * - Missing category data handling
 * - INR currency formatting correctness
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 * 
 * Usage: Import and call verifyAllDataAccuracy() to run all tests
 */

import { Transaction, Category, TransactionType } from '../types/models';
import { 
  aggregateByCategory, 
  assignColors, 
  filterByTransactionType,
  ChartDataPoint 
} from './chartUtils';
import { formatCurrency } from './formatUtils';
import { INCOME_COLOR_PALETTE, EXPENSE_COLOR_PALETTE } from './chartColors';

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

// Helper function to create mock transaction
function createMockTransaction(
  id: number,
  amount: number,
  categoryName: string,
  transactionTypeName: 'Income' | 'Expense',
  categoryId?: number,
  transactionTypeId?: number
): Transaction {
  const category: Category = {
    id: categoryId || id,
    name: categoryName,
    transactionTypeId: transactionTypeId || (transactionTypeName === 'Income' ? 1 : 2),
    createdAt: new Date(),
  };

  const transactionType: TransactionType = {
    id: transactionTypeId || (transactionTypeName === 'Income' ? 1 : 2),
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

/**
 * Test 1: Verify income-only transactions
 */
export function testIncomeOnlyTransactions(): TestResult {
  const transactions: Transaction[] = [
    createMockTransaction(1, 50000, 'Salary', 'Income'),
    createMockTransaction(2, 10000, 'Freelance', 'Income'),
    createMockTransaction(3, 5000, 'Investment', 'Income'),
  ];

  const incomeTransactions = filterByTransactionType(transactions, 'Income');
  const expenseTransactions = filterByTransactionType(transactions, 'Expense');
  const chartData = aggregateByCategory(incomeTransactions);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const passed = 
    incomeTransactions.length === 3 &&
    expenseTransactions.length === 0 &&
    chartData.length === 3 &&
    total === 65000;

  return {
    testName: 'Income-only transactions',
    passed,
    message: passed 
      ? 'Successfully processed income-only transactions' 
      : 'Failed to process income-only transactions correctly',
    details: { incomeCount: incomeTransactions.length, expenseCount: expenseTransactions.length, total }
  };
}

/**
 * Test 2: Verify expense-only transactions
 */
export function testExpenseOnlyTransactions(): TestResult {
  const transactions: Transaction[] = [
    createMockTransaction(1, 5000, 'Food', 'Expense'),
    createMockTransaction(2, 2000, 'Transport', 'Expense'),
    createMockTransaction(3, 3000, 'Entertainment', 'Expense'),
  ];

  const incomeTransactions = filterByTransactionType(transactions, 'Income');
  const expenseTransactions = filterByTransactionType(transactions, 'Expense');
  const chartData = aggregateByCategory(expenseTransactions);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const passed = 
    incomeTransactions.length === 0 &&
    expenseTransactions.length === 3 &&
    chartData.length === 3 &&
    total === 10000;

  return {
    testName: 'Expense-only transactions',
    passed,
    message: passed 
      ? 'Successfully processed expense-only transactions' 
      : 'Failed to process expense-only transactions correctly',
    details: { incomeCount: incomeTransactions.length, expenseCount: expenseTransactions.length, total }
  };
}

/**
 * Test 3: Verify mixed transactions
 */
export function testMixedTransactions(): TestResult {
  const transactions: Transaction[] = [
    createMockTransaction(1, 50000, 'Salary', 'Income'),
    createMockTransaction(2, 5000, 'Food', 'Expense'),
    createMockTransaction(3, 10000, 'Freelance', 'Income'),
    createMockTransaction(4, 2000, 'Transport', 'Expense'),
  ];

  const incomeTransactions = filterByTransactionType(transactions, 'Income');
  const expenseTransactions = filterByTransactionType(transactions, 'Expense');
  const incomeData = aggregateByCategory(incomeTransactions);
  const expenseData = aggregateByCategory(expenseTransactions);
  const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0);
  const totalExpense = expenseData.reduce((sum, item) => sum + item.value, 0);

  const passed = 
    incomeTransactions.length === 2 &&
    expenseTransactions.length === 2 &&
    incomeData.length === 2 &&
    expenseData.length === 2 &&
    totalIncome === 60000 &&
    totalExpense === 7000;

  return {
    testName: 'Mixed income and expense transactions',
    passed,
    message: passed 
      ? 'Successfully processed mixed transactions' 
      : 'Failed to process mixed transactions correctly',
    details: { totalIncome, totalExpense }
  };
}

/**
 * Test 4: Verify category aggregation
 */
export function testCategoryAggregation(): TestResult {
  const transactions: Transaction[] = [
    createMockTransaction(1, 1000, 'Food', 'Expense'),
    createMockTransaction(2, 2000, 'Food', 'Expense'),
    createMockTransaction(3, 1500, 'Transport', 'Expense'),
    createMockTransaction(4, 500, 'Food', 'Expense'),
  ];

  const chartData = aggregateByCategory(transactions);
  const foodData = chartData.find(item => item.name === 'Food');
  const transportData = chartData.find(item => item.name === 'Transport');

  const passed = 
    chartData.length === 2 &&
    foodData?.value === 3500 &&
    transportData?.value === 1500;

  return {
    testName: 'Category aggregation',
    passed,
    message: passed 
      ? 'Category aggregation is accurate' 
      : 'Category aggregation failed',
    details: { foodTotal: foodData?.value, transportTotal: transportData?.value }
  };
}

/**
 * Test 5: Verify percentage calculations
 */
export function testPercentageCalculations(): TestResult {
  const transactions: Transaction[] = [
    createMockTransaction(1, 5000, 'Food', 'Expense'),
    createMockTransaction(2, 3000, 'Transport', 'Expense'),
    createMockTransaction(3, 2000, 'Entertainment', 'Expense'),
  ];

  const chartData = aggregateByCategory(transactions);
  const totalPercentage = chartData.reduce((sum, item) => sum + item.percentage, 0);
  
  const foodPercentage = chartData.find(d => d.name === 'Food')?.percentage || 0;
  const transportPercentage = chartData.find(d => d.name === 'Transport')?.percentage || 0;
  const entertainmentPercentage = chartData.find(d => d.name === 'Entertainment')?.percentage || 0;

  const passed = 
    Math.abs(foodPercentage - 50) < 0.1 &&
    Math.abs(transportPercentage - 30) < 0.1 &&
    Math.abs(entertainmentPercentage - 20) < 0.1 &&
    Math.abs(totalPercentage - 100) < 0.1;

  return {
    testName: 'Percentage calculations',
    passed,
    message: passed 
      ? 'Percentage calculations are correct' 
      : 'Percentage calculations are incorrect',
    details: { 
      food: `${foodPercentage.toFixed(1)}%`, 
      transport: `${transportPercentage.toFixed(1)}%`,
      entertainment: `${entertainmentPercentage.toFixed(1)}%`,
      total: `${totalPercentage.toFixed(1)}%`
    }
  };
}

/**
 * Test 6: Verify empty array handling
 */
export function testEmptyArrayHandling(): TestResult {
  const emptyArray: Transaction[] = [];
  const chartData = aggregateByCategory(emptyArray);

  const passed = chartData.length === 0;

  return {
    testName: 'Empty array handling',
    passed,
    message: passed 
      ? 'Empty arrays handled correctly' 
      : 'Empty array handling failed',
    details: { resultLength: chartData.length }
  };
}

/**
 * Test 7: Verify invalid transaction filtering
 */
export function testInvalidTransactionFiltering(): TestResult {
  const transactions: Transaction[] = [
    createMockTransaction(1, 1000, 'Food', 'Expense'),
    { ...createMockTransaction(2, -500, 'Transport', 'Expense'), amount: -500 }, // Invalid: negative
    { ...createMockTransaction(3, 2000, 'Entertainment', 'Expense'), category: undefined as any }, // Invalid: no category
  ];

  const chartData = aggregateByCategory(transactions);

  const passed = 
    chartData.length === 1 &&
    chartData[0].name === 'Food' &&
    chartData[0].value === 1000;

  return {
    testName: 'Invalid transaction filtering',
    passed,
    message: passed 
      ? 'Invalid transactions filtered correctly' 
      : 'Invalid transaction filtering failed',
    details: { validTransactions: chartData.length }
  };
}

/**
 * Test 8: Verify INR currency formatting
 */
export function testCurrencyFormatting(): TestResult {
  const testCases = [
    { amount: 1000, expected: ['₹', '1,000'] },
    { amount: 1234567.89, expected: ['₹', '12,34,567.89'] },
    { amount: 99.50, expected: ['₹', '99.50'] },
    { amount: 0, expected: ['₹', '0.00'] },
  ];

  const results = testCases.map(({ amount, expected }) => {
    const formatted = formatCurrency(amount);
    return expected.every(exp => formatted.includes(exp));
  });

  const passed = results.every(r => r);

  return {
    testName: 'INR currency formatting',
    passed,
    message: passed 
      ? 'Currency formatting is correct' 
      : 'Currency formatting failed',
    details: testCases.map(({ amount }) => ({
      amount,
      formatted: formatCurrency(amount)
    }))
  };
}

/**
 * Test 9: Verify color assignment
 */
export function testColorAssignment(): TestResult {
  const data: ChartDataPoint[] = [
    { name: 'Food', value: 1000, percentage: 50, color: '' },
    { name: 'Transport', value: 1000, percentage: 50, color: '' },
  ];

  const incomeColored = assignColors(data, INCOME_COLOR_PALETTE);
  const expenseColored = assignColors(data, EXPENSE_COLOR_PALETTE);

  const passed = 
    incomeColored[0].color === INCOME_COLOR_PALETTE[0] &&
    incomeColored[1].color === INCOME_COLOR_PALETTE[1] &&
    expenseColored[0].color === EXPENSE_COLOR_PALETTE[0] &&
    expenseColored[1].color === EXPENSE_COLOR_PALETTE[1] &&
    incomeColored[0].color !== expenseColored[0].color;

  return {
    testName: 'Color assignment',
    passed,
    message: passed 
      ? 'Colors assigned correctly' 
      : 'Color assignment failed',
    details: {
      incomeColors: incomeColored.map(d => d.color),
      expenseColors: expenseColored.map(d => d.color)
    }
  };
}

/**
 * Test 10: Verify sorting by value
 */
export function testSortingByValue(): TestResult {
  const transactions: Transaction[] = [
    createMockTransaction(1, 1000, 'Food', 'Expense'),
    createMockTransaction(2, 5000, 'Transport', 'Expense'),
    createMockTransaction(3, 3000, 'Entertainment', 'Expense'),
  ];

  const chartData = aggregateByCategory(transactions);

  const passed = 
    chartData[0].name === 'Transport' && chartData[0].value === 5000 &&
    chartData[1].name === 'Entertainment' && chartData[1].value === 3000 &&
    chartData[2].name === 'Food' && chartData[2].value === 1000;

  return {
    testName: 'Sorting by value (descending)',
    passed,
    message: passed 
      ? 'Data sorted correctly by value' 
      : 'Sorting failed',
    details: chartData.map(d => ({ name: d.name, value: d.value }))
  };
}

/**
 * Run all verification tests
 */
export function verifyAllDataAccuracy(): void {
  console.group('🧪 Dual Pie Charts - Data Accuracy Verification');
  console.log('Running comprehensive data accuracy tests...\n');

  const tests = [
    testIncomeOnlyTransactions,
    testExpenseOnlyTransactions,
    testMixedTransactions,
    testCategoryAggregation,
    testPercentageCalculations,
    testEmptyArrayHandling,
    testInvalidTransactionFiltering,
    testCurrencyFormatting,
    testColorAssignment,
    testSortingByValue,
  ];

  const results: TestResult[] = [];

  tests.forEach((test, index) => {
    const result = test();
    results.push(result);
    
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} Test ${index + 1}: ${result.testName}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log('   Details:', result.details);
    }
    console.log('');
  });

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const passRate = ((passedCount / totalCount) * 100).toFixed(1);

  console.log('='.repeat(60));
  console.log(`📊 Summary: ${passedCount}/${totalCount} tests passed (${passRate}%)`);
  console.log('='.repeat(60));

  if (passedCount === totalCount) {
    console.log('🎉 All data accuracy tests passed!');
  } else {
    console.warn(`⚠️ ${totalCount - passedCount} test(s) failed. Please review the details above.`);
  }

  console.groupEnd();

  return;
}

/**
 * Export individual test results for programmatic access
 */
export function getAllTestResults(): TestResult[] {
  return [
    testIncomeOnlyTransactions(),
    testExpenseOnlyTransactions(),
    testMixedTransactions(),
    testCategoryAggregation(),
    testPercentageCalculations(),
    testEmptyArrayHandling(),
    testInvalidTransactionFiltering(),
    testCurrencyFormatting(),
    testColorAssignment(),
    testSortingByValue(),
  ];
}

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).chartDataVerification = {
    verifyAll: verifyAllDataAccuracy,
    getAllResults: getAllTestResults,
    tests: {
      incomeOnly: testIncomeOnlyTransactions,
      expenseOnly: testExpenseOnlyTransactions,
      mixed: testMixedTransactions,
      aggregation: testCategoryAggregation,
      percentages: testPercentageCalculations,
      emptyArray: testEmptyArrayHandling,
      invalidFiltering: testInvalidTransactionFiltering,
      currencyFormat: testCurrencyFormatting,
      colorAssignment: testColorAssignment,
      sorting: testSortingByValue,
    }
  };
}
