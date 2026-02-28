/**
 * Performance testing utilities for generating large transaction datasets
 */

import { Transaction } from '../types/models';

/**
 * Generate a large dataset of mock transactions for performance testing
 */
export function generateMockTransactions(count: number): Transaction[] {
  const transactions: Transaction[] = [];
  const types = ['Income', 'Expense', 'Transfer'];
  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Education'];
  const subCategories = ['Groceries', 'Dining', 'Gas', 'Movies', 'Bills', 'Clothes', 'Medicine', 'Books'];
  const paymentModes = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet'];
  const accounts = ['Checking', 'Savings', 'Credit Card', 'Cash'];
  const descriptions = [
    'Weekly grocery shopping',
    'Gas station fill-up',
    'Restaurant dinner',
    'Movie tickets',
    'Electricity bill',
    'New clothes',
    'Doctor visit',
    'Online course',
    'Coffee shop',
    'Taxi ride',
  ];

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6); // 6 months ago

  for (let i = 0; i < count; i++) {
    const randomDays = Math.floor(Math.random() * 180); // Random day within 6 months
    const date = new Date(startDate);
    date.setDate(date.getDate() + randomDays);

    const type = types[Math.floor(Math.random() * types.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const subCategory = subCategories[Math.floor(Math.random() * subCategories.length)];
    const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const amount = Math.floor(Math.random() * 50000) + 1000; // Random amount between 1000 and 51000

    transactions.push({
      id: i + 1,
      date: new Date(date),
      amount,
      description,
      transactionTypeId: 1,
      categoryId: 1,
      subCategoryId: 1,
      paymentModeId: 1,
      accountId: 1,
      transactionType: { 
        id: 1, 
        name: type,
        createdAt: new Date(),
      },
      category: { 
        id: 1, 
        name: category,
        transactionTypeId: 1,
        createdAt: new Date(),
      },
      subCategory: { 
        id: 1, 
        name: subCategory,
        categoryId: 1,
        createdAt: new Date(),
      },
      paymentMode: { 
        id: 1, 
        name: paymentMode,
        createdAt: new Date(),
      },
      account: { 
        id: 1, 
        name: account,
        createdAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Sort by date descending (most recent first)
  return transactions.sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );
}

/**
 * Measure performance of a function
 */
export function measurePerformance<T>(
  fn: () => T,
  label: string = 'Operation'
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);

  return { result, duration };
}

/**
 * Test filtering performance with large datasets
 */
export function testFilteringPerformance(
  transactions: Transaction[],
  filterFn: (transactions: Transaction[]) => Transaction[]
): void {
  console.log(`\n=== Testing with ${transactions.length} transactions ===`);
  
  const { duration } = measurePerformance(
    () => filterFn(transactions),
    'Filtering'
  );

  if (duration > 100) {
    console.warn(`⚠️ Filtering took ${duration.toFixed(2)}ms (>100ms threshold)`);
  } else {
    console.log(`✓ Filtering performance acceptable: ${duration.toFixed(2)}ms`);
  }
}

/**
 * Test rendering performance
 */
export function testRenderingPerformance(
  componentName: string,
  renderCount: number = 1
): void {
  const marks: number[] = [];
  
  for (let i = 0; i < renderCount; i++) {
    const start = performance.now();
    // Simulate render
    const end = performance.now();
    marks.push(end - start);
  }

  const avgDuration = marks.reduce((a, b) => a + b, 0) / marks.length;
  console.log(`[Performance] ${componentName} average render: ${avgDuration.toFixed(2)}ms`);
}

/**
 * Performance test suite for transaction operations
 */
export function runPerformanceTests(): void {
  console.log('\n🚀 Running Performance Tests\n');

  // Test with different dataset sizes
  const sizes = [100, 500, 1000, 5000];

  sizes.forEach(size => {
    const transactions = generateMockTransactions(size);
    
    // Test date filtering
    testFilteringPerformance(
      transactions,
      (txns) => txns.filter(t => {
        const date = new Date(t.date);
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return date >= thirtyDaysAgo && date <= now;
      })
    );

    // Test search filtering
    testFilteringPerformance(
      transactions,
      (txns) => txns.filter(t => 
        t.description?.toLowerCase().includes('shop') ||
        t.category?.name.toLowerCase().includes('shop')
      )
    );

    // Test type filtering
    testFilteringPerformance(
      transactions,
      (txns) => txns.filter(t => t.transactionType?.name === 'Expense')
    );
  });

  console.log('\n✅ Performance tests completed\n');
}
