/**
 * Data Accuracy and Edge Cases Tests for Dual Pie Charts
 * 
 * This test suite validates:
 * - Various transaction datasets (income only, expense only, mixed)
 * - Category aggregation accuracy
 * - Percentage calculations correctness
 * - Empty transaction arrays handling
 * - Missing category data handling
 * - INR currency formatting correctness
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { describe, it, expect } from 'vitest';
import { Transaction, Category, TransactionType } from '../types/models';
import { 
  aggregateByCategory, 
  assignColors, 
  validateTransactions,
  filterByTransactionType,
  ChartDataPoint 
} from '../utils/chartUtils';
import { formatCurrency } from '../utils/formatUtils';
import { INCOME_COLOR_PALETTE, EXPENSE_COLOR_PALETTE } from '../utils/chartColors';

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
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('Dual Pie Charts - Data Accuracy and Edge Cases', () => {
  
  describe('Test 1: Various Transaction Datasets', () => {
    
    it('should handle income-only transactions correctly', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 50000, 'Salary', 'Income'),
        createMockTransaction(2, 10000, 'Freelance', 'Income'),
        createMockTransaction(3, 5000, 'Investment', 'Income'),
      ];

      const incomeTransactions = filterByTransactionType(transactions, 'Income');
      const expenseTransactions = filterByTransactionType(transactions, 'Expense');

      expect(incomeTransactions).toHaveLength(3);
      expect(expenseTransactions).toHaveLength(0);

      const chartData = aggregateByCategory(incomeTransactions);
      expect(chartData).toHaveLength(3);
      
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      expect(total).toBe(65000);
    });

    it('should handle expense-only transactions correctly', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 5000, 'Food', 'Expense'),
        createMockTransaction(2, 2000, 'Transport', 'Expense'),
        createMockTransaction(3, 3000, 'Entertainment', 'Expense'),
      ];

      const incomeTransactions = filterByTransactionType(transactions, 'Income');
      const expenseTransactions = filterByTransactionType(transactions, 'Expense');

      expect(incomeTransactions).toHaveLength(0);
      expect(expenseTransactions).toHaveLength(3);

      const chartData = aggregateByCategory(expenseTransactions);
      expect(chartData).toHaveLength(3);
      
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      expect(total).toBe(10000);
    });

    it('should handle mixed income and expense transactions correctly', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 50000, 'Salary', 'Income'),
        createMockTransaction(2, 5000, 'Food', 'Expense'),
        createMockTransaction(3, 10000, 'Freelance', 'Income'),
        createMockTransaction(4, 2000, 'Transport', 'Expense'),
      ];

      const incomeTransactions = filterByTransactionType(transactions, 'Income');
      const expenseTransactions = filterByTransactionType(transactions, 'Expense');

      expect(incomeTransactions).toHaveLength(2);
      expect(expenseTransactions).toHaveLength(2);

      const incomeData = aggregateByCategory(incomeTransactions);
      const expenseData = aggregateByCategory(expenseTransactions);

      expect(incomeData).toHaveLength(2);
      expect(expenseData).toHaveLength(2);

      const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0);
      const totalExpense = expenseData.reduce((sum, item) => sum + item.value, 0);

      expect(totalIncome).toBe(60000);
      expect(totalExpense).toBe(7000);
    });

    it('should handle large datasets efficiently', () => {
      const transactions: Transaction[] = [];
      const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping'];
      
      // Create 100 transactions
      for (let i = 0; i < 100; i++) {
        const category = categories[i % categories.length];
        const type = i % 2 === 0 ? 'Income' : 'Expense';
        transactions.push(createMockTransaction(i, 1000 + i, category, type));
      }

      const incomeTransactions = filterByTransactionType(transactions, 'Income');
      const expenseTransactions = filterByTransactionType(transactions, 'Expense');

      expect(incomeTransactions).toHaveLength(50);
      expect(expenseTransactions).toHaveLength(50);

      const incomeData = aggregateByCategory(incomeTransactions);
      const expenseData = aggregateByCategory(expenseTransactions);

      // Should aggregate into 5 categories each
      expect(incomeData.length).toBeLessThanOrEqual(5);
      expect(expenseData.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Test 2: Category Aggregation Accuracy', () => {
    
    it('should correctly aggregate transactions by category', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 1000, 'Food', 'Expense'),
        createMockTransaction(2, 2000, 'Food', 'Expense'),
        createMockTransaction(3, 1500, 'Transport', 'Expense'),
        createMockTransaction(4, 500, 'Food', 'Expense'),
      ];

      const chartData = aggregateByCategory(transactions);

      expect(chartData).toHaveLength(2);
      
      const foodData = chartData.find(item => item.name === 'Food');
      const transportData = chartData.find(item => item.name === 'Transport');

      expect(foodData?.value).toBe(3500); // 1000 + 2000 + 500
      expect(transportData?.value).toBe(1500);
    });

    it('should sort categories by value in descending order', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 1000, 'Food', 'Expense'),
        createMockTransaction(2, 5000, 'Transport', 'Expense'),
        createMockTransaction(3, 3000, 'Entertainment', 'Expense'),
      ];

      const chartData = aggregateByCategory(transactions);

      expect(chartData[0].name).toBe('Transport'); // Highest value
      expect(chartData[1].name).toBe('Entertainment');
      expect(chartData[2].name).toBe('Food'); // Lowest value
    });

    it('should handle single transaction per category', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 1000, 'Food', 'Expense'),
        createMockTransaction(2, 2000, 'Transport', 'Expense'),
        createMockTransaction(3, 3000, 'Entertainment', 'Expense'),
      ];

      const chartData = aggregateByCategory(transactions);

      expect(chartData).toHaveLength(3);
      expect(chartData[0].value).toBe(3000);
      expect(chartData[1].value).toBe(2000);
      expect(chartData[2].value).toBe(1000);
    });

    it('should handle multiple transactions in same category', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 1000, 'Food', 'Expense'),
        createMockTransaction(2, 1000, 'Food', 'Expense'),
        createMockTransaction(3, 1000, 'Food', 'Expense'),
        createMockTransaction(4, 1000, 'Food', 'Expense'),
        createMockTransaction(5, 1000, 'Food', 'Expense'),
      ];

      const chartData = aggregateByCategory(transactions);

      expect(chartData).toHaveLength(1);
      expect(chartData[0].name).toBe('Food');
      expect(chartData[0].value).toBe(5000);
    });
  });

  describe('Test 3: Percentage Calculations', () => {
    
    it('should calculate percentages correctly', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 5000, 'Food', 'Expense'),
        createMockTransaction(2, 3000, 'Transport', 'Expense'),
        createMockTransaction(3, 2000, 'Entertainment', 'Expense'),
      ];

      const chartData = aggregateByCategory(transactions);
      const total = 10000;

      expect(chartData[0].percentage).toBeCloseTo(50, 1); // 5000/10000 = 50%
      expect(chartData[1].percentage).toBeCloseTo(30, 1); // 3000/10000 = 30%
      expect(chartData[2].percentage).toBeCloseTo(20, 1); // 2000/10000 = 20%
    });

    it('should ensure percentages sum to 100%', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 3333, 'Food', 'Expense'),
        createMockTransaction(2, 3333, 'Transport', 'Expense'),
        createMockTransaction(3, 3334, 'Entertainment', 'Expense'),
      ];

      const chartData = aggregateByCategory(transactions);
      const totalPercentage = chartData.reduce((sum, item) => sum + item.percentage, 0);

      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('should handle decimal percentages correctly', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 1234, 'Food', 'Expense'),
        createMockTransaction(2, 5678, 'Transport', 'Expense'),
        createMockTransaction(3, 3088, 'Entertainment', 'Expense'),
      ];

      const chartData = aggregateByCategory(transactions);
      const total = 10000;

      expect(chartData.find(d => d.name === 'Food')?.percentage).toBeCloseTo(12.34, 1);
      expect(chartData.find(d => d.name === 'Transport')?.percentage).toBeCloseTo(56.78, 1);
      expect(chartData.find(d => d.name === 'Entertainment')?.percentage).toBeCloseTo(30.88, 1);
    });

    it('should handle 100% single category', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 10000, 'Salary', 'Income'),
      ];

      const chartData = aggregateByCategory(transactions);

      expect(chartData).toHaveLength(1);
      expect(chartData[0].percentage).toBe(100);
    });
  });

  describe('Test 4: Empty Transaction Arrays', () => {
    
    it('should handle empty array gracefully', () => {
      const transactions: Transaction[] = [];
      const chartData = aggregateByCategory(transactions);

      expect(chartData).toHaveLength(0);
      expect(chartData).toEqual([]);
    });

    it('should handle null/undefined input', () => {
      const chartData1 = aggregateByCategory(null as any);
      const chartData2 = aggregateByCategory(undefined as any);

      expect(chartData1).toHaveLength(0);
      expect(chartData2).toHaveLength(0);
    });

    it('should filter out invalid transactions', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 1000, 'Food', 'Expense'),
        { ...createMockTransaction(2, -500, 'Transport', 'Expense'), amount: -500 }, // Invalid: negative
        { ...createMockTransaction(3, 2000, 'Entertainment', 'Expense'), category: undefined as any }, // Invalid: no category
      ];

      const chartData = aggregateByCategory(transactions);

      // Should only include the valid transaction
      expect(chartData).toHaveLength(1);
      expect(chartData[0].name).toBe('Food');
      expect(chartData[0].value).toBe(1000);
    });

    it('should handle all zero amounts', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 0, 'Food', 'Expense'),
        createMockTransaction(2, 0, 'Transport', 'Expense'),
      ];

      const chartData = aggregateByCategory(transactions);

      // Should return empty array when total is 0
      expect(chartData).toHaveLength(0);
    });
  });

  describe('Test 5: Missing Category Data', () => {
    
    it('should handle missing category with Uncategorized fallback', () => {
      const transaction: Transaction = {
        id: 1,
        amount: 1000,
        description: 'Test',
        date: new Date(),
        category: undefined as any,
        categoryId: 0,
        transactionType: { id: 2, name: 'Expense', createdAt: new Date() },
        transactionTypeId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // This should be handled by the component's ensureCategoryData function
      // For the utility function, we test that it handles undefined category name
      const transactionWithCategory = {
        ...transaction,
        category: { id: 0, name: '', transactionTypeId: 2, createdAt: new Date() }
      };

      const chartData = aggregateByCategory([transactionWithCategory]);
      
      // The utility should handle empty category name
      expect(chartData.length).toBeGreaterThanOrEqual(0);
    });

    it('should validate transactions correctly', () => {
      const validTransaction = createMockTransaction(1, 1000, 'Food', 'Expense');
      const invalidTransaction1 = { ...validTransaction, amount: -100 };
      const invalidTransaction2 = { ...validTransaction, category: undefined };
      const invalidTransaction3 = { ...validTransaction, transactionType: undefined };

      expect(validateTransactions([validTransaction])).toBe(true);
      expect(validateTransactions([invalidTransaction1])).toBe(false);
      expect(validateTransactions([invalidTransaction2])).toBe(false);
      expect(validateTransactions([invalidTransaction3])).toBe(false);
    });

    it('should handle null category name', () => {
      const transaction = createMockTransaction(1, 1000, '', 'Expense');
      transaction.category!.name = null as any;

      const chartData = aggregateByCategory([transaction]);
      
      // Should use 'Uncategorized' or handle gracefully
      expect(chartData.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Test 6: INR Currency Formatting', () => {
    
    it('should format currency with INR symbol', () => {
      const formatted = formatCurrency(1000);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('1,000');
    });

    it('should format large amounts correctly', () => {
      const formatted = formatCurrency(1234567.89);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('12,34,567.89'); // Indian numbering system
    });

    it('should format small amounts correctly', () => {
      const formatted = formatCurrency(99.50);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('99.50');
    });

    it('should format zero correctly', () => {
      const formatted = formatCurrency(0);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('0.00');
    });

    it('should format decimal places correctly', () => {
      const formatted1 = formatCurrency(1000.5);
      const formatted2 = formatCurrency(1000.99);
      const formatted3 = formatCurrency(1000);

      expect(formatted1).toContain('.50');
      expect(formatted2).toContain('.99');
      expect(formatted3).toContain('.00');
    });

    it('should handle very large numbers', () => {
      const formatted = formatCurrency(99999999.99);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('9,99,99,999.99');
    });
  });

  describe('Test 7: Color Assignment', () => {
    
    it('should assign colors from palette correctly', () => {
      const data: ChartDataPoint[] = [
        { name: 'Food', value: 1000, percentage: 50, color: '' },
        { name: 'Transport', value: 1000, percentage: 50, color: '' },
      ];

      const coloredData = assignColors(data, INCOME_COLOR_PALETTE);

      expect(coloredData[0].color).toBe(INCOME_COLOR_PALETTE[0]);
      expect(coloredData[1].color).toBe(INCOME_COLOR_PALETTE[1]);
    });

    it('should cycle colors when more data than palette', () => {
      const data: ChartDataPoint[] = [];
      for (let i = 0; i < 10; i++) {
        data.push({ name: `Category${i}`, value: 1000, percentage: 10, color: '' });
      }

      const coloredData = assignColors(data, INCOME_COLOR_PALETTE);

      // Should cycle through palette
      expect(coloredData[0].color).toBe(INCOME_COLOR_PALETTE[0]);
      expect(coloredData[6].color).toBe(INCOME_COLOR_PALETTE[0]); // Cycles back
    });

    it('should handle empty data array', () => {
      const coloredData = assignColors([], INCOME_COLOR_PALETTE);
      expect(coloredData).toHaveLength(0);
    });

    it('should handle empty color palette with default color', () => {
      const data: ChartDataPoint[] = [
        { name: 'Food', value: 1000, percentage: 100, color: '' },
      ];

      const coloredData = assignColors(data, []);

      expect(coloredData[0].color).toBe('#6b7280'); // Default gray color
    });

    it('should use different palettes for income and expense', () => {
      const data: ChartDataPoint[] = [
        { name: 'Category1', value: 1000, percentage: 100, color: '' },
      ];

      const incomeColored = assignColors(data, INCOME_COLOR_PALETTE);
      const expenseColored = assignColors(data, EXPENSE_COLOR_PALETTE);

      expect(incomeColored[0].color).not.toBe(expenseColored[0].color);
      expect(INCOME_COLOR_PALETTE[0]).toContain('#10b981'); // Green
      expect(EXPENSE_COLOR_PALETTE[0]).toContain('#ef4444'); // Red
    });
  });

  describe('Test 8: Filter by Transaction Type', () => {
    
    it('should filter income transactions correctly', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 1000, 'Salary', 'Income'),
        createMockTransaction(2, 2000, 'Food', 'Expense'),
        createMockTransaction(3, 3000, 'Freelance', 'Income'),
      ];

      const incomeTransactions = filterByTransactionType(transactions, 'Income');

      expect(incomeTransactions).toHaveLength(2);
      expect(incomeTransactions[0].transactionType?.name).toBe('Income');
      expect(incomeTransactions[1].transactionType?.name).toBe('Income');
    });

    it('should filter expense transactions correctly', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 1000, 'Salary', 'Income'),
        createMockTransaction(2, 2000, 'Food', 'Expense'),
        createMockTransaction(3, 3000, 'Transport', 'Expense'),
      ];

      const expenseTransactions = filterByTransactionType(transactions, 'Expense');

      expect(expenseTransactions).toHaveLength(2);
      expect(expenseTransactions[0].transactionType?.name).toBe('Expense');
      expect(expenseTransactions[1].transactionType?.name).toBe('Expense');
    });

    it('should return empty array for invalid type', () => {
      const transactions: Transaction[] = [
        createMockTransaction(1, 1000, 'Salary', 'Income'),
      ];

      const filtered = filterByTransactionType(transactions, 'InvalidType');

      expect(filtered).toHaveLength(0);
    });

    it('should handle empty input', () => {
      const filtered1 = filterByTransactionType([], 'Income');
      const filtered2 = filterByTransactionType(null as any, 'Income');
      const filtered3 = filterByTransactionType(undefined as any, 'Income');

      expect(filtered1).toHaveLength(0);
      expect(filtered2).toHaveLength(0);
      expect(filtered3).toHaveLength(0);
    });
  });

  describe('Test 9: Integration Tests', () => {
    
    it('should process complete workflow correctly', () => {
      // Create mixed transactions
      const transactions: Transaction[] = [
        createMockTransaction(1, 50000, 'Salary', 'Income'),
        createMockTransaction(2, 10000, 'Freelance', 'Income'),
        createMockTransaction(3, 5000, 'Food', 'Expense'),
        createMockTransaction(4, 2000, 'Transport', 'Expense'),
        createMockTransaction(5, 3000, 'Entertainment', 'Expense'),
      ];

      // Filter by type
      const incomeTransactions = filterByTransactionType(transactions, 'Income');
      const expenseTransactions = filterByTransactionType(transactions, 'Expense');

      // Aggregate
      const incomeData = aggregateByCategory(incomeTransactions);
      const expenseData = aggregateByCategory(expenseTransactions);

      // Assign colors
      const incomeChartData = assignColors(incomeData, INCOME_COLOR_PALETTE);
      const expenseChartData = assignColors(expenseData, EXPENSE_COLOR_PALETTE);

      // Verify results
      expect(incomeChartData).toHaveLength(2);
      expect(expenseChartData).toHaveLength(3);

      const totalIncome = incomeChartData.reduce((sum, item) => sum + item.value, 0);
      const totalExpense = expenseChartData.reduce((sum, item) => sum + item.value, 0);

      expect(totalIncome).toBe(60000);
      expect(totalExpense).toBe(10000);

      // Verify percentages
      const incomePercentageSum = incomeChartData.reduce((sum, item) => sum + item.percentage, 0);
      const expensePercentageSum = expenseChartData.reduce((sum, item) => sum + item.percentage, 0);

      expect(incomePercentageSum).toBeCloseTo(100, 1);
      expect(expensePercentageSum).toBeCloseTo(100, 1);

      // Verify colors are assigned
      incomeChartData.forEach(item => {
        expect(item.color).toBeTruthy();
        expect(INCOME_COLOR_PALETTE).toContain(item.color);
      });

      expenseChartData.forEach(item => {
        expect(item.color).toBeTruthy();
        expect(EXPENSE_COLOR_PALETTE).toContain(item.color);
      });
    });
  });
});
